import type { OutlineModuleLite } from '@/lib/courses/progress';
import {
  GLOW_FLOW_CAMPAIGN_QUESTS,
  glowFlowLessonQuests,
  questImageSrc,
  type GlowFlowCampaignQuestDef,
  type GlowFlowLessonQuestDef,
} from '@/lib/quests/catalog';

export type CampaignQuestStatus = 'locked' | 'available' | 'in_progress' | 'complete';

export type LessonQuestStatus = 'locked' | 'available' | 'complete';

export type ResolvedGlowFlowCampaignQuest = GlowFlowCampaignQuestDef & {
  status: CampaignQuestStatus;
  moduleNumericId: number;
  completed: number;
  total: number;
  percent: number;
  nextLessonKey: string | null;
  imageSrc: string;
};

export type ResolvedGlowFlowLessonQuest = GlowFlowLessonQuestDef & {
  status: LessonQuestStatus;
  lessonNumericId: number;
  href: string;
  imageSrc: string;
};

export type GlowFlowSideQuestGroup = {
  moduleTitleEn: string;
  moduleNumericId: number;
  quests: ResolvedGlowFlowLessonQuest[];
};

function moduleByTitle(
  outlineLite: OutlineModuleLite[],
  titleEn: string
): OutlineModuleLite | undefined {
  return outlineLite.find((m) => m.titleEn === titleEn);
}

function campaignStatus(
  unlocked: boolean,
  completed: number,
  total: number
): CampaignQuestStatus {
  if (!unlocked) return 'locked';
  if (total <= 0) return 'available';
  if (completed >= total) return 'complete';
  if (completed > 0) return 'in_progress';
  return 'available';
}

function lessonStatus(unlocked: boolean, lessonDone: boolean): LessonQuestStatus {
  if (!unlocked) return 'locked';
  if (lessonDone) return 'complete';
  return 'available';
}

/** Next incomplete lesson in module syllabus order */
function nextIncompleteInModule(
  mod: OutlineModuleLite | undefined,
  completedSet: ReadonlySet<number>
): string | null {
  if (!mod) return null;
  for (const l of mod.lessons) {
    if (!completedSet.has(l.id)) return l.lessonKey;
  }
  return null;
}

export function resolveGlowFlowCampaignQuests(
  outlineLite: OutlineModuleLite[],
  completedSet: ReadonlySet<number>,
  unlocked: boolean
): ResolvedGlowFlowCampaignQuest[] {
  return GLOW_FLOW_CAMPAIGN_QUESTS.map((def) => {
    const mod = moduleByTitle(outlineLite, def.moduleTitleEn);
    const total = mod?.lessons.length ?? 0;
    const completed =
      mod?.lessons.filter((l) => completedSet.has(l.id)).length ?? 0;
    const percent = total <= 0 ? 0 : Math.round((completed / total) * 100);
    const nextLessonKey = nextIncompleteInModule(mod, completedSet);

    return {
      ...def,
      moduleNumericId: mod?.id ?? -1,
      completed,
      total,
      percent,
      nextLessonKey,
      status: campaignStatus(unlocked, completed, total),
      imageSrc: questImageSrc(def.imageSlug),
    };
  });
}

export function resolveGlowFlowSideQuestGroups(
  outlineLite: OutlineModuleLite[],
  completedSet: ReadonlySet<number>,
  primarySlug: string,
  unlocked: boolean
): GlowFlowSideQuestGroup[] {
  const lessonCatalog = glowFlowLessonQuests();
  const keyToLesson = new Map<string, { id: number; moduleTitleEn: string }>();
  for (const mod of outlineLite) {
    for (const l of mod.lessons) {
      keyToLesson.set(l.lessonKey, { id: l.id, moduleTitleEn: mod.titleEn });
    }
  }

  const byModule = new Map<string, ResolvedGlowFlowLessonQuest[]>();

  for (const def of lessonCatalog) {
    const row = keyToLesson.get(def.lessonKey);
    if (!row) continue;
    const lessonDone = completedSet.has(row.id);
    const resolved: ResolvedGlowFlowLessonQuest = {
      ...def,
      lessonNumericId: row.id,
      status: lessonStatus(unlocked, lessonDone),
      href: `/dashboard/courses/${primarySlug}/lessons/${def.lessonKey}`,
      imageSrc: questImageSrc(def.imageSlug),
    };
    const list = byModule.get(def.moduleTitleEn) ?? [];
    list.push(resolved);
    byModule.set(def.moduleTitleEn, list);
  }

  return outlineLite.map((mod) => ({
    moduleTitleEn: mod.titleEn,
    moduleNumericId: mod.id,
    quests: byModule.get(mod.titleEn) ?? [],
  }));
}

/** Campaign quest matching the module of the next syllabus lesson */
export function glowFlowCampaignForModuleTitle(
  moduleTitleEn: string
): GlowFlowCampaignQuestDef | undefined {
  return GLOW_FLOW_CAMPAIGN_QUESTS.find((q) => q.moduleTitleEn === moduleTitleEn);
}
