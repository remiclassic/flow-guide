# Glow Flow — Course Platform

Production-oriented rewrite of the legacy GitHub Pages course on top of the official [**Next.js SaaS Starter**](https://github.com/nextjs/saas-starter). The stack pairs the App Router with Drizzle + Postgres, Stripe subscriptions, JWT cookie auth, and shadcn/ui styling hooks.

## Architecture snapshot

| Layer | Responsibility |
| --- | --- |
| `app/(dashboard)` | Marketing surface + authenticated shell (header, navigation). |
| `app/(dashboard)/dashboard/*` | Workspace: courses, billing, coach placeholder, team utilities from the starter. |
| `app/admin` | Owner-only counters + future operational tooling (session gated + layout guard). |
| `lib/db` | Drizzle schema, migrations, seeds. |
| `lib/courses` | Curriculum constants, server actions for lesson progress. |
| `lib/payments` | Stripe checkout + portal + subscription sync helpers. |
| `public/legacy` | Frozen static Glow Flow site (`/legacy/...`) while lessons transition to native rendering. |

### Course model

- `courses` → `course_modules` → `lessons`
- `lesson_progress` tracks per-user completion (ties into future analytics/gamification).
- Lesson bodies currently load via iframe from `/legacy/course/...` using `legacy_html_path` metadata seeded from [`lib/courses/curriculum.ts`](lib/courses/curriculum.ts).

### Access control

- Middleware guards `/dashboard/*` and `/admin/*` for session presence (`middleware.ts`).
- Paid lesson routes additionally require team subscription status `active` or `trialing` (`teamHasCourseAccess` in [`lib/db/queries.ts`](lib/db/queries.ts)).

### Authentication vs Supabase

- **Sign-in** is implemented with **email + password** stored in Postgres (`users` table, bcrypt hashes) and **signed JWT cookies** ([`lib/auth/session.ts`](lib/auth/session.ts)). Middleware refreshes the cookie on GET ([`middleware.ts`](middleware.ts)).
- **Supabase Auth** (GoTrue / `@supabase/ssr` sessions) is **not** wired to the app today. Supabase is used for **Postgres** (Drizzle) and optionally **Storage** (media uploads via service role).
- **Production:** set a strong `AUTH_SECRET` on Vercel. **Local HTTP:** session cookies use `secure: false` unless `COOKIE_SECURE=1` ([`lib/auth/cookie-options.ts`](lib/auth/cookie-options.ts)) so sign-in works on `http://localhost:3000`.

### Important deviations vs upstream starter

1. **SWR fallbacks** — Removed eager `/api/user` prefetch from [`app/layout.tsx`](app/layout.tsx) so `next build` does not require a live Postgres connection during static analysis.
2. **Postgres on Vercel** — [`lib/db/drizzle.ts`](lib/db/drizzle.ts) **requires** `POSTGRES_URL` (or `DATABASE_URL`) when `VERCEL` is set. Locally, a placeholder URL is only used when not on Vercel. Supabase **transaction pooler** (port 6543) disables prepared statements; session pooler (5432) does not. Supabase pooler and `*.supabase.co` hosts get `ssl: 'require'` if `sslmode` is missing from the URI.
3. **Migrations connection** — [`drizzle.config.ts`](drizzle.config.ts) uses `POSTGRES_URL_MIGRATE` when set, otherwise `POSTGRES_URL`. Prefer the **Session** pooler (`*.pooler.supabase.com:5432`) for `pnpm db:migrate` on IPv4-only networks (e.g. many Windows setups): `db.<ref>.supabase.co` is often IPv6-only and can fail with `getaddrinfo ENOTFOUND`.
4. **AUTH_SECRET on Vercel** — [`lib/auth/session.ts`](lib/auth/session.ts) **requires** `AUTH_SECRET` when `VERCEL` is set. Local dev can still use a non-production fallback if unset.
5. **Stripe catalog** — [`app/(dashboard)/pricing/page.tsx`](app/(dashboard)/pricing/page.tsx) catches Stripe failures so builds succeed without live API keys (CTAs disable until prices exist).

---

## Environment variables

| Variable | Required on Vercel | Purpose |
| --- | --- | --- |
| `POSTGRES_URL` | **Yes** | Supabase **Transaction** pooler for the running app (`*.pooler.supabase.com`, port **6543**). |
| `DATABASE_URL` | No | Optional alias for `POSTGRES_URL` if your host only provides this name. |
| `POSTGRES_URL_MIGRATE` | No | **Direct** (5432) or **Session** pooler URI for `pnpm db:migrate`, `pnpm db:push`, and `pnpm db:pull`. Strongly recommended on Supabase when the pooler rejects DDL. |
| `AUTH_SECRET` | **Yes** | Signing key for JWT session cookies (e.g. `openssl rand -base64 32`). |
| `BASE_URL` | **Yes** | Public site URL (`https://your-app.vercel.app` or custom domain). Used for Stripe redirects and the billing portal return URL. |
| `STRIPE_SECRET_KEY` | **Yes** (live/test per env) | Stripe API secret. |
| `STRIPE_WEBHOOK_SECRET` | **Yes** | Signing secret for `POST /api/stripe/webhook`. |
| `SUPABASE_URL` | No* | **Server project URL** for Storage (`https://<ref>.supabase.co`). *Required for uploads unless `NEXT_PUBLIC_SUPABASE_URL` is set (same URL is accepted as fallback). |
| `NEXT_PUBLIC_SUPABASE_URL` | No* | Optional fallback for the **same** project URL if `SUPABASE_URL` is unset. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** (for uploads) | **Service role** key — server-only; never `NEXT_PUBLIC_*`. Without it, admin uploads return 503. |
| `SUPABASE_MEDIA_BUCKET` | No | Storage bucket id (default `course-media`). Alias: `SUPABASE_STORAGE_BUCKET`. |

Optional tuning (see [`.env.example`](.env.example)):

- `POSTGRES_MAX_CONNECTIONS` (default `10`)
- `POSTGRES_CONNECT_TIMEOUT` (default `15`)
- `COOKIE_SECURE` — `1` forces `Secure` session cookies (e.g. HTTPS dev); `0` disables.

**`.env.local`** — Next.js and [`lib/env/load-dotenv.ts`](lib/env/load-dotenv.ts) load `.env` then `.env.local` (local overrides). Drizzle CLI uses the same order via [`drizzle.config.ts`](drizzle.config.ts).

**Never commit `.env` or `.env.local`.** Use [`.env.example`](.env.example) as the template.

### Vercel: Preview vs Production (Storage uploads)

Use the **same** Supabase Storage variables in both environments if Preview should allow admin uploads against the same project:

| Variable | Production | Preview (branch deploys) |
| --- | --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** — service_role secret | **Yes** (often same project as prod, or a separate Supabase project for staging) |
| `SUPABASE_URL` *or* `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | **Yes** |
| `SUPABASE_MEDIA_BUCKET` | Optional (default `course-media`) | Optional |

If Preview must **not** write to production Storage, create a second Supabase project (or bucket) and point Preview env vars at it only.

---

## Supabase Postgres setup

1. **Create a project** at [supabase.com](https://supabase.com) → New project → note region and database password.
2. **Connection strings** — Supabase → **Project Settings** → **Database**:
   - **For Vercel / `POSTGRES_URL`:** use **Connection pooling** → **Transaction mode** (URI). Host usually contains `pooler.supabase.com` and port `6543`. Keep `?sslmode=require` if the dashboard includes it.
   - **For local migrations (`pnpm db:migrate`):** prefer **Session mode** pooler (`*.pooler.supabase.com`, port **5432**, user `postgres.<ref>`). **Direct** `db.<ref>.supabase.co:5432` works only if your network can reach IPv6 (or you use Supabase’s IPv4 add-on); on IPv4-only Windows, Drizzle often fails with `ENOTFOUND` for the direct host. Keep `POSTGRES_URL` as **Transaction** pooler (6543); set `POSTGRES_URL_MIGRATE` to **Session** in local `.env` only.
   - **IPv4 / Windows:** If `db.<ref>.supabase.co` does not resolve or connect, use **Session pooler** for `POSTGRES_URL_MIGRATE` instead of direct. For the running app on **Vercel**, keep **Transaction** pooler as `POSTGRES_URL`. See [Supabase connecting to Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres).
3. **Local `.env`** — Copy [`.env.example`](.env.example) to `.env` and set `POSTGRES_URL` (and optional `POSTGRES_URL_MIGRATE`, `AUTH_SECRET`, `BASE_URL`, Stripe keys).
4. **Vercel** — Add the same variables under the Vercel project → **Settings** → **Environment Variables** (at minimum the table above). Use **Production** (and **Preview** if you want branch deploys) as needed.
5. **Migrations** (from your machine, against Supabase):

   ```bash
   pnpm install
   pnpm db:migrate
   ```

6. **Seed** (optional; creates a test user, team, course tree, and Stripe products if the Stripe key is valid):

   ```bash
   pnpm db:seed
   ```

   The course seed is **idempotent** (skips if the Glow Flow course slug already exists). The Stripe part is wrapped in `try/catch` so a missing/invalid key does not fail the whole seed.
7. **Verify** — Supabase → **Table Editor**: confirm tables such as `users`, `teams`, `courses`, `course_modules`, `lessons`, etc., exist after migrate/seed.
8. **Storage (media uploads)** — In Supabase → **Storage** → **New bucket**. Use id **`course-media`** (or set `SUPABASE_MEDIA_BUCKET` / `SUPABASE_STORAGE_BUCKET` to match). For course cards and `getPublicUrl` responses, turn on **Public bucket** (or implement signed URLs in code — not included here).  
   **Env (Vercel / `.env`):** `SUPABASE_SERVICE_ROLE_KEY` (required) and **`SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`** (same `https://<ref>.supabase.co` value). The upload API returns JSON with `missingEnv`, `message`, and mapped errors if the bucket or key is wrong.  
   **SQL:** run [`scripts/supabase-storage-course-media.sql`](scripts/supabase-storage-course-media.sql) in the SQL Editor (or paste its `insert into storage.buckets …`).  
   **Bootstrap `.env` keys:** `pnpm ensure:storage-env` appends `SUPABASE_URL` (derived from `POSTGRES_URL` when possible), `SUPABASE_SERVICE_ROLE_KEY=`, and `SUPABASE_MEDIA_BUCKET=course-media` only if those keys are missing.  
   **Verify locally:** after pasting the service role secret, run `pnpm check:storage` — it checks env, lists buckets, and performs a tiny upload/delete probe.  
   **Dev note:** If uploads still say “Storage not configured” after editing `.env`, restart `pnpm dev` so Next.js reloads environment variables.

### Schema sync: migrate vs push

| Command | Use when |
| --- | --- |
| `pnpm db:migrate` | **Production and teams** — applies versioned SQL in [`lib/db/migrations/`](lib/db/migrations/) (Course Studio, media, CMS, subscriptions, progress, etc.). |
| `pnpm db:push` | **Dev / throwaway DB** — pushes [`lib/db/schema.ts`](lib/db/schema.ts) directly. On Supabase, prefer `POSTGRES_URL_MIGRATE` (direct/session) if the transaction pooler errors on DDL. |
| `pnpm db:pull` | Introspect an existing database into a schema file (advanced). |

---

## Vercel deployment

1. **GitHub** — Push this repo to GitHub (already configured for your remote).
2. **New Vercel project** — [vercel.com](https://vercel.com) → Add New → Project → import the repo.
3. **Framework** — **Next.js** (auto-detected).
4. **Build settings** — [`vercel.json`](vercel.json) sets:
   - **Install Command:** `pnpm install`
   - **Build Command:** `pnpm build`  
   If you override in the dashboard, keep those equivalent. Vercel will also pick **pnpm** when `pnpm-lock.yaml` is present.
5. **Environment variables** — Add all **Required on Vercel** rows from the table above. For the first deploy, you can set `BASE_URL` to the Vercel URL you expect (e.g. `https://<project>.vercel.app`); after the first production URL is assigned, **update `BASE_URL`** to the final production domain if it changed (custom domain, rename, etc.).
6. **Deploy** — Run deploy. Ensure the build logs show no missing `POSTGRES_URL` / `AUTH_SECRET` (both are enforced when `VERCEL=1`).
7. **Post-deploy**
   - **Stripe:** Dashboard → **Developers** → **Webhooks** → add endpoint `https://<your-production-domain>/api/stripe/webhook`, select events used by the app (e.g. `customer.subscription.updated`, `customer.subscription.deleted`), and set `STRIPE_WEBHOOK_SECRET` in Vercel to the **signing secret** for that endpoint.
   - **BASE_URL:** align with the canonical public URL so checkout and the customer portal return to the right host.

---

## Local setup (quick)

```bash
pnpm install
cp .env.example .env
# fill POSTGRES_URL, AUTH_SECRET, BASE_URL, STRIPE_*, optional POSTGRES_URL_MIGRATE

pnpm db:migrate
pnpm db:seed
pnpm dev
```

Useful URLs:

- Marketing: `/`
- Pricing + Checkout: `/pricing`
- Dashboard courses: `/dashboard/courses`
- Legacy mirror: `/legacy`

### Scripts

| Script | Purpose |
| --- | --- |
| `pnpm dev` | Turbopack dev server |
| `pnpm build` / `pnpm start` | Production bundle |
| `pnpm lint` | ESLint (`eslint .`) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm db:migrate` | Apply Drizzle migrations to the DB in `drizzle.config.ts` |
| `pnpm db:push` | Push schema to DB (no migration files; dev-oriented) |
| `pnpm db:pull` | Introspect DB → schema file |
| `pnpm db:seed` | Seed data (see above) |
| `pnpm db:generate` | Generate new migration SQL from schema changes |

### Stripe webhook (local)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Point `STRIPE_WEBHOOK_SECRET` to the secret the CLI prints.

---

## Legacy content tools

Static authoring helpers (`tools/*.mjs`) remain available for HTML-era maintenance while lessons migrate.

---

## Next priorities

1. Replace iframe viewer with MDX/React lessons + shared quiz components sourced from `tools/quiz-data.mjs`.
2. Add notifications + analytics pipelines feeding off `lesson_progress`.
3. Layer XP / streak structures without blocking lesson integrity.
4. Expand admin beyond counters (cohorts, refunds, AI coach prompts).
