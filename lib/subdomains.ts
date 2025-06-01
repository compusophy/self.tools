import { redis } from '@/lib/redis';

export type SubdomainData = {
  createdAt: number;
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

export async function createSubdomain(subdomain: string): Promise<boolean> {
  const sanitizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
  
  const exists = await redis.get(`subdomain:${sanitizedSubdomain}`);
  if (exists) {
    return false;
  }

  const newSubdomainData: SubdomainData = {
    createdAt: Date.now(),
    content: {
      ...DEFAULT_CONTENT,
      title: sanitizedSubdomain
    },
    settings: DEFAULT_SETTINGS
  };

  await redis.set(`subdomain:${sanitizedSubdomain}`, newSubdomainData);
  return true;
}

export async function updateSubdomainContent(
  subdomain: string, 
  content: Partial<SubdomainContent>
): Promise<boolean> {
  const sanitizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const existing = await getSubdomainData(sanitizedSubdomain);
  
  if (!existing) {
    return false;
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

export async function getAllSubdomains() {
  const keys = await redis.keys('subdomain:*');

  if (!keys.length) {
    return [];
  }

  const values = await redis.mget<SubdomainData[]>(...keys);

  return keys.map((key: string, index: number) => {
    const subdomain = key.replace('subdomain:', '');
    const data = values[index];

    return {
      subdomain,
      createdAt: data?.createdAt || Date.now(),
      title: data?.content?.title || 'Untitled',
      description: data?.content?.description || '',
      body: data?.content?.body || '',
      theme: data?.content?.theme || 'default',
      isPublished: data?.settings?.isPublished || false
    };
  });
}

// SDK Functions for easy content management
export const SubdomainSDK = {
  async get(subdomain: string) {
    return await getSubdomainData(subdomain);
  },
  
  async updateContent(subdomain: string, content: Partial<SubdomainContent>) {
    return await updateSubdomainContent(subdomain, content);
  },
  
  async setTitle(subdomain: string, title: string) {
    return await updateSubdomainContent(subdomain, { title });
  },
  
  async setDescription(subdomain: string, description: string) {
    return await updateSubdomainContent(subdomain, { description });
  },
  
  async setBody(subdomain: string, body: string) {
    return await updateSubdomainContent(subdomain, { body });
  },
  
  async setTheme(subdomain: string, theme: SubdomainContent['theme']) {
    return await updateSubdomainContent(subdomain, { theme });
  }
};
