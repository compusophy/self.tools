'use client';

import { useState, useEffect } from 'react';
import { LayoutHeader } from '@/components/layout-header';
import { LayoutFooter } from '@/components/layout-footer';
import { HomeShareButton } from '@/components/home-share-button';
import { HomeSettings } from '@/components/home-settings';
import { AdminModal } from '@/components/admin-modal';
import { SubdomainForm } from '@/app/subdomain-form';
import { rootDomain } from '@/lib/utils';
import { getHomeTheme, getOrCreateDeviceId } from '@/lib/user';

export function DynamicHomePage() {
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light' | 'color'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Initialize device ID and get theme
    getOrCreateDeviceId();
    const theme = getHomeTheme();
    setCurrentTheme(theme);
    setMounted(true);
  }, []);

  // Use the exact same theme styles as subdomain pages
  const getThemeStyles = (theme: 'dark' | 'light' | 'color') => {
    switch (theme) {
      case 'light':
        return {
          container: 'bg-white text-black min-h-screen',
          header: { textPrimary: 'text-black', textSecondary: 'text-gray-600', background: 'bg-white' },
          footer: { background: 'bg-white' }
        };
      case 'color':
        return {
          container: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white min-h-screen',
          header: { textPrimary: 'text-white', textSecondary: 'text-white/70', background: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500' },
          footer: { background: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500' }
        };
      case 'dark':
      default:
        return {
          container: 'bg-black text-white min-h-screen',
          header: { textPrimary: 'text-white', textSecondary: 'text-gray-400', background: 'bg-black' },
          footer: { background: 'bg-black' }
        };
    }
  };

  // Get unified secondary button class
  const getSecondaryButtonClass = (theme: 'dark' | 'light' | 'color') => {
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

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    // Return default dark theme during SSR
    const themeStyles = getThemeStyles('dark');
    const secondaryButtonClass = getSecondaryButtonClass('dark');
    
    return (
      <div className={`mobile-layout-container ${themeStyles.container.replace('min-h-screen', '')}`}>
        {/* Header */}
        <div className="mobile-layout-header">
          <LayoutHeader 
            showSourceButton={true} 
            showEditButton={true}
            editButton={<HomeSettings currentTheme="dark" />}
            theme={themeStyles.header}
            variant="themed"
            secondaryButtonClass={secondaryButtonClass}
          />
        </div>

        {/* Main Content */}
        <main className="mobile-layout-main flex items-center justify-center">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex justify-center">
              <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                  <h1 className="text-4xl font-bold tracking-tight text-white">
                    {rootDomain}
                  </h1>
                  <p className="mt-3 text-lg text-gray-300">
                    Create your own custom subdomain
                  </p>
                </div>

                <div className="bg-white/10 shadow-md rounded-none p-4 border border-white/20">
                  <SubdomainForm theme="dark" />
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <div className="mobile-layout-footer">
          <LayoutFooter variant="themed" theme={themeStyles.footer}>
            <div className="flex items-center justify-between w-full">
              <HomeShareButton secondaryButtonClass={secondaryButtonClass} />
              <AdminModal theme="dark" secondaryButtonClass={secondaryButtonClass} />
            </div>
          </LayoutFooter>
        </div>
      </div>
    );
  }

  const themeStyles = getThemeStyles(currentTheme);
  const secondaryButtonClass = getSecondaryButtonClass(currentTheme);

  return (
    <div className={`mobile-layout-container ${themeStyles.container.replace('min-h-screen', '')}`}>
      {/* Header */}
      <div className="mobile-layout-header">
        <LayoutHeader 
          showSourceButton={true} 
          showEditButton={true}
          editButton={<HomeSettings currentTheme={currentTheme} secondaryButtonClass={secondaryButtonClass} />}
          theme={themeStyles.header}
          variant="themed"
          secondaryButtonClass={secondaryButtonClass}
        />
      </div>

      {/* Main Content */}
      <main className="mobile-layout-main flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-center">
            <div className="w-full max-w-md space-y-8">
              <div className="text-center">
                <h1 className={`text-4xl font-bold tracking-tight ${currentTheme === 'light' ? 'text-black' : 'text-white'}`}>
                  {rootDomain}
                </h1>
                <p className={`mt-3 text-lg ${currentTheme === 'light' ? 'text-gray-600' : currentTheme === 'color' ? 'text-white/80' : 'text-gray-300'}`}>
                  Create your own custom subdomain
                </p>
              </div>

              <div className={`shadow-md rounded-none p-4 border ${currentTheme === 'light' ? 'bg-gray-100 border-gray-300' : currentTheme === 'color' ? 'bg-white/10 border-white/20' : 'bg-white/10 border-white/20'}`}>
                <SubdomainForm theme={currentTheme} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="mobile-layout-footer">
        <LayoutFooter variant="themed" theme={themeStyles.footer}>
          <div className="flex items-center justify-between w-full">
            <HomeShareButton secondaryButtonClass={secondaryButtonClass} />
            <AdminModal theme={currentTheme} secondaryButtonClass={secondaryButtonClass} />
          </div>
        </LayoutFooter>
      </div>
    </div>
  );
} 