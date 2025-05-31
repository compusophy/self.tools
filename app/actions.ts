'use server';

import { redis } from '@/lib/redis';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { rootDomain, protocol } from '@/lib/utils';
import { createSubdomain, updateSubdomainContent, type SubdomainContent } from '@/lib/subdomains';

export async function createSubdomainAction(
  prevState: any,
  formData: FormData
) {
  const subdomain = formData.get('subdomain') as string;

  if (!subdomain) {
    return { success: false, error: 'Subdomain is required' };
  }

  const sanitizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');

  if (sanitizedSubdomain !== subdomain) {
    return {
      subdomain,
      success: false,
      error:
        'Subdomain can only have lowercase letters, numbers, and hyphens. Please try again.'
    };
  }

  const success = await createSubdomain(sanitizedSubdomain);
  
  if (!success) {
    return {
      subdomain,
      success: false,
      error: 'This subdomain is already taken'
    };
  }

  redirect(`${protocol}://${sanitizedSubdomain}.${rootDomain}`);
}

export async function deleteSubdomainAction(
  prevState: any,
  formData: FormData
) {
  const subdomain = formData.get('subdomain');
  await redis.del(`subdomain:${subdomain}`);
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

  if (!subdomain) {
    return { success: false, error: 'Subdomain is required' };
  }

  const updates: Partial<SubdomainContent> = {};
  if (title) updates.title = title;
  if (description) updates.description = description;
  if (body) updates.body = body;
  if (theme) updates.theme = theme;

  const success = await updateSubdomainContent(subdomain, updates);

  if (!success) {
    return { success: false, error: 'Failed to update content' };
  }

  revalidatePath(`/s/${subdomain}`);
  return { success: true, message: 'Content updated successfully' };
}

export async function improveContentWithAIAction(
  prevState: any,
  formData: FormData
) {
  const content = formData.get('content') as string;
  const prompt = formData.get('prompt') as string;
  const subdomain = formData.get('subdomain') as string;

  if (!content || !subdomain) {
    return { success: false, error: 'Content and subdomain are required' };
  }

  try {
    // Gemini 1.5 Flash API integration
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a helpful AI assistant for improving web content. 

Current content:
${content}

User request: ${prompt || 'Improve this content to be more engaging and professional'}

Please improve the content while keeping it relevant and well-formatted in Markdown. Make it more engaging, professional, and user-friendly. Return only the improved content without any explanations.`
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const improvedContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!improvedContent) {
      throw new Error('No content received from AI');
    }

    return { 
      success: true, 
      improvedContent,
      message: 'Content improved successfully!' 
    };

  } catch (error) {
    console.error('AI improvement error:', error);
    return { 
      success: false, 
      error: 'Failed to improve content with AI. Please try again.' 
    };
  }
}
