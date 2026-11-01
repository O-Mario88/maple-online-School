import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { BLUE, BODY, GREEN, INK, IconTile, LINE, MUTED, Pill, PanelHead, RED, TButton, toneColor } from '@/features/teacher/frame/TeacherParts';
import { useTeacherGo } from '@/features/teacher/frame/TeacherFrame';
import type { Countdown } from '@/lib/teacher-home';
import { countdown } from '@/lib/teacher-home';
import { toast } from '@/lib/toast';
import type { Flagged, TeacherHome } from '@/mock/teacher-home';

const TICK_MS = 15_000;

/** Counts down to the next live class from the minutes it starts in when the page opens. */
export function useNextClassCountdown(minutes: number): Countdown {
  const [start] = useState(() => Date.now() + minutes * 60_000);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);
  return countdown(start, now);
}

/** One-tap intervention: remembers who has had a support pack sent this visit. */
export function useIntervene(): { sent: ReadonlySet<string>; intervene: (f: Flagged) => void } {
  const [sent, setSent] = useState<ReadonlySet<string>>(new Set());
  const intervene = useCallback((f: Flagged) => {
    setSent((prev) => new Set(prev).add(f.name));
    toast(`Support pack sent to ${f.name}: a short video, 5 practice questions and a note to the family.`);
  }, []);
  return { sent, intervene };
}

export const ugx = (n: number): string => `UGX ${n.toLocaleString('en-US')}`;

/** The four headline tiles across the top of the page. */
export function StatRow({ h, cd, phone = false }: { h: TeacherHome; cd: Countdown; phone?: boolean }) {
  const go = useTeacherGo();
  const e = h.earnings;
  if (phone) {
    const tiles = [
      { icon: 'video', color: BLUE, value: cd.live ? 'Live' : `${cd.minutes} min`, label: 'Next Class', onPress: () => go('/teach/host') },
      { icon: 'notes', color: RED, value: String(h.ungraded.count), label: 'To Grade', onPress: () => go('/teach/grading') },
      { icon: 'people', color: '#F08C00', value: String(h.struggling), label: 'Need Help', onPress: () => go('analytics') },
      { icon: 'wallet', color: GREEN, value: `UGX ${Math.round(e.week / 1000)}K`, label: 'This Week', onPress: () => go('/teach/earnings') },
    ] as const;
    return (
      <View style={styles.statsP}>
        {tiles.map((t) => (
          <Pressable key={t.label} style={styles.statP} onPress={t.onPress} accessibilityRole="button" accessibilityLabel={`${t.value} ${t.label}`}>
            <IconTile icon={t.icon} color={t.color} size={32} soft />
            <Text style={styles.statPValue}>{t.value}</Text>
            <Text style={styles.statPLabel}>{t.label}</Text>
          </Pressable>
        ))}
      </View>
    );
  }
  return (
    <View style={styles.stats}>
      <Pressable style={styles.stat} onPress={() => go('/teach/host')} accessibilityRole="button" accessibilityLabel={`Next live class ${cd.label}, ${h.nextClass.subject}`}>
        <IconTile icon="video" color={BLUE} size={46} />
        <View style={styles.flex}>
          <Text style={styles.statStrong}>Next Live Class</Text>
          <Text style={styles.statBlue}>{cd.live ? 'Live now' : `in ${cd.minutes} minutes`}</Text>
          <Text style={styles.statSub}>{h.nextClass.subject}</Text>
        </View>
      </Pressable>
      <Pressable style={styles.stat} onPress={() => go('/teach/grading')} accessibilityRole="button" accessibilityLabel={`${h.ungraded.count} ungraded submissions, ${h.ungraded.overdue} overdue`}>
        <IconTile icon="notes" color={RED} size={46} soft />
        <View style={styles.flex}>
          <Text style={styles.statBig}>{h.ungraded.count}</Text>
          <Text style={styles.statSub}>Ungraded Submissions</Text>
          <Pill label={`${h.ungraded.overdue} overdue`} tone="red" style={styles.statPill} />
        </View>
      </Pressable>
      <Pressable style={styles.stat} onPress={() => go('analytics')} accessibilityRole="button" accessibilityLabel={`${h.struggling} struggling students need your intervention`}>
        <IconTile icon="people" color="#F08C00" size={46} soft />
        <View style={styles.flex}>
          <Text style={styles.statBig}>{h.struggling}</Text>
          <Text style={styles.statSub}>Struggling Students</Text>
          <Text style={styles.statRed}>Need your intervention</Text>
        </View>
        <Icon name="chevronRight" size={16} color={BODY} />
      </Pressable>
      <Pressable style={styles.stat} onPress={() => go('/teach/earnings')} accessibilityRole="button" accessibilityLabel={`${ugx(e.week)} this week's earnings, up ${e.change}% from last week`}>
        <IconTile icon="wallet" color={GREEN} size={46} />
        <View style={styles.flex}>
          <Text style={styles.statMoney}>{ugx(e.week)}</Text>
          <Text style={styles.statSub}>This Week’s Earnings</Text>
          <Pill label={`↑ ${e.change}% from last week`} tone="green" style={styles.statPill} />
        </View>
      </Pressable>
    </View>
  );
}

/** The next live class with its countdown and "Launch Room". */
export function NextLiveClass({ h, cd, phone = false }: { h: TeacherHome; cd: Countdown; phone?: boolean }) {
  const go = useTeacherGo();
  const [menu, setMenu] = useState(false);
  const c = h.nextClass;
  const live = cd.live ? 'Live now' : `Live ${cd.label}`;
  return (
    <View>
      <PanelHead title="Next Live Class" link={phone ? 'View All' : 'View Schedule'} onLink={() => go('/teach/calendar')} />
      <View style={[styles.nextBox, phone && styles.nextBoxP]}>
        {phone ? null : <IconTile icon="columns" color={BLUE} size={48} />}
        <View style={styles.flex}>
          <View style={styles.nextTitleRow}>
            <Text style={[styles.nextTitle, phone && styles.nextTitleP]}>{c.subject}</Text>
            <Pill label={live} tone="green" icon="live" />
          </View>
          {phone ? null : <Meta icon="calendar" text="Mon, 26 Oct 2026" />}
          <Meta icon="clock" text={c.time} phone={phone} />
          <Meta icon="people" text={phone ? `${c.enrolled} students · ${c.shortTopic}` : `${c.enrolled} students enrolled`} phone={phone} />
          {phone ? null : <Text style={styles.topic}>{`Topic: ${c.topic}`}</Text>}
        </View>
        <Image source={c.thumb} style={phone ? styles.thumbP : styles.thumb} contentFit="cover" accessibilityLabel="A chalkboard with a quadratic graph" />
      </View>
      <View style={styles.nextActions}>
        <TButton label="Launch Room" icon="send" onPress={() => go('/teach/host')} style={phone ? styles.flex : styles.launch} />
        {phone ? null : (
          <>
            <TButton label="View Class Details" variant="outline" onPress={() => go('/teach/calendar')} style={styles.details} />
            <Pressable style={styles.more} onPress={() => setMenu((m) => !m)} accessibilityRole="button" accessibilityLabel="More class options" accessibilityState={{ expanded: menu }}>
              <Icon name="more" size={18} color={INK} />
            </Pressable>
          </>
        )}
      </View>
      {menu ? (
        <View style={styles.menu}>
          <MenuRow label="Copy join link" icon="link" onPress={() => { setMenu(false); toast('Join link copied. Share it with your class.'); }} />
          <MenuRow label="Reschedule" icon="calendar" onPress={() => { setMenu(false); go('/teach/calendar'); }} />
          <MenuRow label="Message the class" icon="chat" onPress={() => { setMenu(false); go('/messages/new'); }} />
        </View>
      ) : null}
    </View>
  );
}

function MenuRow({ label, icon, onPress }: { label: string; icon: 'link' | 'calendar' | 'chat'; onPress: () => void }) {
  return (
    <Pressable style={styles.menuRow} onPress={onPress} accessibilityRole="menuitem">
      <Icon name={icon} size={15} color={INK} />
      <Text style={styles.menuText}>{label}</Text>
    </Pressable>
  );
}

function Meta({ icon, text, phone = false }: { icon: 'calendar' | 'clock' | 'people'; text: string; phone?: boolean }) {
  return (
    <View style={styles.meta}>
      <Icon name={icon} size={phone ? 12 : 15} color={BODY} />
      <Text style={[styles.metaText, phone && styles.metaTextP]}>{text}</Text>
    </View>
  );
}

/** "Today's Action Queue": the jobs that need the teacher, most urgent first. */
export function ActionQueue({ h, phone = false }: { h: TeacherHome; phone?: boolean }) {
  const go = useTeacherGo();
  const items = phone ? h.queue.slice(0, 3) : h.queue;
  return (
    <View>
      <PanelHead title={phone ? 'Action Queue' : 'Today’s Action Queue'} link={`View All (${h.queueTotal})`} onLink={() => go('/teach/grading')} />
      <View style={styles.list}>
        {items.map((q, i) => (
          <Pressable key={q.title} style={[styles.queueRow, i > 0 && styles.divider]} onPress={() => go(q.go)} accessibilityRole="button" accessibilityLabel={`${q.title}, ${q.detail}, ${q.tag}`}>
            <IconTile icon={q.icon} color={q.color} size={phone ? 32 : 36} soft />
            <View style={styles.flex}>
              <Text style={[styles.rowTitle, phone && styles.rowTitleP]} numberOfLines={phone ? 1 : undefined}>
                {phone ? (q.phoneTitle ?? q.title) : q.title}
              </Text>
              <Text style={[styles.rowSub, phone && q.tone === 'red' && i === 0 && styles.redText]}>{phone ? q.phoneDetail : q.detail}</Text>
            </View>
            <Pill label={q.tag} tone={q.tone} small={phone} />
            <Icon name="chevronRight" size={16} color={BODY} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** Flagged students with a one-tap "Intervene" that sends a support pack. */
export function FlaggedStudents({ h, sent, intervene, phone = false }: { h: TeacherHome; sent: ReadonlySet<string>; intervene: (f: Flagged) => void; phone?: boolean }) {
  const go = useTeacherGo();
  const rows = phone ? h.flagged.slice(0, 3) : h.flagged;
  return (
    <View>
      <PanelHead title={phone ? 'Flagged Students' : `Flagged Students (${h.flagged.length})`} link={phone ? 'See All' : 'View All'} onLink={() => go('analytics')} />
      <View style={styles.list}>
        {rows.map((f, i) => {
          const done = sent.has(f.name);
          const scoreTone = f.score >= 50 ? 'amber' : 'red';
          return (
            <View key={f.name} style={[styles.flagRow, i > 0 && styles.divider]}>
              <Image source={f.photo} style={styles.face} accessibilityLabel={f.name} />
              <View style={phone ? styles.flex : styles.flagName}>
                <Text style={styles.rowTitle}>{f.name}</Text>
                <Text style={styles.rowSub} numberOfLines={1}>{f.course}</Text>
              </View>
              <Pill label={`${f.score}%`} tone={scoreTone} />
              {phone ? null : (
                <View style={styles.reason}>
                  <Icon name="alert" size={13} color={toneColor('red')} />
                  <Text style={styles.reasonText} numberOfLines={1}>
                    {f.reason}
                  </Text>
                </View>
              )}
              <Pressable
                style={[styles.intervene, done && styles.intervened]}
                onPress={() => (done ? go('analytics') : intervene(f))}
                accessibilityRole="button"
                accessibilityLabel={done ? `Support sent to ${f.name}. View progress` : `Intervene: send ${f.name} a support pack`}>
                {done ? <Icon name="check" size={13} color={GREEN} /> : null}
                <Text style={[styles.interveneText, done && styles.intervenedText]}>{done ? 'Sent' : 'Intervene'}</Text>
              </Pressable>
              {phone ? null : (
                <Pressable onPress={() => go('analytics')} accessibilityRole="link" accessibilityLabel={`Open ${f.name}'s progress`} hitSlop={8}>
                  <Icon name="chevronRight" size={16} color={BODY} />
                </Pressable>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  stats: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, height: 93, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 11, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: LINE },
  statStrong: { fontSize: 14, fontWeight: '700', color: INK },
  statBlue: { fontSize: 17, fontWeight: '800', color: BLUE },
  statSub: { fontSize: 12.5, color: BODY, marginTop: 1 },
  statBig: { fontSize: 22, fontWeight: '800', color: INK },
  statMoney: { fontSize: 19, fontWeight: '800', color: INK },
  statRed: { fontSize: 11.5, color: RED, marginTop: 3 },
  statPill: { marginTop: 4 },
  statsP: { flexDirection: 'row', gap: 8 },
  statP: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 10, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: LINE },
  statPValue: { fontSize: 14, fontWeight: '800', color: INK },
  statPLabel: { fontSize: 10, color: BODY },
  nextBox: { flexDirection: 'row', gap: 12, marginTop: 12, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: LINE },
  nextBoxP: { padding: 10, gap: 10 },
  nextTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 6 },
  nextTitle: { fontSize: 17, fontWeight: '800', color: INK, letterSpacing: -0.2 },
  nextTitleP: { fontSize: 15 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 7 },
  metaText: { fontSize: 12.5, color: '#2B3445' },
  metaTextP: { fontSize: 11 },
  topic: { marginTop: 8, fontSize: 12.5, color: INK, letterSpacing: -0.1 },
  thumb: { width: 86, height: 84, borderRadius: 8, alignSelf: 'center' },
  thumbP: { width: 70, height: 70, borderRadius: 8 },
  nextActions: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 13 },
  launch: { width: 185 },
  details: { width: 162 },
  more: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: LINE },
  menu: { position: 'absolute', right: 0, bottom: 44, width: 190, paddingVertical: 4, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: LINE, shadowColor: '#0B1424', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 9 },
  menuText: { fontSize: 13, color: INK },
  list: { marginTop: 8 },
  divider: { borderTopWidth: 1, borderColor: '#EEF2F8' },
  queueRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  rowTitle: { fontSize: 13.5, fontWeight: '600', color: INK },
  rowTitleP: { fontSize: 12.5 },
  rowSub: { fontSize: 12, color: MUTED, marginTop: 2 },
  redText: { color: RED },
  flagRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4.5 },
  face: { width: 36, height: 36, borderRadius: 18 },
  flagName: { width: 122 },
  reason: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 2 },
  reasonText: { flex: 1, fontSize: 12, color: '#D93036' },
  intervene: { height: 32, minWidth: 70, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 10, borderRadius: 7, backgroundColor: BLUE },
  intervened: { backgroundColor: '#E6F6EC' },
  interveneText: { fontSize: 12.5, fontWeight: '600', color: '#FFFFFF' },
  intervenedText: { color: GREEN },
});
