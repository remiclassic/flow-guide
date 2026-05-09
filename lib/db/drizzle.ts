import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { loadRootEnvFiles } from '@/lib/env/load-dotenv';
import * as schema from './schema';

loadRootEnvFiles();

/** True when running on Vercel (build + runtime). Used to require real secrets and DB URLs. */
const onVercel = Boolean(process.env.VERCEL);

function resolveConnectionString(): string {
  const raw =
    process.env.POSTGRES_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (raw) {
    return raw;
  }

  if (onVercel) {
    throw new Error(
      'POSTGRES_URL (or DATABASE_URL) is required on Vercel. In the Vercel dashboard, add your Supabase Postgres URI (Project Settings → Database). Prefer the Transaction pooler connection string (host `*.pooler.supabase.com`, port `6543`) for serverless. See README.md → Supabase + Vercel.'
    );
  }

  /** Local builds / typecheck without a running Postgres instance */
  return 'postgresql://127.0.0.1:5432/placeholder';
}

const connectionString = resolveConnectionString();

/**
 * Supabase transaction pooler (Supavisor, hostname `*.pooler.supabase.com`, often port 6543)
 * does not support prepared statements the same way as a direct session.
 * `postgres.js`: disable `prepare` when using that URL (or `pgbouncer=true`).
 */
/** Transaction pooler (6543) breaks prepared statements; session pooler (5432) does not. */
function shouldDisablePreparedStatements(url: string): boolean {
  if (/[?&]pgbouncer=true/i.test(url)) {
    return true;
  }
  return /pooler\.supabase\.com/i.test(url) && /:6543\b/.test(url);
}

/**
 * Hosted Supabase expects TLS. URIs from the dashboard usually include `sslmode=require`;
 * if not, enforce TLS for Supabase hosts.
 */
function postgresOptions(url: string): NonNullable<Parameters<typeof postgres>[1]> {
  const opts: NonNullable<Parameters<typeof postgres>[1]> = {
    max: Number(process.env.POSTGRES_MAX_CONNECTIONS ?? 10),
    connect_timeout: Number(process.env.POSTGRES_CONNECT_TIMEOUT ?? 15),
    idle_timeout: 20,
  };

  if (shouldDisablePreparedStatements(url)) {
    opts.prepare = false;
  }

  const isSupabaseHost =
    /\.supabase\.com/i.test(url) || /\.supabase\.co/i.test(url);
  const hasSslMode =
    /sslmode=require/i.test(url) ||
    /sslmode=verify-full/i.test(url) ||
    /sslmode=no-verify/i.test(url);

  if (isSupabaseHost && !hasSslMode) {
    opts.ssl = 'require';
  }

  return opts;
}

export const client = postgres(connectionString, postgresOptions(connectionString));
export const db = drizzle(client, { schema });
