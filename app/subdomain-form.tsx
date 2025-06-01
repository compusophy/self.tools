'use client';

import type React from 'react';

import { useState } from 'react';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSubdomainAction } from '@/app/actions';
import { rootDomain } from '@/lib/utils';

type CreateState = {
  error?: string;
  success?: boolean;
  subdomain?: string;
};

function SubdomainInput({ defaultValue }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue || '');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sanitize input: lowercase and only allow letters, numbers, and hyphens
    const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setValue(sanitized);
  };

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
            className="w-full rounded-none focus:z-10 bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:border-white/50"
            required
          />
        </div>
        <span className="bg-white/20 px-3 border border-l-0 border-white/30 rounded-none text-gray-300 min-h-[36px] flex items-center">
          .{rootDomain}
        </span>
      </div>
    </div>
  );
}

export function SubdomainForm() {
  const [state, action, isPending] = useActionState<CreateState, FormData>(
    createSubdomainAction,
    {}
  );

  return (
    <form action={action} className="space-y-4">
      <SubdomainInput defaultValue={state?.subdomain} />

      {state?.error && (
        <div className="text-sm text-red-400">{state.error}</div>
      )}

      <Button type="submit" className="w-full cursor-pointer bg-white text-black hover:bg-gray-200" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create'}
      </Button>
    </form>
  );
}
