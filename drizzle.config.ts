import 'dotenv/config';
import type { Config } from 'drizzle-kit';

/**
 * Prefer `POSTGRES_URL_MIGRATE` for Drizzle CLI (migrations) when it differs from app runtime URL:
 * - **Runtime (Vercel / `POSTGRES_URL`)**: Supabase *Transaction* pooler (`*.pooler.supabase.com:6543`) — best for serverless concurrency.
 * - **Migrations (`POSTGRES_URL_MIGRATE`)**: Supabase *direct* or *Session* connection — avoids pooler limitations for DDL.
 *
 * If `POSTGRES_URL_MIGRATE` is unset, `POSTGRES_URL` is used for both.
 */
const migrationUrl =
  process.env.POSTGRES_URL_MIGRATE?.trim() ||
  process.env.POSTGRES_URL?.trim() ||
  'postgresql://127.0.0.1:5432/drizzle-placeholder';

export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: migrationUrl,
  },
} satisfies Config;
