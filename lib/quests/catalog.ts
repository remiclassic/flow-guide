/**
 * Quest metadata for Glow Flow Method. Completion is always derived from
 * `lesson_progress` + course outline — this file is display and routing only.
 *
 * Quest art should match Flow Guide: soft violet gradients, warm off-white,
 * rounded shapes, soft dashboard-card shadows — not fantasy/medieval.
 */
import {
  CURRICULUM,
  GLOW_FLOW_COURSE_SLUG,
  type CurriculumLesson,
  type CurriculumModule,
} from '@/lib/courses/curriculum';

export const QUEST_IMAGE_BASE_PATH = '/quests/glow-flow';

export type GlowFlowCampaignQuestDef = {
  /** Stable id for keys */
  id: string;
  moduleTitleEn: string;
  title: string;
  description: string;
  rewardXp: number;
  /** Display-only milestone label */
  rewardTitle?: string;
  imageSlug: string;
};

export type GlowFlowLessonQuestDef = {
  lessonKey: string;
  moduleTitleEn: string;
  questTitle: string;
  description: string;
  rewardXp: number;
  /** Optional spotlight badge name (display-only) */
  rewardBadge?: string;
  /** Thumbnail filename slug under QUEST_IMAGE_BASE_PATH (always set for Glow Flow lessons) */
  imageSlug: string;
};

/** One PNG slug per lesson key — keeps thumbnails stable for routing and caching */
export const LESSON_QUEST_IMAGE_SLUGS: Record<string, string> = {
  'mod1-l01': 'structure-beats-motivation',
  'mod1-l02': 'self-sabotage-mechanism',
  'mod1-l03': 'implementation-intentions',
  'mod1-l04': 'thought-traps',
  'mod1-l05': 'environment-design',
  'mod1-l06': 'attention-hygiene',
  'mod1-l07': 'decision-fatigue',
  'mod1-l08': 'first-week-structure',
  'mod1-l09': 'lab-module-1',
  'mod2-l01': 'negotiation-tax',
  'mod2-l02': 'zero-negotiation-protocol',
  'mod2-l03': 'habit-design-loop',
  'mod2-friction': 'friction-engineering',
  'mod2-l04': 'minimum-viable-action',
  'mod2-l05': 'calendar-contract',
  'mod2-l06': 'tracking-no-shame',
  'mod2-l07': 'failure-recovery',
  'mod2-l08': 'social-environment-discipline',
  'mod2-l09': 'lab-module-2',
  'mod3-l01': 'identity-architecture',
  'mod3-l02': 'internal-language',
  'mod3-l03': 'act-as-if-technique',
  'mod3-l04': 'identity-evidence',
  'mod3-l05': 'identity-change-grief',
  'mod3-l06': 'lab-module-3',
  'mod4-l01': 'focus-neuroscience-finite',
  'mod4-l02': 'flow-state',
  'mod4-l03': 'deep-work-session',
  'mod4-l04': 'digital-distraction',
  'mod4-l05': 'attention-recovery',
  'mod4-l06': 'lab-module-4',
  'mod5-l01': 'sustain-without-momentum',
  'mod5-l02': 'weekly-monthly-review',
  'mod5-l03': 'sustainable-growth',
  'mod5-l04': 'complete-life-system',
};

/** Campaign quests: one per module */
export const GLOW_FLOW_CAMPAIGN_QUESTS: GlowFlowCampaignQuestDef[] = [
  {
    id: 'campaign-mental-reset',
    moduleTitleEn: 'Mental Reset',
    title: 'Fresh baseline',
    description:
      'Replace motivation swings with structure—environment, attention, and fewer draining decisions.',
    rewardXp: 450,
    rewardTitle: 'Foundation builder',
    imageSlug: 'mental-reset',
  },
  {
    id: 'campaign-real-discipline',
    moduleTitleEn: 'Real Discipline',
    title: 'Execute without debate',
    description:
      'Stop negotiating with yourself: habits that hold under pressure and a clean recovery when you slip.',
    rewardXp: 500,
    rewardTitle: 'Execution anchor',
    imageSlug: 'real-discipline',
  },
  {
    id: 'campaign-identity',
    moduleTitleEn: 'Identity',
    title: 'Align who you are',
    description:
      'Language, evidence, and honest grief for the old story—until behavior and identity point the same way.',
    rewardXp: 300,
    rewardTitle: 'Identity architect',
    imageSlug: 'identity',
  },
  {
    id: 'campaign-deep-focus',
    moduleTitleEn: 'Deep Focus',
    title: 'Protect your attention',
    description:
      'Treat focus as finite: flow conditions, deep sessions, digital boundaries, and real recovery.',
    rewardXp: 300,
    rewardTitle: 'Focus steward',
    imageSlug: 'deep-focus',
  },
  {
    id: 'campaign-integration',
    moduleTitleEn: 'Integration & Sustainability',
    title: 'Systems that last',
    description:
      'Reviews, sustainable pace, and a single document that holds your whole operating system.',
    rewardXp: 200,
    rewardTitle: 'Systems keeper',
    imageSlug: 'integration-sustainability',
  },
];

/** Richer copy + art for spotlight lessons; others use curriculum titles */
const LESSON_QUEST_OVERRIDES: Partial<
  Record<
    string,
    Pick<GlowFlowLessonQuestDef, 'questTitle' | 'description' | 'rewardXp' | 'rewardBadge'>
  >
> = {
  'mod1-l01': {
    questTitle: 'Structure beats motivation',
    description:
      'Anchor the lesson: why scaffolding beats hype when energy dips.',
    rewardXp: 60,
    rewardBadge: 'Baseline badge',
  },
  'mod1-l06': {
    questTitle: 'Attention hygiene',
    description:
      'Finish Attention Hygiene and cut the noise competing for your mind.',
    rewardXp: 60,
    rewardBadge: 'Quiet signal badge',
  },
  'mod2-l02': {
    questTitle: 'Zero-negotiation protocol',
    description:
      'Close the internal debate loop with the Zero-Negotiation Protocol lesson.',
    rewardXp: 65,
    rewardBadge: 'No-debate badge',
  },
  'mod2-l05': {
    questTitle: 'Calendar as contract',
    description:
      'Make time explicit: complete Your Calendar as a Contract.',
    rewardXp: 65,
    rewardBadge: 'Time contract badge',
  },
  'mod3-l01': {
    questTitle: 'Identity architecture',
    description:
      'Map how your identity was built—and where you can redesign on purpose.',
    rewardXp: 55,
    rewardBadge: 'Blueprint badge',
  },
  'mod3-l04': {
    questTitle: 'Identity evidence',
    description:
      'Stack proof with small, repeatable votes—finish Building identity evidence.',
    rewardXp: 55,
    rewardBadge: 'Evidence trail badge',
  },
  'mod4-l02': {
    questTitle: 'Flow conditions',
    description:
      'Learn what opens flow and what kills it—in flow state lesson.',
    rewardXp: 55,
    rewardBadge: 'Flow map badge',
  },
  'mod4-l03': {
    questTitle: 'Deep work session design',
    description:
      'Design a deep session you can defend when distractions show up.',
    rewardXp: 55,
    rewardBadge: 'Session plan badge',
  },
  'mod5-l02': {
    questTitle: 'Weekly & monthly review',
    description:
      'Install reviews that catch drift before it becomes collapse.',
    rewardXp: 70,
    rewardBadge: 'Review rhythm badge',
  },
  'mod5-l04': {
    questTitle: 'Life-system document',
    description:
      'Complete the capstone: your full life-system document in one place.',
    rewardXp: 120,
    rewardBadge: 'Integration badge',
  },
};

function defaultLessonQuest(
  mod: CurriculumModule,
  les: CurriculumLesson
): GlowFlowLessonQuestDef {
  const imageSlug = LESSON_QUEST_IMAGE_SLUGS[les.id];
  if (!imageSlug) {
    throw new Error(`Missing LESSON_QUEST_IMAGE_SLUGS entry for lesson ${les.id}`);
  }
  return {
    lessonKey: les.id,
    moduleTitleEn: mod.titleEn,
    questTitle: les.titleEn,
    description: `Finish this lesson in ${mod.titleEn} to complete the quest and earn XP.`,
    rewardXp: 50,
    imageSlug,
  };
}

/** One side quest per seeded lesson key */
export function glowFlowLessonQuests(): GlowFlowLessonQuestDef[] {
  const out: GlowFlowLessonQuestDef[] = [];
  for (const mod of CURRICULUM) {
    for (const les of mod.lessons) {
      const base = defaultLessonQuest(mod, les);
      const ov = LESSON_QUEST_OVERRIDES[les.id];
      out.push({
        ...base,
        ...(ov ?? {}),
        questTitle: ov?.questTitle ?? base.questTitle,
        description: ov?.description ?? base.description,
        rewardXp: ov?.rewardXp ?? base.rewardXp,
        imageSlug: base.imageSlug,
      });
    }
  }
  return out;
}

export function questImageSrc(imageSlug: string): string {
  return `${QUEST_IMAGE_BASE_PATH}/${imageSlug}.png`;
}

export function isGlowFlowQuestCourse(courseSlug: string | null | undefined): boolean {
  return courseSlug === GLOW_FLOW_COURSE_SLUG;
}
