import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Maple, TypeScale } from '@/constants/maple';
import { STORE_LINKS } from '@/lib/public-footer';
import { toast } from '@/lib/toast';

const STORES = [
  { key: 'playStore', small: 'GET IT ON', label: 'Get it on Google Play', name: 'Google Play', soon: 'The Maple app is coming to Google Play soon.' },
  { key: 'appStore', small: 'Download on the', label: 'Download on the App Store', name: 'App Store', soon: 'The Maple app is coming to the App Store soon.' },
] as const;

/** The Google Play mark: its triangle in the store's four colours. */
function PlayMark() {
  return (
    <Svg width={22} height={24} viewBox="0 0 22 24">
      <Path d="M1 1.2 12.4 12 1 22.8c-.4-.3-.6-.8-.6-1.4V2.6c0-.6.2-1.1.6-1.4z" fill={Maple.playBlue} />
      <Path d="M1 1.2c.5-.4 1.2-.4 1.9 0l13 7.2-3.5 3.6z" fill={Maple.playGreen} />
      <Path d="M15.9 8.4l4.1 2.3c1 .6 1 2 0 2.6l-4.1 2.3-3.5-3.6z" fill={Maple.playYellow} />
      <Path d="M12.4 12l3.5 3.6-13 7.2c-.7.4-1.4.4-1.9 0z" fill={Maple.playRed} />
    </Svg>
  );
}

/** The Apple mark. */
function AppleMark() {
  return (
    <Svg width={24} height={28} viewBox="3.4 1.8 17.4 20.8">
      <Path
        d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
        fill={Maple.white}
      />
    </Svg>
  );
}

/**
 * Get the app: the Google Play and App Store badges. Until a store link is set
 * (EXPO_PUBLIC_PLAY_STORE_URL, EXPO_PUBLIC_APP_STORE_URL), a badge says the app is coming.
 */
export function StoreButtons() {
  return (
    <View style={styles.row}>
      {STORES.map((s) => {
        const url = STORE_LINKS[s.key];
        return (
          <Pressable
            key={s.key}
            onPress={() => (url ? void Linking.openURL(url) : toast(s.soon))}
            style={({ hovered }: { hovered?: boolean }) => [styles.badge, hovered && styles.badgeHover]}
            accessibilityRole="link"
            accessibilityLabel={s.label}>
            {s.key === 'playStore' ? <PlayMark /> : <AppleMark />}
            <View>
              <Text style={[styles.small, s.key === 'playStore' && styles.smallCaps]}>{s.small}</Text>
              <Text style={styles.name}>{s.name}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    height: 44,
    minWidth: 136,
    paddingHorizontal: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Maple.storeLine,
    backgroundColor: Maple.storeGround,
  },
  badgeHover: { borderColor: Maple.white },
  small: { ...TypeScale.meta, fontSize: 10, lineHeight: 12, color: Maple.white },
  smallCaps: { fontWeight: '600', letterSpacing: 0.4 },
  name: { ...TypeScale.cardTitle, fontSize: 17, lineHeight: 20, color: Maple.white, letterSpacing: -0.2 },
});
