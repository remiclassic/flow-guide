'use client';

import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';

const PRIMARY_SRC = '/brand/flowlogo.png';
const FALLBACK_SRC = '/flowlogo.png';

type Props = {
  className?: string;
  /** Display size in CSS pixels (width & height). */
  size?: number;
  /** Prefer loading early for LCP (header). */
  fetchPriority?: 'high' | 'low' | 'auto';
};

/**
 * Logo mark served from /public. Uses a plain img so the asset always loads
 * without relying on the image optimizer (more reliable in dev + client layouts).
 */
export function FlowLogoMark({
  className,
  size = 40,
  fetchPriority = 'auto',
}: Props) {
  const [src, setSrc] = useState(PRIMARY_SRC);

  const handleError = useCallback(() => {
    setSrc((current) => (current === PRIMARY_SRC ? FALLBACK_SRC : current));
  }, []);

  return (
    // next/image skipped: plain /public asset loads reliably in client layouts
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Flow Guide"
      width={size}
      height={size}
      decoding="async"
      fetchPriority={fetchPriority}
      onError={handleError}
      className={cn('shrink-0 object-contain', className)}
      style={{ width: size, height: size }}
    />
  );
}
