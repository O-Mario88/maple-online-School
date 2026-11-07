import { Image } from '@/components/picture';
import { LinearGradient } from 'expo-linear-gradient';
import { type Href, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import type { PlanVersion } from '@/features/school/subscription/plans';
import type { IconName } from '@/lib/icons';
import type { MockData } from '@/mock';
import { Maple, Radii } from '@/constants/maple';
import { PAGE_TITLE } from '@/lib/fonts/type';

type Admin = MockData['schoolAdmin'];
export type PricingData = Pick<Admin, 'comparison' | 'institutionPricing' | 'planCards' | 'planVersions'>;

const NAVY = Maple.navyDeep;
const INK = Maple.navy;
const BODY = Maple.body;
const MUTED = Maple.faint;
const BLUE = Maple.blue;
const BRAND_BLUE = Maple.blue;
const BRAND_SOFT = Maple.blueSoft;
const LINE = Maple.blueSelected;
const GREEN = Maple.successText;
const WHITE = Maple.surface;

type Tab = 'compare' | 'features' | 'how' | 'faqs';
const TABS: readonly { key: Tab; label: string; icon: IconName }[] = [
  { key: 'compare', label: 'Compare Plans', icon: 'columns' },
  { key: 'features', label: 'Full Features', icon: 'list' },
  { key: 'how', label: 'How It Works', icon: 'clock' },
  { key: 'faqs', label: 'FAQs', icon: 'help' },
];

const ugx = (n: number) => `UGX ${n.toLocaleString('en-US')}`;
/** A plan button starts school onboarding with the plan chosen; nothing is activated or charged here. */
const choose = (planId: string) => router.push(`/admin/onboarding?plan=${planId}` as Href);
const startSchool = () => router.push('/admin/onboarding' as Href);

function Hero({ d, phone = false }: { d: PricingData; phone?: boolean }) {
  const p = d.institutionPricing;
  return (
    <View style={phone ? s.heroP : s.hero}>
      <View style={s.eyebrow}>
        <Icon name="building" size={15} color={BRAND_BLUE} />
        <Text style={s.eyebrowText}>{p.eyebrow}</Text>
      </View>
      <Text style={[s.title, phone && s.titleP]} {...PAGE_TITLE}>
        {p.title}
      </Text>
      <Text style={s.lede}>{p.sub}</Text>
      <View style={s.ctas}>
        <Pressable style={s.ctaPrimary} onPress={startSchool} accessibilityRole="button">
          <Text style={s.ctaPrimaryText}>Start Your School</Text>
          <Icon name="arrowRight" size={16} color={WHITE} />
        </Pressable>
        <Pressable style={s.ctaGhost} onPress={() => router.push('/schools' as Href)} accessibilityRole="link">
          <Icon name="playFill" size={14} color={NAVY} />
          <Text style={s.ctaGhostText}>Explore the Platform</Text>
        </Pressable>
      </View>
      <View style={s.trust}>
        {p.trust.map((t, i) => (
          <View key={t.label} style={[s.trustItem, i > 0 && s.trustLine]}>
            <Icon name={t.icon} size={22} color={BLUE} />
            <Text style={s.trustText}>{t.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function PlanCardView({ card, plan, phone = false }: { card: PricingData['planCards'][number]; plan: PlanVersion; phone?: boolean }) {
  return (
    <View style={[s.plan, phone ? null : s.planD, card.popular && s.planOn]}>
      {card.popular ? <Text style={s.popular}>Most Popular</Text> : null}
      <View style={s.planHead}>
        <Icon name={card.icon} size={26} color={BRAND_BLUE} />
        <View style={s.flex}>
          <Text style={s.planName}>{plan.name}</Text>
          <Text style={s.planTag}>{card.tagline}</Text>
        </View>
      </View>
      <Text style={s.price}>{ugx(plan.priceUGX)}</Text>
      <Text style={s.per}>per term</Text>
      <View style={s.cap}>
        <Icon name="people" size={14} color={BRAND_BLUE} />
        <Text style={s.capText}>{`Up to ${plan.learners.toLocaleString('en-US')} learners`}</Text>
      </View>
      {card.lead ? <Text style={s.lead}>{card.lead}</Text> : null}
      <View style={s.features}>
        {card.features.map((f) => (
          <View key={f} style={s.feature}>
            <Icon name="tick" size={13} color={GREEN} />
            <Text style={s.featureText}>{f}</Text>
          </View>
        ))}
      </View>
      <View style={s.flex} />
      <Pressable style={card.popular ? s.choosePrimary : s.choose} onPress={() => choose(plan.planId)} accessibilityRole="button" accessibilityLabel={`${card.cta}: ${plan.name}, ${ugx(plan.priceUGX)} per term`}>
        <Text style={card.popular ? s.chooseTextOn : s.chooseText}>{card.cta}</Text>
      </Pressable>
    </View>
  );
}

function Plans({ d, phone = false }: { d: PricingData; phone?: boolean }) {
  return (
    <View style={phone ? s.plansP : s.plans}>
      {d.planCards.map((c) => {
        const plan = d.planVersions.find((p) => p.planId === c.planId);
        return plan ? <PlanCardView key={c.planId} card={c} plan={plan} phone={phone} /> : null;
      })}
    </View>
  );
}

function Advantage({ d, phone = false }: { d: PricingData; phone?: boolean }) {
  const p = d.institutionPricing;
  return (
    <View style={[s.adv, phone ? null : s.advD]}>
      <Text style={s.advTitle}>The Maple Advantage</Text>
      {p.advantage.map((a) => (
        <View key={a.title} style={s.advRow}>
          <View style={s.advIcon}>
            <Icon name={a.icon} size={20} color={BRAND_BLUE} />
          </View>
          <View style={s.flex}>
            <Text style={s.advRowTitle}>{a.title}</Text>
            <Text style={s.small}>{a.sub}</Text>
          </View>
        </View>
      ))}
      <Image source={p.campus} style={[s.campus, phone && s.campusP]} contentFit="cover" accessibilityLabel="A Maple-powered school campus" />
    </View>
  );
}

function Pillars({ d, phone = false }: { d: PricingData; phone?: boolean }) {
  return (
    <View style={[s.pillars, phone && s.pillarsP]}>
      <View style={phone ? undefined : s.pillarsText}>
        <Text style={s.pillarsTitle}>More Than School Software</Text>
        <Text style={s.small}>Maple brings together everything your school needs in one connected platform.</Text>
      </View>
      <View style={s.pillarRow}>
        {d.institutionPricing.pillars.map((x) => (
          <View key={x.label} style={[s.pillar, phone && s.pillarP]}>
            <Icon name={x.icon} size={24} color={BRAND_BLUE} />
            <Text style={s.pillarText}>{x.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Cell({ v }: { v: boolean | string }) {
  if (v === true) return <Icon name="tick" size={16} color={GREEN} />;
  if (v === false) return <Text style={s.dash}>—</Text>;
  return <Text style={s.cellText}>{v}</Text>;
}

/** The complete comparison, one expandable category at a time. */
function Compare({ d, phone }: { d: PricingData; phone: boolean }) {
  const [open, setOpen] = useState<readonly string[]>([d.comparison[0].title]);
  const toggle = (t: string) => setOpen(open.includes(t) ? open.filter((x) => x !== t) : [...open, t]);
  return (
    <View style={s.table}>
      <View style={[s.tr, s.th]}>
        <Text style={[s.thText, s.featureCol]}>Feature</Text>
        {d.planVersions.map((p) => (
          <Text key={p.planId} style={[s.thText, s.planCol, phone && s.planColP]}>
            {phone ? p.name.replace('Maple ', '') : p.name}
          </Text>
        ))}
      </View>
      {d.comparison.map((c) => {
        const on = open.includes(c.title);
        return (
          <View key={c.title}>
            <Pressable style={s.cat} onPress={() => toggle(c.title)} accessibilityRole="button" accessibilityState={{ expanded: on }}>
              <Text style={s.catText}>{c.title}</Text>
              <Icon name={on ? 'chevronDown' : 'chevronRight'} size={16} color={NAVY} />
            </Pressable>
            {on
              ? c.rows.map(([label, ...cells]) => (
                  <View key={label} style={s.tr}>
                    <Text style={[s.rowText, s.featureCol]}>{label}</Text>
                    {cells.map((v, i) => (
                      <View key={d.planVersions[i].planId} style={[s.planCol, phone && s.planColP]}>
                        <Cell v={v} />
                      </View>
                    ))}
                  </View>
                ))
              : null}
          </View>
        );
      })}
    </View>
  );
}

function Features({ d, phone }: { d: PricingData; phone: boolean }) {
  const p = d.institutionPricing;
  return (
    <View style={[s.split, phone && s.splitP]}>
      <View style={s.panel}>
        <Text style={s.panelTitle}>One platform instead of many systems</Text>
        {p.oneOf.map((x) => (
          <View key={x} style={s.feature}>
            <Icon name="tick" size={15} color={GREEN} />
            <Text style={s.panelText}>{x}</Text>
          </View>
        ))}
      </View>
      <View style={s.panel}>
        <Text style={s.panelTitle}>Grow with the School Network</Text>
        <Text style={s.small}>Every subscribed, verified school can be discovered by independent Maple learners and teachers.</Text>
        {p.network.map((x) => (
          <View key={x} style={s.feature}>
            <Icon name="tick" size={15} color={GREEN} />
            <Text style={s.panelText}>{x}</Text>
          </View>
        ))}
        <Text style={s.note}>Families and teachers browse privately: your school sees totals, and contact details only when someone asks you to get in touch. Maple never promises admissions.</Text>
      </View>
    </View>
  );
}

function How({ d, phone }: { d: PricingData; phone: boolean }) {
  return (
    <View style={[s.steps, phone && s.stepsP]}>
      {d.institutionPricing.steps.map((x, i) => (
        <View key={x.title} style={[s.stepCard, phone ? null : s.stepD]}>
          <Text style={s.stepNum}>{i + 1}</Text>
          <Text style={s.panelTitle}>{x.title}</Text>
          <Text style={s.small}>{x.sub}</Text>
        </View>
      ))}
    </View>
  );
}

function Faqs({ d }: { d: PricingData }) {
  const [open, setOpen] = useState<string | null>(d.institutionPricing.faqs[0].q);
  return (
    <View style={s.faqs}>
      {d.institutionPricing.faqs.map((f) => {
        const on = open === f.q;
        return (
          <View key={f.q} style={s.faq}>
            <Pressable style={s.faqHead} onPress={() => setOpen(on ? null : f.q)} accessibilityRole="button" accessibilityState={{ expanded: on }}>
              <Text style={s.faqQ}>{f.q}</Text>
              <Icon name={on ? 'minus' : 'plus'} size={16} color={NAVY} />
            </Pressable>
            {on ? <Text style={s.faqA}>{f.a}</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

function FinalCta({ phone }: { phone: boolean }) {
  return (
    <View style={[s.final, phone && s.finalP]}>
      <LinearGradient colors={[Maple.blueSoft, Maple.blueSoft]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={s.flex}>
        <Text style={[s.finalTitle, phone && s.finalTitleP]}>Your School. Your Identity. Powered by Maple.</Text>
        <Text style={s.small}>Start with any plan; every plan is a complete digital school.</Text>
      </View>
      <View style={s.ctas}>
        <Pressable style={s.ctaPrimary} onPress={startSchool} accessibilityRole="button">
          <Text style={s.ctaPrimaryText}>Launch Your Digital School</Text>
        </Pressable>
        <Pressable style={s.ctaGhost} onPress={() => router.push('/help' as Href)} accessibilityRole="link">
          <Text style={s.ctaGhostText}>Talk to Maple</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** Compare Plans, Full Features, How It Works and FAQs, one at a time, then the closing call to action. */
export function PricingDetails({ d, phone = false }: { d: PricingData; phone?: boolean }) {
  const [tab, setTab] = useState<Tab>('compare');
  return (
    <View style={[s.details, phone && s.detailsP]}>
      <View style={[s.tabs, phone && s.tabsP]} accessibilityRole="tablist">
        {TABS.map((t) => {
          const on = tab === t.key;
          return (
            <Pressable key={t.key} style={s.tab} onPress={() => setTab(t.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
              <Icon name={t.icon} size={16} color={on ? BLUE : INK} />
              <Text style={[s.tabText, on && s.tabOn]}>{t.label}</Text>
              {on ? <View style={s.tabLine} /> : null}
            </Pressable>
          );
        })}
      </View>
      {tab === 'compare' ? <Compare d={d} phone={phone} /> : null}
      {tab === 'features' ? <Features d={d} phone={phone} /> : null}
      {tab === 'how' ? <How d={d} phone={phone} /> : null}
      {tab === 'faqs' ? <Faqs d={d} /> : null}
      <FinalCta phone={phone} />
    </View>
  );
}

/** The top of the page on wide screens: hero, the three plans, The Maple Advantage, and the platform strip. */
export function PricingTop({ d }: { d: PricingData }) {
  return (
    <View style={s.top}>
      <LinearGradient colors={[Maple.blueSoft, Maple.blueSoft]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={s.swoosh} />
      <Image source={d.institutionPricing.hero} style={s.heroPhoto} contentFit="cover" accessibilityLabel="Teachers and learners using Maple" />
      <View style={s.topRow}>
        <Hero d={d} />
        <View style={s.middle}>
          <Plans d={d} />
          <Pillars d={d} />
        </View>
        <Advantage d={d} />
      </View>
    </View>
  );
}

/** The top of the page on phones, stacked. */
export function PricingTopPhone({ d }: { d: PricingData }) {
  return (
    <View style={s.topP}>
      <Hero d={d} phone />
      <Image source={d.institutionPricing.hero} style={s.heroPhotoP} contentFit="cover" accessibilityLabel="Teachers and learners using Maple" />
      <Plans d={d} phone />
      <Advantage d={d} phone />
      <Pillars d={d} phone />
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  small: { fontSize: 12.5, lineHeight: 17, color: BODY },
  top: { overflow: 'hidden', paddingTop: 22, paddingBottom: 18, paddingHorizontal: 36 },
  swoosh: { position: 'absolute', left: 150, top: 430, width: 420, height: 420, borderRadius: 210, backgroundColor: Maple.blueSelected },
  heroPhoto: { position: 'absolute', left: 250, top: 452, width: 255, height: 232, borderTopLeftRadius: 120 },
  topRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  hero: { width: 460, gap: 14, paddingTop: 8 },
  heroP: { gap: 14 },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: BRAND_SOFT },
  eyebrowText: { fontSize: 12.5, fontWeight: '600', color: NAVY },
  title: { fontSize: 31, lineHeight: 36, fontWeight: '800', letterSpacing: -0.6, color: NAVY },
  titleP: { fontSize: 26, lineHeight: 31 },
  lede: { fontSize: 14.5, lineHeight: 21, color: INK },
  ctas: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  ctaPrimary: { height: 42, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 22, borderRadius: Radii.control, backgroundColor: BLUE },
  ctaPrimaryText: { fontSize: 14.5, fontWeight: '600', color: WHITE },
  ctaGhost: { height: 42, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, borderRadius: Radii.control, borderWidth: 1.5, borderColor: Maple.blueLine, backgroundColor: WHITE },
  ctaGhostText: { fontSize: 14.5, fontWeight: '600', color: NAVY },
  trust: { flexDirection: 'row', marginTop: 18 },
  trustItem: { alignItems: 'center', gap: 6, paddingHorizontal: 12 },
  trustLine: { borderLeftWidth: 1, borderLeftColor: LINE },
  trustText: { fontSize: 11.5, color: INK },
  middle: { width: 690, gap: 14 },
  plans: { flexDirection: 'row', gap: 10, alignItems: 'stretch' },
  plansP: { gap: 14 },
  plan: { gap: 6, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE, shadowColor: NAVY, shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
  planD: { flex: 1, minHeight: 350 },
  planOn: { borderWidth: 1.5, borderColor: Maple.blueLine, backgroundColor: Maple.blueSoft },
  popular: { position: 'absolute', top: -11, alignSelf: 'center', overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 3, borderRadius: 8, fontSize: 11, fontWeight: '600', color: WHITE, backgroundColor: BRAND_BLUE },
  planHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  planName: { fontSize: 16, fontWeight: '700', color: NAVY },
  planTag: { marginTop: 2, fontSize: 11.5, lineHeight: 15, color: BODY },
  price: { marginTop: 8, fontSize: 21, fontWeight: '800', color: NAVY },
  per: { fontSize: 12, color: BODY },
  cap: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, backgroundColor: BRAND_SOFT },
  capText: { fontSize: 12, fontWeight: '600', color: Maple.blueHover },
  lead: { marginTop: 4, fontSize: 12, fontWeight: '600', color: NAVY },
  features: { gap: 5, marginTop: 4 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  featureText: { flexShrink: 1, fontSize: 11.5, color: INK },
  choose: { height: 34, alignItems: 'center', justifyContent: 'center', marginTop: 10, borderRadius: 17, borderWidth: 1.5, borderColor: Maple.blueLine },
  chooseText: { fontSize: 13, fontWeight: '600', color: BLUE },
  choosePrimary: { height: 34, alignItems: 'center', justifyContent: 'center', marginTop: 10, borderRadius: Radii.control, backgroundColor: BRAND_BLUE },
  chooseTextOn: { fontSize: 13, fontWeight: '600', color: WHITE },
  adv: { gap: 12, overflow: 'hidden', paddingTop: 16, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  advD: { flex: 1 },
  advTitle: { fontSize: 17, fontWeight: '800', color: NAVY },
  advRow: { flexDirection: 'row', gap: 12 },
  advIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: BRAND_SOFT },
  advRowTitle: { fontSize: 12.5, fontWeight: '700', color: NAVY },
  campus: { height: 150, marginHorizontal: -16, marginTop: 4 },
  campusP: { height: 130 },
  pillars: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  pillarsP: { flexDirection: 'column', alignItems: 'stretch' },
  pillarsText: { width: 210 },
  pillarsTitle: { fontSize: 15.5, fontWeight: '800', color: NAVY },
  pillarRow: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  pillar: { width: 62, alignItems: 'center', gap: 5 },
  pillarP: { width: '30%' },
  pillarText: { fontSize: 10.5, lineHeight: 13, color: INK, textAlign: 'center' },
  details: { gap: 18, paddingHorizontal: 36, paddingTop: 14, paddingBottom: 40 },
  detailsP: { paddingHorizontal: 0, paddingTop: 0 },
  tabs: { flexDirection: 'row', alignSelf: 'center', gap: 14, borderBottomWidth: 1, borderBottomColor: LINE },
  tabsP: { alignSelf: 'stretch', flexWrap: 'wrap', gap: 4 },
  tab: { height: 44, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12 },
  tabText: { fontSize: 13.5, color: INK },
  tabOn: { fontWeight: '700', color: BLUE },
  tabLine: { position: 'absolute', left: 4, right: 4, bottom: -1, height: 3, borderRadius: 2, backgroundColor: BLUE },
  table: { overflow: 'hidden', borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  tr: { flexDirection: 'row', alignItems: 'center', minHeight: 42, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: Maple.blueSelected },
  th: { borderTopWidth: 0, backgroundColor: Maple.blueSoft },
  thText: { fontSize: 13, fontWeight: '700', color: NAVY },
  featureCol: { flex: 1, paddingRight: 8 },
  planCol: { width: 180, alignItems: 'center', textAlign: 'center' },
  planColP: { width: 64 },
  cat: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: LINE, backgroundColor: Maple.blueSoft },
  catText: { flex: 1, fontSize: 14, fontWeight: '700', color: NAVY },
  rowText: { fontSize: 13, color: INK },
  cellText: { fontSize: 12.5, fontWeight: '600', color: NAVY, textAlign: 'center' },
  dash: { fontSize: 14, color: MUTED },
  split: { flexDirection: 'row', gap: 16 },
  splitP: { flexDirection: 'column' },
  panel: { flex: 1, gap: 10, padding: 20, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  panelTitle: { fontSize: 16, fontWeight: '700', color: NAVY },
  panelText: { flexShrink: 1, fontSize: 13.5, color: INK },
  note: { marginTop: 4, fontSize: 12.5, lineHeight: 17, color: BODY },
  steps: { flexDirection: 'row', gap: 14 },
  stepsP: { flexDirection: 'column' },
  stepCard: { gap: 6, padding: 18, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  stepD: { flex: 1 },
  stepNum: { width: 30, height: 30, overflow: 'hidden', borderRadius: 15, fontSize: 14, fontWeight: '700', lineHeight: 30, textAlign: 'center', color: WHITE, backgroundColor: BLUE },
  faqs: { gap: 8 },
  faq: { borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  faqHead: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, paddingHorizontal: 16 },
  faqQ: { flex: 1, fontSize: 14, fontWeight: '600', color: NAVY },
  faqA: { paddingHorizontal: 16, paddingBottom: 14, fontSize: 13.5, lineHeight: 20, color: INK },
  final: { flexDirection: 'row', alignItems: 'center', gap: 20, overflow: 'hidden', padding: 26, borderRadius: 16, borderWidth: 1, borderColor: LINE },
  finalP: { flexDirection: 'column', alignItems: 'stretch', padding: 20 },
  finalTitle: { fontSize: 22, fontWeight: '800', color: NAVY },
  finalTitleP: { fontSize: 19 },
  topP: { gap: 16 },
  heroPhotoP: { width: '100%', height: 200, borderRadius: 16 },
});
