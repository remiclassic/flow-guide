'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { PartialBlock } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import {
  BasicTextStyleButton,
  BlockTypeSelect,
  CreateLinkButton,
  FormattingToolbar,
  FormattingToolbarController,
  LinkToolbarController,
  SideMenuController,
  SuggestionMenuController,
  blockTypeSelectItems,
  useCreateBlockNote,
} from '@blocknote/react';
import { cn } from '@/lib/utils';
import type { LessonContentBlocks } from '@/lib/db/schema';
import {
  flowGuideBlockNoteSchema,
  getFlowGuideSlashMenuItems,
} from '@/components/courses/flow-guide-blocknote-schema';

type TiptapLike = {
  can?: () => unknown;
  chain?: () => {
    focus?: () => {
      undo?: () => { run?: () => unknown };
      redo?: () => { run?: () => unknown };
    };
  };
  on?: (event: string, fn: () => void) => void;
  off?: (event: string, fn: () => void) => void;
};

function readHistoryCapability(can: unknown, key: 'undo' | 'redo'): boolean {
  if (!can || typeof can !== 'object') return false;
  const v = (can as Record<string, unknown>)[key];
  if (typeof v === 'function') {
    try {
      return Boolean((v as () => boolean)());
    } catch {
      return false;
    }
  }
  if (typeof v === 'boolean') return v;
  return false;
}

/** TipTap `can()` shape differs by version; never call `can.undo` unless it's a function. */
function getHistoryCapsFromTiptap(tiptap: unknown): {
  canUndo: boolean;
  canRedo: boolean;
} {
  const tt = tiptap as TiptapLike | null | undefined;
  if (!tt || typeof tt.can !== 'function') {
    return { canUndo: false, canRedo: false };
  }
  try {
    const can = tt.can();
    return {
      canUndo: readHistoryCapability(can, 'undo'),
      canRedo: readHistoryCapability(can, 'redo'),
    };
  } catch {
    return { canUndo: false, canRedo: false };
  }
}

function safeChainUndo(tiptap: unknown): void {
  try {
    (tiptap as TiptapLike | null | undefined)
      ?.chain?.()
      ?.focus?.()
      ?.undo?.()
      ?.run?.();
  } catch {
    /* noop */
  }
}

function safeChainRedo(tiptap: unknown): void {
  try {
    (tiptap as TiptapLike | null | undefined)
      ?.chain?.()
      ?.focus?.()
      ?.redo?.()
      ?.run?.();
  } catch {
    /* noop */
  }
}

type Props = {
  initialBlocks: LessonContentBlocks | null;
  initialMarkdown: string;
  onBlocksChange: (blocksJson: string) => void;
  onBlockHistory?: (caps: { canUndo: boolean; canRedo: boolean }) => void;
  onBlockApiReady?: (
    api: { undo: () => void; redo: () => void } | null
  ) => void;
};

export function LessonBlockNoteEditorClient({
  initialBlocks,
  initialMarkdown,
  onBlocksChange,
  onBlockHistory,
  onBlockApiReady,
}: Props) {
  const lastJsonRef = useRef(initialBlocks ? JSON.stringify(initialBlocks) : '');
  const serializeFrameRef = useRef<number | null>(null);

  const initialContent = useMemo(() => {
    return initialBlocks && initialBlocks.length > 0
      ? (initialBlocks as PartialBlock[])
      : undefined;
  }, [initialBlocks]);

  const editor = useCreateBlockNote({
    schema: flowGuideBlockNoteSchema,
    initialContent,
    animations: false,
    placeholders: {
      default: "Press '/' for Flow Guide blocks...",
      emptyDocument: "Start writing, or press '/' for Flow Guide blocks...",
    },
    domAttributes: {
      editor: {
        class: 'flow-guide-blocknote-editor__surface',
      },
    },
  });

  useEffect(() => {
    lastJsonRef.current = initialBlocks ? JSON.stringify(initialBlocks) : '';
  }, [initialBlocks]);

  useEffect(() => {
    return () => {
      if (serializeFrameRef.current != null) {
        window.cancelAnimationFrame(serializeFrameRef.current);
      }
    };
  }, []);

  const emitSerializedDocument = useCallback(() => {
    if (serializeFrameRef.current != null) return;
    serializeFrameRef.current = window.requestAnimationFrame(() => {
      serializeFrameRef.current = null;
      const nextJson = JSON.stringify(editor.document);
      if (nextJson === lastJsonRef.current) return;
      lastJsonRef.current = nextJson;
      onBlocksChange(nextJson);
    });
  }, [editor, onBlocksChange]);

  useEffect(() => {
    const tt = editor._tiptapEditor as unknown;
    onBlockApiReady?.({
      undo: () => {
        try {
          if (typeof editor.undo === 'function') {
            editor.undo();
            return;
          }
        } catch {
          /* fall through */
        }
        safeChainUndo(tt);
      },
      redo: () => {
        try {
          if (typeof editor.redo === 'function') {
            editor.redo();
            return;
          }
        } catch {
          /* fall through */
        }
        safeChainRedo(tt);
      },
    });
    return () => {
      onBlockApiReady?.(null);
    };
  }, [editor, onBlockApiReady]);

  useEffect(() => {
    if (!onBlockHistory) return;
    const tt = editor._tiptapEditor as unknown;
    const tiptap = tt as TiptapLike | null | undefined;
    if (!tiptap || typeof tiptap.on !== 'function') {
      onBlockHistory({ canUndo: false, canRedo: false });
      return;
    }
    const notify = () => {
      try {
        onBlockHistory(getHistoryCapsFromTiptap(tt));
      } catch {
        onBlockHistory({ canUndo: false, canRedo: false });
      }
    };
    tiptap.on('transaction', notify);
    notify();
    return () => {
      if (typeof tiptap.off === 'function') {
        tiptap.off('transaction', notify);
      }
    };
  }, [editor, onBlockHistory]);

  const toolbarBlockItems = useMemo(
    () =>
      blockTypeSelectItems(editor.dictionary).filter((item) => {
        return (
          item.type === 'paragraph' ||
          (item.type === 'heading' &&
            (item.props?.level === 1 ||
              item.props?.level === 2 ||
              item.props?.level === 3)) ||
          item.type === 'bulletListItem' ||
          item.type === 'numberedListItem' ||
          item.type === 'checkListItem' ||
          item.type === 'quote'
        );
      }),
    [editor]
  );

  return (
    <div
      className={cn(
        'flow-guide-blocknote-editor rounded-[2rem] border border-stone-200/80 bg-[#fff8ed] p-3 shadow-inner',
        'min-h-[720px] transition focus-within:border-violet-300/70 focus-within:ring-2 focus-within:ring-violet-200/70'
      )}
    >
      {!initialBlocks && initialMarkdown.trim() ? (
        <div className="mb-3 rounded-2xl border border-amber-200/80 bg-amber-50/85 px-4 py-3 text-xs leading-relaxed text-amber-900">
          This lesson still has legacy Markdown saved. It will keep rendering
          until you publish BlockNote content from this editor.
        </div>
      ) : null}
      <BlockNoteView
        editor={editor}
        theme="light"
        editable
        formattingToolbar={false}
        slashMenu={false}
        tableHandles={false}
        emojiPicker={false}
        comments={false}
        onChange={emitSerializedDocument}
      >
        <SideMenuController />
        <LinkToolbarController />
        <FormattingToolbarController
          formattingToolbar={() => (
            <FormattingToolbar>
              <BlockTypeSelect items={toolbarBlockItems} />
              <BasicTextStyleButton basicTextStyle="bold" />
              <BasicTextStyleButton basicTextStyle="italic" />
              <CreateLinkButton />
            </FormattingToolbar>
          )}
        />
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={async (query) => getFlowGuideSlashMenuItems(editor, query)}
        />
      </BlockNoteView>
    </div>
  );
}
