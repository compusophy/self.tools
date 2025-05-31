'use client';

import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useFrameContext } from '@/components/frame-provider';

interface ShareButtonProps {
  subdomain: string;
  className?: string;
}

export function ShareButton({ subdomain, className }: ShareButtonProps) {
  const { shareToWarpcast, isInFrame } = useFrameContext();

  const handleShare = async () => {
    try {
      await shareToWarpcast(subdomain);
    } catch (error) {
      console.error('Error sharing to Warpcast:', error);
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size="sm"
      className={className}
    >
      <Share2 className="w-4 h-4 mr-2" />
      Share
    </Button>
  );
} 