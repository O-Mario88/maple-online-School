import { Image } from '@/components/picture';
import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { PremiumTiles } from '@/features/portal/Premium';
import type { IconName } from '@/lib/icons';
import { heroMessage } from '@/lib/learner-home';
import { toast } from '@/lib/toast';
import type { AssignmentProjectTab } from '@/mock/learner-home';

import { BLUE, BODY, type Home, INK } from './HomeFrame';
import { styles } from './HomeCards.styles';
import { Maple } from '@/constants/maple';
import { PAGE_TITLE } from '@/lib/fonts/type';

const WAVE_BARS = [6, 12, 9, 16, 20, 13, 8, 15, 22, 18, 10, 14, 19, 11, 7, 14, 17, 10, 13, 8, 5, 9, 6, 4];

export function CardHead({
  icon,
  color,
  title,
  link,
  onLink,
  children,
}: {
  icon?: IconName;
  color?: string;
  title: string;
  link?: string;
  onLink?: () => void;
  children?: ReactNode;
}) {
  return (
    <View style={styles.head}>
      {icon ? <Icon name={icon} size={15} color={color ?? BLUE} /> : null}
      <Text style={styles.headTitle} numberOfLines={1}>
        {title}
      </Text>
      {children}
      <View style={styles.flex} />
      {link ? (
        <Pressable style={styles.link} onPress={onLink} accessibilityRole="link" hitSlop={8}>
          <Text style={styles.linkText}>{link}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** One labelled progress bar in the hero's inset panel. */
function HeroMeter({ label, value, display }: { label: string; value: number; display: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  return (
    <View style={styles.heroGoal} accessible accessibilityLabel={`${label}, ${display}`}>
      <View style={styles.heroGoalHead}>
        <Text style={styles.heroGoalText} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.heroGoalValue}>{display}</Text>
      </View>
      <View style={styles.heroTrack}>
        <View style={[styles.heroBar, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

/**
 * The learner's greeting: one Maple Blue panel with a heading, one sentence about
 * their progress and Continue Learning, plus this week's tasks and current goal
 * (the numbers below the hero are not repeated here).
 */
export function Hero({ h, phone = false }: { h: Home; phone?: boolean }) {
  const title = h.hero.title.replace(/!$/, '');
  const message = heroMessage(h.subjects);
  if (phone) return <HeroPhone title={title} message={message} />;
  const done = h.todoWeek.filter((t) => t.done).length;
  const total = h.todoWeek.length;
  const goal = h.goals[0];
  return (
    <View style={styles.hero}>
      <View style={styles.heroCopy}>
        <Text style={styles.heroTitle} {...PAGE_TITLE}>
          {title}
        </Text>
        <Text style={styles.heroSub}>{message}</Text>
        <View style={styles.heroActions}>
          <HeroButton label="Continue Learning" icon="playFill" onPress={() => router.push('/learn/course')} primary />
          <HeroButton label="View My Plan" icon="map" onPress={() => router.push('/learn/plan')} />
        </View>
      </View>
      <View style={styles.heroPanel}>
        <View style={styles.heroWeek}>
          <Icon name="calendar" size={12} color={Maple.onBlueMuted} />
          <Text style={styles.heroWeekText}>{`This week · ${h.weekRange}`}</Text>
        </View>
        {total > 0 ? <HeroMeter label="Tasks done this week" value={done / total} display={`${done} of ${total}`} /> : null}
        {goal ? <HeroMeter label={`Goal: ${goal.title}`} value={goal.value} display={goal.label} /> : null}
      </View>
    </View>
  );
}

function HeroButton({ label, icon, onPress, primary = false }: { label: string; icon: IconName; onPress: () => void; primary?: boolean }) {
  return (
    <Pressable
      style={({ hovered, pressed }: { hovered?: boolean; pressed: boolean }) => [
        primary ? styles.heroBtn : styles.heroBtnGhost,
        (hovered || pressed) && (primary ? styles.heroBtnHover : styles.heroBtnGhostHover),
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <Icon name={icon} size={13} color={primary ? Maple.blue : Maple.white} />
      <Text style={primary ? styles.heroBtnText : styles.heroBtnGhostText}>{label}</Text>
    </Pressable>
  );
}

/** Phones: the same panel stacked: greeting, sentence and Continue Learning (the numbers follow in My Progress). */
function HeroPhone({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.heroPhone}>
      <Text style={styles.heroPhoneTitle} {...PAGE_TITLE}>
        {title}
      </Text>
      <Text style={styles.heroPhoneSub}>{message}</Text>
      <Pressable style={styles.heroPhoneBtn} onPress={() => router.push('/learn/course')} accessibilityRole="button" accessibilityLabel="Continue Learning">
        <Icon name="playFill" size={15} color={Maple.blue} />
        <Text style={styles.heroPhoneBtnText}>Continue Learning</Text>
      </Pressable>
    </View>
  );
}

/** 6 KPI Summary Cards Row (`89% Overall Progress`, `3 Achievements`, `6 Active Classes`, `4 Assignments Due`, `2 Tests This Week`, `1 Project in Progress`). */
export function KpiRow({ h, phone = false }: { h: Home; phone?: boolean }) {
  if (phone) return <KpiGridPhone h={h} />;
  return (
    <View style={styles.kpiRow}>
      {h.kpis.map((k) => (
        <Pressable
          key={k.id}
          style={[styles.kpiCard, k.delta && styles.kpiCardWide]}
          onPress={() => router.push(k.href)}
          accessibilityRole="link"
          accessibilityLabel={`${k.value} ${k.label}`}>
          <View style={[styles.kpiIconWrap, { backgroundColor: k.bg }]}>
            <Icon name={k.icon} size={17} color={k.color} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.kpiVal}>{k.value}</Text>
            <Text style={styles.kpiLabel} numberOfLines={2}>
              {k.label}
            </Text>
          </View>
          {k.delta ? (
            <View style={styles.kpiDeltaCol}>
              <View style={styles.kpiDeltaPill}>
                <Text style={styles.kpiDeltaText}>{`↑ ${k.delta}`}</Text>
              </View>
              {k.deltaSub ? <Text style={styles.kpiDeltaSub}>{k.deltaSub}</Text> : null}
            </View>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

/** Phones: the six numbers as premium tiles, two to a row (the change sits under the figure). */
function KpiGridPhone({ h }: { h: Home }) {
  return <PremiumTiles title="My Progress" subtitle="How your learning is going this week." minHeight={146} items={h.kpis.map((k) => ({ label: k.label, value: k.value, icon: k.icon, tone: 'blue' as const, color: k.color, delta: k.delta, caption: k.deltaSub, onPress: () => router.push(k.href) }))} />;
}

const SUBJECT_TABS = ['All Subjects', 'This Term', 'Trend'] as const;
type SubjectTab = (typeof SUBJECT_TABS)[number];

/** My Subjects card with 6 pastel subject tiles (`Mathematics`, `English`, `Science`, `Social Studies`, `ICT`, `Agriculture`). */
export function MySubjectsCard({ h, phone = false }: { h: Home; phone?: boolean }) {
  const [tab, setTab] = useState<SubjectTab>('All Subjects');
  return (
    <View>
      {/* Phones: the subject tabs sit under the title, where they have the full width. */}
      <View style={phone ? styles.headPhone : styles.head}>
        <Text style={styles.sectionTitle}>My Subjects</Text>
        {phone ? null : <View style={styles.flex} />}
        <View style={styles.pillTabs} accessibilityRole="tablist">
          {SUBJECT_TABS.map((t) => {
            const on = t === tab;
            return (
              <Pressable
                key={t}
                style={[styles.pillTab, on && styles.pillTabOn]}
                onPress={() => setTab(t)}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}>
                <Text style={[styles.pillTabText, on && styles.pillTabTextOn]}>{t}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      {/* Phones: two rows of three, so each name, score and change has room. */}
      <View style={phone ? styles.subjectsGridPhone : styles.subjectsGrid}>
        {h.subjects.map((s) => (
          <Pressable
            key={s.id}
            style={[phone ? styles.subjectTilePhone : styles.subjectTile, phone ? { backgroundColor: `${s.color}1A`, borderColor: `${s.color}26` } : { backgroundColor: s.bg }]}
            onPress={() => router.push(s.href)}
            accessibilityRole="link"
            accessibilityLabel={`${s.subject}: ${s.score}, up ${s.delta}`}>
            <View style={[styles.subjectIconBox, { backgroundColor: s.iconBg }]}>
              <Icon name={s.icon} size={15} color={s.color} />
            </View>
            <Text style={[phone ? styles.subjectNamePhone : styles.subjectName, phone && { color: s.color }]} numberOfLines={2}>
              {s.subject}
            </Text>
            <View style={phone ? styles.subjectScoreRowPhone : styles.subjectScoreRow}>
              <Text style={[phone ? styles.subjectScorePhone : styles.subjectScore, phone && { color: s.color }]}>{s.score}</Text>
              <Text style={phone ? styles.subjectDeltaPhone : styles.subjectDelta}>{`↑${s.delta}`}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** Voice note card from Daniel's teacher (`Ms. Sarah N. • Mathematics Teacher`). */
export function TeacherVoiceCard({ h, phone = false }: { h: Home; phone?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const m = h.teacherMessage;
  return (
    // Phones: the quote wraps onto its own row under the player.
    <View style={phone ? styles.voiceCardInnerPhone : styles.voiceCardInner}>
      <Image decorative source={m.avatar} style={styles.teacherAvatar} contentFit="cover" />
      <View style={phone ? styles.voiceCenterPhone : styles.voiceCenter}>
        <Text style={styles.voiceHeading}>{m.heading}</Text>
        <Text style={styles.voiceTeacher}>{m.teacher}</Text>
        <View style={styles.playerRow}>
          <Pressable
            style={styles.playBtn}
            onPress={() => {
              setPlaying((p) => !p);
              toast(playing ? 'Paused teacher voice note.' : "Playing Ms. Sarah N.'s voice note...");
            }}
            accessibilityRole="button"
            accessibilityLabel={playing ? 'Pause teacher message' : 'Play teacher message'}>
            <Icon name={playing ? 'pause' : 'playFill'} size={12} color={Maple.surface} />
          </Pressable>
          <View style={styles.waveRow}>
            {WAVE_BARS.map((height, idx) => (
              <View
                key={idx}
                style={[
                  styles.waveBar,
                  {
                    height,
                    backgroundColor: playing || idx < 14 ? BLUE : Maple.borderStrong,
                  },
                ]}
              />
            ))}
          </View>
          <Text style={styles.durationText}>{playing ? '0:08 / 0:20' : m.duration}</Text>
        </View>
      </View>
      <View style={phone ? styles.voiceQuoteBoxPhone : styles.voiceQuoteBox}>
        <Text style={styles.voiceQuoteWatermark}>“</Text>
        <Text style={styles.voiceQuoteText}>{m.quote}</Text>
      </View>
    </View>
  );
}

/** Upcoming Live Classes card (`Live in 2h Mathematics Live Class`, `Tue 27 Oct Science Revision`, `Thu 29 Oct English Reading Clinic`). */
export function UpcomingLiveClassesCard({ h }: { h: Home }) {
  return (
    <View>
      <CardHead icon="live" color={BLUE} title="Upcoming Live Classes" link="View All" onLink={() => router.push('/learn/live')} />
      <View style={styles.liveList}>
        {h.upcomingLiveClasses.map((c) => (
          <Pressable
            key={c.id}
            style={[styles.liveRow, c.liveSoon && styles.liveRowHighlight]}
            onPress={() => router.push(c.href)}
            accessibilityRole="link"
            accessibilityLabel={`${c.title}, ${c.time}`}>
            {c.liveSoon ? (
              <View style={styles.liveInBadge}>
                <Icon name="video" size={11} color={Maple.error} />
                <Text style={styles.liveInText}>{c.badge}</Text>
              </View>
            ) : (
              <View style={styles.liveDateCell}>
                <View style={styles.liveCalIcon}>
                  <Icon name="calendar" size={12} color={BLUE} />
                </View>
                <View>
                  <Text style={styles.liveDow}>{c.dayDow}</Text>
                  <Text style={styles.liveDate}>{c.dayDate}</Text>
                </View>
              </View>
            )}
            <View style={styles.flex}>
              <Text style={styles.liveTitle} numberOfLines={1}>
                {c.title}
              </Text>
              <Text style={styles.liveTime} numberOfLines={1}>
                {c.time}
              </Text>
            </View>
            <Icon name="chevronRight" size={13} color={BODY} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const AP_TABS: readonly AssignmentProjectTab[] = ['All (7)', 'Assignments (4)', 'Projects (1)', 'Tests (2)'];

/** My Assignments & Projects card with filter pills and 4 items. */
export function AssignmentsProjectsCard({ h }: { h: Home }) {
  const [tab, setTab] = useState<AssignmentProjectTab>('All (7)');
  const rows =
    tab === 'All (7)'
      ? h.assignmentsAndProjects
      : h.assignmentsAndProjects.filter((r) => r.tab === tab);
  return (
    <View>
      <CardHead
        icon="clipboard"
        color={BLUE}
        title="My Assignments & Projects"
        link="View All"
        onLink={() => router.push('/learn/assignments')}
      />
      <View style={styles.apTabs} accessibilityRole="tablist">
        {AP_TABS.map((t) => {
          const on = t === tab;
          return (
            <Pressable
              key={t}
              style={[styles.apTab, on && styles.apTabOn]}
              onPress={() => setTab(t)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}>
              <Text style={[styles.apTabText, on && styles.apTabTextOn]}>{t}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.apList}>
        {rows.map((r) => (
          <Pressable
            key={r.id}
            style={styles.apRow}
            onPress={() => router.push(r.href)}
            accessibilityRole="link"
            accessibilityLabel={`${r.title}, ${r.sub}, ${r.status}`}>
            <View style={[styles.apIcon, { backgroundColor: r.bg }]}>
              <Icon name={r.icon} size={13} color={r.color} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.apTitle} numberOfLines={2}>
                {r.title}
              </Text>
              <Text style={styles.apSub} numberOfLines={1}>
                {r.sub}
              </Text>
            </View>
            <View style={[styles.statusPill, r.tone === 'good' ? styles.statusGood : styles.statusDanger]}>
              <Text style={[styles.statusText, r.tone === 'good' ? styles.statusTextGood : styles.statusTextDanger]}>
                {r.status}
              </Text>
            </View>
            <Icon name="chevronRight" size={12} color={BODY} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** Recent Work card (`End of Topic Test – Fractions 92%`, `Reading Comprehension 85%`, `Investigating Soil Types (AoI) 88%`, `Community Health Project Submitted`). */
export function RecentWorkCard({ h }: { h: Home }) {
  return (
    <View>
      <CardHead
        icon="clipboard"
        color={BLUE}
        title="Recent Work"
        link="View All"
        onLink={() => router.push('/learn/passport')}
      />
      <View style={styles.rwList}>
        {h.recentWork.map((r) => {
          const graded = r.status === 'Graded';
          return (
            <Pressable
              key={r.id}
              style={styles.rwRow}
              onPress={() => router.push(r.href)}
              accessibilityRole="link"
              accessibilityLabel={`${r.title}, ${r.sub}, ${r.status} ${r.score}`}>
              <View style={[styles.apIcon, { backgroundColor: r.bg }]}>
                <Icon name={r.icon} size={13} color={r.color} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.apTitle} numberOfLines={2}>
                  {r.title}
                </Text>
                <Text style={styles.apSub} numberOfLines={1}>
                  {r.sub}
                </Text>
              </View>
              <View style={[styles.statusPill, graded ? styles.statusGood : styles.statusInfo]}>
                <Text style={[styles.statusText, graded ? styles.statusTextGood : styles.statusTextInfo]}>
                  {r.status}
                </Text>
              </View>
              <Text style={styles.rwScore}>{r.score}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** This Week's Achievements card. */
export function WeekAchievementsCard({ h }: { h: Home }) {
  return (
    <View style={styles.flex}>
      <CardHead icon="trophy" color={Maple.warning} title="This Week's Achievements" />
      <View style={styles.achList}>
        {h.weekAchievements.map((a) => (
          <View key={a.id} style={styles.achRow}>
            <View style={styles.achCheck}>
              <Icon name="check" size={11} color={Maple.surface} />
            </View>
            <Text style={styles.achText}>{a.text}</Text>
            <Text style={styles.achDate}>{a.date}</Text>
          </View>
        ))}
      </View>
      <Pressable
        style={styles.achFooter}
        onPress={() => router.push('/learn/passport')}
        accessibilityRole="link"
        accessibilityLabel="View All Achievements">
        <Text style={styles.linkText}>View All Achievements</Text>
        <Icon name="arrowRight" size={12} color={BLUE} />
      </Pressable>
    </View>
  );
}

/** My Learning Journey 6-step horizontal stepper. */
export function LearningJourneyCard({ h, phone = false }: { h: Home; phone?: boolean }) {
  if (phone) return <LearningJourneyPhone h={h} />;
  return (
    <View>
      <Text style={styles.sectionTitle}>My Learning Journey</Text>
      <View style={styles.journeyRow}>
        <View style={styles.journeyTrack} />
        <View style={styles.journeyTrackDone} />
        {h.learningJourney.map((s) => {
          const isDone = s.state === 'done';
          const isCurrent = s.state === 'current';
          return (
            <View key={s.id} style={styles.journeyStep}>
              <View
                style={[
                  styles.journeyCircle,
                  isDone && styles.journeyCircleDone,
                  isCurrent && styles.journeyCircleCurrent,
                ]}>
                <Icon
                  name={s.icon}
                  size={13}
                  color={isDone || isCurrent ? Maple.surface : Maple.secondary}
                />
              </View>
              <Text style={[styles.journeyTitle, isCurrent && { color: INK, fontWeight: '800' }]}>
                {s.title}
              </Text>
              <Text style={styles.journeySub}>{s.sub}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/** Phones: the six steps as a vertical list (six 62px steps don't fit across a phone card). */
function LearningJourneyPhone({ h }: { h: Home }) {
  const last = h.learningJourney.length - 1;
  return (
    <View>
      <Text style={styles.sectionTitle}>My Learning Journey</Text>
      <View style={styles.journeyListPhone}>
        {h.learningJourney.map((s, i) => {
          const isDone = s.state === 'done';
          const isCurrent = s.state === 'current';
          return (
            <View key={s.id} style={styles.journeyRowPhone}>
              <View style={styles.journeyRailPhone}>
                <View style={[styles.journeyCircle, isDone && styles.journeyCircleDone, isCurrent && styles.journeyCircleCurrent]}>
                  <Icon name={s.icon} size={13} color={isDone || isCurrent ? Maple.surface : Maple.secondary} />
                </View>
                {i < last ? <View style={[styles.journeyLinePhone, isDone && styles.journeyLineDonePhone]} /> : null}
              </View>
              <View style={styles.journeyTextPhone}>
                <Text style={[styles.journeyTitlePhone, isCurrent && styles.journeyTitleCurrentPhone]}>{s.title}</Text>
                <Text style={styles.journeySubPhone}>{s.sub}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/** Recommended for You 4-item card. */
export function RecommendedCard({ h }: { h: Home }) {
  return (
    <View>
      <CardHead
        icon="star"
        color={Maple.warning}
        title="Recommended for You"
        link="View All"
        onLink={() => router.push('/learn/library')}
      />
      <View style={styles.recGrid}>
        {h.recommendedItems.map((it) => (
          <Pressable
            key={it.id}
            style={styles.recCard}
            onPress={() => router.push(it.href)}
            accessibilityRole="link"
            accessibilityLabel={`${it.title}, ${it.sub}`}>
            <Image decorative source={it.thumb} style={styles.recThumb} contentFit="cover" />
            <Text style={styles.recTitle} numberOfLines={2}>
              {it.title}
            </Text>
            <Text style={[styles.recSub, { color: it.subColor }]} numberOfLines={1}>
              {it.sub}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
