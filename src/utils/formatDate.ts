const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function parseDate(iso: string): Date {
  if (DATE_ONLY.test(iso)) {
    const [year, month, day] = iso.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(iso);
}

export function formatDate(iso: string | null | undefined, locale = 'en-US'): string {
  if (!iso) return '';
  const date = parseDate(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatRelativeDate(
  iso: string | null | undefined,
  now: number = Date.now(),
): string {
  if (!iso) return '';
  const date = parseDate(iso);
  if (Number.isNaN(date.getTime())) return '';

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfDate = new Date(date);
  startOfDate.setHours(0, 0, 0, 0);

  const diffDays = Math.round((startOfToday.getTime() - startOfDate.getTime()) / DAY_MS);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
  if (diffDays === -1) return 'Tomorrow';
  return formatDate(iso);
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayISODate(now: number = Date.now()): string {
  return toISODate(new Date(now));
}
