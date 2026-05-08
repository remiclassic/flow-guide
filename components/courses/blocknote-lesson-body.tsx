'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { LessonContentBlocks } from '@/lib/db/schema';
import { cn } from '@/lib/utils';

const BlockNoteLessonBodyClient = dynamic(
  () =>
    import('@/components/courses/blocknote-lesson-body-client').then(
      (mod) => mod.BlockNoteLessonBodyClient
    ),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-border/80 bg-muted/15 p-6 text-sm text-muted-foreground shadow-card-soft">
        Preparing lesson content...
      </div>
    ),
  }
);

type Props = {
  blocks: LessonContentBlocks;
  className?: string;
};

export function BlockNoteLessonBody({ blocks, className }: Props) {
  const contentKey = useMemo(() => JSON.stringify(blocks), [blocks]);
  return (
    <BlockNoteLessonBodyClient
      key={contentKey}
      blocks={blocks}
      className={cn('flow-guide-blocknote-body', className)}
    />
  );
}
