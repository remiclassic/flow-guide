import {
  restoreMediaAssetAction,
  softDeleteMediaAssetAction,
} from '@/lib/admin/media-actions';
import { Button } from '@/components/ui/button';
import { MediaCopyUrlButton } from '@/components/admin/media-copy-url-button';
import type { MediaAsset } from '@/lib/db/schema';

export function MediaAssetCard({
  asset,
  uploaderLabel,
  usage,
  deleted,
}: {
  asset: MediaAsset;
  uploaderLabel: string | null;
  usage: { lessonPlacements: number; coursePlacements: number };
  deleted?: boolean;
}) {
  const totalUse = usage.lessonPlacements + usage.coursePlacements;
  const name =
    asset.originalFilename?.trim() ||
    asset.storageKey.split('/').pop() ||
    'File';
  const isImage = asset.kind === 'image';

  return (
    <div className="flex flex-col overflow-hidden rounded-[1.75rem] border border-white/85 bg-white/82 shadow-[0_22px_64px_-44px_rgba(120,83,45,0.44)] backdrop-blur-sm">
      <div className="relative aspect-video bg-stone-100">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- external Supabase URLs
          <img
            src={asset.publicUrl}
            alt=""
            className="size-full object-contain"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-4xl text-stone-400">
            {asset.kind === 'pdf'
              ? 'PDF'
              : asset.kind === 'video'
                ? '▶'
                : asset.kind === 'audio'
                  ? '♪'
                  : '⎗'}
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-full border border-white/80 bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-stone-700 shadow-sm backdrop-blur-sm">
          {asset.kind}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="line-clamp-2 text-sm font-medium text-stone-950" title={name}>
          {name}
        </p>
        <p className="text-xs text-stone-500">
          {uploaderLabel ? `Added by ${uploaderLabel}` : 'Uploader unknown'}
        </p>
        <p className="text-xs text-stone-600">
          Used in {totalUse} place{totalUse === 1 ? '' : 's'}
          {totalUse > 0 && (
            <span className="text-stone-500">
              {' '}
              ({usage.lessonPlacements} lesson
              {usage.lessonPlacements === 1 ? '' : 's'},{' '}
              {usage.coursePlacements} course
              {usage.coursePlacements === 1 ? '' : 's'})
            </span>
          )}
        </p>
        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          <MediaCopyUrlButton url={asset.publicUrl} />
          {deleted ? (
            <form action={restoreMediaAssetAction}>
              <input
                type="hidden"
                name="mediaAssetPublicId"
                value={asset.publicId}
              />
              <Button
                type="submit"
                size="sm"
                variant="outline"
                className="border-emerald-300 text-emerald-800 hover:bg-emerald-50"
              >
                Restore
              </Button>
            </form>
          ) : (
            <form action={softDeleteMediaAssetAction}>
              <input
                type="hidden"
                name="mediaAssetPublicId"
                value={asset.publicId}
              />
              <Button
                type="submit"
                size="sm"
                variant="outline"
                className="border-stone-300/80 bg-white/80 text-stone-800 hover:bg-white"
              >
                Remove from library
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
