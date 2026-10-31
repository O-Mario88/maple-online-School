import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import type { IconName } from '@/lib/icons';
import { useSwitcher } from '@/lib/switcher-context';
import type { MockData } from '@/mock';

export type Home = MockData['learner']['learnerHome'];

export const INK = '#0B1424';
export const BODY = '#4A5263';
export const BLUE = '#1463F3';
const LEAF = require('@/assets/images/maple-leaf.png') as number;

/** The learner home's own dark sidebar, as its reference draws it. */
export function HomeSidebar({ h, active = 'Home', heading = 'Keep going!', quote = '“Big progress\nstarts with\nsmall steps.”' }: { h: Home; active?: string; heading?: string; quote?: string }) {
  return (
    <LinearGradient colors={['#0B1D45', '#081431']} style={styles.side}>
      <Pressable style={styles.logo} onPress={() => router.push('/')} accessibilityRole="link" accessibilityLabel="Maple home">
        <Image source={LEAF} style={styles.leaf} contentFit="contain" />
        <View>
          <Text style={styles.brand}>Maple</Text>
          <Text style={styles.brandSub}>Global Online School</Text>
        </View>
      </Pressable>
      <View style={styles.nav}>
        {h.nav.map((n) => (
          <Pressable key={n.label} style={[styles.navItem, n.label === active && styles.navOn]} onPress={() => router.push(n.href)} accessibilityRole="link" accessibilityState={{ selected: n.label === active }}>
            <Icon name={n.icon} size={18} color="#FFFFFF" />
            <Text style={styles.navText} numberOfLines={1}>
              {n.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Pressable style={styles.help} onPress={() => router.push('/inbox')} accessibilityRole="button">
        <Icon name="chat" size={18} color="#FFFFFF" />
        <Text style={styles.helpText}>Need Help?</Text>
        <Icon name="arrowRight" size={15} color="#FFFFFF" />
      </Pressable>
      <View style={styles.kidCard}>
        <Image source={h.kid} style={styles.kid} contentFit="cover" accessibilityLabel="A smiling child resting her chin on her hand" />
        <Text style={styles.keep}>{heading}</Text>
        <Text style={styles.keepQuote}>{quote}</Text>
      </View>
    </LinearGradient>
  );
}

/** The page header. `lead` swaps the help button for a page action, such as the library's filters. */
export function HomeHeader({ h, placeholder = 'Search for lessons, topics, books, or ask a question...', lead }: { h: Home; placeholder?: string; lead?: { icon: IconName; label: string; onPress: () => void } }) {
  const switcher = useSwitcher();
  return (
    <View style={styles.header}>
      <Pressable style={styles.helpIcon} onPress={lead ? lead.onPress : () => router.push('/inbox')} accessibilityRole="button" accessibilityLabel={lead ? lead.label : 'Help'}>
        <Icon name={lead ? lead.icon : 'help'} size={19} color={lead ? BLUE : INK} />
      </Pressable>
      <View style={styles.search}>
        <Icon name="search" size={16} color={BODY} />
        <TextInput style={styles.searchInput} placeholder={placeholder} placeholderTextColor="#6B7385" accessibilityLabel="Search" />
      </View>
      <View style={styles.flex} />
      <Pressable onPress={() => router.push('/learn/passport')} accessibilityRole="button" accessibilityLabel="Rewards" hitSlop={8}>
        <Image source={h.gift} style={styles.gift} />
      </Pressable>
      <Pressable style={styles.bell} onPress={() => router.push('/inbox')} accessibilityRole="button" accessibilityLabel="Notifications, 3 unread" hitSlop={8}>
        <Icon name="bell" size={22} color={INK} />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>3</Text>
        </View>
      </Pressable>
      <Pressable style={styles.me} onPress={switcher?.open} accessibilityRole="button" accessibilityLabel={`${h.name}, ${h.grade}. Switch mode`}>
        <Image source={h.avatar} style={styles.avatar} />
        <View>
          <Text style={styles.meName}>{h.name}</Text>
          <Text style={styles.meGrade}>{h.grade}</Text>
        </View>
        <View style={styles.chev}>
          <Icon name="chevronDown" size={15} color={INK} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  side: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 187, paddingHorizontal: 12 },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, marginLeft: 2 },
  leaf: { width: 38, height: 40 },
  brand: { fontSize: 22, lineHeight: 24, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.4 },
  brandSub: { fontSize: 12, color: '#FFFFFF' },
  nav: { gap: 3.6, marginTop: 20 },
  navItem: { height: 33, flexDirection: 'row', alignItems: 'center', gap: 17, paddingHorizontal: 12, borderRadius: 6 },
  navOn: { backgroundColor: BLUE },
  navText: { fontSize: 13.5, color: '#FFFFFF' },
  help: { position: 'absolute', left: 12, top: 632, width: 163, height: 41, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 13, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)' },
  helpText: { flex: 1, fontSize: 13.5, color: '#FFFFFF' },
  kidCard: { position: 'absolute', left: 12, top: 686, width: 164, height: 294, alignItems: 'center', borderRadius: 10, backgroundColor: '#0E2252', overflow: 'hidden' },
  kid: { width: 164, height: 172 },
  keep: { marginTop: 6, fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  keepQuote: { marginTop: 14, fontSize: 14.5, lineHeight: 21, color: '#FFFFFF', textAlign: 'center' },
  header: { position: 'absolute', left: 187, top: 0, right: 0, height: 56, flexDirection: 'row', alignItems: 'center', paddingLeft: 18, paddingRight: 22, gap: 14 },
  helpIcon: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  search: { width: 644, height: 31, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 12, borderRadius: 6, backgroundColor: '#E8EEF8' },
  searchInput: { flex: 1, height: 30, fontSize: 12.5, color: INK },
  gift: { width: 26, height: 26, marginRight: 30 },
  bell: { marginRight: 26 },
  badge: { position: 'absolute', top: -7, right: -8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderRadius: 8, backgroundColor: '#E5484D' },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  me: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 41, height: 41, borderRadius: 21 },
  meName: { fontSize: 14, fontWeight: '700', color: INK },
  meGrade: { marginTop: 2, fontSize: 12, color: BODY },
  chev: { marginLeft: 70 },
});
