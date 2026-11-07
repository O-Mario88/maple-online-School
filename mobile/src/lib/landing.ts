/**
 * Where a signed-out visitor who opens a signed-in address (such as /) lands.
 * On the web that's the public homepage, the site's front door, once it has its
 * content (it is drawn from design data until the API serves it; without that it
 * only says "Coming soon"). The phone apps open straight on sign-in, since nobody
 * installs the app to read the homepage.
 */
export function signedOutLanding(os: string, homepage: boolean): 'welcome' | 'sign-in' {
  return os === 'web' && homepage ? 'welcome' : 'sign-in';
}

type Status = 'restoring' | 'signedOut' | 'signedIn';

/**
 * Whether to open the dashboard: right after someone signs in (or signs up). Otherwise the app falls
 * back to its anchor page, which on the web is the public homepage. A session restored at start-up
 * stays on the address it was opened at.
 */
export function goesHomeOnSignIn(prev: Status | undefined, next: Status): boolean {
  return prev === 'signedOut' && next === 'signedIn';
}
