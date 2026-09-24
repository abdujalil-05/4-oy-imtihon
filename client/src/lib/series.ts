const short = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'];

export interface SeriesPoint {
  label: string;
  value: number;
}

export function monthlySeries<T>(
  rows: T[],
  getDate: (row: T) => string,
  getValue: (row: T) => number,
  months = 6,
): SeriesPoint[] {
  const now = new Date();
  const buckets: SeriesPoint[] = [];
  const index = new Map<string, number>();

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const cursor = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}`;
    index.set(key, buckets.length);
    buckets.push({ label: short[cursor.getMonth()], value: 0 });
  }

  rows.forEach((row) => {
    const parsed = new Date(getDate(row));
    if (Number.isNaN(parsed.getTime())) return;
    const key = `${parsed.getFullYear()}-${parsed.getMonth()}`;
    const slot = index.get(key);
    if (slot != null) buckets[slot].value += getValue(row);
  });

  return buckets;
}
