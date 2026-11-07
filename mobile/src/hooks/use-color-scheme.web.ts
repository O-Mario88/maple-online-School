import { APP_SCHEME } from '@/lib/appearance';

/**
 * The scheme Maple draws in (light for now: see lib/appearance). The server and the browser
 * draw the same scheme, so the page never switches colours after it loads.
 */
export function useColorScheme(): typeof APP_SCHEME {
  return APP_SCHEME;
}
