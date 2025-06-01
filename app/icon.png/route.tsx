import { ImageResponse } from "next/og";

export const runtime = 'edge';

export async function GET() {
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
          S
        </div>
      </div>
    ),
    {
      width: 128,
      height: 128,
    }
  );
} 