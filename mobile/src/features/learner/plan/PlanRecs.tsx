import type { Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Chips } from '@/features/learner/careers/CareerParts';
import { L } from '@/features/learner/frame/LightFrame';
import { ChalkThumb, LessonStats } from '@/features/learner/lessons/LessonParts';
import type { IconName } from '@/lib/icons';

import { Card, k, LAV, Pill, BRAND_BLUE, SubjectIcon } from './PlanKit';
import type { PlanState } from './PlanViews';
import { focusLabel } from './schedule';
import { Maple, Radii } from '@/constants/maple';

type Kind = 'All' | 'Lessons' | 'Practice' | 'Revision';
const KINDS: readonly Kind[] = ['All', 'Lessons', 'Practice', 'Revision'];
const ACTION: Readonly<Record<'lesson' | 'practice' | 'review', { label: string; icon: IconName }>> = {
  lesson: { label: 'Start Lesson', icon: 'playFill' },
  practice: { label: 'Get Practice', icon: 'edit' },
  review: { label: 'Plan Review', icon: 'calendar' },
};
const FOCUS_TONE = { 'Needs Attention': 'orange', 'Improve Further': 'purple', 'Keep Building': 'green' } as const;

function Banner({ p, phone }: { p: PlanState; phone: boolean }) {
  return (
    <View style={[s.banner, phone && s.bannerP]}>
      <View style={s.bannerIcon}>
        <Icon name="sparkle" size={28} color={L.white} />
      </View>
      <View style={k.flex}>
        <Text style={s.bannerTitle}>Recommendations made for you</Text>
        <Text style={s.bannerSub}>{`Based on your progress toward “${p.goal}”, here’s what will help most this week.`}</Text>
      </View>
      <Pressable style={s.bannerBtn} onPress={() => p.setTab('schedule')} accessibilityRole="button">
        <Icon name="calendar" size={16} color={BRAND_BLUE} />
        <Text style={s.bannerBtnText}>View my schedule</Text>
      </Pressable>
    </View>
  );
}

function NextSteps({ p }: { p: PlanState }) {
  return (
    <Card title="What to Do Next" icon="target" sub="Small steps from where you are now.">
      {p.plan.tips.map((t, i) => {
        const sub = p.subjects.find((x) => x.name === t.subject);
        const a = ACTION[t.action];
        return (
          <View key={t.id} style={[s.next, i > 0 && s.divider]}>
            <Text style={s.num}>{i + 1}</Text>
            {sub ? <SubjectIcon icon={sub.icon} tint={sub.tint} size={38} /> : null}
            <View style={s.nextText}>
              <Text style={s.title}>{t.title}</Text>
              <Text style={k.small}>{t.sub}</Text>
            </View>
            <Pressable
              style={s.actionBtn}
              onPress={() => p.go(t.href)}
              accessibilityRole="button"
              accessibilityLabel={`${a.label}: ${t.title}`}>
              <Icon name={a.icon} size={13} color={BRAND_BLUE} />
              <Text style={s.actionText}>{a.label}</Text>
            </Pressable>
          </View>
        );
      })}
    </Card>
  );
}

function ForYou({ p, phone }: { p: PlanState; phone: boolean }) {
  const [kind, setKind] = useState<Kind>('All');
  const shown = p.recommended.filter((l) => kind === 'All' || p.plan.picks[l.id] === kind);
  return (
    <Card
      title="Recommended for You"
      icon="play"
      sub="Lessons, practice and revision picked from your progress."
      right={
        <Pressable onPress={() => p.go('/learn/lessons')} accessibilityRole="link">
          <Text style={s.seeAll}>See All</Text>
        </Pressable>
      }>
      <Chips options={KINDS} on={[kind]} onPress={(v) => setKind(v as Kind)} />
      {shown.length ? (
        <View style={s.videos}>
          {shown.map((l) => (
            <Pressable
              key={l.id}
              style={[s.video, phone && s.videoP]}
              onPress={() => p.openLesson(l)}
              accessibilityRole="button"
              accessibilityLabel={`${l.title}, ${l.subject}`}>
              <ChalkThumb l={l} height={110} />
              <View style={s.videoBody}>
                {p.plan.picks[l.id] ? <Pill text={p.plan.picks[l.id]} tone="purple" /> : null}
                <Text style={s.title} numberOfLines={2}>
                  {l.title}
                </Text>
                <Text style={k.small}>{`${l.subject}  •  ${Math.round(l.seconds / 60)} min`}</Text>
                <LessonStats l={l} size={11} />
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <Text style={k.small}>{`No ${kind.toLowerCase()} picks this week. Try another filter.`}</Text>
      )}
    </Card>
  );
}

function StudyFocus({ p }: { p: PlanState }) {
  const sorted = [...p.subjects].sort((a, b) => a.progress - b.progress);
  return (
    <Card title="Your Study Focus" icon="target" sub="Lowest progress first.">
      {sorted.map((x) => {
        const label = focusLabel(x.progress);
        return (
          <Pressable
            key={x.name}
            style={s.focus}
            onPress={() => p.openSubject(x.name)}
            accessibilityRole="button"
            accessibilityLabel={`${x.name}, ${Math.round(x.progress * 100)}%, ${label}`}>
            <SubjectIcon icon={x.icon} tint={x.tint} size={34} />
            <View style={k.flex}>
              <Text style={s.title}>{x.name}</Text>
              <Text style={k.small}>{`${Math.round(x.progress * 100)}% complete`}</Text>
            </View>
            <Pill text={label} tone={FOCUS_TONE[label]} />
          </Pressable>
        );
      })}
    </Card>
  );
}

function More({ p }: { p: PlanState }) {
  const items: readonly { title: string; sub: string; icon: IconName; go: () => void }[] = [
    { title: 'Build a weekly routine', sub: 'Study at the same times each week.', icon: 'calendar', go: () => p.setTab('schedule') },
    {
      title: 'Practise with past papers',
      sub: 'Real UNEB questions with solutions.',
      icon: 'book',
      go: () => p.go('/learn/past-papers' as Href),
    },
    { title: 'Join a live revision class', sub: 'Ask a teacher your questions.', icon: 'video', go: () => p.go('/learn/live' as Href) },
  ];
  return (
    <Card title="More Recommendations">
      {items.map((it) => (
        <Pressable key={it.title} style={s.more} onPress={it.go} accessibilityRole="button">
          <View style={s.moreIcon}>
            <Icon name={it.icon} size={18} color={BRAND_BLUE} />
          </View>
          <View style={k.flex}>
            <Text style={s.title}>{it.title}</Text>
            <Text style={k.small}>{it.sub}</Text>
          </View>
          <Icon name="chevronRight" size={16} color={L.body} />
        </Pressable>
      ))}
    </Card>
  );
}

/** Recommendations (its reference): what to do next, picked videos, your study focus and more ideas. */
export function RecsTab({ p, phone }: { p: PlanState; phone: boolean }) {
  return (
    <View style={s.stack}>
      <Banner p={p} phone={phone} />
      <View style={[s.cols, phone && s.colsP]}>
        <View style={[k.flex, s.stack]}>
          <NextSteps p={p} />
          <ForYou p={p} phone={phone} />
        </View>
        <View style={[s.stack, !phone && s.right]}>
          <StudyFocus p={p} />
          <More p={p} />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  stack: { gap: 16 },
  cols: { flexDirection: 'row', gap: 18, alignItems: 'flex-start' },
  colsP: { flexDirection: 'column', alignItems: 'stretch' },
  right: { width: 440 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 18, padding: 22, borderRadius: 18, backgroundColor: BRAND_BLUE },
  bannerP: { flexDirection: 'column', alignItems: 'flex-start' },
  bannerIcon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  bannerTitle: { fontSize: 22, fontWeight: '800', color: L.white },
  bannerSub: { marginTop: 4, fontSize: 14, color: Maple.blueSelected },
  bannerBtn: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    borderRadius: Radii.control,
    backgroundColor: L.white,
  },
  bannerBtnText: { fontSize: 14, fontWeight: '700', color: BRAND_BLUE },
  next: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, paddingVertical: 10 },
  nextText: { flex: 1, minWidth: 180 },
  divider: { borderTopWidth: 1, borderTopColor: Maple.blueSelected },
  num: {
    width: 26,
    height: 26,
    overflow: 'hidden',
    borderRadius: 13,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 26,
    textAlign: 'center',
    color: BRAND_BLUE,
    backgroundColor: LAV,
  },
  title: { fontSize: 14.5, fontWeight: '700', color: L.navy },
  actionBtn: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: Radii.control,
    borderWidth: 1.5,
    borderColor: Maple.blueLine,
  },
  actionText: { fontSize: 13, fontWeight: '700', color: BRAND_BLUE },
  seeAll: { fontSize: 13.5, fontWeight: '600', color: L.blue },
  videos: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  video: {
    width: '23%',
    minWidth: 170,
    flexGrow: 1,
    overflow: 'hidden',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: L.line,
    backgroundColor: L.white,
  },
  videoP: { width: '100%' },
  videoBody: { gap: 5, padding: 10 },
  focus: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  more: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  moreIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: LAV },
});
