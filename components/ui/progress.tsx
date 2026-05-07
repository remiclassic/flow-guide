import * as React from 'react';

import { cn } from '@/lib/utils';

type ProgressProps = React.ComponentProps<'div'> & {
  value: number;
  max?: number;
  indicatorClassName?: string;
};

function Progress({
  className,
  value,
  max = 100,
  indicatorClassName,
  ...props
}: ProgressProps) {
  const bounded = Math.min(max, Math.max(0, value));
  const percent = max <= 0 ? 0 : Math.round((bounded / max) * 100);

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={bounded}
      data-slot="progress"
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-muted',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full rounded-full bg-gradient-to-r from-[hsl(262_83%_52%)] via-primary to-[hsl(270_75%_72%)] transition-[width] duration-500 ease-out',
          indicatorClassName
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export { Progress };
