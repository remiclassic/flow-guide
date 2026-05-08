import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Load `.env` then `.env.local` (override) so Drizzle CLI, `tsx` scripts, and
 * `lib/db/drizzle.ts` match Next.js env precedence. Next still loads env at
 * build/runtime; this is for anything that runs outside the Next bundler.
 */
export function loadRootEnvFiles(cwd = process.cwd()) {
  const envPath = resolve(cwd, '.env');
  const localPath = resolve(cwd, '.env.local');
  if (existsSync(envPath)) {
    config({ path: envPath });
  }
  if (existsSync(localPath)) {
    config({ path: localPath, override: true });
  }
}
