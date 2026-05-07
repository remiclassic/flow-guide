import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { SWRConfig } from 'swr';

export const metadata: Metadata = {
  title: 'Glow Flow — Course Platform',
  description:
    'Premium online courses with Stripe subscriptions, tracked progress, and room to grow into coaching and analytics.'
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
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50">
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
