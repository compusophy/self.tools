'use client';

import { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Settings, Save, X } from 'lucide-react';
import { setHomeTheme, getHomeTheme } from '@/lib/user';

const themes = [
  { id: 'dark', name: 'DARK', colors: 'bg-black text-white' },
  { id: 'light', name: 'LIGHT', colors: 'bg-white text-black border border-gray-300' },
  { id: 'color', name: 'COLOR', colors: 'bg-gradient-to-br from-purple-600 to-pink-600 text-white' },
] as const;

interface HomeSettingsProps {
  currentTheme?: 'dark' | 'light' | 'color';
  lightThemeButtonClass?: string;
  secondaryButtonClass?: string;
}

export function HomeSettings({ currentTheme = 'dark', lightThemeButtonClass = '', secondaryButtonClass = '' }: HomeSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedTheme, setSelectedTheme] = useState<'dark' | 'light' | 'color'>(currentTheme);

  // Update selectedTheme when modal opens or currentTheme changes
  useEffect(() => {
    if (isOpen) {
      // Get the actual current theme from localStorage when modal opens
      const actualCurrentTheme = getHomeTheme();
      setSelectedTheme(actualCurrentTheme);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedTheme(currentTheme);
  }, [currentTheme]);

  // Get theme-specific modal styling
  const getModalStyling = () => {
    switch (currentTheme) {
      case 'light':
        return {
          background: 'bg-white',
          labelColor: 'text-black'
        };
      case 'color':
        return {
          background: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500',
          labelColor: 'text-white'
        };
      case 'dark':
      default:
        return {
          background: 'bg-black',
          labelColor: 'text-white'
        };
    }
  };

  const modalStyling = getModalStyling();

  const handleSave = () => {
    startTransition(async () => {
      // Save theme using user management system
      setHomeTheme(selectedTheme);
      setIsOpen(false);
      // Refresh to apply changes
      window.location.reload();
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={secondaryButtonClass || `shadow-lg cursor-pointer ${lightThemeButtonClass}`}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className={`modal-mobile-container ${modalStyling.background}`}>
        {/* Header */}
        <div className="modal-mobile-header">
          <DialogTitle className={`text-xl font-bold ${modalStyling.labelColor} flex items-center gap-2`}>
            <Settings className={`w-5 h-5 ${modalStyling.labelColor}`} />
            Settings
          </DialogTitle>
          <DialogClose asChild>
            <Button
              variant="outline"
              size="sm"
              className={secondaryButtonClass || 'shadow-lg cursor-pointer'}
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </DialogClose>
        </div>

        {/* Scrollable Content Area */}
        <div className="modal-mobile-main">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="space-y-8">
              {/* Theme Selector */}
              <div className="space-y-4">
                <Label className={`text-base font-medium ${modalStyling.labelColor}`}>Theme</Label>
                <div className="grid grid-cols-3 gap-4">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setSelectedTheme(theme.id as 'dark' | 'light' | 'color')}
                      className={`relative p-4 transition-all duration-200 ${theme.colors} ${
                        selectedTheme === theme.id 
                          ? 'ring-2 ring-blue-500 ring-offset-2 scale-105' 
                          : 'hover:scale-102 hover:ring-1 hover:ring-gray-300 hover:ring-offset-1'
                      }`}
                    >
                      {/* Selected indicator */}
                      {selectedTheme === theme.id && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 text-white w-5 h-5 flex items-center justify-center text-xs font-medium">
                          ✓
                        </div>
                      )}
                      
                      <div className="text-sm font-medium tracking-wide py-1">{theme.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-mobile-footer">
          <Button onClick={handleSave} size="sm" variant="outline" className={secondaryButtonClass || 'shadow-lg cursor-pointer'}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 