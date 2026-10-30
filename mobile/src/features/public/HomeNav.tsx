import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Icon } from '@/components/icon';

import { Brand } from './palette';

const LINKS = ['Home', 'Courses', 'Live Classes', 'Shorts', 'Curriculums', 'For Schools', 'For Teachers', 'Pricing', 'About'] as const;
type NavLink = (typeof LINKS)[number];

// Below this width the bar drops Pricing and About so the links don't run into the buttons.
const ALL_LINKS_WIDTH = 1280;
const SHORT_LINKS = 7;
const LINK_ROUTES: Partial<Record<NavLink, '/welcome' | '/explore' | '/shorts'>> = { Home: '/welcome', Courses: '/explore', Shorts: '/shorts' };

/** The public site's top bar: logo, section links on wide screens, and sign-in. */
export function HomeNav({ wide, active = 'Home' }: { wide: boolean; active?: NavLink }) {
  const { width } = useWindowDimensions();
  const links = width >= ALL_LINKS_WIDTH ? LINKS : LINKS.slice(0, SHORT_LINKS);
  return (
    <View style={[styles.bar, !wide && styles.barNarrow]} accessibilityRole="header">
      <View style={styles.brand}>
        <Text style={styles.leaf} accessibilityElementsHidden>
          🍁
        </Text>
        <View>
          <Text style={styles.name}>Maple</Text>
          <Text style={styles.tag}>Global Online School</Text>
        </View>
      </View>
      {wide ? (
        <View style={styles.links} accessibilityRole="menubar">
          {links.map((l) => {
            const route = LINK_ROUTES[l];
            return (
              <Pressable key={l} accessibilityRole="link" style={styles.link} onPress={route ? () => router.push(route) : undefined}>
                <Text style={[styles.linkText, l === active && styles.linkActive]}>{l}</Text>
                {l === active ? <View style={styles.underline} /> : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
      <View style={[styles.actions, !wide && styles.actionsNarrow]}>
        {wide ? (
          <>
            <Pressable accessibilityRole="button" accessibilityLabel="Search" hitSlop={8}>
              <Icon name="search" size={20} color={Brand.ink} />
            </Pressable>
            <View style={styles.lang}>
              <Icon name="globe" size={18} color={Brand.ink} />
              <Text style={styles.linkText}>English</Text>
            </View>
          </>
        ) : null}
        <Pressable style={[styles.signIn, !wide && styles.btnNarrow]} accessibilityRole="button" onPress={() => router.push('/sign-in')}>
          <Text style={styles.signInText}>Sign in</Text>
        </Pressable>
        <Pressable style={[styles.start, !wide && styles.btnNarrow]} accessibilityRole="button" onPress={() => router.push('/sign-up')}>
          <Text style={styles.startText}>Get started</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Brand.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Brand.line,
  },
  barNarrow: { paddingHorizontal: 16, gap: 8 },
  actionsNarrow: { gap: 8 },
  btnNarrow: { paddingHorizontal: 12 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  leaf: { fontSize: 34, color: Brand.leaf },
  name: { fontSize: 22, fontWeight: '700', color: Brand.ink, letterSpacing: -0.4 },
  tag: { fontSize: 11, color: Brand.body, marginTop: -2 },
  links: { flexDirection: 'row', gap: 24, flexShrink: 1 },
  link: { paddingVertical: 8 },
  linkText: { fontSize: 14, color: Brand.ink, fontWeight: '500' },
  linkActive: { color: Brand.blue, fontWeight: '600' },
  underline: { position: 'absolute', left: 0, right: 0, bottom: -12, height: 2, backgroundColor: Brand.blue, borderRadius: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  lang: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  signIn: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: Brand.line },
  signInText: { fontSize: 14, fontWeight: '600', color: Brand.blue },
  start: { paddingHorizontal: 22, paddingVertical: 11, borderRadius: 8, backgroundColor: Brand.blue },
  startText: { fontSize: 14, fontWeight: '600', color: Brand.surface },
});
