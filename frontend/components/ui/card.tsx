import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-seed border border-border bg-card shadow-seed',
        className,
      )}
      {...props}
    />
  );
}
