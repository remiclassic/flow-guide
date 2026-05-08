import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { LegacyLessonFrame } from '@/components/courses/legacy-lesson-frame';
import { BlockNoteLessonBody } from '@/components/courses/blocknote-lesson-body';
import { MarkdownLessonBody } from '@/components/courses/markdown-lesson-body';
import {
  LessonRoadmapAside,
  type RoadmapModule,
} from '@/components/courses/lesson-roadmap-aside';
import { LessonInlinePlacements } from '@/components/courses/lesson-inline-placements';
import { LessonSectionProse } from '@/components/courses/lesson-section-prose';
import { KnowledgeQuizSection } from '@/components/courses/knowledge-quiz-section';
import { toPlacementViewModels } from '@/lib/courses/map-lesson-placements';
import type { Lesson, LessonAsset, MediaAsset } from '@/lib/db/schema';
import {
  lessonBlocksContainBlockTypes,
  lessonBlocksHaveContent,
} from '@/lib/courses/blocknote-content';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

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
  moduleTitleEn: string;
  moduleIndexDisplay: number;
  lesson: Lesson;
  /** Resolved markdown for body (published or draft depending on caller). */
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
  /**
   * When set, prev/next and roadmap use `${lessonLessonBasePath}/${lessonKey}`.
   * Omit for default learner URLs under `/dashboard/courses/.../lessons/`.
   */
  lessonLessonBasePath?: string;
  headerAside: React.ReactNode;
  /** When false, omits reflection/action/summary if empty — still renders structure when content exists. */
  showStructuredSections?: boolean;
};

export function LessonExperience({
  courseSlug,
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
  headerAside,
  showStructuredSections = true,
}: LessonExperienceProps) {
  const placementModels = toPlacementViewModels(placementRows);
  const summaryEn = lesson.summaryEn?.trim();
  const summaryEs = lesson.summaryEs?.trim();
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

  return (
    <section className="flex-1 space-y-8 p-4 lg:p-8 lg:pb-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="rounded-full border-border font-medium normal-case"
            >
              Module {moduleIndexDisplay >= 0 ? moduleIndexDisplay + 1 : '—'}
            </Badge>
            <Badge variant="secondary" className="rounded-full normal-case">
              {moduleTitleEn}
            </Badge>
            {completed ? (
              <Badge variant="success" className="rounded-full normal-case">
                Completed
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="rounded-full border-primary/35 normal-case text-primary"
              >
                In progress
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {lesson.titleEn}
          </h1>
          <p className="text-base text-muted-foreground">{lesson.titleEs}</p>
          {showStructuredSections && summaryEn ? (
            <p className="text-lg leading-relaxed text-muted-foreground">
              {summaryEn}
            </p>
          ) : null}
          {showStructuredSections && summaryEs && summaryEs !== summaryEn ? (
            <p className="text-base leading-relaxed text-muted-foreground/90">
              {summaryEs}
            </p>
          ) : null}
          {showStructuredSections && est != null && est > 0 ? (
            <p className="text-sm text-muted-foreground">
              About {est} min{est === 1 ? '' : 's'} to complete
            </p>
          ) : null}
          <div className="flex max-w-lg flex-col gap-2 pt-2">
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>Learning path progress</span>
              <span className="tabular-nums">
                {ratioCompleted}/{ratioTotal} lessons
              </span>
            </div>
            <Progress value={ratioPercent} className="h-2.5" />
          </div>
        </div>

        {headerAside}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-8">
          <div className="flex flex-wrap items-center gap-2">
            {previousLessonKey ? (
              <Button
                variant="ghost"
                asChild
                className="rounded-full text-muted-foreground hover:text-foreground"
              >
                <Link href={buildLessonUrl(courseSlug, previousLessonKey, lessonLessonBasePath)}>
                  <ArrowLeft className="size-4" />
                  Previous
                </Link>
              </Button>
            ) : (
              <span className="rounded-full px-4 py-2 text-sm text-muted-foreground">
                Start of path
              </span>
            )}
            {nextLessonKey ? (
              <Button
                variant="ghost"
                asChild
                className="rounded-full text-muted-foreground hover:text-foreground"
              >
                <Link href={buildLessonUrl(courseSlug, nextLessonKey, lessonLessonBasePath)}>
                  Next lesson
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <span className="rounded-full px-4 py-2 text-sm text-muted-foreground">
                Path complete
              </span>
            )}
          </div>

          {hasBody ? (
            hasBlocks ? (
              <BlockNoteLessonBody blocks={blockNoteBody} />
            ) : md ? (
              <MarkdownLessonBody markdown={md} />
            ) : legacySrc ? (
              <LegacyLessonFrame src={legacySrc} title={lesson.titleEn} />
            ) : null
          ) : (
            <p className="rounded-2xl border border-border/80 bg-muted/15 p-6 text-muted-foreground">
              Lesson content is not available yet.
            </p>
          )}

          <LessonInlinePlacements items={placementModels} />

          {showStructuredSections ? (
            <KnowledgeQuizSection quiz={lesson.knowledgeQuizJson ?? null} />
          ) : null}

          {showDbReflection ? (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Reflection
              </h2>
              <LessonSectionProse markdown={reflectionEn!} />
              {reflectionEs && reflectionEs !== reflectionEn ? (
                <LessonSectionProse markdown={reflectionEs} />
              ) : null}
            </div>
          ) : null}

          {showDbAction ? (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Action steps
              </h2>
              <LessonSectionProse markdown={stepsEn!} />
              {stepsEs && stepsEs !== stepsEn ? (
                <LessonSectionProse markdown={stepsEs} />
              ) : null}
            </div>
          ) : null}
        </div>

        <LessonRoadmapAside
          courseSlug={courseSlug}
          unlocked={unlocked}
          modules={roadmapModules}
          currentLessonKey={currentLessonKey}
          lessonLessonBasePath={lessonLessonBasePath}
        />
      </div>
    </section>
  );
}
