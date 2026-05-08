'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useRouter } from 'next/navigation';
import { ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateCourseHeroImageAction } from '@/lib/admin/course-actions';
import {
  isCatalogFallbackHero,
  resolveCourseHeroImagePath,
} from '@/lib/courses/course-hero';
import { cn } from '@/lib/utils';

const COVER_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif';

function validateCoverFile(file: File): string | null {
  const okTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
  if (file.type && okTypes.includes(file.type)) return null;
  const lower = file.name.toLowerCase();
  if (
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.webp') ||
    lower.endsWith('.gif')
  ) {
    return null;
  }
  return 'Please use a PNG, JPG, WebP, or GIF image.';
}

type Props = {
  courseId: number;
  courseSlug: string;
  dbHeroImagePath: string | null;
  /** When true, show a shorter heading (sidebar card). */
  compact?: boolean;
  className?: string;
  onUpdated?: () => void;
  /** Notify parent to disable other saves while upload runs. */
  onUploadingChange?: (uploading: boolean) => void;
};

export function CourseCoverEditor({
  courseId,
  courseSlug,
  dbHeroImagePath,
  compact,
  className,
  onUpdated,
  onUploadingChange,
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const baseId = useId();
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [heroPending, startHeroTransition] = useTransition();
  const [manualUrl, setManualUrl] = useState(dbHeroImagePath ?? '');
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    setManualUrl(dbHeroImagePath ?? '');
  }, [dbHeroImagePath]);

  useEffect(() => {
    onUploadingChange?.(uploading);
  }, [uploading, onUploadingChange]);

  const resolvedUrl = resolveCourseHeroImagePath(
    courseSlug,
    dbHeroImagePath
  );
  const catalogFallback = isCatalogFallbackHero(courseSlug, dbHeroImagePath);
  const hasCustomDbHero = Boolean(dbHeroImagePath?.trim());

  const refresh = useCallback(() => {
    onUpdated?.();
    router.refresh();
  }, [onUpdated, router]);

  const uploadFile = useCallback(
    async (file: File) => {
      const v = validateCoverFile(file);
      if (v) {
        setUploadError(v);
        return;
      }
      setUploadError(null);
      setUploading(true);
      const fd = new FormData();
      fd.set('file', file);
      fd.set('prefix', 'course-covers');
      fd.set('applyAsCourseCoverForCourseId', String(courseId));

      try {
        const res = await fetch('/api/admin/media/upload', {
          method: 'POST',
          body: fd,
          credentials: 'same-origin',
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          detail?: string;
          message?: string;
          missingEnv?: string[];
        };
        if (!res.ok) {
          const parts = [
            data.message?.trim(),
            data.detail?.trim()
              ? `${data.error ?? 'Upload failed'}: ${data.detail}`
              : data.error,
            data.missingEnv?.length
              ? `Missing: ${data.missingEnv.join(' · ')}`
              : null,
          ].filter(Boolean);
          setUploadError(parts.length ? parts.join(' — ') : 'Upload failed');
          return;
        }
        if (inputRef.current) inputRef.current.value = '';
        refresh();
      } catch {
        setUploadError('Network error — check your connection and try again.');
      } finally {
        setUploading(false);
      }
    },
    [courseId, refresh]
  );

  const onFiles = useCallback(
    (list: FileList | null) => {
      if (!list?.length) return;
      const file = list[0];
      if (file) void uploadFile(file);
    },
    [uploadFile]
  );

  const applyManualUrl = useCallback(() => {
    setUploadError(null);
    startHeroTransition(async () => {
      const fd = new FormData();
      fd.set('courseSlug', courseSlug);
      fd.set('heroImagePath', manualUrl.trim());
      const res = await updateCourseHeroImageAction(fd);
      if (!res.ok) {
        setUploadError(
          res.error === 'not_found'
            ? 'Course not found.'
            : 'Could not save image URL.'
        );
        return;
      }
      refresh();
    });
  }, [courseSlug, manualUrl, refresh]);

  const removeCustomCover = useCallback(() => {
    if (!hasCustomDbHero) return;
    if (
      !confirm(
        'Remove this cover? Learners will see the catalog default image if one exists for this course slug.'
      )
    ) {
      return;
    }
    setUploadError(null);
    startHeroTransition(async () => {
      const fd = new FormData();
      fd.set('courseSlug', courseSlug);
      fd.set('heroImagePath', '');
      const res = await updateCourseHeroImageAction(fd);
      if (!res.ok) {
        setUploadError('Could not remove cover.');
        return;
      }
      refresh();
    });
  }, [courseSlug, hasCustomDbHero, refresh]);

  const busy = uploading || heroPending;

  return (
    <div className={cn('space-y-3', className)}>
      {!compact ? (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
            Course cover
          </p>
          <h3 className="mt-1 text-base font-semibold tracking-tight text-stone-950">
            Cover image
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-stone-600">
            This image appears on course cards, catalog pages, and the learner
            dashboard.
          </p>
        </div>
      ) : (
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
          Course cover
        </p>
      )}

      {resolvedUrl ? (
        <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-stone-100/80 shadow-inner">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin preview; arbitrary learner URLs */}
          <img
            src={resolvedUrl}
            alt=""
            className="aspect-[21/9] w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex aspect-[21/9] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-stone-300/80 bg-stone-50/90 text-center">
          <ImageIcon className="size-10 text-stone-400" aria-hidden />
          <p className="px-4 text-sm text-stone-600">No cover image yet</p>
        </div>
      )}

      {catalogFallback ? (
        <p className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs leading-relaxed text-amber-950">
          Showing the <span className="font-medium">catalog default</span> for
          this slug. Upload or paste a URL to set a custom cover stored on this
          course.
        </p>
      ) : null}

      <div
        className={cn(
          'rounded-[1.25rem] border border-dashed border-stone-300/70 bg-white/80 p-5 shadow-[0_14px_40px_-36px_rgba(120,83,45,0.38)] transition-colors',
          dragOver && 'border-amber-400/70 bg-amber-50/90'
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
          accept={COVER_ACCEPT}
          disabled={uploading}
          onChange={(e) => onFiles(e.target.files)}
        />
        <p className="text-sm font-medium text-stone-950">
          Drag an image here or click to upload
        </p>
        <p className="mt-1 text-xs leading-relaxed text-stone-600">
          Recommended: 1600×900 PNG or JPG. PNG, JPG, WebP, or GIF — up to 25 MB.
        </p>
        {uploading ? (
          <div className="mt-3 flex items-center gap-2 text-sm text-stone-700">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Uploading…
          </div>
        ) : null}
        {uploadError ? (
          <p className="mt-3 text-xs font-medium text-red-700">{uploadError}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={busy}
            className="rounded-full bg-stone-950 text-white hover:bg-stone-800"
            onClick={() => inputRef.current?.click()}
          >
            {resolvedUrl ? 'Replace image' : 'Upload image'}
          </Button>
          {hasCustomDbHero ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              className="rounded-full border-stone-300/80 bg-white/90 text-stone-900"
              onClick={removeCustomCover}
            >
              Remove image
            </Button>
          ) : null}
        </div>
      </div>

      <div className="border-t border-stone-200/80 pt-3">
        <button
          type="button"
          className="text-xs font-medium text-stone-600 underline-offset-2 hover:text-stone-900 hover:underline"
          onClick={() => setAdvancedOpen((o) => !o)}
        >
          {advancedOpen ? 'Hide' : 'Image URL'} (advanced)
        </button>
        {advancedOpen ? (
          <div className="mt-3 space-y-2">
            <Label htmlFor={`${baseId}-hero-url`} className="text-stone-800">
              Cover image URL
            </Label>
            <Input
              id={`${baseId}-hero-url`}
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="/courses/hero.png or https://…"
              disabled={busy}
              className="border-stone-200 bg-white text-stone-950"
            />
            <p className="text-[11px] leading-relaxed text-stone-500">
              Path under <span className="font-mono text-stone-600">public/</span>{' '}
              or a full HTTPS URL. Saves only this field.
            </p>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={
                busy || manualUrl.trim() === (dbHeroImagePath ?? '').trim()
              }
              className="rounded-full border-stone-300/80"
              onClick={applyManualUrl}
            >
              {heroPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  Applying…
                </>
              ) : (
                'Apply URL'
              )}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
