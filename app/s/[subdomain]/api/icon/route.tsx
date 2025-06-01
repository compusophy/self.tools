import { ImageResponse } from "next/og";

export const runtime = 'edge';
export const revalidate = 300; // Revalidate every 5 minutes

export async function GET(
  request: Request,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  const { subdomain } = await params;
  
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000000',
          borderRadius: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '79px',
          }}
        >
          {subdomain.charAt(0).toUpperCase()}
        </div>
      </div>
    ),
    {
      width: 128,
      height: 128,
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300', // 5 minute cache
      },
    }
  );
} 