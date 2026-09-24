export function Skeleton({ h = 14, w = '100%' }: { h?: number; w?: number | string }) {
  return <span className="skeleton block" style={{ height: h, width: w }} />;
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="flex flex-col gap-px bg-[var(--hairline)]">
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="grid gap-4 bg-[var(--surface)] px-4 py-3.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
          {Array.from({ length: cols }).map((__, col) => (
            <Skeleton key={col} w={col === 0 ? '70%' : '45%'} />
          ))}
        </div>
      ))}
    </div>
  );
}
