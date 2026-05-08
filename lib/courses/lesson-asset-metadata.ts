export type EmbedProvider = 'youtube' | 'vimeo' | 'other';

export type LessonAssetUiMetadata = {
  alt?: string;
  caption?: string;
  provider?: EmbedProvider;
};

export function parseLessonAssetMetadata(
  raw: Record<string, unknown> | null | undefined
): LessonAssetUiMetadata {
  if (!raw || typeof raw !== 'object') return {};
  const alt = raw.alt;
  const caption = raw.caption;
  const provider = raw.provider;
  return {
    alt: typeof alt === 'string' ? alt : undefined,
    caption: typeof caption === 'string' ? caption : undefined,
    provider:
      provider === 'youtube' || provider === 'vimeo' || provider === 'other'
        ? provider
        : undefined,
  };
}

export function mergeLessonAssetMetadata(
  existing: Record<string, unknown>,
  patch: LessonAssetUiMetadata
): Record<string, unknown> {
  const next = { ...existing };
  if (patch.alt !== undefined) next.alt = patch.alt;
  if (patch.caption !== undefined) next.caption = patch.caption;
  if (patch.provider !== undefined) next.provider = patch.provider;
  return next;
}
