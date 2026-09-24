import { motion } from 'framer-motion';
import { useState } from 'react';
import { money, shortMoney } from '../../lib/format';

export interface BarPoint {
  label: string;
  value: number;
}

export function RevenueBars({ data, caption }: { data: BarPoint[]; caption: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value), 1);
  const ticks = [max, max / 2, 0];

  return (
    <figure className="m-0">
      <div className="relative pl-12 pr-1">
        <div className="absolute left-0 top-0 bottom-6 w-11 flex flex-col justify-between text-right">
          {ticks.map((tick) => (
            <span key={tick} className="text-[11px] tnum text-[var(--ink-3)] leading-none">
              {tick === 0 ? '0' : shortMoney(tick)}
            </span>
          ))}
        </div>

        <div className="relative h-44">
          {ticks.map((tick, index) => (
            <span
              key={tick}
              style={{ top: `${(index / (ticks.length - 1)) * 100}%` }}
              className="absolute inset-x-0 h-px bg-[var(--grid)]"
            />
          ))}

          <div className="absolute inset-0 flex items-end gap-1.5">
            {data.map((point, index) => {
              const height = (point.value / max) * 100;
              const isHovered = hover === index;
              return (
                <div
                  key={point.label}
                  className="relative flex-1 h-full flex items-end"
                  onMouseEnter={() => setHover(index)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(index)}
                  onBlur={() => setHover(null)}
                  tabIndex={0}
                  aria-label={`${point.label}: ${money(point.value)} so'm`}
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(height, point.value > 0 ? 2 : 0)}%` }}
                    transition={{
                      duration: 0.7,
                      delay: 0.06 * index,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{
                      background: 'var(--chart-fill)',
                      opacity: hover == null || isHovered ? 1 : 0.45,
                    }}
                    className="mx-auto w-full max-w-[88px] rounded-t-[4px] transition-opacity duration-200"
                  />
                  {isHovered ? (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 whitespace-nowrap rounded-lg border border-[var(--hairline-strong)] bg-[var(--surface)] px-2.5 py-1.5 shadow-[var(--shadow-card)]"
                    >
                      <span className="block text-[11px] text-[var(--ink-3)]">{point.label}</span>
                      <span className="block text-[13px] font-medium tnum">
                        {money(point.value)} so'm
                      </span>
                    </motion.div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-1.5 pt-2">
          {data.map((point) => (
            <span
              key={point.label}
              className="flex-1 text-center text-[11px] text-[var(--ink-3)] truncate"
            >
              {point.label}
            </span>
          ))}
        </div>
      </div>
      <figcaption className="mt-3 px-1 text-[12px] text-[var(--ink-3)]">{caption}</figcaption>
    </figure>
  );
}
