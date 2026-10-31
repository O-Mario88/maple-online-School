const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ParsedEmails {
  valid: string[];
  invalid: string[];
}

/** Reads pasted addresses (one per line, or separated by commas or semicolons). */
export function parseEmails(text: string): ParsedEmails {
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const raw of text.split(/[\n,;]+/)) {
    const email = raw.trim().toLowerCase();
    if (!email) continue;
    if (!EMAIL.test(email)) {
      invalid.push(raw.trim());
    } else if (!valid.includes(email)) {
      valid.push(email);
    }
  }
  return { valid, invalid };
}
