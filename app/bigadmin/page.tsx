'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Trash2, Database, Users, Globe, Download, Upload } from 'lucide-react';
import { masterDeleteSubdomain, getAllSubdomainsAction, getAdminStatsAction, backupSubdomainsAction, restoreFromBackupAction, nuclearDeleteAllSubdomains } from './actions';

const SECRET_PASSWORD = 'password123';

interface AdminStats {
  totalSubdomains: number;
  totalUsers: number;
}

interface SubdomainInfo {
  subdomain: string;
  title: string;
  description: string;
  body: string;
  theme: 'dark' | 'light' | 'color';
  createdAt: number;
  createdBy: string;
  isPublished: boolean;
  lastModified?: number;
}

type SortOption = 'alphabetical' | 'dateCreated' | 'recentlyEdited';

export default function BigAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [allSubdomains, setAllSubdomains] = useState<SubdomainInfo[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('dateCreated');
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = () => {
    if (password === SECRET_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
      // Load admin stats and all subdomains
      loadStats();
      loadAllSubdomains();
    } else {
      setError('Invalid password');
      setPassword('');
    }
  };

  const loadStats = async () => {
    try {
      const result = await getAdminStatsAction();
      if (result.success) {
        setStats(result.stats);
      } else {
        setStats({
          totalSubdomains: 0,
          totalUsers: 0,
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({
        totalSubdomains: 0,
        totalUsers: 0,
      });
    }
  };

  const loadAllSubdomains = async () => {
    try {
      const result = await getAllSubdomainsAction();
      if (result.success) {
        setAllSubdomains(result.subdomains);
      } else {
        setAllSubdomains([]);
      }
    } catch (error) {
      console.error('Error loading subdomains:', error);
      setAllSubdomains([]);
    }
  };

  const handleDeleteSubdomain = (subdomainName: string) => {
    if (confirm(`⚠️ Delete "${subdomainName}"? This cannot be undone.`)) {
      startTransition(async () => {
        try {
          // Use master admin delete function
          const success = await masterDeleteSubdomain(subdomainName);
          
          if (success) {
            // Remove from local state
            setAllSubdomains(prev => prev.filter(s => s.subdomain !== subdomainName));
            // Reload stats
            loadStats();
            alert(`✅ Deleted ${subdomainName}`);
          } else {
            alert(`❌ Failed to delete ${subdomainName}`);
          }
        } catch (error) {
          console.error('Error deleting subdomain:', error);
          alert(`❌ Error deleting ${subdomainName}`);
        }
      });
    }
  };

  const getSortedSubdomains = () => {
    let filtered = allSubdomains.filter(subdomain =>
      subdomain.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subdomain.title && subdomain.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    switch (sortBy) {
      case 'alphabetical':
        return filtered.sort((a, b) => a.subdomain.localeCompare(b.subdomain));
      case 'dateCreated':
        return filtered.sort((a, b) => b.createdAt - a.createdAt);
      case 'recentlyEdited':
        return filtered.sort((a, b) => (b.lastModified || b.createdAt) - (a.lastModified || a.createdAt));
      default:
        return filtered;
    }
  };

  const handleBackupSubdomains = () => {
    startTransition(async () => {
      try {
        const result = await backupSubdomainsAction();
        
        if (result.success && result.backup) {
          // Create and download backup file
          const backupJson = JSON.stringify(result.backup, null, 2);
          const blob = new Blob([backupJson], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          
          const now = new Date();
          const timestamp = now.toISOString().split('T')[0]; // YYYY-MM-DD format
          const filename = `subdomains-backup-${timestamp}.json`;
          
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          alert(`✅ Backup created: ${filename}\n📊 ${result.backup.totalSubdomains} subdomains backed up`);
        } else {
          alert('❌ Failed to create backup');
        }
      } catch (error) {
        console.error('Error creating backup:', error);
        alert('❌ Error creating backup');
      }
    });
  };

  const handleDeleteAllSubdomains = () => {
    if (confirm('⚠️ DANGER: This will delete ALL subdomains. Are you absolutely sure?')) {
      if (confirm('🚨 FINAL WARNING: This cannot be undone. This will permanently delete EVERYTHING.\n\nType "DELETE ALL" in the next prompt to confirm.')) {
        const userInput = prompt('Type "DELETE ALL" to confirm:');
        if (userInput === 'DELETE ALL') {
          startTransition(async () => {
            try {
              const result = await nuclearDeleteAllSubdomains();
              
              if (result.success) {
                // Clear local state
                setAllSubdomains([]);
                // Reload stats
                loadStats();
                alert(`☢️ NUCLEAR DELETE COMPLETED\n\n${result.message}`);
              } else {
                alert(`❌ Nuclear delete failed: ${result.message}`);
              }
            } catch (error) {
              console.error('Error during nuclear delete:', error);
              alert('❌ Error during nuclear delete');
            }
          });
        } else {
          alert('❌ Nuclear delete cancelled - incorrect confirmation');
        }
      }
    }
  };

  const handleRestoreFromBackup = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      alert('❌ Please select a JSON backup file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        processBackupRestore(content);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  const processBackupRestore = (backupJson: string) => {
    if (confirm('🔄 Restore from backup?\n\n⚠️ This will add subdomains from the backup file.\nExisting subdomains will be skipped (no duplicates).')) {
      startTransition(async () => {
        try {
          const result = await restoreFromBackupAction(backupJson);
          
          if (result.success) {
            // Refresh data after restore
            loadStats();
            loadAllSubdomains();
            
            const { processed, restored, skipped, errors } = result.stats;
            let message = `✅ Backup restore completed!\n\n`;
            message += `📊 Processed: ${processed} subdomains\n`;
            message += `✨ Restored: ${restored} new subdomains\n`;
            message += `⏭️ Skipped: ${skipped} existing subdomains\n`;
            
            if (errors && errors > 0) {
              message += `⚠️ Errors: ${errors} items failed\n`;
              if (result.errors && result.errors.length > 0) {
                message += `\nFirst few errors:\n${result.errors.slice(0, 3).join('\n')}`;
              }
            }
            
            alert(message);
          } else {
            alert(`❌ Restore failed: ${result.error}`);
          }
        } catch (error) {
          console.error('Error during restore:', error);
          alert('❌ Error during restore process');
        }
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-900 border-gray-700">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="w-12 h-12 text-red-500" />
            </div>
            <CardTitle className="text-white text-2xl">Master Admin</CardTitle>
            <p className="text-gray-400">Enter secret passcode</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="bg-gray-800 border-gray-600 text-white"
            />
            {error && (
              <div className="text-red-400 text-sm text-center">{error}</div>
            )}
            <Button 
              onClick={handleLogin}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Access Master Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold">Master Admin Dashboard</h1>
          </div>
          <Button
            onClick={() => setIsAuthenticated(false)}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Subdomains</CardTitle>
              <Globe className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.totalSubdomains || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Unique Users</CardTitle>
              <Users className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Database Size</CardTitle>
              <Database className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">~{((stats?.totalSubdomains || 0) * 2.3).toFixed(1)}KB</div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cleanup Tools */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-orange-400" />
                Cleanup Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleBackupSubdomains}
                disabled={isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Backup All Subdomains
              </Button>
              
              <div className="border-t border-gray-600 pt-4">
                <Button
                  onClick={handleRestoreFromBackup}
                  disabled={isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Restore from Backup
                </Button>
              </div>

              <div className="border-t border-gray-600 pt-4">
                <Button
                  onClick={handleDeleteAllSubdomains}
                  disabled={isPending}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  ☢️ NUCLEAR: Delete All Subdomains
                </Button>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  ⚠️ This will permanently delete everything
                </p>
              </div>
            </CardContent>
          </Card>

          {/* All Subdomains List */}
          <Card className="bg-gray-900 border-gray-700 lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">All Subdomains</CardTitle>
                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 text-sm"
                  >
                    <option value="dateCreated">Date Created</option>
                    <option value="recentlyEdited">Recently Edited</option>
                    <option value="alphabetical">Alphabetical</option>
                  </select>
                </div>
              </div>
              <Input
                placeholder="Search subdomains..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {getSortedSubdomains().map((subdomain) => (
                  <div key={subdomain.subdomain} className="flex justify-between items-center p-3 bg-gray-800 rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-white font-medium">{subdomain.subdomain}</div>
                        <div className={`w-2 h-2 rounded-full ${subdomain.isPublished ? 'bg-green-400' : 'bg-gray-500'}`} />
                      </div>
                      <div className="text-sm text-gray-400">
                        Created: {new Date(subdomain.createdAt).toLocaleDateString()}
                        {subdomain.lastModified && (
                          <span className="ml-2">• Edited: {new Date(subdomain.lastModified).toLocaleDateString()}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-32">
                        Owner: {subdomain.createdBy}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDeleteSubdomain(subdomain.subdomain)}
                      disabled={isPending}
                      className="bg-red-600 hover:bg-red-700 text-white ml-2"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {getSortedSubdomains().length === 0 && (
                  <div className="text-gray-400 text-center py-4">
                    {searchTerm ? 'No subdomains match your search.' : 'No subdomains found.'}
                  </div>
                )}
              </div>
              <div className="mt-3 text-sm text-gray-400">
                Showing {getSortedSubdomains().length} of {allSubdomains.length} subdomains
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Hidden file input for backup restore */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
} 