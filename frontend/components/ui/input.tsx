import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-xl border border-border bg-bg-2 px-3.5 py-3 text-sm text-text outline-none transition-all placeholder:text-text-faint focus:border-seed-green-2 focus:ring-4 focus:ring-[var(--green-glow)]',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
