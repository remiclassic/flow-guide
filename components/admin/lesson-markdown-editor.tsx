'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  autosaveLessonDraftAction,
  publishLessonBodyAction,
} from '@/lib/admin/course-actions';
import { useDebouncedAutosave } from '@/hooks/use-debounced-autosave';
import { Button } from '@/components/ui/button';
import { stringifyLessonBlocks } from '@/lib/courses/blocknote-content';
import type { LessonContentBlocks } from '@/lib/db/schema';
import { Redo2, Undo2 } from 'lucide-react';
import { cn, safeTimeoutDelay } from '@/lib/utils';

const LessonBlockNoteEditorClient = dynamic(
  () =>
    import('@/components/admin/lesson-blocknote-editor-client').then(
      (mod) => mod.LessonBlockNoteEditorClient
    ),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[640px] rounded-[2rem] border border-stone-200/80 bg-[#fff8ed] p-5 text-sm text-stone-600 shadow-inner">
        Preparing the lesson editor…
      </div>
    ),
  }
);

function localRecoveryKey(courseSlug: string, lessonKey: string) {
  return `fg:studio:lesson-blocks:${courseSlug}:${lessonKey}`;
}

export function LessonMarkdownEditor({
  courseSlug,
  lessonKey,
  initialDraftMarkdown,
  initialDraftBlocks,
  onBlockHistory,
  onRegisterBlockApi,
}: {
  courseSlug: string;
  lessonKey: string;
  initialDraftMarkdown: string;
  initialDraftBlocks: LessonContentBlocks | null;
  onBlockHistory?: (caps: { canUndo: boolean; canRedo: boolean }) => void;
  onRegisterBlockApi?: (
    api: { undo: () => void; redo: () => void } | null
  ) => void;
}) {
  const initialSerialized = useMemo(
    () => stringifyLessonBlocks(initialDraftBlocks),
    [initialDraftBlocks]
  );

  const [blocksJson, setBlocksJson] = useState(initialSerialized);
  const [publishPending, setPublishPending] = useState(false);
  const [recoveryDismissed, setRecoveryDismissed] = useState(false);
  const [recoveryCandidate, setRecoveryCandidate] = useState<string | null>(
    null
  );
  const [localBlocksOverride, setLocalBlocksOverride] =
    useState<LessonContentBlocks | null>(null);
  const [blockCaps, setBlockCaps] = useState({
    canUndo: false,
    canRedo: false,
  });

  useEffect(() => {
    setBlocksJson(initialSerialized);
    setLocalBlocksOverride(null);
  }, [initialSerialized, lessonKey]);

  useEffect(() => {
    setRecoveryDismissed(false);
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(
        localRecoveryKey(courseSlug, lessonKey)
      );
      if (!raw) {
        setRecoveryCandidate(null);
        return;
      }
      const parsed = JSON.parse(raw) as { blocksJson?: string };
      if (
        typeof parsed.blocksJson === 'string' &&
        parsed.blocksJson !== initialSerialized &&
        parsed.blocksJson.trim() !== ''
      ) {
        setRecoveryCandidate(parsed.blocksJson);
      } else {
        setRecoveryCandidate(null);
      }
    } catch {
      setRecoveryCandidate(null);
    }
  }, [courseSlug, lessonKey, initialSerialized]);

  const persistLocalRecovery = useCallback(
    (json: string) => {
      if (typeof window === 'undefined') return;
      try {
        window.localStorage.setItem(
          localRecoveryKey(courseSlug, lessonKey),
          JSON.stringify({
            blocksJson: json,
            updatedAt: Date.now(),
          })
        );
      } catch {
        /* quota or private mode */
      }
    },
    [courseSlug, lessonKey]
  );

  const clearLocalRecovery = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(localRecoveryKey(courseSlug, lessonKey));
    } catch {
      /* ignore */
    }
    setRecoveryCandidate(null);
  }, [courseSlug, lessonKey]);

  const saveDraft = useCallback(
    async (draftBlocksJson: string) => {
      const fd = new FormData();
      fd.set('courseSlug', courseSlug);
      fd.set('lessonKey', lessonKey);
      fd.set('draftBodyMarkdown', initialDraftMarkdown);
      fd.set('draftBodyBlocksJson', draftBlocksJson);
      const res = await autosaveLessonDraftAction(fd);
      if (res.ok) {
        clearLocalRecovery();
      }
      return { ok: res.ok, savedAt: res.ok ? res.savedAt : null };
    },
    [clearLocalRecovery, courseSlug, initialDraftMarkdown, lessonKey]
  );

  const wrappedSetBlocks = useCallback(
    (json: string) => {
      setBlocksJson(json);
      persistLocalRecovery(json);
    },
    [persistLocalRecovery]
  );

  const { status, flush, label, online } = useDebouncedAutosave({
    value: blocksJson,
    initial: initialSerialized,
    delayMs: 1000,
    onSave: saveDraft,
  });

  const [publishMessage, setPublishMessage] = useState<string | null>(null);

  async function publish() {
    setPublishPending(true);
    setPublishMessage(null);
    try {
      await flush();
      const fd = new FormData();
      fd.set('courseSlug', courseSlug);
      fd.set('lessonKey', lessonKey);
      fd.set('draftBodyMarkdown', initialDraftMarkdown);
      fd.set('draftBodyBlocksJson', blocksJson);
      const res = await publishLessonBodyAction(fd);
      if (!res.ok) {
        if (res.error === 'nothing_to_publish') {
          setPublishMessage(
            'Add lesson content or a legacy HTML path before publishing.'
          );
        } else {
          setPublishMessage('Could not publish. Try again.');
        }
      } else {
        setPublishMessage('Published to learners.');
        clearLocalRecovery();
        window.setTimeout(
          () => setPublishMessage(null),
          safeTimeoutDelay(4000)
        );
      }
    } finally {
      setPublishPending(false);
    }
  }

  const mergedBlockHistory = useCallback(
    (caps: { canUndo: boolean; canRedo: boolean }) => {
      setBlockCaps(caps);
      onBlockHistory?.(caps);
    },
    [onBlockHistory]
  );

  const blockApiRef = useRef<{ undo: () => void; redo: () => void } | null>(
    null
  );

  return (
    <div className="space-y-4">
      {recoveryCandidate && !recoveryDismissed ? (
        <div
          className="flex flex-col gap-3 rounded-2xl border border-amber-200/90 bg-amber-50/90 p-4 text-sm text-amber-950 shadow-inner sm:flex-row sm:items-center sm:justify-between"
          role="status"
        >
          <div>
            <p className="font-semibold text-amber-950">
              Recover unsaved editor content?
            </p>
            <p className="mt-1 text-xs leading-relaxed text-amber-900/85">
              We found a local copy from before a refresh or crash. Your server
              draft is still the source of truth — only restore if you trust
              this copy.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="rounded-full bg-amber-900 text-white hover:bg-amber-950"
              onClick={() => {
                try {
                  const blocks = JSON.parse(
                    recoveryCandidate
                  ) as LessonContentBlocks;
                  setLocalBlocksOverride(blocks);
                  wrappedSetBlocks(recoveryCandidate);
                  setRecoveryDismissed(true);
                  setRecoveryCandidate(null);
                } catch {
                  setRecoveryDismissed(true);
                }
              }}
            >
              Restore local draft
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-full border-amber-400/80 bg-white/90 text-amber-950"
              onClick={() => {
                clearLocalRecovery();
                setRecoveryDismissed(true);
              }}
            >
              Discard
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200/85 bg-white/80 px-4 py-3 shadow-inner">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
            Lesson body
          </span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!blockCaps.canUndo}
              className="h-9 rounded-full border-stone-300/80 px-3"
              aria-label="Undo"
              onClick={() => blockApiRef.current?.undo()}
            >
              <Undo2 className="size-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!blockCaps.canRedo}
              className="h-9 rounded-full border-stone-300/80 px-3"
              aria-label="Redo"
              onClick={() => blockApiRef.current?.redo()}
            >
              <Redo2 className="size-4" />
            </Button>
          </div>
        </div>
        <p
          className={cn(
            'text-xs font-medium',
            status === 'error' || !online
              ? 'text-red-700'
              : status === 'saving'
                ? 'text-violet-800'
                : status === 'dirty'
                  ? 'text-amber-800'
                  : 'text-stone-600'
          )}
        >
          {label}
        </p>
      </div>

      <LessonBlockNoteEditorClient
        key={`${lessonKey}-${localBlocksOverride ? 'local' : 'srv'}`}
        initialBlocks={localBlocksOverride ?? initialDraftBlocks}
        initialMarkdown={initialDraftMarkdown}
        onBlocksChange={wrappedSetBlocks}
        onBlockHistory={mergedBlockHistory}
        onBlockApiReady={(api) => {
          blockApiRef.current = api;
          onRegisterBlockApi?.(api);
        }}
      />
      {publishMessage ? (
        <p
          className={`text-sm ${publishMessage.startsWith('Published') ? 'text-emerald-800' : 'text-red-700'}`}
        >
          {publishMessage}
        </p>
      ) : null}
      {status === 'error' ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200/80 bg-red-50/60 p-3">
          <p className="text-sm font-medium text-red-800">
            We couldn&apos;t keep this draft. Check your connection and try
            again.
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-stone-300/80 bg-white/80 text-stone-800 hover:bg-white"
            onClick={() => void flush()}
          >
            Try again
          </Button>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-stone-200/80 bg-white/78 p-3">
        <Button
          type="button"
          disabled={publishPending}
          className="rounded-full bg-stone-950 text-white hover:bg-stone-800"
          onClick={() => void publish()}
        >
          {publishPending ? 'Publishing...' : 'Publish to learners'}
        </Button>
        <Link
          href={`/admin/courses/${courseSlug}/preview/lessons/${lessonKey}`}
          className="text-sm font-medium text-amber-800 underline-offset-4 hover:text-amber-950 hover:underline"
        >
          Preview route
        </Link>
      </div>
      <p className="text-xs text-stone-500">
        Publishing updates what learners see when the course is live. Legacy
        Markdown and HTML stay available as fallback until BlockNote content is
        published.
      </p>
    </div>
  );
}
