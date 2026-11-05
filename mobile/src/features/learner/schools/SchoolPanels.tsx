import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { L } from '@/features/learner/frame/LightFrame';
import { toast } from '@/lib/toast';

import { LAVENDER, PURPLE, Tag, ugx } from './SchoolParts';
import type { Net, SN } from './useSchoolNetwork';

/** "Your Journey on Maple": discover, compare, apply, enrol. */
export function JourneyCard({ net }: { net: Net }) {
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>Your Journey on Maple</Text>
      <View style={s.journey}>
        {net.journey.map((j, i) => (
          <View key={j.title} style={s.journeyRow}>
            <View style={s.journeyIconCol}>
              <View style={s.roundIcon}>
                <Icon name={j.icon} size={18} color={PURPLE} />
              </View>
              {i < net.journey.length - 1 ? <View style={s.dots} /> : null}
            </View>
            <View style={s.flex}>
              <Text style={s.journeyTitle}>{j.title}</Text>
              <Text style={s.small}>{j.sub}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

/** A tinted card that opens another tab: exam centres or teaching vacancies. */
export function LinkCard({ title, sub, icon, tone, onPress }: { title: string; sub: string; icon: 'trophy' | 'briefcase'; tone: 'green' | 'purple'; onPress: () => void }) {
  const green = tone === 'green';
  return (
    <Pressable style={[s.link, green ? s.linkGreen : s.linkPurple]} onPress={onPress} accessibilityRole="button" accessibilityLabel={title}>
      <Icon name={icon} size={30} color={green ? '#15803D' : PURPLE} />
      <View style={s.flex}>
        <Text style={[s.linkTitle, { color: green ? '#14532D' : '#3B1E9C' }]}>{title}</Text>
        <Text style={s.small}>{sub}</Text>
      </View>
      <View style={[s.arrow, { backgroundColor: green ? '#D7F2E0' : '#E2DBFB' }]}>
        <Icon name="arrowRight" size={16} color={green ? '#15803D' : PURPLE} />
      </View>
    </Pressable>
  );
}

/** Institutional Pricing: the three plans and what every plan includes. */
export function PricingCard({ net, onCompare, phone = false, action = 'Compare Plans' }: { net: Net; onCompare: () => void; phone?: boolean; action?: string }) {
  return (
    <View style={s.card}>
      <View style={s.priceHead}>
        <Icon name="layers" size={30} color={PURPLE} />
        <View style={s.flex}>
          <Text style={s.cardTitle}>Institutional Pricing</Text>
          <Text style={s.small}>Run your complete digital school on Maple.</Text>
        </View>
      </View>
      <View style={s.plans}>
        {net.plans.map((p) => (
          <View key={p.id} style={[s.plan, p.popular && s.planOn]}>
            {p.popular ? <Text style={s.popular}>Most Popular</Text> : null}
            <Text style={s.planName}>{p.name}</Text>
            {p.from ? <Text style={s.small}>From</Text> : null}
            <Text style={[s.planPrice, phone && s.planPriceP]} numberOfLines={1}>
              {ugx(p.priceUGX)}
            </Text>
            <Text style={s.small}>per term</Text>
          </View>
        ))}
      </View>
      <View style={s.features}>
        {net.planFeatures.map((f) => (
          <View key={f} style={s.feature}>
            <Icon name="tick" size={14} color={L.green} />
            <Text style={s.featureText}>{f}</Text>
          </View>
        ))}
      </View>
      <Pressable style={s.compare} onPress={onCompare} accessibilityRole="button">
        <Text style={s.compareText}>{action}</Text>
      </Pressable>
    </View>
  );
}

/** Recommendations: each match with every reason it was suggested. */
export function RecsTab({ x }: { x: SN }) {
  return (
    <View style={s.stack}>
      <View style={s.card}>
        <Text style={s.cardTitle}>Recommended for you</Text>
        <Text style={s.small}>Matched on the curriculum, level, district, day or boarding, and programs you chose. Schools never see who they were recommended to.</Text>
        <Pressable style={s.outline} onPress={() => x.setFilters(true)} accessibilityRole="button">
          <Text style={s.outlineText}>Change my preferences</Text>
        </Pressable>
      </View>
      {x.recommended.length ? (
        x.recommended.map((c) => (
          <View key={c.id} style={[s.card, s.row]}>
            <Image source={c.crest} style={s.rowCrest} contentFit="contain" />
            <View style={s.flex}>
              <Text style={s.rowTitle}>{c.name}</Text>
              {x.reasons(c).map((r) => (
                <View key={r} style={s.feature}>
                  <Icon name="tick" size={13} color={L.green} />
                  <Text style={s.featureText}>{r}</Text>
                </View>
              ))}
            </View>
            <Pressable style={s.outline} onPress={() => x.setProfile(c.id)} accessibilityRole="button" accessibilityLabel={`View ${c.name} profile`}>
              <Text style={s.outlineText}>View Profile</Text>
            </Pressable>
          </View>
        ))
      ) : (
        <Text style={s.small}>No school matches your choices yet. Change your preferences or browse every school.</Text>
      )}
    </View>
  );
}

/** Exam centres: only Maple schools verified for their exam board, and whether they take external candidates. */
export function ExamsTab({ x }: { x: SN }) {
  return (
    <View style={s.stack}>
      <View style={s.card}>
        <Text style={s.cardTitle}>Approved exam centres</Text>
        <Text style={s.small}>Being on Maple does not make a school an exam centre: each centre here is verified for its board. The centre confirms your registration, not Maple.</Text>
      </View>
      {x.examCentres.map((c) => (
        <View key={c.id} style={[s.card, s.row]}>
          <Image source={c.crest} style={s.rowCrest} contentFit="contain" />
          <View style={s.flex}>
            <Text style={s.rowTitle}>{c.name}</Text>
            <Text style={s.small}>{`${c.town} · ${c.exam?.boards.join(', ')} · ${c.exam?.exams.join(' and ')}`}</Text>
            <Text style={s.small}>{c.exam?.external ? `Accepts external candidates · register by ${c.exam.deadline} · ${ugx(c.exam.feeUGX)}` : 'Registers its own learners only'}</Text>
          </View>
          {c.exam?.external ? (
            <Pressable style={s.outline} onPress={() => toast(`Inquiry sent to ${c.name}. They see only what you sent.`)} accessibilityRole="button" accessibilityLabel={`Ask ${c.name} about sitting exams`}>
              <Text style={s.outlineText}>Send Inquiry</Text>
            </Pressable>
          ) : null}
        </View>
      ))}
    </View>
  );
}

/** Teaching vacancies published by Maple schools; teachers stay private until they apply. */
export function VacanciesTab({ x }: { x: SN }) {
  return (
    <View style={s.stack}>
      <View style={s.card}>
        <Text style={s.cardTitle}>Teaching vacancies</Text>
        <Text style={s.small}>Schools can’t search for teachers or see who viewed a vacancy. They see your details only when you apply.</Text>
      </View>
      {x.net.vacancies.map((v) => {
        const c = x.byId(v.schoolId);
        return (
          <View key={v.id} style={[s.card, s.row]}>
            {c ? <Image source={c.crest} style={s.rowCrest} contentFit="contain" /> : null}
            <View style={s.flex}>
              <Text style={s.rowTitle}>{v.title}</Text>
              <Text style={s.small}>{`${c?.name ?? ''} · ${v.type} · closes ${v.closes}`}</Text>
              <View style={s.tags}>
                {v.subjects.map((t) => (
                  <Tag key={t} text={t} />
                ))}
              </View>
            </View>
            <Pressable style={s.outline} onPress={() => toast(`Application started for ${v.title}. Nothing is shared until you send it.`)} accessibilityRole="button" accessibilityLabel={`Apply for ${v.title}`}>
              <Text style={s.outlineText}>Apply</Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

/** For Institutions: what a school gets, and the plans. */
export function InstitutionsTab({ x, phone = false }: { x: SN; phone?: boolean }) {
  return (
    <View style={s.stack}>
      <View style={s.card}>
        <Text style={s.cardTitle}>Run your school on Maple</Text>
        <Text style={s.small}>Your own branded school: classes, live lessons, library, assessments, parents and full accounting. Listing in the School Network is included, with privacy-safe totals of views, saves and applications.</Text>
      </View>
      <PricingCard net={x.net} phone={phone} onCompare={x.openPricing} action="See everything a school gets" />
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  stack: { gap: 12 },
  card: { gap: 10, padding: 18, borderRadius: 16, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  cardTitle: { fontSize: 18.5, fontWeight: '700', color: L.navy },
  small: { fontSize: 12.5, lineHeight: 17, color: L.body },
  journey: { gap: 2 },
  journeyRow: { flexDirection: 'row', gap: 14 },
  journeyIconCol: { alignItems: 'center' },
  roundIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: LAVENDER },
  dots: { width: 0, height: 12, borderLeftWidth: 2, borderStyle: 'dotted', borderColor: '#C9C1F3' },
  journeyTitle: { marginTop: 2, fontSize: 14.5, fontWeight: '700', color: L.navy },
  link: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: 16, borderWidth: 1 },
  linkGreen: { borderColor: '#CDEFD8', backgroundColor: '#EEFAF2' },
  linkPurple: { borderColor: '#E2DBFB', backgroundColor: '#F4F1FE' },
  linkTitle: { fontSize: 16.5, fontWeight: '700' },
  arrow: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  priceHead: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  plans: { flexDirection: 'row', gap: 8, marginTop: 6 },
  plan: { flex: 1, alignItems: 'center', gap: 2, paddingTop: 16, paddingBottom: 12, paddingHorizontal: 2, borderRadius: 12, borderWidth: 1, borderColor: L.line },
  planOn: { borderWidth: 2, borderColor: PURPLE, backgroundColor: '#F6F3FF' },
  popular: { position: 'absolute', top: -10, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, fontSize: 10, fontWeight: '600', color: L.white, backgroundColor: PURPLE },
  planName: { marginBottom: 6, fontSize: 14.5, fontWeight: '700', color: L.navy },
  planPrice: { fontSize: 12.5, letterSpacing: -0.3, fontWeight: '700', color: L.navy },
  planPriceP: { fontSize: 11.5 },
  features: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 6, columnGap: 14 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 150 },
  featureText: { flexShrink: 1, fontSize: 12.5, color: L.ink },
  compare: { height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: PURPLE },
  compareText: { fontSize: 14.5, fontWeight: '600', color: L.white },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowCrest: { width: 44, height: 44 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: L.navy },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  outline: { paddingHorizontal: 14, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1.5, borderColor: PURPLE },
  outlineText: { fontSize: 13, fontWeight: '600', color: PURPLE },
});
