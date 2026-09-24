import { motion } from 'framer-motion';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'ref'> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-[var(--accent-fill)] text-[var(--accent-on-fill)] font-semibold hover:brightness-105 shadow-[0_6px_20px_-10px_var(--glow)]',
  outline:
    'border border-[var(--hairline-strong)] text-[var(--ink)] hover:bg-[var(--surface-2)]',
  ghost: 'text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]',
  danger: 'border border-critical/40 text-critical hover:bg-critical/10',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 gap-2 rounded-[10px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap transition-colors duration-150',
        'disabled:opacity-50 disabled:pointer-events-none select-none',
        sizes[size],
        variants[variant],
        className,
      )}
      {...(rest as Record<string, unknown>)}
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : icon}
      {children}
    </motion.button>
  );
}
