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

/** Who is signing up, as the sign-up page's role cards name them. */
export type SignUpRole = 'learner' | 'parent' | 'teacher' | 'school';

/** The account role the API creates, or null for parents, who join by claiming their child. */
export function apiRole(role: SignUpRole): 'student' | 'teacher' | 'institution' | null {
  return role === 'learner' ? 'student' : role === 'teacher' ? 'teacher' : role === 'school' ? 'institution' : null;
}

/** Uganda's age of digital majority: younger learners need a parent or guardian to confirm the account. */
export const DIGITAL_MAJORITY = 18;
const OLDEST = 100;

export function needsGuardian(age: number): boolean {
  return age < DIGITAL_MAJORITY;
}

/** A date of birth typed as DD / MM / YYYY: the ISO date and age today, or why it won't do. */
export function parseDob(text: string, today: Date): { iso: string; age: number } | { problem: string } {
  const m = /^(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})$/.exec(text.trim());
  const bad = { problem: 'Enter a real date of birth as DD / MM / YYYY.' };
  if (!m) return bad;
  const [day, month, year] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return bad;
  if (d > today) return { problem: 'Your date of birth can’t be in the future.' };
  const birthdayPassed = today.getMonth() > d.getMonth() || (today.getMonth() === d.getMonth() && today.getDate() >= d.getDate());
  const age = today.getFullYear() - year - (birthdayPassed ? 0 : 1);
  if (age > OLDEST) return { problem: 'Check the year of your date of birth.' };
  const pad = (n: number) => String(n).padStart(2, '0');
  return { iso: `${year}-${pad(month)}-${pad(day)}`, age };
}

export interface NewAccountForm {
  role: SignUpRole;
  first: string;
  last: string;
  grade: string;
  dob: string;
  email: string;
  password: string;
}

/** The first thing to fix on the sign-up page, or null when it's ready. Learners also give a class and date of birth. */
export function newAccountProblem(f: NewAccountForm, today: Date): string | null {
  if (!f.first.trim()) return 'Enter your first name.';
  if (!f.last.trim()) return 'Enter your last name.';
  if (f.role === 'learner') {
    if (!f.grade) return 'Choose your class or grade.';
    const dob = parseDob(f.dob, today);
    if ('problem' in dob) return dob.problem;
  }
  return signUpProblem({ email: f.email, fullName: `${f.first.trim()} ${f.last.trim()}`, password: f.password, confirm: f.password });
}
