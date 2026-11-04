/**
 * Visitors start free, without an account: they can look through the catalogues and
 * open anything free. Everything else, personal pages included, asks them to sign up,
 * which starts their free month of everything; payment comes after that month.
 */
import type { Resource } from './trial';

/** The catalogues a visitor can look through. */
const GUEST_BROWSE: readonly string[] = ['/learn/explore', '/learn/library', '/learn/past-papers'];

/** Browsing free is offered when the free resources have their content (drawn from design data until the API serves them). */
export function guestEnabled(designData: boolean): boolean {
  return designData;
}

/** Null when a visitor may open this page, or 'signup' when it needs an account. */
export function guestLock(path: string, resource: Resource | null): 'signup' | null {
  if (GUEST_BROWSE.includes(path)) return null;
  return resource?.free ? null : 'signup';
}

/** The line above a page's title: visitors are welcomed to Maple rather than greeted as the sample learner. */
export function guestGreeting(name: string, guest: boolean): string {
  return guest ? 'Welcome to Maple Online School' : `Hello, ${name}`;
}
