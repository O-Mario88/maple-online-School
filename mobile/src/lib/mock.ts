/**
 * Mock data for designing screens the API doesn't serve yet.
 *
 * Turn it on for a design build with EXPO_PUBLIC_MOCK_DATA=true. Expo inlines
 * the variable at build time, so in a deployment build (variable unset) the
 * `require` below sits in dead code: the fixtures in src/mock are never
 * bundled, and the screens and menu items that need them stay hidden.
 */
import type { MockData } from '@/mock';

export function mockEnabled(value: string | undefined): boolean {
  return value === 'true';
}

export const MOCK_DATA = mockEnabled(process.env.EXPO_PUBLIC_MOCK_DATA);

/** The fixtures, or null in a build without mock data. */
export function mockData(): MockData | null {
  if (process.env.EXPO_PUBLIC_MOCK_DATA !== 'true') return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@/mock').mock as MockData;
}
