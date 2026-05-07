import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { SWRConfig } from 'swr';

export const metadata: Metadata = {
  title: 'Flow Guide — Learn. Build. Master.',
  description:
    'Premium guided learning paths for structure, momentum, and personal growth.',
  icons: {
    icon: [{ url: '/brand/flowlogo.png', type: 'image/png' }],
    apple: '/brand/flowlogo.png'
  }
};

export const viewport: Viewport = {
  maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`bg-background ${manrope.className}`}>
      <body className="min-h-[100dvh] bg-background">
        <SWRConfig
          value={{
            // Avoid hitting Postgres during `next build`/SSG. Client routes fetch `/api/user` immediately.
          }}
        >
          {children}
        </SWRConfig>
      </body>
    </html>
  );
}
