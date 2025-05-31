import { ImageResponse } from "next/og";

export const runtime = 'edge';

export async function GET() {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000000',
          fontFamily: 'monospace',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <h1 
            style={{ 
              fontSize: '64px', 
              color: 'white',
              margin: '0',
              lineHeight: '1',
              marginBottom: '20px',
            }}
          >
            {rootDomain}
          </h1>
          <p
            style={{
              fontSize: '24px',
              color: 'rgba(255, 255, 255, 0.7)',
              margin: '0',
              textAlign: 'center',
            }}
          >
            Create your own custom subdomain
          </p>
        </div>
      </div>
    ),
    {
      width: 600,
      height: 400,
    }
  );
} 