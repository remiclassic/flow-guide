import '@mantine/core/styles.css';
import '@blocknote/mantine/style.css';
import '@blocknote/core/fonts/inter.css';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { headers } from 'next/headers';
import { SWRConfig } from 'swr';

export const metadata: Metadata = {
  icons: {
    icon: [{ url: '/brand/flowlogo.png', type: 'image/png' }],
    apple: '/brand/flowlogo.png'
  }
};

export const viewport: Viewport = {
  maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const locale = headersList.get('x-next-intl-locale') ?? 'es';

  return (
    <html
      lang={locale}
      className={`bg-background scrollbar-themed ${manrope.className}`}
      suppressHydrationWarning
    >
      <body className="min-h-[100dvh] bg-background">
        <SWRConfig value={{}}>{children}</SWRConfig>
      </body>
    </html>
  );
}
