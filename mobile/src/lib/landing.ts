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
