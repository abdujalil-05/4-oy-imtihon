import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export function Tabs({
  items,
  active,
  onChange,
  layoutId = 'tab-indicator',
}: {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
  layoutId?: string;
}) {
  return (
    <div className="no-scrollbar flex items-center gap-1 overflow-x-auto border-b border-[var(--hairline)] px-1">
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              'relative px-3 py-2.5 text-[13.5px] whitespace-nowrap transition-colors',
              isActive ? 'text-[var(--ink)] font-medium' : 'text-[var(--ink-3)] hover:text-[var(--ink-2)]',
            )}
          >
            <span className="inline-flex items-center gap-1.5">
              {item.label}
              {item.count != null ? (
                <span className="tnum text-[11.5px] px-1.5 h-[18px] grid place-items-center rounded bg-[var(--surface-3)] text-[var(--ink-3)]">
                  {item.count}
                </span>
              ) : null}
            </span>
            {isActive ? (
              <motion.span
                layoutId={layoutId}
                transition={{ type: 'spring', stiffness: 480, damping: 38 }}
                className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-[var(--accent)]"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
