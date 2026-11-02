import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { LanguageMenu } from '@/components/shell/LanguageMenu';
import type { IconName } from '@/lib/icons';
import { useSwitcher } from '@/lib/switcher-context';
import type { MockData } from '@/mock';

export type Home = MockData['learner']['learnerHome'];

export const INK = '#0B1424';
export const BODY = '#4A5263';
export const BLUE = '#1463F3';
const LEAF = require('@/assets/images/maple-leaf.png') as number;

/** The learner home's own dark sidebar, matching Image 1 (and supporting custom footer quotes on Projects/Library). */
export function HomeSidebar({
  h,
  active = 'Home',
  heading,
  quote,
}: {
  h: Home;
  active?: string;
  heading?: string;
  quote?: string;
}) {
  return (
    <LinearGradient colors={['#0A1B3D', '#07122B']} style={styles.side}>
      <Pressable style={styles.logo} onPress={() => router.push('/')} accessibilityRole="link" accessibilityLabel="Maple home">
        <Image source={LEAF} style={styles.leaf} contentFit="contain" />
        <View>
          <Text style={styles.brand}>Maple</Text>
          <Text style={styles.brandSub}>Global Online School</Text>
        </View>
      </Pressable>
      <View style={styles.nav}>
        {h.nav.map((n) => {
          const on = n.label === active;
          return (
            <Pressable
              key={n.label}
              style={[styles.navItem, on && styles.navOn]}
              onPress={() => router.push(n.href)}
              accessibilityRole="link"
              accessibilityState={{ selected: on }}>
              <Icon name={n.icon} size={16} color="#FFFFFF" />
              <Text style={[styles.navText, on && styles.navTextOn]} numberOfLines={1}>
                {n.label}
              </Text>
              {n.badge ? (
                <View style={styles.navBadge}>
                  <Text style={styles.navBadgeText}>{n.badge}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      {heading || quote ? (
        <View style={styles.kidCard}>
          <Image source={h.kid} style={styles.kid} contentFit="cover" accessibilityLabel="Learner illustration" />
          <Text style={styles.keep}>{heading ?? 'Keep going!'}</Text>
          <Text style={styles.keepQuote}>{quote ?? '“Big progress\nstarts with\nsmall steps.”'}</Text>
        </View>
      ) : (
        <View style={styles.libraryPromo}>
          <Image source={h.sidebarBooks} style={styles.sidebarBooksImg} contentFit="contain" />
          <Text style={styles.promoTitle}>{'Explore the\nDigital Library'}</Text>
          <Text style={styles.promoSub}>Thousands of books, notes and study resources.</Text>
          <Pressable
            style={styles.promoBtn}
            onPress={() => router.push('/learn/library')}
            accessibilityRole="button"
            accessibilityLabel="Explore Library">
            <Text style={styles.promoBtnText}>Explore Library</Text>
            <Icon name="arrowRight" size={13} color={INK} />
          </Pressable>
        </View>
      )}
    </LinearGradient>
  );
}

/** The page header matching Image 1: list button, search bar, language selector, notifications badge, and Daniel O. profile switcher. */
export function HomeHeader({
  h,
  placeholder = 'Search for classes, lessons, books, projects, or resources...',
  lead,
}: {
  h: Home;
  placeholder?: string;
  lead?: { icon: IconName; label: string; onPress: () => void };
}) {
  const switcher = useSwitcher();
  return (
    <View style={styles.header}>
      <Pressable
        style={styles.helpIcon}
        onPress={lead ? lead.onPress : () => router.push('/learn/explore')}
        accessibilityRole="button"
        accessibilityLabel={lead ? lead.label : 'Toggle navigation'}>
        <Icon name={lead ? lead.icon : 'list'} size={19} color={BLUE} />
      </Pressable>
      <View style={styles.search}>
        <Icon name="search" size={15} color={ BLUE } />
        <TextInput style={styles.searchInput} placeholder={placeholder} placeholderTextColor="#6B7385" accessibilityLabel="Search" />
      </View>
      <View style={styles.flex} />
      <LanguageMenu style={styles.lang}>
        <Icon name="globe" size={17} color={INK} />
        <Text style={styles.langText}>English</Text>
        <Icon name="chevronDown" size={12} color={INK} />
      </LanguageMenu>
      <Pressable
        style={styles.bell}
        onPress={() => router.push('/inbox')}
        accessibilityRole="button"
        accessibilityLabel="Notifications, 3 unread"
        hitSlop={8}>
        <Icon name="bell" size={21} color={INK} />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>3</Text>
        </View>
      </Pressable>
      <Pressable
        style={styles.me}
        onPress={switcher?.open}
        accessibilityRole="button"
        accessibilityLabel={`${h.name}, ${h.grade}. Switch mode`}>
        <Image source={h.avatar} style={styles.avatar} />
        <View>
          <Text style={styles.meName}>{h.name}</Text>
          <Text style={styles.meGrade}>{h.grade}</Text>
        </View>
        <Icon name="chevronDown" size={13} color={INK} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  side: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 187, paddingHorizontal: 12 },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, marginLeft: 4 },
  leaf: { width: 34, height: 36 },
  brand: { fontSize: 21, lineHeight: 23, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.4 },
  brandSub: { fontSize: 11, color: '#CBD5E1' },
  nav: { gap: 2, marginTop: 18 },
  navItem: { height: 32, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 11, borderRadius: 7 },
  navOn: { backgroundColor: BLUE },
  navText: { flex: 1, fontSize: 12.5, color: '#E2E8F0' },
  navTextOn: { fontWeight: '700', color: '#FFFFFF' },
  navBadge: { minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#E5484D', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  navBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  libraryPromo: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#11254D',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  sidebarBooksImg: {
    width: 84,
    height: 48,
    borderRadius: 6,
    marginBottom: 8,
  },
  promoTitle: { fontSize: 14, lineHeight: 18, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
  promoSub: { marginTop: 5, fontSize: 10.5, lineHeight: 14, color: '#CBD5E1', textAlign: 'center' },
  promoBtn: {
    marginTop: 12,
    width: '100%',
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  promoBtnText: { fontSize: 11.5, fontWeight: '700', color: INK },
  kidCard: { position: 'absolute', left: 12, top: 686, width: 164, height: 294, alignItems: 'center', borderRadius: 10, backgroundColor: '#0E2252', overflow: 'hidden' },
  kid: { width: 164, height: 172 },
  keep: { marginTop: 6, fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  keepQuote: { marginTop: 14, fontSize: 14.5, lineHeight: 21, color: '#FFFFFF', textAlign: 'center' },
  header: { position: 'absolute', left: 187, top: 0, right: 0, height: 54, flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 20, gap: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E8EDF4' },
  helpIcon: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 6, backgroundColor: '#EFF5FF' },
  search: { width: 580, height: 34, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#EEF3FA' },
  searchInput: { flex: 1, height: 32, paddingVertical: 0, fontSize: 12, color: INK },
  lang: { flexDirection: 'row', alignItems: 'center', gap: 5, marginRight: 6 },
  langText: { fontSize: 12.5, fontWeight: '600', color: INK },
  bell: { marginRight: 8 },
  badge: { position: 'absolute', top: -6, right: -7, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderRadius: 8, backgroundColor: '#E5484D' },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  me: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  meName: { fontSize: 13, fontWeight: '700', color: INK },
  meGrade: { fontSize: 11, color: BODY },
});
