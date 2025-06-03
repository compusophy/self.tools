import Link from 'next/link';
import { getAllSubdomains } from '@/lib/subdomains';
import { Dashboard } from './dashboard';
import { protocol, rootDomain } from '@/lib/utils';
import { LayoutHeader } from '@/components/layout-header';
import { LayoutFooter } from '@/components/layout-footer';

export default async function AdminPage() {
  const subdomains = await getAllSubdomains();

  return (
    <div className="mobile-layout-container bg-background">
      {/* Header */}
      <div className="mobile-layout-header">
        <LayoutHeader showHomeLink={true} homeButtonStyle="button" />
      </div>

      {/* Main Content */}
      <main className="mobile-layout-main">
        <div className="container mx-auto px-4 max-w-7xl py-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          </div>
          
          <Dashboard subdomains={subdomains} />
        </div>
      </main>

      {/* Footer */}
      <div className="mobile-layout-footer">
        <LayoutFooter size="large">
          <div className="text-sm text-muted-foreground">
            Managing {subdomains.length} subdomain{subdomains.length !== 1 ? 's' : ''}
          </div>
        </LayoutFooter>
      </div>
    </div>
  );
}
