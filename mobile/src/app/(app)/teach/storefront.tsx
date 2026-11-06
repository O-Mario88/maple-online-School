import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';

import { useShell } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { RefScale } from '@/features/public/home/RefScale';
import { CANVAS } from '@/features/teacher/frame/TeacherParts';
import {
  STOREFRONT_REF_WIDTH,
  StorefrontDesk,
  StorefrontPhone,
} from '@/features/teacher/storefront/StorefrontViews';
import { mockData } from '@/lib/mock';
import { PageScroll } from '@/components/shell/PageScroll';

/** Inventory 48 (and 5, the public view): Public @teacher Storefront & Growth Promotions Editor (`/(teacher)/storefront`). */
export default function StorefrontScreen() {
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  const { width } = useWindowDimensions();
  if (!mock) {
    return (
      <PreviewScreen title="Storefront" subtitle="Your public page, prices and promotions">
        {() => null}
      </PreviewScreen>
    );
  }
  const me = mock.teacher.teacherHome.me;
  const s = mock.teacher.storefrontEditor;
  if (!wide) return <StorefrontPhone sf={s} me={me} />;
  return (
    <PageScroll style={styles.bg}>
      <RefScale width={width} refWidth={STOREFRONT_REF_WIDTH}>
        <StorefrontDesk sf={s} me={me} />
      </RefScale>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: CANVAS },
});
