'use client';

import { useState, useEffect } from 'react';
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
import { useActionState } from 'react';
import { claimSubdomainOwnershipAction } from '@/app/actions';

interface SubdomainEditorProps {
  subdomain: string;
  data: SubdomainData;
  theme?: 'dark' | 'light' | 'color';
  themeStyles?: {
    container: string;
    header: {
      textPrimary: string;
      textSecondary: string;
      background: string;
    };
    footer: {
      background: string;
    };
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
  const [state, action, isPending] = useActionState(updateSubdomainContentAction, { success: false, message: '' });
  const [claimState, claimAction, isClaimPending] = useActionState(claimSubdomainOwnershipAction, { success: false, message: '' });
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

  // Close modal when action succeeds
  useEffect(() => {
    if (state.success) {
      setIsOpen(false);
      window.location.reload(); // Refresh to show changes
    }
  }, [state.success]);

  const isOwner = data.createdBy === deviceId;
  
  // Get modal background and text colors based on theme
  const getModalStyling = () => {
    switch (theme) {
      case 'light':
        return {
          background: 'bg-white',
          labelColor: 'text-black',
          inputBg: 'bg-white border-gray-300 text-black',
          textareaColor: 'text-black'
        };
      case 'color':
        return {
          background: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500',
          labelColor: 'text-white',
          inputBg: 'bg-white/10 border-white/30 text-white',
          textareaColor: 'text-white placeholder:text-white/60'
        };
      case 'dark':
      default:
        return {
          background: 'bg-black',
          labelColor: 'text-white',
          inputBg: 'bg-white/20 border-white/30 text-white',
          textareaColor: 'text-white placeholder:text-gray-300'
        };
    }
  };

  const modalStyling = getModalStyling();

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
      <DialogContent className={`modal-mobile-container ${modalStyling.background}`}>
        <form action={action}>
          {/* Hidden inputs */}
          <input type="hidden" name="subdomain" value={subdomain} />
          <input type="hidden" name="title" value={formData.title} />
          <input type="hidden" name="description" value={formData.description} />
          <input type="hidden" name="body" value={data.content.body} />
          <input type="hidden" name="theme" value={formData.theme} />
          <input type="hidden" name="deviceId" value={deviceId} />

          {/* Header */}
          <div className={`modal-mobile-header`}>
            <DialogTitle className={`text-xl font-bold ${modalStyling.labelColor}`}>Edit {subdomain}</DialogTitle>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={secondaryButtonClass || `shadow-lg cursor-pointer ${lightThemeButtonClass}`}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </DialogClose>
          </div>

          {/* Scrollable Content Area */}
          <div className={`modal-mobile-main`}>
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
                      className={`text-base rounded-none ${modalStyling.inputBg}`}
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
                      className={`text-base rounded-none ${modalStyling.inputBg} ${theme === 'dark' ? '!bg-transparent dark:!bg-input/30' : ''}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`modal-mobile-footer`}>
            <Button type="submit" disabled={isPending} size="sm" variant="outline" className={secondaryButtonClass || `shadow-lg cursor-pointer ${lightThemeButtonClass}`}>
              <Save className="w-4 h-4 mr-2" />
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 