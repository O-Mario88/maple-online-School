import { Image } from 'expo-image';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Brand } from '@/features/public/palette';

const LEAF = require('@/assets/images/maple-leaf.png') as number;
/** The light blue page behind the sign-in, onboarding and consent references. */
export const AUTH_SKY = '#E6EFFA';

function Logo({ small = false }: { small?: boolean }) {
  return (
    <Pressable style={styles.logo} onPress={() => router.push('/welcome')} accessibilityRole="link" accessibilityLabel="Maple home">
      <Image source={LEAF} style={small ? styles.leafSmall : styles.leaf} contentFit="contain" />
      <View>
        <Text style={[styles.name, small && styles.nameSmall]}>Maple</Text>
        <Text style={[styles.tag, small && styles.tagSmall]}>Global Online School</Text>
      </View>
    </Pressable>
  );
}

function Language({ small = false }: { small?: boolean }) {
  return (
    <Pressable style={styles.action} accessibilityRole="button" accessibilityLabel="Language: English">
      <Icon name="globe" size={small ? 19 : 21} color={Brand.ink} />
      <Text style={[styles.actionText, small && styles.actionTextSmall]}>English</Text>
      <Icon name="chevronDown" size={14} color={Brand.ink} />
    </Pressable>
  );
}

/** Desktop: the white bar with the logo, language and Help, or `trailing` in Help's place (sizes are the references' pixels). */
export function AuthTopBar({ width, trailing }: { width: number; trailing?: ReactNode }) {
  return (
    <View style={[styles.bar, { width }]}>
      <Logo />
      <View style={styles.actions}>
        <Language />
        {trailing ?? (
          <Pressable style={styles.action} onPress={() => router.push('/help')} accessibilityRole="link">
            <Icon name="help" size={21} color={Brand.ink} />
            <Text style={styles.actionText}>Help</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

/** Phones: the logo and the language picker. */
export function AuthPhoneTop() {
  return (
    <View style={styles.phoneTop}>
      <Logo small />
      <Language small />
    </View>
  );
}

/**
 * Draws a reference-sized layout (refWidth × refHeight) scaled to fit the
 * window both ways and centred, so the whole screen shows without scrolling.
 */
export function FitScale({ refWidth, refHeight, children }: { refWidth: number; refHeight: number; children: ReactNode }) {
  const { width, height } = useWindowDimensions();
  const scale = Math.min(width / refWidth, height / refHeight);
  return (
    <View style={styles.fitOuter}>
      <View style={{ width: refWidth * scale, height: refHeight * scale }}>
        <View style={[styles.fitInner, { width: refWidth, height: refHeight, transform: [{ scale }] }]}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { height: 67, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 46, paddingRight: 34, borderTopLeftRadius: 14, borderTopRightRadius: 14, backgroundColor: Brand.surface },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  leaf: { width: 44, height: 44 },
  leafSmall: { width: 34, height: 34 },
  name: { fontSize: 23, lineHeight: 26, fontWeight: '700', color: Brand.ink, letterSpacing: -0.4 },
  nameSmall: { fontSize: 18, lineHeight: 20 },
  tag: { fontSize: 11.5, color: Brand.ink },
  tagSmall: { fontSize: 8.5 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 34 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  actionText: { fontSize: 14.5, color: Brand.ink },
  actionTextSmall: { fontSize: 13 },
  phoneTop: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: Brand.surface },
  fitOuter: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AUTH_SKY },
  fitInner: { transformOrigin: 'top left' },
});
