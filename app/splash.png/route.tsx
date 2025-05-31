import { ImageResponse } from "next/og";

export const runtime = 'edge';

export async function GET(request: Request) {
  // Redirect to icon route
  const url = new URL(request.url);
  const iconUrl = new URL('/icon.png', url.origin);
  
  const iconResponse = await fetch(iconUrl.toString());
  
  return new Response(iconResponse.body, {
    status: iconResponse.status,
    headers: iconResponse.headers,
  });
} 