import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

/** Allows `next build` / typecheck without a local DB; set real `POSTGRES_URL` for runtime. */
const connectionString =
  process.env.POSTGRES_URL ?? 'postgresql://127.0.0.1:5432/placeholder';

export const client = postgres(connectionString);
export const db = drizzle(client, { schema });
