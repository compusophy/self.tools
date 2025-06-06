import { ImageResponse } from "next/og";

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subdomain = searchParams.get('subdomain') || '';

  // Simple subdomain URL display
  const displayUrl = subdomain ? `${subdomain}.self.tools` : 'self.tools';

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
          fontFamily: 'monospace',
        }}
      >
        {/* Center URL */}
        <h1 
          style={{ 
            fontSize: '48px', 
            color: 'white',
            margin: '0',
            lineHeight: '1',
          }}
        >
          {displayUrl}
        </h1>
      </div>
    ),
    {
      width: 600,
      height: 400,
    }
  );
} 