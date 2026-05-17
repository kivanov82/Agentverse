import type { Metadata, Viewport } from 'next';
import { Providers } from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'ShipWith.AI — Build your business idea with AI',
  description: 'Tell us what you want to build. Our AI team designs, builds, and ships it.',
  metadataBase: new URL('https://shipwithai.nl'),
  openGraph: {
    title: 'ShipWith.AI — Build your business idea with AI',
    description: 'Describe your vision. A team of AI specialists designs, builds, and ships it.',
    siteName: 'ShipWith.AI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShipWith.AI — Build your business idea with AI',
    description: 'Describe your vision. A team of AI specialists designs, builds, and ships it.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=IBM+Plex+Mono:wght@300;400;500;600&family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#07070a] text-zinc-100 antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
