const uzMonths = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr',
];

export function money(value: number | null | undefined): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('uz-UZ').format(value);
}

export function shortMoney(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} mln`;
  if (Math.abs(value) >= 1_000) return `${Math.round(value / 1_000)} ming`;
  return String(value);
}

export function date(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.getDate()} ${uzMonths[d.getMonth()]} ${d.getFullYear()}`;
}

export function dateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const time = d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  return `${date(value)}, ${time}`;
}

export function toInputDate(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromInputDate(value: string): string {
  return new Date(value).toISOString();
}

export function monthLabel(month: string): string {
  const [year, m] = month.split('-');
  const index = Number(m) - 1;
  return uzMonths[index] ? `${uzMonths[index]} ${year}` : month;
}

export function initials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function relative(value: string): string {
  const diff = Date.now() - new Date(value).getTime();
  const days = Math.round(diff / 86_400_000);
  if (days === 0) return 'bugun';
  if (days === 1) return 'kecha';
  if (days > 0 && days < 30) return `${days} kun oldin`;
  if (days < 0 && days > -30) return `${Math.abs(days)} kundan keyin`;
  return date(value);
}
