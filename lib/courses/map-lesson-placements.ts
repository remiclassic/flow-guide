import type { LessonAsset, MediaAsset } from '@/lib/db/schema';
import { parseLessonAssetMetadata } from '@/lib/courses/lesson-asset-metadata';

export type LessonPlacementViewModel = {
  placementId: number;
  kind: string;
  embedUrl: string | null;
  publicUrl: string | null;
  storageKey: string | null;
  mimeType: string | null;
  originalFilename: string | null;
  mediaKind: string | null;
  alt: string;
  caption: string;
};

export function toPlacementViewModels(
  rows: { placement: LessonAsset; media: MediaAsset | null }[]
): LessonPlacementViewModel[] {
  return rows.map(({ placement, media }) => {
    const meta = parseLessonAssetMetadata(placement.metadata);
    return {
      placementId: placement.id,
      kind: placement.kind,
      embedUrl: placement.embedUrl,
      publicUrl: placement.publicUrl ?? media?.publicUrl ?? '',
      storageKey: placement.storageKey ?? media?.storageKey ?? null,
      mimeType: placement.mimeType ?? media?.mimeType ?? null,
      originalFilename: media?.originalFilename ?? null,
      mediaKind: media?.kind ?? null,
      alt: meta.alt ?? '',
      caption: meta.caption ?? '',
    };
  });
}
