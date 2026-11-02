import createClient from 'openapi-fetch';

import { SessionManager } from '@/lib/auth/session';
import { tokenStore } from '@/lib/auth/token-store';
import { mockData } from '@/lib/mock';

import type { components, paths } from './schema';

/** The Go API. Override per build with EXPO_PUBLIC_API_URL. */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

export type Me = components['schemas']['Me'];

type SignedOutListener = () => void;
const signedOutListeners = new Set<SignedOutListener>();

/** Lets the UI react when the server ends the session (for example, a revoked token). */
export function onSignedOut(listener: SignedOutListener): () => void {
  signedOutListeners.add(listener);
  return () => signedOutListeners.delete(listener);
}

const clientFetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const mock = mockData();
  if (mock) return mock.shared.mockApiFetch(input, init);
  return fetch(input, init);
};

export const session = new SessionManager({
  baseUrl: API_URL,
  store: tokenStore,
  fetchFn: clientFetch,
  onSignedOut: () => signedOutListeners.forEach((listener) => listener()),
});

/** Typed client generated from openapi/maple.yaml. Every request is authenticated. */
export const api = createClient<paths>({
  baseUrl: API_URL,
  fetch: (request: Request) => session.fetch(request),
});
