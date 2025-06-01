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
          splashImageUrl: `${protocol}://${rootDomain}/splash.png`,
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
        splashImageUrl: `${protocol}://${rootDomain}/splash.png`,
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

  return (
    <FrameProvider subdomain={subdomain}>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <LayoutHeader 
          showHomeLink={true}
          homeButtonStyle="button"
          showEditButton={subdomainData.settings.allowEditing}
          editButton={<SubdomainEditor subdomain={subdomain} data={subdomainData} />}
        />

        {/* Main Content */}
        <main className="flex-1 py-16 overflow-y-auto">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="max-w-4xl mx-auto">
              {/* Header Section */}
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold mb-6 text-foreground">
                  {subdomainData.content.title}
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  {subdomainData.content.description}
                </p>
              </div>

              {/* Body Content */}
              <div 
                className="max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: `<div class="text-muted-foreground">${processedBody}</div>` }}
              />
            </div>
          </div>
        </main>

        {/* Footer */}
        <LayoutFooter>
          <ShareButton subdomain={subdomain} />
        </LayoutFooter>
      </div>
    </FrameProvider>
  );
}
