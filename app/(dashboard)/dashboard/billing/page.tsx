import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { customerPortalAction } from '@/lib/payments/actions';
import { getTeamForUser, getUser } from '@/lib/db/queries';

export default async function BillingPage() {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  const team = await getTeamForUser();

  const statusLabel =
    team?.subscriptionStatus === 'active'
      ? 'Active subscription'
      : team?.subscriptionStatus === 'trialing'
        ? 'Trial active'
        : 'No active subscription';

  return (
    <section className="flex-1 space-y-6 p-4 lg:p-8">
      <div>
        <h1 className="text-lg font-medium lg:text-2xl">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage Stripe invoices, payment methods, and plan changes.
        </p>
      </div>

      <Card className="border-zinc-200">
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>{statusLabel}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-zinc-900">
              Plan: {team?.planName ?? 'Free'}
            </p>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Status code: {team?.subscriptionStatus ?? 'none'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <form action={customerPortalAction}>
              <Button type="submit" variant="outline" className="rounded-full">
                Customer portal
              </Button>
            </form>
            <Button asChild variant="ghost" className="rounded-full">
              <Link href="/pricing">Compare plans</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
