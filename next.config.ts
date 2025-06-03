import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply iframe-friendly headers to all routes
        source: '/(.*)',
        headers: [
          // Note: We intentionally omit X-Frame-Options to allow iframe embedding
          // Instead, we use CSP frame-ancestors for more modern control
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *;", // Allow embedding from any origin
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
