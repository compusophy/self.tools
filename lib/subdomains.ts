import { redis } from '@/lib/redis';

export type SubdomainData = {
  createdAt: number;
  createdBy: string; // Device UUID of creator
  content: {
    title: string;
    description: string;
    body: string;
    theme: 'dark' | 'light' | 'color';
    lastModified: number;
  };
  settings: {
    allowEditing: boolean;
    isPublished: boolean;
  };
};

export type SubdomainContent = SubdomainData['content'];

const DEFAULT_CONTENT: SubdomainContent = {
  title: '',
  description: 'Ready to customize.',
  body: ``,
  theme: 'dark',
  lastModified: Date.now()
};

const DEFAULT_SETTINGS = {
  allowEditing: true,
  isPublished: true
};

export async function getSubdomainData(subdomain: string): Promise<SubdomainData | null> {
  const sanitizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const data = await redis.get<SubdomainData>(
    `subdomain:${sanitizedSubdomain}`
  );
  return data;
}

export async function getSubdomainContent(subdomain: string): Promise<SubdomainContent | null> {
  const data = await getSubdomainData(subdomain);
  return data?.content || null;
}

export async function createSubdomain(subdomain: string, creatorDeviceId: string, initialTheme: 'dark' | 'light' | 'color' = 'dark'): Promise<boolean> {
  const sanitizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
  
  const exists = await redis.get(`subdomain:${sanitizedSubdomain}`);
  if (exists) {
    return false;
  }

  const newSubdomainData: SubdomainData = {
    createdAt: Date.now(),
    createdBy: creatorDeviceId,
    content: {
      ...DEFAULT_CONTENT,
      title: sanitizedSubdomain,
      theme: initialTheme
    },
    settings: DEFAULT_SETTINGS
  };

  await redis.set(`subdomain:${sanitizedSubdomain}`, newSubdomainData);
  return true;
}

// Helper function to check if we're in an iframe context on the client
function isClientInIframe(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch (e) {
    return true; // If we can't access window.top, we're likely in an iframe
  }
}

export async function updateSubdomainContent(
  subdomain: string, 
  content: Partial<SubdomainContent>,
  userDeviceId: string
): Promise<boolean> {
  const sanitizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const existing = await getSubdomainData(sanitizedSubdomain);
  
  if (!existing) {
    return false;
  }

  // Check if user is the creator
  if (existing.createdBy !== userDeviceId) {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isRecentlyCreated = Date.now() - existing.createdAt < 60 * 60 * 1000; // 1 hour
    
    // More permissive authorization for development environment
    if (isDevelopment && isRecentlyCreated) {
      console.log('Auto-claiming ownership for development environment:', sanitizedSubdomain);
      // Update the creator to current device ID
      const updatedData: SubdomainData = {
        ...existing,
        createdBy: userDeviceId,
        content: {
          ...existing.content,
          ...content,
          lastModified: Date.now()
        }
      };
      
      await redis.set(`subdomain:${sanitizedSubdomain}`, updatedData);
      return true;
    }
    
    // Additional relaxed authorization for iframe contexts in development
    // This helps when device IDs are unreliable due to iframe storage restrictions
    if (isDevelopment) {
      // Check if this might be an iframe context by looking at recent creation
      // and allowing editing of very recent subdomains (within 10 minutes)
      const isVeryRecentlyCreated = Date.now() - existing.createdAt < 10 * 60 * 1000; // 10 minutes
      
      if (isVeryRecentlyCreated) {
        console.log('Allowing iframe edit for very recent subdomain:', sanitizedSubdomain);
        // Update the creator to current device ID for consistency
        const updatedData: SubdomainData = {
          ...existing,
          createdBy: userDeviceId,
          content: {
            ...existing.content,
            ...content,
            lastModified: Date.now()
          }
        };
        
        await redis.set(`subdomain:${sanitizedSubdomain}`, updatedData);
        return true;
      }
    }
    
    return false; // Unauthorized
  }

  const updatedData: SubdomainData = {
    ...existing,
    content: {
      ...existing.content,
      ...content,
      lastModified: Date.now()
    }
  };

  await redis.set(`subdomain:${sanitizedSubdomain}`, updatedData);
  return true;
}

// New function to manually claim ownership of a subdomain
export async function claimSubdomainOwnership(subdomain: string, userDeviceId: string): Promise<boolean> {
  const sanitizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const existing = await getSubdomainData(sanitizedSubdomain);
  
  if (!existing) {
    return false;
  }

  // Only allow claiming in development environment
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (!isDevelopment) {
    return false;
  }

  console.log('Manually claiming subdomain ownership:', sanitizedSubdomain);

  const updatedData: SubdomainData = {
    ...existing,
    createdBy: userDeviceId
  };

  await redis.set(`subdomain:${sanitizedSubdomain}`, updatedData);
  return true;
}

export async function getAllSubdomains() {
  const keys = await redis.keys('subdomain:*');
  const subdomains = await Promise.all(
    keys.map(async (key) => {
      const data = await redis.get<SubdomainData>(key);
      if (!data) return null;
      return {
        subdomain: key.replace('subdomain:', ''),
        title: data.content.title,
        description: data.content.description,
        body: data.content.body,
        theme: data.content.theme,
        createdAt: data.createdAt,
        createdBy: data.createdBy,
        isPublished: data.settings.isPublished
      };
    })
  );
  return subdomains.filter(Boolean).sort((a, b) => b!.createdAt - a!.createdAt) as NonNullable<typeof subdomains[0]>[];
}

export async function getUserSubdomains(userDeviceId: string) {
  const keys = await redis.keys('subdomain:*');
  const subdomains = await Promise.all(
    keys.map(async (key) => {
      const data = await redis.get<SubdomainData>(key);
      if (!data || data.createdBy !== userDeviceId) return null;
      return {
        subdomain: key.replace('subdomain:', ''),
        title: data.content.title,
        description: data.content.description,
        body: data.content.body,
        theme: data.content.theme,
        createdAt: data.createdAt,
        createdBy: data.createdBy,
        isPublished: data.settings.isPublished
      };
    })
  );
  return subdomains.filter(Boolean).sort((a, b) => a!.subdomain.localeCompare(b!.subdomain)) as NonNullable<typeof subdomains[0]>[];
}

export async function deleteSubdomain(subdomain: string, userDeviceId: string): Promise<boolean> {
  const sanitizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const existing = await getSubdomainData(sanitizedSubdomain);
  
  if (!existing) {
    return false;
  }

  // Check if user is the creator
  if (existing.createdBy !== userDeviceId) {
    return false; // Unauthorized
  }

  await redis.del(`subdomain:${sanitizedSubdomain}`);
  return true;
}

export async function canUserModifySubdomain(subdomain: string, userDeviceId: string): Promise<boolean> {
  const data = await getSubdomainData(subdomain);
  return data ? data.createdBy === userDeviceId : false;
}

// SDK Functions for easy content management
export const SubdomainSDK = {
  async get(subdomain: string) {
    return await getSubdomainData(subdomain);
  },
  
  async updateContent(subdomain: string, content: Partial<SubdomainContent>, userDeviceId: string) {
    return await updateSubdomainContent(subdomain, content, userDeviceId);
  },
  
  async setTitle(subdomain: string, title: string, userDeviceId: string) {
    return await updateSubdomainContent(subdomain, { title }, userDeviceId);
  },
  
  async setDescription(subdomain: string, description: string, userDeviceId: string) {
    return await updateSubdomainContent(subdomain, { description }, userDeviceId);
  },
  
  async setBody(subdomain: string, body: string, userDeviceId: string) {
    return await updateSubdomainContent(subdomain, { body }, userDeviceId);
  },
  
  async setTheme(subdomain: string, theme: SubdomainContent['theme'], userDeviceId: string) {
    return await updateSubdomainContent(subdomain, { theme }, userDeviceId);
  },

  async canModify(subdomain: string, userDeviceId: string) {
    return await canUserModifySubdomain(subdomain, userDeviceId);
  },

  async claimOwnership(subdomain: string, userDeviceId: string) {
    return await claimSubdomainOwnership(subdomain, userDeviceId);
  }
};
