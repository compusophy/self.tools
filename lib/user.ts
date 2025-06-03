// User and device management for the platform

export function generateDeviceUUID(): string {
  // Generate a UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return '';
  
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = generateDeviceUUID();
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}

export function getUserData() {
  if (typeof window === 'undefined') return null;
  
  const deviceId = getOrCreateDeviceId();
  const homeTheme = localStorage.getItem('homeTheme') || 'dark';
  
  return {
    deviceId,
    homeTheme,
  };
}

export function setHomeTheme(theme: 'dark' | 'light' | 'color') {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('homeTheme', theme);
}

export function getHomeTheme(): 'dark' | 'light' | 'color' {
  if (typeof window === 'undefined') return 'dark';
  
  return (localStorage.getItem('homeTheme') as 'dark' | 'light' | 'color') || 'dark';
} 