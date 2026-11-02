import { createContext, useContext } from 'react';

import { styles } from './ParentHomeViews.styles';

/** The parent home's style sheet: the desktop one by default, the phone one inside ParentHomePhone. */
export const ParentSheetContext = createContext(styles);

export function useParentSheet(): typeof styles {
  return useContext(ParentSheetContext);
}
