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

### Important deviations vs upstream starter

1. **SWR fallbacks** — Removed eager `/api/user` prefetch from [`app/layout.tsx`](app/layout.tsx) so `next build` does not require a live Postgres connection during static analysis.
2. **Postgres on Vercel** — [`lib/db/drizzle.ts`](lib/db/drizzle.ts) **requires** `POSTGRES_URL` when `VERCEL` is set. Locally, a placeholder URL is only used when not on Vercel. Supabase **transaction pooler** URLs disable prepared statements automatically; direct Supabase hosts get `ssl: 'require'` if `sslmode` is missing from the URI.
3. **Migrations connection** — [`drizzle.config.ts`](drizzle.config.ts) uses `POSTGRES_URL_MIGRATE` when set, otherwise `POSTGRES_URL`. Use a **direct** (or session) Supabase URI for `pnpm db:migrate` if the pooler gives trouble.
4. **AUTH_SECRET on Vercel** — [`lib/auth/session.ts`](lib/auth/session.ts) **requires** `AUTH_SECRET` when `VERCEL` is set. Local dev can still use a non-production fallback if unset.
5. **Stripe catalog** — [`app/(dashboard)/pricing/page.tsx`](app/(dashboard)/pricing/page.tsx) catches Stripe failures so builds succeed without live API keys (CTAs disable until prices exist).

---

## Environment variables

| Variable | Required on Vercel | Purpose |
| --- | --- | --- |
| `POSTGRES_URL` | **Yes** | Supabase Postgres URI for the **running app**. Prefer **Transaction pooler** (`*.pooler.supabase.com`, often `:6543`). |
| `POSTGRES_URL_MIGRATE` | No | Optional. Supabase **direct** or **session** URI for `pnpm db:migrate` / `drizzle-kit` only. Falls back to `POSTGRES_URL`. |
| `AUTH_SECRET` | **Yes** | Signing key for JWT session cookies (e.g. `openssl rand -base64 32`). |
| `BASE_URL` | **Yes** | Public site URL (`https://your-app.vercel.app` or custom domain). Used for Stripe redirects and the billing portal return URL. |
| `STRIPE_SECRET_KEY` | **Yes** (live/test per env) | Stripe API secret. |
| `STRIPE_WEBHOOK_SECRET` | **Yes** | Signing secret for `POST /api/stripe/webhook`. |

Optional tuning (see [`.env.example`](.env.example)):

- `POSTGRES_MAX_CONNECTIONS` (default `10`)
- `POSTGRES_CONNECT_TIMEOUT` (default `15`)

**Never commit `.env`.** It is listed in [`.gitignore`](.gitignore). Use [`.env.example`](.env.example) as the template.

---

## Supabase Postgres setup

1. **Create a project** at [supabase.com](https://supabase.com) → New project → note region and database password.
2. **Connection strings** — Supabase → **Project Settings** → **Database**:
   - **For Vercel / `POSTGRES_URL`:** use **Connection pooling** → **Transaction mode** (URI). Host usually contains `pooler.supabase.com` and port `6543`. Keep `?sslmode=require` if the dashboard includes it.
   - **For local migrations (`pnpm db:migrate`):** use **Direct connection** or **Session mode** URI (`db.<ref>.supabase.co:5432`, or the session pooler if you use it). If migrations fail through the transaction pooler, set `POSTGRES_URL_MIGRATE` to this direct/session URI in your local `.env` only; keep `POSTGRES_URL` as the pooler for the app.
   - **IPv4 warning on direct host:** If Supabase shows **“Not IPv4 compatible”** for `db.<ref>.supabase.co:5432`, that URI often needs **IPv6**, Supabase’s **IPv4 add-on**, or you must run migrations from an IPv6-capable network. For **Vercel** and many IPv4-only networks, use the **Shared Pooler** → **Transaction** URI as `POSTGRES_URL` (host like `*.pooler.supabase.com`, port `6543`). You can still try **direct** as `POSTGRES_URL_MIGRATE` from a network that can reach it; if connect fails, use **Session pooler** / SQL Editor per [Supabase docs](https://supabase.com/docs/guides/database/connecting-to-postgres), or enable the IPv4 add-on.
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
