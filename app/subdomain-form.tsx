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
            className="w-full rounded-none focus:z-10"
            required
          />
        </div>
        <span className="bg-gray-100 px-3 border border-l-0 border-input rounded-none text-gray-500 min-h-[36px] flex items-center">
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
        <div className="text-sm text-red-500">{state.error}</div>
      )}

      <Button type="submit" className="w-full cursor-pointer" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create'}
      </Button>
    </form>
  );
}
