# Glow Flow — Course Platform

Production-oriented rewrite of the legacy GitHub Pages course on top of the official [**Next.js SaaS Starter**](https://github.com/nextjs/saas-starter). The stack pairs the App Router with Drizzle + Postgres, Stripe subscriptions, JWT cookie auth, and shadcn/ui styling hooks.

## Architecture snapshot

| Layer | Responsibility |
| --- | --- |
| `app/(dashboard)` | Marketing surface + authenticated shell (header, navigation). |
| `app/(dashboard)/dashboard/*` | Workspace: courses, billing, coach placeholder, team utilities from the starter. |
| `app/admin` | Owner-only counters + future operational tooling (session gated + layout guard). |
| `lib/db` | Drizzle schema, migrations, queries, seeds. |
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
2. **Database URL fallback** — [`lib/db/drizzle.ts`](lib/db/drizzle.ts) defaults `POSTGRES_URL` to a dummy host when unset so tooling can import modules; always configure a real URL locally/prod.
3. **AUTH_SECRET fallback** — [`lib/auth/session.ts`](lib/auth/session.ts) injects a dev-only default so builds succeed; **set a strong secret in hosted environments**.
4. **Stripe catalog** — [`app/(dashboard)/pricing/page.tsx`](app/(dashboard)/pricing/page.tsx) catches Stripe failures so builds succeed without live API keys (CTAs disable until prices exist).

## Local setup

```bash
pnpm install
cp .env.example .env
# fill POSTGRES_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, BASE_URL, AUTH_SECRET

pnpm db:migrate
pnpm db:seed    # creates sample owner + Glow Flow course tree (+ Stripe products when keys work)
pnpm dev
```

Useful URLs:

- Marketing: `/`
- Pricing + Checkout: `/pricing`
- Dashboard courses: `/dashboard/courses`
- Legacy mirror landing: `/legacy`

### Scripts

| Script | Purpose |
| --- | --- |
| `pnpm dev` | Turbopack dev server |
| `pnpm build` / `pnpm start` | Production bundle |
| `pnpm lint` | `next lint` |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm db:*` | Drizzle workflows from the starter |

### Stripe webhook testing

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Ensure `STRIPE_WEBHOOK_SECRET` matches the CLI pairing secret.

## Legacy content tools

Static authoring helpers (`tools/*.mjs`) remain available for HTML-era maintenance while lessons migrate.

## Deployment checklist

1. Provision Postgres + run migrations (`pnpm db:migrate`).
2. Configure env vars on the host (see `.env.example`).
3. Point Stripe webhook to `/api/stripe/webhook`.
4. Run `pnpm db:seed` once per environment (or craft your own migration strategy).
5. Optional: remove `/legacy` routes once native lesson rendering ships.

## Next priorities

1. Replace iframe viewer with MDX/React lessons + shared quiz components sourced from `tools/quiz-data.mjs`.
2. Add notifications + analytics pipelines feeding off `lesson_progress`.
3. Layer XP / streak structures without blocking lesson integrity.
4. Expand admin beyond counters (cohorts, refunds, AI coach prompts).
