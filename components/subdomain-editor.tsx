'use client';

import { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Edit3, Save, X } from 'lucide-react';
import { updateSubdomainContentAction } from '@/app/actions';
import { type SubdomainData } from '@/lib/subdomains';
import { getOrCreateDeviceId } from '@/lib/user';

interface SubdomainEditorProps {
  subdomain: string;
  data: SubdomainData;
  theme?: string;
  themeStyles?: {
    container: string;
    borderColor: string;
  };
  lightThemeButtonClass?: string;
  secondaryButtonClass?: string;
}

const themes = [
  { id: 'dark', name: 'DARK', colors: 'bg-black text-white' },
  { id: 'light', name: 'LIGHT', colors: 'bg-white text-black border border-gray-300' },
  { id: 'color', name: 'COLOR', colors: 'bg-gradient-to-br from-purple-600 to-pink-600 text-white' },
] as const;

export function SubdomainEditor({ subdomain, data, theme = 'dark', themeStyles, lightThemeButtonClass = '', secondaryButtonClass = '' }: SubdomainEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deviceId, setDeviceId] = useState('');
  
  const [formData, setFormData] = useState({
    title: data.content.title,
    description: data.content.description,
    theme: data.content.theme,
  });

  useEffect(() => {
    // Get device ID for authentication
    const id = getOrCreateDeviceId();
    setDeviceId(id);
  }, []);

  const borderColor = themeStyles?.borderColor || 'border-border';
  
  // Get modal background and text colors based on theme
  const getModalStyling = () => {
    switch (theme) {
      case 'light':
        return {
          background: 'bg-white text-black',
          labelColor: 'text-black',
          inputColor: 'text-black bg-white border-gray-300'
        };
      case 'color':
        return {
          background: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white',
          labelColor: 'text-white',
          inputColor: 'text-white bg-white/10 border-white/30 placeholder-white/60'
        };
      case 'dark':
      default:
        return {
          background: 'bg-black text-white',
          labelColor: 'text-white',
          inputColor: 'text-white bg-gray-800 border-gray-600 placeholder-gray-400'
        };
    }
  };

  const modalStyling = getModalStyling();

  const handleSave = () => {
    const form = new FormData();
    form.append('subdomain', subdomain);
    form.append('title', formData.title);
    form.append('description', formData.description);
    form.append('body', data.content.body);
    form.append('theme', formData.theme);
    form.append('deviceId', deviceId);

    startTransition(async () => {
      await updateSubdomainContentAction({}, form);
      setIsOpen(false);
      window.location.reload(); // Refresh to show changes
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
          <Edit3 className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className={`max-w-4xl h-screen flex flex-col p-0 gap-0 !border-0 [&>button]:hidden ${modalStyling.background}`}>
        {/* Header - with left/right/bottom borders */}
        <div className={`flex-shrink-0 py-4 px-4 border-l border-r border-b ${borderColor} flex items-center justify-between`}>
          <DialogTitle className={`text-xl font-bold ${modalStyling.labelColor}`}>Edit {subdomain}</DialogTitle>
          <DialogClose asChild>
            <Button
              variant="outline"
              size="sm"
              className={secondaryButtonClass || `shadow-lg cursor-pointer ${lightThemeButtonClass}`}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </DialogClose>
        </div>

        {/* Scrollable Content Area with left/right borders only */}
        <div 
          className={`flex-1 overflow-y-auto border-l border-r ${borderColor}`} 
          style={{
            msOverflowStyle: 'none', 
            scrollbarWidth: 'none'
          }}
        >
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
                      onClick={() => setFormData(prev => ({ ...prev, theme: theme.id }))}
                      className={`relative p-4 transition-all duration-200 ${theme.colors} ${
                        formData.theme === theme.id 
                          ? 'ring-2 ring-blue-500 ring-offset-2 scale-105' 
                          : 'hover:scale-102 hover:ring-1 hover:ring-gray-300 hover:ring-offset-1'
                      }`}
                    >
                      {/* Selected indicator */}
                      {formData.theme === theme.id && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 text-white w-5 h-5 flex items-center justify-center text-xs font-medium">
                          ✓
                        </div>
                      )}
                      
                      <div className="text-sm font-medium tracking-wide py-1">{theme.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Edit Form */}
              <div className="space-y-8">
                {/* Title */}
                <div className="space-y-3">
                  <Label htmlFor="title" className={`text-base font-medium ${modalStyling.labelColor}`}>Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Page title"
                    className={`text-base rounded-none ${modalStyling.inputColor}`}
                  />
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <Label htmlFor="description" className={`text-base font-medium ${modalStyling.labelColor}`}>Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Page description"
                    rows={3}
                    className={`text-base rounded-none ${modalStyling.inputColor}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - with left/right/top borders */}
        <div className={`flex-shrink-0 py-4 border-l border-r border-t ${borderColor}`}>
          <div className="flex items-center justify-center">
            <Button onClick={handleSave} disabled={isPending} size="sm" variant="outline" className={secondaryButtonClass || `shadow-lg cursor-pointer ${lightThemeButtonClass}`}>
              <Save className="w-4 h-4 mr-2" />
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 