import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
    clientSegmentCache: true,
  },
  turbopack: {
    root: projectRoot,
  },
};

export default withNextIntl(nextConfig);
