import { useSyncExternalStore } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { currentToast, subscribeToast } from '@/lib/toast';

/** Shows the app-wide toast above everything; mounted once in the root layout. */
export function ToastHost() {
  const text = useSyncExternalStore(subscribeToast, currentToast, currentToast);
  if (!text) return null;
  return (
    <View style={styles.wrap} pointerEvents="none" accessibilityLiveRegion="polite">
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, bottom: 96, alignItems: 'center', zIndex: 1000 },
  text: { maxWidth: 520, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: 'rgba(11,20,36,0.92)', fontSize: 13, color: '#FFFFFF', textAlign: 'center', overflow: 'hidden' },
});
