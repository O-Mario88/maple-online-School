import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Icon } from '@/components/icon';
import { leafState, type Leaf, type MapState, type Topic, topicState } from '@/lib/progress';
import type { IconName } from '@/lib/icons';

import type { ProgressState } from './useProgress';

const NAVY = '#16213E';
const BODY = '#4A5263';
const LINE = '#5A78B4';
const DASH = '#A7B3C9';

/** Gold = mastered, orange = needs review, blue = in progress, grey = locked. */
export const TONE: Record<MapState, { fill: string; border: string; dot: string; halo: string; icon: IconName; label: string }> = {
  mastered: { fill: '#FFF6DA', border: '#F2C232', dot: '#DFA200', halo: '#F9DB78', icon: 'star', label: 'Mastered' },
  review: { fill: '#FFEEE3', border: '#F59A5C', dot: '#F26A1B', halo: '#FDD3B6', icon: 'sparkle', label: 'Needs Review' },
  progress: { fill: '#E9F2FF', border: '#2F7BF6', dot: '#2F7BF6', halo: '#BFD6FC', icon: 'sparkle', label: 'In Progress' },
  locked: { fill: '#EEF0F4', border: '#D4D9E1', dot: '#6B7280', halo: '#D9DDE4', icon: 'lock', label: 'Locked' },
};

type Box = { x: number; y: number; w: number; h: number };
/** The reference's tree card is 663 × 740; every position below is in its pixels. */
export const TREE_CARD = { w: 663, h: 740 };
const ROOT: Box = { x: 253, y: 145, w: 170, h: 64 };
const CAP: Box = { x: 237, y: 592, w: 199, h: 64 };
const TOPICS: readonly (Box & { arrow: number })[] = [
  { x: 17, y: 266, w: 150, h: 63, arrow: 93 },
  { x: 199, y: 266, w: 135, h: 63, arrow: 258 },
  { x: 358, y: 266, w: 133, h: 63, arrow: 422 },
  { x: 514, y: 266, w: 136, h: 63, arrow: 578 },
];
const LEAVES: readonly (readonly Box[])[] = [
  [
    { x: 12, y: 372, w: 84, h: 51 },
    { x: 105, y: 372, w: 84, h: 51 },
    { x: 12, y: 443, w: 84, h: 58 },
    { x: 102, y: 443, w: 89, h: 58 },
  ],
  [
    { x: 199, y: 372, w: 97, h: 67 },
    { x: 300, y: 388, w: 97, h: 56 },
  ],
  [],
  [
    { x: 455, y: 372, w: 108, h: 54 },
    { x: 568, y: 372, w: 84, h: 54 },
    { x: 455, y: 454, w: 93, h: 53 },
    { x: 558, y: 454, w: 94, h: 53 },
  ],
];

const arrowDown = (x: number, y: number) => `M${x - 4},${y - 6} L${x + 4},${y - 6} L${x},${y} Z`;
const arrowUp = (x: number, y: number) => `M${x - 4},${y + 6} L${x + 4},${y + 6} L${x},${y} Z`;
/** A rounded elbow: down from (x1,y1) to the rail at yr, across, then down to (x2,y2). */
const elbow = (x1: number, y1: number, yr: number, x2: number, y2: number, r = 9) => {
  if (Math.abs(x2 - x1) < 1) return `M${x1},${y1} V${y2}`;
  const d = x2 > x1 ? 1 : -1;
  return `M${x1},${y1} V${yr - r} Q${x1},${yr} ${x1 + d * r},${yr} H${x2 - d * r} Q${x2},${yr} ${x2},${yr + r} V${y2}`;
};

function Connectors({ s }: { s: ProgressState }) {
  const t = s.tree.topics;
  const has = (ti: number, li: number) => (t[ti]?.leaves.length ?? 0) > li;
  const solid: string[] = [];
  const dashed: string[] = [];
  const heads: { d: string; color: string }[] = [];
  const rootX = ROOT.x + ROOT.w / 2;
  t.forEach((_, i) => {
    solid.push(elbow(rootX, ROOT.y + ROOT.h, 235, TOPICS[i].arrow, 262));
    heads.push({ d: arrowDown(TOPICS[i].arrow, 266), color: LINE });
  });
  // First branch: a fork to its first two skills, and a line down each column.
  if (has(0, 0)) {
    [52, 145].forEach((x, i) => {
      if (!has(0, i)) return;
      solid.push(elbow(TOPICS[0].arrow, 329, 353, x, 368));
      heads.push({ d: arrowDown(x, 372), color: LINE });
      if (has(0, i + 2)) {
        solid.push(`M${x},423 V439`);
        heads.push({ d: arrowDown(x, 443), color: LINE });
      }
    });
  }
  // Second branch: its first skill points up into it; the next unlocks after it.
  if (has(1, 0)) {
    solid.push('M258,372 V335');
    heads.push({ d: arrowUp(258, 330), color: TONE[topicState(s.tree, t[1].id)].dot });
    if (has(1, 1)) {
      dashed.push('M262,346 Q262,352 270,352 H328 Q336,352 336,360 V382');
      heads.push({ d: arrowDown(336, 388), color: DASH });
    }
  }
  // Fourth branch: a fork to its first two skills; the left column continues solid, the right dashed.
  if (has(3, 0)) {
    [509, 612].forEach((x, i) => {
      if (!has(3, i)) return;
      solid.push(elbow(TOPICS[3].arrow, 329, 353, x, 368));
      heads.push({ d: arrowDown(x, 372), color: LINE });
      if (has(3, i + 2)) {
        (i === 0 ? solid : dashed).push(`M${x},426 V448`);
        heads.push({ d: arrowDown(x, 454), color: i === 0 ? LINE : DASH });
      }
    });
  }
  // The third branch feeds the fourth branch and the capstone.
  if (t[2]) {
    heads.push({ d: arrowUp(423, 330), color: TONE[topicState(s.tree, t[2].id)].dot });
    if (has(3, 0)) dashed.push('M423,336 V385 Q423,401 439,401 H453');
    dashed.push('M423,336 V505 Q423,535 385,545 Q342,556 340,580');
  }
  // Dashed lines down into the capstone from the bottom of each branch.
  const bottom0 = has(0, 2) ? 501 : 423;
  if (has(0, 0)) dashed.push(`M70,${bottom0} V515 Q70,545 120,548 H284 Q306,550 306,580`);
  if (has(0, 1)) dashed.push(`M140,${bottom0} V512 Q140,540 175,546`);
  if (has(1, 0)) dashed.push('M258,439 V505 Q258,535 296,545 Q338,556 340,580');
  if (has(3, 0)) dashed.push(`M${has(3, 3) ? 573 : 610},${has(3, 3) ? 507 : 426} V520 Q573,548 520,549 H398 Q372,551 372,580`);
  [306, 340, 372].forEach((x) => heads.push({ d: arrowDown(x, 586), color: DASH }));
  return (
    <Svg style={StyleSheet.absoluteFill} width={TREE_CARD.w} height={TREE_CARD.h} pointerEvents="none">
      {solid.map((d, i) => (
        <Path key={`s${i}`} d={d} stroke={LINE} strokeWidth={1.6} fill="none" />
      ))}
      {dashed.map((d, i) => (
        <Path key={`d${i}`} d={d} stroke={DASH} strokeWidth={1.4} strokeDasharray="4 4" fill="none" />
      ))}
      {heads.map((h, i) => (
        <Path key={`h${i}`} d={h.d} fill={h.color} />
      ))}
    </Svg>
  );
}

function Badge({ state, size }: { state: MapState; size: number }) {
  const t = TONE[state];
  return (
    <View style={[styles.badge, { width: size, height: size, borderRadius: size / 2, backgroundColor: t.dot, borderColor: t.halo, borderWidth: size > 24 ? 3 : 2 }]}>
      <Icon name={t.icon} size={size * 0.46} color="#FFFFFF" />
    </View>
  );
}

function TopicNode({ s, box, id, name, done, total }: { s: ProgressState; box: Box; id: string; name: string; done: number; total: number }) {
  const st = topicState(s.tree, id);
  const t = TONE[st];
  return (
    <Pressable
      style={[styles.topic, { left: box.x, top: box.y, width: box.w, height: box.h, backgroundColor: t.fill, borderColor: t.border }, st === 'mastered' && styles.glow]}
      onPress={() => s.pick({ id })}
      accessibilityRole="button"
      accessibilityLabel={`${name}: ${t.label}, ${done} of ${total} skills`}>
      <Badge state={st} size={32} />
      <View style={styles.flex}>
        <Text style={styles.topicName} numberOfLines={2}>
          {name}
        </Text>
        <Text style={styles.topicCount}>{`${done} / ${total} skills`}</Text>
      </View>
      {st === 'mastered' ? (
        <View style={styles.check}>
          <Icon name="check" size={11} color="#FFFFFF" />
        </View>
      ) : null}
    </Pressable>
  );
}

function LeafNode({ s, box, topic, leaf }: { s: ProgressState; box: Box; topic: Topic; leaf: Leaf }) {
  const st = leafState(s.tree, topic, leaf);
  const t = TONE[st];
  const icon: IconName = st === 'locked' && leaf.after ? 'star' : t.icon;
  return (
    <Pressable
      style={[styles.leaf, { left: box.x, top: box.y, width: box.w, height: box.h, backgroundColor: t.fill, borderColor: st === 'locked' ? '#E1E5EB' : t.border }]}
      onPress={() => s.pick({ id: leaf.id, topic: topic.id })}
      accessibilityRole="button"
      accessibilityLabel={`${leaf.name}: ${t.label}`}>
      <View style={[styles.leafDot, { backgroundColor: t.dot, borderColor: t.halo }]}>
        <Icon name={icon} size={9} color="#FFFFFF" />
      </View>
      <Text style={styles.leafName} numberOfLines={3}>
        {leaf.name}
      </Text>
    </Pressable>
  );
}

export function Legend({ inline = false }: { inline?: boolean }) {
  return (
    <View style={[styles.legend, inline && styles.legendInline]}>
      {(['mastered', 'review', 'progress', 'locked'] as const).map((k) => (
        <View key={k} style={[styles.legendItem, k === 'locked' && !inline && styles.legendLocked]}>
          <View style={[styles.legendDot, { backgroundColor: TONE[k].dot, borderColor: TONE[k].halo }]} />
          <Text style={styles.legendText}>{TONE[k].label === 'Needs Review' && inline ? 'Review' : TONE[k].label}</Text>
        </View>
      ))}
    </View>
  );
}

/** The skill tree card, laid out exactly on the reference's 663 × 740 card. */
export function SkillTreeCard({ s, onExpand }: { s: ProgressState; onExpand?: () => void }) {
  const [menu, setMenu] = useState(false);
  const tree = s.tree;
  return (
    <View style={styles.card}>
      <Image source={s.subject.icon} style={styles.headIcon} contentFit="cover" />
      <Text style={styles.title}>{`${s.subject.name} Skill Tree`}</Text>
      <Text style={styles.desc}>{`Explore the key skills in ${s.subject.name}. Click on any skill to see practice, or continue learning.`}</Text>
      <View style={styles.curriculum}>
        <Pressable style={styles.curriculumBtn} onPress={() => setMenu(!menu)} accessibilityRole="button" accessibilityState={{ expanded: menu }} accessibilityLabel={`Curriculum: ${s.curriculum}`}>
          <Text style={styles.curriculumText}>{s.curriculum}</Text>
          <Icon name="chevronDown" size={13} color={NAVY} />
        </Pressable>
        {menu ? (
          <View style={styles.menu}>
            {['O-Level Curriculum', 'UNEB UCE Syllabus', 'Cambridge IGCSE'].map((c) => (
              <Pressable
                key={c}
                style={styles.menuItem}
                onPress={() => {
                  s.setCurriculum(c);
                  setMenu(false);
                }}
                accessibilityRole="menuitem">
                <Text style={[styles.menuText, c === s.curriculum && styles.menuOn]}>{c}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
      {onExpand ? (
        <Pressable style={styles.expand} onPress={onExpand} accessibilityRole="button" accessibilityLabel="Expand the skill tree">
          <Icon name="expand" size={14} color={NAVY} />
        </Pressable>
      ) : null}
      <View style={styles.legendBox}>
        <Legend />
      </View>
      <Connectors s={s} />
      <TopicNode s={s} box={ROOT} id={tree.root.id} name={tree.root.name} done={tree.root.done} total={tree.root.total} />
      {tree.topics.map((tp, i) => (
        <TopicNode key={tp.id} s={s} box={TOPICS[i]} id={tp.id} name={tp.name} done={tp.done} total={tp.total} />
      ))}
      {tree.topics.flatMap((tp, i) => tp.leaves.slice(0, LEAVES[i].length).map((l, j) => <LeafNode key={l.id} s={s} box={LEAVES[i][j]} topic={tp} leaf={l} />))}
      <TopicNode s={s} box={CAP} id={tree.capstone.id} name={tree.capstone.name} done={tree.capstone.done} total={tree.capstone.total} />
    </View>
  );
}

/** The phone tree, as the reference phone draws it: root, two branches side by side with their skills, then the next locked branch. */
export function PhoneTree({ s }: { s: ProgressState }) {
  const [a, b, c, d] = s.tree.topics;
  const left = a ? a.leaves.slice(0, 3).map((l) => ({ topic: a, leaf: l })) : [];
  const right = [...(b ? b.leaves.map((l) => ({ topic: b, leaf: l })) : []), ...(a ? a.leaves.slice(3).map((l) => ({ topic: a, leaf: l })) : [])];
  const node = (id: string, name: string, done: number, total: number, wide = false) => {
    const st = topicState(s.tree, id);
    const t = TONE[st];
    return (
      <Pressable style={[styles.pTopic, wide && styles.pTopicWide, { backgroundColor: t.fill, borderColor: t.border }]} onPress={() => s.pick({ id })} accessibilityRole="button" accessibilityLabel={`${name}: ${t.label}, ${done} of ${total} skills`}>
        <Badge state={st} size={30} />
        <View style={styles.flex}>
          <Text style={styles.pTopicName} numberOfLines={2}>
            {name}
          </Text>
          <Text style={styles.pTopicCount}>{`${done} / ${total} skills`}</Text>
        </View>
        {st === 'mastered' ? (
          <View style={styles.pCheck}>
            <Icon name="check" size={10} color="#FFFFFF" />
          </View>
        ) : null}
      </Pressable>
    );
  };
  const leaf = (x: { topic: Topic; leaf: Leaf }) => {
    const st = leafState(s.tree, x.topic, x.leaf);
    const t = TONE[st];
    return (
      <View key={x.leaf.id} style={styles.pLeafWrap}>
        <View style={[styles.pStem, st === 'locked' && styles.pStemDashed]} />
        <Pressable style={[styles.pLeaf, { backgroundColor: t.fill, borderColor: st === 'locked' ? '#E1E5EB' : t.border }]} onPress={() => s.pick({ id: x.leaf.id, topic: x.topic.id })} accessibilityRole="button" accessibilityLabel={`${x.leaf.name}: ${t.label}`}>
          <View style={[styles.leafDot, styles.pLeafDot, { backgroundColor: t.dot, borderColor: t.halo }]}>
            <Icon name={st === 'locked' && x.leaf.after ? 'star' : t.icon} size={10} color="#FFFFFF" />
          </View>
          <Text style={styles.pLeafName}>{x.leaf.name}</Text>
        </Pressable>
      </View>
    );
  };
  return (
    <View style={styles.pTree}>
      {node(s.tree.root.id, s.tree.root.name, s.tree.root.done, s.tree.root.total, true)}
      <View style={styles.pFork}>
        <View style={styles.pForkStem} />
        <View style={styles.pForkRail} />
      </View>
      <View style={styles.pCols}>
        <View style={styles.pCol}>
          {a ? node(a.id, a.name, a.done, a.total) : null}
          {left.map(leaf)}
        </View>
        <View style={styles.pCol}>
          {b ? node(b.id, b.name, b.done, b.total) : null}
          {right.map(leaf)}
        </View>
      </View>
      {d ? (
        <>
          <View style={[styles.pStem, styles.pStemDashed, styles.pStemCentre]} />
          {node(d.id, d.name, d.done, d.total, true)}
        </>
      ) : null}
      <View style={styles.pMore}>
        {[c, s.tree.capstone]
          .filter((x) => x != null)
          .map((x) => {
            const st = topicState(s.tree, x.id);
            return (
              <Pressable key={x.id} style={[styles.pChip, { borderColor: TONE[st].border, backgroundColor: TONE[st].fill }]} onPress={() => s.pick({ id: x.id })} accessibilityRole="button">
                <View style={[styles.legendDot, { backgroundColor: TONE[st].dot, borderColor: TONE[st].halo }]} />
                <Text style={styles.pChipText}>{`${x.name} • ${x.done}/${x.total}`}</Text>
              </Pressable>
            );
          })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { width: TREE_CARD.w, height: TREE_CARD.h, borderRadius: 12, borderWidth: 1, borderColor: '#E9EEF5', backgroundColor: '#FFFFFF' },
  headIcon: { position: 'absolute', left: 12, top: 11, width: 51, height: 51, borderRadius: 10 },
  title: { position: 'absolute', left: 76, top: 13, fontSize: 19, fontWeight: '800', color: NAVY, letterSpacing: -0.3 },
  desc: { position: 'absolute', left: 76, top: 39, width: 360, fontSize: 12.5, lineHeight: 17, color: '#3F4A63' },
  curriculum: { position: 'absolute', left: 456, top: 11, zIndex: 20 },
  curriculumBtn: { width: 160, height: 29, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: '#DCE5F3', backgroundColor: '#FFFFFF' },
  curriculumText: { fontSize: 11.5, color: NAVY },
  menu: { marginTop: 4, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#E1E7F0', backgroundColor: '#FFFFFF' },
  menuItem: { height: 28, justifyContent: 'center', paddingHorizontal: 12 },
  menuText: { fontSize: 11.5, color: NAVY },
  menuOn: { fontWeight: '700', color: '#1463F3' },
  expand: { position: 'absolute', left: 625, top: 11, width: 28, height: 29, alignItems: 'center', justifyContent: 'center', borderRadius: 6, borderWidth: 1, borderColor: '#DCE5F3' },
  legendBox: { position: 'absolute', left: 12, top: 83, width: 640, height: 44, justifyContent: 'center', paddingHorizontal: 6, borderRadius: 10, borderWidth: 1, borderColor: '#EDF1F7' },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 26 },
  legendInline: { flexWrap: 'wrap', gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4, paddingVertical: 4 },
  legendLocked: { paddingHorizontal: 8, borderRadius: 8, backgroundColor: '#F1F3F7' },
  legendDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2.5 },
  legendText: { fontSize: 11.5, color: '#2E3A55' },
  badge: { alignItems: 'center', justifyContent: 'center' },
  topic: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 9, paddingLeft: 11, paddingRight: 10, borderRadius: 10, borderWidth: 2 },
  glow: { shadowColor: '#F2C232', shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  topicName: { fontSize: 10.5, lineHeight: 13, fontWeight: '700', color: NAVY, letterSpacing: -0.25 },
  topicCount: { marginTop: 3, fontSize: 10.5, color: BODY },
  check: { position: 'absolute', right: 3, top: 4, width: 18, height: 18, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: '#F5B800' },
  leaf: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 7, borderRadius: 8, borderWidth: 1.5 },
  leafDot: { width: 17, height: 17, alignItems: 'center', justifyContent: 'center', borderRadius: 9, borderWidth: 2 },
  leafName: { flex: 1, fontSize: 9.5, lineHeight: 12, color: NAVY, letterSpacing: -0.1 },
  pTree: { alignItems: 'center' },
  pTopic: { width: '100%', minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, borderWidth: 2 },
  pTopicWide: { width: '72%' },
  pTopicName: { fontSize: 12, lineHeight: 15, fontWeight: '700', color: NAVY },
  pTopicCount: { marginTop: 2, fontSize: 11.5, color: BODY },
  pCheck: { position: 'absolute', right: -6, top: -6, width: 18, height: 18, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: '#F5B800' },
  pFork: { width: '50%', alignItems: 'center' },
  pForkStem: { width: 1.5, height: 12, backgroundColor: LINE },
  pForkRail: { alignSelf: 'stretch', height: 12, borderTopWidth: 1.5, borderLeftWidth: 1.5, borderRightWidth: 1.5, borderColor: LINE, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  pCols: { flexDirection: 'row', gap: 18, width: '100%' },
  pCol: { flex: 1, alignItems: 'center' },
  pLeafWrap: { width: '88%', alignItems: 'center' },
  pStem: { width: 1.5, height: 14, backgroundColor: LINE },
  pStemDashed: { backgroundColor: DASH },
  pStemCentre: { height: 22 },
  pLeaf: { width: '100%', minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5 },
  pLeafDot: { width: 20, height: 20, borderRadius: 10 },
  pLeafName: { flex: 1, fontSize: 11.5, lineHeight: 15, color: NAVY },
  pMore: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 12 },
  pChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, borderWidth: 1 },
  pChipText: { fontSize: 11, color: NAVY },
});
