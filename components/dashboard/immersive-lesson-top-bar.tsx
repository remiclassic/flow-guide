'use client';

import { useMemo, useSyncExternalStore } from 'react';
import NextLink from 'next/link';
import { useTranslations } from 'next-intl';
import { FlowLogoMark } from '@/components/brand/flow-logo';
import { LanguageSwitcher } from '@/components/i18n/language-switcher';
import { Button } from '@/components/ui/button';
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
import useSWR, { mutate } from 'swr';
import { useRouter } from '@/i18n/navigation';
import {
  Activity,
  BookOpen,
  ChevronDown,
  CreditCard,
  Flag,
  Home,
  LogOut,
  Map,
  Menu,
  Settings,
  Shield,
  Sparkles,
  Trophy,
  UserCircle,
  Users,
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function subscribeNoop() {
  return () => {};
}

export function ImmersiveLessonTopBar() {
  const t = useTranslations('dashboard.layout');
  const tLesson = useTranslations('dashboard.lessonViewer');
  const router = useRouter();
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const { data: user } = useSWR<User>('/api/user', fetcher);

  const navLearn = useMemo(
    () =>
      [
        { href: '/dashboard', icon: Home, label: t('navHome') },
        { href: '/dashboard/courses', icon: BookOpen, label: t('navCourses') },
        { href: '/dashboard/roadmap', icon: Map, label: t('navRoadmap') },
        { href: '/dashboard/ai-coach', icon: Sparkles, label: t('navAiCoach') },
      ] as const,
    [t]
  );

  const navProgress = useMemo(
    () =>
      [
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
        { href: '/dashboard/activity', icon: Activity, label: t('navActivity') },
      ] as const,
    [t]
  );

  const workspace = useMemo(
    () =>
      [
        { href: '/dashboard/team', icon: Users, label: t('navTeam') },
        { href: '/dashboard/billing', icon: CreditCard, label: t('navBilling') },
        { href: '/dashboard/general', icon: UserCircle, label: t('navProfile') },
        { href: '/dashboard/settings', icon: Settings, label: t('navSettings') },
        { href: '/dashboard/security', icon: Shield, label: t('navSecurity') },
      ] as const,
    [t]
  );

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

  return (
    <header className="fixed left-0 right-0 top-0 z-[60] flex h-14 items-center justify-between gap-3 border-b border-[hsl(var(--lesson-border)/0.35)] bg-[hsl(var(--lesson-canvas)/0.92)] px-4 backdrop-blur-md supports-[padding:max(0px)]:pt-[max(0.75rem,env(safe-area-inset-top))]">
      <NextLink
        href="/dashboard"
        className="flex min-w-0 items-center gap-2.5 rounded-xl py-1 pr-2 outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <FlowLogoMark size={36} className="size-9 shrink-0" />
        <div className="min-w-0 leading-tight">
          <span className="block truncate text-sm font-semibold tracking-tight text-foreground">
            Flow Guide
          </span>
          <span className="block truncate text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {tLesson('escapeHint')}
          </span>
        </div>
      </NextLink>

      <div className="flex shrink-0 items-center gap-2">
        <LanguageSwitcher />
        {!mounted ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full border-border/80"
            disabled
          >
            <Menu className="size-4" />
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full border-border/80 gap-1.5 px-3"
              >
                <Menu className="size-4" />
                <span className="hidden sm:inline">{tLesson('menu')}</span>
                <ChevronDown className="size-3.5 opacity-60" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="max-h-[min(70vh,520px)] w-[min(18rem,calc(100vw-2rem))] overflow-y-auto"
            >
              <DropdownMenuLabel className="flex items-center gap-2 font-normal">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0 truncate text-sm font-medium">{displayName}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {t('sectionLearn')}
              </p>
              {navLearn.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <NextLink href={item.href}>
                    <item.icon className="size-4" />
                    {item.label}
                  </NextLink>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {t('sectionProgress')}
              </p>
              {navProgress.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <NextLink href={item.href}>
                    <item.icon className="size-4" />
                    {item.label}
                  </NextLink>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {t('workspaceLabel')}
              </DropdownMenuLabel>
              {workspace.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <NextLink href={item.href}>
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
        )}
      </div>
    </header>
  );
}
