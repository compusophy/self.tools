'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CollapsibleCardProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  theme?: 'dark' | 'light' | 'color';
}

export function CollapsibleCard({ 
  title, 
  children, 
  defaultOpen = false,
  theme = 'dark'
}: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const getCardStyling = () => {
    switch (theme) {
      case 'light':
        return {
          card: 'bg-white border-gray-300 text-black',
          header: 'border-gray-300 text-black hover:bg-gray-50',
          chevron: 'text-gray-600'
        };
      case 'color':
        return {
          card: 'bg-white/10 border-white/30 text-white',
          header: 'border-white/30 text-white hover:bg-white/5',
          chevron: 'text-white/80'
        };
      case 'dark':
      default:
        return {
          card: 'bg-white/10 border-white/30 text-white',
          header: 'border-white/30 text-white hover:bg-white/5',
          chevron: 'text-white/80'
        };
    }
  };

  const styling = getCardStyling();

  return (
    <div className={`border rounded-none overflow-hidden transition-all duration-200 ${styling.card}`}>
      {/* Header - Always Visible */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 flex items-center justify-between border-b transition-all duration-200 ${styling.header}`}
      >
        <span className="text-base font-medium tracking-wide">{title}</span>
        <div className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''} ${styling.chevron}`}>
          <ChevronRight className="w-4 h-4" />
        </div>
      </button>

      {/* Content - Collapsible */}
      <div className={`transition-all duration-300 ease-in-out ${
        isOpen 
          ? 'max-h-96 opacity-100' 
          : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
} 