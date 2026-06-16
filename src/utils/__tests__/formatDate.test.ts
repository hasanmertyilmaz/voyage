import { formatDate, formatRelativeDate, toISODate } from '@/utils/formatDate';

describe('formatDate', () => {
  it('formats an ISO date as a readable label', () => {
    expect(formatDate('2026-06-16')).toBe('Jun 16, 2026');
  });

  it('returns an empty string for invalid or missing input', () => {
    expect(formatDate('not-a-date')).toBe('');
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });
});

describe('formatRelativeDate', () => {
  // Local noon "today" so the day math is timezone-independent in CI.
  const now = new Date(2026, 5, 16, 12).getTime();

  it('labels the same day as Today', () => {
    expect(formatRelativeDate('2026-06-16', now)).toBe('Today');
  });

  it('labels the previous day as Yesterday', () => {
    expect(formatRelativeDate('2026-06-15', now)).toBe('Yesterday');
  });

  it('labels a few days ago in days', () => {
    expect(formatRelativeDate('2026-06-13', now)).toBe('3 days ago');
  });

  it('falls back to an absolute date beyond a week', () => {
    expect(formatRelativeDate('2026-06-01', now)).toBe('Jun 1, 2026');
  });
});

describe('toISODate', () => {
  it('extracts the YYYY-MM-DD portion', () => {
    expect(toISODate(new Date('2026-06-16T12:00:00Z'))).toBe('2026-06-16');
  });
});
