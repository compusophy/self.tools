'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Crown, X, Rocket, Trash2 } from 'lucide-react';
import { deleteSubdomainAction, getUserSubdomainsAction } from '@/app/actions';
import { getOrCreateDeviceId } from '@/lib/user';
import { useActionState } from 'react';
import Link from 'next/link';

interface AdminModalProps {
  theme?: 'dark' | 'light' | 'color';
  secondaryButtonClass?: string;
}

type SubdomainInfo = {
  subdomain: string;
  title: string;
  description: string;
  body: string;
  theme: 'dark' | 'light' | 'color';
  createdAt: number;
  createdBy: string;
  isPublished: boolean;
};

function SubdomainCard({ subdomain, onDelete, theme }: { subdomain: SubdomainInfo, onDelete: () => void, theme: 'dark' | 'light' | 'color' }) {
  const [deleteState, deleteAction] = useActionState(deleteSubdomainAction, { success: '' });
  const [deviceId, setDeviceId] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const id = getOrCreateDeviceId();
    setDeviceId(id);
  }, []);

  // Trigger onDelete callback when deletion succeeds
  useEffect(() => {
    if (deleteState?.success && deleteState.success !== '') {
      setShowDeleteConfirm(false);
      onDelete();
    }
  }, [deleteState?.success, onDelete]);

  const handleDeleteConfirm = () => {
    const formData = new FormData();
    formData.append('subdomain', subdomain.subdomain);
    formData.append('deviceId', deviceId);
    startTransition(() => {
      deleteAction(formData);
    });
  };

  // Get theme-specific card and button styling
  const getCardStyling = () => {
    switch (theme) {
      case 'light':
        return {
          card: 'bg-white border-gray-300 text-black',
          title: 'text-black',
          button: 'btn-secondary-light',
          deleteButton: 'btn-secondary-light bg-red-600 hover:bg-red-700'
        };
      case 'color':
        return {
          card: 'bg-white/10 border-white/20 text-white',
          title: 'text-white',
          button: 'btn-secondary-color',
          deleteButton: 'btn-secondary-color bg-red-500/80 !text-white hover:bg-red-600/90'
        };
      case 'dark':
      default:
        return {
          card: 'bg-white/10 border-white/20 text-white',
          title: 'text-white',
          button: 'btn-secondary-dark',
          deleteButton: 'btn-secondary-dark bg-red-600 !text-white hover:bg-red-700'
        };
    }
  };

  const cardStyling = getCardStyling();

  return (
    <Card className={`w-full !gap-0 !py-0 ${cardStyling.card}`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-lg ${cardStyling.title}`}>
            {subdomain.subdomain}
          </CardTitle>
          <div title="Owner">
            <Crown className={`w-4 h-4 ${cardStyling.title}`} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 space-y-2">
        <div className="flex gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className={`flex-1 ${cardStyling.button}`}
          >
            <Link href={`/s/${subdomain.subdomain}`}>
              <Rocket className="w-4 h-4 mr-2" />
              Launch
            </Link>
          </Button>
          
          <Button 
            onClick={() => setShowDeleteConfirm(true)}
            variant="outline" 
            size="sm"
            className={cardStyling.deleteButton}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>

        {deleteState?.success && deleteState.success !== '' && (
          <div className={`text-sm p-2 rounded-none ${
            theme === 'light' 
              ? 'text-green-700 bg-green-100' 
              : theme === 'color'
              ? 'text-green-100 bg-green-500/20 border border-green-400/30'
              : 'text-green-400 bg-green-500/20'
          }`}>
            {deleteState.success}
          </div>
        )}
        
        {deleteState?.error && (
          <div className={`text-sm p-2 rounded-none ${
            theme === 'light' 
              ? 'text-red-700 bg-red-100' 
              : theme === 'color'
              ? 'text-red-100 bg-red-500/20 border border-red-400/30'
              : 'text-red-400 bg-red-500/20'
          }`}>
            {deleteState.error}
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {subdomain.subdomain}?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. All content will be permanently lost.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-red-600 text-white border border-red-600 shadow-lg cursor-pointer transition-all duration-300 hover:bg-red-700 hover:border-red-700 hover:shadow-[0_0_15px_rgba(220,38,38,0.4),0_0_30px_rgba(220,38,38,0.2),0_2px_4px_rgba(0,0,0,0.2)] hover:-translate-y-0.5"
              onClick={handleDeleteConfirm}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export function AdminModal({ theme = 'dark', secondaryButtonClass = '' }: AdminModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [subdomains, setSubdomains] = useState<SubdomainInfo[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [state, action] = useActionState(getUserSubdomainsAction, { success: false, subdomains: [] });

  useEffect(() => {
    const id = getOrCreateDeviceId();
    setDeviceId(id);
  }, []);

  // Preload user subdomains in the background when component mounts
  useEffect(() => {
    if (deviceId && initialLoading) {
      startTransition(() => {
        const formData = new FormData();
        formData.append('deviceId', deviceId);
        action(formData);
      });
    }
  }, [deviceId, initialLoading, action]);

  // Update subdomains when action completes
  useEffect(() => {
    if (state.success && state.subdomains) {
      setSubdomains(state.subdomains);
      setInitialLoading(false);
    }
  }, [state]);

  const filteredSubdomains = subdomains.filter(subdomain =>
    subdomain.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subdomain.title && subdomain.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubdomainDelete = () => {
    // Refresh the subdomain list after deletion
    if (deviceId) {
      startTransition(() => {
        const formData = new FormData();
        formData.append('deviceId', deviceId);
        action(formData);
      });
    }
  };

  // Get theme-specific modal styling
  const getModalStyling = () => {
    switch (theme) {
      case 'light':
        return {
          background: 'bg-white',
          labelColor: 'text-black'
        };
      case 'color':
        return {
          background: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500',
          labelColor: 'text-white'
        };
      case 'dark':
      default:
        return {
          background: 'bg-black',
          labelColor: 'text-white'
        };
    }
  };

  const modalStyling = getModalStyling();

  // Get secondary button class for consistent styling
  const getSecondaryButtonClass = () => {
    if (secondaryButtonClass) return secondaryButtonClass;
    
    switch (theme) {
      case 'light':
        return 'btn-secondary-light';
      case 'color':
        return 'btn-secondary-color';
      case 'dark':
      default:
        return 'btn-secondary-dark';
    }
  };

  const buttonClass = getSecondaryButtonClass();

  // Get theme-specific container styling for cards grid
  const getContainerStyling = () => {
    switch (theme) {
      case 'light':
        return 'bg-gray-50/50';
      case 'color':
        return '';
      case 'dark':
      default:
        return '';
    }
  };

  const containerStyling = getContainerStyling();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={buttonClass}
        >
          <Crown className="w-4 h-4 mr-2" />
          Admin
        </Button>
      </DialogTrigger>
      <DialogContent className={`modal-mobile-container ${modalStyling.background}`}>
        {/* Header */}
        <div className="modal-mobile-header">
          <DialogTitle className={`text-xl font-bold ${modalStyling.labelColor}`}>Admin</DialogTitle>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={buttonClass}
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </DialogClose>
        </div>

        {/* Scrollable Content Area */}
        <div className="modal-mobile-main">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            {initialLoading && subdomains.length === 0 ? (
              <div className={`text-center ${modalStyling.labelColor}`}>
                Loading your subdomains...
              </div>
            ) : (
              <div className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <Input
                    placeholder="Search your subdomains..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`max-w-md ${
                      theme === 'light' 
                        ? 'bg-white border-gray-300 text-black' 
                        : theme === 'color'
                        ? 'bg-white/10 border-white/30 text-white placeholder:text-white/60'
                        : 'bg-white/20 border-white/30 text-white'
                    }`}
                  />
                  <p className={`text-sm ${modalStyling.labelColor} opacity-70`}>
                    Showing {filteredSubdomains.length} of {subdomains.length} subdomains
                  </p>
                </div>

                {/* Subdomains List */}
                <div className={`space-y-4 ${containerStyling}`}>
                  {filteredSubdomains.length === 0 ? (
                    <Card className={theme === 'light' ? 'bg-white border-gray-300' : theme === 'color' ? 'bg-white/10 border-white/20' : 'bg-white/10 border-white/20'}>
                      <CardContent className="p-6 text-center">
                        <p className={modalStyling.labelColor}>
                          {searchTerm ? 'No subdomains match your search.' : 'You haven\'t created any subdomains yet.'}
                        </p>
                        {!searchTerm && (
                          <p className={`text-sm ${modalStyling.labelColor} opacity-60 mt-2`}>
                            Create your first subdomain from the main page!
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {filteredSubdomains.map((subdomain) => (
                        <SubdomainCard 
                          key={subdomain.subdomain} 
                          subdomain={subdomain}
                          onDelete={handleSubdomainDelete}
                          theme={theme}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 