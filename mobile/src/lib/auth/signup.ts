/**
 * Form checks for sign-up and password reset. They mirror the Go API's
 * rules (api/internal/signup/policy.go) so people see problems before
 * submitting; the server still decides.
 */

const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128;
const COMMON = new Set([
  'password', 'password1', 'password123', '12345678', '123456789', '1234567890', 'qwerty123',
  'iloveyou', 'admin123', 'welcome1', 'letmein1', 'abc12345', 'uganda123', 'kampala123', 'maple123',
]);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Why a password won't do, or null if it's fine. */
export function passwordProblem(password: string, email: string): string | null {
  if (password.length < MIN_PASSWORD) return 'Use at least 8 characters.';
  if (password.length > MAX_PASSWORD) return 'Use at most 128 characters.';
  if (/^\d+$/.test(password)) return "Don't use only numbers.";
  if (COMMON.has(password.toLowerCase())) return 'That password is too common.';
  const local = email.toLowerCase().split('@')[0];
  if (local && password.toLowerCase().includes(local)) return "Don't use your email address in your password.";
  return null;
}

export interface SignUpForm {
  email: string;
  fullName: string;
  password: string;
  confirm: string;
}

/** The first thing to fix on the sign-up form, or null when it's ready. */
export function signUpProblem(form: SignUpForm): string | null {
  if (!form.fullName.trim()) return 'Enter your full name.';
  if (!EMAIL.test(form.email.trim())) return 'Enter a valid email address.';
  const password = passwordProblem(form.password, form.email.trim());
  if (password) return password;
  if (form.password !== form.confirm) return "The passwords don't match.";
  return null;
}
