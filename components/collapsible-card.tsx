'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CollapsibleCardProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  theme?: 'dark' | 'light' | 'color';
  isOpen?: boolean;
  onToggle?: () => void;
  buttonClass?: string;
}

export function CollapsibleCard({ 
  title, 
  children, 
  defaultOpen = false,
  theme = 'dark',
  isOpen: controlledIsOpen,
  onToggle,
  buttonClass = ''
}: CollapsibleCardProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  
  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const getCardStyling = () => {
    switch (theme) {
      case 'light':
        return {
          card: 'bg-white border-gray-300 text-black',
          chevron: 'text-gray-600'
        };
      case 'color':
        return {
          card: 'bg-white/10 border-white/30 text-white',
          chevron: 'text-white/80'
        };
      case 'dark':
      default:
        return {
          card: 'bg-white/10 border-white/30 text-white',
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
        onClick={handleToggle}
        className={`w-full px-4 py-3 flex items-center justify-between transition-all duration-200 ${buttonClass}`}
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