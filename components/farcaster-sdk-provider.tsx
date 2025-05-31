'use client';

import { useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';

export default function FarcasterSDKProvider() {
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        await sdk.actions.ready();
      } catch (error) {
        console.log('SDK initialization failed (likely not in frame context):', error);
      }
    };

    initializeSDK();
  }, []);

  return null;
} 