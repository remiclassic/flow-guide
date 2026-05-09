import { loadRootEnvFiles } from './load-dotenv';

const PLACEHOLDER_MARKERS = [
  'drizzle-placeholder',
  '[PROJECT_REF]',
  '[YOUR_PASSWORD]',
  '127.0.0.1:5432/placeholder',
];

/** Hostname for Supabase direct DB connections (often IPv6-only; can fail on IPv4-only Windows). */
const DIRECT_SUPABASE_DB_HOST = /^db\.[a-z0-9]+\.supabase\.co$/i;

export type MigrationUrlSource =
  | 'POSTGRES_URL_MIGRATE'
  | 'POSTGRES_URL'
  | 'DATABASE_URL'
  | 'fallback';

export function getMigrationPostgresUrlFromEnv(): {
  url: string;
  source: MigrationUrlSource;
} {
  loadRootEnvFiles();

  const migrate = process.env.POSTGRES_URL_MIGRATE?.trim();
  if (migrate) {
    return { url: migrate, source: 'POSTGRES_URL_MIGRATE' };
  }

  const pg = process.env.POSTGRES_URL?.trim();
  if (pg) {
    return { url: pg, source: 'POSTGRES_URL' };
  }

  const dbUrl = process.env.DATABASE_URL?.trim();
  if (dbUrl) {
    return { url: dbUrl, source: 'DATABASE_URL' };
  }

  return {
    url: 'postgresql://127.0.0.1:5432/drizzle-placeholder',
    source: 'fallback',
  };
}

function looksLikePlaceholder(url: string): boolean {
  const lower = url.toLowerCase();
  return PLACEHOLDER_MARKERS.some((m) => lower.includes(m.toLowerCase()));
}

function tryParsePostgresUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

/**
 * Fail fast with actionable errors before Drizzle opens a socket.
 */
export function assertValidDrizzleCliPostgresUrl(
  url: string,
  source: MigrationUrlSource
): void {
  if (source === 'fallback') {
    throw new Error(
      '[drizzle-kit] No database URL found. Set POSTGRES_URL_MIGRATE (recommended for Supabase), POSTGRES_URL, or DATABASE_URL in `.env` or `.env.local`. See `.env.example`.'
    );
  }

  if (!url.startsWith('postgres://') && !url.startsWith('postgresql://')) {
    throw new Error(
      `[drizzle-kit] ${source} must be a postgres:// or postgresql:// URI (got a non-postgres scheme).`
    );
  }

  if (looksLikePlaceholder(url)) {
    throw new Error(
      `[drizzle-kit] ${source} still contains a placeholder. Copy values from Supabase → Project Settings → Database into .env (see .env.example).`
    );
  }

  const parsed = tryParsePostgresUrl(url);
  if (!parsed?.hostname) {
    throw new Error(
      `[drizzle-kit] Could not parse hostname from ${source}. Check the connection string for typos.`
    );
  }
}

/**
 * `db.<ref>.supabase.co` is often **IPv6-only** (no A record). Node + many IPv4-only networks
 * (especially Windows) then fail with `getaddrinfo ENOTFOUND`. Session pooler (5432 on
 * `*.pooler.supabase.com`) is IPv4-friendly for migrations.
 */
export function warnIfDirectSupabaseDbHostLikelyIpv4Broken(url: string): void {
  const host = tryParsePostgresUrl(url)?.hostname;
  if (!host || !DIRECT_SUPABASE_DB_HOST.test(host)) {
    return;
  }

  console.warn(
    `[drizzle-kit] ${host} is often IPv6-only. If migrate fails with ENOTFOUND, set POSTGRES_URL_MIGRATE to Supabase **Session pooler** (port 5432, *.pooler.supabase.com, user postgres.[PROJECT_REF]). See README.md → Supabase Postgres setup.`
  );
}

export function warnIfUsingTransactionPoolerForCli(
  url: string,
  source: MigrationUrlSource
): void {
  const isPooler =
    /pooler\.supabase\.com/i.test(url) && /:6543\b/.test(url);
  if (isPooler && source !== 'POSTGRES_URL_MIGRATE') {
    console.warn(
      '[drizzle-kit] Using a Transaction pooler URL (port 6543) for CLI. If `push` or `migrate` fails, set POSTGRES_URL_MIGRATE to your Supabase **direct** (db.*.supabase.co:5432) or **Session** pooler (*.pooler.supabase.com:5432) URI in `.env` / `.env.local`.'
    );
  }
}
