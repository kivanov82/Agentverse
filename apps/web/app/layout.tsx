import type { Metadata, Viewport } from 'next';
import { Providers } from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'ShipWith.AI — A studio of specialist agents you commission',
  description: 'An atelier of specialist agents — auditors, analysts, engineers — held on retainer. State the work. We deliver the audit, the rewrite, the deploy.',
  metadataBase: new URL('https://shipwithai.nl'),
  openGraph: {
    title: 'ShipWith.AI — A studio of specialist agents you commission',
    description: 'An atelier of specialist agents — auditors, analysts, engineers — held on retainer. State the work. We deliver.',
    siteName: 'ShipWith.AI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShipWith.AI — A studio of specialist agents you commission',
    description: 'An atelier of specialist agents — auditors, analysts, engineers — held on retainer. State the work. We deliver.',
  },
};

export const viewport: Viewport = {
  width: 1440,
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..700;1,6..72,200..700&family=Geist:wght@300..700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
