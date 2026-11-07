import { type Href, router } from 'expo-router';
import { type ReactNode, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { L } from '@/features/learner/frame/LightFrame';
import { useAccess } from '@/lib/access/access-context';
import { mockData } from '@/lib/mock';
import { todayISO } from '@/lib/today';
import type { Career } from '@/mock/career-compass';

import { exploreFromStrengths, fieldList, programStatus, subjectLinks } from './careers';
import { cs, BRAND_SOFT, BRAND_BLUE } from './CareerParts';
import { CareerSheet } from './CareerSheets';
import { addAction, seedSaves, toggleCareer, useCareerSaves } from './saved';

/**
 * The career layer inside ordinary learner pages: one data source and one career sheet, so the
 * Dashboard, Study Plan, subject pages and Progress all give the same advice. Basic learners see
 * general links; Pro and Premium see links from their own interests. Premium opens Career Compass.
 */
function useCareerLayer() {
  const cc = useMemo(() => mockData()?.learner.careerCompass ?? null, []);
  const { hasFeature } = useAccess();
  const [open, setOpen] = useState<string | null>(null);
  if (cc) seedSaves({ ...cc.saved, actions: cc.actions, events: cc.registrations });
  const saves = useCareerSaves();
  const today = todayISO();
  const career = cc?.careers.find((c) => c.id === open);
  const sheet =
    cc && career ? (
      <CareerSheet
        c={career}
        programs={cc.programs.filter((p) => career.programIds.includes(p.id))}
        uni={(id) => cc.universities.find((u) => u.id === id)}
        status={(p) => programStatus(p.accreditation, today)}
        saved={saves.careers.includes(career.id)}
        onSave={() => toggleCareer(career.id)}
        onPlan={() => {
          if (!saves.careers.includes(career.id)) toggleCareer(career.id);
          addAction({ id: `a-${career.id}-${Date.now()}`, text: `Explore the ${career.title} pathway`, due: today, done: false });
          setOpen(null);
          router.push((hasFeature('careerCompass') ? '/learn/plan?tab=career' : '/plans?need=premium') as Href);
        }}
        onProgram={(p) => router.push(`/universities/${p.universityId}` as Href)}
        onClose={() => setOpen(null)}
      />
    ) : null;
  return { cc, personal: hasFeature('careerPersonal'), compass: hasFeature('careerCompass'), openCareer: setOpen, sheet };
}

function Frame({ title, icon, children, footer }: { title: string; icon: 'compass' | 'target' | 'map' | 'trophy' | 'sparkle'; children: ReactNode; footer?: ReactNode }) {
  return (
    <View style={s.card}>
      <View style={s.head}>
        <View style={s.headIcon}>
          <Icon name={icon === 'compass' ? 'map' : icon} size={16} color={BRAND_BLUE} />
        </View>
        <Text style={s.title}>{title}</Text>
      </View>
      {children}
      {footer}
    </View>
  );
}

function CareerChips({ careers, onOpen }: { careers: readonly Career[]; onOpen: (id: string) => void }) {
  return (
    <View style={s.chips}>
      {careers.slice(0, 4).map((c) => (
        <Pressable key={c.id} style={s.chip} onPress={() => onOpen(c.id)} accessibilityRole="button" accessibilityLabel={`Explore ${c.title}`}>
          <Icon name={c.icon} size={13} color={BRAND_BLUE} />
          <Text style={s.chipText}>{c.title}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** One gentle next step: Premium learners open Career Compass; others see what Premium adds. */
function NextStep({ compass }: { compass: boolean }) {
  return compass ? (
    <Pressable style={s.link} onPress={() => router.push('/learn/careers' as Href)} accessibilityRole="link">
      <Text style={s.linkText}>Open My Career Compass</Text>
      <Icon name="arrowRight" size={14} color={L.blue} />
    </Pressable>
  ) : (
    <View style={s.links}>
      <Pressable style={s.link} onPress={() => router.push('/universities' as Href)} accessibilityRole="link">
        <Text style={s.linkText}>Browse universities and programs</Text>
        <Icon name="arrowRight" size={14} color={L.blue} />
      </Pressable>
      <Pressable onPress={() => router.push('/plans?need=premium' as Href)} accessibilityRole="link">
        <Text style={cs.note}>Unlock Career Compass with Premium to build your personalized roadmap and speak with a verified career counselor.</Text>
      </Pressable>
    </View>
  );
}

/** Dashboard: "Your Future Path", from the learner's interests (Pro and Premium) or a subject they study (Basic). */
export function FuturePathCard() {
  const x = useCareerLayer();
  if (!x.cc) return null;
  const subject = x.personal ? (x.cc.answers.strengths[0] ?? x.cc.learner.subjects[0]) : x.cc.learner.subjects[2] ?? x.cc.learner.subjects[0];
  const links = subjectLinks(x.cc.careers, subject);
  if (!links.careers.length) return null;
  return (
    <Frame title="Your Future Path" icon="compass" footer={<NextStep compass={x.compass} />}>
      <Text style={cs.body}>{`${x.personal ? 'Your interest in' : 'What you learn in'} ${links.sentence.replace(/^\w+/, subject)}`}</Text>
      <CareerChips careers={links.careers} onOpen={x.openCareer} />
      {x.sheet}
    </Frame>
  );
}

/** Study Plan: "How This Supports Your Goals", linking the plan's subjects to careers (richer on higher plans). */
/** `onCareerPath` opens My Plan's Career Path tab when the card sits in My Plan. */
export function SupportsGoalsCard({ subjects, onCareerPath }: { subjects: readonly string[]; onCareerPath?: () => void }) {
  const x = useCareerLayer();
  if (!x.cc) return null;
  const goals = x.cc.careers.filter((c) => x.cc?.saved.careers.includes(c.id));
  const rows = subjects
    .map((sub) => ({ sub, links: subjectLinks(x.cc?.careers ?? [], sub) }))
    .filter((r) => r.links.careers.length)
    .slice(0, x.personal ? 4 : 2);
  return (
    <Frame title="How This Supports Your Goals" icon="target" footer={<NextStep compass={x.compass} />}>
      {x.personal && goals.length ? <Text style={cs.body}>{`You’re exploring ${goals.map((g) => g.title).join(' and ')}. Here’s how this plan helps:`}</Text> : null}
      {rows.map((r) => (
        <View key={r.sub} style={s.line}>
          <Text style={s.subject}>{r.sub}</Text>
          <Text style={[cs.small, s.flex]}>{x.personal ? `${r.links.sentence} Routes include ${r.links.careers[0].pathways.map((p) => p.level.toLowerCase()).join(', ')}.` : r.links.sentence}</Text>
        </View>
      ))}
      <CareerChips careers={goals.length && x.personal ? goals : (rows[0]?.links.careers ?? [])} onOpen={x.openCareer} />
      {onCareerPath ? (
        <Pressable style={s.link} onPress={onCareerPath} accessibilityRole="link">
          <Text style={s.linkText}>See your Career Path</Text>
          <Icon name="arrowRight" size={14} color={L.blue} />
        </Pressable>
      ) : null}
      {x.sheet}
    </Frame>
  );
}

/** Subject page: "Where This Subject Can Take You", with related careers and programs that teach them. */
export function WhereSubjectLeads({ subject }: { subject: string }) {
  const x = useCareerLayer();
  if (!x.cc) return null;
  const links = subjectLinks(x.cc.careers, subject);
  if (!links.careers.length) return null;
  const ids = links.careers.flatMap((c) => c.programIds);
  const programs = x.cc.programs.filter((p) => ids.includes(p.id)).slice(0, 3);
  return (
    <Frame title="Where This Subject Can Take You" icon="map" footer={<NextStep compass={x.compass} />}>
      <Text style={cs.body}>{links.sentence}</Text>
      <CareerChips careers={links.careers} onOpen={x.openCareer} />
      {programs.map((p) => (
        <Pressable key={p.id} style={s.line} onPress={() => router.push(`/universities/${p.universityId}` as Href)} accessibilityRole="link">
          <Icon name="cap" size={14} color={L.body} />
          <Text style={[cs.small, s.flex]}>{`${p.title} · ${x.cc?.universities.find((u) => u.id === p.universityId)?.name}`}</Text>
        </Pressable>
      ))}
      {x.sheet}
    </Frame>
  );
}

/** Progress: strengths open doors to explore, and the subjects to grow next. Ideas, never predictions. */
export function StrengthsToExplore({ strong }: { strong: readonly string[] }) {
  const x = useCareerLayer();
  if (!x.cc) return null;
  const r = exploreFromStrengths(x.cc.careers, strong);
  if (!r.fields.length) return null;
  return (
    <Frame title="Your Strengths Open Doors" icon="sparkle" footer={<NextStep compass={x.compass} />}>
      <Text style={cs.body}>{`Doing well in ${strong.join(' and ')} is useful in ${fieldList(r.fields)}.`}</Text>
      {r.growNext.length ? <Text style={cs.small}>{`Skills to grow next: ${r.growNext.slice(0, 3).join(', ')}.`}</Text> : null}
      <CareerChips careers={r.careers} onOpen={x.openCareer} />
      <Text style={cs.note}>These are ideas to explore. Your future isn’t decided by today’s marks.</Text>
      {x.sheet}
    </Frame>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  card: { gap: 10 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headIcon: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: BRAND_SOFT },
  title: { fontSize: 16, fontWeight: '700', color: L.navy },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: BRAND_SOFT },
  chipText: { fontSize: 12.5, fontWeight: '600', color: BRAND_BLUE },
  line: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  subject: { width: 92, fontSize: 12.5, fontWeight: '700', color: L.navy },
  links: { gap: 6 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  linkText: { fontSize: 13, fontWeight: '600', color: L.blue },
});
