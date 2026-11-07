import { Image } from '@/components/picture';
import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';

import { Icon } from '@/components/icon';
import { L } from '@/features/learner/frame/LightFrame';
import type { IconName } from '@/lib/icons';
import type { Career } from '@/mock/career-compass';

import { cs, BRAND_SOFT, BRAND_BLUE } from './CareerParts';
import { SectionHead, SideCard } from './CompassCards';
import type { Compass } from './useCompass';
import { Maple, Radii } from '@/constants/maple';

const OTHER = 'A different direction worth exploring';

/** Your exploration so far: the stage, the counts, and what the learner picked. */
function Exploration({ x, phone }: { x: Compass; phone: boolean }) {
  const tile = (key: string) => x.cc.tiles.find((t) => t.key === key)?.label.split(' & ')[0] ?? key;
  const cap = (v: string) => v.charAt(0).toUpperCase() + v.slice(1);
  const chips = [...x.answers.interests.map(tile), ...x.answers.strengths, ...x.answers.environments.map(cap)];
  const stats: readonly { icon: IconName; value: number; label: string }[] = [
    { icon: 'briefcase', value: x.matches.length, label: 'Careers suggested' },
    { icon: 'bookmark', value: x.saves.careers.length, label: x.saves.careers.length === 1 ? 'Career saved' : 'Careers saved' },
    { icon: 'layers', value: x.saves.programs.length, label: x.saves.programs.length === 1 ? 'Program saved' : 'Programs saved' },
    { icon: 'check', value: x.saves.actions.filter((a) => a.done).length, label: 'Steps done' },
  ];
  return (
    <View style={[s.banner, phone && s.bannerP]}>
      <LinearGradient colors={[Maple.blue, Maple.blue, Maple.blue]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      {!phone ? <Image decorative source={x.cc.photos.heroes.results} style={s.bannerPhoto} contentFit="cover" contentPosition="top" /> : null}
      <View style={s.bannerTop}>
        <View style={s.flex}>
          <Text style={s.bannerTitle}>Your exploration so far</Text>
          <Text style={s.bannerSub}>{`${x.cc.learner.level} • Focus now: ${x.stage.focus}`}</Text>
        </View>
        <Pressable style={s.change} onPress={x.startAssessment} accessibilityRole="button">
          <Icon name="edit" size={14} color={BRAND_BLUE} />
          <Text style={s.changeText}>Change my interests</Text>
        </Pressable>
      </View>
      <View style={[s.stats, !phone && s.statsD]}>
        {stats.map((st) => (
          <View key={st.label} style={s.stat}>
            <Icon name={st.icon} size={22} color={L.white} />
            <View>
              <Text style={s.statValue}>{st.value}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          </View>
        ))}
      </View>
      <Text style={[s.bannerSub, !phone && s.bannerTextD]}>{x.stage.tip}</Text>
      <View style={[s.chips, !phone && s.bannerTextD]}>
        {chips.map((c) => (
          <Text key={c} style={s.chip}>
            {c}
          </Text>
        ))}
      </View>
    </View>
  );
}

function MatchCard({ x, c, rank, reasons, phone }: { x: Compass; c: Career; rank: number; reasons: readonly string[]; phone: boolean }) {
  const saved = x.saves.careers.includes(c.id);
  return (
    <View style={[s.card, phone ? s.cardP : s.cardD]}>
      <View>
        <Image decorative source={c.photo} style={s.photo} contentFit="cover" />
        <Text style={s.rank}>{`#${rank} Match`}</Text>
        <Pressable style={s.save} onPress={() => x.toggleCareer(c.id)} hitSlop={8} accessibilityRole="button" accessibilityState={{ selected: saved }} accessibilityLabel={saved ? `Remove ${c.title} from saved` : `Save ${c.title}`}>
          <Icon name={saved ? 'bookmarkOn' : 'bookmark'} size={16} color={saved ? BRAND_BLUE : L.navy} />
        </Pressable>
      </View>
      <View style={s.body}>
        <View style={s.cardHead}>
          <View style={s.iconTile}>
            <Icon name={c.icon} size={18} color={BRAND_BLUE} />
          </View>
          <View style={s.flex}>
            <Text style={s.name}>{c.title}</Text>
            <Text style={cs.small}>{c.field}</Text>
          </View>
        </View>
        <Text style={[cs.small, s.overview]} numberOfLines={3}>
          {c.overview}
        </Text>
        {reasons.map((r) => (
          <View key={r} style={s.reason}>
            <Icon name="tick" size={13} color={Maple.successText} />
            <Text style={s.reasonText}>{r}</Text>
          </View>
        ))}
        <View style={s.flex} />
        <Pressable style={s.explore} onPress={() => x.openCareer(c.id)} accessibilityRole="button" accessibilityLabel={`Explore career: ${c.title}`}>
          <Text style={s.exploreText}>Explore Career</Text>
          <Icon name="arrowRight" size={13} color={L.white} />
        </Pressable>
      </View>
    </View>
  );
}

function CareersToExplore({ x, phone }: { x: Compass; phone: boolean }) {
  const [more, setMore] = useState(false);
  const top = x.matches.filter((m) => m.reasons[0] !== OTHER).slice(0, 4);
  const rest = x.matches.filter((m) => !top.includes(m));
  const list = more ? rest : top;
  return (
    <View style={s.panel}>
      <Text style={s.panelTitle}>Careers to explore</Text>
      <Text style={cs.small}>Suggestions from what you enjoy and do well. They aren’t a verdict: explore widely and change your answers any time.</Text>
      <View style={s.toggle} accessibilityRole="tablist">
        {(
          [
            [false, `Top matches (${top.length})`, 'star'],
            [true, `More matches (${rest.length})`, 'grid'],
          ] as const
        ).map(([key, label, icon]) => (
          <Pressable key={label} style={[s.toggleBtn, more === key && s.toggleOn]} onPress={() => setMore(key)} accessibilityRole="tab" accessibilityState={{ selected: more === key }}>
            <Icon name={icon} size={15} color={more === key ? BRAND_BLUE : L.navy} />
            <Text style={[s.toggleText, more === key && s.toggleTextOn]}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={s.grid}>
        {list.length ? (
          list.map((m, i) => <MatchCard key={m.career.id} x={x} c={m.career} rank={(more ? top.length : 0) + i + 1} reasons={m.reasons.filter((r) => r !== OTHER)} phone={phone} />)
        ) : (
          <Text style={cs.small}>Nothing else to show yet. Change your interests to see more.</Text>
        )}
      </View>
    </View>
  );
}

function NextSteps({ x }: { x: Compass }) {
  const items: readonly { label: string; done: boolean; go: () => void }[] = [
    { label: 'Take the assessment', done: x.assessed, go: x.startAssessment },
    { label: 'Explore suggested careers', done: x.progress.steps[1].done, go: () => x.setTab('explorer') },
    { label: 'Save careers or programs you like', done: x.saves.careers.length + x.saves.programs.length > 0, go: () => x.setTab('explorer') },
    { label: 'Add them to My Plan', done: x.saves.actions.length > 0 && x.goals.length > 0, go: x.openPlan },
  ];
  return (
    <View style={s.steps}>
      <View style={s.stepsHead}>
        <Icon name="flag" size={24} color={BRAND_BLUE} />
        <Text style={s.panelTitle}>Next Steps For You</Text>
      </View>
      {items.map((it) => (
        <Pressable key={it.label} style={s.stepRow} onPress={it.go} accessibilityRole="button" accessibilityState={{ checked: it.done }}>
          <View style={[s.circle, it.done && s.circleOn]}>{it.done ? <Icon name="tick" size={12} color={L.white} /> : null}</View>
          <Text style={[s.stepText, it.done && s.stepDone]}>{it.label}</Text>
          {!it.done ? <Icon name="chevronRight" size={15} color={L.navy} /> : null}
        </Pressable>
      ))}
    </View>
  );
}

const SIZE = 250;
const R = 82;
const C = SIZE / 2;

/** Your Career Profile: a five-point radar of what the learner said they enjoy and do well. */
function Radar({ x }: { x: Compass }) {
  const pts = x.profile.length;
  const at = (i: number, r: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / pts;
    return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) };
  };
  const ring = (k: number) =>
    x.profile
      .map((_, i) => at(i, R * k))
      .map((p) => `${p.x},${p.y}`)
      .join(' ');
  const shape = x.profile
    .map((a, i) => at(i, R * Math.max(0.12, a.score)))
    .map((p) => `${p.x},${p.y}`)
    .join(' ');
  const LABEL_R = R + 30;
  return (
    <SideCard title="Your Career Profile" icon="chart" sub="A snapshot of what you enjoy and do well.">
      <View style={s.radar} accessibilityLabel={x.profile.map((a) => `${a.axis}: ${a.level}`).join(', ')}>
        <Svg width={SIZE} height={SIZE}>
          {[1, 0.75, 0.5, 0.25].map((k) => (
            <Polygon key={k} points={ring(k)} fill={k === 1 ? Maple.blueSoft : 'none'} stroke={Maple.blueSelected} strokeWidth={1} />
          ))}
          {x.profile.map((_, i) => {
            const p = at(i, R);
            return <Line key={i} x1={C} y1={C} x2={p.x} y2={p.y} stroke={Maple.blueSelected} strokeWidth={1} />;
          })}
          <Polygon points={shape} fill="rgba(109,63,224,0.28)" stroke={BRAND_BLUE} strokeWidth={2} />
          {x.profile.map((a, i) => {
            const p = at(i, R * Math.max(0.12, a.score));
            return <Circle key={a.axis} cx={p.x} cy={p.y} r={4} fill={BRAND_BLUE} />;
          })}
        </Svg>
        {x.profile.map((a, i) => {
          const p = at(i, LABEL_R);
          return (
            <View key={a.axis} style={[s.axis, { left: p.x - 46, top: p.y - 16 }]}>
              <Text style={s.axisName}>{a.axis}</Text>
              <Text style={s.axisLevel}>{`(${a.level})`}</Text>
            </View>
          );
        })}
      </View>
      <Text style={cs.note}>From your own answers. Change them any time; it isn’t a test score.</Text>
    </SideCard>
  );
}

function SavedForLater({ x }: { x: Compass }) {
  const [all, setAll] = useState(false);
  const items = [
    ...x.goals.map((c) => ({ id: c.id, title: c.title, kind: 'Career', icon: 'briefcase' as const, open: () => x.openCareer(c.id) })),
    ...x.savedPrograms.map((p) => ({ id: p.id, title: p.title, kind: 'Program', icon: 'cap' as const, open: () => x.openProgram(p.id) })),
  ];
  return (
    <SideCard title="Saved for Later" icon="bookmark">
      {items.length ? (
        (all ? items : items.slice(0, 2)).map((it) => (
          <Pressable key={it.id} style={s.savedRow} onPress={it.open} accessibilityRole="button">
            <View style={s.iconTile}>
              <Icon name={it.icon} size={17} color={BRAND_BLUE} />
            </View>
            <View style={s.flex}>
              <Text style={s.savedTitle}>{it.title}</Text>
              <Text style={s.kind}>{it.kind}</Text>
            </View>
            <Icon name="arrowUp" size={14} color={L.navy} />
          </Pressable>
        ))
      ) : (
        <Text style={cs.small}>Save careers and programs to find them here.</Text>
      )}
      {items.length > 2 ? (
        <Pressable style={s.inline} onPress={() => setAll(!all)} accessibilityRole="button">
          <Text style={s.link}>{all ? 'Show fewer' : 'View All Saved'}</Text>
          <Icon name="arrowRight" size={13} color={BRAND_BLUE} />
        </Pressable>
      ) : null}
    </SideCard>
  );
}

/** Your Results (its reference): the exploration summary, careers to explore, next steps, the profile and saved items. */
export function ResultsView({ x, phone, tabs }: { x: Compass; phone: boolean; tabs: ReactNode }) {
  const main = (
    <>
      {!phone ? <SectionHead icon="heart" title="Interests & Strengths" sub="Discover what motivates you, how you like to work and the kinds of careers you may enjoy." /> : null}
      {tabs}
      <Exploration x={x} phone={phone} />
      <CareersToExplore x={x} phone={phone} />
    </>
  );
  const side = (
    <>
      <NextSteps x={x} />
      <Radar x={x} />
      <SavedForLater x={x} />
    </>
  );
  return phone ? (
    <View style={s.stack}>
      {main}
      {side}
    </View>
  ) : (
    <View style={s.cols}>
      <View style={[s.flex, s.stack]}>{main}</View>
      <View style={s.right}>{side}</View>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stack: { gap: 18 },
  cols: { flexDirection: 'row', gap: 22, alignItems: 'flex-start' },
  right: { width: 350, gap: 18 },
  banner: { overflow: 'hidden', gap: 14, padding: 24, borderRadius: 20 },
  bannerP: { padding: 16 },
  bannerPhoto: { position: 'absolute', right: 0, bottom: 0, width: 280, height: 246 },
  bannerTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  bannerTitle: { fontSize: 25, fontWeight: '800', color: L.white, letterSpacing: -0.4 },
  bannerSub: { fontSize: 14, lineHeight: 20, color: Maple.blueSoft },
  bannerTextD: { marginRight: 260 },
  change: { height: 36, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, borderRadius: 18, backgroundColor: L.white },
  changeText: { fontSize: 13.5, fontWeight: '700', color: BRAND_BLUE },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statsD: { marginRight: 250 },
  stat: { flexGrow: 1, flexBasis: 130, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', backgroundColor: 'rgba(255,255,255,0.16)' },
  statValue: { fontSize: 22, fontWeight: '800', color: L.white },
  statLabel: { fontSize: 12, color: Maple.blueSoft },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, fontSize: 12.5, fontWeight: '600', color: L.white, backgroundColor: 'rgba(255,255,255,0.2)' },
  panel: { gap: 10, padding: 20, borderRadius: 18, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  panelTitle: { fontSize: 21, fontWeight: '800', color: L.navy },
  toggle: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  toggleBtn: { height: 38, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  toggleOn: { borderColor: Maple.blueLine, backgroundColor: Maple.blueSoft },
  toggleText: { fontSize: 13.5, fontWeight: '600', color: L.navy },
  toggleTextOn: { color: BRAND_BLUE, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 6 },
  card: { overflow: 'hidden', borderRadius: 16, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  cardD: { width: '23.6%' },
  cardP: { width: '100%' },
  photo: { width: '100%', height: 108 },
  rank: { position: 'absolute', top: 6, left: 6, overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, fontSize: 12.5, fontWeight: '800', color: L.white, backgroundColor: BRAND_BLUE },
  save: { position: 'absolute', top: 6, right: 6, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: L.white },
  body: { flexGrow: 1, gap: 6, padding: 12 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconTile: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: BRAND_SOFT },
  name: { fontSize: 15, fontWeight: '800', color: L.navy },
  overview: { minHeight: 51 },
  reason: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  reasonText: { flex: 1, fontSize: 12, lineHeight: 16, color: L.ink },
  explore: { height: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, borderRadius: Radii.control, backgroundColor: BRAND_BLUE },
  exploreText: { fontSize: 13.5, fontWeight: '700', color: L.white },
  steps: { gap: 6, padding: 18, borderRadius: 16, borderWidth: 1, borderColor: Maple.blueSelected, backgroundColor: Maple.blueSoft },
  stepsHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: Maple.blueSelected },
  circle: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 11, borderWidth: 1.5, borderColor: BRAND_BLUE },
  circleOn: { borderColor: Maple.successText, backgroundColor: Maple.successText },
  stepText: { flex: 1, fontSize: 14, color: L.navy },
  stepDone: { color: L.body, textDecorationLine: 'line-through' },
  radar: { width: SIZE, height: SIZE, alignSelf: 'center', marginVertical: 14 },
  axis: { position: 'absolute', width: 92, alignItems: 'center' },
  axisName: { fontSize: 12, fontWeight: '700', color: L.navy, textAlign: 'center' },
  axisLevel: { fontSize: 11, color: L.body },
  savedRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: L.line },
  savedTitle: { fontSize: 14, fontWeight: '700', color: L.navy },
  kind: { alignSelf: 'flex-start', marginTop: 2, overflow: 'hidden', paddingHorizontal: 7, paddingVertical: 1, borderRadius: 6, fontSize: 11, fontWeight: '600', color: BRAND_BLUE, backgroundColor: BRAND_SOFT },
  link: { fontSize: 13.5, fontWeight: '700', color: BRAND_BLUE },
});
