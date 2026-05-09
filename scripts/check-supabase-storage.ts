/**
 * Validates env + optional live check against Supabase Storage (no secrets printed).
 * Usage: pnpm check:storage
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

function projectUrl(): string | undefined {
  const a = process.env.SUPABASE_URL?.trim();
  if (a) return a;
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined;
}

function bucketName(): string {
  return (
    process.env.SUPABASE_MEDIA_BUCKET?.trim() ||
    process.env.SUPABASE_STORAGE_BUCKET?.trim() ||
    'course-media'
  );
}

async function main(): Promise<void> {
  const url = projectUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const bucket = bucketName();

  const missing: string[] = [];
  if (!url) {
    missing.push(
      'SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL (https://<ref>.supabase.co)'
    );
  }
  if (!serviceKey) {
    missing.push(
      'SUPABASE_SERVICE_ROLE_KEY — paste service_role from Supabase → Project Settings → API (server-only; never NEXT_PUBLIC_*)'
    );
  }

  if (!url || !serviceKey) {
    console.error('[flow-guide] Supabase Storage is not configured:\n');
    for (const line of missing) {
      console.error(`  - ${line}`);
    }
    if (!url) {
      console.error(
        '  Tip: pnpm ensure:storage-env can append SUPABASE_URL from POSTGRES_URL when possible.\n'
      );
    }
    console.error(
      '\nCreate bucket: scripts/supabase-storage-course-media.sql → then pnpm check:storage\n'
    );
    process.exit(1);
  }

  const safeUrl = url;
  const safeKey = serviceKey;

  console.log('[flow-guide] Env OK for Storage (secrets not shown).');
  console.log(`  Project URL: ${safeUrl}`);
  console.log(`  Bucket:      ${bucket}`);

  const admin = createClient(safeUrl, safeKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: buckets, error: listErr } = await admin.storage.listBuckets();

  if (listErr) {
    console.error('\n[flow-guide] Could not list buckets:', listErr.message);
    if (
      listErr.message?.toLowerCase().includes('jwt') ||
      listErr.message?.toLowerCase().includes('invalid')
    ) {
      console.error(
        '  → Likely invalid SUPABASE_SERVICE_ROLE_KEY or wrong project URL.\n'
      );
    }
    process.exit(1);
  }

  const found = buckets?.some((b) => b.name === bucket);
  if (!found) {
    console.error(
      `\n[flow-guide] Bucket "${bucket}" does not exist in this project.`
    );
    console.error(
      '  Run scripts/supabase-storage-course-media.sql in the SQL Editor, or create the bucket in Storage UI (public recommended).\n'
    );
    process.exit(1);
  }

  const probePath = `_flow-guide-probe/${crypto.randomUUID()}.txt`;
  const probeBody = new Uint8Array([80, 114, 111, 98, 101]); // "Probe"
  const { error: upErr } = await admin.storage
    .from(bucket)
    .upload(probePath, probeBody, {
      contentType: 'text/plain',
      upsert: true,
    });

  if (upErr) {
    console.error('\n[flow-guide] Test upload failed:', upErr.message);
    console.error(
      '  Check Storage policies and that the bucket allows service role uploads.\n'
    );
    process.exit(1);
  }

  await admin.storage.from(bucket).remove([probePath]);

  console.log(
    '\n[flow-guide] Storage check passed: bucket exists and upload/delete works.\n'
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
