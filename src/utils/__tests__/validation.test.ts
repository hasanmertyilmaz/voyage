import {
  MIN_PASSWORD_LENGTH,
  isValidEmail,
  validateEntryDraft,
  validatePassword,
  validateTitle,
} from '@/utils/validation';

describe('isValidEmail', () => {
  it('accepts a well-formed address', () => {
    expect(isValidEmail('hasan@example.com')).toBe(true);
  });

  it('rejects malformed addresses', () => {
    expect(isValidEmail('nope')).toBe(false);
    expect(isValidEmail('a@b')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('rejects passwords shorter than the minimum', () => {
    const result = validatePassword('123');
    expect(result.valid).toBe(false);
    expect(result.message).toContain(String(MIN_PASSWORD_LENGTH));
  });

  it('accepts a long-enough password', () => {
    expect(validatePassword('secret1').valid).toBe(true);
  });
});

describe('validateTitle', () => {
  it('rejects an empty/whitespace title', () => {
    expect(validateTitle('   ').valid).toBe(false);
  });

  it('rejects an over-long title', () => {
    expect(validateTitle('x'.repeat(81)).valid).toBe(false);
  });

  it('accepts a normal title', () => {
    expect(validateTitle('Lisbon trip').valid).toBe(true);
  });
});

describe('validateEntryDraft', () => {
  it('collects an error for each invalid field', () => {
    const result = validateEntryDraft({ title: '', notes: 'x'.repeat(1001) });
    expect(result.valid).toBe(false);
    expect(result.errors.title).toBeDefined();
    expect(result.errors.notes).toBeDefined();
  });

  it('passes a valid draft', () => {
    expect(validateEntryDraft({ title: 'Paris', notes: 'Lovely city' }).valid).toBe(true);
  });
});
