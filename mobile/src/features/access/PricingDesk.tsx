import { Image } from '@/components/picture';
import { LinearGradient } from 'expo-linear-gradient';
import { type Href, router, usePathname } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Icon } from '@/components/icon';
import { RefScale } from '@/features/public/home/RefScale';
import { openMenuPage } from '@/lib/menu-nav';

import { C, LOGO, Pill, PlanIcon, Popular, per, type Pricing, STUDENT, ugx, usePricing } from './pricing-parts';
import { Maple } from '@/constants/maple';

/** The desktop reference is 1672 × 941; the page is laid out in its pixels and scaled to the window. */
const REF_WIDTH = 1672;
const REF_HEIGHT = 989;
/** The reference's plan card widths, for three plans. */
const CARD_WIDTHS = [234, 285, 266];
const CARD_GAP = 18;

function TopBar({ p }: { p: Pricing }) {
  return (
    <View style={s.top}>
      <Pressable style={s.brand} onPress={() => router.push('/')} accessibilityRole="link" accessibilityLabel="Maple home">
        <Image source={LOGO} style={s.leaf} contentFit="contain" />
        <View>
          <Text style={s.brandName}>Maple</Text>
          <Text style={s.brandSub}>Global Online School</Text>
        </View>
      </Pressable>
      <Pressable style={s.search} onPress={() => router.push('/learn/explore' as Href)} accessibilityRole="search">
        <Icon name="search" size={22} color={C.body} />
        <Text style={s.searchText} numberOfLines={1}>
          Search subjects, lessons, past papers, and more...
        </Text>
      </Pressable>
      <View style={s.bell}>
        <Icon name="bell" size={24} color={C.ink} />
        <View style={s.bellDot} />
      </View>
      {p.avatar ? (
        <Image source={p.avatar} style={s.avatar} contentFit="cover" accessibilityLabel={p.name} />
      ) : (
        <View style={[s.avatar, s.avatarBlank]}>
          <Text style={s.avatarText}>{p.name.slice(0, 1).toUpperCase()}</Text>
        </View>
      )}
      <Text style={s.topName} numberOfLines={1}>
        {p.name}
      </Text>
      <View style={s.chevron}>
        <Icon name="chevronDown" size={18} color={C.ink} />
      </View>
    </View>
  );
}

function SideMenu({ p }: { p: Pricing }) {
  const path = usePathname();
  return (
    <View style={s.side}>
      {p.nav.map((i) => {
        const on = i.href === path;
        return (
          <Pressable key={i.key} style={[s.sideItem, on && s.sideItemOn]} onPress={() => openMenuPage(i.href as Href)} accessibilityRole="link">
            <Icon name={i.icon} size={22} color={on ? C.blue : C.ink} />
            <Text style={[s.sideText, on && s.sideTextOn]} numberOfLines={1}>
              {i.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Hero({ p }: { p: Pricing }) {
  return (
    <>
      <Image source={STUDENT} style={s.photo} contentFit="contain" accessibilityLabel="A smiling Maple learner" />
      <View style={s.heroText}>
        <Pill p={p} size={13.5} height={33} />
        <Text style={s.title} accessibilityRole="header">
          {p.copy.title}
        </Text>
        <Text style={s.sub}>{p.copy.subtitle}</Text>
      </View>
      {p.freeCard ? (
        <View style={s.free}>
          <View style={s.freeIcon}>
            <Icon name="gift" size={30} color={C.green} />
          </View>
          <View>
            <Text style={s.freeTitle}>{p.freeCard.title}</Text>
            <Text style={s.freeSub}>{p.freeCard.sub}</Text>
            {p.freeCard.items.map((f) => (
              <Pressable key={f.label} style={s.check} onPress={() => router.push(f.href as Href)} accessibilityRole="link">
                <Icon name="tick" size={24} color={C.green} />
                <Text style={s.checkText}>{f.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </>
  );
}

function Plans({ p }: { p: Pricing }) {
  const three = p.plans.length === 3;
  return (
    <View style={s.plans}>
      <Text style={s.planHead}>Choose Your Plan</Text>
      <Text style={s.planSub}>Get back to full learning and reach your goals faster.</Text>
      <View style={s.cards}>
        {p.plans.map((plan, i) => (
          <View key={plan.id} style={[s.card, three ? { width: CARD_WIDTHS[i] } : s.flex, plan.popular && s.cardPopular]}>
            {plan.popular ? (
              <View style={s.popularAt}>
                <Popular size={14.5} height={30} />
              </View>
            ) : null}
            <PlanIcon plan={plan} size={46} />
            <Text style={s.cardName}>{plan.name}</Text>
            <Text style={s.cardBlurb}>{plan.deskBlurb ?? plan.blurb}</Text>
            <Text style={s.cardPrice}>{ugx(plan.monthly)}</Text>
            <Text style={s.cardPer}>{per(p.school)}</Text>
            <View style={s.features}>
              {plan.features.map((f) => (
                <View key={f} style={s.feature}>
                  <Icon name="tick" size={16} color={C.green} />
                  <Text style={s.featureText}>{f}</Text>
                </View>
              ))}
            </View>
            {plan.id === p.currentId ? (
              <View style={[s.choose, s.chooseCurrent]} accessibilityLabel={`${plan.name} is your current plan`}>
                <Icon name="check" size={18} color={C.green} />
                <Text style={[s.chooseText, s.chooseCurrentText]}>Current plan</Text>
              </View>
            ) : (
              <Pressable style={[s.choose, plan.popular && s.choosePopular]} onPress={() => p.pay(plan.id)} accessibilityRole="button">
                {plan.popular ? <LinearGradient colors={[Maple.blue, Maple.blueHover]} style={StyleSheet.absoluteFill} /> : null}
                <Text style={[s.chooseText, plan.popular && s.choosePopularText]} numberOfLines={1}>{`Choose ${plan.short ?? plan.name}`}</Text>
                {plan.popular ? <Icon name="arrowRight" size={20} color={C.white} /> : null}
              </Pressable>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

function Footer({ p }: { p: Pricing }) {
  return (
    <>
      <Pressable style={s.mode} onPress={p.browseFree} accessibilityRole="button">
        <Icon name="rocket" size={40} color={C.blue} />
        <View style={s.modeText}>
          <Text style={s.modeTitle}>{p.modeLabel}</Text>
          <Text style={s.modeBody}>{p.modeBody}</Text>
        </View>
        <Icon name="arrowRight" size={24} color={C.body} />
      </Pressable>
      <View style={s.promises}>
        {p.promises.map((m, i) => (
          <View key={m.title} style={[s.promise, i > 0 && s.promiseLine]}>
            <View style={s.promiseIcon}>
              <Icon name={m.icon} size={26} color={C.blue} />
            </View>
            <View style={s.flex}>
              <Text style={s.promiseTitle}>{m.title}</Text>
              <Text style={s.promiseBody}>{m.body}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={s.accepts}>
        <Text style={s.acceptsTitle}>We Accept</Text>
        <View style={s.logos}>
          {p.accepts.map((l) => (
            <Image key={l.name} source={l.logo} style={[s.logo, { width: l.width }]} contentFit="contain" accessibilityLabel={l.name} />
          ))}
        </View>
        <View style={s.acceptsLine} />
        <Pressable style={s.extension} onPress={p.extension} accessibilityRole="button">
          <Icon name="gift" size={30} color={C.blue} />
          <Text style={s.extensionAsk}>Need more time?</Text>
          <Text style={s.extensionLink}>Request a short extension</Text>
          <Icon name="arrowRight" size={22} color={C.blue} />
        </Pressable>
      </View>
    </>
  );
}

/** Pricing on wide screens: the desktop reference, scaled to the window. */
export function PricingDesk() {
  const p = usePricing();
  const { width } = useWindowDimensions();
  return (
    <ScrollView style={s.root}>
      <RefScale width={width} refWidth={REF_WIDTH}>
        <View style={s.canvas}>
          <TopBar p={p} />
          <SideMenu p={p} />
          <Hero p={p} />
          <Plans p={p} />
          <Footer p={p} />
        </View>
      </RefScale>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  root: { flex: 1, backgroundColor: C.canvas },
  canvas: { width: REF_WIDTH, height: REF_HEIGHT, backgroundColor: C.canvas },

  top: { position: 'absolute', left: 0, top: 0, width: REF_WIDTH, height: 78, borderBottomWidth: 1, borderBottomColor: Maple.blueSelected, backgroundColor: C.canvas },
  brand: { position: 'absolute', left: 50, top: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  leaf: { width: 40, height: 42 },
  brandName: { fontSize: 23.6, lineHeight: 26, fontWeight: '700', color: C.navy },
  brandSub: { fontSize: 11.6, lineHeight: 14, fontWeight: '600', color: C.navy },
  search: { position: 'absolute', left: 538, top: 15, width: 674, height: 46, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18, borderRadius: 23, borderWidth: 1, borderColor: Maple.disabledBorder, backgroundColor: C.white },
  searchText: { flex: 1, fontSize: 15.5, color: C.body },
  bell: { position: 'absolute', left: 1371, top: 26 },
  bellDot: { position: 'absolute', right: -2, top: -3, width: 9, height: 9, borderRadius: 5, backgroundColor: Maple.error },
  avatar: { position: 'absolute', left: 1448, top: 17, width: 40, height: 40, borderRadius: 20 },
  avatarBlank: { alignItems: 'center', justifyContent: 'center', backgroundColor: Maple.blueSelected },
  avatarText: { fontSize: 16, fontWeight: '700', color: C.blue },
  topName: { position: 'absolute', left: 1499, top: 27, width: 115, fontSize: 16.5, lineHeight: 20, fontWeight: '600', color: C.navy },
  chevron: { position: 'absolute', left: 1617, top: 28 },

  side: { position: 'absolute', left: 0, top: 79, width: 180, bottom: 0, paddingTop: 15, gap: 6, borderRightWidth: 1, borderRightColor: Maple.blueSelected },
  sideItem: { marginLeft: 12, width: 153, height: 46, flexDirection: 'row', alignItems: 'center', gap: 18, paddingLeft: 13, borderRadius: 12 },
  sideItemOn: { backgroundColor: Maple.blueSelected },
  sideText: { fontSize: 14.5, fontWeight: '500', color: C.ink },
  sideTextOn: { fontWeight: '600', color: C.blue },

  photo: { position: 'absolute', left: 530, top: 107, width: 303, height: 351 },
  heroText: { position: 'absolute', left: 216, top: 122, width: 345 },
  title: { marginTop: 25, fontSize: 43, lineHeight: 49, fontWeight: '800', letterSpacing: -0.6, color: C.navy },
  sub: { marginTop: 13, fontSize: 15.7, lineHeight: 24.5, color: C.body },

  free: { position: 'absolute', left: 218, top: 458, width: 577, height: 235, flexDirection: 'row', gap: 20, paddingLeft: 18, paddingTop: 25, borderRadius: 18, borderWidth: 1, borderColor: C.softLine, backgroundColor: C.soft },
  freeIcon: { width: 54, height: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: C.white, shadowColor: Maple.blueHover, shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  freeTitle: { marginTop: -3, fontSize: 24, lineHeight: 30, fontWeight: '700', color: C.navy },
  freeSub: { marginTop: 2, marginBottom: 6, fontSize: 14, lineHeight: 20, fontWeight: '600', color: C.green },
  check: { flexDirection: 'row', alignItems: 'center', gap: 11, height: 36 },
  checkText: { fontSize: 17, color: C.ink },

  plans: { position: 'absolute', left: 833, top: 108, width: 823 },
  planHead: { fontSize: 31, lineHeight: 38, fontWeight: '700', color: C.navy },
  planSub: { marginTop: 8, fontSize: 17.9, lineHeight: 24, color: C.body },
  cards: { marginTop: 38, marginLeft: 3, flexDirection: 'row', gap: CARD_GAP },
  card: { height: 440, paddingTop: 14, paddingLeft: 22, paddingRight: 8, borderRadius: 18, borderWidth: 1, borderColor: Maple.blueSelected, backgroundColor: Maple.blueSoft, shadowColor: Maple.blueHover, shadowOpacity: 0.05, shadowRadius: 14, shadowOffset: { width: 0, height: 4 } },
  cardPopular: { borderWidth: 1.5, borderColor: C.goldLine, backgroundColor: C.goldSoft },
  popularAt: { position: 'absolute', top: -14, left: 0, right: 0, alignItems: 'center' },
  cardName: { marginTop: 0, fontSize: 23, lineHeight: 30, fontWeight: '700', color: C.navy },
  cardBlurb: { marginTop: 7, marginRight: -8, height: 40, fontSize: 14.6, lineHeight: 20, color: C.body },
  cardPrice: { marginTop: 16, fontSize: 23.8, lineHeight: 30, fontWeight: '700', color: C.navy },
  cardPer: { marginTop: 6, fontSize: 16.3, lineHeight: 22, color: C.body },
  features: { marginTop: 17 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 26.7, marginLeft: -3, marginRight: -6 },
  featureText: { flex: 1, fontSize: 12, color: C.ink },
  choose: { position: 'absolute', left: 20, right: 16, bottom: 19, height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 22, borderWidth: 1.5, borderColor: C.blue, backgroundColor: C.white },
  choosePopular: { overflow: 'hidden', borderWidth: 0, backgroundColor: C.blue },
  chooseText: { fontSize: 15, fontWeight: '600', color: C.blue },
  chooseCurrent: { borderColor: '#BBE5C8', backgroundColor: Maple.successSoft },
  chooseCurrentText: { color: C.green },
  choosePopularText: { color: C.white },


  mode: { position: 'absolute', left: 218, top: 734, width: 524, height: 120, flexDirection: 'row', alignItems: 'center', paddingLeft: 27, paddingRight: 28, borderRadius: 18, borderWidth: 1, borderColor: Maple.blueSelected, backgroundColor: Maple.blueSoft, shadowColor: Maple.blueHover, shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 3 } },
  modeText: { flex: 1, marginLeft: 29 },
  modeTitle: { fontSize: 22, lineHeight: 28, fontWeight: '700', color: C.navy },
  modeBody: { marginTop: 3, width: 330, fontSize: 16.3, lineHeight: 24, color: C.body },
  promises: { position: 'absolute', left: 793, top: 753, width: 853, height: 85, flexDirection: 'row' },
  promise: { flex: 1, flexDirection: 'row', gap: 16 },
  promiseLine: { paddingLeft: 22, borderLeftWidth: 1, borderLeftColor: Maple.border },
  promiseIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: Maple.blueSoft },
  promiseTitle: { marginTop: 9, fontSize: 15.7, lineHeight: 20, fontWeight: '700', color: C.navy },
  promiseBody: { marginTop: 5, width: 190, fontSize: 13.1, lineHeight: 20, color: C.body },

  accepts: { position: 'absolute', left: 218, top: 878, width: 1428, height: 82, flexDirection: 'row', alignItems: 'center', paddingLeft: 32, borderRadius: 18, borderWidth: 1, borderColor: Maple.blueSelected, backgroundColor: Maple.blueSoft },
  acceptsTitle: { width: 128, fontSize: 18, fontWeight: '700', color: C.navy },
  logos: { flexDirection: 'row', alignItems: 'center', gap: 30 },
  logo: { height: 48 },
  acceptsLine: { width: 1, height: 50, marginLeft: 71, backgroundColor: Maple.borderStrong },
  extension: { flexDirection: 'row', alignItems: 'center', marginLeft: 58, gap: 15 },
  extensionAsk: { fontSize: 19, fontWeight: '700', color: C.navy },
  extensionLink: { marginLeft: 12, fontSize: 17, fontWeight: '700', color: C.blue },
});
