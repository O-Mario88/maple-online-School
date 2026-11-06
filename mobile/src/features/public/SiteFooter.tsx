import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { SchoolHall } from '@/components/art/SchoolHall';
import { MapleLogo } from '@/components/brand/MapleLogo';
import { Icon } from '@/components/icon';
import { LanguageMenu } from '@/components/shell/LanguageMenu';
// From its own file, not the components/ui barrel: Screen (in the barrel) draws this footer.
import { Button } from '@/components/ui/primitives';
import { Maple, TypeScale } from '@/constants/maple';
import type { IconName } from '@/lib/icons';
import { FOOTER_COLUMNS, type FooterLink, LEGAL_LINKS, validEmail } from '@/lib/public-footer';

import { HAS_SOCIAL, SocialLinks } from './SocialLinks';
import { StoreButtons } from './StoreButtons';

/** One row, as the design: brand, the four columns, a rule and Stay in the Loop. */
const XL = 1600;
/** Desktop: brand and the four columns in a row, Stay in the Loop as a band beneath them. */
const DESK = 1200;
/** Brand and Stay in the Loop side by side, the four columns in a row below. */
const LG = 900;
/** Below this everything stacks; below LG the columns go two to a row. */
const MD = 600;
const MAX_WIDTH = 1440;
const PROMISE = 'A world-class online school empowering learners everywhere with flexible, personalized, and high-quality education.';
const BADGES: readonly { icon: IconName; label: string }[] = [
  { icon: 'shield', label: 'Secure' },
  { icon: 'globe', label: 'Global' },
];

type Size = 'xl' | 'desk' | 'lg' | 'md' | 'sm';

/**
 * The website's footer, on every page in a browser. The iOS and Android apps have their own
 * navigation and show no footer.
 */
export function SiteFooter() {
  if (Platform.OS !== 'web') return null;
  return <Footer />;
}

function sizeFor(width: number): Size {
  if (width >= XL) return 'xl';
  if (width >= DESK) return 'desk';
  if (width >= LG) return 'lg';
  return width >= MD ? 'md' : 'sm';
}

function Footer() {
  const { width } = useWindowDimensions();
  const size = sizeFor(width);
  const narrow = size === 'sm' || size === 'md';
  const year = new Date().getFullYear();
  const columns = (
    <View style={[styles.columns, narrow && styles.columnsWrap]}>
      {FOOTER_COLUMNS.map((c) => (
        <View key={c.title} style={[styles.column, narrow && styles.columnHalf]}>
          <Text style={styles.heading} accessibilityRole="header">
            {c.title}
          </Text>
          {c.links.map((l) => (
            <LinkRow key={l.label} link={l} />
          ))}
        </View>
      ))}
    </View>
  );
  let body;
  if (size === 'xl') {
    body = (
      <View style={styles.row}>
        <Brand />
        {columns}
        <View style={styles.divider} />
        <Loop />
      </View>
    );
  } else if (size === 'desk') {
    body = (
      <View style={styles.stack}>
        <View style={styles.row}>
          <Brand />
          {columns}
        </View>
        <Loop band />
      </View>
    );
  } else {
    body = (
      <View style={styles.stack}>
        <View style={[styles.pair, size === 'lg' && styles.pairRow]}>
          <Brand />
          <Loop />
        </View>
        {columns}
      </View>
    );
  }
  return (
    <View style={styles.footer} accessibilityRole="contentinfo">
      <LinearGradient colors={[Maple.navyDeep, Maple.blue]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <SchoolHall style={[styles.art, (size === 'sm' || size === 'desk') && styles.artSmall, size === 'desk' && styles.artFaint]} />
      <View style={[styles.inner, narrow && styles.innerNarrow]}>{body}</View>
      <View style={[styles.bar, narrow && styles.innerNarrow]}>
        <View style={[styles.barInner, narrow && styles.barStack]}>
          <View style={styles.legal}>
            <Text style={styles.copy}>© {year} Maple Global Online School. All rights reserved.</Text>
            {LEGAL_LINKS.map((l) => (
              <View key={l.label} style={styles.legalItem}>
                {size === 'sm' ? null : <View style={styles.barRule} />}
                <Pressable onPress={() => router.push(l.href)} accessibilityRole="link" hitSlop={4}>
                  {({ hovered }: { hovered?: boolean }) => <Text style={[styles.legalLink, hovered && styles.underline]}>{l.label}</Text>}
                </Pressable>
              </View>
            ))}
          </View>
          <View style={styles.barEnd}>
            <LanguageMenu style={styles.lang}>
              <Icon name="globe" size={17} color={Maple.white} />
              <Text style={styles.langText}>English (Global)</Text>
              <Icon name="chevronDown" size={12} color={Maple.white} />
            </LanguageMenu>
            {HAS_SOCIAL ? <View style={styles.barRuleTall} /> : null}
            <SocialLinks />
          </View>
        </View>
      </View>
    </View>
  );
}

function LinkRow({ link }: { link: FooterLink }) {
  return (
    <Pressable onPress={() => router.push(link.href)} accessibilityRole="link" accessibilityLabel={link.label} hitSlop={4}>
      {({ hovered }: { hovered?: boolean }) => (
        <View style={styles.linkRow}>
          <Icon name={link.icon} size={17} color={hovered ? Maple.goldSoft : Maple.white} />
          <Text style={[styles.link, hovered && styles.linkHover]}>{link.label}</Text>
        </View>
      )}
    </Pressable>
  );
}

function Brand() {
  return (
    <View style={styles.brand}>
      <Pressable style={styles.logo} onPress={() => router.push('/welcome')} accessibilityRole="link" accessibilityLabel="Maple Online School, home">
        <MapleLogo size={44} onDark />
      </Pressable>
      <Text style={styles.promise}>{PROMISE}</Text>
      <View style={styles.badges}>
        {BADGES.map((b) => (
          <View key={b.label} style={styles.badge} accessible accessibilityLabel={b.label}>
            <Icon name={b.icon} size={18} color={Maple.goldSoft} />
            <Text style={styles.badgeText}>{b.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Get the Maple app: the store buttons, beside or under the newsletter form. */
function GetTheApp() {
  return (
    <View style={styles.app}>
      <Text style={styles.appTitle}>Get the Maple app</Text>
      <StoreButtons />
    </View>
  );
}

/**
 * Stay in the Loop. There's no newsletter service yet, so a sign-up says so instead of pretending
 * to save the address. `band` lays it out in one line across the footer (desktop).
 */
function Loop({ band = false }: { band?: boolean }) {
  const [email, setEmail] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const subscribe = () => {
    if (!validEmail(email)) {
      setNote('Enter an email address like name@example.com.');
      return;
    }
    setNote("Newsletter sign-up opens soon. We haven't saved your address.");
  };
  const form = (
    <View style={[styles.loopForm, band && styles.loopFormBand]}>
      <View style={styles.email}>
        <Icon name="mail" size={17} color={Maple.white} />
        <TextInput
          style={styles.emailInput}
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            setNote(null);
          }}
          placeholder="Enter your email address"
          placeholderTextColor={Maple.onBlueMuted}
          accessibilityLabel="Email address for the newsletter"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          onSubmitEditing={subscribe}
        />
      </View>
      <Button label="Subscribe" variant="accent" onPress={subscribe} />
    </View>
  );
  return (
    <View style={band ? styles.band : styles.loop}>
      <View style={band ? styles.bandText : styles.loopText}>
        <Text style={styles.loopTitle} accessibilityRole="header">
          Stay in the Loop
        </Text>
        <Text style={styles.loopBody}>Get the latest learning updates, new features, and school announcements.</Text>
      </View>
      <View style={band ? styles.bandForm : undefined}>
        {form}
        {note ? (
          <Text style={styles.loopNote} accessibilityLiveRegion="polite">
            {note}
          </Text>
        ) : null}
      </View>
      {/* Learning on the go is the other way to stay in the loop, so the app sits with the newsletter. */}
      <View style={band ? styles.bandRule : styles.loopRule} />
      <GetTheApp />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { overflow: 'hidden' },
  art: { position: 'absolute', right: 0, bottom: 56, width: 440, height: 260, opacity: 0.9 },
  artSmall: { width: 280, height: 170 },
  // Behind the Stay in the Loop band on desktop, so quieter there.
  artFaint: { opacity: 0.45 },
  inner: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', paddingHorizontal: 48, paddingTop: 56, paddingBottom: 40 },
  innerNarrow: { paddingHorizontal: 24 },
  row: { flexDirection: 'row', gap: 40 },
  stack: { gap: 36 },
  pair: { gap: 32 },
  pairRow: { flexDirection: 'row', justifyContent: 'space-between' },
  brand: { width: 270, maxWidth: '100%', gap: 16 },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 12, alignSelf: 'flex-start' },
  name: { ...TypeScale.sectionTitle, color: Maple.white },
  tag: { ...TypeScale.meta, color: Maple.white },
  promise: { ...TypeScale.bodySecondary, color: Maple.onBlueMuted },
  badges: { flexDirection: 'row', gap: 10 },
  badge: { minWidth: 78, alignItems: 'center', gap: 5, paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: Maple.onBlueLine },
  badgeText: { ...TypeScale.meta, color: Maple.white },
  app: { gap: 10 },
  appTitle: { ...TypeScale.label, color: Maple.goldSoft },
  loopRule: { height: 1, marginVertical: 8, backgroundColor: Maple.onBlueLine },
  bandRule: { width: 1, alignSelf: 'stretch', backgroundColor: Maple.onBlueLine },
  columns: { flex: 1, flexDirection: 'row', gap: 24 },
  columnsWrap: { flexWrap: 'wrap', rowGap: 32, gap: 0 },
  column: { flex: 1, minWidth: 0, gap: 14 },
  columnHalf: { flexBasis: '50%', flexGrow: 0, paddingRight: 12 },
  heading: { marginBottom: 2, ...TypeScale.cardTitle, color: Maple.white },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  link: { flexShrink: 1, ...TypeScale.bodySecondary, color: Maple.white },
  linkHover: { color: Maple.goldSoft },
  divider: { width: 1, alignSelf: 'stretch', maxHeight: 240, backgroundColor: Maple.onBlueLine },
  loop: { width: 340, maxWidth: '100%', gap: 12 },
  loopText: { gap: 8 },
  band: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 32, paddingTop: 28, borderTopWidth: 1, borderTopColor: Maple.onBlueLine },
  bandText: { flexShrink: 1, gap: 6 },
  bandForm: { width: 380, flexShrink: 1 },
  loopTitle: { ...TypeScale.sectionTitle, color: Maple.white },
  loopBody: { ...TypeScale.bodySecondary, color: Maple.onBlueMuted },
  loopForm: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  loopFormBand: { marginTop: 0 },
  email: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, height: 44, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: Maple.onBlueMuted, backgroundColor: Maple.onBlueTint },
  emailInput: { flex: 1, minWidth: 0, height: 42, paddingVertical: 0, ...TypeScale.bodySecondary, color: Maple.white },
  loopNote: { marginTop: 8, ...TypeScale.meta, color: Maple.goldSoft },
  bar: { borderTopWidth: 1, borderTopColor: Maple.onBlueLine, paddingHorizontal: 48 },
  barInner: { width: '100%', maxWidth: MAX_WIDTH - 96, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 20, paddingVertical: 20 },
  barStack: { flexDirection: 'column', alignItems: 'flex-start' },
  legal: { flexShrink: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', rowGap: 8, columnGap: 14 },
  legalItem: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  copy: { ...TypeScale.meta, color: Maple.white },
  barRule: { width: 1, height: 18, backgroundColor: Maple.onBlueLine },
  barRuleTall: { width: 1, height: 26, backgroundColor: Maple.onBlueLine },
  legalLink: { ...TypeScale.meta, color: Maple.white },
  underline: { textDecorationLine: 'underline' },
  barEnd: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  lang: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  langText: { ...TypeScale.meta, color: Maple.white },
});
