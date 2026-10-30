import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

const noSubscription = () => () => {};

/**
 * To support static rendering, the server always renders light; the client
 * switches to the device scheme once it has hydrated.
 */
export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
  const colorScheme = useRNColorScheme();
  return hasHydrated ? colorScheme : 'light';
}
