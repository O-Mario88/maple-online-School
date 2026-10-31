import * as SecureStore from 'expo-secure-store';

import type { TokenStore } from './session';

const KEY = 'maple.refresh';

/** Keeps the refresh token in the iOS Keychain / Android Keystore. */
export const tokenStore: TokenStore = {
  getRefreshToken: () => SecureStore.getItemAsync(KEY),
  setRefreshToken: async (token) => {
    if (token === null) {
      await SecureStore.deleteItemAsync(KEY);
    } else {
      await SecureStore.setItemAsync(KEY, token);
    }
  },
};
