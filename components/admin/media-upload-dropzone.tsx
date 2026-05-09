'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type UploadState = { kind: 'idle' } | { kind: 'uploading' } | { kind: 'error'; msg: string };

export function MediaUploadDropzone({
  attachLessonId,
  attachCourseId,
  className,
}: {
  /** When set, upload also creates a lesson placement in one step */
  attachLessonId?: number;
  attachCourseId?: number;
  className?: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [state, setState] = useState<UploadState>({ kind: 'idle' });

  const uploadFile = useCallback(
    async (file: File) => {
      setState({ kind: 'uploading' });
      const fd = new FormData();
      fd.set('file', file);
      fd.set('prefix', 'uploads');
      if (attachLessonId != null) {
        fd.set('attachLessonId', String(attachLessonId));
      }
      if (attachCourseId != null) {
        fd.set('attachCourseId', String(attachCourseId));
      }

      try {
        const res = await fetch('/api/admin/media/upload', {
          method: 'POST',
          body: fd,
          credentials: 'same-origin',
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
          missingEnv?: string[];
          detail?: string;
        };
        if (!res.ok) {
          const parts = [
            data.message?.trim(),
            data.detail?.trim(),
            data.missingEnv?.length
              ? `Missing: ${data.missingEnv.join(' · ')}`
              : null,
            data.error,
          ].filter(Boolean);
          setState({
            kind: 'error',
            msg: parts.length ? parts.join(' — ') : 'Upload failed',
          });
          return;
        }
        setState({ kind: 'idle' });
        router.refresh();
      } catch {
        setState({ kind: 'error', msg: 'Network error' });
      }
    },
    [attachCourseId, attachLessonId, router]
  );

  const onFiles = useCallback(
    (list: FileList | null) => {
      if (!list?.length) return;
      const file = list[0];
      if (file) void uploadFile(file);
    },
    [uploadFile]
  );

  return (
    <div
      className={cn(
        'rounded-[1.75rem] border border-dashed border-stone-300/70 bg-white/75 p-6 shadow-[0_18px_52px_-38px_rgba(120,83,45,0.35)] backdrop-blur-sm transition-colors',
        dragOver && 'border-amber-400/70 bg-amber-50/90',
        className
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        onFiles(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*,video/*,audio/*,application/pdf"
        onChange={(e) => onFiles(e.target.files)}
      />
      <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="text-sm font-medium text-stone-950">
            Drop a file here or choose one
          </p>
          <p className="mt-1 text-xs text-stone-600">
            Images, video, audio, or PDF — up to 25 MB. We&apos;ll add it to your
            library when it&apos;s ready.
          </p>
          {state.kind === 'error' && (
            <p className="mt-2 text-xs font-medium text-red-700">{state.msg}</p>
          )}
        </div>
        <Button
          type="button"
          disabled={state.kind === 'uploading'}
          aria-busy={state.kind === 'uploading'}
          className="shrink-0 rounded-full bg-stone-950 text-white hover:bg-stone-800"
          onClick={() => inputRef.current?.click()}
        >
          {state.kind === 'uploading' ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              Choose file
            </>
          ) : (
            'Choose file'
          )}
        </Button>
      </div>
    </div>
  );
}
