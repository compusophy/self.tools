import { ImageResponse } from "next/og";

export const runtime = 'edge';

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
          borderRadius: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: subdomain.length > 8 ? '10px' : '12px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
          }}
        >
          {subdomain}
        </div>
      </div>
    ),
    {
      width: 64,
      height: 64,
    }
  );
} 