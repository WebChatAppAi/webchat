// No "use client" here - this is a Server Component by default
import './globals.css'
import type { Metadata } from 'next';
import AppProviders from '@/components/AppProviders'; // We will create this next

export const metadata: Metadata = {
  title: 'Alvan World - AI Chat',
  description: 'An intelligent AI chat application.',
  icons: {
    icon: [
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      // Consider adding your /icon.ico here as well if it's the primary one
      { url: '/icon.ico', type: 'image/x-icon', sizes: 'any' }, 
    ],
    apple: '/icons/apple-touch-icon.png',
  },
  // manifest: '/manifest.json', // Uncomment if you add a PWA manifest
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      {/* The <head> is managed by Next.js based on metadata object */}
      <body className="bg-background text-foreground">
        {/* AppProviders will contain all the client-side logic and providers */}
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
