import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function Field({ label, hint, error, required, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--ink-3)]">
        {label}
        {required ? <span className="text-critical"> *</span> : null}
      </span>
      {children}
      {hint && !error ? <span className="text-[12px] text-[var(--ink-3)]">{hint}</span> : null}
      {error ? (
        <motion.span
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[12px] text-critical"
        >
          {error}
        </motion.span>
      ) : null}
    </label>
  );
}
