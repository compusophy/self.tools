import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSubdomainData } from '@/lib/subdomains';
import { protocol, rootDomain } from '@/lib/utils';
import { SubdomainEditor } from '@/components/subdomain-editor';
import { FrameProvider } from '@/components/frame-provider';
import { ShareButton } from '@/components/share-button';

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
    .replace(/^# (.*$)/gm, '<h1 class="text-4xl font-bold mb-6 text-gray-900">$1</h1>')
    .replace(/^## (.*$)/gm, '<h2 class="text-3xl font-bold mb-4 text-gray-800">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-2xl font-bold mb-3 text-gray-700">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/^\- (.*$)/gm, '<li class="ml-6 mb-2 list-disc">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/\n/g, '<br>');
}

// Theme configurations
const themeConfigs = {
  default: {
    background: 'bg-gradient-to-b from-blue-50 to-white',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-600',
    accent: 'text-blue-600'
  },
  dark: {
    background: 'bg-gradient-to-b from-gray-900 to-gray-800',
    textPrimary: 'text-white',
    textSecondary: 'text-gray-300',
    accent: 'text-blue-400'
  },
  colorful: {
    background: 'bg-gradient-to-b from-purple-50 via-pink-50 to-orange-50',
    textPrimary: 'text-purple-900',
    textSecondary: 'text-purple-700',
    accent: 'text-pink-600'
  },
  minimal: {
    background: 'bg-white',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-600',
    accent: 'text-gray-800'
  }
};

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

  const theme = themeConfigs[subdomainData.content.theme] || themeConfigs.default;
  const processedBody = renderMarkdown(subdomainData.content.body);

  return (
    <FrameProvider subdomain={subdomain}>
      <div className={`min-h-screen ${theme.background} relative`}>
        {/* Header with home link */}
        <div className="absolute top-4 left-4 z-40">
          <Link
            href={`${protocol}://${rootDomain}`}
            className={`text-sm ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}
          >
            ← {rootDomain}
          </Link>
        </div>

        {/* Edit Button - positioned in top right */}
        {subdomainData.settings.allowEditing && (
          <SubdomainEditor subdomain={subdomain} data={subdomainData} />
        )}

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className={`text-5xl font-bold mb-6 ${theme.textPrimary}`}>
                {subdomainData.content.title}
              </h1>
              <p className={`text-xl ${theme.textSecondary} max-w-2xl mx-auto`}>
                {subdomainData.content.description}
              </p>
            </div>

            {/* Body Content */}
            <div 
              className={`prose prose-lg max-w-none ${theme.textPrimary}`}
              dangerouslySetInnerHTML={{ __html: `<p class="mb-4">${processedBody}</p>` }}
            />

            {/* Footer */}
            <div className={`mt-16 pt-8 border-t border-gray-200 text-center ${theme.textSecondary}`}>
              <div className="flex justify-center mb-4">
                <ShareButton subdomain={subdomain} />
              </div>
              <p className="text-sm">
                Last updated: {new Date(subdomainData.content.lastModified).toLocaleDateString()}
              </p>
              <p className="text-xs mt-2">
                Powered by {rootDomain} • 
                <Link href={`${protocol}://${rootDomain}`} className={`ml-1 ${theme.accent} hover:underline`}>
                  Create your own subdomain
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </FrameProvider>
  );
}
