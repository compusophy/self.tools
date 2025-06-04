import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSubdomainData } from '@/lib/subdomains';
import { protocol, rootDomain } from '@/lib/utils';
import { SubdomainEditor } from '@/components/subdomain-editor';
import { FrameProvider } from '@/components/frame-provider';
import { ShareButton } from '@/components/share-button';
import { LayoutHeader } from '@/components/layout-header';
import { LayoutFooter } from '@/components/layout-footer';
import { AdminModal } from '@/components/admin-modal';

export async function generateMetadata({
  params
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const subdomainData = await getSubdomainData(subdomain);

  if (!subdomainData) {
    const frameData = {
      version: "next",
      imageUrl: `${protocol}://${rootDomain}/opengraph-image?subdomain=${subdomain}`,
      button: {
        title: "launch",
        action: {
          type: "launch_frame",
          name: `${subdomain}.${rootDomain}`,
          url: `${protocol}://${subdomain}.${rootDomain}/`,
          splashImageUrl: `${protocol}://${subdomain}.${rootDomain}/api/icon`,
          splashBackgroundColor: "#000000",
        },
      },
    };

    return {
      title: `${subdomain}.${rootDomain}`,
      description: `Subdomain page for ${subdomain}.${rootDomain}`,
      openGraph: {
        title: `${subdomain}.${rootDomain}`,
        description: `${subdomain}'s frame on ${rootDomain}`,
        images: [`${protocol}://${rootDomain}/opengraph-image?subdomain=${subdomain}`],
      },
      other: {
        "fc:frame": JSON.stringify(frameData),
      },
    };
  }

  const frameData = {
    version: "next",
    imageUrl: `${protocol}://${rootDomain}/opengraph-image?subdomain=${subdomain}`,
    button: {
      title: "launch",
      action: {
        type: "launch_frame",
        name: `${subdomain}.${rootDomain}`,
        url: `${protocol}://${subdomain}.${rootDomain}/`,
        splashImageUrl: `${protocol}://${subdomain}.${rootDomain}/api/icon`,
        splashBackgroundColor: "#000000",
      },
    },
  };

  return {
    title: `${subdomainData.content.title} | ${subdomain}.${rootDomain}`,
    description: subdomainData.content.description,
    openGraph: {
      title: `${subdomainData.content.title} | ${subdomain}.${rootDomain}`,
      description: subdomainData.content.description,
      images: [`${protocol}://${rootDomain}/opengraph-image?subdomain=${subdomain}`],
    },
    other: {
      "fc:frame": JSON.stringify(frameData),
    },
  };
}

// Simple markdown to HTML converter for server-side rendering
function renderMarkdown(text: string): string {
  return text
    .replace(/^# (.*$)/gm, '<h1 class="text-4xl font-bold mb-6 text-foreground">$1</h1>')
    .replace(/^## (.*$)/gm, '<h2 class="text-3xl font-bold mb-4 text-foreground">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-2xl font-bold mb-3 text-foreground">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-muted-foreground">$1</em>')
    .replace(/^\- (.*$)/gm, '<li class="ml-6 mb-2 list-disc text-muted-foreground">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-4 text-muted-foreground">')
    .replace(/\n/g, '<br>');
}

export default async function SubdomainPage({
  params
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const subdomainData = await getSubdomainData(subdomain);

  if (!subdomainData) {
    notFound();
  }

  const processedBody = renderMarkdown(subdomainData.content.body);

  // Get theme styles
  const getThemeStyles = (theme: string) => {
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

  const themeStyles = getThemeStyles(subdomainData.content.theme);
  
  // Custom class for light theme to fix button hover text
  const lightThemeButtonClass = subdomainData.content.theme === 'light' ? 'light-theme-button' : '';
  
  // Get unified secondary button class
  const getSecondaryButtonClass = (theme: string) => {
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
  
  const secondaryButtonClass = getSecondaryButtonClass(subdomainData.content.theme);

  return (
    <FrameProvider subdomain={subdomain}>
      <div className={`mobile-layout-container ${themeStyles.container.replace('min-h-screen', '')}`}>
        {/* Header */}
        <div className="mobile-layout-header">
          <LayoutHeader 
            showHomeLink={true}
            homeButtonStyle="button"
            showEditButton={subdomainData.settings.allowEditing}
            editButton={<SubdomainEditor subdomain={subdomain} data={subdomainData} theme={subdomainData.content.theme} themeStyles={themeStyles} lightThemeButtonClass={lightThemeButtonClass} secondaryButtonClass={secondaryButtonClass} />}
            theme={themeStyles.header}
            variant="themed"
            secondaryButtonClass={secondaryButtonClass}
          />
        </div>

        {/* Main Content */}
        <main className="mobile-layout-main flex items-center justify-center">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex justify-center">
              <div className="w-full max-w-4xl space-y-8">
                {/* Header Section */}
                <div className="text-center">
                  <h1 className={`text-5xl font-bold mb-6 ${subdomainData.content.theme === 'light' ? 'text-black' : 'text-white'}`}>
                    {subdomainData.content.title}
                  </h1>
                  <p className={`text-xl max-w-2xl mx-auto ${subdomainData.content.theme === 'light' ? 'text-gray-600' : subdomainData.content.theme === 'color' ? 'text-white/80' : 'text-gray-300'}`}>
                    {subdomainData.content.description}
                  </p>
                </div>

                {/* Body Content */}
                <div className="text-center">
                  <div 
                    className={`${subdomainData.content.theme === 'light' ? 'text-gray-700' : subdomainData.content.theme === 'color' ? 'text-white/90' : 'text-gray-300'}`}
                    dangerouslySetInnerHTML={{ __html: processedBody }}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <div className="mobile-layout-footer">
          <LayoutFooter variant="themed" theme={themeStyles.footer}>
            <div className="flex items-center justify-between w-full">
              <ShareButton subdomain={subdomain} lightThemeButtonClass={lightThemeButtonClass} secondaryButtonClass={secondaryButtonClass} />
              <AdminModal theme={subdomainData.content.theme} secondaryButtonClass={secondaryButtonClass} />
            </div>
          </LayoutFooter>
        </div>
      </div>
    </FrameProvider>
  );
}
