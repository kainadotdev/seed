import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full resize-none rounded-xl border-none bg-transparent text-base text-text outline-none placeholder:text-text-faint',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
