import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

const QUERY = '(display-mode: standalone)';

const standalone = (): boolean => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  const ios = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return ios || (typeof window.matchMedia === 'function' && window.matchMedia(QUERY).matches);
};

/** True when the web app runs installed (its own window), not in a browser tab. Always false in the native app. */
export function useInstalled(): boolean {
  const [installed, setInstalled] = useState(standalone);
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(QUERY);
    const on = () => setInstalled(standalone());
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return installed;
}
