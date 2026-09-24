import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Tone = 'neutral' | 'good' | 'warning' | 'critical' | 'accent' | 'info';

const tones: Record<Tone, string> = {
  neutral: 'text-[var(--ink-2)] bg-[var(--surface-3)]',
  good: 'text-good bg-good/12',
  warning: 'text-warning bg-warning/14',
  critical: 'text-critical bg-critical/12',
  accent: 'text-[var(--accent)] bg-[var(--glow)]',
  info: 'text-serious bg-serious/14',
};

export function Badge({
  tone = 'neutral',
  icon,
  children,
  className,
}: {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 h-6 px-2 rounded-md text-[12px] font-medium whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
