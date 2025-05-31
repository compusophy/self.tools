import { ethers } from 'ethers';
import { FarcasterJFS } from '../../../lib/farcaster-jfs';
import { redis } from '../../../lib/redis';

// Constants for Farcaster verification
const CUSTODY_PRIVATE_KEY = process.env.CUSTODY_PRIVATE_KEY!;
const FID = 527379;
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
const MANIFEST_DOMAIN = 'self.tools'; // Hardcoded for manifest generation

interface AccountAssociation {
  header: string;
  payload: string;
  signature: string;
}

function getSignatureKey(subdomain: string): string {
  return `signatures/${subdomain}`;
}

function getBaseSignatureKey(): string {
  return `signatures/base-domain`;
}

export async function GET(request: Request) {
  const host = request.headers.get('host') || ROOT_DOMAIN;
  const protocol = host.includes('localhost') ? 'http' : 'https';
  
  // Parse subdomain and base domain correctly
  let subdomain = '';
  let baseDomain = ROOT_DOMAIN;
  
  if (host.includes('localhost')) {
    // For localhost: subdomain.localhost:3000
    const parts = host.split('.');
    if (parts.length > 1) {
      subdomain = parts[0];
      baseDomain = parts.slice(1).join('.');
    } else {
      baseDomain = host;
    }
  } else {
    // For production: subdomain.yourdomain.com
    const parts = host.split('.');
    if (parts.length > 2) {
      subdomain = parts[0];
      baseDomain = parts.slice(1).join('.');
    } else {
      baseDomain = host;
    }
  }

  const baseUrl = `${protocol}://${baseDomain}`;
  const subdomainUrl = subdomain ? `${protocol}://${subdomain}.${baseDomain}` : baseUrl;

  let accountAssociation: AccountAssociation | null = null;

  try {
    if (subdomain) {
      // Check Redis for existing signature
      const existingSignature = await redis.get<AccountAssociation>(getSignatureKey(subdomain));

      if (existingSignature) {
        accountAssociation = existingSignature;
      } else {
        // Generate and store new signature
        // For JFS, use hardcoded domain without protocol
        const signer = new ethers.Wallet(CUSTODY_PRIVATE_KEY);
        const custodyAddress = await signer.getAddress();
        const jfsDomain = `${subdomain}.${MANIFEST_DOMAIN}`;
        const newSignature = await FarcasterJFS.sign(
          FID,
          custodyAddress,
          { domain: jfsDomain },
          signer
        );
        
        await redis.set(getSignatureKey(subdomain), newSignature);
        accountAssociation = newSignature;
      }
    } else {
      // Handle base domain - generate proper signature for root domain
      const existingBaseSignature = await redis.get<AccountAssociation>(getBaseSignatureKey());

      if (existingBaseSignature) {
        accountAssociation = existingBaseSignature;
      } else {
        // Generate and store new signature for base domain
        const signer = new ethers.Wallet(CUSTODY_PRIVATE_KEY);
        const custodyAddress = await signer.getAddress();
        const jfsDomain = MANIFEST_DOMAIN; // Just use the base domain
        const newBaseSignature = await FarcasterJFS.sign(
          FID,
          custodyAddress,
          { domain: jfsDomain },
          signer
        );
        
        await redis.set(getBaseSignatureKey(), newBaseSignature);
        accountAssociation = newBaseSignature;
      }
    }
  } catch (err) {
    console.error("Error with signature:", err);
    // Fallback to empty association if signature generation fails
    accountAssociation = {
      header: "",
      payload: "",
      signature: ""
    };
  }

  const config = {
    ...(accountAssociation
      ? { accountAssociation }
      : {
          accountAssociation: {
            header: "",
            payload: "",
            signature: ""
          }
        }
    ),

    frame: {
      version: "1",
      name: subdomain ? `${subdomain}.${baseDomain}` : baseDomain,
      iconUrl: subdomain 
        ? `${subdomainUrl}/icon.png`
        : `${baseUrl}/icon.png`,
      homeUrl: subdomain
        ? subdomainUrl
        : baseUrl,
      imageUrl: subdomain
        ? `${subdomainUrl}/opengraph-image.png`
        : `${baseUrl}/opengraph-image.png`,
      buttonTitle: "launch",
      splashImageUrl: subdomain
        ? `${subdomainUrl}/icon.png`
        : `${baseUrl}/icon.png`,
      splashBackgroundColor: "#000000",
      webhookUrl: subdomain 
        ? `${subdomainUrl}/api/webhook`
        : `${baseUrl}/api/webhook`,
      url: subdomain
        ? subdomainUrl
        : baseUrl
    }
  };

  console.log('Serving frame config:', {
    host,
    subdomain,
    baseDomain,
    baseUrl,
    subdomainUrl,
    jfsDomain: subdomain ? `${subdomain}.${MANIFEST_DOMAIN}` : MANIFEST_DOMAIN,
    iconUrl: config.frame.iconUrl,
    splashImageUrl: config.frame.splashImageUrl,
    webhookUrl: config.frame.webhookUrl,
    homeUrl: config.frame.homeUrl,
    url: config.frame.url,
    hasValidAssociation: !!(accountAssociation?.signature)
  });

  return Response.json(config);
} 