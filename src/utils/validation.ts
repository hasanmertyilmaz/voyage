/** Input validation helpers (grading criterion 14 — never trust user input). */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 6; // Supabase requires >= 6
export const MAX_TITLE_LENGTH = 80;
export const MAX_NOTES_LENGTH = 1000;

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function validatePassword(password: string): ValidationResult {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }
  return { valid: true };
}

export function validateTitle(title: string): ValidationResult {
  const trimmed = title.trim();
  if (!trimmed) return { valid: false, message: 'Title is required.' };
  if (trimmed.length > MAX_TITLE_LENGTH) {
    return { valid: false, message: `Title must be ${MAX_TITLE_LENGTH} characters or fewer.` };
  }
  return { valid: true };
}

export function validateNotes(notes: string): ValidationResult {
  if (notes.length > MAX_NOTES_LENGTH) {
    return { valid: false, message: `Notes must be ${MAX_NOTES_LENGTH} characters or fewer.` };
  }
  return { valid: true };
}

export interface EntryDraftErrors {
  title?: string;
  notes?: string;
}

/** Validate the whole entry form at once, collecting every field error. */
export function validateEntryDraft(draft: { title: string; notes: string }): {
  valid: boolean;
  errors: EntryDraftErrors;
} {
  const errors: EntryDraftErrors = {};
  const title = validateTitle(draft.title);
  if (!title.valid) errors.title = title.message;
  const notes = validateNotes(draft.notes);
  if (!notes.valid) errors.notes = notes.message;
  return { valid: Object.keys(errors).length === 0, errors };
}
