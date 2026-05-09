'use client';

import { FlowLogoMark } from '@/components/brand/flow-logo';
import { LanguageSwitcher } from '@/components/i18n/language-switcher';
import { Suspense, useMemo, useState, useSyncExternalStore } from 'react';
import NextLink from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { signOut } from '@/app/[locale]/(auth)/actions';
import { User } from '@/lib/db/schema';
import { cn } from '@/lib/utils';
import { GLOW_FLOW_COURSE_SLUG } from '@/lib/courses/curriculum';
import { isDashboardCourseLessonPath } from '@/lib/courses/immersive-lesson-path';
import { ImmersiveLessonTopBar } from '@/components/dashboard/immersive-lesson-top-bar';
import useSWR, { mutate } from 'swr';
import {
  Users,
  Settings,
  Shield,
  Activity,
  Menu,
  BookOpen,
  CreditCard,
  Sparkles,
  Home,
  Map,
  Flag,
  Trophy,
  UserCircle,
  LogOut,
  ChevronDown,
  Sparkle,
  type LucideIcon,
} from 'lucide-react';

function SidebarUpgradeIllustration() {
  const sparkle =
    'absolute z-20 drop-shadow-[0_0_10px_rgba(255,255,255,0.9)] motion-safe:animate-[sidebar-upgrade-twinkle_2.8s_ease-in-out_infinite] [&>svg]:fill-current';
  return (
    <div
      className="relative mx-auto mb-2 flex h-[5.25rem] w-[7.25rem] shrink-0 items-center justify-center"
      aria-hidden
    >
      <span className="absolute inset-x-4 bottom-3 h-5 rounded-full bg-fuchsia-500/25 blur-xl" />
      <span className="absolute size-16 rounded-full bg-cyan-300/35 blur-2xl" />
      <span className="absolute size-[4.25rem] rounded-full border border-white/55 bg-white/20 shadow-[inset_0_0_22px_rgba(255,255,255,0.55)]" />
      <span className={`${sparkle} left-0 top-3 text-amber-300`}>
        <Sparkle className="size-3.5" strokeWidth={2} />
      </span>
      <span className={`${sparkle} left-2 top-0 text-cyan-300 [animation-delay:0.45s]`}>
        <Sparkle className="size-2.5" strokeWidth={2} />
      </span>
      <span className={`${sparkle} bottom-5 left-0.5 text-fuchsia-300 [animation-delay:0.9s]`}>
        <Sparkle className="size-2" strokeWidth={2} />
      </span>
      <span className={`${sparkle} right-0 top-4 text-yellow-300 [animation-delay:1.2s]`}>
        <Sparkle className="size-3" strokeWidth={2} />
      </span>
      <span className={`${sparkle} right-1 top-0 text-sky-300 [animation-delay:0.25s]`}>
        <Sparkle className="size-2.5" strokeWidth={2} />
      </span>
      <span className={`${sparkle} bottom-6 right-0 text-pink-300 [animation-delay:1.55s]`}>
        <Sparkle className="size-2" strokeWidth={2} />
      </span>
      <svg
        viewBox="0 0 56 64"
        className="relative z-10 h-[3.5rem] w-[3.5rem] drop-shadow-[0_12px_18px_rgba(124,58,237,0.38)] motion-safe:animate-[sidebar-upgrade-float_4s_ease-in-out_infinite]"
      >
        <defs>
          <linearGradient id="sidebar-upgrade-gem-a" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="36%" stopColor="#EC4899" />
            <stop offset="68%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id="sidebar-upgrade-gem-b" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="44%" stopColor="#A5F3FC" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
          <linearGradient id="sidebar-upgrade-gem-c" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#4C1D95" />
            <stop offset="52%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#F472B6" />
          </linearGradient>
        </defs>
        <path
          fill="url(#sidebar-upgrade-gem-a)"
          d="M28 6 46 22 28 58 10 22z"
        />
        <path fill="url(#sidebar-upgrade-gem-b)" d="M28 6 46 22 28 26z" opacity={0.95} />
        <path fill="#A78BFA" d="M28 6 10 22 28 26z" opacity={0.85} />
        <path fill="url(#sidebar-upgrade-gem-c)" d="M28 26 46 22 28 58z" opacity={0.92} />
        <path fill="#7C3AED" d="M28 26 10 22 28 58z" opacity={0.78} />
        <path
          stroke="#FEF3C7"
          strokeOpacity={0.8}
          strokeWidth={0.75}
          fill="none"
          d="M28 6v20M10 22h36M18 14h20"
        />
      </svg>
    </div>
  );
}

function SidebarUpgradePanel({ onNavigate }: { onNavigate: () => void }) {
  const t = useTranslations('dashboard.layout');
  return (
    <div className="relative isolate flex flex-col items-center overflow-hidden rounded-[22px] border border-fuchsia-200/70 bg-[radial-gradient(circle_at_24%_8%,rgba(251,191,36,0.38),transparent_32%),radial-gradient(circle_at_82%_22%,rgba(34,211,238,0.42),transparent_30%),linear-gradient(145deg,#FFF7ED_0%,#F5F3FF_44%,#ECFEFF_100%)] px-5 py-6 text-center shadow-[0_18px_45px_-28px_rgba(124,58,237,0.65),inset_0_1px_0_rgba(255,255,255,0.85)] dark:border-fuchsia-400/25 dark:bg-[radial-gradient(circle_at_24%_8%,rgba(251,191,36,0.18),transparent_34%),radial-gradient(circle_at_82%_22%,rgba(34,211,238,0.18),transparent_32%),linear-gradient(145deg,rgba(88,28,135,0.72),rgba(49,46,129,0.76),rgba(8,47,73,0.72))]">
      <span className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" aria-hidden />
      <span className="absolute -right-10 -top-10 size-24 rounded-full bg-cyan-300/30 blur-2xl" aria-hidden />
      <span className="absolute -bottom-12 -left-8 size-28 rounded-full bg-fuchsia-400/25 blur-2xl" aria-hidden />
      <span className="pointer-events-none absolute inset-0 rounded-[22px] ring-1 ring-inset ring-white/60 dark:ring-white/10" aria-hidden />
      <SidebarUpgradeIllustration />
      <h3 className="relative z-10 text-[15px] font-extrabold leading-tight tracking-[-0.03em] text-[#21163F] dark:text-violet-50">
        {t('upgradeTitle')}
      </h3>
      <p className="relative z-10 mt-2 max-w-[15rem] text-[13px] font-medium leading-snug text-[#5F5871] dark:text-violet-100/78">
        {t('upgradeBody')}
      </p>
      <Button
        asChild
        className="relative z-10 mt-6 h-12 w-full rounded-xl border-0 bg-[linear-gradient(135deg,#F97316_0%,#EC4899_42%,#7C3AED_74%,#06B6D4_100%)] text-sm font-extrabold text-white shadow-[0_14px_28px_-16px_rgba(124,58,237,0.95),inset_0_1px_0_rgba(255,255,255,0.45)] transition-[transform,box-shadow,filter] duration-150 hover:scale-[1.015] hover:brightness-110 hover:shadow-[0_18px_34px_-16px_rgba(236,72,153,0.85),inset_0_1px_0_rgba(255,255,255,0.55)] active:scale-[0.985] focus-visible:ring-fuchsia-300/80 dark:shadow-[0_16px_34px_-18px_rgba(34,211,238,0.75),inset_0_1px_0_rgba(255,255,255,0.35)]"
      >
        <NextLink href="/pricing" onClick={onNavigate}>
          {t('upgradeCta')}
        </NextLink>
      </Button>
    </div>
  );
}

type NavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
  beta?: boolean;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function useDashboardNavSections(): NavSection[] {
  const t = useTranslations('dashboard.layout');
  return useMemo(
    () => [
      {
        label: t('sectionLearn'),
        items: [
          { href: '/dashboard', icon: Home, label: t('navHome') },
          { href: '/dashboard/courses', icon: BookOpen, label: t('navCourses') },
          {
            href: '/dashboard/roadmap',
            icon: Map,
            label: t('navRoadmap'),
          },
          {
            href: '/dashboard/ai-coach',
            icon: Sparkles,
            label: t('navAiCoach'),
            beta: true,
          },
        ],
      },
      {
        label: t('sectionProgress'),
        items: [
          {
            href: '/dashboard/activity?view=quests',
            icon: Flag,
            label: t('navQuests'),
          },
          {
            href: '/dashboard/activity?view=achievements',
            icon: Trophy,
            label: t('navAchievements'),
          },
          {
            href: '/dashboard/activity',
            icon: Activity,
            label: t('navActivity'),
          },
        ],
      },
    ],
    [t]
  );
}

function useWorkspaceMenu(): NavItem[] {
  const t = useTranslations('dashboard.layout');
  return useMemo(
    () => [
      { href: '/dashboard/team', icon: Users, label: t('navTeam') },
      { href: '/dashboard/billing', icon: CreditCard, label: t('navBilling') },
      { href: '/dashboard/general', icon: UserCircle, label: t('navProfile') },
      { href: '/dashboard/settings', icon: Settings, label: t('navSettings') },
      { href: '/dashboard/security', icon: Shield, label: t('navSecurity') },
    ],
    [t]
  );
}

function computeNavActive(
  pathname: string,
  href: string,
  searchParams: Pick<URLSearchParams, 'get'> | null
): boolean {
  const [pathRaw, queryString] = href.split('?');
  const norm = (p: string) => p.replace(/\/+$/, '') || '/';
  const current = norm(pathname);
  const prefix = norm(pathRaw ?? '');

  if (prefix === '/dashboard') {
    return current === '/dashboard';
  }

  /* Courses index only — nested /courses/[slug] is Roadmap or lesson routes. */
  if (prefix === '/dashboard/courses') {
    return current === '/dashboard/courses';
  }

  if (prefix === '/dashboard/activity') {
    if (current !== '/dashboard/activity') return false;
    if (!searchParams) return false;
    const view = searchParams.get('view');
    if (queryString) {
      const target = new URLSearchParams(queryString).get('view');
      return target != null && view === target;
    }
    return view !== 'quests' && view !== 'achievements';
  }

  const glowRoadmapPath = norm(`/dashboard/courses/${GLOW_FLOW_COURSE_SLUG}`);
  if (prefix === norm('/dashboard/roadmap')) {
    return (
      current === norm('/dashboard/roadmap') ||
      current === glowRoadmapPath ||
      current.startsWith(`${glowRoadmapPath}/`)
    );
  }

  if (prefix === norm('/dashboard/ai-coach')) {
    const coachPath = norm('/dashboard/coach');
    return (
      current === norm('/dashboard/ai-coach') ||
      current === coachPath ||
      current.startsWith(`${coachPath}/`)
    );
  }

  return current === prefix || current.startsWith(`${prefix}/`);
}

function DashboardSidebarNavInner({
  pathname,
  searchParams,
  onNavigate,
}: {
  pathname: string;
  searchParams: Pick<URLSearchParams, 'get'> | null;
  onNavigate: () => void;
}) {
  const t = useTranslations('dashboard.layout');
  const navSections = useDashboardNavSections();
  const isNavActive = useMemo(
    () => (href: string) => computeNavActive(pathname, href, searchParams),
    [pathname, searchParams]
  );

  return (
    <nav className="scrollbar-lesson-sidebar min-h-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden px-3 py-3">
      {navSections.map((section) => (
        <div key={section.label}>
          <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {section.label}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = isNavActive(item.href);
              return (
                <li key={`${section.label}-${item.href}-${item.label}`}>
                  <NextLink
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      'group relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-semibold transition-all duration-150',
                      active
                        ? 'bg-[linear-gradient(135deg,hsl(var(--primary)/0.12),hsl(var(--sidebar-accent)))] text-sidebar-accent-foreground shadow-sm ring-1 ring-primary/10'
                        : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                    )}
                  >
                    {active ? (
                      <span
                        className="absolute right-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-l-full bg-primary"
                        aria-hidden
                      />
                    ) : null}
                    <span
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                        active
                          ? 'bg-white/80 text-primary shadow-sm'
                          : 'bg-muted/55 text-foreground/70 group-hover:text-foreground'
                      )}
                    >
                      <item.icon className="size-[15px]" />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.beta ? (
                      <Badge
                        variant="secondary"
                        className="shrink-0 border-0 bg-primary/10 px-1.5 py-0 text-[10px] font-semibold normal-case tracking-normal text-primary"
                      >
                        {t('beta')}
                      </Badge>
                    ) : null}
                  </NextLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <SidebarUpgradePanel onNavigate={onNavigate} />
    </nav>
  );
}

function DashboardSidebarNav({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (
    <DashboardSidebarNavInner pathname={pathname} searchParams={searchParams} onNavigate={onNavigate} />
  );
}

function DashboardSidebarNavFallback({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  return (
    <DashboardSidebarNavInner pathname={pathname} searchParams={null} onNavigate={onNavigate} />
  );
}

function subscribeNoop() {
  return () => {};
}

function SidebarProfile({ onNavigate }: { onNavigate?: () => void }) {
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const t = useTranslations('dashboard.layout');
  const workspaceMenu = useWorkspaceMenu();

  const { data: user } = useSWR<User>('/api/user', fetcher);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    mutate('/api/user');
    mutate('/api/team');
    router.push('/');
  }

  const displayName = user?.name?.trim() || user?.email || t('fallbackWorkspace');
  const initials =
    user?.name?.trim().charAt(0)?.toUpperCase() ||
    user?.email?.trim().charAt(0)?.toUpperCase() ||
    'FG';

  const triggerClassName =
    'flex w-full items-center gap-2.5 rounded-xl border border-border/60 bg-muted/30 px-2.5 py-2 text-left transition-colors hover:bg-muted/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50';

  const triggerInner = (
    <>
      <Avatar className="size-9 shrink-0 ring-2 ring-white">
        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold leading-tight text-foreground">{displayName}</p>
        <p className="truncate text-[11px] text-muted-foreground">{t('workspaceMenuHint')}</p>
      </div>
      <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    </>
  );

  /* Radix menus rely on useId(); SSR + streaming can diverge from the client pass and
     mismatch IDs on DropdownMenuTrigger. Mount the menu only after hydrate. */
  if (!mounted) {
    return (
      <button
        type="button"
        className={`${triggerClassName} pointer-events-none`}
        tabIndex={-1}
        aria-haspopup="menu"
        aria-expanded={false}
      >
        {triggerInner}
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={triggerClassName}>
          {triggerInner}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" className="w-[min(17.5rem,calc(100vw-2rem))]">
        <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {t('workspaceLabel')}
        </DropdownMenuLabel>
        {workspaceMenu.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <NextLink href={item.href} onClick={() => onNavigate?.()}>
              <item.icon className="size-4" />
              {item.label}
            </NextLink>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <form action={handleSignOut}>
          <button type="submit" className="w-full">
            <DropdownMenuItem variant="destructive" className="w-full cursor-pointer">
              <LogOut className="size-4" />
              {t('signOut')}
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const t = useTranslations('dashboard.layout');
  const pathname = usePathname();
  const immersiveLesson = isDashboardCourseLessonPath(pathname);

  return (
    <div
      className={cn(
        'flex h-dvh max-h-dvh w-full flex-col overflow-hidden text-foreground',
        immersiveLesson
          ? 'bg-[hsl(var(--lesson-canvas))]'
          : 'bg-muted/50'
      )}
    >
      {immersiveLesson ? <ImmersiveLessonTopBar /> : null}

      {!immersiveLesson ? (
        <div className="fixed left-4 top-4 z-50 lg:hidden">
          <Button
            className="size-11 rounded-2xl border border-white/70 bg-white/90 text-foreground shadow-card-soft backdrop-blur-md hover:bg-white"
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="size-6" />
            <span className="sr-only">{t('toggleSidebar')}</span>
          </Button>
        </div>
      ) : null}

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <aside
          className={cn(
            'absolute inset-y-0 left-0 z-40 flex h-full w-[272px] flex-col border-r border-sidebar-border bg-sidebar shadow-[14px_0_46px_-34px_hsl(var(--primary)/0.5)] transition-transform duration-300 ease-out lg:relative lg:translate-x-0 lg:shrink-0',
            immersiveLesson
              ? 'hidden'
              : isSidebarOpen
                ? 'flex translate-x-0'
                : 'hidden -translate-x-full lg:flex lg:translate-x-0'
          )}
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="shrink-0 border-b border-sidebar-border px-4 py-4">
              <div className="flex items-start justify-between gap-2">
                <NextLink
                  href="/dashboard"
                  className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl outline-none ring-sidebar-ring transition-opacity hover:opacity-90 focus-visible:ring-2"
                >
                  <FlowLogoMark size={40} className="size-10 shrink-0" />
                  <div className="min-w-0 flex flex-col leading-tight">
                    <span className="text-base font-semibold tracking-[-0.025em] text-sidebar-foreground">
                      Flow Guide
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {t('brandSubtitle')}
                    </span>
                  </div>
                </NextLink>
                <LanguageSwitcher />
              </div>
            </div>

            <Suspense
              fallback={
                <DashboardSidebarNavFallback onNavigate={() => setIsSidebarOpen(false)} />
              }
            >
              <DashboardSidebarNav onNavigate={() => setIsSidebarOpen(false)} />
            </Suspense>

            <div className="shrink-0 border-t border-sidebar-border p-3">
              <SidebarProfile onNavigate={() => setIsSidebarOpen(false)} />
            </div>
          </div>
        </aside>

        {isSidebarOpen && !immersiveLesson ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-stone-900/30 backdrop-blur-[1px] lg:hidden"
            aria-label={t('closeMenu')}
            onClick={() => setIsSidebarOpen(false)}
          />
        ) : null}

        <main
          className={cn(
            'scrollbar-themed min-h-0 flex-1 overflow-y-auto',
            immersiveLesson
              ? 'bg-transparent pt-14 lg:border-0'
              : 'bg-background lg:border-l lg:border-border'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
