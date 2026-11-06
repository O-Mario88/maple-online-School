import { Image } from '@/components/picture';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ProgressRing } from '@/features/learner/exam/ExamNav';
import { L } from '@/features/learner/frame/LightFrame';
import type { IconName } from '@/lib/icons';

import { BRAND_SOFT, BRAND_BLUE } from './CareerParts';
import { CareerPhotoCard } from './CompassCards';
import type { CompassSection } from '@/lib/careers/sections';
import type { Compass } from './useCompass';
import { Maple, Radii } from '@/constants/maple';

const STATUS = { done: 'Completed', current: 'In progress', next: 'Next', later: 'Coming up' } as const;
const OPPORTUNITIES: readonly { key: CompassSection; title: string; sub: string; icon: IconName }[] = [
  { key: 'programs', title: 'Universities & Programs', sub: 'Compare programs and entry requirements.', icon: 'building' },
  { key: 'scholarships', title: 'Scholarships', sub: 'Find funding that fits you.', icon: 'trophy' },
  { key: 'events', title: 'Career Events', sub: 'Talks, open days and workshops.', icon: 'calendar' },
  { key: 'communities', title: 'Career Communities', sub: 'Learn and connect with mentors.', icon: 'people' },
];

function Hero({ x, phone }: { x: Compass; phone: boolean }) {
  const p = x.cc.photos;
  return (
    <View style={[s.hero, phone && s.heroP]}>
      <LinearGradient colors={[Maple.blue, BRAND_BLUE, Maple.blue]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={phone ? s.heroPhotoP : s.heroPhoto} pointerEvents="none">
        <Image source={phone ? p.heroPhone : p.hero} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="top" />
        <LinearGradient colors={[Maple.blue, 'rgba(106,68,223,0.6)', 'rgba(106,68,223,0)']} locations={[0, 0.3, 0.7]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
      </View>
      <View style={phone ? s.heroTextP : s.heroText}>
        {!phone ? (
          <View style={s.kicker}>
            <Icon name="map" size={18} color={L.white} />
            <Text style={s.kickerText}>Career Compass</Text>
          </View>
        ) : null}
        <Text style={[s.heroTitle, phone && s.heroTitleP]}>{phone ? 'Find a Future\nThat Fits You' : 'Discover Your Path. Build Your Future.'}</Text>
        <Text style={[s.heroSub, phone && s.heroSubP]}>
          {phone ? 'Explore careers, match your interests, get guidance and discover education opportunities.' : 'Explore careers, match your interests and strengths, get expert guidance and turn your studies into real opportunities.'}
        </Text>
        <View style={s.heroBtns}>
          <Pressable style={s.heroBtn} onPress={() => x.setTab(phone ? 'explorer' : 'interests')} accessibilityRole="button">
            {!phone ? <Icon name="sparkle" size={15} color={BRAND_BLUE} /> : null}
            <Text style={s.heroBtnText}>{phone ? 'Explore Careers' : 'Take Interest Assessment'}</Text>
            <Icon name="arrowRight" size={15} color={BRAND_BLUE} />
          </Pressable>
          {!phone ? (
            <Pressable style={s.heroGhost} onPress={() => x.setTab('explorer')} accessibilityRole="button">
              <Icon name="search" size={15} color={L.white} />
              <Text style={s.heroGhostText}>Explore Careers</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function Card({ title, right, children, style }: { title: string; right?: ReactNode; children: ReactNode; style?: object }) {
  return (
    <View style={[s.card, style]}>
      <View style={s.cardHead}>
        <Text style={s.cardTitle}>{title}</Text>
        {right}
      </View>
      {children}
    </View>
  );
}

function Link({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={s.link} onPress={onPress} accessibilityRole="link">
      <Text style={s.linkText}>{label}</Text>
      <Icon name="arrowRight" size={13} color={BRAND_BLUE} />
    </Pressable>
  );
}

function Bar({ value }: { value: number }) {
  return (
    <View style={s.bar}>
      <View style={[s.barFill, { width: `${Math.round(value * 100)}%` }]} />
    </View>
  );
}

/** Profile at a Glance / Career Snapshot: the closest career area and the top matches, from the learner's answers. */
function Snapshot({ x, phone }: { x: Compass; phone: boolean }) {
  const top = x.areaScores[0];
  const dots = [BRAND_BLUE, '#E5487F', Maple.warning];
  return (
    <Card title={phone ? 'Your Career Snapshot' : 'Your Profile at a Glance'} style={phone ? undefined : s.half}>
      <View style={[s.snap, phone && s.snapP]}>
        <View style={s.ringWrap}>
          <ProgressRing value={(top?.percent ?? 0) / 100} size={phone ? 118 : 150} stroke={phone ? 10 : 12} color={BRAND_BLUE} track={Maple.blueSelected} label={false} />
          <View style={s.ringCenter}>
            <Icon name="flask" size={phone ? 24 : 28} color={BRAND_BLUE} />
            <Text style={s.ringText} numberOfLines={2}>
              {top ? top.label.split(' & ')[0] : 'Explore'}
            </Text>
            {top ? <Text style={s.ringPct}>{`${top.percent}%`}</Text> : null}
          </View>
        </View>
        <View style={s.flex}>
          <Text style={s.label}>Top matches</Text>
          {x.areaScores.slice(0, 3).map((a, i) => (
            <View key={a.area} style={s.matchRow}>
              <View style={[s.dot, { backgroundColor: dots[i] }]} />
              <Text style={[s.matchText, s.flex]}>{a.label}</Text>
              <Text style={s.matchPct}>{`${a.percent}%`}</Text>
            </View>
          ))}
          <Text style={[s.label, s.gapTop]}>Key strengths</Text>
          <Text style={s.small}>{x.answers.strengths.join(', ') || 'Not chosen yet'}</Text>
        </View>
      </View>
      <Text style={s.note}>How closely each area matches your answers. It’s a starting point, not a prediction.</Text>
      <Link label="Update interests" onPress={() => x.setTab('interests')} />
    </Card>
  );
}

/** Your Next Steps: the starter checklist, ticked from what the learner has done. */
function NextSteps({ x, style }: { x: Compass; style?: object }) {
  const done = x.progress.steps.filter((st) => st.done).length;
  return (
    <Card title="Your Next Steps" style={style} right={<Text style={s.small}>{`${done} of ${x.progress.steps.length} completed`}</Text>}>
      <Bar value={done / x.progress.steps.length} />
      {x.progress.steps.map((st) => (
        <View key={st.label} style={s.check}>
          <View style={[s.box, st.done && s.boxOn]}>{st.done ? <Icon name="tick" size={12} color={L.white} /> : null}</View>
          <Text style={[s.checkText, st.done && s.checkDone]}>{st.label}</Text>
        </View>
      ))}
    </Card>
  );
}

function Recommended({ x, phone, style }: { x: Compass; phone: boolean; style?: object }) {
  const cards = x.matches.slice(0, phone ? 5 : 3).map((m) => (
    <CareerPhotoCard key={m.career.id} c={m.career} compact={phone} saved={x.saves.careers.includes(m.career.id)} onSave={() => x.toggleCareer(m.career.id)} onOpen={() => x.openCareer(m.career.id)} />
  ));
  return (
    <Card title="Recommended for You" style={style} right={<Link label="View All" onPress={() => x.setTab('explorer')} />}>
      {phone ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hRow}>
          {cards}
        </ScrollView>
      ) : (
        <View style={s.row}>{cards}</View>
      )}
    </Card>
  );
}

function QuickActions({ x }: { x: Compass }) {
  const items: readonly { key: CompassSection; label: string; icon: IconName }[] = [
    { key: 'interests', label: 'Take Interest Assessment', icon: 'target' },
    { key: 'explorer', label: 'Explore Careers', icon: 'search' },
    { key: 'programs', label: 'Find Programs', icon: 'cap' },
    { key: 'counselor', label: 'Book a Counselor', icon: 'calendar' },
  ];
  return (
    <View style={s.quick}>
      {items.map((it) => (
        <Pressable key={it.key} style={s.quickItem} onPress={() => x.setTab(it.key)} accessibilityRole="button">
          <Icon name={it.icon} size={24} color={BRAND_BLUE} />
          <Text style={s.quickText}>{it.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function Opportunities({ x, phone }: { x: Compass; phone: boolean }) {
  return (
    <View style={s.stack}>
      <Text style={s.sectionTitle}>Opportunities for You</Text>
      <View style={[s.row, phone && s.wrap]}>
        {OPPORTUNITIES.map((o) => (
          <Pressable key={o.key} style={[s.opp, phone ? s.oppP : s.oppD]} onPress={() => x.setTab(o.key)} accessibilityRole="link">
            <View style={s.pathIcon}>
              <Icon name={o.icon} size={20} color={BRAND_BLUE} />
            </View>
            <View style={s.flex}>
              <Text style={s.oppTitle}>{o.title}</Text>
              <Text style={s.small}>{o.sub}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function PlanBanner({ x }: { x: Compass }) {
  return (
    <View style={s.plan}>
      <Icon name="cap" size={28} color={BRAND_BLUE} />
      <View style={s.flex}>
        <Text style={s.pathTitle}>Create Your Career Plan</Text>
        <Text style={s.small}>Set your goals, map your education path and track your progress.</Text>
      </View>
      <Pressable style={s.planBtn} onPress={x.openPlan} accessibilityRole="button">
        <Text style={s.planBtnText}>{x.goals.length ? 'My Plan' : 'Start My Plan'}</Text>
        <Icon name="arrowRight" size={13} color={L.white} />
      </Pressable>
    </View>
  );
}

const TILES: readonly { key: CompassSection | 'plan'; title: string; sub: string; icon: IconName; tint: string; color: string }[] = [
  { key: 'interests', title: 'Explore Interests', sub: 'Know what you enjoy', icon: 'target', tint: Maple.blueSoft, color: Maple.blue },
  { key: 'explorer', title: 'Discover Careers', sub: 'Explore career options', icon: 'cap', tint: Maple.blueSoft, color: BRAND_BLUE },
  { key: 'plan', title: 'Plan Your Path', sub: 'Subjects, programs & goals', icon: 'map', tint: Maple.successSoft, color: Maple.successText },
  { key: 'counselor', title: 'Get Guidance', sub: 'Book a counselor', icon: 'people', tint: Maple.warningSoft, color: Maple.warning },
  { key: 'programs', title: 'Find Universities', sub: 'Compare programs', icon: 'building', tint: Maple.blueSoft, color: Maple.blue },
  { key: 'scholarships', title: 'Scholarships', sub: 'Funding opportunities', icon: 'star', tint: '#FDEEF4', color: '#DB2777' },
];

function Tiles({ x }: { x: Compass }) {
  return (
    <View style={s.row}>
      {TILES.map((t) => (
        <Pressable key={t.key} style={[s.tile, { backgroundColor: t.tint }]} onPress={() => (t.key === 'plan' ? x.openPlan() : x.setTab(t.key))} accessibilityRole="link" accessibilityLabel={`${t.title}: ${t.sub}`}>
          <Icon name={t.icon} size={30} color={t.color} />
          <Text style={s.tileTitle}>{t.title}</Text>
          <Text style={s.small}>{t.sub}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** Your Profile at a Glance (the new desktop reference): the top area, then interests, strengths and work style. */
function Glance({ x }: { x: Compass }) {
  const top = x.areaScores[0];
  const tile = (key: string) => x.cc.tiles.find((t) => t.key === key)?.label ?? key;
  const rows: readonly { icon: IconName; color: string; tint: string; title: string; sub: string }[] = [
    { icon: 'heart', color: '#E5487F', tint: '#FDEEF4', title: 'Your Interests', sub: x.answers.interests.map(tile).join(', ') || 'Not chosen yet' },
    { icon: 'bolt', color: Maple.warning, tint: Maple.warningSoft, title: 'Your Strengths', sub: x.answers.strengths.join(', ') || 'Not chosen yet' },
    { icon: 'building', color: Maple.blue, tint: Maple.blueSoft, title: 'Work Style', sub: x.answers.environments.join(', ') || 'Not chosen yet' },
  ];
  return (
    <Card title="Your Profile at a Glance" style={s.half}>
      <Text style={s.small}>A quick look at your interests, strengths and how you like to work.</Text>
      <View style={s.snap}>
        <View style={s.ringWrap}>
          <ProgressRing value={(top?.percent ?? 0) / 100} size={150} stroke={13} color={BRAND_BLUE} track={Maple.blueSelected} label={false} />
          <View style={s.ringCenter}>
            <Icon name="pulse" size={24} color={BRAND_BLUE} />
            <Text style={s.ringText} numberOfLines={2}>
              {top ? top.label : 'Explore'}
            </Text>
            {top ? <Text style={s.ringPct}>{`Top match ${top.percent}%`}</Text> : null}
          </View>
        </View>
        <View style={s.flex}>
          {rows.map((r) => (
            <Pressable key={r.title} style={s.glanceRow} onPress={() => x.setTab('interests')} accessibilityRole="button" accessibilityLabel={`${r.title}: ${r.sub}`}>
              <View style={[s.glanceIcon, { backgroundColor: r.tint }]}>
                <Icon name={r.icon} size={18} color={r.color} />
              </View>
              <View style={s.flex}>
                <Text style={s.glanceTitle}>{r.title}</Text>
                <Text style={s.small} numberOfLines={1}>
                  {r.sub}
                </Text>
              </View>
              <Icon name="chevronRight" size={15} color={L.ink} />
            </Pressable>
          ))}
          <Link label="Update My Interests" onPress={() => x.setTab('interests')} />
        </View>
      </View>
    </Card>
  );
}

/** Recommended Career Paths: the best-matching areas with example careers and how closely each matches. */
function PathsCard({ x }: { x: Compass }) {
  return (
    <Card title="Recommended Career Paths" style={s.half} right={<Link label="View All" onPress={() => x.setTab('explorer')} />}>
      {x.areaScores.slice(0, 3).map((a) => {
        const area = x.cc.areas.find((y) => y.id === a.area);
        const examples = x.cc.careers.filter((c) => c.area === a.area).map((c) => c.title);
        return (
          <Pressable
            key={a.area}
            style={s.pathRow}
            onPress={() => {
              x.setArea(a.area);
              x.setTab('explorer');
            }}
            accessibilityRole="button"
            accessibilityLabel={`${a.label}, ${a.percent}% match`}>
            <View style={s.pathIcon}>
              <Icon name={area?.icon ?? 'map'} size={20} color={BRAND_BLUE} />
            </View>
            <View style={s.flex}>
              <Text style={s.pathTitle}>{a.label}</Text>
              <Text style={s.small} numberOfLines={1}>
                {examples.join(', ')}
              </Text>
            </View>
            <Text style={s.match}>{`${a.percent}% Match`}</Text>
            <Icon name="chevronRight" size={15} color={L.ink} />
          </Pressable>
        );
      })}
      <Text style={s.note}>How closely each area matches your answers. It’s a starting point, not a prediction.</Text>
    </Card>
  );
}

/** Your Career Path: the five stages, from what the learner has done; the full path is in My Plan. */
function RoadmapStrip({ x }: { x: Compass }) {
  return (
    <View style={s.card}>
      <View style={s.cardHead}>
        <View style={s.headLeft}>
          <Icon name="map" size={26} color={BRAND_BLUE} />
          <View>
            <Text style={s.cardTitle}>Your Career Path</Text>
            <Text style={s.small}>A step-by-step plan from where you are now to your future goal.</Text>
          </View>
        </View>
        <Link label="Open in My Plan" onPress={x.openPlan} />
      </View>
      <View style={s.strip}>
        {x.progress.journey.map((j, i) => (
          <View key={j.title} style={[s.stripItem, i < x.progress.journey.length - 1 && s.flex]}>
            <View style={[s.stripStage, j.status === 'current' && s.stripOn]}>
              <View style={[s.stripNo, j.status === 'done' && s.stripDone, j.status === 'current' && s.stripCurrent]}>
                {j.status === 'done' ? <Icon name="tick" size={14} color={L.white} /> : <Text style={[s.stripNoText, j.status === 'current' && s.white]}>{i + 1}</Text>}
              </View>
              <View>
                <Text style={[s.stripTitle, j.status === 'current' && s.purple]}>{j.title}</Text>
                <Text style={s.small}>{STATUS[j.status]}</Text>
              </View>
            </View>
            {i < x.progress.journey.length - 1 ? <View style={[s.stripLine, j.status === 'done' && s.stripLineDone]} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

/** Explore by Interest: the career areas as photo tiles. */
function ByInterest({ x }: { x: Compass }) {
  const p = x.cc.photos;
  const photo: Readonly<Record<string, number>> = {
    health: p.careers.nurse,
    science: p.interests.technology,
    environment: p.interests.environment,
    engineering: p.careers['civil-engineer'],
    business: p.interests.business,
    education: p.careers.teacher,
  };
  return (
    <View style={s.card}>
      <View style={s.cardHead}>
        <View style={s.headLeft}>
          <Icon name="star" size={26} color={BRAND_BLUE} />
          <View>
            <Text style={s.cardTitle}>Explore by Interest</Text>
            <Text style={s.small}>Browse career areas based on what excites you.</Text>
          </View>
        </View>
        <Link
          label="Browse All Areas"
          onPress={() => {
            x.setArea(null);
            x.setTab('explorer');
          }}
        />
      </View>
      <View style={s.row}>
        {x.cc.areas.map((a) => (
          <Pressable
            key={a.id}
            style={s.areaTile}
            onPress={() => {
              x.setArea(a.id);
              x.setTab('explorer');
            }}
            accessibilityRole="link"
            accessibilityLabel={a.label}>
            <Image source={photo[a.id]} style={s.areaPhoto} contentFit="cover" />
            <Text style={s.areaText}>{a.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** My Career Progress: the four milestones. */
function ProgressCard({ x }: { x: Compass }) {
  return (
    <Card title="My Career Progress" right={<Text style={s.pct}>{`${x.progress.percent}%`}</Text>}>
      <View style={s.bar}>
        <View style={[s.barFill, s.barPurple, { width: `${x.progress.percent}%` }]} />
      </View>
      {x.progress.steps.map((st) => (
        <View key={st.label} style={s.check}>
          <View style={[s.box, st.done && s.boxOn]}>{st.done ? <Icon name="tick" size={12} color={L.white} /> : null}</View>
          <Text style={[s.checkText, st.done && s.checkDone]}>{st.label}</Text>
        </View>
      ))}
    </Card>
  );
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function EventsCard({ x }: { x: Compass }) {
  const events = x.cc.events.filter((e) => e.date >= x.today).sort((a, b) => a.date.localeCompare(b.date));
  const photoOf = (host: string) => x.cc.universities.find((u) => u.name === host)?.photo ?? x.cc.universities[0].photo;
  return (
    <Card title="Upcoming Events" right={<Link label="View All" onPress={() => x.setTab('events')} />}>
      {events.slice(0, 2).map((e) => {
        const [, m, d] = e.date.split('-').map(Number);
        return (
          <View key={e.id} style={s.event}>
            <Image source={photoOf(e.host)} style={s.eventPhoto} contentFit="cover" />
            <View style={s.dateTile}>
              <Text style={s.dateMonth}>{MONTHS[m - 1]}</Text>
              <Text style={s.dateDay}>{d}</Text>
            </View>
            <View style={s.flex}>
              <Text style={s.eventTitle} numberOfLines={2}>
                {e.title}
              </Text>
              <Text style={s.small}>{e.time}</Text>
              <Text style={s.small}>{e.place}</Text>
              {e.sponsored ? <Text style={s.sponsored}>Sponsored</Text> : null}
            </View>
          </View>
        );
      })}
    </Card>
  );
}

function CounselorCard({ x }: { x: Compass }) {
  const c = x.cc.counseling.counselors[0];
  const open = x.cc.counseling.slots.some((sl) => sl.counselorId === c.id && !x.counseling.sessions.some((b) => b.slotId === sl.id));
  const initials = c.name
    .replace(/^(Dr|Mr|Mrs|Ms)\.\s*/, '')
    .split(' ')
    .map((w) => w[0])
    .join('');
  return (
    <Card title="My Counselor">
      <View style={s.counselor}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initials}</Text>
        </View>
        <View style={s.flex}>
          <View style={s.nameRow}>
            <Text style={s.pathTitle}>{c.name}</Text>
            <Icon name="verified" size={15} color={L.blue} />
          </View>
          <Text style={s.small}>Career Counselor</Text>
          <View style={s.nameRow}>
            <View style={[s.live, !open && s.liveOff]} />
            <Text style={s.small}>{open ? 'Available for bookings' : 'Fully booked this week'}</Text>
          </View>
        </View>
      </View>
      <Pressable style={s.book} onPress={() => x.setTab('counselor')} accessibilityRole="button">
        <Text style={s.bookText}>Book a Session</Text>
        <Icon name="arrowRight" size={14} color={BRAND_BLUE} />
      </Pressable>
    </Card>
  );
}

/** Career Compass home: the desktop reference on wide screens, the phone reference on phones. */
export function CompassHome({ x, phone }: { x: Compass; phone: boolean }) {
  if (phone)
    return (
      <View style={s.stack}>
        <Hero x={x} phone />
        <QuickActions x={x} />
        <Snapshot x={x} phone />
        <NextSteps x={x} />
        <Recommended x={x} phone />
        <Opportunities x={x} phone />
        <PlanBanner x={x} />
      </View>
    );
  return (
    <View style={s.deskCols}>
      <View style={[s.flex, s.stackLg]}>
        <Hero x={x} phone={false} />
        <Tiles x={x} />
        <View style={s.row}>
          <Glance x={x} />
          <PathsCard x={x} />
        </View>
        <RoadmapStrip x={x} />
        <ByInterest x={x} />
      </View>
      <View style={s.rightCol}>
        <ProgressCard x={x} />
        <EventsCard x={x} />
        <CounselorCard x={x} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  deskCols: { flexDirection: 'row', gap: 22, alignItems: 'flex-start' },
  rightCol: { width: 340, gap: 18 },
  white: { color: L.white },
  tile: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 18, paddingHorizontal: 8, borderRadius: 14 },
  tileTitle: { fontSize: 14.5, fontWeight: '700', color: L.navy, textAlign: 'center' },
  glanceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Maple.blueSelected },
  glanceIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  glanceTitle: { fontSize: 13.5, fontWeight: '700', color: L.navy },
  pathRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: Maple.blueSelected },
  match: { overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, fontSize: 12, fontWeight: '700', color: Maple.successText, backgroundColor: Maple.successSoft },
  headLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  strip: { flexDirection: 'row', alignItems: 'center' },
  stripItem: { flexDirection: 'row', alignItems: 'center' },
  stripStage: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1.5, borderColor: 'transparent' },
  stripOn: { borderColor: Maple.blueLine, backgroundColor: Maple.blueSoft },
  stripNo: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, borderWidth: 1.5, borderColor: Maple.borderStrong, backgroundColor: L.white },
  stripDone: { borderColor: Maple.successText, backgroundColor: Maple.successText },
  stripCurrent: { borderColor: BRAND_BLUE, backgroundColor: BRAND_BLUE },
  stripNoText: { fontSize: 13.5, fontWeight: '700', color: L.ink },
  stripTitle: { fontSize: 14, fontWeight: '700', color: L.navy },
  stripLine: { flex: 1, height: 2, marginHorizontal: 8, backgroundColor: Maple.disabledBorder },
  stripLineDone: { backgroundColor: Maple.successText },
  areaTile: { flex: 1, overflow: 'hidden', borderRadius: 14, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  areaPhoto: { width: '100%', height: 96 },
  areaText: { padding: 10, fontSize: 13.5, lineHeight: 17, fontWeight: '700', color: L.navy, textAlign: 'center' },
  barPurple: { backgroundColor: BRAND_BLUE },
  event: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  eventPhoto: { width: 62, height: 62, borderRadius: 10 },
  dateTile: { width: 48, height: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: BRAND_SOFT },
  dateMonth: { fontSize: 11, fontWeight: '700', color: BRAND_BLUE },
  dateDay: { fontSize: 20, fontWeight: '800', color: L.navy },
  eventTitle: { fontSize: 14, fontWeight: '700', color: L.navy },
  sponsored: { alignSelf: 'flex-start', marginTop: 2, overflow: 'hidden', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 5, fontSize: 10.5, fontWeight: '700', color: Maple.warningText, backgroundColor: Maple.warningSoft },
  counselor: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', borderRadius: 32, backgroundColor: BRAND_SOFT },
  avatarText: { fontSize: 20, fontWeight: '800', color: BRAND_BLUE },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  live: { width: 9, height: 9, borderRadius: 5, backgroundColor: Maple.successText },
  liveOff: { backgroundColor: Maple.faint },
  book: { height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: Radii.control, borderWidth: 1.5, borderColor: BRAND_BLUE },
  bookText: { fontSize: 14.5, fontWeight: '700', color: BRAND_BLUE },
  flex: { flex: 1, minWidth: 0 },
  stack: { gap: 16 },
  stackLg: { gap: 22 },
  row: { flexDirection: 'row', gap: 18, alignItems: 'stretch' },
  wrap: { flexWrap: 'wrap', gap: 12 },
  hRow: { gap: 12 },
  half: { flex: 1 },
  third: { width: 420 },
  twoThirds: { flex: 1 },
  small: { fontSize: 12.5, lineHeight: 17, color: L.body },
  note: { fontSize: 11.5, lineHeight: 16, color: L.muted },
  purple: { color: BRAND_BLUE, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '700', color: L.navy, marginBottom: 4 },
  gapTop: { marginTop: 10 },
  hero: { height: 300, overflow: 'hidden', borderRadius: 20 },
  heroP: { height: 236, borderRadius: 16 },
  heroPhoto: { position: 'absolute', top: 0, right: 0, bottom: 0, width: 460 },
  heroPhotoP: { position: 'absolute', top: 0, right: 0, bottom: 0, width: 190 },
  heroText: { width: 560, gap: 12, paddingLeft: 36, paddingTop: 34 },
  heroTextP: { width: 230, gap: 9, padding: 18 },
  kicker: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kickerText: { fontSize: 17, fontWeight: '700', color: L.white },
  heroTitle: { fontSize: 46, lineHeight: 52, fontWeight: '800', color: L.white, letterSpacing: -1 },
  heroTitleP: { fontSize: 25, lineHeight: 30, letterSpacing: -0.4 },
  heroSub: { fontSize: 16, lineHeight: 23, color: Maple.blueSoft },
  heroSubP: { fontSize: 12.5, lineHeight: 17 },
  heroBtns: { flexDirection: 'row', gap: 14, marginTop: 6 },
  heroBtn: { height: 44, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, borderRadius: Radii.control, backgroundColor: L.white },
  heroBtnText: { fontSize: 14.5, fontWeight: '700', color: BRAND_BLUE },
  heroGhost: { height: 44, justifyContent: 'center', paddingHorizontal: 20, borderRadius: Radii.control, borderWidth: 1.5, borderColor: L.white },
  heroGhostText: { fontSize: 14.5, fontWeight: '600', color: L.white },
  card: { gap: 12, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  cardTitle: { fontSize: 19, fontWeight: '800', color: L.navy, letterSpacing: -0.2 },
  pct: { fontSize: 14, fontWeight: '700', color: L.navy },
  journey: { flexDirection: 'row', gap: 14 },
  stage: { flex: 1, gap: 6, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: L.line, backgroundColor: Maple.blueSoft },
  stageOn: { borderColor: Maple.blueLine, backgroundColor: Maple.blueSoft },
  stageIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: BRAND_SOFT },
  stageIconDone: { backgroundColor: Maple.successText },
  stageTitle: { fontSize: 15.5, fontWeight: '700', color: L.navy },
  snap: { flexDirection: 'row', alignItems: 'center', gap: 22 },
  snapP: { gap: 16 },
  ringWrap: { alignItems: 'center', justifyContent: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center', width: 96 },
  ringText: { marginTop: 3, fontSize: 13.5, lineHeight: 16, fontWeight: '800', color: L.navy, textAlign: 'center' },
  ringPct: { fontSize: 12, fontWeight: '700', color: BRAND_BLUE },
  matchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  matchText: { fontSize: 13, color: L.ink },
  matchPct: { fontSize: 13, fontWeight: '700', color: L.navy },
  link: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  linkText: { fontSize: 13, fontWeight: '600', color: BRAND_BLUE },
  path: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Maple.blueSelected },
  pathIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: BRAND_SOFT },
  pathTitle: { fontSize: 15, fontWeight: '700', color: L.navy },
  bar: { height: 7, overflow: 'hidden', borderRadius: 4, backgroundColor: Maple.blueSelected },
  barFill: { height: 7, borderRadius: 4, backgroundColor: Maple.successText },
  check: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 3 },
  box: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1.5, borderColor: Maple.borderStrong },
  boxOn: { borderColor: Maple.successText, backgroundColor: Maple.successText },
  checkText: { flex: 1, fontSize: 13.5, color: L.ink },
  checkDone: { color: L.body },
  sectionTitle: { fontSize: 21, fontWeight: '800', color: L.navy, letterSpacing: -0.3 },
  tool: { flex: 1, overflow: 'hidden', borderRadius: 16, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  toolPhoto: { width: '100%', height: 128 },
  toolBody: { gap: 6, padding: 14 },
  quick: { flexDirection: 'row', gap: 8 },
  quickItem: { flex: 1, minHeight: 88, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 8, borderRadius: 12, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  quickText: { fontSize: 11.5, lineHeight: 14, fontWeight: '600', color: L.navy, textAlign: 'center' },
  oppD: { flex: 1 },
  opp: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  oppP: { flexGrow: 1, flexBasis: 150 },
  oppTitle: { fontSize: 14, fontWeight: '700', color: L.navy },
  plan: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 14, backgroundColor: Maple.blueSoft },
  planBtn: { height: 36, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, borderRadius: Radii.control, backgroundColor: BRAND_BLUE },
  planBtnText: { fontSize: 13, fontWeight: '600', color: L.white },
});
