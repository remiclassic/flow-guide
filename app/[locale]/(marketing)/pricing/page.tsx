import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { checkoutAction } from '@/lib/payments/actions';
import { Check, Leaf, Shield } from 'lucide-react';
import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import { Button } from '@/components/ui/button';
import { SubmitButton } from './submit-button';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pricing' });
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000';
  const path = locale === 'es' ? '/precios' : '/pricing';

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: `${base}/${locale}${path}`,
      languages: {
        es: `${base}/es/precios`,
        en: `${base}/en/pricing`,
        'x-default': `${base}/es/precios`
      }
    }
  };
}

async function loadStripeCatalog() {
  try {
    const [prices, products] = await Promise.all([
      getStripePrices(),
      getStripeProducts()
    ]);
    return { prices, products };
  } catch (error) {
    console.warn(
      'Stripe catalog unavailable (check STRIPE_SECRET_KEY):',
      error
    );
    return { prices: [], products: [] };
  }
}

export default async function PricingPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pricing' });
  const { prices, products } = await loadStripeCatalog();

  const basePlan = products.find((product) => product.name === 'Base');
  const plusPlan = products.find((product) => product.name === 'Plus');

  const basePrice = prices.find((price) => price.productId === basePlan?.id);
  const plusPrice = prices.find((price) => price.productId === plusPlan?.id);

  const intervalLabel = (interval: string) =>
    interval === 'month'
      ? t('intervalMonth')
      : interval === 'year'
        ? t('intervalYear')
        : interval;

  return (
    <main className="overflow-hidden bg-[#fbf7f0] text-stone-950">
      <section className="relative isolate px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-20">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_12%,rgba(255,219,171,0.55),transparent_26rem),radial-gradient(circle_at_82%_8%,rgba(196,181,253,0.34),transparent_28rem),linear-gradient(180deg,#fffaf2_0%,#f8f0e6_48%,#fbf7f0_100%)]" />
        <div className="absolute left-1/2 top-24 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-white/70 blur-3xl" />

        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:gap-16">
          <div className="space-y-8">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-stone-600 shadow-[0_16px_50px_-30px_rgba(120,83,45,0.55)] backdrop-blur">
              <Leaf className="size-4 text-emerald-600" aria-hidden />
              {t('eyebrow')}
            </p>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-stone-950 sm:text-5xl lg:text-6xl">
                {t('title')}
              </h1>
              <p className="max-w-xl text-lg leading-8 text-stone-600 sm:text-xl">
                {t('subtitle')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-full border-stone-300/80 bg-white/70 px-6 text-base text-stone-800 shadow-sm backdrop-blur hover:bg-white"
              >
                <Link href="/">{t('backHome')}</Link>
              </Button>
              <span className="flex items-center gap-2 text-sm text-stone-600">
                <Shield className="size-4 shrink-0 text-amber-700" aria-hidden />
                {t('trialNote')}
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="relative overflow-hidden rounded-[2.25rem] border border-white/80 bg-white p-3 shadow-[0_34px_100px_-50px_rgba(120,83,45,0.58)]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem]">
                <Image
                  src="/brand/marketing-hero-lifestyle.png"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-white/15" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center lg:mb-14">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">
              {t('plansEyebrow')}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-stone-950 sm:text-4xl">
              {t('plansTitle')}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 md:items-stretch">
            <PricingCard
              name={basePlan?.name || 'Base'}
              description={t('cardBaseDesc')}
              price={basePrice?.unitAmount || 800}
              trialBadge={t('trialDays', {
                days: basePrice?.trialPeriodDays || 7
              })}
              priceSuffix={t('perMemberInterval', {
                interval: intervalLabel(basePrice?.interval || 'month')
              })}
              features={[
                t('features.base1'),
                t('features.base2'),
                t('features.base3')
              ]}
              priceId={basePrice?.id}
              popularLabel={t('popular')}
              checkoutPrep={t('checkoutPrep')}
            />
            <PricingCard
              name={plusPlan?.name || 'Plus'}
              description={t('cardPlusDesc')}
              price={plusPrice?.unitAmount || 1200}
              trialBadge={t('trialDays', {
                days: plusPrice?.trialPeriodDays || 7
              })}
              priceSuffix={t('perMemberInterval', {
                interval: intervalLabel(plusPrice?.interval || 'month')
              })}
              features={[
                t('features.plus1'),
                t('features.plus2'),
                t('features.plus3')
              ]}
              priceId={plusPrice?.id}
              featured
              popularLabel={t('popular')}
              checkoutPrep={t('checkoutPrep')}
            />
          </div>

          <p className="mt-10 text-center text-[10px] font-normal tracking-[0.08em] text-stone-400/90">
            {t('stripeBillingNote')}
          </p>
        </div>
      </section>

      <section className="border-t border-white/60 bg-[linear-gradient(180deg,#fffaf2_0%,#fbf7f0_100%)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">
            {t('alreadyEyebrow')}
          </p>
          <p className="text-lg leading-8 text-stone-600">{t('alreadyBody')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-stone-300/80 bg-white/80 px-6 text-base shadow-sm hover:bg-white"
            >
              <Link href="/sign-in">{t('signInCta')}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-stone-950 px-6 text-base text-white shadow-[0_18px_45px_-24px_rgba(28,25,23,0.9)] hover:bg-stone-800"
            >
              <Link href="/sign-up">{t('signUpCta')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

function PricingCard({
  name,
  description,
  price,
  trialBadge,
  priceSuffix,
  features,
  priceId,
  featured = false,
  popularLabel,
  checkoutPrep
}: {
  name: string;
  description: string;
  price: number;
  trialBadge: string;
  priceSuffix: string;
  features: string[];
  priceId?: string;
  featured?: boolean;
  popularLabel: string;
  checkoutPrep: string;
}) {
  return (
    <article
      className={`relative flex flex-col rounded-[2rem] border bg-white/82 p-8 shadow-[0_24px_70px_-44px_rgba(120,83,45,0.44)] backdrop-blur sm:p-9 ${
        featured
          ? 'border-amber-400/45 ring-2 ring-amber-400/25 md:-translate-y-1 md:shadow-[0_32px_90px_-48px_rgba(120,83,45,0.55)]'
          : 'border-white/85'
      }`}
    >
      {featured ? (
        <p className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-md">
          {popularLabel}
        </p>
      ) : null}

      <div className="mb-6">
        <h3 className="text-2xl font-semibold tracking-[-0.03em] text-stone-950">
          {name}
        </h3>
        <p className="mt-2 leading-7 text-stone-600">{description}</p>
      </div>

      <div className="mb-2">
        <span className="inline-flex rounded-full border border-emerald-200/80 bg-emerald-50/90 px-3 py-1 text-xs font-semibold text-emerald-900">
          {trialBadge}
        </span>
      </div>

      <div className="mb-8 border-b border-stone-200/70 pb-8">
        <p className="flex flex-wrap items-baseline gap-2">
          <span className="text-5xl font-semibold tracking-[-0.05em] text-stone-950">
            ${price / 100}
          </span>
          <span className="text-lg text-stone-600">{priceSuffix}</span>
        </p>
      </div>

      <ul className="mb-8 flex-1 space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex gap-3 text-stone-700">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800">
              <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
            </span>
            <span className="leading-7">{feature}</span>
          </li>
        ))}
      </ul>

      <form action={checkoutAction} className="mt-auto">
        <input type="hidden" name="priceId" value={priceId ?? ''} />
        <SubmitButton disabled={!priceId} featured={featured} />
      </form>
      {!priceId ? (
        <p className="mt-4 text-center text-xs text-stone-500">{checkoutPrep}</p>
      ) : null}
    </article>
  );
}
