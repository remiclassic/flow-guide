'use client';

import { useCallback, useMemo, useRef, useState, useTransition } from 'react';
import { attachMediaToLessonAction } from '@/lib/admin/media-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { MediaAsset } from '@/lib/db/schema';

export type MediaPickerRow = Pick<
  MediaAsset,
  'publicId' | 'kind' | 'originalFilename' | 'storageKey' | 'publicUrl'
>;

export function MediaAttachButton({
  courseSlug,
  lessonKey,
  candidates,
  onAttached,
}: {
  courseSlug: string;
  lessonKey: string;
  candidates: MediaPickerRow[];
  onAttached?: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [q, setQ] = useState('');
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return candidates;
    return candidates.filter((c) => {
      const name = (c.originalFilename || c.storageKey).toLowerCase();
      return name.includes(s) || c.kind.includes(s);
    });
  }, [candidates, q]);

  const attach = useCallback(
    (publicId: string) => {
      startTransition(async () => {
        const fd = new FormData();
        fd.set('courseSlug', courseSlug);
        fd.set('lessonKey', lessonKey);
        fd.set('mediaAssetPublicId', publicId);
        await attachMediaToLessonAction(fd);
        dialogRef.current?.close();
        onAttached?.();
      });
    },
    [courseSlug, lessonKey, onAttached]
  );

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="border-stone-300/80 bg-white/80 text-stone-800 hover:bg-white"
        onClick={() => dialogRef.current?.showModal()}
      >
        Add from library
      </Button>
      <dialog
        ref={dialogRef}
        className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,520px)] -translate-x-1/2 -translate-y-1/2 rounded-[1.75rem] border border-white/85 bg-[#fbf7f0] p-0 text-stone-950 shadow-[0_28px_90px_-44px_rgba(120,83,45,0.55)] backdrop:bg-stone-950/40"
      >
        <div className="border-b border-stone-200/80 bg-white/80 px-4 py-3 backdrop-blur-sm">
          <p className="text-sm font-semibold text-stone-950">Choose from library</p>
          <p className="mt-0.5 text-xs text-stone-600">
            Pick something you have already uploaded. You can reuse the same file
            in many lessons.
          </p>
        </div>
        <div className="max-h-[min(70vh,420px)] space-y-3 overflow-y-auto p-4">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or type"
            className="border-stone-200 bg-white text-stone-950 placeholder:text-stone-400"
          />
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-600">
              No matches. Upload a file first, or clear your search.
            </p>
          ) : (
            <ul className="space-y-2">
              {filtered.map((c) => {
                const label =
                  c.originalFilename?.trim() ||
                  c.storageKey.split('/').pop() ||
                  c.publicId;
                return (
                  <li
                    key={c.publicId}
                    className="flex items-center gap-2 rounded-2xl border border-white/85 bg-white/82 px-3 py-2 shadow-sm backdrop-blur-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-stone-950">{label}</p>
                      <p className="text-[10px] uppercase tracking-wide text-stone-500">
                        {c.kind}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      disabled={pending}
                      className="shrink-0 rounded-full bg-stone-950 text-white hover:bg-stone-800"
                      onClick={() => attach(c.publicId)}
                    >
                      Attach
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-stone-200/80 bg-white/60 px-4 py-3 backdrop-blur-sm">
          <Button
            type="button"
            variant="outline"
            className="border-stone-300/80 bg-white/90 text-stone-800 hover:bg-white"
            onClick={() => dialogRef.current?.close()}
          >
            Close
          </Button>
        </div>
      </dialog>
    </>
  );
}
