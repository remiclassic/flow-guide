import type { LessonContentBlocks } from '@/lib/db/schema';

export type LessonBlocksJson = LessonContentBlocks | null;

const CONTENT_KEYS = new Set(['text', 'url', 'href', 'src', 'caption', 'name']);

function hasMeaningfulContent(value: unknown, keyHint?: string): boolean {
  if (typeof value === 'string') {
    return CONTENT_KEYS.has(keyHint ?? '') && value.trim().length > 0;
  }
  if (Array.isArray(value)) return value.some((item) => hasMeaningfulContent(item));
  if (!value || typeof value !== 'object') return false;

  const record = value as Record<string, unknown>;
  return Object.entries(record).some(([key, nested]) =>
    hasMeaningfulContent(nested, key)
  );
}

export function lessonBlocksHaveContent(
  blocks: LessonBlocksJson | undefined
): blocks is LessonContentBlocks {
  if (!Array.isArray(blocks) || blocks.length === 0) return false;

  return blocks.some(
    (block) =>
      hasMeaningfulContent(block.content) ||
      hasMeaningfulContent(block.props) ||
      hasMeaningfulContent(block.children)
  );
}

export function parseLessonBlocksJson(raw: unknown): LessonBlocksJson | undefined {
  if (raw == null) return undefined;
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) return undefined;
    return parsed as LessonContentBlocks;
  } catch {
    return undefined;
  }
}

export function stringifyLessonBlocks(blocks: LessonBlocksJson | undefined): string {
  return blocks ? JSON.stringify(blocks) : '';
}

/** True if any top-level block uses one of the given BlockNote `type` strings. */
export function lessonBlocksContainBlockTypes(
  blocks: LessonBlocksJson | undefined,
  types: string[]
): boolean {
  if (!Array.isArray(blocks) || types.length === 0) return false;
  const want = new Set(types);
  return blocks.some((b) => want.has(String((b as { type?: string }).type ?? '')));
}
