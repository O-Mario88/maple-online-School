import { APP_SCHEME } from '@/lib/appearance';

/** The scheme Maple draws in (light for now: see lib/appearance). */
export function useColorScheme(): typeof APP_SCHEME {
  return APP_SCHEME;
}
