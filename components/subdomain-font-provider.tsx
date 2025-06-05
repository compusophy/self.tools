'use client';

import { useEffect } from 'react';

const fonts = [
  { id: 'mono', name: 'MONO', family: 'var(--font-jetbrains-mono), monospace' },
  { id: 'serif', name: 'SERIF', family: 'Georgia, Times, serif' },
  { id: 'sans', name: 'SANS', family: 'system-ui, -apple-system, sans-serif' },
] as const;

interface SubdomainFontProviderProps {
  selectedFont?: string;
  children: React.ReactNode;
}

export function SubdomainFontProvider({ selectedFont = 'mono', children }: SubdomainFontProviderProps) {
  useEffect(() => {
    // Apply the subdomain's selected font
    const fontFamily = fonts.find(f => f.id === selectedFont)?.family || fonts[0].family;
    document.documentElement.style.setProperty('--selected-font', fontFamily);
    document.body.style.fontFamily = fontFamily;
  }, [selectedFont]);

  return <>{children}</>;
} 