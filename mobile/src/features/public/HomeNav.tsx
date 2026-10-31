import { Image } from 'expo-image';
import { type Href, router } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { Icon } from '@/components/icon';
import { LanguageMenu } from '@/components/shell/LanguageMenu';

import { Brand } from './palette';

/** The homepage reference's top bar links, in its order. */
const LINKS = ['Home', 'Courses', 'Live Classes', 'Curriculums', 'For Schools', 'For Teachers', 'Pricing', 'About'] as const;
/** The Explore reference's top bar links, in its order. */
export const EXPLORE_LINKS = ['Home', 'Explore', 'Live Classes', 'Curriculums', 'For Schools', 'For Teachers', 'Pricing'] as const;
/** The past paper reference's links: Past Papers joins the bar. */
export const PAPER_LINKS = ['Home', 'Explore', 'Live Classes', 'Past Papers', 'Curriculums', 'For Schools', 'For Teachers', 'Pricing'] as const;
/** Pages that are not in the bar still say which section they belong to. */
type NavLink = (typeof LINKS)[number] | (typeof EXPLORE_LINKS)[number] | 'Past Papers' | 'Shorts';

// Below this width the bar drops Pricing and About so the links don't run into the buttons.
const ALL_LINKS_WIDTH = 1280;
const SHORT_LINKS = 6;
const LINK_ROUTES: Readonly<Record<NavLink, Href>> = {
  Home: '/welcome',
  Courses: '/explore',
  Explore: '/explore',
  'Live Classes': { pathname: '/explore', params: { kind: 'live' } },
  'Past Papers': { pathname: '/explore', params: { kind: 'paper' } },
  Shorts: '/shorts',
  Curriculums: '/curriculums',
  'For Schools': '/schools',
  'For Teachers': '/teachers',
  Pricing: '/pricing',
  About: '/about',
};
/** Every section of the public site with where it goes: the phone menu lists these. */
export const PUBLIC_MENU: readonly { label: NavLink; href: Href }[] = (['Home', 'Explore', 'Live Classes', 'Past Papers', 'Shorts', 'Curriculums', 'For Schools', 'For Teachers', 'Pricing', 'About'] as const).map((label) => ({ label, href: LINK_ROUTES[label] }));
/** Where a breadcrumb goes: a section of the site by name, otherwise a catalogue search for its first word. */
export function crumbHref(label: string): Href {
  const section = (LINK_ROUTES as Readonly<Record<string, Href>>)[label];
  return section ?? { pathname: '/explore', params: { q: label.split(' ')[0] } };
}
const LEAF = require('@/assets/images/maple-leaf.png') as number;

interface HomeNavProps {
  wide: boolean;
  active?: NavLink;
  /** Show every link whatever the window width (for pages drawn at the reference's width). */
  fullWidth?: boolean;
  links?: readonly NavLink[];
  /** The Explore reference's taller bar (80px, larger buttons). */
  tall?: boolean;
  /** Show a search box (with this placeholder) instead of the search icon, as the live class reference does. */
  searchPlaceholder?: string;
}

/**
 * The public site's top bar: logo, section links on wide screens, and sign-in.
 * Sizes are the reference designs' pixels at 1536px wide.
 */
export function HomeNav({ wide, active = 'Home', fullWidth = false, links: own, tall = false, searchPlaceholder }: HomeNavProps) {
  const { width } = useWindowDimensions();
  const all = own ?? LINKS;
  const links = fullWidth || width >= ALL_LINKS_WIDTH ? all : all.slice(0, SHORT_LINKS);
  const t = tall && wide;
  // Eight links and a search box need the tighter spacing the past paper reference uses.
  const dense = t && !!searchPlaceholder && links.length > 7;
  return (
    <View style={[styles.bar, t && styles.barTall, !wide && styles.barNarrow]} accessibilityRole="header">
      <Pressable style={[styles.brand, t && styles.brandTall]} accessibilityRole="link" accessibilityLabel="Maple Global Online School, home" onPress={() => router.push('/welcome')}>
        <Image source={LEAF} style={[styles.leaf, t && styles.leafTall, !wide && styles.leafNarrow]} contentFit="contain" />
        <View>
          <Text style={[styles.name, t && styles.nameTall, !wide && styles.nameNarrow]}>Maple</Text>
          <Text style={[styles.tag, t && styles.tagTall]}>Global Online School</Text>
        </View>
      </Pressable>
      {wide ? (
        <View style={[styles.links, t && styles.linksTall, t && searchPlaceholder ? styles.linksSearch : null, dense && styles.linksDense]} accessibilityRole="menubar">
          {links.map((l) => {
            const route = LINK_ROUTES[l];
            const on = l === active;
            return (
              <Pressable key={l} accessibilityRole="link" style={[styles.link, t && styles.linkTall]} onPress={() => router.push(route)}>
                <Text style={[styles.linkText, t && styles.linkTextTall, t && searchPlaceholder ? styles.linkTextSearch : null, dense && styles.linkTextDense, on && styles.linkActive]}>{l}</Text>
                {on ? <View style={[styles.underline, t && styles.underlineTall]} /> : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
      <View style={styles.spacer} />
      <View style={[styles.actions, !wide && styles.actionsNarrow]}>
        {wide ? (
          <>
            {searchPlaceholder ? (
              <View style={[styles.searchBox, dense && styles.searchBoxDense]}>
                <Icon name="search" size={17} color={Brand.body} />
                <TextInput
                  style={styles.searchInput}
                  placeholder={searchPlaceholder}
                  placeholderTextColor="#8A92A3"
                  accessibilityLabel="Search"
                  returnKeyType="search"
                  onSubmitEditing={(e) => router.push({ pathname: '/explore', params: { q: e.nativeEvent.text } })}
                />
              </View>
            ) : (
              <Pressable accessibilityRole="button" accessibilityLabel="Search" hitSlop={8} style={[styles.searchBtn, t && styles.searchBtnTall]} onPress={() => router.push('/explore')}>
                <Icon name="search" size={t ? 21 : 19} color={Brand.ink} />
              </Pressable>
            )}
            <LanguageMenu style={[styles.lang, t && styles.langTall]}>
              <Icon name="globe" size={t ? 18 : 17} color={Brand.ink} />
              <Text style={[styles.linkText, t && styles.linkTextTall]}>English</Text>
              <Icon name="chevronDown" size={13} color={Brand.ink} />
            </LanguageMenu>
          </>
        ) : null}
        <Pressable style={[styles.signIn, t && styles.signInTall, !wide && styles.btnNarrow]} accessibilityRole="button" onPress={() => router.push('/sign-in')}>
          <Text style={[styles.signInText, t && styles.btnTextTall]}>Sign in</Text>
        </Pressable>
        <Pressable style={[styles.start, t && styles.startTall, !wide && styles.btnNarrow]} accessibilityRole="button" onPress={() => router.push('/sign-up')}>
          <Text style={[styles.startText, t && styles.btnTextTall]}>Get started</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 57,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 72,
    paddingRight: 70,
    backgroundColor: Brand.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ECEFF5',
  },
  barTall: { height: 80, paddingLeft: 47, paddingRight: 45, borderBottomWidth: 1 },
  barNarrow: { height: 60, paddingLeft: 14, paddingRight: 14 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  brandTall: { gap: 10 },
  leaf: { width: 46, height: 46 },
  leafTall: { width: 49, height: 49 },
  leafNarrow: { width: 38, height: 38 },
  name: { fontSize: 21, lineHeight: 24, fontWeight: '700', color: Brand.ink, letterSpacing: -0.3 },
  nameTall: { fontSize: 25, lineHeight: 28 },
  nameNarrow: { fontSize: 19, lineHeight: 22 },
  tag: { fontSize: 9.5, color: Brand.ink },
  tagTall: { fontSize: 11 },
  links: { flexDirection: 'row', gap: 31, marginLeft: 87, flexShrink: 1 },
  linksTall: { gap: 39, marginLeft: 120 },
  // With the search box the live class reference uses smaller, closer links.
  linksSearch: { gap: 28, marginLeft: 40 },
  linkTextSearch: { fontSize: 13 },
  linksDense: { gap: 22, marginLeft: 30 },
  linkTextDense: { fontSize: 12 },
  searchBoxDense: { width: 240 },
  link: { height: 57, justifyContent: 'center' },
  linkTall: { height: 80 },
  linkText: { fontSize: 13.5, color: Brand.ink },
  linkTextTall: { fontSize: 14.5 },
  linkActive: { color: Brand.blue, fontWeight: '500' },
  underline: { position: 'absolute', left: 0, right: 0, bottom: 10, height: 2, backgroundColor: Brand.blue, borderRadius: 1 },
  underlineTall: { bottom: 16, height: 2.5 },
  spacer: { flex: 1 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  actionsNarrow: { gap: 8 },
  searchBtn: { marginRight: 28 },
  searchBtnTall: { marginRight: 33 },
  searchBox: { width: 285, height: 37, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, marginRight: 24, borderRadius: 9, borderWidth: 1, borderColor: '#E3E8F0', backgroundColor: '#FAFBFD' },
  searchInput: { flex: 1, height: 35, fontSize: 13, color: Brand.ink },
  lang: { flexDirection: 'row', alignItems: 'center', gap: 7, marginRight: 23 },
  langTall: { marginRight: 14 },
  signIn: { width: 86, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 6, borderWidth: 1, borderColor: '#DCE3EE', marginRight: 11 },
  signInTall: { height: 46, borderRadius: 8 },
  signInText: { fontSize: 13.5, fontWeight: '500', color: Brand.blue },
  start: { width: 110, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 6, backgroundColor: Brand.blue },
  startTall: { width: 120, height: 46, borderRadius: 8 },
  startText: { fontSize: 13.5, fontWeight: '600', color: Brand.surface },
  btnTextTall: { fontSize: 14.5 },
  btnNarrow: { width: undefined, height: 36, paddingHorizontal: 12, marginRight: 0 },
});
