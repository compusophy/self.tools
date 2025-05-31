import Link from 'next/link';
import type { Metadata } from 'next';
import { SubdomainForm } from './subdomain-form';
import { protocol, rootDomain } from '@/lib/utils';
import { FrameProvider } from '@/components/frame-provider';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

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
        splashImageUrl: `${protocol}://${rootDomain}/splash.png`,
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
  return (
    <FrameProvider>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 relative">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="fixed top-4 right-4 z-50 shadow-lg"
        >
          <Link href="/admin">
            <Settings className="w-4 h-4 mr-2" />
            Admin
          </Link>
        </Button>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {rootDomain}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Create your own custom subdomain
            </p>
          </div>

          <div className="mt-8 bg-card shadow-md rounded-lg p-6">
            <SubdomainForm />
          </div>
        </div>
      </div>
    </FrameProvider>
  );
}
