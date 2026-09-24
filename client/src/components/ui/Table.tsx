import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface Column<T> {
  key: string;
  label: string;
  align?: 'left' | 'right';
  width?: string;
  hideOnMobile?: boolean;
  render: (row: T) => ReactNode;
}

interface TableProps<T> {
  columns: Array<Column<T>>;
  rows: T[];
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
}

export function Table<T>({ columns, rows, rowKey, onRowClick }: TableProps<T>) {
  return (
    <div className="no-scrollbar overflow-x-auto">
      <table className="w-full border-collapse text-[13.5px]">
        <thead>
          <tr className="border-b border-[var(--hairline)]">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={cn(
                  'px-4 py-2.5 font-medium text-[11.5px] uppercase tracking-[0.07em] text-[var(--ink-3)]',
                  col.align === 'right' ? 'text-right' : 'text-left',
                  col.hideOnMobile && 'hidden md:table-cell',
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {rows.map((row, index) => (
              <motion.tr
                key={rowKey(row)}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, delay: Math.min(index * 0.022, 0.25), ease: [0.22, 1, 0.36, 1] }}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'border-b border-[var(--hairline)] last:border-0 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-[var(--surface-2)]',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-3 align-middle',
                      col.align === 'right' ? 'text-right tnum' : 'text-left',
                      col.hideOnMobile && 'hidden md:table-cell',
                    )}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
