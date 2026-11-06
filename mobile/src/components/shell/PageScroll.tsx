import { usePathname } from 'expo-router';
import { type ComponentRef, createContext, type Ref, useContext } from 'react';
import { Platform, ScrollView, type ScrollViewProps, StyleSheet, View } from 'react-native';

import { SiteFooter } from '@/features/public/SiteFooter';
import { hasSiteFooter } from '@/lib/public-footer';

/** True inside a page's scroll, so a scroll within it doesn't add a second footer. */
const InPage = createContext(false);

type PageScrollProps = ScrollViewProps & { ref?: Ref<ComponentRef<typeof ScrollView>> };

/**
 * A page's main scroll. In a web browser it ends with the site footer; in the iOS and Android
 * apps it is a plain ScrollView. A scroll inside it, a sideways one, and full-screen rooms get
 * no footer.
 */
export function PageScroll({ children, contentContainerStyle, ...props }: PageScrollProps) {
  const nested = useContext(InPage);
  const path = usePathname();
  if (Platform.OS !== 'web' || nested || props.horizontal || !hasSiteFooter(path)) {
    return (
      <ScrollView {...props} contentContainerStyle={contentContainerStyle}>
        {children}
      </ScrollView>
    );
  }
  // The page's own content style moves onto an inner box, so the footer runs the full width beneath it.
  return (
    <InPage.Provider value>
      <ScrollView {...props} contentContainerStyle={styles.grow}>
        <View style={[styles.grow, contentContainerStyle]}>{children}</View>
        <SiteFooter />
      </ScrollView>
    </InPage.Provider>
  );
}

const styles = StyleSheet.create({
  grow: { flexGrow: 1 },
});
