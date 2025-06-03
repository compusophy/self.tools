'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { deleteSubdomainAction } from '@/app/actions';
import { type getAllSubdomains } from '@/lib/subdomains';
import { rootDomain, protocol } from '@/lib/utils';
import { Trash2, Palette, Rocket, Crown } from 'lucide-react';
import { useActionState, useState, useEffect } from 'react';
import { getOrCreateDeviceId } from '@/lib/user';
import Link from 'next/link';

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

  // Check if current user is the creator
  const isOwner = deviceId && subdomain.createdBy === deviceId;
  
  // Only owner can delete their own subdomain
  const canDelete = isOwner;

  return (
    <Card className="w-full !gap-0 !py-0">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {subdomain.subdomain}
          </CardTitle>
          {isOwner && (
            <div title="Owner">
              <Crown className="w-4 h-4 text-yellow-500" />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 space-y-2">
        {/* Actions */}
        <div className="flex gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Link href={`/s/${subdomain.subdomain}`}>
              <Rocket className="w-4 h-4 mr-2" />
              Launch
            </Link>
          </Button>
          
          {canDelete && (
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
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    const id = getOrCreateDeviceId();
    setDeviceId(id);
  }, []);

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
