import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { LanguageMenu } from '@/components/shell/LanguageMenu';
import { useSwitcher } from '@/lib/switcher-context';

const INK = '#0B1424';
const LEAF = require('@/assets/images/maple-leaf.png') as number;

/** The learner's phone top bar: logo, optional language globe, notifications and the avatar that opens the mode switcher. */
export function LearnerPhoneTop({ avatar, globe = false }: { avatar: number; globe?: boolean }) {
  const switcher = useSwitcher();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.top, { paddingTop: insets.top, height: 56 + insets.top }]}>
      <View style={styles.logo}>
        <Image source={LEAF} style={styles.leaf} contentFit="contain" />
        <View>
          <Text style={styles.name}>Maple</Text>
          <Text style={styles.tag}>Global Online School</Text>
        </View>
      </View>
      <View style={styles.topRight}>
        {globe ? (
          <LanguageMenu>
            <Icon name="globe" size={22} color={INK} />
          </LanguageMenu>
        ) : null}
        <Pressable onPress={() => router.push('/inbox')} accessibilityRole="button" accessibilityLabel="Notifications" hitSlop={8}>
          <Icon name="bell" size={22} color={INK} />
          <View style={styles.redDot} />
        </Pressable>
        <Pressable onPress={switcher?.open} accessibilityRole="button" accessibilityLabel="Switch mode">
          <Image source={avatar} style={styles.avatar} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: '#FFFFFF' },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  leaf: { width: 32, height: 32 },
  name: { fontSize: 18, lineHeight: 20, fontWeight: '700', color: INK },
  tag: { fontSize: 7.5, color: INK },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  redDot: { position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5484D' },
  avatar: { width: 36, height: 36, borderRadius: 18 },
});
