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
import { DescriptionEditorModal } from '@/components/description-editor-modal';
import { TitleEditorModal } from '@/components/title-editor-modal';
import { CollapsibleCard } from '@/components/collapsible-card';

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

const fonts = [
  { id: 'mono', name: 'MONO', family: 'var(--font-jetbrains-mono), monospace' },
  { id: 'serif', name: 'SERIF', family: 'Georgia, Times, serif' },
  { id: 'sans', name: 'SANS', family: 'system-ui, -apple-system, sans-serif' },
] as const;

export function SubdomainEditor({ subdomain, data, theme = 'dark', themeStyles, lightThemeButtonClass = '', secondaryButtonClass = '' }: SubdomainEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, action, isPending] = useActionState(updateSubdomainContentAction, { success: false, message: '' });
  const [claimState, claimAction, isClaimPending] = useActionState(claimSubdomainOwnershipAction, { success: false, message: '' });
  const [deviceId, setDeviceId] = useState('');
  const [openCard, setOpenCard] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: data.content.title,
    description: data.content.description,
    theme: data.content.theme,
    font: (data.content as any).font || 'mono',
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

  const handleCardToggle = (cardName: string) => {
    setOpenCard(openCard === cardName ? null : cardName);
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      title: data.content.title,
      description: data.content.description,
      theme: data.content.theme,
      font: (data.content as any).font || 'mono',
    });
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = 
    formData.title !== data.content.title ||
    formData.description !== data.content.description ||
    formData.theme !== data.content.theme ||
    formData.font !== ((data.content as any).font || 'mono');

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
        {/* Header */}
        <div className="modal-mobile-header">
          <DialogTitle className={`text-xl font-bold ${modalStyling.labelColor}`}>Edit {subdomain}</DialogTitle>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={secondaryButtonClass || `shadow-lg cursor-pointer ${lightThemeButtonClass}`}
              onClick={handleCancel}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </DialogClose>
        </div>

        <form action={action} className="flex flex-col flex-1">
          {/* Hidden inputs */}
          <input type="hidden" name="subdomain" value={subdomain} />
          <input type="hidden" name="title" value={formData.title} />
          <input type="hidden" name="description" value={formData.description} />
          <input type="hidden" name="body" value={data.content.body} />
          <input type="hidden" name="theme" value={formData.theme} />
          <input type="hidden" name="font" value={formData.font} />
          <input type="hidden" name="deviceId" value={deviceId} />

          {/* Scrollable Content Area */}
          <div className="modal-mobile-main">
            <div className="px-4 py-8">
              <div className="space-y-4">
                <CollapsibleCard title="Font" theme={theme} isOpen={openCard === 'Font'} onToggle={() => handleCardToggle('Font')} buttonClass={secondaryButtonClass || lightThemeButtonClass}>
                  <div className="grid grid-cols-3 gap-3">
                    {fonts.map((font) => (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, font: font.id }))}
                        className={`relative p-2 ${
                          theme === 'light' 
                            ? 'bg-white text-black border border-gray-300' 
                            : theme === 'color'
                            ? 'bg-white/10 border-white/30 text-white'
                            : 'bg-white/10 border-white/30 text-white'
                        } btn-hover-glow ${
                          formData.font === font.id 
                            ? theme === 'light'
                              ? 'ring-1 ring-black ring-offset-1 scale-105'
                              : 'ring-1 ring-white ring-offset-1 scale-105'
                            : ''
                        }`}
                        style={{ fontFamily: font.family }}
                      >
                        {/* Selected indicator */}
                        {formData.font === font.id && (
                          <div className={`absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-xs font-medium ${
                            theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'
                          }`}>
                            ✓
                          </div>
                        )}
                        
                        <div className={`text-sm font-medium tracking-wide`}>{font.name}</div>
                      </button>
                    ))}
                  </div>
                </CollapsibleCard>

                <CollapsibleCard title="Theme" theme={theme} isOpen={openCard === 'Theme'} onToggle={() => handleCardToggle('Theme')} buttonClass={secondaryButtonClass || lightThemeButtonClass}>
                  <div className="grid grid-cols-3 gap-3">
                    {themes.map((themeOption) => (
                      <button
                        key={themeOption.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, theme: themeOption.id }))}
                        className={`relative p-2 ${themeOption.colors} btn-hover-glow ${
                          formData.theme === themeOption.id 
                            ? theme === 'light'
                              ? 'ring-1 ring-black ring-offset-1 scale-105'
                              : 'ring-1 ring-white ring-offset-1 scale-105'
                            : ''
                        }`}
                      >
                        {/* Selected indicator */}
                        {formData.theme === themeOption.id && (
                          <div className={`absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-xs font-medium ${
                            theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'
                          }`}>
                            ✓
                          </div>
                        )}
                        
                        <div className="text-sm font-medium tracking-wide">{themeOption.name}</div>
                      </button>
                    ))}
                  </div>
                </CollapsibleCard>

                <CollapsibleCard title="Title" theme={theme} isOpen={openCard === 'Title'} onToggle={() => handleCardToggle('Title')} buttonClass={secondaryButtonClass || lightThemeButtonClass}>
                  <TitleEditorModal
                    value={formData.title}
                    onChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
                    theme={theme}
                    buttonClass={secondaryButtonClass || lightThemeButtonClass}
                  />
                </CollapsibleCard>

                <CollapsibleCard title="Description" theme={theme} isOpen={openCard === 'Description'} onToggle={() => handleCardToggle('Description')} buttonClass={secondaryButtonClass || lightThemeButtonClass}>
                  <DescriptionEditorModal
                    value={formData.description}
                    onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                    theme={theme}
                    buttonClass={secondaryButtonClass || lightThemeButtonClass}
                  />
                </CollapsibleCard>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-mobile-footer">
            <div className="flex flex-col items-center gap-4">
              {hasUnsavedChanges && (
                <div className={`text-sm ${modalStyling.labelColor} opacity-70`}>
                  You have unsaved changes
                </div>
              )}
              <Button type="submit" disabled={isPending} size="sm" variant="outline" className={secondaryButtonClass || `shadow-lg cursor-pointer ${lightThemeButtonClass}`}>
                <Save className="w-4 h-4 mr-2" />
                {isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 