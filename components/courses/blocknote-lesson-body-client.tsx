'use client';

import { useMemo } from 'react';
import type { PartialBlock } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';
import { cn } from '@/lib/utils';
import type { LessonContentBlocks } from '@/lib/db/schema';
import { flowGuideBlockNoteSchema } from '@/components/courses/flow-guide-blocknote-schema';

type Props = {
  blocks: LessonContentBlocks;
  className?: string;
};

export function BlockNoteLessonBodyClient({ blocks, className }: Props) {
  const initialContent = useMemo(() => blocks as PartialBlock[], [blocks]);
  const editor = useCreateBlockNote({
    schema: flowGuideBlockNoteSchema,
    initialContent,
    animations: false,
    domAttributes: {
      editor: {
        class: 'flow-guide-blocknote-reader__surface',
      },
    },
  });

  return (
    <div
      className={cn(
        'flow-guide-blocknote-reader rounded-2xl border border-border/80 bg-muted/15 p-5 shadow-card-soft sm:p-6',
        className
      )}
    >
      <BlockNoteView
        editor={editor}
        editable={false}
        theme="light"
        formattingToolbar={false}
        slashMenu={false}
        sideMenu={false}
        filePanel={false}
        tableHandles={false}
        emojiPicker={false}
        comments={false}
      />
    </div>
  );
}
