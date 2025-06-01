'use client';

import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { protocol, rootDomain } from '@/lib/utils';

export function HomeShareButton() {
  const handleShare = async () => {
    try {
      const url = `${protocol}://${rootDomain}`;
      // Share the main site
      if (navigator.share) {
        await navigator.share({
          title: rootDomain,
          text: 'Create your own custom subdomain',
          url: url,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <Button
      onClick={handleShare}
      size="sm"
      className="shadow-lg cursor-pointer bg-white text-black hover:bg-gray-200"
    >
      <Share2 className="w-4 h-4 mr-2" />
      Share
    </Button>
  );
} 