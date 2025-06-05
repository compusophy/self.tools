'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSubdomainAction } from '@/app/actions';
import { rootDomain } from '@/lib/utils';
import { getOrCreateDeviceId } from '@/lib/user';
import { Plus } from 'lucide-react';

type CreateState = {
  error?: string;
  success?: boolean;
  subdomain?: string;
};

interface SubdomainFormProps {
  theme?: 'dark' | 'light' | 'color';
}

function SubdomainInput({ defaultValue, theme = 'dark' }: { defaultValue?: string; theme?: 'dark' | 'light' | 'color' }) {
  const [value, setValue] = useState(defaultValue || '');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sanitize input: lowercase and only allow letters, numbers, and hyphens
    const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setValue(sanitized);
  };

  // Get theme-specific styling
  const getInputStyling = () => {
    switch (theme) {
      case 'light':
        return {
          input: 'w-full rounded-none focus:z-10 bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-gray-500',
          suffix: 'bg-gray-200 px-3 border border-l-0 border-gray-300 rounded-none text-gray-700 min-h-[36px] flex items-center'
        };
      case 'color':
        return {
          input: 'w-full rounded-none focus:z-10 bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/50',
          suffix: 'bg-white/10 px-3 border border-l-0 border-white/30 rounded-none text-white/90 min-h-[36px] flex items-center'
        };
      case 'dark':
      default:
        return {
          input: 'w-full rounded-none focus:z-10 bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:border-white/50',
          suffix: 'bg-white/20 px-3 border border-l-0 border-white/30 rounded-none text-gray-300 min-h-[36px] flex items-center'
        };
    }
  };

  const styling = getInputStyling();

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <div className="relative flex-1">
          <Input
            id="subdomain"
            name="subdomain"
            placeholder="your-subdomain"
            value={value}
            onChange={handleInputChange}
            className={styling.input}
            required
          />
        </div>
        <span className={styling.suffix}>
          .{rootDomain}
        </span>
      </div>
    </div>
  );
}

export function SubdomainForm({ theme = 'dark' }: SubdomainFormProps) {
  const [state, action, isPending] = useActionState<CreateState, FormData>(
    createSubdomainAction,
    {}
  );
  const [deviceId, setDeviceId] = useState('');
  const [userFont, setUserFont] = useState('mono');

  useEffect(() => {
    // Get or create device ID when component mounts
    const id = getOrCreateDeviceId();
    setDeviceId(id);
    
    // Get user's current font setting
    const savedFont = localStorage.getItem('home-font');
    const currentFont = (savedFont as 'mono' | 'serif' | 'sans') || 'mono';
    setUserFont(currentFont);
  }, []);

  // Get theme-specific button styling
  const getButtonStyling = () => {
    switch (theme) {
      case 'light':
        return 'w-full btn-primary-light';
      case 'color':
        return 'w-full btn-primary-color';
      case 'dark':
      default:
        return 'w-full btn-primary-dark';
    }
  };

  // Get theme-specific button text styling
  const getButtonTextStyling = () => {
    switch (theme) {
      case 'color':
        return 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent';
      default:
        return '';
    }
  };

  // Get theme-specific icon styling for SVGs
  const getIconStyling = () => {
    switch (theme) {
      case 'color':
        return 'text-purple-600'; // Use a single color from the gradient for SVG
      default:
        return '';
    }
  };

  const buttonStyling = getButtonStyling();
  const buttonTextStyling = getButtonTextStyling();
  const iconStyling = getIconStyling();

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="deviceId" value={deviceId} />
      <input type="hidden" name="homeTheme" value={theme} />
      <input type="hidden" name="homeFont" value={userFont} />
      <SubdomainInput defaultValue={state?.subdomain} theme={theme} />

      {state?.error && (
        <div className={`text-sm ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`}>{state.error}</div>
      )}

      <Button type="submit" className={buttonStyling} disabled={isPending}>
        <Plus className={`w-4 h-4 mr-2 ${iconStyling}`} />
        <span className={buttonTextStyling}>
          {isPending ? 'Creating...' : 'Create'}
        </span>
      </Button>
    </form>
  );
}
