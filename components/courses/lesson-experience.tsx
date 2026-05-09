import type { ReactNode } from 'react';
import { LegacyLessonFrame } from '@/components/courses/legacy-lesson-frame';
import { BlockNoteLessonBody } from '@/components/courses/blocknote-lesson-body';
import { MarkdownLessonBody } from '@/components/courses/markdown-lesson-body';
import {
  type RoadmapModule,
} from '@/components/courses/lesson-roadmap-aside';
import { LessonInlinePlacements } from '@/components/courses/lesson-inline-placements';
import { LessonViewerShell } from '@/components/courses/viewer/lesson-viewer-shell';
import {
  ActionStepsCard,
  ContinueJourneyCard,
  PauseMoment,
  QuizSectionPremium,
  ReflectionCard,
} from '@/components/courses/viewer/emotional-sections';
import { CompanionPanel } from '@/components/courses/viewer/companion-panel';
import { LessonJourneyNav } from '@/components/courses/viewer/lesson-journey-nav';
import { toPlacementViewModels } from '@/lib/courses/map-lesson-placements';
import type { Lesson, LessonAsset, MediaAsset } from '@/lib/db/schema';
import {
  lessonBlocksContainBlockTypes,
  lessonBlocksHaveContent,
} from '@/lib/courses/blocknote-content';

/** Lesson URLs for prev/next (shared with roadmap via `lessonLessonBasePath`). */
export function buildLessonUrl(
  courseSlug: string,
  lessonKey: string,
  lessonLessonBasePath?: string | null
): string {
  const base = lessonLessonBasePath?.trim();
  if (base) {
    return `${base.replace(/\/$/, '')}/${lessonKey}`;
  }
  return `/dashboard/courses/${courseSlug}/lessons/${lessonKey}`;
}

export type LessonExperiencePlacementRow = {
  placement: LessonAsset;
  media: MediaAsset | null;
};

export type LessonExperienceProps = {
  courseSlug: string;
  courseTitle: string;
  moduleTitleEn: string;
  moduleIndexDisplay: number;
  lesson: Lesson;
  markdownBody: string | null;
  blockNoteBody: Lesson['publishedBodyBlocks'] | null;
  legacySrc: string | null;
  placementRows: LessonExperiencePlacementRow[];
  roadmapModules: RoadmapModule[];
  currentLessonKey: string;
  unlocked: boolean;
  completed: boolean;
  ratioCompleted: number;
  ratioTotal: number;
  ratioPercent: number;
  previousLessonKey: string | null;
  nextLessonKey: string | null;
  lessonLessonBasePath?: string;
  /** 1-based position in flat syllabus */
  lessonPosition: number;
  totalLessons: number;
  /** Next incomplete lesson “continue” target */
  continueHref: string;
  continueTitle: string | null;
  streakDays: number;
  streakSparkline: number[];
  heroImageUrl: string | null;
  heroImageAlt?: string | null;
  nextLessonTitle: string | null;
  reflectionHref?: string;
  variant?: 'learner' | 'preview';
  /** Staff preview: actions card / banner */
  previewBanner?: ReactNode;
  /** Staff preview: companion disclaimer */
  previewStaffNote?: string | null;
  showStructuredSections?: boolean;
};

export function LessonExperience({
  courseSlug,
  courseTitle,
  moduleTitleEn,
  moduleIndexDisplay,
  lesson,
  markdownBody,
  blockNoteBody,
  legacySrc,
  placementRows,
  roadmapModules,
  currentLessonKey,
  unlocked,
  completed,
  ratioCompleted,
  ratioTotal,
  ratioPercent,
  previousLessonKey,
  nextLessonKey,
  lessonLessonBasePath,
  lessonPosition,
  totalLessons,
  continueHref,
  continueTitle,
  streakDays,
  streakSparkline,
  heroImageUrl,
  heroImageAlt,
  nextLessonTitle,
  reflectionHref = '/dashboard/coach',
  variant = 'learner',
  previewBanner,
  previewStaffNote,
  showStructuredSections = true,
}: LessonExperienceProps) {
  const placementModels = toPlacementViewModels(placementRows);
  const summaryEn = lesson.summaryEn?.trim();
  const reflectionEn = lesson.reflectionPromptEn?.trim();
  const reflectionEs = lesson.reflectionPromptEs?.trim();
  const stepsEn = lesson.actionStepsEn?.trim();
  const stepsEs = lesson.actionStepsEs?.trim();
  const est = lesson.estimatedMinutes;

  const md = markdownBody?.trim();
  const hasBlocks = lessonBlocksHaveContent(blockNoteBody);
  const hasBody = Boolean(hasBlocks || md || legacySrc);

  const showDbReflection =
    showStructuredSections &&
    Boolean(reflectionEn) &&
    !lessonBlocksContainBlockTypes(blockNoteBody, ['flowReflection']);
  const showDbAction =
    showStructuredSections &&
    Boolean(stepsEn) &&
    !lessonBlocksContainBlockTypes(blockNoteBody, [
      'flowExercise',
      'flowActionStep',
    ]);

  const takeaway =
    summaryEn?.slice(0, 280) ??
    (reflectionEn?.slice(0, 200) ?? null);

  const courseOverviewHref = `/dashboard/courses/${courseSlug}`;

  const article = (
    <>
      {hasBody ? (
        hasBlocks ? (
          <BlockNoteLessonBody blocks={blockNoteBody} />
        ) : md ? (
          <MarkdownLessonBody markdown={md} />
        ) : legacySrc ? (
          <div className="w-full overflow-hidden rounded-3xl border border-[hsl(var(--lesson-border)/0.45)] bg-[hsl(var(--lesson-canvas)/0.5)] shadow-inner">
            <LegacyLessonFrame src={legacySrc} title={lesson.titleEn} />
          </div>
        ) : null
      ) : (
        <p className="rounded-3xl border border-dashed border-[hsl(var(--lesson-border)/0.55)] bg-[hsl(var(--lesson-wash)/0.35)] px-6 py-10 text-center text-muted-foreground">
          Lesson content is not available yet.
        </p>
      )}

      <LessonInlinePlacements items={placementModels} />

      {showStructuredSections ? (
        <QuizSectionPremium quiz={lesson.knowledgeQuizJson ?? null} />
      ) : null}

      {hasBody && showStructuredSections ? <PauseMoment /> : null}

      {showDbReflection ? (
        <ReflectionCard markdown={reflectionEn!} />
      ) : null}
      {showDbReflection && reflectionEs && reflectionEs !== reflectionEn ? (
        <ReflectionCard markdown={reflectionEs} />
      ) : null}

      {showDbAction ? <ActionStepsCard markdown={stepsEn!} /> : null}
      {showDbAction && stepsEs && stepsEs !== stepsEn ? (
        <ActionStepsCard markdown={stepsEs} />
      ) : null}

      <ContinueJourneyCard
        href={continueHref}
        title={continueTitle}
        completed={completed}
      />
    </>
  );

  const journey = (
    <LessonJourneyNav
      courseSlug={courseSlug}
      courseTitle={courseTitle}
      unlocked={unlocked}
      modules={roadmapModules}
      currentLessonKey={currentLessonKey}
      lessonLessonBasePath={lessonLessonBasePath}
      ratioPercent={ratioPercent}
      ratioCompleted={ratioCompleted}
      ratioTotal={ratioTotal}
      backToCourseHref={courseOverviewHref}
    />
  );

  const companion = (
    <CompanionPanel
      courseSlug={courseSlug}
      lessonKey={currentLessonKey}
      completed={completed}
      takeaway={takeaway}
      streakDays={streakDays}
      streakSparkline={streakSparkline}
      nextLessonKey={nextLessonKey}
      nextLessonTitle={nextLessonTitle}
      lessonLessonBasePath={lessonLessonBasePath}
      reflectionHref={reflectionHref}
      previewNote={variant === 'preview' ? previewStaffNote ?? null : null}
    />
  );

  const heroContent = {
    moduleTitleEn,
    moduleNum: moduleIndexDisplay,
    titleEn: lesson.titleEn,
    titleEs: lesson.titleEs,
    subtitleEn: summaryEn ?? null,
    estimatedMinutes: est,
    lessonCurrent: lessonPosition,
    lessonTotal: totalLessons,
    heroImageUrl,
    heroImageAlt: heroImageAlt ?? undefined,
    completed,
  };

  return (
    <section className="relative w-full min-h-[calc(100dvh-3.5rem)] bg-background pb-6">
      <LessonViewerShell
        heroContent={heroContent}
        journey={journey}
        companion={companion}
        article={article}
        previewBanner={variant === 'preview' ? previewBanner : undefined}
        courseSlug={courseSlug}
        courseOverviewHref={courseOverviewHref}
        lessonLessonBasePath={lessonLessonBasePath}
        previousLessonKey={previousLessonKey}
        nextLessonKey={nextLessonKey}
        courseTitle={courseTitle}
        ratioPercent={ratioPercent}
        completed={completed}
        currentLessonKey={currentLessonKey}
      />
    </section>
  );
}
