'use client';

import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { protocol, rootDomain } from '@/lib/utils';
import { useFrameContext } from '@/components/frame-provider';
import { sdk } from '@farcaster/frame-sdk';

interface HomeShareButtonProps {
  secondaryButtonClass?: string;
}

export function HomeShareButton({ secondaryButtonClass = '' }: HomeShareButtonProps) {
  const { frameContext, isInFrame } = useFrameContext();

  const handleShare = async () => {
    try {
      const url = `${protocol}://${rootDomain}`;
      const shareText = `Create your own custom subdomain on ${rootDomain}`;
      
      if (isInFrame && frameContext) {
        // Use Farcaster composeCast action when in frame context
        try {
          const result = await sdk.actions.composeCast({
            text: shareText,
            embeds: [url]
          });
          
          if (result?.cast) {
            console.log('Cast created successfully:', result.cast.hash);
            if (result.cast.channelKey) {
              console.log('Posted to channel:', result.cast.channelKey);
            }
          } else {
            console.log('User cancelled the cast');
          }
          return;
        } catch (error) {
          console.error('Error creating cast:', error);
          // Fall through to other sharing methods
        }
      }
      
      // Try native share API first (for mobile devices)
      if (navigator.share) {
        await navigator.share({
          title: rootDomain,
          text: shareText,
          url: url,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Final fallback: copy to clipboard
      try {
        const url = `${protocol}://${rootDomain}`;
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Clipboard access failed:', clipboardError);
      }
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size="sm"
      className={secondaryButtonClass || 'shadow-lg cursor-pointer'}
    >
      <Share2 className="w-4 h-4 mr-2" />
      Share
    </Button>
  );
} 