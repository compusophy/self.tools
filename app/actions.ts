'use server';

import { redis } from '@/lib/redis';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { rootDomain, protocol } from '@/lib/utils';
import { createSubdomain, updateSubdomainContent, deleteSubdomain, claimSubdomainOwnership, getSubdomainData, getUserSubdomains, type SubdomainContent } from '@/lib/subdomains';

export async function createSubdomainAction(
  prevState: any,
  formData: FormData
) {
  const subdomain = formData.get('subdomain') as string;
  const deviceId = formData.get('deviceId') as string;
  const homeTheme = (formData.get('homeTheme') as 'dark' | 'light' | 'color') || 'dark';
  const homeFont = (formData.get('homeFont') as 'mono' | 'serif' | 'sans') || 'mono';

  if (!subdomain) {
    return { success: false, error: 'Subdomain is required' };
  }

  if (!deviceId) {
    return { success: false, error: 'Device ID is required' };
  }

  const sanitizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');

  // Check if subdomain is empty after sanitization
  if (!sanitizedSubdomain) {
    return {
      subdomain,
      success: false,
      error: 'Please enter a valid subdomain with letters, numbers, or hyphens'
    };
  }

  // Check for minimum length
  if (sanitizedSubdomain.length < 1) {
    return {
      subdomain,
      success: false,
      error: 'Subdomain must be at least 1 character long'
    };
  }

  // Check if subdomain already exists
  const existingSubdomain = await getSubdomainData(sanitizedSubdomain);
  if (existingSubdomain) {
    // Redirect to the existing subdomain page
    redirect(`/s/${sanitizedSubdomain}`);
  }

  const success = await createSubdomain(sanitizedSubdomain, deviceId, homeTheme, homeFont);
  
  if (!success) {
    return {
      subdomain: sanitizedSubdomain,
      success: false,
      error: 'Failed to create subdomain'
    };
  }

  redirect(`${protocol}://${sanitizedSubdomain}.${rootDomain}`);
}

export async function deleteSubdomainAction(
  prevState: any,
  formData: FormData
) {
  const subdomain = formData.get('subdomain') as string;
  const deviceId = formData.get('deviceId') as string;

  if (!subdomain || !deviceId) {
    return { success: '', error: 'Missing required information' };
  }

  const success = await deleteSubdomain(subdomain, deviceId);
  
  if (!success) {
    return { success: '', error: 'Unauthorized or subdomain not found' };
  }

  revalidatePath('/admin');
  return { success: 'Domain deleted successfully' };
}

export async function updateSubdomainContentAction(
  prevState: any,
  formData: FormData
) {
  const subdomain = formData.get('subdomain') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const body = formData.get('body') as string;
  const theme = formData.get('theme') as SubdomainContent['theme'];
  const font = formData.get('font') as string;
  const deviceId = formData.get('deviceId') as string;



  if (!subdomain) {
    return { success: false, error: 'Subdomain is required' };
  }

  if (!deviceId) {
    return { success: false, error: 'Device ID is required' };
  }

  const updates: Partial<SubdomainContent> = {};
  if (title) updates.title = title;
  if (description) updates.description = description;
  if (body) updates.body = body;
  if (theme) updates.theme = theme;
  if (font) (updates as any).font = font;

  const success = await updateSubdomainContent(subdomain, updates, deviceId);

  if (!success) {
    return { success: false, error: 'Unauthorized or failed to update content' };
  }

  revalidatePath(`/s/${subdomain}`);
  return { success: true, message: 'Content updated successfully' };
}

export async function claimSubdomainOwnershipAction(
  prevState: any,
  formData: FormData
) {
  const subdomain = formData.get('subdomain') as string;
  const deviceId = formData.get('deviceId') as string;

  if (!subdomain) {
    return { success: false, error: 'Subdomain is required' };
  }

  if (!deviceId) {
    return { success: false, error: 'Device ID is required' };
  }

  const success = await claimSubdomainOwnership(subdomain, deviceId);

  if (!success) {
    return { success: false, error: 'Failed to claim ownership or not allowed' };
  }

  revalidatePath(`/s/${subdomain}`);
  return { success: true, message: 'Ownership claimed successfully' };
}

export async function getUserSubdomainsAction(
  prevState: any,
  formData: FormData
) {
  const deviceId = formData.get('deviceId') as string;

  if (!deviceId) {
    return { success: false, error: 'Device ID is required', subdomains: [] };
  }

  try {
    const subdomains = await getUserSubdomains(deviceId);
    return { success: true, subdomains };
  } catch (error) {
    return { success: false, error: 'Failed to fetch subdomains', subdomains: [] };
  }
}
