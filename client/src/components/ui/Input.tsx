import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

const base =
  'w-full bg-[var(--surface-2)] border border-[var(--hairline)] rounded-[10px] px-3 h-10 ' +
  'placeholder:text-[var(--ink-3)] transition-[border-color,box-shadow] duration-200 ' +
  'focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--glow)]';

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(base, className)} {...rest} />;
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(base, 'h-auto py-2.5 min-h-20 resize-y', className)} {...rest} />;
}

export function Select({ className, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(base, 'appearance-none bg-no-repeat pr-9', className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%237a838d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M4 6l4 4 4-4'/></svg>\")",
        backgroundPosition: 'right 10px center',
      }}
      {...rest}
    />
  );
}
