import { getAllSubdomains } from '@/lib/subdomains';
import { Dashboard } from './dashboard';

export default async function AdminPage() {
  const subdomains = await getAllSubdomains();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Subdomain Platform Admin</h1>
        <p className="text-gray-600 mt-2">Manage all your subdomains and content</p>
      </div>
      
      <Dashboard subdomains={subdomains} />
    </div>
  );
}
