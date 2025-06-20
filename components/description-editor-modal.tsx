'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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

interface DescriptionEditorModalProps {
  value: string;
  onChange: (value: string) => void;
  theme?: 'dark' | 'light' | 'color';
  buttonClass?: string;
}

export function DescriptionEditorModal({ 
  value, 
  onChange, 
  theme = 'dark', 
  buttonClass = '' 
}: DescriptionEditorModalProps) {
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
        const textarea = document.getElementById('description-editor');
        if (textarea) {
          textarea.focus();
          // Position cursor at end of text
          (textarea as HTMLTextAreaElement).setSelectionRange(localValue.length, localValue.length);
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
              {value || 'Add description...'}
            </span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className={`modal-mobile-container ${modalStyling.background}`}>
        {/* Header */}
        <div className="modal-mobile-header">
          <DialogTitle className={`text-xl font-bold ${modalStyling.labelColor}`}>Edit Description</DialogTitle>
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
            <Textarea
              id="description-editor"
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              placeholder="Enter your page description..."
              rows={8}
              className={`text-base rounded-none resize-none ${modalStyling.inputBg}`}
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