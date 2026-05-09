'use client';

import { cn } from '@/lib/utils';

export function LessonReadingRail({
  percent,
  className,
}: {
  percent: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'pointer-events-none fixed left-0 right-0 top-14 z-[58] h-[3px] bg-[hsl(var(--lesson-border)/0.35)] supports-[padding:max(0px,env(safe-area-inset-top))]:top-[calc(3.5rem+max(0px,env(safe-area-inset-top)))]',
        className
      )}
      aria-hidden
    >
      <div
        className="h-full origin-left bg-gradient-to-r from-primary via-[hsl(278_72%_58%)] to-[hsl(295_65%_62%)] transition-[transform,opacity] duration-150 ease-out motion-reduce:transition-none"
        style={{
          width: `${Math.min(100, Math.max(0, percent))}%`,
          opacity: percent > 2 ? 1 : 0.35,
        }}
      />
    </div>
  );
}
