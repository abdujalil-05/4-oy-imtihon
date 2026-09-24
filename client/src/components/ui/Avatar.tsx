import { initials } from '../../lib/format';
import { cn } from '../../lib/cn';

export function Avatar({
  name,
  src,
  size = 36,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  return (
    <span
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      className={cn(
        'relative shrink-0 grid place-items-center rounded-full overflow-hidden',
        'bg-[var(--surface-3)] text-[var(--ink-2)] font-semibold ring-1 ring-[var(--hairline)]',
        className,
      )}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        initials(name)
      )}
    </span>
  );
}
