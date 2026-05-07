'use client';

import Link from 'next/link';
import { FlowLogoMark } from '@/components/brand/flow-logo';
import { Suspense, useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, CreditCard, Home, LogOut, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/app/(login)/actions';
import { usePathname, useRouter } from 'next/navigation';
import { User } from '@/lib/db/schema';
import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    mutate('/api/user');
    mutate('/api/team');
    router.push('/');
  }

  if (!user) {
    return (
      <>
        <Link
          href="/legacy"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Course preview
        </Link>
        <Link
          href="/pricing"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Pricing
        </Link>
        <Link
          href="/sign-in"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Sign in
        </Link>
        <Button asChild className="rounded-full btn-gradient-primary shadow-card-soft">
          <Link href="/sign-up">Sign up</Link>
        </Button>
      </>
    );
  }

  const initials =
    user.name?.trim().charAt(0)?.toUpperCase() ||
    user.email?.trim().charAt(0)?.toUpperCase() ||
    '?';

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="size-9 cursor-pointer ring-2 ring-border shadow-sm">
          <AvatarImage alt={user.name || ''} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1">
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/dashboard/courses" className="flex w-full items-center">
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Courses</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/dashboard/billing" className="flex w-full items-center">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/dashboard" className="flex w-full items-center">
            <Home className="mr-2 h-4 w-4" />
            <span>Learning home</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/dashboard/team" className="flex w-full items-center">
            <Users className="mr-2 h-4 w-4" />
            <span>Team</span>
          </Link>
        </DropdownMenuItem>
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Header() {
  return (
    <header className="border-b border-border bg-card/85 backdrop-blur-md shadow-card-soft">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-90">
          <FlowLogoMark size={40} fetchPriority="high" className="size-10" />
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Flow Guide
            </span>
            <span className="text-[11px] font-medium tracking-wide text-muted-foreground">
              Learn. Build. Master.
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Suspense
            fallback={<div className="size-9 shrink-0 rounded-full bg-muted" />}
          >
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardRoute = pathname.startsWith('/dashboard');

  return (
    <section className="flex min-h-screen flex-col">
      {isDashboardRoute ? null : <Header />}
      {children}
    </section>
  );
}
