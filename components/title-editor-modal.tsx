'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Edit3, Save, X } from 'lucide-react';

interface TitleEditorModalProps {
  value: string;
  onChange: (value: string) => void;
  theme?: 'dark' | 'light' | 'color';
  buttonClass?: string;
}

export function TitleEditorModal({ 
  value, 
  onChange, 
  theme = 'dark', 
  buttonClass = '' 
}: TitleEditorModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const getModalStyling = () => {
    switch (theme) {
      case 'light':
        return {
          background: 'bg-white',
          labelColor: 'text-black',
          inputBg: 'bg-white border-gray-300 text-black',
        };
      case 'color':
        return {
          background: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500',
          labelColor: 'text-white',
          inputBg: 'bg-white/10 border-white/30 text-white placeholder:text-white/60',
        };
      case 'dark':
      default:
        return {
          background: 'bg-black',
          labelColor: 'text-white',
          inputBg: 'bg-white/20 border-white/30 text-white placeholder:text-gray-300',
        };
    }
  };

  const modalStyling = getModalStyling();

  const handleSave = () => {
    onChange(localValue);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setLocalValue(value);
    setIsOpen(false);
  };

  // Auto-focus when modal opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        const input = document.getElementById('title-editor');
        if (input) {
          input.focus();
          // Position cursor at end of text
          (input as HTMLInputElement).setSelectionRange(localValue.length, localValue.length);
        }
      }, 100);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={`h-auto p-2 text-left justify-start w-full ${buttonClass}`}
        >
          <div className="flex items-center gap-2 w-full">
            <Edit3 className="w-3 h-3 flex-shrink-0" />
            <span className="text-sm truncate">
              {value || 'Add title...'}
            </span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className={`modal-mobile-container ${modalStyling.background}`}>
        {/* Header */}
        <div className="modal-mobile-header">
          <DialogTitle className={`text-xl font-bold ${modalStyling.labelColor}`}>Edit Title</DialogTitle>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={buttonClass}
              onClick={handleCancel}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </DialogClose>
        </div>

        {/* Scrollable Content Area */}
        <div className="modal-mobile-main">
          <div className="px-4 py-8">
            <Input
              id="title-editor"
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              placeholder="Enter your page title..."
              className={`text-base rounded-none ${modalStyling.inputBg}`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-mobile-footer">
          <Button
            type="button"
            onClick={handleSave}
            variant="outline"
            size="sm"
            className={buttonClass}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 