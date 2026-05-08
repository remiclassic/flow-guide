import type { Config } from 'drizzle-kit';
import {
  assertValidDrizzleCliPostgresUrl,
  getMigrationPostgresUrlFromEnv,
  warnIfDirectSupabaseDbHostLikelyIpv4Broken,
  warnIfUsingTransactionPoolerForCli,
} from './lib/env/drizzle-postgres-env';

const { url: migrationUrl, source: migrationSource } =
  getMigrationPostgresUrlFromEnv();

assertValidDrizzleCliPostgresUrl(migrationUrl, migrationSource);
warnIfDirectSupabaseDbHostLikelyIpv4Broken(migrationUrl);
warnIfUsingTransactionPoolerForCli(migrationUrl, migrationSource);

/**
 * Prefer `POSTGRES_URL_MIGRATE` for Drizzle CLI (`db:migrate`, `db:push`, `db:pull`):
 * - **Runtime (`POSTGRES_URL`)**: Supabase **Transaction** pooler
 *   (`*.pooler.supabase.com:6543`) — best for serverless / many short connections.
 * - **Migrations / schema sync**: **Session** pooler (`*.pooler.supabase.com:5432`) or
 *   **direct** `db.<ref>.supabase.co:5432`. Direct is often IPv6-only; on IPv4-only
 *   networks (common on Windows), use Session pooler instead of `db.*.supabase.co`.
 * - Transaction pooler (6543) is unreliable for DDL; avoid for CLI unless you know
 *   it works for your setup.
 */

export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: migrationUrl,
  },
} satisfies Config;
