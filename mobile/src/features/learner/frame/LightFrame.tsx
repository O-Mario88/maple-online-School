import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { PageScroll } from '@/components/shell/PageScroll';

import { useContentWidth } from '@/components/ui';
import { RefScale } from '@/features/public/home/RefScale';
import { Maple } from '@/constants/maple';

/** The light learner pages' references are 1536px wide, sidebar included. */
export const LIGHT_REF_WIDTH = 1536;
/** The references' sidebar, now drawn once by the app shell. */
const REF_SIDE = 186;
/** The main column's width in the references. */
export const LIGHT_MAIN_WIDTH = LIGHT_REF_WIDTH - REF_SIDE;

export const L = {
  navy: Maple.navyDeep,
  ink: Maple.navy,
  body: Maple.body,
  muted: Maple.secondary,
  blue: Maple.blue,
  line: Maple.blueSelected,
  canvas: Maple.blueSoft,
  white: Maple.surface,
  green: Maple.successText,
  soft: Maple.blueSoft,
} as const;

/**
 * The light learner page: the reference's main column, scaled to the room beside the app's one
 * header and sidebar (the app shell draws those; this frame no longer does).
 */
export function LightFrame({ children }: { children: ReactNode }) {
  const width = useContentWidth();
  return (
    <PageScroll style={s.root}>
      <RefScale width={width} refWidth={LIGHT_MAIN_WIDTH}>
        <View style={s.main}>{children}</View>
      </RefScale>
    </PageScroll>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: L.canvas },
  main: { width: LIGHT_MAIN_WIDTH, minHeight: 954, paddingLeft: 20, paddingRight: 16, paddingTop: 20, paddingBottom: 24, backgroundColor: L.canvas },
});
