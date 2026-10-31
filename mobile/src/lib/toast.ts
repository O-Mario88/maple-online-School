/**
 * One app-wide toast: any screen calls toast('…') and the host in the root layout shows it
 * for a few seconds. A newer message replaces an older one and is not cut short by its timer.
 */

export const TOAST_MS = 2800;

let message: string | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export function toast(text: string): void {
  message = text;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    message = null;
    timer = null;
    emit();
  }, TOAST_MS);
  emit();
}

export function currentToast(): string | null {
  return message;
}

export function subscribeToast(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
