import Link from 'next/link';
import { getAllSubdomains } from '@/lib/subdomains';
import { Dashboard } from './dashboard';
import { protocol, rootDomain } from '@/lib/utils';

export default async function AdminPage() {
  const subdomains = await getAllSubdomains();

  return (
    <div className="min-h-screen bg-background relative">
      {/* Back button - top left */}
      <div className="absolute top-4 left-4 z-40">
        <Link
          href={`${protocol}://${rootDomain}`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← {rootDomain}
        </Link>
      </div>

      <div className="container mx-auto py-16 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Subdomain Platform Admin</h1>
          <p className="text-muted-foreground mt-2">Manage all your subdomains and content</p>
        </div>
        
        <Dashboard subdomains={subdomains} />
      </div>
    </div>
  );
}
