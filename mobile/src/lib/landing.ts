/**
 * Where a signed-out visitor who opens a signed-in address (such as /) lands.
 * On the web that's the public homepage, the site's front door; the phone apps
 * open straight on sign-in, since nobody installs the app to read the homepage.
 */
export function signedOutLanding(os: string): 'welcome' | 'sign-in' {
  return os === 'web' ? 'welcome' : 'sign-in';
}
