'use client';

import { cn } from '@/lib/utils';

type Props = {
  src: string;
  title: string;
  className?: string;
};

export function LegacyLessonFrame({ src, title, className }: Props) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/80 bg-muted/15 p-3 shadow-card-soft sm:p-4',
        className
      )}
    >
      <div
        className={cn(
          'overflow-hidden rounded-xl border border-border/70 bg-card shadow-inner',
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/30 px-4 py-3 text-xs">
          <span className="font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Lesson content
          </span>
          <span className="truncate text-sm font-medium text-foreground" title={title}>
            {title}
          </span>
        </div>
        <iframe
          title={title}
          src={src}
          className="block h-[min(72dvh,720px)] w-full bg-background lg:h-[min(78dvh,820px)]"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
