import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';

import { Brand } from './palette';

const LEAF = require('@/assets/images/maple-leaf.png') as number;

/** The reference phone screens' top bar: menu, Maple logo, language and profile. */
export function PhoneBar() {
  return (
    <View style={styles.bar}>
      <Pressable accessibilityRole="button" accessibilityLabel="Menu" hitSlop={8}>
        <Icon name="menu" size={22} color={Brand.ink} />
      </Pressable>
      <Pressable style={styles.logo} onPress={() => router.push('/welcome')} accessibilityRole="link" accessibilityLabel="Maple home">
        <Image source={LEAF} style={styles.leaf} contentFit="contain" />
        <View>
          <Text style={styles.name}>Maple</Text>
          <Text style={styles.tag}>Global Online School</Text>
        </View>
      </Pressable>
      <View style={styles.icons}>
        <Icon name="globe" size={21} color={Brand.ink} />
        <Pressable onPress={() => router.push('/sign-in')} accessibilityRole="button" accessibilityLabel="Sign in" hitSlop={8}>
          <Icon name="person" size={21} color={Brand.ink} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: Brand.surface },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  leaf: { width: 30, height: 30 },
  name: { fontSize: 18, lineHeight: 20, fontWeight: '700', color: Brand.ink },
  tag: { fontSize: 7, color: Brand.ink },
  icons: { flexDirection: 'row', alignItems: 'center', gap: 16 },
});
