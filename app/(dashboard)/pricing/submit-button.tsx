'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

export function SubmitButton({
  disabled: disabledProp,
  featured,
}: {
  disabled?: boolean;
  featured?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending || disabledProp}
      className={`h-12 w-full rounded-full text-base font-semibold shadow-card-soft transition-opacity ${
        featured
          ? 'border-0 btn-gradient-primary hover:opacity-[0.92]'
          : 'border border-stone-300/90 bg-white text-stone-900 shadow-sm hover:bg-stone-50'
      }`}
      variant={featured ? 'default' : 'outline'}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          Start free trial
          <ArrowRight className="ml-2 size-4" />
        </>
      )}
    </Button>
  );
}
