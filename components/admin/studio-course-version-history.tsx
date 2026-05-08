'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, History, RotateCcw } from 'lucide-react';
import {
  createCourseVersionSnapshotAction,
  getCourseVersionDetailAction,
  listCourseVersionsAction,
  restoreCourseVersionAction,
  type CourseVersionListItem,
} from '@/lib/admin/versioning-actions';
import { cn } from '@/lib/utils';

const cardClass =
  'rounded-[1.75rem] border border-stone-200/85 bg-white/82 shadow-[0_18px_48px_-40px_rgba(120,83,45,0.4)]';

export function StudioCourseVersionHistory({
  courseSlug,
  onRestored,
}: {
  courseSlug: string;
  onRestored?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<CourseVersionListItem[] | null>(
    null
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [snapshotNote, setSnapshotNote] = useState('');
  const [pending, startTransition] = useTransition();
  const [restoreTarget, setRestoreTarget] = useState<number | null>(null);
  const [backupBeforeRestore, setBackupBeforeRestore] = useState(true);

  const refresh = useCallback(() => {
    startTransition(async () => {
      setLoadError(null);
      const res = await listCourseVersionsAction(courseSlug);
      if (!res.ok) {
        setLoadError('Could not load version history.');
        return;
      }
      setVersions(res.versions);
    });
  }, [courseSlug]);

  useEffect(() => {
    if (open && versions === null) refresh();
  }, [open, versions, refresh]);

  function createSnapshot() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set('courseSlug', courseSlug);
      fd.set('versionNote', snapshotNote.trim());
      const res = await createCourseVersionSnapshotAction(fd);
      if (res.ok) {
        setSnapshotNote('');
        refresh();
      }
    });
  }

  return (
    <section className={cn(cardClass, 'overflow-hidden')}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-stone-50/80"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <History className="size-4 text-violet-700" aria-hidden />
          <span className="text-sm font-semibold text-stone-900">
            Course settings history
          </span>
        </div>
        <span className="text-xs font-medium text-stone-500">
          {open ? 'Hide' : 'Show'}
        </span>
      </button>

      {open ? (
        <div className="space-y-4 border-t border-stone-200/80 px-5 pb-5 pt-4">
          <p className="text-xs leading-relaxed text-stone-600">
            Snapshots store title, description, hero path, access, and teaser
            fields. Restoring creates a new history entry and updates course
            settings — it does not delete past rows.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 space-y-1.5">
              <Label htmlFor="course-snap-note" className="text-xs text-stone-600">
                Snapshot note (optional)
              </Label>
              <Input
                id="course-snap-note"
                value={snapshotNote}
                onChange={(e) => setSnapshotNote(e.target.value)}
                placeholder="Before pricing change…"
                className="border-stone-200 bg-white text-sm"
              />
            </div>
            <Button
              type="button"
              size="sm"
              disabled={pending}
              className="rounded-full bg-stone-900 text-white hover:bg-stone-800"
              onClick={() => void createSnapshot()}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                'Create snapshot'
              )}
            </Button>
          </div>

          {loadError ? (
            <p className="text-sm text-red-700">{loadError}</p>
          ) : null}

          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {versions === null ? (
              <p className="flex items-center gap-2 text-sm text-stone-500">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Loading…
              </p>
            ) : versions.length === 0 ? (
              <p className="text-sm text-stone-500">
                No snapshots yet. Create one before major course setting changes.
              </p>
            ) : (
              versions.map((v) => (
                <div
                  key={v.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-stone-200/70 bg-[#fffaf2]/80 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-stone-900">
                      {v.previewTitle}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      {new Date(v.createdAt).toLocaleString()}
                      {v.versionNote ? ` · ${v.versionNote}` : ''}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="shrink-0 rounded-full border-stone-300/80"
                    onClick={() => setRestoreTarget(v.id)}
                  >
                    <RotateCcw className="mr-1.5 size-3.5" />
                    Restore…
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      {restoreTarget != null ? (
        <RestoreCourseVersionModal
          courseSlug={courseSlug}
          versionId={restoreTarget}
          backupFirst={backupBeforeRestore}
          onBackupChange={setBackupBeforeRestore}
          onClose={() => setRestoreTarget(null)}
          onDone={() => {
            setRestoreTarget(null);
            refresh();
            onRestored?.();
          }}
        />
      ) : null}
    </section>
  );
}

function RestoreCourseVersionModal({
  courseSlug,
  versionId,
  backupFirst,
  onBackupChange,
  onClose,
  onDone,
}: {
  courseSlug: string;
  versionId: number;
  backupFirst: boolean;
  onBackupChange: (v: boolean) => void;
  onClose: () => void;
  onDone: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [detail, setDetail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await getCourseVersionDetailAction(courseSlug, versionId);
      if (cancelled) return;
      if (!res.ok) {
        setDetail('Could not load this version.');
        return;
      }
      const s = res.version.snapshot;
      setDetail(
        `${s.title} · ${s.accessMode} · ${s.primaryLocale}. Hero: ${s.heroImagePath ?? 'none'}.`
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [courseSlug, versionId]);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-end justify-center bg-stone-950/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="restore-course-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className={cn(
          cardClass,
          'relative z-10 w-full max-w-md space-y-4 p-6 shadow-2xl'
        )}
      >
        <h2
          id="restore-course-title"
          className="text-base font-semibold text-stone-950"
        >
          Restore these course settings?
        </h2>
        <p className="text-sm leading-relaxed text-stone-600">
          This updates title, description, hero image path, access mode, locale,
          and teaser counts to match the snapshot. Learner lesson content is
          unchanged.
        </p>
        {detail ? (
          <p className="rounded-xl border border-stone-200/80 bg-stone-50/80 p-3 text-xs text-stone-700">
            {detail}
          </p>
        ) : null}
        <label className="flex cursor-pointer items-start gap-2 text-sm text-stone-800">
          <input
            type="checkbox"
            className="mt-1"
            checked={backupFirst}
            onChange={(e) => onBackupChange(e.target.checked)}
          />
          <span>
            Save a backup snapshot of current settings before restoring
            (recommended).
          </span>
        </label>
        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-stone-300/80"
            disabled={pending}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-full bg-violet-800 text-white hover:bg-violet-900"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                const fd = new FormData();
                fd.set('courseSlug', courseSlug);
                fd.set('versionId', String(versionId));
                fd.set('backupFirst', backupFirst ? '1' : '0');
                const res = await restoreCourseVersionAction(fd);
                if (res.ok) onDone();
              });
            }}
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              'Restore settings'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
