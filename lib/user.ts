// User and device management for the platform

// Cache the device ID to avoid regenerating it
let cachedDeviceId: string | null = null;

export function generateDeviceUUID(): string {
  // Generate a UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper function to get device ID from URL parameters (for localhost development)
function getDeviceIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  
  // Check both URL params and hash params
  return urlParams.get('deviceId') || hashParams.get('deviceId') || null;
}

// Helper function to check if we're in an iframe
function isInIframe(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch (e) {
    return true; // If we can't access window.top, we're likely in an iframe
  }
}

// Helper function to check if we're in localhost development
function isLocalhost(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('.localhost');
}

// Helper function to get the root domain for cookie setting
function getRootDomain(): string {
  if (typeof window === 'undefined') return '';
  
  const hostname = window.location.hostname;
  
  // For localhost development
  if (isLocalhost()) {
    return 'localhost';
  }
  
  // Extract root domain (e.g., "example.com" from "sub.example.com")
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    return '.' + parts.slice(-2).join('.');
  }
  
  return hostname;
}

// Helper function to set a cookie with domain attribute
function setCookie(name: string, value: string, days: number = 365) {
  if (typeof window === 'undefined') return;
  
  // For localhost, always use localStorage regardless of subdomain
  if (isLocalhost()) {
    localStorage.setItem(name, value);
    // Also try to set in sessionStorage as fallback for iframes
    if (isInIframe()) {
      sessionStorage.setItem(name, value);
    }
    return;
  }
  
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  const rootDomain = getRootDomain();
  
  let cookieString = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
  
  // Add domain attribute for cross-subdomain access
  if (rootDomain && !rootDomain.includes('localhost')) {
    cookieString += `; domain=${rootDomain}`;
  }
  
  // For iframe contexts, add SameSite=None and Secure to allow third-party cookies
  if (isInIframe()) {
    cookieString += `; SameSite=None`;
    // Only add Secure in production (HTTPS)
    if (window.location.protocol === 'https:') {
      cookieString += `; Secure`;
    }
    console.log('Setting iframe-friendly cookie:', name);
  }
  
  document.cookie = cookieString;
  
  // Also store in sessionStorage as fallback for iframes
  if (isInIframe()) {
    sessionStorage.setItem(name, value);
  }
}

// Helper function to get a cookie value
function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  
  // For localhost, use localStorage
  if (isLocalhost()) {
    let value = localStorage.getItem(name);
    // Fallback to sessionStorage for iframes
    if (!value && isInIframe()) {
      value = sessionStorage.getItem(name);
    }
    return value;
  }
  
  // For iframes, try sessionStorage first as it's more reliable
  if (isInIframe()) {
    const sessionValue = sessionStorage.getItem(name);
    if (sessionValue) {
      return sessionValue;
    }
  }
  
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  
  return null;
}

export function getOrCreateDeviceId(): string {
  // Return cached ID if available
  if (cachedDeviceId) {
    return cachedDeviceId;
  }

  if (typeof window === 'undefined') {
    // For SSR, return a temporary ID
    return 'ssr-temp-id';
  }

  const inIframe = isInIframe();
  console.log('getOrCreateDeviceId - Environment:', isLocalhost() ? 'localhost' : 'production', inIframe ? '(iframe)' : '(direct)');

  let deviceId: string | null = null;

  // For localhost development, check URL parameters first
  if (isLocalhost()) {
    deviceId = getDeviceIdFromUrl();
    
    if (deviceId) {
      // Store the URL device ID in localStorage for future use
      localStorage.setItem('deviceId', deviceId);
      console.log('getOrCreateDeviceId - Using URL device ID');
    }
  }

  // If no URL device ID, try to get from storage
  if (!deviceId) {
    deviceId = getCookie('deviceId');
    if (deviceId && inIframe) {
      console.log('getOrCreateDeviceId - Retrieved device ID in iframe context');
    }
  }
  
  // For production, also check if there's a legacy localStorage entry to migrate
  if (!deviceId && !isLocalhost()) {
    const legacyDeviceId = localStorage.getItem('deviceId');
    if (legacyDeviceId) {
      // Migrate from localStorage to cookie
      console.log('getOrCreateDeviceId - Migrating from localStorage to cookie');
      setCookie('deviceId', legacyDeviceId);
      localStorage.removeItem('deviceId'); // Clean up old localStorage entry
      deviceId = legacyDeviceId;
    }
  }
  
  // If still no device ID, create a new one
  if (!deviceId) {
    deviceId = generateDeviceUUID();
    console.log('getOrCreateDeviceId - Generated new device ID', inIframe ? '(iframe)' : '(direct)');
    setCookie('deviceId', deviceId);
  }

  // Cache the device ID
  cachedDeviceId = deviceId;
  
  // For localhost, clean URL parameters after getting device ID
  if (isLocalhost() && getDeviceIdFromUrl()) {
    const url = new URL(window.location.href);
    url.searchParams.delete('deviceId');
    window.history.replaceState({}, '', url.toString());
  }
  
  return deviceId;
}

export function getUserDisplayName(): string {
  if (typeof window === 'undefined') return 'User';
  
  // Try cookie first, fallback to localStorage
  return getCookie('userName') || localStorage.getItem('userName') || 'Anonymous User';
}

export function setUserDisplayName(name: string) {
  if (typeof window === 'undefined') return;
  
  setCookie('userName', name);
  // Also update localStorage for backward compatibility
  localStorage.setItem('userName', name);
}

export function setHomeTheme(theme: 'dark' | 'light' | 'color') {
  if (typeof window === 'undefined') return;
  
  setCookie('homeTheme', theme);
  // Also update localStorage for backward compatibility
  localStorage.setItem('homeTheme', theme);
}

export function getHomeTheme(): 'dark' | 'light' | 'color' {
  if (typeof window === 'undefined') return 'dark';
  
  // Try cookie first, fallback to localStorage
  const theme = getCookie('homeTheme') || localStorage.getItem('homeTheme');
  return (theme as 'dark' | 'light' | 'color') || 'dark';
} 