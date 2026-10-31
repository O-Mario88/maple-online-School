import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Bar } from '@/features/learner/dashboard/DashParts';
import type { IconName } from '@/lib/icons';

import { Face } from './SquadChat';
import { type Room, type SquadState, type SquadTab, TABS } from './useSquad';

const INK = '#0B1424';
const NAVY = '#0B2A6B';
const BODY = '#4A5263';
const BLUE = '#1463F3';
const GREEN = '#16A34A';
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const TAB_ICON: Record<SquadTab, IconName> = { Overview: 'grid', Chat: 'chat', 'Study Sessions': 'calendar', Resources: 'folder', Tasks: 'check', Members: 'people', Settings: 'settings' };

export const invite = (s: SquadState) =>
  Share.share({ message: `Join my study squad "${s.squad.name}" on Maple with the code ${s.squad.code}. A teacher moderates the chat.` }).catch(() => undefined);

export function CardHead({ icon, title, right }: { icon?: number; title: string; right?: React.ReactNode }) {
  return (
    <View style={styles.cardHead}>
      {icon ? <Image source={icon} style={styles.cardIcon} contentFit="contain" /> : null}
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.flex} />
      {right}
    </View>
  );
}

export function Hero({ room, s, phone = false }: { room: Room; s: SquadState; phone?: boolean }) {
  const [menu, setMenu] = useState(false);
  return (
    <View style={[styles.hero, phone && styles.heroP]}>
      {phone ? null : <Image source={room.icons.hero} style={styles.fill} contentFit="cover" contentPosition="right" accessibilityLabel="A group of learners on a mountain top with a flag" />}
      <View style={styles.heroRow}>
        <View style={[styles.heroIcon, phone && styles.heroIconP]}>
          <Icon name="people" size={phone ? 22 : 30} color="#FFFFFF" />
        </View>
        <View style={styles.flex}>
          <Text style={[styles.heroTitle, phone && styles.heroTitleP]} accessibilityRole="header">
            {s.squad.name}
          </Text>
          <Text style={[styles.heroMeta, phone && styles.heroMetaP]}>{`${s.squad.members.length} members  •  ${s.squad.level}  •  ${s.squad.subject}`}</Text>
          {phone ? null : <Text style={styles.heroText}>{s.squad.tagline}</Text>}
        </View>
        {phone ? null : (
          <View style={styles.heroBtns}>
            <Pressable style={styles.inviteBtn} onPress={() => invite(s)} accessibilityRole="button">
              <Icon name="people" size={15} color={BLUE} />
              <Text style={styles.inviteText}>Invite</Text>
            </Pressable>
            <View>
              <Pressable style={styles.moreBtn} onPress={() => setMenu(!menu)} accessibilityRole="button" accessibilityLabel="Squad options" accessibilityState={{ expanded: menu }}>
                <Icon name="more" size={16} color={INK} />
              </Pressable>
              {menu ? (
                <View style={styles.menu}>
                  {(['Settings', 'Members'] as const).map((t) => (
                    <Pressable
                      key={t}
                      style={styles.menuItem}
                      onPress={() => {
                        s.setTab(t);
                        setMenu(false);
                      }}
                      accessibilityRole="menuitem">
                      <Text style={styles.menuText}>{t === 'Settings' ? 'Squad settings' : 'See members'}</Text>
                    </Pressable>
                  ))}
                  <Pressable
                    style={styles.menuItem}
                    onPress={() => {
                      setMenu(false);
                      s.toast('Thanks. Ms. Achieng will review the squad chat.');
                    }}
                    accessibilityRole="menuitem">
                    <Text style={styles.menuText}>Report a problem</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          </View>
        )}
      </View>
      {phone ? (
        <View style={styles.heroFoot}>
          <View style={styles.faces}>
            {s.squad.members.slice(0, 4).map((id, i) => (
              <View key={id} style={[styles.faceRing, i > 0 && styles.faceOverlap]}>
                <Face s={s} id={id} size={30} />
              </View>
            ))}
            {s.squad.members.length > 4 ? <Text style={styles.morePeople}>{`+${s.squad.members.length - 4}`}</Text> : null}
          </View>
          <Pressable style={styles.inviteBtnP} onPress={() => invite(s)} accessibilityRole="button">
            <Icon name="people" size={15} color="#FFFFFF" />
            <Text style={styles.inviteTextP}>Invite</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

export function Tabs({ s, phone = false }: { s: SquadState; phone?: boolean }) {
  const list: readonly SquadTab[] = phone ? ['Overview', 'Chat', 'Tasks', 'Members'] : TABS;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.tabs, phone && styles.tabsP]} style={styles.tabsBar} accessibilityRole="tablist">
      {list.map((t) => {
        const on = s.tab === t;
        return (
          <Pressable key={t} style={[styles.tab, on && styles.tabOn, phone && styles.tabP]} onPress={() => s.setTab(t)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
            <Icon name={TAB_ICON[t]} size={phone ? 13 : 15} color={on ? BLUE : BODY} />
            <Text style={[styles.tabText, on && styles.tabTextOn, phone && styles.tabTextP]}>{t}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function GoalCard({ room, s, phone = false }: { room: Room; s: SquadState; phone?: boolean }) {
  const g = s.squad.goal;
  return (
    <View style={[styles.card, styles.goal]}>
      <View style={styles.goalTop}>
        <Image source={room.icons.target} style={phone ? styles.targetP : styles.target} contentFit="contain" />
        <View style={styles.flex}>
          <Text style={styles.goalTitle}>Weekly Squad Goal</Text>
          <Text style={styles.goalSub}>{g.label}</Text>
        </View>
        <View style={styles.daysLeft}>
          <Icon name="calendar" size={12} color="#7C3AED" />
          <Text style={styles.daysLeftText}>{`${g.daysLeft} days left`}</Text>
        </View>
      </View>
      <View style={styles.goalBarRow}>
        <View style={styles.flex}>
          <Bar value={g.done / g.target} color="#22A045" track="#E4ECF6" height={phone ? 7 : 12} />
          {phone ? null : <Text style={styles.goalCount}>{`${g.done} / ${g.target}`}</Text>}
        </View>
        {phone ? (
          <Text style={styles.goalCountP}>{`${g.done} / ${g.target}`}</Text>
        ) : (
          <View style={styles.faces}>
            {s.squad.members.slice(0, 3).map((id, i) => (
              <View key={id} style={[styles.faceRing, i > 0 && styles.faceOverlap]}>
                <Face s={s} id={id} size={24} />
              </View>
            ))}
            {s.squad.members.length > 3 ? <Text style={styles.moreSmall}>{`+${s.squad.members.length - 3}`}</Text> : null}
          </View>
        )}
      </View>
      <View style={styles.goalFoot}>
        <Text style={[styles.goalMine, phone && styles.flex]}>
          {"You've done "}
          <Text style={styles.bold}>{g.mine}</Text>
          {phone ? ' questions this week!' : ' questions this week. Keep going!'}
        </Text>
        {phone ? (
          <Pressable onPress={() => router.push('/learn/paper')} accessibilityRole="link" accessibilityLabel="Add practice" hitSlop={8}>
            <Icon name="chevronRight" size={16} color={BLUE} />
          </Pressable>
        ) : (
          <Pressable style={styles.primary} onPress={() => router.push('/learn/paper')} accessibilityRole="button">
            <Text style={styles.primaryText}>Add Practice</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export function StreakCard({ room, s }: { room: Room; s: SquadState }) {
  const [open, setOpen] = useState(false);
  const done = s.squad.streak.week.filter((d) => d === 'done').length;
  return (
    <View style={[styles.card, styles.streak]}>
      <View style={styles.streakTop}>
        <Image source={room.icons.flame} style={styles.flame} contentFit="contain" />
        <View style={styles.flex}>
          <Text style={styles.goalTitle}>Squad Streak</Text>
          <Text style={styles.streakDays}>{`${s.squad.streak.days} days`}</Text>
          <Text style={styles.streakSub}>Great consistency, squad!</Text>
        </View>
        <Pressable style={styles.chev} onPress={() => setOpen(!open)} accessibilityRole="button" accessibilityLabel="How the streak works" accessibilityState={{ expanded: open }}>
          <Icon name={open ? 'chevronDown' : 'chevronRight'} size={15} color={BLUE} />
        </Pressable>
      </View>
      {open ? <Text style={styles.streakHelp}>{`The streak grows each day at least half the squad practises. ${done} days done this week; today still counts until midnight.`}</Text> : null}
      <View style={styles.week}>
        {s.squad.streak.week.map((d, i) => (
          <View key={DAYS[i]} style={styles.day} accessibilityLabel={`${DAYS[i]}: ${d === 'done' ? 'done' : d === 'today' ? 'today, not yet' : 'still to come'}`}>
            <View style={[styles.dayDot, d === 'done' && styles.dayDone, d === 'today' && styles.dayToday]}>{d === 'next' ? null : <Icon name="check" size={11} color={d === 'done' ? '#FFFFFF' : '#8EA2C4'} />}</View>
            <Text style={styles.dayName}>{DAYS[i]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function Leaderboard({ room, s, limit }: { room: Room; s: SquadState; limit?: number }) {
  const [open, setOpen] = useState(false);
  const rows = limit ? s.board.slice(0, limit) : s.board;
  return (
    <View style={[styles.card, styles.board]}>
      <CardHead
        icon={room.icons.trophy}
        title="Leaderboard"
        right={
          <View>
            <Pressable style={styles.period} onPress={() => setOpen(!open)} accessibilityRole="button" accessibilityState={{ expanded: open }}>
              <Text style={styles.periodText}>{s.period === 'week' ? 'This Week' : 'This Month'}</Text>
              <Icon name="chevronDown" size={12} color={INK} />
            </Pressable>
            {open ? (
              <View style={styles.periodMenu}>
                {(['week', 'month'] as const).map((p) => (
                  <Pressable
                    key={p}
                    style={styles.menuItem}
                    onPress={() => {
                      s.setPeriod(p);
                      setOpen(false);
                    }}
                    accessibilityRole="menuitem">
                    <Text style={styles.menuText}>{p === 'week' ? 'This Week' : 'This Month'}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        }
      />
      <View style={styles.rows}>
        {rows.map((r) => {
          const me = r.id === s.me;
          return (
            <View key={r.id} style={[styles.rankRow, me && styles.rankMe]} accessibilityLabel={`${r.rank}. ${r.name}${me ? ' (you)' : ''}: ${r.score} questions`}>
              <View style={styles.rank}>
                {r.rank === 1 ? <Image source={room.icons.medal} style={styles.medal} contentFit="contain" /> : r.rank === 3 ? <Image source={room.icons.crown} style={styles.crown} contentFit="contain" /> : <Text style={[styles.rankText, me && styles.blue]}>{r.rank}</Text>}
              </View>
              <Face s={s} id={r.id} size={28} />
              <Text style={[styles.rankName, me && styles.rankNameMe]}>{me ? `${r.name} (You)` : r.name}</Text>
              <Text style={[styles.rankScore, r.rank === 1 && styles.gold, me && styles.blue]}>{r.score}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function Sessions({ room, s, limit }: { room: Room; s: SquadState; limit?: number }) {
  const list = limit ? s.squad.sessions.slice(0, limit) : s.squad.sessions;
  return (
    <View style={[styles.card, styles.pad]}>
      <CardHead icon={room.icons.calendar} title={limit === 1 ? 'Upcoming Study Session' : 'Upcoming Study Sessions'} right={limit ? null : <Pill label="See All" onPress={() => s.setTab('Study Sessions')} />} />
      {list.map((x, i) => (
        <View key={x.id} style={[styles.session, i > 0 && styles.divider]}>
          <Image source={x.icon} style={styles.sessionIcon} contentFit="contain" />
          <View style={styles.flex}>
            <Text style={styles.when}>{x.when}</Text>
            <Text style={styles.sessionTitle}>{x.title}</Text>
            <View style={styles.going}>
              <View style={styles.faces}>
                {x.going.map((id, k) => (
                  <View key={id} style={[styles.faceRing, k > 0 && styles.faceOverlapS]}>
                    <Face s={s} id={id} size={22} />
                  </View>
                ))}
              </View>
              <Text style={styles.goingText}>{`${x.count} going`}</Text>
              <View style={styles.flex} />
          {x.live ? (
            <Pressable style={styles.join} onPress={() => router.push('/learn/live-room')} accessibilityRole="button" accessibilityLabel={`Join ${x.title}`}>
              <Text style={styles.primaryText}>Join</Text>
            </Pressable>
          ) : (
            <Pressable style={[styles.remind, s.reminded(x.id) && styles.remindOn]} onPress={() => s.remind(x.id, x.title)} accessibilityRole="button" accessibilityState={{ selected: s.reminded(x.id) }}>
              <Text style={styles.remindText}>{s.reminded(x.id) ? 'Reminder set' : 'Remind Me'}</Text>
            </Pressable>
          )}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

function Pill({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.pill} onPress={onPress} accessibilityRole="link">
      <Text style={styles.pillText}>{label}</Text>
    </Pressable>
  );
}

export function Resources({ room, s }: { room: Room; s: SquadState }) {
  return (
    <View style={[styles.card, styles.pad]}>
      <CardHead icon={room.icons.resources} title="Shared Resources" right={<Pill label="See All" onPress={() => s.setTab('Resources')} />} />
      <View style={styles.rows}>
        {s.squad.resources.map((r) => (
          <View key={r.id} style={styles.res}>
            <Image source={room.resourceIcons[r.kind]} style={styles.resIcon} contentFit="contain" />
            <View style={styles.flex}>
              <Text style={styles.resTitle}>{r.title}</Text>
              <Text style={styles.resMeta}>{r.meta}</Text>
              <Text style={styles.resMeta}>{`Added by ${s.person(r.by).name}`}</Text>
            </View>
            <Pressable style={[styles.dl, s.downloaded(r.id) && styles.dlOn]} onPress={() => s.download(r.id, r.title)} accessibilityRole="button" accessibilityLabel={s.downloaded(r.id) ? `${r.title} saved` : `Download ${r.title}`}>
              <Icon name={s.downloaded(r.id) ? 'check' : 'download'} size={15} color={s.downloaded(r.id) ? GREEN : BLUE} />
            </Pressable>
            <Pressable onPress={() => router.push('/learn/library')} accessibilityRole="button" accessibilityLabel={`Open ${r.title} in the library`} hitSlop={8}>
              <Icon name="more" size={15} color={BODY} />
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

export function Tasks({ s }: { s: SquadState }) {
  return (
    <View style={[styles.card, styles.pad]}>
      <CardHead title="Squad Tasks" right={<Text style={styles.small}>{`${s.squad.tasks.filter((t) => s.taskDone(t.id)).length} of ${s.squad.tasks.length} done`}</Text>} />
      <View style={styles.rows}>
        {s.squad.tasks.map((t) => {
          const on = s.taskDone(t.id);
          return (
            <Pressable key={t.id} style={styles.task} onPress={() => s.toggleTask(t.id)} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
              <View style={[styles.box, on && styles.boxOn]}>{on ? <Icon name="check" size={12} color="#FFFFFF" /> : null}</View>
              <View style={styles.flex}>
                <Text style={[styles.taskTitle, on && styles.taskDone]}>{t.title}</Text>
                <Text style={styles.resMeta}>{`${t.who} • ${on ? 'Done' : `Due ${t.due}`}`}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function Members({ s }: { s: SquadState }) {
  return (
    <View style={[styles.card, styles.pad]}>
      <CardHead title={`Members (${s.members.length} of 8)`} right={<Pill label="Invite" onPress={() => invite(s)} />} />
      <View style={styles.memberGrid}>
        {s.members.map((m) => (
          <View key={m.id} style={styles.member}>
            <Face s={s} id={m.id} size={44} />
            <Text style={styles.memberName}>{m.id === s.me ? `${m.name} (You)` : m.name}</Text>
            <Text style={styles.resMeta}>{`${m.scores.week} questions this week`}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.small}>{`Squads hold 5 to 8 learners. ${s.squad.moderator} is the teacher moderator.`}</Text>
    </View>
  );
}

export function Settings({ s }: { s: SquadState }) {
  const [on, setOn] = useState<readonly string[]>(['chat', 'sessions']);
  const rows = [
    { key: 'chat', label: 'New chat messages', hint: 'A quiet badge, no sound after 8 PM' },
    { key: 'sessions', label: 'Study session reminders', hint: '15 minutes before each session' },
    { key: 'goal', label: 'Weekly goal summary', hint: 'Every Sunday evening' },
  ];
  return (
    <View style={[styles.card, styles.pad]}>
      <CardHead title="Squad Settings" />
      {rows.map((r) => {
        const v = on.includes(r.key);
        return (
          <Pressable key={r.key} style={styles.setting} onPress={() => setOn((x) => (v ? x.filter((k) => k !== r.key) : [...x, r.key]))} accessibilityRole="switch" accessibilityState={{ checked: v }}>
            <View style={styles.flex}>
              <Text style={styles.taskTitle}>{r.label}</Text>
              <Text style={styles.resMeta}>{r.hint}</Text>
            </View>
            <View style={[styles.switch, v && styles.switchOn]}>
              <View style={[styles.knob, v && styles.knobOn]} />
            </View>
          </Pressable>
        );
      })}
      <View style={styles.safety}>
        <Icon name="shield" size={16} color={GREEN} />
        <Text style={styles.safetyText}>{`Chat is moderated by ${s.squad.moderator}. Phone numbers, email addresses, outside links and unkind words are held back before they are posted.`}</Text>
      </View>
      <Text style={styles.small}>{`Join code: ${s.squad.code}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  bold: { fontWeight: '700', color: INK },
  blue: { color: BLUE },
  gold: { color: '#C2410C' },
  small: { fontSize: 11, color: BODY },
  hero: { height: 136, justifyContent: 'center', paddingHorizontal: 22, borderTopLeftRadius: 10, borderTopRightRadius: 10, backgroundColor: '#14203F', overflow: 'hidden' },
  heroP: { height: 'auto', gap: 14, padding: 14, borderRadius: 12 },
  heroRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 18 },
  heroIcon: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#2563EB' },
  heroIconP: { width: 42, height: 42, borderRadius: 10 },
  heroTitle: { fontSize: 26, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.4 },
  heroTitleP: { fontSize: 17 },
  heroMeta: { marginTop: 6, fontSize: 14, color: '#E2E8F5' },
  heroMetaP: { marginTop: 4, fontSize: 11.5 },
  heroText: { marginTop: 12, fontSize: 12.5, lineHeight: 18, color: '#E2E8F5' },
  heroBtns: { flexDirection: 'row', gap: 10, marginRight: 270 },
  inviteBtn: { height: 34, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, borderRadius: 6, backgroundColor: '#FFFFFF' },
  inviteText: { fontSize: 12.5, fontWeight: '600', color: BLUE },
  moreBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 6, backgroundColor: '#FFFFFF' },
  menu: { position: 'absolute', top: 38, right: 0, width: 170, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#E1E7F0', backgroundColor: '#FFFFFF', zIndex: 5 },
  menuItem: { height: 30, justifyContent: 'center', paddingHorizontal: 12 },
  menuText: { fontSize: 12, color: INK },
  heroFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inviteBtnP: { height: 34, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, borderRadius: 6, backgroundColor: '#0B6BFF' },
  inviteTextP: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  faces: { flexDirection: 'row', alignItems: 'center' },
  faceRing: { borderRadius: 20, borderWidth: 2, borderColor: '#FFFFFF' },
  faceOverlap: { marginLeft: -8 },
  faceOverlapS: { marginLeft: -6 },
  morePeople: { marginLeft: -6, width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: '#FFFFFF', backgroundColor: '#E8EEF8', fontSize: 11, fontWeight: '600', lineHeight: 26, color: NAVY, textAlign: 'center', overflow: 'hidden' },
  moreSmall: { marginLeft: -6, width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: '#FFFFFF', backgroundColor: '#E8EEF8', fontSize: 10, fontWeight: '600', lineHeight: 22, color: NAVY, textAlign: 'center', overflow: 'hidden' },
  tabsBar: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: '#E6ECF5', backgroundColor: '#FFFFFF' },
  tabs: { gap: 4, paddingHorizontal: 14 },
  tabsP: { paddingHorizontal: 0 },
  tab: { height: 40, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabP: { paddingHorizontal: 9 },
  tabOn: { borderBottomColor: '#0B6BFF' },
  tabText: { fontSize: 12.5, color: BODY },
  tabTextP: { fontSize: 11.5 },
  tabTextOn: { fontWeight: '600', color: BLUE },
  card: { borderRadius: 10, borderWidth: 1, borderColor: '#EAEFF6', backgroundColor: '#FFFFFF' },
  pad: { padding: 14, gap: 12 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 3 },
  cardIcon: { width: 18, height: 18 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: NAVY },
  goal: { gap: 12, padding: 14 },
  goalTop: { flexDirection: 'row', gap: 12 },
  target: { width: 36, height: 36 },
  targetP: { width: 30, height: 30 },
  goalTitle: { fontSize: 14, fontWeight: '700', color: NAVY },
  goalSub: { marginTop: 4, fontSize: 12, color: BODY },
  daysLeft: { height: 24, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, borderRadius: 6, backgroundColor: '#F4EEFE' },
  daysLeftText: { fontSize: 11, fontWeight: '500', color: INK },
  goalBarRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  goalCount: { marginTop: 6, fontSize: 12, color: INK, textAlign: 'center' },
  goalCountP: { fontSize: 12.5, fontWeight: '600', color: INK },
  goalFoot: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  goalMine: { paddingHorizontal: 10, paddingVertical: 9, borderRadius: 6, backgroundColor: '#F4F7FB', fontSize: 11, letterSpacing: -0.2, color: BODY, overflow: 'hidden' },
  primary: { height: 36, justifyContent: 'center', paddingHorizontal: 13, borderRadius: 6, backgroundColor: '#0B6BFF' },
  primaryText: { fontSize: 12.5, fontWeight: '600', color: '#FFFFFF' },
  streak: { gap: 12, padding: 14 },
  streakTop: { flexDirection: 'row', gap: 10 },
  flame: { width: 30, height: 34 },
  streakDays: { fontSize: 22, fontWeight: '700', color: '#15603A' },
  chev: { position: 'absolute', top: 0, right: 0, width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: '#F2F6FD' },
  streakSub: { marginTop: 4, fontSize: 11, color: BODY },
  streakHelp: { fontSize: 11, lineHeight: 15, color: BODY },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: 4 },
  dayDot: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1.5, borderColor: '#D5DDEA' },
  dayDone: { borderColor: GREEN, backgroundColor: GREEN },
  dayToday: { borderColor: '#C9D6EE', backgroundColor: '#E8EEF8' },
  dayName: { fontSize: 9.5, color: BODY },
  board: { padding: 14, gap: 10 },
  period: { height: 26, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, borderRadius: 5, borderWidth: 1, borderColor: '#DCE3EE' },
  periodText: { fontSize: 11, color: INK },
  periodMenu: { position: 'absolute', top: 30, right: 0, width: 120, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#E1E7F0', backgroundColor: '#FFFFFF' },
  rows: { gap: 4 },
  rankRow: { height: 36, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 6, borderRadius: 6 },
  rankMe: { backgroundColor: '#EEF4FF' },
  rank: { width: 26, alignItems: 'center' },
  medal: { width: 26, height: 20 },
  crown: { width: 18, height: 18 },
  rankText: { fontSize: 12.5, color: INK },
  rankName: { flex: 1, fontSize: 12, color: INK },
  rankNameMe: { fontWeight: '600', color: BLUE },
  rankScore: { fontSize: 12.5, fontWeight: '600', color: INK },
  session: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  divider: { paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EEF1F6' },
  sessionIcon: { width: 28, height: 28, alignSelf: 'flex-start' },
  when: { fontSize: 10.5, color: BODY },
  sessionTitle: { marginTop: 3, fontSize: 12, fontWeight: '600', color: INK },
  going: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  goingText: { fontSize: 11, color: BODY },
  join: { height: 30, justifyContent: 'center', paddingHorizontal: 18, borderRadius: 6, backgroundColor: '#0B6BFF' },
  remind: { height: 30, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: '#C9DAF8' },
  remindOn: { backgroundColor: '#EEF4FF' },
  remindText: { fontSize: 11.5, fontWeight: '600', color: BLUE },
  pill: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5, backgroundColor: '#F2F6FD' },
  pillText: { fontSize: 11, color: BLUE },
  res: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5 },
  resIcon: { width: 34, height: 34 },
  resTitle: { fontSize: 10.5, fontWeight: '600', color: INK, letterSpacing: -0.2 },
  resMeta: { marginTop: 1, fontSize: 10, color: BODY },
  dl: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 6, borderWidth: 1, borderColor: '#DCE6F7' },
  dlOn: { borderColor: '#BBE5C8', backgroundColor: '#ECF8F0' },
  task: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  box: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 5, borderWidth: 1.5, borderColor: '#9AA4B5' },
  boxOn: { borderColor: GREEN, backgroundColor: GREEN },
  taskTitle: { fontSize: 12.5, fontWeight: '500', color: INK },
  taskDone: { color: BODY, textDecorationLine: 'line-through' },
  memberGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  member: { width: 150, alignItems: 'center', gap: 4, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#EEF1F6' },
  memberName: { marginTop: 4, fontSize: 12, fontWeight: '600', color: INK },
  setting: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  switch: { width: 38, height: 22, justifyContent: 'center', paddingHorizontal: 2, borderRadius: 11, backgroundColor: '#D5DDEA' },
  switchOn: { backgroundColor: '#0B6BFF' },
  knob: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFFFFF' },
  knobOn: { alignSelf: 'flex-end' },
  safety: { flexDirection: 'row', gap: 8, padding: 10, borderRadius: 8, backgroundColor: '#ECF8F0' },
  safetyText: { flex: 1, fontSize: 11.5, lineHeight: 16, color: '#14532D' },
});
