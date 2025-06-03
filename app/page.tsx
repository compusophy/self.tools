import Link from 'next/link';
import type { Metadata } from 'next';
import { SubdomainForm } from './subdomain-form';
import { protocol, rootDomain } from '@/lib/utils';
import { FrameProvider } from '@/components/frame-provider';
import { Button } from '@/components/ui/button';
import { Settings, Share2, Key } from 'lucide-react';
import { LayoutHeader } from '@/components/layout-header';
import { LayoutFooter } from '@/components/layout-footer';
import { HomeShareButton } from '@/components/home-share-button';
import { HomeSettings } from '@/components/home-settings';
import { DynamicHomePage } from '@/components/dynamic-home-page';

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
  return (
    <FrameProvider>
      <DynamicHomePage />
    </FrameProvider>
  );
}
