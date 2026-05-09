'use client';

import { Download, FileText, Volume2 } from 'lucide-react';
import { parseVideoEmbedUrl } from '@/lib/courses/embed-url';
import type { LessonPlacementViewModel } from '@/lib/courses/map-lesson-placements';
import { cn } from '@/lib/utils';

type Props = {
  items: LessonPlacementViewModel[];
  className?: string;
};

export function LessonInlinePlacements({ items, className }: Props) {
  if (items.length === 0) return null;

  return (
    <div className={cn('space-y-6', className)}>
      {items.map((item) => (
        <PlacementBlock key={item.placementId} item={item} />
      ))}
    </div>
  );
}

function PlacementBlock({ item }: { item: LessonPlacementViewModel }) {
  const caption = item.caption?.trim();

  if (item.kind === 'embed' || item.embedUrl) {
    const parsed = item.embedUrl ? parseVideoEmbedUrl(item.embedUrl) : null;
    if (!parsed) {
      return (
        <figure className="overflow-hidden rounded-[1.75rem] border border-[hsl(var(--lesson-border)/0.5)] bg-[hsl(var(--lesson-wash)/0.45)] p-4 text-sm text-muted-foreground shadow-[0_18px_44px_-38px_hsl(var(--primary)/0.24)]">
          <p>Video link could not be embedded. Check the URL.</p>
          {item.embedUrl ? (
            <p className="mt-2 truncate font-mono text-xs">{item.embedUrl}</p>
          ) : null}
        </figure>
      );
    }
    return (
      <figure className="overflow-hidden rounded-[2rem] border border-[hsl(var(--lesson-border)/0.45)] bg-[hsl(var(--lesson-canvas)/0.58)] shadow-[0_28px_70px_-48px_hsl(var(--primary)/0.42)] ring-1 ring-white/35 dark:ring-white/10">
        <div className="relative aspect-video w-full bg-muted/30">
          <iframe
            title={caption || 'Video'}
            src={parsed.embedSrc}
            className="absolute inset-0 size-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        {caption ? (
          <figcaption className="px-5 py-4 text-center text-sm text-muted-foreground">
            {caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  const url = item.publicUrl?.trim();
  if (!url) return null;

  if (item.kind === 'image' || item.mediaKind === 'image') {
    return (
      <figure className="overflow-hidden rounded-[2rem] border border-[hsl(var(--lesson-border)/0.45)] bg-[hsl(var(--lesson-canvas)/0.58)] shadow-[0_28px_70px_-48px_hsl(var(--primary)/0.38)] ring-1 ring-white/35 dark:ring-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element -- external URLs */}
        <img
          src={url}
          alt={item.alt || ''}
          className="max-h-[min(70vh,520px)] w-full object-contain"
        />
        {caption ? (
          <figcaption className="px-5 py-4 text-center text-sm text-muted-foreground">
            {caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  if (item.kind === 'video' || item.mediaKind === 'video') {
    return (
      <figure className="overflow-hidden rounded-[2rem] border border-[hsl(var(--lesson-border)/0.45)] bg-[hsl(var(--lesson-canvas)/0.58)] shadow-[0_28px_70px_-48px_hsl(var(--primary)/0.38)] ring-1 ring-white/35 dark:ring-white/10">
        <video
          src={url}
          controls
          className="max-h-[min(70vh,520px)] w-full bg-black"
          preload="metadata"
        >
          <track kind="captions" />
        </video>
        {caption ? (
          <figcaption className="px-5 py-4 text-center text-sm text-muted-foreground">
            {caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  if (item.kind === 'audio' || item.mediaKind === 'audio') {
    return (
      <div className="rounded-[1.75rem] border border-[hsl(var(--lesson-border)/0.45)] bg-[hsl(var(--lesson-canvas)/0.58)] p-4 shadow-[0_20px_54px_-44px_hsl(var(--primary)/0.32)] ring-1 ring-white/30 dark:ring-white/10">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
          <Volume2 className="size-4 text-primary" />
          Audio
        </div>
        <audio src={url} controls className="w-full" preload="metadata" />
        {caption ? (
          <p className="mt-2 text-sm text-muted-foreground">{caption}</p>
        ) : null}
      </div>
    );
  }

  const label =
    item.originalFilename?.trim() ||
    item.storageKey?.split('/').pop() ||
    'Download';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-[1.75rem] border border-[hsl(var(--lesson-border)/0.45)] bg-[hsl(var(--lesson-canvas)/0.58)] px-4 py-3 shadow-[0_20px_54px_-44px_hsl(var(--primary)/0.3)] transition-[background,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-[hsl(var(--lesson-glow)/0.5)] motion-reduce:transform-none"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {item.kind === 'pdf' || item.mediaKind === 'pdf' ? (
          <FileText className="size-5" />
        ) : (
          <Download className="size-5" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{label}</p>
        {caption ? (
          <p className="truncate text-sm text-muted-foreground">{caption}</p>
        ) : (
          <p className="text-xs text-muted-foreground">Opens in a new tab</p>
        )}
      </div>
    </a>
  );
}
