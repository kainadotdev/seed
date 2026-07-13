import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-br from-seed-green-2 to-seed-green text-white shadow-[0_4px_14px_var(--green-glow)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_var(--green-glow)]',
        ghost: 'bg-transparent text-text border border-border hover:bg-bg-2',
        icon: 'bg-transparent border border-border text-text-dim hover:bg-bg-2 hover:text-text w-9 h-9 p-0 rounded-lg',
      },
      size: {
        default: 'h-10 px-5',
        lg: 'h-12 px-6 text-base',
        sm: 'h-8 px-3 text-xs',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = 'Button';
