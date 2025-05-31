import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import FarcasterSDKProvider from '../components/farcaster-sdk-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'Platforms Starter Kit',
  description: 'Next.js template for building a multi-tenant SaaS.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${jetbrainsMono.variable} font-mono antialiased`}>
        <FarcasterSDKProvider />
        {children}
      </body>
    </html>
  );
}
