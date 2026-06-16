const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parse an ISO value, treating a bare `YYYY-MM-DD` as a *local* calendar date.
 * (Plain `new Date('2026-06-16')` is UTC midnight, which renders as the previous
 * day in negative timezones — this avoids that off-by-one.)
 */
function parseDate(iso: string): Date {
  if (DATE_ONLY.test(iso)) {
    const [year, month, day] = iso.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(iso);
}

/**
 * Format an ISO date/timestamp as e.g. "Jun 16, 2026".
 * Returns an empty string for missing or invalid input so the UI never shows
 * "Invalid Date".
 */
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

/**
 * Human-friendly relative label ("Today", "Yesterday", "3 days ago") falling
 * back to an absolute date beyond a week. `now` is injectable so the behaviour
 * is deterministic in tests.
 */
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

/** ISO date portion (YYYY-MM-DD) of a Date. */
export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Today's date as YYYY-MM-DD. `now` injectable for tests. */
export function todayISODate(now: number = Date.now()): string {
  return toISODate(new Date(now));
}
