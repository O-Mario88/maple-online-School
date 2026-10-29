import type { TokenStore } from './session';

const KEY = 'maple.refresh';

/**
 * Web has no secure keystore. The refresh token lives in sessionStorage so it
 * is gone when the tab closes; the access token only ever lives in memory.
 */
export const tokenStore: TokenStore = {
  getRefreshToken: async () => {
    try {
      return window.sessionStorage.getItem(KEY);
    } catch {
      return null;
    }
  },
  setRefreshToken: async (token) => {
    try {
      if (token === null) {
        window.sessionStorage.removeItem(KEY);
      } else {
        window.sessionStorage.setItem(KEY, token);
      }
    } catch {
      // Storage blocked (private mode): the session lasts until reload.
    }
  },
};
