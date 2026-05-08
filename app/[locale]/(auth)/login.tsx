'use client';

import { Link } from '@/i18n/navigation';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { signIn, signUp } from './actions';
import { ActionState } from '@/lib/auth/middleware';
import { useTranslations } from 'next-intl';
import { FlowLogoMark } from '@/components/brand/flow-logo';

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const t = useTranslations('auth');
  const tNav = useTranslations('navigation');
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const inviteId = searchParams.get('inviteId');
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === 'signin' ? signIn : signUp,
    { error: '' }
  );

  const alternateQuery: Record<string, string> = {};
  if (redirect) alternateQuery.redirect = redirect;
  if (priceId) alternateQuery.priceId = priceId;
  if (inviteId) alternateQuery.inviteId = inviteId;

  const inputClassName =
    'relative block h-11 w-full appearance-none rounded-full border border-stone-200/90 bg-white/80 px-4 text-stone-900 shadow-sm placeholder:text-stone-400 backdrop-blur-sm focus:z-10 focus:border-amber-600/70 focus:outline-none focus:ring-2 focus:ring-amber-500/25 sm:text-sm';

  return (
    <div className="relative isolate min-h-[100dvh] overflow-hidden bg-[#fbf7f0] text-stone-950">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_12%,rgba(255,219,171,0.55),transparent_26rem),radial-gradient(circle_at_82%_8%,rgba(196,181,253,0.34),transparent_28rem),linear-gradient(180deg,#fffaf2_0%,#f8f0e6_48%,#fbf7f0_100%)]"
        aria-hidden
      />
      <div className="absolute left-1/2 top-24 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-white/70 blur-3xl" aria-hidden />

      <div className="flex min-h-[100dvh] flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 transition-opacity hover:opacity-90"
          >
            <FlowLogoMark size={48} fetchPriority="high" className="size-12" />
            <span className="text-lg font-semibold tracking-tight text-stone-950">
              Flow Guide
            </span>
            <span className="text-[11px] font-medium tracking-wide text-stone-500">
              {tNav('brandTagline')}
            </span>
          </Link>

          <div className="mt-8 rounded-[2rem] border border-white/85 bg-white/75 p-8 shadow-[0_24px_70px_-44px_rgba(120,83,45,0.48)] backdrop-blur-md sm:p-9">
            <h1 className="text-center text-2xl font-semibold tracking-[-0.035em] text-stone-950 sm:text-3xl">
              {mode === 'signin' ? t('signInTitle') : t('signUpTitle')}
            </h1>

            <form className="mt-8 space-y-5" action={formAction}>
              <input type="hidden" name="redirect" value={redirect || ''} />
              <input type="hidden" name="priceId" value={priceId || ''} />
              <input type="hidden" name="inviteId" value={inviteId || ''} />
              <div>
                <Label
                  htmlFor="email"
                  className="block text-sm font-medium text-stone-700"
                >
                  {t('emailLabel')}
                </Label>
                <div className="mt-1.5">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    defaultValue={state.email}
                    required
                    maxLength={50}
                    className={inputClassName}
                    placeholder={t('emailPlaceholder')}
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="password"
                  className="block text-sm font-medium text-stone-700"
                >
                  {t('passwordLabel')}
                </Label>
                <div className="mt-1.5">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={
                      mode === 'signin' ? 'current-password' : 'new-password'
                    }
                    defaultValue={state.password}
                    required
                    minLength={8}
                    maxLength={100}
                    className={inputClassName}
                    placeholder={
                      mode === 'signin'
                        ? t('passwordPlaceholderSignIn')
                        : t('passwordPlaceholderSignUp')
                    }
                  />
                </div>
              </div>

              {state?.error ? (
                <div className="rounded-2xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-800">
                  {state.error}
                </div>
              ) : null}

              <Button
                type="submit"
                className="flex h-11 w-full items-center justify-center rounded-full bg-stone-950 text-sm font-medium text-white shadow-[0_18px_45px_-24px_rgba(28,25,23,0.9)] hover:bg-stone-800"
                disabled={pending}
              >
                {pending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('loading')}
                  </>
                ) : mode === 'signin' ? (
                  t('submitSignIn')
                ) : (
                  t('submitSignUp')
                )}
              </Button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200/80" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white/75 px-3 text-stone-500 backdrop-blur-sm">
                    {mode === 'signin' ? t('noAccount') : t('hasAccount')}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href={{
                    pathname: mode === 'signin' ? '/sign-up' : '/sign-in',
                    ...(Object.keys(alternateQuery).length > 0
                      ? { query: alternateQuery }
                      : {})
                  }}
                  className="flex h-11 w-full items-center justify-center rounded-full border border-stone-300/80 bg-white/70 text-sm font-medium text-stone-800 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
                >
                  {mode === 'signin' ? t('signUpLink') : t('signInLink')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
