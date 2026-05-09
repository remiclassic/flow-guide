'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Subtle scroll-linked wash behind lesson article — “scene” shifts without gamifying.
 */
export function LessonAtmosphere({
  scrollPercent,
  children,
  className,
}: {
  scrollPercent: number;
  children: ReactNode;
  className?: string;
}) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const p = scrollPercent / 100;
    setPhase(Math.min(2, Math.floor(p * 3)));
  }, [scrollPercent]);

  return (
    <div className={cn('relative', className)}>
      <div
        className="pointer-events-none absolute -inset-x-6 -inset-y-4 -z-10 rounded-[2rem] opacity-90 transition-[background] duration-700 ease-out motion-reduce:transition-none"
        aria-hidden
        style={{
          background:
            phase === 0
              ? 'radial-gradient(ellipse 80% 60% at 50% 0%, hsl(var(--primary) / 0.06), transparent 55%)'
              : phase === 1
                ? 'radial-gradient(ellipse 90% 70% at 40% 30%, hsl(278 55% 62% / 0.07), transparent 60%), radial-gradient(ellipse 70% 50% at 80% 80%, hsl(35 70% 70% / 0.06), transparent 50%)'
                : 'radial-gradient(ellipse 100% 80% at 50% 100%, hsl(var(--primary) / 0.07), transparent 55%)',
        }}
      />
      {children}
    </div>
  );
}
