import Link from 'next/link';
import type { Metadata } from 'next';
import { SubdomainForm } from './subdomain-form';
import { protocol, rootDomain } from '@/lib/utils';
import { FrameProvider } from '@/components/frame-provider';
import { Button } from '@/components/ui/button';
import { Settings, Share2 } from 'lucide-react';
import { LayoutHeader } from '@/components/layout-header';
import { LayoutFooter } from '@/components/layout-footer';
import { HomeShareButton } from '@/components/home-share-button';

export async function generateMetadata(): Promise<Metadata> {
  const frameData = {
    version: "next",
    imageUrl: `${protocol}://${rootDomain}/opengraph-image`,
    button: {
      title: "launch",
      action: {
        type: "launch_frame",
        name: rootDomain,
        url: `${protocol}://${rootDomain}/`,
        splashImageUrl: `${protocol}://${rootDomain}/api/icon`,
        splashBackgroundColor: "#000000",
      },
    },
  };

  return {
    title: rootDomain,
    description: `Create your own custom subdomain on ${rootDomain}`,
    openGraph: {
      title: rootDomain,
      description: `Create your own custom subdomain on ${rootDomain}`,
      images: [`${protocol}://${rootDomain}/opengraph-image`],
    },
    other: {
      "fc:frame": JSON.stringify(frameData),
    },
  };
}

export default async function HomePage() {
  // Use the same theme system as subdomain pages - default 'dark' theme
  const themeStyles = {
    container: 'bg-black text-white min-h-screen',
    header: { textPrimary: 'text-white', textSecondary: 'text-gray-400', background: 'bg-black' },
    footer: { background: 'bg-black' },
    borderColor: 'border-white/20'
  };

  return (
    <FrameProvider>
      <div className={`flex flex-col ${themeStyles.container}`}>
        {/* Header */}
        <LayoutHeader 
          showSourceButton={true} 
          showAdminButton={true}
          theme={themeStyles.header}
          variant="themed"
          borderColor={themeStyles.borderColor}
        />

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center py-16">
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
                  <SubdomainForm />
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <LayoutFooter variant="themed" theme={themeStyles.footer} borderColor={themeStyles.borderColor}>
          <HomeShareButton />
        </LayoutFooter>
      </div>
    </FrameProvider>
  );
}
