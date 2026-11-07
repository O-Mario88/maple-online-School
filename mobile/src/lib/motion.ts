/**
 * Reduced motion: follows the device's "reduce motion" setting (iOS and Android accessibility
 * settings; `prefers-reduced-motion` on the web, which React Native Web maps to the same API).
 *
 * Components read it with `useReducedMotion()`; event handlers that scroll read
 * `prefersReducedMotion()` and jump instead of gliding. Until the device answers, motion is allowed.
 */
import { useSyncExternalStore } from 'react';
import { AccessibilityInfo } from 'react-native';

export interface MotionSource {
  isReduceMotionEnabled(): Promise<boolean>;
  addEventListener(event: 'reduceMotionChanged', listener: (on: boolean) => void): { remove(): void };
}

export interface MotionStore {
  get(): boolean;
  subscribe(listener: () => void): () => void;
}

/** A store over one device setting. It reads the device the first time anyone asks. */
export function createMotionStore(source: MotionSource): MotionStore {
  let reduced = false;
  let started = false;
  const listeners = new Set<() => void>();

  const set = (on: boolean) => {
    if (on === reduced) return;
    reduced = on;
    listeners.forEach((listener) => listener());
  };

  const start = () => {
    if (started) return;
    started = true;
    source.addEventListener('reduceMotionChanged', set);
    source.isReduceMotionEnabled().then(set, (error: unknown) => {
      // The platform can't report it: keep motion on, which is how the app behaved before.
      if (__DEV__) console.warn('Could not read the reduce-motion setting', error);
    });
  };

  return {
    get() {
      start();
      return reduced;
    },
    subscribe(listener) {
      start();
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

const deviceMotion = createMotionStore(AccessibilityInfo);

/** True when the person asked their device for less motion. For event handlers. */
export function prefersReducedMotion(): boolean {
  return deviceMotion.get();
}

/** True when the person asked their device for less motion; re-renders when they change it. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(deviceMotion.subscribe, deviceMotion.get, () => false);
}
