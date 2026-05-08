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
        <figure className="overflow-hidden rounded-2xl border border-border/80 bg-muted/15 p-4 text-sm text-muted-foreground">
          <p>Video link could not be embedded. Check the URL.</p>
          {item.embedUrl ? (
            <p className="mt-2 truncate font-mono text-xs">{item.embedUrl}</p>
          ) : null}
        </figure>
      );
    }
    return (
      <figure className="space-y-2 overflow-hidden rounded-2xl border border-border/80 bg-black/[0.03] shadow-card-soft">
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
          <figcaption className="px-4 pb-4 text-center text-sm text-muted-foreground">
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
      <figure className="space-y-2 overflow-hidden rounded-2xl border border-border/80 bg-muted/10 shadow-card-soft">
        {/* eslint-disable-next-line @next/next/no-img-element -- external URLs */}
        <img
          src={url}
          alt={item.alt || ''}
          className="max-h-[min(70vh,520px)] w-full object-contain"
        />
        {caption ? (
          <figcaption className="px-4 pb-4 text-center text-sm text-muted-foreground">
            {caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  if (item.kind === 'video' || item.mediaKind === 'video') {
    return (
      <figure className="space-y-2 overflow-hidden rounded-2xl border border-border/80 bg-black/[0.04] shadow-card-soft">
        <video
          src={url}
          controls
          className="max-h-[min(70vh,520px)] w-full bg-black"
          preload="metadata"
        >
          <track kind="captions" />
        </video>
        {caption ? (
          <figcaption className="px-4 pb-4 text-center text-sm text-muted-foreground">
            {caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  if (item.kind === 'audio' || item.mediaKind === 'audio') {
    return (
      <div className="rounded-2xl border border-border/80 bg-muted/10 p-4 shadow-card-soft">
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
      className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card px-4 py-3 shadow-card-soft transition-colors hover:bg-muted/40"
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
