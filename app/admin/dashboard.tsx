'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { deleteSubdomainAction } from '@/app/actions';
import { type getAllSubdomains } from '@/lib/subdomains';
import { rootDomain, protocol } from '@/lib/utils';
import { Trash2, Palette, Rocket } from 'lucide-react';
import { useActionState, useState, useEffect } from 'react';
import { sdk } from '@farcaster/frame-sdk';
import { getOrCreateDeviceId } from '@/lib/user';

type SubdomainInfo = Awaited<ReturnType<typeof getAllSubdomains>>[0];

interface DashboardProps {
  subdomains: SubdomainInfo[];
}

function SubdomainCard({ subdomain }: { subdomain: SubdomainInfo }) {
  const [deleteState, deleteAction] = useActionState(deleteSubdomainAction, { success: '' });
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    // Get device ID for authentication
    const id = getOrCreateDeviceId();
    setDeviceId(id);
  }, []);

  const handleLaunchFrame = async () => {
    try {
      const subdomainUrl = `${protocol}://${subdomain.subdomain}.${rootDomain}/`;
      const encodedUrl = encodeURIComponent(subdomainUrl);
      const farcasterLaunchUrl = `https://farcaster.xyz/?launchFrameUrl=${encodedUrl}`;
      
      await sdk.actions.openUrl(farcasterLaunchUrl);
    } catch (error) {
      console.error('Error launching frame:', error);
      // Fallback to direct navigation
      const subdomainUrl = `${protocol}://${subdomain.subdomain}.${rootDomain}/`;
      window.open(subdomainUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Only show title if it's different from subdomain name
  const showTitle = subdomain.title && subdomain.title !== subdomain.subdomain && subdomain.title !== 'Untitled Page';
  
  // Check if current user is the creator
  const isOwner = deviceId && subdomain.createdBy === deviceId;

  return (
    <Card className="w-full !gap-0 !py-0">
      <CardHeader className="p-4 pb-1">
        <div className="space-y-0.5">
          <CardTitle className="text-lg">
            {subdomain.subdomain}
          </CardTitle>
          {showTitle && (
            <CardDescription className="text-sm font-medium">
              {subdomain.title}
            </CardDescription>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-1 space-y-2">
        {/* Theme Info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Palette className="w-4 h-4" />
          <span>Theme: {subdomain.theme || 'default'}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleLaunchFrame}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Rocket className="w-4 h-4 mr-2" />
            Launch
          </Button>
          
          {isOwner && (
            <form action={deleteAction}>
              <Input
                type="hidden"
                name="subdomain"
                value={subdomain.subdomain}
              />
              <Input
                type="hidden"
                name="deviceId"
                value={deviceId}
              />
              <Button
                type="submit"
                variant="destructive"
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </form>
          )}
        </div>

        {deleteState?.success && deleteState.success !== '' && (
          <div className="text-sm text-green-600 bg-green-50 p-2 rounded-none">
            {deleteState.success}
          </div>
        )}
        
        {deleteState?.error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded-none">
            {deleteState.error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function Dashboard({ subdomains }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSubdomains = subdomains.filter(subdomain =>
    subdomain.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subdomain.title && subdomain.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Input
          placeholder="Search subdomains by name or title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <p className="text-sm text-muted-foreground">
          Showing {filteredSubdomains.length} of {subdomains.length} subdomains
        </p>
      </div>

      {/* Subdomains List */}
      <div className="space-y-4">
        {filteredSubdomains.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                {searchTerm ? 'No subdomains match your search.' : 'No subdomains created yet.'}
              </p>
              {!searchTerm && (
                <p className="text-sm text-muted-foreground/60 mt-2">
                  Create your first subdomain from the main page!
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredSubdomains.map((subdomain) => (
              <SubdomainCard key={subdomain.subdomain} subdomain={subdomain} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
