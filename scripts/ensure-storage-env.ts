/**
 * Appends Supabase Storage env keys to `.env` when those keys are absent (never duplicates).
 * Derives SUPABASE_URL from POSTGRES_URL pooler user `postgres.<ref>` when possible.
 *
 * Usage: pnpm ensure:storage-env
 */
import { readFileSync, existsSync, appendFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env');

function parseEnvKeys(content: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const line of content.split(/\r?\n/)) {
    const m = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line.trim());
    if (!m) continue;
    map.set(m[1], m[2]);
  }
  return map;
}

function keyDeclared(map: Map<string, string>, name: string): boolean {
  return map.has(name);
}

function deriveSupabaseUrlFromPostgresUrl(postgresUrl: string): string | null {
  const u = postgresUrl.trim();
  const m = /postgres\.([a-z0-9]{15,})\./i.exec(u);
  if (!m) return null;
  return `https://${m[1]}.supabase.co`;
}

function main(): void {
  if (!existsSync(envPath)) {
    console.error(
      '[flow-guide] No .env file. Copy .env.example to .env first, then run again.\n'
    );
    process.exit(1);
  }

  const raw = readFileSync(envPath, 'utf8');
  const keys = parseEnvKeys(raw);

  const hasDeclUrl =
    keyDeclared(keys, 'SUPABASE_URL') ||
    keyDeclared(keys, 'NEXT_PUBLIC_SUPABASE_URL');
  const hasDeclService = keyDeclared(keys, 'SUPABASE_SERVICE_ROLE_KEY');
  const hasDeclBucket =
    keyDeclared(keys, 'SUPABASE_MEDIA_BUCKET') ||
    keyDeclared(keys, 'SUPABASE_STORAGE_BUCKET');

  if (hasDeclUrl && hasDeclService && hasDeclBucket) {
    console.log(
      '[flow-guide] Storage env keys already in .env. Fill empty values, run scripts/supabase-storage-course-media.sql, then pnpm check:storage\n'
    );
    process.exit(0);
  }

  const lines: string[] = [];
  if (!raw.endsWith('\n')) lines.push('');

  if (!hasDeclUrl) {
    const pg = keys.get('POSTGRES_URL') ?? keys.get('DATABASE_URL') ?? '';
    const derived = deriveSupabaseUrlFromPostgresUrl(pg);
    if (derived) {
      lines.push(
        '# --- Supabase Storage (added by pnpm ensure:storage-env) ---',
        '# Derived from POSTGRES_URL pooler project ref',
        `SUPABASE_URL=${derived}`
      );
    } else {
      lines.push(
        '# --- Supabase Storage (added by pnpm ensure:storage-env) ---',
        '# Project Settings → API → Project URL',
        'SUPABASE_URL='
      );
    }
  }

  if (!hasDeclService) {
    lines.push(
      '# Server-only: Project Settings → API → service_role (never NEXT_PUBLIC_*)',
      'SUPABASE_SERVICE_ROLE_KEY='
    );
  }

  if (!hasDeclBucket) {
    lines.push('SUPABASE_MEDIA_BUCKET=course-media');
  }

  lines.push(
    '# Bucket SQL: scripts/supabase-storage-course-media.sql  |  Verify: pnpm check:storage',
    ''
  );

  appendFileSync(envPath, lines.join('\n'), 'utf8');
  console.log(
    '[flow-guide] Appended missing Storage keys to .env. Set SUPABASE_SERVICE_ROLE_KEY, create bucket, then pnpm check:storage\n'
  );
}

main();
