import Link from 'next/link';
import { getAllSubdomains } from '@/lib/subdomains';
import { Dashboard } from './dashboard';
import { protocol, rootDomain } from '@/lib/utils';
import { LayoutHeader } from '@/components/layout-header';
import { LayoutFooter } from '@/components/layout-footer';

export default async function AdminPage() {
  const subdomains = await getAllSubdomains();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <LayoutHeader showHomeLink={true} homeButtonStyle="button" />

      {/* Main Content */}
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          </div>
          
          <Dashboard subdomains={subdomains} />
        </div>
      </main>

      {/* Footer */}
      <LayoutFooter size="large">
        <div className="text-sm text-muted-foreground">
          Managing {subdomains.length} subdomain{subdomains.length !== 1 ? 's' : ''}
        </div>
      </LayoutFooter>
    </div>
  );
}
