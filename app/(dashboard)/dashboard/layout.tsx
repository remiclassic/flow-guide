'use client';

import { FlowLogoMark } from '@/components/brand/flow-logo';
import { Suspense, useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
import { signOut } from '@/app/(login)/actions';
import { User } from '@/lib/db/schema';
import { cn } from '@/lib/utils';
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
  const sparkle = 'absolute text-violet-500 [&>svg]:fill-violet-400/35';
  return (
    <div
      className="relative mx-auto mb-1 flex h-[4.75rem] w-[6.5rem] shrink-0 items-center justify-center"
      aria-hidden
    >
      <span className={`${sparkle} left-0 top-3`}>
        <Sparkle className="size-3.5" strokeWidth={2} />
      </span>
      <span className={`${sparkle} left-2 top-0`}>
        <Sparkle className="size-2.5" strokeWidth={2} />
      </span>
      <span className={`${sparkle} bottom-5 left-0.5`}>
        <Sparkle className="size-2" strokeWidth={2} />
      </span>
      <span className={`${sparkle} right-0 top-4`}>
        <Sparkle className="size-3" strokeWidth={2} />
      </span>
      <span className={`${sparkle} right-1 top-0`}>
        <Sparkle className="size-2.5" strokeWidth={2} />
      </span>
      <span className={`${sparkle} bottom-6 right-0`}>
        <Sparkle className="size-2" strokeWidth={2} />
      </span>
      <svg
        viewBox="0 0 56 64"
        className="relative z-10 h-[3.25rem] w-[3.25rem] drop-shadow-[0_2px_8px_rgba(124,58,237,0.25)]"
      >
        <defs>
          <linearGradient id="sidebar-upgrade-gem-a" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C4B5FD" />
            <stop offset="45%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#5B21B6" />
          </linearGradient>
          <linearGradient id="sidebar-upgrade-gem-b" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#DDD6FE" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <linearGradient id="sidebar-upgrade-gem-c" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#4C1D95" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>
        </defs>
        <path
          fill="url(#sidebar-upgrade-gem-a)"
          d="M28 6 46 22 28 58 10 22z"
        />
        <path fill="url(#sidebar-upgrade-gem-b)" d="M28 6 46 22 28 26z" opacity={0.95} />
        <path fill="#A78BFA" d="M28 6 10 22 28 26z" opacity={0.85} />
        <path fill="url(#sidebar-upgrade-gem-c)" d="M28 26 46 22 28 58z" opacity={0.92} />
        <path fill="#7C3AED" d="M28 26 10 22 28 58z" opacity={0.88} />
        <path
          stroke="#EDE9FE"
          strokeOpacity={0.55}
          strokeWidth={0.75}
          fill="none"
          d="M28 6v20M10 22h36M18 14h20"
        />
      </svg>
    </div>
  );
}

function SidebarUpgradePanel({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-[18px] border border-violet-200/70 bg-[#F9F7FF] px-5 py-6 text-center dark:border-violet-500/25 dark:bg-violet-950/35">
      <SidebarUpgradeIllustration />
      <h3 className="text-[15px] font-bold leading-tight tracking-[-0.02em] text-[#1F2937] dark:text-violet-50">
        Unlock Everything
      </h3>
      <p className="mt-2 max-w-[15rem] text-[13px] leading-snug text-[#6B7280] dark:text-violet-200/75">
        Go premium to access all courses, quests and exclusive features.
      </p>
      <Button
        asChild
        className="mt-6 h-12 w-full rounded-xl border-0 bg-[#7C3AED] text-sm font-semibold text-white shadow-none hover:bg-[#6D28D9] focus-visible:ring-violet-400/80 dark:bg-violet-600 dark:hover:bg-violet-500"
      >
        <Link href="/pricing" onClick={onNavigate}>
          Upgrade Now
        </Link>
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

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Learn',
    items: [
      { href: '/dashboard', icon: Home, label: 'Home' },
      { href: '/dashboard/courses', icon: BookOpen, label: 'Courses' },
      { href: '/dashboard/courses/glow-flow-method', icon: Map, label: 'Roadmap' },
      { href: '/dashboard/coach', icon: Sparkles, label: 'AI Coach', beta: true },
    ],
  },
  {
    label: 'Progress',
    items: [
      { href: '/dashboard/activity?view=quests', icon: Flag, label: 'Quests' },
      {
        href: '/dashboard/activity?view=achievements',
        icon: Trophy,
        label: 'Achievements',
      },
      { href: '/dashboard/activity', icon: Activity, label: 'Activity' },
    ],
  },
];

/** Account & workspace links live in the profile menu to keep the rail focused on learning. */
const WORKSPACE_MENU: NavItem[] = [
  { href: '/dashboard/team', icon: Users, label: 'Team' },
  { href: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
  { href: '/dashboard/general', icon: UserCircle, label: 'Profile' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  { href: '/dashboard/security', icon: Shield, label: 'Security' },
];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
  const isNavActive = useMemo(
    () => (href: string) => computeNavActive(pathname, href, searchParams),
    [pathname, searchParams]
  );

  return (
    <nav className="min-h-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden px-3 py-3">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label}>
          <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {section.label}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = isNavActive(item.href);
              return (
                <li key={`${section.label}-${item.href}-${item.label}`}>
                  <Link
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
                        Beta
                      </Badge>
                    ) : null}
                  </Link>
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

  const { data: user } = useSWR<User>('/api/user', fetcher);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    mutate('/api/user');
    mutate('/api/team');
    router.push('/');
  }

  const displayName = user?.name?.trim() || user?.email || 'Learning workspace';
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
        <p className="truncate text-[11px] text-muted-foreground">Workspace menu</p>
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
          Workspace
        </DropdownMenuLabel>
        {WORKSPACE_MENU.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link href={item.href} onClick={() => onNavigate?.()}>
              <item.icon className="size-4" />
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <form action={handleSignOut}>
          <button type="submit" className="w-full">
            <DropdownMenuItem variant="destructive" className="w-full cursor-pointer">
              <LogOut className="size-4" />
              Sign out
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

  return (
    <div className="flex h-dvh max-h-dvh w-full flex-col overflow-hidden bg-muted/50 text-foreground">
      <div className="fixed left-4 top-4 z-50 lg:hidden">
        <Button
          className="size-11 rounded-2xl border border-white/70 bg-white/90 text-foreground shadow-card-soft backdrop-blur-md hover:bg-white"
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="size-6" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <aside
          className={cn(
            'absolute inset-y-0 left-0 z-40 flex h-full w-[272px] flex-col border-r border-sidebar-border bg-sidebar shadow-[14px_0_46px_-34px_hsl(var(--primary)/0.5)] transition-transform duration-300 ease-out lg:relative lg:translate-x-0 lg:shrink-0',
            isSidebarOpen
              ? 'flex translate-x-0'
              : 'hidden -translate-x-full lg:flex lg:translate-x-0'
          )}
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="shrink-0 border-b border-sidebar-border px-4 py-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 rounded-xl outline-none ring-sidebar-ring transition-opacity hover:opacity-90 focus-visible:ring-2"
              >
                <FlowLogoMark size={40} className="size-10 shrink-0" />
                <div className="min-w-0 flex flex-col leading-tight">
                  <span className="text-base font-semibold tracking-[-0.025em] text-sidebar-foreground">
                    Flow Guide
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Learn · Build · Master
                  </span>
                </div>
              </Link>
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

        {isSidebarOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-stone-900/30 backdrop-blur-[1px] lg:hidden"
            aria-label="Close menu"
            onClick={() => setIsSidebarOpen(false)}
          />
        ) : null}

        <main className="min-h-0 flex-1 overflow-y-auto bg-background lg:border-l lg:border-border">
          {children}
        </main>
      </div>
    </div>
  );
}
