import { createContext, useContext } from 'react';

/** Opens the role and school switcher sheet; present only inside the signed-in app shell. */
export interface Switcher {
  open: () => void;
  /** The current mode's title, for the header button. */
  label: string;
}

export const SwitcherContext = createContext<Switcher | null>(null);

export function useSwitcher(): Switcher | null {
  return useContext(SwitcherContext);
}
