'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { deleteSubdomainAction } from '@/app/actions';
import { type getAllSubdomains } from '@/lib/subdomains';
import { rootDomain, protocol } from '@/lib/utils';
import { ExternalLink, Trash2, Eye, Calendar, Palette } from 'lucide-react';
import { useActionState, useState } from 'react';

type SubdomainInfo = Awaited<ReturnType<typeof getAllSubdomains>>[0];

interface DashboardProps {
  subdomains: SubdomainInfo[];
}

function SubdomainCard({ subdomain }: { subdomain: SubdomainInfo }) {
  const [deleteState, deleteAction] = useActionState(deleteSubdomainAction, { success: '' });
  const [showPreview, setShowPreview] = useState(false);

  const getThemeColor = (theme: string) => {
    switch (theme) {
      case 'dark': return 'bg-gray-800 text-white';
      case 'colorful': return 'bg-gradient-to-r from-purple-400 to-pink-400 text-white';
      case 'minimal': return 'bg-white border text-gray-900';
      default: return 'bg-blue-50 text-blue-900';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              <a
                href={`${protocol}://${subdomain.subdomain}.${rootDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline inline-flex items-center gap-2"
              >
                {subdomain.subdomain}.{rootDomain}
                <ExternalLink className="w-4 h-4" />
              </a>
            </CardTitle>
            <CardDescription className="text-sm font-medium">
              {subdomain.title || 'Untitled Page'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={subdomain.isPublished ? "default" : "secondary"}>
              {subdomain.isPublished ? 'Published' : 'Draft'}
            </Badge>
            <div className={`w-3 h-3 rounded-full ${getThemeColor(subdomain.theme || 'default')}`} 
                 title={`Theme: ${subdomain.theme || 'default'}`} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Subdomain Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Created: {formatDate(subdomain.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Palette className="w-4 h-4" />
            <span>Theme: {subdomain.theme || 'default'}</span>
          </div>
        </div>

        {/* Preview Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>

        {/* Content Preview */}
        {showPreview && (
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-700">Content Preview:</h4>
              <div className="text-xs text-gray-600">
                <p><strong>Description:</strong> {subdomain.description || 'No description'}</p>
                <p><strong>Body Preview:</strong> {(subdomain.body || '').substring(0, 150)}...</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <a
              href={`${protocol}://${subdomain.subdomain}.${rootDomain}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Site
            </a>
          </Button>
          
          <form action={deleteAction}>
            <Input
              type="hidden"
              name="subdomain"
              value={subdomain.subdomain}
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
        </div>

        {deleteState?.success && deleteState.success !== '' && (
          <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
            {deleteState.success}
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

  const stats = {
    total: subdomains.length,
    published: subdomains.filter(s => s.isPublished).length,
    drafts: subdomains.filter(s => !s.isPublished).length,
    themes: {
      default: subdomains.filter(s => (s.theme || 'default') === 'default').length,
      dark: subdomains.filter(s => s.theme === 'dark').length,
      colorful: subdomains.filter(s => s.theme === 'colorful').length,
      minimal: subdomains.filter(s => s.theme === 'minimal').length,
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-gray-600">Total Subdomains</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
            <p className="text-sm text-gray-600">Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.drafts}</div>
            <p className="text-sm text-gray-600">Drafts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.themes.default + stats.themes.dark + stats.themes.colorful + stats.themes.minimal}</div>
            <p className="text-sm text-gray-600">Themed Pages</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Input
          placeholder="Search subdomains by name or title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <p className="text-sm text-gray-600">
          Showing {filteredSubdomains.length} of {subdomains.length} subdomains
        </p>
      </div>

      {/* Subdomains List */}
      <div className="space-y-4">
        {filteredSubdomains.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">
                {searchTerm ? 'No subdomains match your search.' : 'No subdomains created yet.'}
              </p>
              {!searchTerm && (
                <p className="text-sm text-gray-400 mt-2">
                  Create your first subdomain from the main page!
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSubdomains.map((subdomain) => (
              <SubdomainCard key={subdomain.subdomain} subdomain={subdomain} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
