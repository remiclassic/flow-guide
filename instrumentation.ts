export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return;
  }

  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  if (process.env.SKIP_DB_ENV_WARNINGS === '1') {
    return;
  }

  const pg = process.env.POSTGRES_URL?.trim();
  const migrate = process.env.POSTGRES_URL_MIGRATE?.trim();

  if (!pg && !process.env.DATABASE_URL?.trim()) {
    console.warn(
      '[flow-guide] POSTGRES_URL (or DATABASE_URL) is unset. API routes that use the DB will fail until you add a connection string. Copy `.env.example` → `.env`.'
    );
    return;
  }

  if (pg && /db\.[a-z0-9]+\.supabase\.co/i.test(pg) && !migrate) {
    console.warn(
      '[flow-guide] POSTGRES_URL points at db.*.supabase.co (often IPv6-only). For app runtime on Vercel/serverless, prefer the Transaction pooler (*.pooler.supabase.com:6543). For local Drizzle migrate on IPv4, set POSTGRES_URL_MIGRATE to the Session pooler (:5432). See .env.example.'
    );
  }
}
