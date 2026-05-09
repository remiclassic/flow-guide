'use client';

import {
  memo,
  useActionState,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Copy,
  GripVertical,
  Loader2,
  Maximize2,
  Monitor,
  PanelRightClose,
  Plus,
  Redo2,
  Smartphone,
  Trash2,
  Undo2,
  X,
} from 'lucide-react';
import { MarkdownLessonBody } from '@/components/courses/markdown-lesson-body';
import { BlockNoteLessonBody } from '@/components/courses/blocknote-lesson-body';
import { LessonInlinePlacements } from '@/components/courses/lesson-inline-placements';
import { LessonSectionProse } from '@/components/courses/lesson-section-prose';
import { LessonMarkdownEditor } from '@/components/admin/lesson-markdown-editor';
import { StudioCourseVersionHistory } from '@/components/admin/studio-course-version-history';
import { StudioLessonVersionHistory } from '@/components/admin/studio-lesson-version-history';
import { StudioLessonKnowledgeQuizEditor } from '@/components/admin/studio-lesson-knowledge-quiz-editor';
import {
  lessonToStudioFieldsState,
  studioFieldsFingerprint,
  studioLessonFieldsToFormData,
  type StudioLessonFieldsState,
} from '@/components/admin/studio-lesson-form-state';
import { KnowledgeQuizSection } from '@/components/courses/knowledge-quiz-section';
import { MediaUploadDropzone } from '@/components/admin/media-upload-dropzone';
import { MediaAttachButton } from '@/components/admin/media-attach-button';
import { CourseCoverEditor } from '@/components/admin/course-cover-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  createLessonAction,
  createModuleAction,
  reorderLessonsAction,
  reorderModulesAction,
  setCourseLifecycleAction,
  softDeleteCourseAction,
  softDeleteLessonAction,
  softDeleteModuleAction,
  updateCourseAction,
} from '@/lib/admin/course-actions';
import {
  attachLessonEmbedAction,
  autosaveLessonStudioFieldsAction,
  duplicateLessonAction,
  duplicateModuleAction,
  reorderLessonAssetsAction,
  updateLessonStudioFieldsAction,
} from '@/lib/admin/studio-actions';
import { detachLessonPlacementAction } from '@/lib/admin/media-actions';
import { importLegacyCourseContentAction } from '@/lib/admin/legacy-import-actions';
import { lessonMarkdownHasUnpublishedChanges } from '@/lib/admin/studio-lesson-state';
import {
  lessonBlocksContainBlockTypes,
  lessonBlocksHaveContent,
} from '@/lib/courses/blocknote-content';
import type { LegacyCourseImportSummary } from '@/lib/courses/legacy-import-types';
import { toPlacementViewModels } from '@/lib/courses/map-lesson-placements';
import type { Course, CourseModule, Lesson } from '@/lib/db/schema';
import type { MediaAsset } from '@/lib/db/schema';
import type { LessonExperiencePlacementRow } from '@/components/courses/lesson-experience';
import { cn, safeTimeoutDelay } from '@/lib/utils';
import { useDebouncedUndoable } from '@/hooks/use-debounced-undoable';

type OutlineModule = CourseModule & { lessons: Lesson[] };

export type CourseStudioClientProps = {
  courseSlug: string;
  course: Course;
  outline: OutlineModule[];
  placementsByLesson: Record<string, LessonExperiencePlacementRow[]>;
  libraryCandidates: Array<
    Pick<
      MediaAsset,
      'publicId' | 'kind' | 'originalFilename' | 'storageKey' | 'publicUrl'
    >
  >;
};

function findLesson(outline: OutlineModule[], lessonKey: string | null) {
  if (!lessonKey) return null;
  for (const mod of outline) {
    const lesson = mod.lessons.find((l) => l.lessonKey === lessonKey);
    if (lesson) return { module: mod, lesson };
  }
  return null;
}

const studioCardClass =
  'rounded-[1.75rem] border border-white/85 bg-white/82 shadow-[0_22px_64px_-44px_rgba(120,83,45,0.44)] backdrop-blur-sm';

const studioTextareaClass =
  'w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm leading-relaxed text-stone-950 shadow-inner outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-200/70';

function StudioFormSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn(studioCardClass, 'space-y-5 p-5 sm:p-6')}>
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
            {eyebrow}
          </p>
        ) : null}
        <h3 className="mt-1 text-base font-semibold tracking-tight text-stone-950">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 text-sm leading-relaxed text-stone-600">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function StudioCourseSettingsForm({
  course,
  courseSlug,
  onSaved,
}: {
  course: Course;
  courseSlug: string;
  onSaved: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [coverUploading, setCoverUploading] = useState(false);

  return (
    <div className="w-full max-w-none space-y-6 text-left">
      <div className={cn(studioCardClass, 'p-6')}>
        <CourseCoverEditor
          courseId={course.id}
          courseSlug={courseSlug}
          dbHeroImagePath={course.heroImagePath}
          onUpdated={onSaved}
          onUploadingChange={setCoverUploading}
        />
      </div>
      <form
        className={cn(studioCardClass, 'space-y-5 p-6')}
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            await updateCourseAction(fd);
            onSaved();
          });
        }}
      >
        <input type="hidden" name="courseSlug" value={courseSlug} />
        <div>
          <h3 className="text-sm font-semibold text-stone-950">Course details</h3>
          <p className="mt-1 text-xs text-stone-500">
            Title, access, and teaser settings apply across every lesson.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="cs-title">Course title</Label>
          <Input
            id="cs-title"
            name="title"
            required
            defaultValue={course.title}
            className="border-stone-200 bg-white text-stone-950"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cs-description">Description</Label>
          <textarea
            id="cs-description"
            name="description"
            rows={4}
            defaultValue={course.description ?? ''}
            className="w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-950"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cs-locale">Primary language</Label>
            <select
              id="cs-locale"
              name="primaryLocale"
              defaultValue={course.primaryLocale}
              className="w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-950"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cs-access">Access</Label>
            <select
              id="cs-access"
              name="accessMode"
              defaultValue={course.accessMode}
              className="w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-950"
            >
              <option value="subscription">Subscription</option>
              <option value="free">Free</option>
            </select>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="cs-mod-count">Teaser modules</Label>
            <Input
              id="cs-mod-count"
              name="previewModuleCount"
              type="number"
              min={0}
              defaultValue={course.previewModuleCount ?? ''}
              className="border-stone-200 bg-white text-stone-950"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cs-less-count">Teaser lessons</Label>
            <Input
              id="cs-less-count"
              name="previewLessonCount"
              type="number"
              min={0}
              defaultValue={course.previewLessonCount ?? ''}
              className="border-stone-200 bg-white text-stone-950"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cs-minutes">Teaser minutes</Label>
            <Input
              id="cs-minutes"
              name="previewEstMinutes"
              type="number"
              min={0}
              defaultValue={course.previewEstMinutes ?? ''}
              className="border-stone-200 bg-white text-stone-950"
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={pending || coverUploading}
          className="rounded-full bg-stone-950 text-white hover:bg-stone-800"
        >
          Save course details
        </Button>
      </form>

      <StudioCourseVersionHistory
        courseSlug={courseSlug}
        onRestored={onSaved}
      />

      <section className="rounded-[1.75rem] border border-red-200 bg-red-50/90 p-6 shadow-[0_18px_48px_-36px_rgba(185,28,28,0.35)]">
        <h3 className="text-sm font-semibold text-red-900">Danger zone</h3>
        <p className="mt-1 text-xs text-red-800/85">
          Soft-delete hides the course from the hub and learner catalog. Progress
          rows stay in the database.
        </p>
        <form action={softDeleteCourseAction} className="mt-4">
          <input type="hidden" name="courseSlug" value={courseSlug} />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="border-red-300 text-red-800 hover:bg-red-100"
          >
            Remove course
          </Button>
        </form>
      </section>
    </div>
  );
}

const SortableModule = memo(function SortableModule({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-2xl border border-white/85 bg-white/78 shadow-[0_18px_52px_-38px_rgba(120,83,45,0.35)]',
        isDragging && 'z-10 opacity-90 ring-2 ring-amber-400/40'
      )}
    >
      <div className="flex items-stretch gap-0">
        <button
          type="button"
          className="flex w-9 shrink-0 items-center justify-center rounded-l-2xl border-r border-stone-200/80 bg-[#fffaf2]/80 text-stone-500 hover:bg-[#fffaf2]"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder module"
        >
          <GripVertical className="size-4" />
        </button>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
});

/** Memoized pick row — only re-renders when its props change (selection, labels). */
const OutlineLessonPickButton = memo(function OutlineLessonPickButton({
  lessonKey,
  titleEn,
  showDraftOnly,
  dirty,
  isActive,
  onSelectLesson,
}: {
  lessonKey: string;
  titleEn: string;
  showDraftOnly: boolean;
  dirty: boolean;
  isActive: boolean;
  onSelectLesson: (key: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelectLesson(lessonKey)}
      className={cn(
        'w-full px-3 py-2.5 text-left text-sm transition-colors',
        isActive ? 'bg-stone-950 text-white' : 'text-stone-800 hover:bg-stone-50'
      )}
    >
      <span className="line-clamp-2 font-medium leading-snug">{titleEn}</span>
      <span className="mt-0.5 flex flex-wrap gap-1">
        {showDraftOnly ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900">
            Draft only
          </span>
        ) : null}
        {dirty ? (
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-900">
            Unpublished edits
          </span>
        ) : null}
      </span>
    </button>
  );
});

const SortableOutlineLesson = memo(function SortableOutlineLesson({
  lessonId,
  lessonKey,
  titleEn,
  showDraftOnly,
  dirty,
  isActive,
  onSelectLesson,
}: {
  lessonId: number;
  lessonKey: string;
  titleEn: string;
  showDraftOnly: boolean;
  dirty: boolean;
  isActive: boolean;
  onSelectLesson: (key: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `les-${lessonId}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-stretch gap-0 rounded-xl border border-stone-200/70 bg-white/90',
        isActive && 'ring-2 ring-stone-950/15',
        isDragging && 'z-10 opacity-90 shadow-md'
      )}
    >
      <button
        type="button"
        className="flex w-8 shrink-0 items-center justify-center rounded-l-xl border-r border-stone-200/80 text-stone-400 hover:bg-stone-50"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder lesson"
      >
        <GripVertical className="size-3.5" />
      </button>
      <div className="min-w-0 flex-1">
        <OutlineLessonPickButton
          lessonKey={lessonKey}
          titleEn={titleEn}
          showDraftOnly={showDraftOnly}
          dirty={dirty}
          isActive={isActive}
          onSelectLesson={onSelectLesson}
        />
      </div>
    </div>
  );
});

/** Same chrome as SortableModule without dnd-kit (SSR + first paint — avoids DndDescribedBy ID mismatch). */
const StaticModuleShell = memo(function StaticModuleShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/85 bg-white/78 shadow-[0_18px_52px_-38px_rgba(120,83,45,0.35)]">
      <div className="flex items-stretch gap-0">
        <div
          className="flex w-9 shrink-0 items-center justify-center rounded-l-2xl border-r border-stone-200/80 bg-[#fffaf2]/80 text-stone-400"
          aria-hidden
        >
          <GripVertical className="size-4" />
        </div>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
});

/** Same chrome as SortableLesson without dnd-kit. */
const StaticLessonShell = memo(function StaticLessonShell({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex items-stretch gap-0 rounded-xl border border-stone-200/70 bg-white/90',
        active && 'ring-2 ring-stone-950/15'
      )}
    >
      <div
        className="flex w-8 shrink-0 items-center justify-center rounded-l-xl border-r border-stone-200/80 text-stone-400"
        aria-hidden
      >
        <GripVertical className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
});

export function CourseStudioClient({
  courseSlug,
  course,
  outline,
  placementsByLesson,
  libraryCandidates,
}: CourseStudioClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [importSummary, importFormAction, importPending] = useActionState(
    importLegacyCourseContentAction,
    null as LegacyCourseImportSummary | null
  );

  useEffect(() => {
    if (importSummary?.ok) {
      router.refresh();
    }
  }, [importSummary, router]);
  const lessonParam = searchParams.get('lesson');
  const [previewSource, setPreviewSource] = useState<'draft' | 'published'>(
    'draft'
  );
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [previewLayout, setPreviewLayout] = useState<
    'dock' | 'collapsed' | 'fullscreen'
  >('dock');
  const [previewPortalReady, setPreviewPortalReady] = useState(false);
  const [pending, startTransition] = useTransition();
  const studioHistRef = useRef({
    undo: () => {},
    redo: () => {},
    canUndo: false,
    canRedo: false,
  });
  const blockHistRef = useRef({
    caps: { canUndo: false, canRedo: false },
    api: null as { undo: () => void; redo: () => void } | null,
  });
  /** dnd-kit a11y IDs (e.g. DndDescribedBy) differ SSR vs client — mount DnD only after hydration. */
  const [outlineDndMounted, setOutlineDndMounted] = useState(false);
  /** Collapsed modules skip inner SortableContext (fewer sortable nodes = lighter DnD + faster drags). */
  const [collapsedModuleIds, setCollapsedModuleIds] = useState<ReadonlySet<number>>(
    () => new Set()
  );

  useEffect(() => {
    startTransition(() => {
      setOutlineDndMounted(true);
    });
  }, [startTransition]);

  useEffect(() => {
    setPreviewPortalReady(true);
  }, []);

  useEffect(() => {
    if (previewLayout !== 'fullscreen') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [previewLayout]);

  useEffect(() => {
    if (previewLayout !== 'fullscreen') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewLayout('dock');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [previewLayout]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key.toLowerCase() !== 'z') return;
      const t = e.target as HTMLElement | null;
      if (t?.closest?.('.ProseMirror')) return;
      e.preventDefault();
      const inStudioField = t?.closest?.('[data-studio-lesson-fields="1"]');
      if (inStudioField) {
        if (e.shiftKey) {
          if (studioHistRef.current.canRedo) studioHistRef.current.redo();
        } else if (studioHistRef.current.canUndo) {
          studioHistRef.current.undo();
        }
        return;
      }
      if (e.shiftKey) {
        if (blockHistRef.current.caps.canRedo) {
          blockHistRef.current.api?.redo();
        }
      } else if (blockHistRef.current.caps.canUndo) {
        blockHistRef.current.api?.undo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggleModuleCollapsed = useCallback((moduleId: number) => {
    setCollapsedModuleIds((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }, []);

  const onRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const selectedLessonKey = lessonParam;

  const sortedOutline = useMemo(
    () =>
      [...outline]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((mod) => ({
          ...mod,
          lessons: [...mod.lessons].sort((a, b) => a.sortOrder - b.sortOrder),
        })),
    [outline]
  );

  const selectLesson = useCallback(
    (key: string | null) => {
      const path =
        key == null
          ? `/admin/courses/${courseSlug}/studio`
          : `/admin/courses/${courseSlug}/studio?lesson=${encodeURIComponent(key)}`;
      router.replace(path);
    },
    [courseSlug, router]
  );

  /** Stable `(key: string) => void` for memoized outline rows — avoids new closures per render. */
  const selectOutlineLesson = useCallback(
    (key: string) => {
      selectLesson(key);
    },
    [selectLesson]
  );

  const found = useMemo(
    () => findLesson(sortedOutline, selectedLessonKey),
    [sortedOutline, selectedLessonKey]
  );

  const flatLessons = useMemo(() => {
    const keys: string[] = [];
    for (const m of sortedOutline) {
      for (const l of m.lessons) keys.push(l.lessonKey);
    }
    return keys;
  }, [sortedOutline]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const moduleIds = useMemo(
    () => sortedOutline.map((m) => `mod-${m.id}`),
    [sortedOutline]
  );

  /** One DndContext for the whole outline — avoids nested context overhead and duplicate a11y subtrees. */
  const onOutlineDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const a = String(active.id);
      const o = String(over.id);

      if (a.startsWith('mod-') && o.startsWith('mod-')) {
        const sorted = [...outline].sort((x, y) => x.sortOrder - y.sortOrder);
        const oldIndex = sorted.findIndex((m) => `mod-${m.id}` === active.id);
        const newIndex = sorted.findIndex((m) => `mod-${m.id}` === over.id);
        if (oldIndex < 0 || newIndex < 0) return;
        const next = arrayMove(sorted, oldIndex, newIndex);
        const orderedIds = next.map((m) => m.id).join(',');
        startTransition(async () => {
          const fd = new FormData();
          fd.set('courseSlug', courseSlug);
          fd.set('orderedIds', orderedIds);
          await reorderModulesAction(fd);
          router.refresh();
        });
        return;
      }

      if (a.startsWith('les-') && o.startsWith('les-')) {
        const aid = Number(a.slice(4));
        const oid = Number(o.slice(4));
        for (const mod of sortedOutline) {
          const lessonIdsOrdered = mod.lessons.map((l) => l.id);
          if (!lessonIdsOrdered.includes(aid) || !lessonIdsOrdered.includes(oid)) {
            continue;
          }
          const oldIndex = lessonIdsOrdered.indexOf(aid);
          const newIndex = lessonIdsOrdered.indexOf(oid);
          const nextOrder = arrayMove(lessonIdsOrdered, oldIndex, newIndex);
          startTransition(async () => {
            const fd = new FormData();
            fd.set('courseSlug', courseSlug);
            fd.set('moduleSlug', mod.slug);
            fd.set('orderedIds', nextOrder.join(','));
            await reorderLessonsAction(fd);
            router.refresh();
          });
          return;
        }
      }
    },
    [outline, sortedOutline, courseSlug, router, startTransition]
  );

  const placementRowsForSelected = useMemo(
    () => (found ? placementsByLesson[String(found.lesson.id)] ?? [] : []),
    [found, placementsByLesson]
  );

  const markdownForPreview =
    previewSource === 'draft'
      ? found?.lesson.draftBodyMarkdown?.trim() ||
        found?.lesson.publishedBodyMarkdown?.trim() ||
        null
      : found?.lesson.publishedBodyMarkdown?.trim() ||
        found?.lesson.draftBodyMarkdown?.trim() ||
        null;
  const blockNoteForPreview =
    previewSource === 'draft'
      ? lessonBlocksHaveContent(found?.lesson.draftBodyBlocks)
        ? found!.lesson.draftBodyBlocks
        : lessonBlocksHaveContent(found?.lesson.publishedBodyBlocks)
          ? found!.lesson.publishedBodyBlocks
          : null
      : lessonBlocksHaveContent(found?.lesson.publishedBodyBlocks)
        ? found!.lesson.publishedBodyBlocks
        : lessonBlocksHaveContent(found?.lesson.draftBodyBlocks)
          ? found!.lesson.draftBodyBlocks
          : null;

  const selectedModuleIndex = found
    ? sortedOutline.findIndex((m) => m.id === found.module.id)
    : -1;

  return (
    <div className="w-full max-w-none space-y-6">
      <section className={cn(studioCardClass, 'p-5 sm:p-6')}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
              Course Studio
            </p>
            <h1 className="mt-2 truncate text-3xl font-semibold tracking-[-0.04em] text-stone-950 sm:text-4xl">
              {course.title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-600">
              Build modules, edit lesson content, attach media, and preview the
              learner experience from one full-width workspace.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="rounded-full border-violet-200 bg-violet-50/80 px-3 py-1 text-violet-900"
            >
              {course.lifecycleStatus.replace(/_/g, ' ')}
            </Badge>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-stone-300/80 bg-white/80"
            >
              <Link href={`/admin/courses/${courseSlug}/preview`}>View course</Link>
            </Button>
            <form
              action={importFormAction}
              className="flex flex-wrap items-center gap-2"
            >
              <input type="hidden" name="courseSlug" value={courseSlug} />
              <label className="flex cursor-pointer items-center gap-2 rounded-full border border-stone-300/70 bg-white/70 px-3 py-1.5 text-xs text-stone-700">
                <input
                  type="checkbox"
                  name="force"
                  value="true"
                  className="size-3.5 rounded border-stone-400"
                />
                Force overwrite
              </label>
              <Button
                type="submit"
                variant="secondary"
                disabled={importPending}
                className="rounded-full border-stone-300/80 bg-amber-50/90 text-stone-900 hover:bg-amber-100/90"
              >
                Import from legacy course
              </Button>
            </form>
          </div>
        </div>
        {importSummary ? (
          <div className="mt-5 rounded-2xl border border-stone-200/90 bg-stone-50/90 p-4 shadow-inner">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-700">
              {importSummary.ok ? 'Import log' : 'Import failed'}
            </p>
            <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-stone-600">
              {importSummary.logLines.join('\n')}
            </pre>
          </div>
        ) : null}
      </section>

      <div
        className={cn(
          'grid w-full max-w-none gap-6',
          previewLayout === 'dock'
            ? 'xl:grid-cols-[minmax(300px,360px)_minmax(0,1fr)_minmax(420px,520px)] 2xl:grid-cols-[340px_minmax(720px,1fr)_520px]'
            : 'xl:grid-cols-[minmax(300px,360px)_minmax(0,1fr)] 2xl:grid-cols-[340px_minmax(720px,1fr)]'
        )}
      >
      {/* Left — outline */}
      <div className="flex w-full min-w-0 flex-col gap-3">
        <div className={cn(studioCardClass, 'p-4')}>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              Course
            </p>
            <h2 className="truncate text-lg font-semibold tracking-tight text-stone-950">
              {course.title}
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              {course.lifecycleStatus.replace(/_/g, ' ')}
            </p>
          </div>
          <div className="mt-4 border-t border-stone-200/80 pt-4">
            <CourseCoverEditor
              compact
              courseId={course.id}
              courseSlug={courseSlug}
              dbHeroImagePath={course.heroImagePath}
              onUpdated={onRefresh}
            />
          </div>
        </div>

        {outlineDndMounted ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onOutlineDragEnd}
          >
            <SortableContext items={moduleIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {sortedOutline.map((mod) => {
                  const lessonsSorted = mod.lessons;
                  const lesIds = lessonsSorted.map((l) => `les-${l.id}`);
                  const expanded = !collapsedModuleIds.has(mod.id);
                  return (
                    <SortableModule key={mod.id} id={`mod-${mod.id}`}>
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex min-w-0 flex-1 items-start gap-1">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="mt-0.5 size-7 shrink-0 rounded-full text-stone-500"
                              onClick={() => toggleModuleCollapsed(mod.id)}
                              aria-expanded={expanded}
                              aria-label={
                                expanded
                                  ? 'Collapse lesson list'
                                  : 'Expand lesson list'
                              }
                            >
                              {expanded ? (
                                <ChevronDown className="size-4" />
                              ) : (
                                <ChevronRight className="size-4" />
                              )}
                            </Button>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-stone-900">
                                {mod.titleEn}
                              </p>
                              <p className="truncate text-xs text-stone-500">
                                /{mod.slug}
                              </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 gap-1">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="size-8 rounded-full text-stone-600"
                              disabled={pending}
                              onClick={() => {
                                if (
                                  !confirm(
                                    'Duplicate this module and all its lessons?'
                                  )
                                )
                                  return;
                                startTransition(async () => {
                                  const fd = new FormData();
                                  fd.set('courseSlug', courseSlug);
                                  fd.set('moduleSlug', mod.slug);
                                  await duplicateModuleAction(fd);
                                  onRefresh();
                                });
                              }}
                              aria-label="Duplicate module"
                            >
                              <Copy className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="size-8 rounded-full text-red-700 hover:text-red-800"
                              disabled={pending}
                              onClick={() => {
                                if (
                                  !confirm(
                                    'Remove this module? Lessons inside will be hidden.'
                                  )
                                )
                                  return;
                                startTransition(async () => {
                                  const fd = new FormData();
                                  fd.set('courseSlug', courseSlug);
                                  fd.set('moduleSlug', mod.slug);
                                  await softDeleteModuleAction(fd);
                                  selectLesson(null);
                                  onRefresh();
                                });
                              }}
                              aria-label="Delete module"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>

                        {expanded ? (
                          <SortableContext
                            items={lesIds}
                            strategy={verticalListSortingStrategy}
                          >
                            <ul className="mt-3 space-y-1.5">
                              {lessonsSorted.map((lesson) => {
                                const dirty =
                                  lessonMarkdownHasUnpublishedChanges(lesson);
                                const active =
                                  lesson.lessonKey === selectedLessonKey;
                                const showDraftOnly =
                                  !lessonBlocksHaveContent(
                                    lesson.publishedBodyBlocks
                                  ) &&
                                  !lesson.publishedBodyMarkdown?.trim() &&
                                  !lesson.legacyHtmlPath?.trim();
                                return (
                                  <li key={lesson.id}>
                                    <SortableOutlineLesson
                                      lessonId={lesson.id}
                                      lessonKey={lesson.lessonKey}
                                      titleEn={lesson.titleEn}
                                      showDraftOnly={showDraftOnly}
                                      dirty={dirty}
                                      isActive={active}
                                      onSelectLesson={selectOutlineLesson}
                                    />
                                  </li>
                                );
                              })}
                            </ul>
                          </SortableContext>
                        ) : (
                          <p className="mt-3 px-1 text-xs text-stone-500">
                            {lessonsSorted.length} lesson
                            {lessonsSorted.length === 1 ? '' : 's'} — expand to
                            view or reorder
                          </p>
                        )}

                        <div className="mt-3 border-t border-stone-200/80 pt-3">
                          <AddLessonForm
                            courseSlug={courseSlug}
                            moduleSlug={mod.slug}
                            onDone={onRefresh}
                          />
                        </div>
                      </div>
                    </SortableModule>
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="space-y-3">
            {sortedOutline.map((mod) => {
              const lessonsSorted = mod.lessons;
              const expanded = !collapsedModuleIds.has(mod.id);
              return (
                <StaticModuleShell key={mod.id}>
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-1 items-start gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="mt-0.5 size-7 shrink-0 rounded-full text-stone-500"
                          onClick={() => toggleModuleCollapsed(mod.id)}
                          aria-expanded={expanded}
                          aria-label={
                            expanded
                              ? 'Collapse lesson list'
                              : 'Expand lesson list'
                          }
                        >
                          {expanded ? (
                            <ChevronDown className="size-4" />
                          ) : (
                            <ChevronRight className="size-4" />
                          )}
                        </Button>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-stone-900">
                            {mod.titleEn}
                          </p>
                          <p className="truncate text-xs text-stone-500">
                            /{mod.slug}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-8 rounded-full text-stone-600"
                          disabled={pending}
                          onClick={() => {
                            if (
                              !confirm(
                                'Duplicate this module and all its lessons?'
                              )
                            )
                              return;
                            startTransition(async () => {
                              const fd = new FormData();
                              fd.set('courseSlug', courseSlug);
                              fd.set('moduleSlug', mod.slug);
                              await duplicateModuleAction(fd);
                              onRefresh();
                            });
                          }}
                          aria-label="Duplicate module"
                        >
                          <Copy className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-8 rounded-full text-red-700 hover:text-red-800"
                          disabled={pending}
                          onClick={() => {
                            if (
                              !confirm(
                                'Remove this module? Lessons inside will be hidden.'
                              )
                            )
                              return;
                            startTransition(async () => {
                              const fd = new FormData();
                              fd.set('courseSlug', courseSlug);
                              fd.set('moduleSlug', mod.slug);
                              await softDeleteModuleAction(fd);
                              selectLesson(null);
                              onRefresh();
                            });
                          }}
                          aria-label="Delete module"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>

                    {expanded ? (
                      <ul className="mt-3 space-y-1.5">
                        {lessonsSorted.map((lesson) => {
                          const dirty =
                            lessonMarkdownHasUnpublishedChanges(lesson);
                          const active =
                            lesson.lessonKey === selectedLessonKey;
                          const showDraftOnly =
                            !lessonBlocksHaveContent(
                              lesson.publishedBodyBlocks
                            ) &&
                            !lesson.publishedBodyMarkdown?.trim() &&
                            !lesson.legacyHtmlPath?.trim();
                          return (
                            <li key={lesson.id}>
                              <StaticLessonShell active={active}>
                                <OutlineLessonPickButton
                                  lessonKey={lesson.lessonKey}
                                  titleEn={lesson.titleEn}
                                  showDraftOnly={showDraftOnly}
                                  dirty={dirty}
                                  isActive={active}
                                  onSelectLesson={selectOutlineLesson}
                                />
                              </StaticLessonShell>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="mt-3 px-1 text-xs text-stone-500">
                        {lessonsSorted.length} lesson
                        {lessonsSorted.length === 1 ? '' : 's'} — expand to
                        view or reorder
                      </p>
                    )}

                    <div className="mt-3 border-t border-stone-200/80 pt-3">
                      <AddLessonForm
                        courseSlug={courseSlug}
                        moduleSlug={mod.slug}
                        onDone={onRefresh}
                      />
                    </div>
                  </div>
                </StaticModuleShell>
              );
            })}
          </div>
        )}

        <AddModuleForm courseSlug={courseSlug} onDone={onRefresh} />
      </div>

      {/* Center — editor */}
      <div className="min-w-0 space-y-6">
        {!found ? (
          <div className="space-y-10 rounded-[1.75rem] border border-dashed border-stone-300/80 bg-white/60 px-6 py-12 shadow-inner sm:px-10">
            <div className="text-center">
              <BookOpen className="mx-auto size-12 text-amber-700/80" />
              <h3 className="mt-4 text-xl font-semibold tracking-tight text-stone-950">
                Choose a lesson
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-600">
                Pick a lesson from the outline to edit content, media, and
                reflection prompts—or add a new module below.
              </p>
            </div>
            <StudioCourseSettingsForm
              course={course}
              courseSlug={courseSlug}
              onSaved={() => router.refresh()}
            />
            <CourseLifecycleToolbar courseSlug={courseSlug} />
          </div>
        ) : (
          <>
            <StudioLessonForm
              key={found.lesson.lessonKey}
              courseSlug={courseSlug}
              lesson={found.lesson}
              onSaved={() => router.refresh()}
              onStudioHistoryApi={(api) => {
                studioHistRef.current = api;
              }}
            />
            <StudioFormSection
              eyebrow="English content"
              title="Lesson body"
              description="Write the primary lesson in BlockNote. Publish when learners should see changes."
            >
                <LessonMarkdownEditor
                  key={found.lesson.lessonKey}
                  courseSlug={courseSlug}
                  lessonKey={found.lesson.lessonKey}
                  initialDraftMarkdown={
                    found.lesson.draftBodyMarkdown ??
                    found.lesson.publishedBodyMarkdown ??
                    ''
                  }
                  initialDraftBlocks={
                    lessonBlocksHaveContent(found.lesson.draftBodyBlocks)
                      ? found.lesson.draftBodyBlocks
                      : lessonBlocksHaveContent(found.lesson.publishedBodyBlocks)
                        ? found.lesson.publishedBodyBlocks
                        : null
                  }
                  serverBodyAlignment={{
                    draftBodyBlocks: found.lesson.draftBodyBlocks,
                    publishedBodyBlocks: found.lesson.publishedBodyBlocks,
                    draftBodyMarkdown: found.lesson.draftBodyMarkdown,
                    publishedBodyMarkdown: found.lesson.publishedBodyMarkdown,
                  }}
                  onBlockHistory={(caps) => {
                    blockHistRef.current.caps = caps;
                  }}
                  onRegisterBlockApi={(api) => {
                    blockHistRef.current.api = api;
                  }}
                />
            </StudioFormSection>

            <StudioLessonVersionHistory
              courseSlug={courseSlug}
              lessonKey={found.lesson.lessonKey}
              onRestored={() => router.refresh()}
            />

            <StudioMediaSection
              courseSlug={courseSlug}
              lesson={found.lesson}
              placements={placementRowsForSelected}
              libraryCandidates={libraryCandidates}
              onChanged={() => router.refresh()}
            />

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-stone-300/80"
                disabled={pending}
                onClick={() => {
                  if (!confirm('Duplicate this lesson and its media placements?'))
                    return;
                  startTransition(async () => {
                    const fd = new FormData();
                    fd.set('courseSlug', courseSlug);
                    fd.set('lessonKey', found.lesson.lessonKey);
                    const res = await duplicateLessonAction(fd);
                    if (res.ok && 'lessonKey' in res) {
                      selectLesson(res.lessonKey);
                    }
                    router.refresh();
                  });
                }}
              >
                <Copy className="mr-2 size-4" />
                Duplicate lesson
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-red-300 text-red-800 hover:bg-red-50"
                disabled={pending}
                onClick={() => {
                  if (
                    !confirm(
                      'Remove this lesson from the course? Learners will no longer see it.'
                    )
                  )
                    return;
                  startTransition(async () => {
                    const fd = new FormData();
                    fd.set('courseSlug', courseSlug);
                    fd.set('lessonKey', found.lesson.lessonKey);
                    await softDeleteLessonAction(fd);
                    selectLesson(null);
                    router.refresh();
                  });
                }}
              >
                <Trash2 className="mr-2 size-4" />
                Remove lesson
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Right — preview */}
      {previewLayout !== 'collapsed' ? (
        <div className="w-full min-w-0">
          {found && previewLayout === 'dock' ? (
            <StudioLessonPreview
              courseSlug={courseSlug}
              moduleTitleEn={found.module.titleEn}
              moduleIndexDisplay={selectedModuleIndex}
              lesson={found.lesson}
              markdownBody={markdownForPreview}
              blockNoteBody={blockNoteForPreview}
              placementRows={placementRowsForSelected}
              previewSource={previewSource}
              onPreviewSourceChange={setPreviewSource}
              viewport={viewport}
              onViewportChange={setViewport}
              ratioTotal={Math.max(1, flatLessons.length)}
              dockMode="sidebar"
              onRequestFullscreen={() => setPreviewLayout('fullscreen')}
              onRequestCollapse={() => setPreviewLayout('collapsed')}
            />
          ) : found ? (
            <div className="rounded-[1.75rem] border border-dashed border-violet-200/80 bg-violet-50/40 px-6 py-10 text-center text-sm text-stone-600">
              <p className="font-medium text-stone-800">Full-screen preview open</p>
              <p className="mt-2 text-xs text-stone-500">
                Close it from the preview header, or press the backdrop, to return
                here.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4 rounded-full border-stone-300/80 bg-white"
                onClick={() => setPreviewLayout('dock')}
              >
                Dock preview here
              </Button>
            </div>
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-stone-300/70 bg-white/50 px-6 py-12 text-center text-sm text-stone-500">
              Preview appears when you select a lesson.
            </div>
          )}
        </div>
      ) : null}
      </div>

      {previewLayout === 'collapsed' && found ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="fixed bottom-6 right-6 z-40 rounded-full border border-stone-300/80 bg-white/95 px-4 py-2 text-stone-900 shadow-[0_12px_40px_-16px_rgba(60,40,20,0.45)] backdrop-blur-sm hover:bg-white"
          onClick={() => setPreviewLayout('dock')}
        >
          Show learner preview
        </Button>
      ) : null}

      {previewLayout === 'fullscreen' && found && previewPortalReady
        ? createPortal(
            <div className="fixed inset-0 z-[200] flex flex-col sm:p-4 md:p-6">
              <button
                type="button"
                className="absolute inset-0 z-0 cursor-default bg-stone-950/45 backdrop-blur-[2px]"
                aria-label="Close full-screen preview"
                onClick={() => setPreviewLayout('dock')}
              />
              <div className="relative z-10 flex min-h-0 flex-1 justify-center">
                <div className="flex h-full w-full max-w-6xl min-h-0 flex-col overflow-hidden rounded-none border-0 bg-[#fbf7f0] shadow-[0_32px_120px_-48px_rgba(40,28,18,0.55)] sm:rounded-[1.75rem] sm:border sm:border-white/85">
                  <StudioLessonPreview
                    courseSlug={courseSlug}
                    moduleTitleEn={found.module.titleEn}
                    moduleIndexDisplay={selectedModuleIndex}
                    lesson={found.lesson}
                    markdownBody={markdownForPreview}
                    blockNoteBody={blockNoteForPreview}
                    placementRows={placementRowsForSelected}
                    previewSource={previewSource}
                    onPreviewSourceChange={setPreviewSource}
                    viewport={viewport}
                    onViewportChange={setViewport}
                    ratioTotal={Math.max(1, flatLessons.length)}
                    dockMode="fullscreen"
                    onExitFullscreen={() => setPreviewLayout('dock')}
                  />
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

const StudioLessonPreview = memo(function StudioLessonPreview({
  courseSlug,
  moduleTitleEn,
  moduleIndexDisplay,
  lesson,
  markdownBody,
  blockNoteBody,
  placementRows,
  previewSource,
  onPreviewSourceChange,
  viewport,
  onViewportChange,
  ratioTotal,
  dockMode = 'sidebar',
  onRequestFullscreen,
  onRequestCollapse,
  onExitFullscreen,
}: {
  courseSlug: string;
  moduleTitleEn: string;
  moduleIndexDisplay: number;
  lesson: Lesson;
  markdownBody: string | null;
  blockNoteBody: Lesson['publishedBodyBlocks'] | null;
  placementRows: LessonExperiencePlacementRow[];
  previewSource: 'draft' | 'published';
  onPreviewSourceChange: (source: 'draft' | 'published') => void;
  viewport: 'desktop' | 'mobile';
  onViewportChange: (viewport: 'desktop' | 'mobile') => void;
  ratioTotal: number;
  dockMode?: 'sidebar' | 'fullscreen';
  onRequestFullscreen?: () => void;
  onRequestCollapse?: () => void;
  onExitFullscreen?: () => void;
}) {
  const placementModels = useMemo(
    () => toPlacementViewModels(placementRows),
    [placementRows]
  );
  const summaryEn = lesson.summaryEn?.trim();
  const summaryEs = lesson.summaryEs?.trim();
  const reflectionEn = lesson.reflectionPromptEn?.trim();
  const reflectionEs = lesson.reflectionPromptEs?.trim();
  const stepsEn = lesson.actionStepsEn?.trim();
  const stepsEs = lesson.actionStepsEs?.trim();
  const legacyPath = lesson.legacyHtmlPath?.trim();
  /** Keeps typing smooth: heavy markdown render trails the latest draft briefly. */
  const deferredMarkdown = useDeferredValue(markdownBody);
  const md = deferredMarkdown?.trim();
  const hasBlocks = lessonBlocksHaveContent(blockNoteBody);
  const showDbReflection =
    Boolean(reflectionEn) &&
    !lessonBlocksContainBlockTypes(blockNoteBody, ['flowReflection']);
  const showDbAction =
    Boolean(stepsEn) &&
    !lessonBlocksContainBlockTypes(blockNoteBody, [
      'flowExercise',
      'flowActionStep',
    ]);

  return (
    <aside
      className={cn(
        'flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-white/85 bg-[#fbf7f0] shadow-[0_28px_90px_-48px_rgba(120,83,45,0.45)]',
        dockMode === 'fullscreen' &&
          'h-full rounded-none border-0 bg-transparent shadow-none',
        viewport === 'mobile' && 'mx-auto w-full max-w-[390px]',
        dockMode === 'fullscreen' && viewport === 'desktop' && 'max-w-none'
      )}
    >
      <div className="shrink-0 border-b border-stone-200/70 bg-white/78 p-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
              Learner preview
            </p>
            <p className="mt-1 text-sm text-stone-600">
              {previewSource === 'draft' ? 'Draft content' : 'Published content'}
              {dockMode === 'fullscreen' ? (
                <span className="mt-1 block text-xs font-normal text-violet-800/90">
                  Full screen — close when you are done checking layout.
                </span>
              ) : null}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            {dockMode === 'sidebar' ? (
              <>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="size-9 rounded-full border-stone-300/80 bg-white/80 text-stone-800"
                  onClick={() => onRequestFullscreen?.()}
                  aria-label="Expand learner preview full screen"
                  title="Full screen"
                >
                  <Maximize2 className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="size-9 rounded-full border-stone-300/80 bg-white/80 text-stone-800"
                  onClick={() => onRequestCollapse?.()}
                  aria-label="Hide learner preview"
                  title="Hide preview"
                >
                  <PanelRightClose className="size-4" />
                </Button>
              </>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="rounded-full border-stone-300/80 bg-white text-stone-900 hover:bg-stone-50"
                onClick={() => onExitFullscreen?.()}
              >
                <X className="mr-1.5 size-4" />
                Exit full screen
              </Button>
            )}
            <Button
              asChild
              size="sm"
              variant="outline"
              className="rounded-full border-stone-300/80 bg-white/80"
            >
              <Link href={`/admin/courses/${courseSlug}/preview/lessons/${lesson.lessonKey}`}>
                Open
              </Link>
            </Button>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="flex rounded-full border border-stone-200 bg-white/80 p-1">
            <Button
              type="button"
              size="sm"
              variant={previewSource === 'draft' ? 'default' : 'ghost'}
              className={cn(
                'h-8 flex-1 rounded-full',
                previewSource === 'draft' && 'bg-stone-950 text-white hover:bg-stone-800'
              )}
              onClick={() => onPreviewSourceChange('draft')}
            >
              Draft
            </Button>
            <Button
              type="button"
              size="sm"
              variant={previewSource === 'published' ? 'default' : 'ghost'}
              className={cn(
                'h-8 flex-1 rounded-full',
                previewSource === 'published' &&
                  'bg-stone-950 text-white hover:bg-stone-800'
              )}
              onClick={() => onPreviewSourceChange('published')}
            >
              Published
            </Button>
          </div>
          <div className="flex rounded-full border border-stone-200 bg-white/80 p-1">
            <Button
              type="button"
              size="sm"
              variant={viewport === 'desktop' ? 'secondary' : 'ghost'}
              className="h-8 flex-1 rounded-full"
              onClick={() => onViewportChange('desktop')}
            >
              <Monitor className="mr-1 size-4" />
              Desktop
            </Button>
            <Button
              type="button"
              size="sm"
              variant={viewport === 'mobile' ? 'secondary' : 'ghost'}
              className="h-8 flex-1 rounded-full"
              onClick={() => onViewportChange('mobile')}
            >
              <Smartphone className="mr-1 size-4" />
              Mobile
            </Button>
          </div>
        </div>
        <p className="mt-2 text-[11px] leading-snug text-stone-500">
          Use{' '}
          <span className="font-semibold text-stone-700">Published</span> to
          match the live learner app (same body fields as{' '}
          <span className="font-semibold text-stone-700">
            /dashboard/courses/…/lessons/…
          </span>
          ). Draft shows work-in-progress, including unpublished BlockNote.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-background">
        <div className="space-y-7 p-5 sm:p-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-full border-border font-medium normal-case"
              >
                Module {moduleIndexDisplay >= 0 ? moduleIndexDisplay + 1 : '-'}
              </Badge>
              <Badge variant="secondary" className="rounded-full normal-case">
                {moduleTitleEn}
              </Badge>
              <Badge
                variant="outline"
                className="rounded-full border-primary/35 normal-case text-primary"
              >
                Preview
              </Badge>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {lesson.titleEn}
            </h2>
            {lesson.titleEs ? (
              <p className="text-base text-muted-foreground">{lesson.titleEs}</p>
            ) : null}
            {summaryEn ? (
              <p className="text-base leading-relaxed text-muted-foreground">
                {summaryEn}
              </p>
            ) : null}
            {summaryEs && summaryEs !== summaryEn ? (
              <p className="text-sm leading-relaxed text-muted-foreground/90">
                {summaryEs}
              </p>
            ) : null}
            {lesson.estimatedMinutes != null && lesson.estimatedMinutes > 0 ? (
              <p className="text-sm text-muted-foreground">
                About {lesson.estimatedMinutes} min
                {lesson.estimatedMinutes === 1 ? '' : 's'} to complete
              </p>
            ) : null}
            <div className="flex max-w-lg flex-col gap-2 pt-2">
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>Learning path progress</span>
                <span className="tabular-nums">0/{ratioTotal} lessons</span>
              </div>
              <Progress value={0} className="h-2.5" />
            </div>
          </div>

          {hasBlocks ? (
            <BlockNoteLessonBody blocks={blockNoteBody} />
          ) : md ? (
            <MarkdownLessonBody markdown={md} />
          ) : (
            <p className="rounded-2xl border border-border/80 bg-muted/15 p-6 text-sm text-muted-foreground">
              Lesson content is not available yet.
            </p>
          )}

          <LessonInlinePlacements items={placementModels} />

          <KnowledgeQuizSection quiz={lesson.knowledgeQuizJson ?? null} />

          {showDbReflection ? (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                Reflection
              </h3>
              <LessonSectionProse markdown={reflectionEn!} />
              {reflectionEs && reflectionEs !== reflectionEn ? (
                <LessonSectionProse markdown={reflectionEs} />
              ) : null}
            </div>
          ) : null}

          {showDbAction ? (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                Action steps
              </h3>
              <LessonSectionProse markdown={stepsEn!} />
              {stepsEs && stepsEs !== stepsEn ? (
                <LessonSectionProse markdown={stepsEs} />
              ) : null}
            </div>
          ) : null}

          {legacyPath ? (
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 text-xs leading-relaxed text-amber-900">
              Legacy HTML path (preview only):
              <span className="mt-1 block truncate font-mono">{legacyPath}</span>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
});

function CourseLifecycleToolbar({ courseSlug }: { courseSlug: string }) {
  return (
    <div className="mt-8 flex w-full flex-wrap justify-center gap-2">
      {(
        [
          ['draft', 'Draft'],
          ['review', 'Review'],
          ['scheduled', 'Teaser'],
          ['published', 'Published'],
          ['archived', 'Archived'],
        ] as const
      ).map(([value, label]) => (
        <form key={value} action={setCourseLifecycleAction}>
          <input type="hidden" name="courseSlug" value={courseSlug} />
          <input type="hidden" name="lifecycleStatus" value={value} />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="rounded-full border-stone-300/80 bg-white/80 text-stone-800 hover:bg-white"
          >
            {label}
          </Button>
        </form>
      ))}
    </div>
  );
}

function AddModuleForm({
  courseSlug,
  onDone,
}: {
  courseSlug: string;
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full rounded-full border-stone-300/80 bg-white/80"
        onClick={() => setOpen(true)}
      >
        <Plus className="mr-2 size-4" />
        Add module
      </Button>
    );
  }
  return (
    <form
      className="space-y-3 rounded-[1.75rem] border border-white/85 bg-white/82 p-4 shadow-card-soft"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          await createModuleAction(fd);
          setOpen(false);
          onDone();
        });
      }}
    >
      <input type="hidden" name="courseSlug" value={courseSlug} />
      <div className="space-y-1">
        <Label htmlFor="nm-en">Title (English)</Label>
        <Input id="nm-en" name="titleEn" required className="bg-white" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="nm-es">Title (Spanish)</Label>
        <Input id="nm-es" name="titleEs" required className="bg-white" />
      </div>
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={pending}
          className="rounded-full bg-stone-950 text-white"
        >
          Create
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="rounded-full"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function AddLessonForm({
  courseSlug,
  moduleSlug,
  onDone,
}: {
  courseSlug: string;
  moduleSlug: string;
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  if (!open) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full rounded-full text-stone-700 hover:bg-stone-100"
        onClick={() => setOpen(true)}
      >
        <Plus className="mr-1 size-4" />
        Add lesson
      </Button>
    );
  }
  return (
    <form
      className="space-y-2 rounded-xl border border-stone-200/80 bg-[#fffaf2]/90 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          await createLessonAction(fd);
          setOpen(false);
          onDone();
        });
      }}
    >
      <input type="hidden" name="courseSlug" value={courseSlug} />
      <input type="hidden" name="moduleSlug" value={moduleSlug} />
      <Input
        name="lessonKey"
        required
        placeholder="Lesson key"
        className="bg-white text-sm"
      />
      <Input name="titleEn" required placeholder="Title EN" className="bg-white text-sm" />
      <Input name="titleEs" required placeholder="Title ES" className="bg-white text-sm" />
      <div className="flex gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={pending}
          className="rounded-full bg-stone-950 text-white"
        >
          Add
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="rounded-full"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function StudioLessonForm({
  courseSlug,
  lesson,
  onSaved,
  onStudioHistoryApi,
}: {
  courseSlug: string;
  lesson: Lesson;
  onSaved: () => void;
  onStudioHistoryApi?: (api: {
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
  }) => void;
}) {
  const [pending, startTransition] = useTransition();
  const dirty = lessonMarkdownHasUnpublishedChanges(lesson);
  const metaFp = useMemo(() => studioFieldsFingerprint(lesson), [lesson]);

  const { present, set, reset, undo, redo, canUndo, canRedo } =
    useDebouncedUndoable<StudioLessonFieldsState>(
      lessonToStudioFieldsState(lesson),
      450
    );

  const baselineSerialized = useRef(metaFp);
  const studioSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [studioLabel, setStudioLabel] = useState('Saved');

  useEffect(() => {
    const next = lessonToStudioFieldsState(lesson);
    reset(next);
    baselineSerialized.current = JSON.stringify(next);
    setStudioLabel('Saved');
  }, [lesson.lessonKey, metaFp, lesson, reset]);

  const serialized = useMemo(() => JSON.stringify(present), [present]);

  useEffect(() => {
    if (serialized === baselineSerialized.current) {
      setStudioLabel('Saved');
      return;
    }
    setStudioLabel('Unsaved changes');
    if (studioSaveTimer.current) clearTimeout(studioSaveTimer.current);
    studioSaveTimer.current = setTimeout(() => {
      void (async () => {
        setStudioLabel('Saving…');
        const fd = studioLessonFieldsToFormData(
          courseSlug,
          lesson.lessonKey,
          present
        );
        const r = await autosaveLessonStudioFieldsAction(fd);
        if (r.ok) {
          baselineSerialized.current = serialized;
          setStudioLabel(
            `Saved ${new Date(r.savedAt).toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            })}`
          );
        } else {
          setStudioLabel('Save failed');
        }
      })();
    }, safeTimeoutDelay(1500));
    return () => {
      if (studioSaveTimer.current) clearTimeout(studioSaveTimer.current);
    };
  }, [serialized, present, courseSlug, lesson.lessonKey]);

  useEffect(() => {
    onStudioHistoryApi?.({ undo, redo, canUndo, canRedo });
  }, [undo, redo, canUndo, canRedo, onStudioHistoryApi]);

  const f = present;

  return (
    <div className="space-y-6" data-studio-lesson-fields="1">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200/85 bg-white/78 px-4 py-3 shadow-inner">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
            Lesson details
          </span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!canUndo}
              className="h-9 rounded-full border-stone-300/80 px-3"
              aria-label="Undo lesson fields"
              onClick={() => undo()}
            >
              <Undo2 className="size-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!canRedo}
              className="h-9 rounded-full border-stone-300/80 px-3"
              aria-label="Redo lesson fields"
              onClick={() => redo()}
            >
              <Redo2 className="size-4" />
            </Button>
          </div>
        </div>
        <p
          className={cn(
            'text-xs font-medium',
            studioLabel === 'Save failed'
              ? 'text-red-700'
              : studioLabel === 'Saving…'
                ? 'text-violet-800'
                : studioLabel === 'Unsaved changes'
                  ? 'text-amber-800'
                  : 'text-stone-600'
          )}
        >
          {studioLabel}
        </p>
      </div>

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = studioLessonFieldsToFormData(
            courseSlug,
            lesson.lessonKey,
            present
          );
          startTransition(async () => {
            await updateLessonStudioFieldsAction(fd);
            onSaved();
          });
        }}
      >
        <StudioFormSection
          eyebrow="Lesson basics"
          title="Identity and learner context"
          description="Titles, summaries, and timing set the learner-facing frame for this lesson."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sf-en">Title (English)</Label>
              <Input
                id="sf-en"
                name="titleEn"
                required
                value={f.titleEn}
                onChange={(e) => set((p) => ({ ...p, titleEn: e.target.value }))}
                className="h-11 border-stone-200 bg-white text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sf-es">Title (Spanish)</Label>
              <Input
                id="sf-es"
                name="titleEs"
                required
                value={f.titleEs}
                onChange={(e) => set((p) => ({ ...p, titleEs: e.target.value }))}
                className="h-11 border-stone-200 bg-white text-base"
              />
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <div className="space-y-2">
              <Label htmlFor="sf-summary-en">Summary (English)</Label>
              <textarea
                id="sf-summary-en"
                name="summaryEn"
                rows={4}
                value={f.summaryEn}
                onChange={(e) =>
                  set((p) => ({ ...p, summaryEn: e.target.value }))
                }
                className={studioTextareaClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sf-est">Estimated minutes</Label>
              <Input
                id="sf-est"
                name="estimatedMinutes"
                type="number"
                min={0}
                value={f.estimatedMinutes}
                onChange={(e) =>
                  set((p) => ({ ...p, estimatedMinutes: e.target.value }))
                }
                className="h-11 border-stone-200 bg-white text-base"
              />
            </div>
          </div>
        </StudioFormSection>

        <StudioFormSection
          eyebrow="Spanish content"
          title="Spanish lesson context"
          description="Keep Spanish metadata aligned with the public learner experience."
        >
          <div className="space-y-2">
            <Label htmlFor="sf-summary-es">Summary (Spanish)</Label>
            <textarea
              id="sf-summary-es"
              name="summaryEs"
              rows={4}
              value={f.summaryEs}
              onChange={(e) =>
                set((p) => ({ ...p, summaryEs: e.target.value }))
              }
              className={studioTextareaClass}
            />
          </div>
        </StudioFormSection>

        <StudioFormSection
          eyebrow="Reflection"
          title="Reflection prompts"
          description="Shown after the lesson body. If you use Reflection blocks in BlockNote, this section is hidden for learners so content is not duplicated — use one approach or the other."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sf-ref-en">Reflection prompt (English)</Label>
              <textarea
                id="sf-ref-en"
                name="reflectionPromptEn"
                rows={5}
                value={f.reflectionPromptEn}
                onChange={(e) =>
                  set((p) => ({ ...p, reflectionPromptEn: e.target.value }))
                }
                className={studioTextareaClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sf-ref-es">Reflection prompt (Spanish)</Label>
              <textarea
                id="sf-ref-es"
                name="reflectionPromptEs"
                rows={5}
                value={f.reflectionPromptEs}
                onChange={(e) =>
                  set((p) => ({ ...p, reflectionPromptEs: e.target.value }))
                }
                className={studioTextareaClass}
              />
            </div>
          </div>
        </StudioFormSection>

        <StudioFormSection
          eyebrow="Action steps"
          title="Practice steps"
          description="Markdown-friendly steps after the body. If you use Action step or Exercise blocks in BlockNote, this section is hidden for learners to avoid duplication."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sf-steps-en">Action steps (English)</Label>
              <textarea
                id="sf-steps-en"
                name="actionStepsEn"
                rows={7}
                value={f.actionStepsEn}
                onChange={(e) =>
                  set((p) => ({ ...p, actionStepsEn: e.target.value }))
                }
                placeholder="Markdown supported"
                className={cn(studioTextareaClass, 'font-mono')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sf-steps-es">Action steps (Spanish)</Label>
              <textarea
                id="sf-steps-es"
                name="actionStepsEs"
                rows={7}
                value={f.actionStepsEs}
                onChange={(e) =>
                  set((p) => ({ ...p, actionStepsEs: e.target.value }))
                }
                placeholder="Markdown supported"
                className={cn(studioTextareaClass, 'font-mono')}
              />
            </div>
          </div>
        </StudioFormSection>

        <StudioFormSection
          eyebrow="Check understanding"
          title="Multiple-choice quiz"
          description="Same role as legacy “Check your understanding” — optional, does not affect progress. Shown after embedded media and before reflection."
        >
          <StudioLessonKnowledgeQuizEditor
            value={f.knowledgeQuiz}
            onChange={(quiz) => set((p) => ({ ...p, knowledgeQuiz: quiz }))}
          />
        </StudioFormSection>

        <StudioFormSection
          eyebrow="Publishing/settings"
          title="Legacy path and publish readiness"
          description="Legacy HTML remains available for older lessons. The studio preview uses the Flow Guide lesson layout."
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_220px] lg:items-end">
            <div className="space-y-2">
              <Label htmlFor="sf-legacy">Legacy HTML path</Label>
              <Input
                id="sf-legacy"
                name="legacyHtmlPath"
                value={f.legacyHtmlPath}
                onChange={(e) =>
                  set((p) => ({ ...p, legacyHtmlPath: e.target.value }))
                }
                placeholder="module-1/lesson-01.html"
                className="h-11 border-stone-200 bg-white font-mono text-sm"
              />
            </div>
            <div className="rounded-2xl border border-stone-200/80 bg-[#fffaf2]/85 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                Learner view
              </p>
              <p className="mt-2 text-sm font-medium text-stone-900">
                {dirty ? 'Draft ahead of live' : 'Live matches your draft'}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-stone-600">
                Use Publish below when the lesson body should go live.
              </p>
            </div>
          </div>
          <Button
            type="submit"
            disabled={pending}
            className="rounded-full bg-stone-950 px-6 text-white hover:bg-stone-800"
          >
            {pending ? (
              <>
                <Loader2
                  className="mr-2 size-4 animate-spin"
                  aria-hidden
                />
                Save lesson details
              </>
            ) : (
              'Save lesson details'
            )}
          </Button>
        </StudioFormSection>
      </form>
    </div>
  );
}

function StudioMediaSection({
  courseSlug,
  lesson,
  placements,
  libraryCandidates,
  onChanged,
}: {
  courseSlug: string;
  lesson: Lesson;
  placements: LessonExperiencePlacementRow[];
  libraryCandidates: CourseStudioClientProps['libraryCandidates'];
  onChanged: () => void;
}) {
  const [embedUrl, setEmbedUrl] = useState('');
  const [embedCaption, setEmbedCaption] = useState('');
  const [pending, startTransition] = useTransition();

  const reorder = (orderedIds: number[]) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set('courseSlug', courseSlug);
      fd.set('lessonKey', lesson.lessonKey);
      fd.set('orderedIds', orderedIds.join(','));
      await reorderLessonAssetsAction(fd);
      onChanged();
    });
  };

  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= placements.length) return;
    const ids = placements.map((r) => r.placement.id);
    const next = [...ids];
    const t = next[idx]!;
    next[idx] = next[j]!;
    next[j] = t;
    reorder(next);
  };

  return (
    <StudioFormSection
      eyebrow="Media/resources"
      title="Lesson media and resources"
      description="Images, video, embeds, and downloads appear in this order for learners."
    >
      <MediaUploadDropzone attachLessonId={lesson.id} />

      <div className="flex flex-wrap gap-2">
        <MediaAttachButton
          courseSlug={courseSlug}
          lessonKey={lesson.lessonKey}
          candidates={libraryCandidates}
          onAttached={onChanged}
        />
      </div>

      <div className="rounded-2xl border border-stone-200/80 bg-[#fffaf2]/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-600">
          Embed video (YouTube / Vimeo)
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
          <Input
            value={embedUrl}
            onChange={(e) => setEmbedUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1 bg-white"
          />
          <Input
            value={embedCaption}
            onChange={(e) => setEmbedCaption(e.target.value)}
            placeholder="Caption (optional)"
            className="flex-1 bg-white sm:max-w-xs"
          />
          <Button
            type="button"
            className="rounded-full bg-stone-950 text-white"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                const fd = new FormData();
                fd.set('courseSlug', courseSlug);
                fd.set('lessonKey', lesson.lessonKey);
                fd.set('url', embedUrl);
                fd.set('caption', embedCaption);
                const res = await attachLessonEmbedAction(fd);
                if (res.ok) {
                  setEmbedUrl('');
                  setEmbedCaption('');
                  onChanged();
                } else {
                  alert(
                    res.error === 'unsupported_url'
                      ? 'Use a supported YouTube or Vimeo link.'
                      : 'Could not add embed.'
                  );
                }
              });
            }}
          >
            Add embed
          </Button>
        </div>
      </div>

      <ul className="space-y-3">
        {placements.map((row, idx) => {
          const p = row.placement;
          const label =
            p.embedUrl?.trim() ||
            row.media?.originalFilename ||
            p.publicUrl ||
            `Placement ${p.id}`;
          return (
            <li
              key={p.id}
              className="flex flex-col gap-2 rounded-xl border border-stone-200/80 bg-white p-3 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-stone-900">
                  {label}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-stone-500">
                  {p.kind}
                  {p.sortOrder != null ? ` · order ${p.sortOrder}` : ''}
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  disabled={pending || idx === 0}
                  onClick={() => move(idx, -1)}
                >
                  Up
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  disabled={pending || idx === placements.length - 1}
                  onClick={() => move(idx, 1)}
                >
                  Down
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-full border-red-300 text-red-800"
                  disabled={pending}
                  onClick={() => {
                    startTransition(async () => {
                      const fd = new FormData();
                      fd.set('courseSlug', courseSlug);
                      fd.set('lessonKey', lesson.lessonKey);
                      fd.set('placementId', String(p.id));
                      await detachLessonPlacementAction(fd);
                      onChanged();
                    });
                  }}
                >
                  Remove
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </StudioFormSection>
  );
}
