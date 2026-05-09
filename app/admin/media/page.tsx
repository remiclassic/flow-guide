import { Suspense } from 'react';
import { MediaAssetCard } from '@/components/admin/media-asset-card';
import { MediaBrowserToolbar } from '@/components/admin/media-browser-toolbar';
import { MediaUploadDropzone } from '@/components/admin/media-upload-dropzone';
import {
  countPlacementsByMediaAssetIds,
  listDeletedMediaAssets,
  listMediaAssets,
  parseMediaKind,
} from '@/lib/db/queries-media';

export const dynamic = 'force-dynamic';

type SearchParams = { kind?: string; q?: string };

export default async function AdminMediaPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await props.searchParams;
  const kind = parseMediaKind(
    typeof sp.kind === 'string' ? sp.kind : undefined
  );
  const q = typeof sp.q === 'string' ? sp.q : '';

  const [rows, deletedRows] = await Promise.all([
    listMediaAssets({ kind, search: q || undefined, limit: 48 }),
    listDeletedMediaAssets({ limit: 24 }),
  ]);

  const ids = rows.map((r) => r.asset.id);
  const usageMap = await countPlacementsByMediaAssetIds(ids);

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
          Assets
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-stone-950 sm:text-4xl">
          Media library
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
          Everything you upload lives here. Reuse files across lessons and
          courses — upload once, attach anywhere.
        </p>
      </div>

      <Suspense fallback={null}>
        <MediaBrowserToolbar defaultQ={q} />
      </Suspense>

      <MediaUploadDropzone />

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-stone-950">Your files</h2>
        {rows.length === 0 ? (
          <div className="rounded-[1.75rem] border border-white/85 bg-white/78 px-6 py-16 text-center shadow-[0_22px_64px_-44px_rgba(120,83,45,0.4)] backdrop-blur-sm">
            <p className="text-sm text-stone-600">
              Nothing here yet — drop a file above to start your library.
            </p>
            <p className="mt-2 text-xs text-stone-500">
              Tip: you can attach the same file to many lessons without
              uploading again.
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map(({ asset, uploaderEmail, uploaderName }) => {
              const usage = usageMap.get(asset.id) ?? {
                lessonPlacements: 0,
                coursePlacements: 0,
              };
              const uploaderLabel =
                uploaderName?.trim() ||
                uploaderEmail?.trim() ||
                null;
              return (
                <li key={asset.id}>
                  <MediaAssetCard
                    asset={asset}
                    uploaderLabel={uploaderLabel}
                    usage={usage}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {deletedRows.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-stone-800">
            Recently removed
          </h2>
          <p className="text-xs text-stone-500">
            These files are hidden from your library. Restore anytime. Your
            links in lessons stay safe until you remove them from the lesson
            itself.
          </p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {deletedRows.map(({ asset, uploaderEmail }) => {
              const usage = { lessonPlacements: 0, coursePlacements: 0 };
              const uploaderLabel =
                uploaderEmail?.trim() || null;
              return (
                <li key={asset.id}>
                  <MediaAssetCard
                    asset={asset}
                    uploaderLabel={uploaderLabel}
                    usage={usage}
                    deleted
                  />
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
