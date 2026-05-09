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
        'flow-guide-blocknote-reader w-full rounded-3xl border border-[hsl(var(--lesson-border)/0.38)] bg-[hsl(var(--lesson-wash)/0.45)] p-6 shadow-[0_22px_55px_-44px_hsl(var(--primary)/0.28)] sm:p-8',
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
