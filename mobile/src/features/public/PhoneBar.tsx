import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { LanguageMenu } from '@/components/shell/LanguageMenu';
import { Sheet } from '@/components/ui/Sheet';

import { PUBLIC_MENU } from './HomeNav';
import { Brand } from './palette';

const LEAF = require('@/assets/images/maple-leaf.png') as number;

/** The reference phone screens' top bar: menu, Maple logo, language and profile. */
export function PhoneBar() {
  const [menu, setMenu] = useState(false);
  return (
    <View style={styles.bar}>
      <Sheet visible={menu} title="Menu" onClose={() => setMenu(false)}>
        {PUBLIC_MENU.map((m) => (
          <Pressable
            key={m.label}
            style={styles.menuRow}
            accessibilityRole="link"
            onPress={() => {
              setMenu(false);
              router.push(m.href);
            }}>
            <Text style={styles.menuText}>{m.label}</Text>
            <Icon name="chevronRight" size={16} color={Brand.muted} />
          </Pressable>
        ))}
      </Sheet>
      <Pressable accessibilityRole="button" accessibilityLabel="Menu" hitSlop={8} onPress={() => setMenu(true)}>
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
        <LanguageMenu>
          <Icon name="globe" size={21} color={Brand.ink} />
        </LanguageMenu>
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
  menuRow: { height: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Brand.line },
  menuText: { fontSize: 15, fontWeight: '600', color: Brand.ink },
  icons: { flexDirection: 'row', alignItems: 'center', gap: 16 },
});
