'use client';

import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { sdk } from '@farcaster/frame-sdk';

interface FrameContextType {
  frameContext: any;
  isInFrame: boolean;
  shareToWarpcast: (subdomain: string) => Promise<void>;
  viewProfile: (fid: number) => Promise<void>;
}

const FrameContext = createContext<FrameContextType | undefined>(undefined);

export function useFrameContext() {
  const context = useContext(FrameContext);
  if (context === undefined) {
    throw new Error('useFrameContext must be used within a FrameProvider');
  }
  return context;
}

interface FrameProviderProps {
  children: ReactNode;
  subdomain?: string;
}

export function FrameProvider({ children, subdomain }: FrameProviderProps) {
  const [frameContext, setFrameContext] = useState<any>(null);
  const [isInFrame, setIsInFrame] = useState(false);

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        const context = await sdk.context;
        setFrameContext(context);
        setIsInFrame(true);
        sdk.actions.ready();
        console.log('Frame context initialized:', context);
      } catch (e) {
        console.log('Not in a Frame context');
        setIsInFrame(false);
      }
    };

    initializeSDK();
  }, []);

  useEffect(() => {
    // Handle share button clicks from iframe messages
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === 'shareToWarpcast') {
        console.log('Frame context:', frameContext);
        console.log('Fallback URL:', event.data.fallbackUrl);
        
        if (frameContext) {
          // In Frame context, use SDK composeCast action
          const shareText = `check out this frame ${event.data.page}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'self.tools'}`;
          const shareUrl = `https://${event.data.page}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'self.tools'}`;
          
          try {
            const result = await sdk.actions.composeCast({
              text: shareText,
              embeds: [shareUrl]
            });
            
            if (result?.cast) {
              console.log('Cast created successfully:', result.cast.hash);
            } else {
              console.log('User cancelled the cast');
            }
          } catch (error) {
            console.error('Error creating cast with SDK:', error);
            // Fallback to opening warpcast URL
            const warpcastShareText = encodeURIComponent(shareText);
            const warpcastShareUrl = encodeURIComponent(shareUrl);
            const warpcastUrl = `https://warpcast.com/~/compose?text=${warpcastShareText}&embeds[]=${warpcastShareUrl}`;
            window.open(warpcastUrl, '_blank', 'noopener,noreferrer');
          }
        } else {
          // Not in Frame context, redirect to fallback URL
          window.open(event.data.fallbackUrl, '_blank', 'noopener,noreferrer');
        }
      } else if (event.data.type === 'viewProfile') {
        if (frameContext) {
          // In Frame context, use SDK
          await sdk.actions.viewProfile({ fid: event.data.fid });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [frameContext]);

  const shareToWarpcast = async (subdomainToShare: string) => {
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'self.tools';
    
    if (frameContext) {
      // In Frame context, use SDK composeCast action
      const shareText = `check out this frame ${subdomainToShare}.${rootDomain}`;
      const shareUrl = `https://${subdomainToShare}.${rootDomain}`;
      
      try {
        const result = await sdk.actions.composeCast({
          text: shareText,
          embeds: [shareUrl]
        });
        
        if (result?.cast) {
          console.log('Cast created successfully:', result.cast.hash);
          if (result.cast.channelKey) {
            console.log('Posted to channel:', result.cast.channelKey);
          }
        } else {
          console.log('User cancelled the cast');
        }
      } catch (error) {
        console.error('Error creating cast with SDK:', error);
        // Fallback to opening warpcast URL if composeCast fails
        const shareTextEncoded = encodeURIComponent(shareText);
        const shareUrlEncoded = encodeURIComponent(shareUrl);
        const warpcastUrl = `https://warpcast.com/~/compose?text=${shareTextEncoded}&embeds[]=${shareUrlEncoded}`;
        window.open(warpcastUrl, '_blank', 'noopener,noreferrer');
      }
    } else {
      // Not in Frame context, open warpcast in new window
      const shareText = `check out this frame ${subdomainToShare}.${rootDomain}`;
      const shareUrl = `https://${subdomainToShare}.${rootDomain}`;
      const shareTextEncoded = encodeURIComponent(shareText);
      const shareUrlEncoded = encodeURIComponent(shareUrl);
      const warpcastUrl = `https://warpcast.com/~/compose?text=${shareTextEncoded}&embeds[]=${shareUrlEncoded}`;
      window.open(warpcastUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const viewProfile = async (fid: number) => {
    if (frameContext) {
      await sdk.actions.viewProfile({ fid });
    }
  };

  const contextValue: FrameContextType = {
    frameContext,
    isInFrame,
    shareToWarpcast,
    viewProfile,
  };

  return (
    <FrameContext.Provider value={contextValue}>
      {children}
    </FrameContext.Provider>
  );
} 