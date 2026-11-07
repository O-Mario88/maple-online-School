/**
 * Mock data for designing screens the API doesn't serve yet.
 *
 * Two build switches turn it on:
 * - EXPO_PUBLIC_DESIGN_DATA=true: the real app (real sign-in, real API) with every
 *   designed page drawn from its sample data.
 * - EXPO_PUBLIC_MOCK_DATA=true: a design build. As above, and the API, sign-in and
 *   portal switching are faked too, so it runs without the Go backend.
 *
 * Expo inlines the variables at build time, and metro.config.js resolves `@/mock`
 * to an empty module unless one of them is 'true'. A deployment build sets neither,
 * so the fixtures in src/mock are never bundled and the screens that need them stay
 * hidden. `npm run check:no-mock` proves it.
 */
import type { MockData } from '@/mock';

export function mockEnabled(value: string | undefined): boolean {
  return value === 'true';
}

/** Whether designed pages get their sample data: with either switch. */
export function designDataEnabled(mock: string | undefined, design: string | undefined): boolean {
  return mockEnabled(mock) || mockEnabled(design);
}

/** The design build: the API and sign-in are faked as well. */
export const MOCK_DATA = mockEnabled(process.env.EXPO_PUBLIC_MOCK_DATA);

/** Designed pages, menus and frames are on (design build, or the real app with sample data). */
export const DESIGN_DATA = designDataEnabled(process.env.EXPO_PUBLIC_MOCK_DATA, process.env.EXPO_PUBLIC_DESIGN_DATA);

/** The fixtures for drawing the designed pages, or null in a deployment build. */
export function mockData(): MockData | null {
  if (process.env.EXPO_PUBLIC_MOCK_DATA !== 'true' && process.env.EXPO_PUBLIC_DESIGN_DATA !== 'true') return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@/mock').mock as MockData;
}

/** The fixtures for faking the API, sign-in and portal switching: design builds only. */
export function mockApi(): MockData | null {
  if (process.env.EXPO_PUBLIC_MOCK_DATA !== 'true') return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@/mock').mock as MockData;
}
