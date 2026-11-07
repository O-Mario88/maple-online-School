import { Image } from '@/components/picture';
import { type Href, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { L } from '@/features/learner/frame/LightFrame';
import { Picker } from '@/features/learner/lessons/LessonParts';
import type { IconName } from '@/lib/icons';
import { toast } from '@/lib/toast';
import type { CareerEvent } from '@/mock/career-compass';

import { cs, BRAND_SOFT, BRAND_BLUE, Sheet, shortDate } from './CareerParts';
import { CareerRequestForm } from './CareerRequests';
import { Pager, PhotoPill, PurpleHero, SideCard } from './CompassCards';
import { paginate } from './directory';
import { EVENT_KINDS, type EventFilters, filterEvents, kindCounts, monthGrid, NO_EVENT_FILTERS, shiftMonth, sortEvents } from './events';
import { setEventStatus } from './saved';
import type { Compass } from './useCompass';
import { Maple, Radii } from '@/constants/maple';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const KIND_ICON: Readonly<Record<string, IconName>> = Object.fromEntries(EVENT_KINDS.map((k) => [k.kind, k.icon]));
const LEVELS = ['S.3', 'S.4', 'S.5', 'S.6'];
const any = (label: string, values: readonly { value: string; label: string }[]) => [{ value: 'all', label }, ...values];
const shortDay = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

/** The page's own state: filters, order, page, the calendar month, the open sheets. */
function useEventsPage(x: Compass) {
  const [f, setF] = useState<EventFilters>(NO_EVENT_FILTERS);
  const [mine, setMine] = useState<'all' | 'registered' | 'interested'>('all');
  const [sort, setSort] = useState<'soonest' | 'az'>('soonest');
  const [page, setPage] = useState(1);
  const [y, m] = x.today.split('-').map(Number);
  const [month, setMonth] = useState({ year: y, month: m });
  const [open, setOpen] = useState<string | null>(null);
  const [consent, setConsent] = useState<string | null>(null);
  const [suggest, setSuggest] = useState(false);
  const [reminders, setReminders] = useState(true);
  const status = x.saves.events;
  const shown = sortEvents(filterEvents(x.cc.events, f, x.today), sort).filter((e) => mine === 'all' || status[e.id] === mine);
  const set = (patch: Partial<EventFilters>) => {
    setF({ ...f, ...patch });
    setPage(1);
  };
  const register = (e: CareerEvent) => {
    if (status[e.id] === 'registered') return toast('You’re already registered');
    if (e.hostKind === 'institution') return setConsent(e.id);
    setEventStatus(e.id, 'registered');
    toast(`Registered. Joining details will appear in your events${reminders ? ', with a reminder the day before' : ''}.`);
  };
  return { f, set, mine, setMine, sort, setSort, pageInfo: paginate(shown, page), setPage, counts: kindCounts(x.cc.events, f, x.today), month, setMonth, open, setOpen, consent, setConsent, suggest, setSuggest, reminders, setReminders, status, register };
}
type EP = ReturnType<typeof useEventsPage>;

function Tabs({ p, phone }: { p: EP; phone: boolean }) {
  const tabs: readonly { key: string; label: string; icon: IconName }[] = [{ key: 'all', label: 'All Events', icon: 'calendar' }, ...EVENT_KINDS.map((k) => ({ key: k.kind, label: k.plural, icon: k.icon }))];
  const row = (
    <View style={s.tabs} accessibilityRole="tablist">
      {tabs.map((t) => {
        const on = p.f.kind === t.key;
        return (
          <Pressable key={t.key} style={s.tab} onPress={() => p.set({ kind: t.key })} accessibilityRole="tab" accessibilityState={{ selected: on }}>
            <Icon name={t.icon} size={17} color={on ? BRAND_BLUE : L.ink} />
            <Text style={[s.tabText, on && s.tabOn]}>{`${t.label} (${p.counts[t.key] ?? 0})`}</Text>
            {on ? <View style={s.tabLine} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
  return phone ? (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {row}
    </ScrollView>
  ) : (
    row
  );
}

function Filters({ x, p, phone }: { x: Compass; p: EP; phone: boolean }) {
  const row = (
    <View style={[s.filters, phone && s.nowrap]}>
      <Picker compact label="Format" icon="pin" value={p.f.format} options={any('All Formats', [{ value: 'Virtual', label: 'Virtual' }, { value: 'In person', label: 'In person' }])} onChange={(v) => p.set({ format: v })} />
      <Picker compact label="Career Area" icon="grid" value={p.f.area} options={any('All Career Areas', x.cc.areas.map((a) => ({ value: a.id, label: a.label })))} onChange={(v) => p.set({ area: v })} />
      <Picker compact label="Education Level" icon="cap" value={p.f.level} options={any('All Education Levels', LEVELS.map((l) => ({ value: l, label: l })))} onChange={(v) => p.set({ level: v })} />
      <Picker compact label="Dates" icon="calendar" value={p.f.dates} options={any('All Dates', [{ value: 'month', label: 'Next 30 days' }, { value: 'quarter', label: 'Next 3 months' }])} onChange={(v) => p.set({ dates: v })} />
    </View>
  );
  return (
    <View style={[s.filterBar, phone && s.filterBarP]}>
      {phone ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {row}
        </ScrollView>
      ) : (
        row
      )}
      <View style={s.sortRow}>
        <Text style={cs.small}>Sort by:</Text>
        <Picker
          compact
          label="Sort by"
          icon="filter"
          value={p.sort}
          options={[
            { value: 'soonest', label: 'Upcoming Soon' },
            { value: 'az', label: 'Name A–Z' },
          ]}
          onChange={p.setSort}
        />
      </View>
    </View>
  );
}

function EventCard({ e, p, phone }: { e: CareerEvent; p: EP; phone: boolean }) {
  const st = p.status[e.id];
  const join = e.kind === 'Group Guidance' || (e.kind === 'Career Talk' && e.hostKind === 'institution');
  return (
    <View style={[s.card, phone ? s.cardP : s.cardD]}>
      <View>
        <Image decorative source={e.photo} style={s.photo} contentFit="cover" />
        <PhotoPill text={e.kind} icon={KIND_ICON[e.kind]} />
        {e.sponsored ? <PhotoPill text="Sponsored" side="right" tone="gold" /> : null}
      </View>
      <View style={s.body}>
        <Text style={s.title} numberOfLines={2}>
          {e.title}
        </Text>
        <Text style={s.host}>{e.host}</Text>
        <Text style={[cs.small, s.about]} numberOfLines={2}>
          {e.about}
        </Text>
        <View style={s.meta}>
          <View style={s.metaItem}>
            <Icon name="calendar" size={13} color={L.navy} />
            <Text style={s.metaText}>{shortDay(e.date)}</Text>
          </View>
          <View style={s.metaItem}>
            <Icon name="clock" size={13} color={L.navy} />
            <Text style={s.metaText}>{e.time}</Text>
          </View>
        </View>
        <View style={s.btns}>
          {st === 'registered' ? (
            <View style={[s.solid, s.done]}>
              <Icon name="tick" size={14} color={Maple.successText} />
              <Text style={s.doneText}>Registered</Text>
            </View>
          ) : (
            <Pressable style={s.solid} onPress={() => p.register(e)} accessibilityRole="button" accessibilityLabel={`${join ? 'Join session' : 'Register'}: ${e.title}`}>
              <Text style={s.solidText}>{join ? 'Join Session' : 'Register Now'}</Text>
              <Icon name="arrowRight" size={13} color={L.white} />
            </Pressable>
          )}
          <Pressable style={s.outline} onPress={() => p.setOpen(e.id)} accessibilityRole="button" accessibilityLabel={`View details: ${e.title}`}>
            <Text style={s.outlineText}>View Details</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function Calendar({ x, p }: { x: Compass; p: EP }) {
  const weeks = monthGrid(p.month.year, p.month.month);
  const days = new Set(x.cc.events.map((e) => e.date));
  const mine = new Set(Object.keys(p.status).map((id) => x.cc.events.find((e) => e.id === id)?.date));
  const step = (d: number) => p.setMonth(shiftMonth(p.month.year, p.month.month, d));
  return (
    <SideCard title="My Event Calendar" icon="calendar">
      <View style={s.calHead}>
        <Pressable style={s.calNav} onPress={() => step(-1)} accessibilityRole="button" accessibilityLabel="Previous month">
          <Icon name="chevronLeft" size={16} color={L.navy} />
        </Pressable>
        <Text style={s.calMonth}>{`${MONTHS[p.month.month - 1]} ${p.month.year}`}</Text>
        <Pressable style={s.calNav} onPress={() => step(1)} accessibilityRole="button" accessibilityLabel="Next month">
          <Icon name="chevronRight" size={16} color={L.navy} />
        </Pressable>
      </View>
      <View style={s.calRow}>
        {DAYS.map((d) => (
          <Text key={d} style={s.calDay}>
            {d}
          </Text>
        ))}
      </View>
      {weeks.map((w) => (
        <View key={w[0].iso} style={s.calRow}>
          {w.map((d) => {
            const today = d.iso === x.today;
            return (
              <View key={d.iso} style={s.calCell} accessibilityLabel={days.has(d.iso) ? `${d.day}: career event` : undefined}>
                <View style={[s.calNum, today && s.calToday, mine.has(d.iso) && !today && s.calMine]}>
                  <Text style={[s.calText, !d.inMonth && s.calOut, today && s.calTodayText]}>{d.day}</Text>
                </View>
                {days.has(d.iso) ? <View style={s.calDot} /> : null}
              </View>
            );
          })}
        </View>
      ))}
    </SideCard>
  );
}

const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function UpcomingForMe({ x, p }: { x: Compass; p: EP }) {
  const mine = x.cc.events.filter((e) => p.status[e.id] && e.date >= x.today).sort((a, b) => a.date.localeCompare(b.date));
  return (
    <SideCard
      title="Upcoming for Me"
      icon="star"
      right={
        <Pressable onPress={() => p.setMine(p.mine === 'all' ? 'registered' : 'all')} accessibilityRole="button">
          <Text style={s.link}>{p.mine === 'all' ? 'View All' : 'Show all events'}</Text>
        </Pressable>
      }>
      {mine.length ? (
        mine.slice(0, 3).map((e) => {
          const [, mo, d] = e.date.split('-').map(Number);
          const reg = p.status[e.id] === 'registered';
          return (
            <Pressable key={e.id} style={s.mineRow} onPress={() => p.setOpen(e.id)} accessibilityRole="button">
              <View style={s.date}>
                <Text style={s.dateMon}>{MON[mo - 1]}</Text>
                <Text style={s.dateDay}>{d}</Text>
              </View>
              <View style={s.flex}>
                <Text style={s.mineTitle} numberOfLines={3}>
                  {e.title}
                </Text>
                <Text style={cs.small}>{e.time}</Text>
              </View>
              <Text style={[s.badge, reg ? s.badgeReg : s.badgeInt]}>{reg ? 'Registered' : 'Interested'}</Text>
            </Pressable>
          );
        })
      ) : (
        <Text style={cs.small}>Register for an event, or mark one as interesting, to see it here.</Text>
      )}
    </SideCard>
  );
}

function PlanAround({ x, p }: { x: Compass; p: EP }) {
  const add = () => {
    const regs = x.cc.events.filter((e) => p.status[e.id] === 'registered' && e.date >= x.today);
    if (!regs.length) return toast('Register for an event first');
    regs.forEach((e) => x.plan(`Attend: ${e.title}`, e.date));
  };
  return (
    <View style={s.plan}>
      <View style={s.planHead}>
        <View style={s.flex}>
          <View style={s.row}>
            <Icon name="target" size={22} color={BRAND_BLUE} />
            <Text style={s.sideTitle}>Plan Around Events</Text>
          </View>
          <Text style={cs.small}>Add events to your career path in My Plan, set reminders and track what you learn.</Text>
        </View>
        <Image decorative source={x.cc.photos.art.calendar} style={s.planArt} contentFit="contain" />
      </View>
      <Pressable style={s.wideOutline} onPress={add} accessibilityRole="button">
        <Text style={s.outlineText}>Add to My Plan</Text>
        <Icon name="arrowRight" size={14} color={BRAND_BLUE} />
      </Pressable>
    </View>
  );
}

function QuickActions({ p }: { p: EP }) {
  const items: readonly { label: string; icon: IconName; sub?: string; go: () => void }[] = [
    {
      label: p.reminders ? 'Reminders On' : 'Event Reminders',
      icon: 'bell',
      go: () => {
        p.setReminders(!p.reminders);
        toast(p.reminders ? 'Event reminders off' : 'We’ll remind you the day before each event you register for');
      },
    },
    { label: 'Saved Events', icon: 'bookmark', go: () => p.setMine(p.mine === 'interested' ? 'all' : 'interested') },
    { label: 'Suggest an Event', icon: 'userPlus', go: () => p.setSuggest(true) },
    { label: 'Host an Event', sub: 'Schools & Partners', icon: 'calendar', go: () => router.push('/schools' as Href) },
  ];
  return (
    <SideCard title="Quick Actions" icon="bolt">
      <View style={s.tools}>
        {items.map((t) => (
          <Pressable key={t.label} style={s.tool} onPress={t.go} accessibilityRole="button">
            <Icon name={t.icon} size={20} color={BRAND_BLUE} />
            <View style={s.flex}>
              <Text style={s.toolText}>{t.label}</Text>
              {t.sub ? <Text style={s.toolSub}>{t.sub}</Text> : null}
            </View>
          </Pressable>
        ))}
      </View>
    </SideCard>
  );
}

function Sheets({ x, p }: { x: Compass; p: EP }) {
  const e = x.cc.events.find((v) => v.id === p.open);
  const c = x.cc.events.find((v) => v.id === p.consent);
  const st = e ? p.status[e.id] : undefined;
  return (
    <>
      {e ? (
        <Sheet title={e.title} onClose={() => p.setOpen(null)}>
          <Image decorative source={e.photo} style={s.sheetPhoto} contentFit="cover" />
          <Text style={s.host}>{`${e.host}${e.sponsored ? ' · Sponsored' : ''}`}</Text>
          <Text style={cs.body}>{e.about}</Text>
          <Text style={cs.body}>{`${shortDate(e.date)} · ${e.time} · ${e.place} (${e.format.toLowerCase()})`}</Text>
          <Text style={cs.small}>{`For ${e.levels.join(', ')} learners`}</Text>
          {e.sponsored ? <Text style={cs.note}>The host paid to list this event. That doesn’t change what Maple recommends to you.</Text> : null}
          <View style={s.btns}>
            <Pressable style={s.solid} onPress={() => p.register(e)} accessibilityRole="button">
              <Text style={s.solidText}>{st === 'registered' ? 'Registered' : 'Register'}</Text>
            </Pressable>
            <Pressable style={s.outline} onPress={() => setEventStatus(e.id, st ? null : 'interested')} accessibilityRole="button">
              <Text style={s.outlineText}>{st ? (st === 'registered' ? 'Cancel registration' : 'Not interested') : 'I’m interested'}</Text>
            </Pressable>
          </View>
        </Sheet>
      ) : null}
      {c ? (
        <Sheet title="Register for this event?" onClose={() => p.setConsent(null)}>
          <Text style={s.title}>{c.title}</Text>
          <Text style={cs.body}>{`${c.host} will receive your first name and email address so they can send you the joining details.`}</Text>
          <Text style={cs.small}>Your interests, grades, saved careers and counseling notes are never shared.</Text>
          <View style={s.btns}>
            <Pressable
              style={s.solid}
              onPress={() => {
                setEventStatus(c.id, 'registered');
                p.setConsent(null);
                toast(`Registered. ${c.host} will email your joining details.`);
              }}
              accessibilityRole="button">
              <Text style={s.solidText}>Agree and register</Text>
            </Pressable>
            <Pressable style={s.outline} onPress={() => p.setConsent(null)} accessibilityRole="button">
              <Text style={s.outlineText}>Not now</Text>
            </Pressable>
          </View>
        </Sheet>
      ) : null}
      {p.suggest ? (
        <Sheet title="Suggest an event" onClose={() => p.setSuggest(false)}>
          <CareerRequestForm kind="event" intro="What talk, open day or session would help you? Maple’s career team reads every suggestion." placeholder="For example: a talk on careers in aviation" sentToast="Thanks! Your suggestion went to the career team." />
        </Sheet>
      ) : null}
    </>
  );
}

/** Career Events (its reference): open days, career talks, fairs and group guidance, with a calendar and the learner's own events. */
export function EventsSection({ x, phone }: { x: Compass; phone: boolean }) {
  const p = useEventsPage(x);
  const hero = (
    <PurpleHero
      phone={phone}
      kicker="Career Events"
      icon="calendar"
      title="Learn. Explore. Connect."
      sub="Join open days, career talks, university fairs and group guidance sessions to explore opportunities and make informed decisions."
      photo={x.cc.photos.heroes.events}
      buttons={[
        { label: 'Browse Events', icon: 'calendar', onPress: () => p.setMine('all') },
        { label: 'My Registered Events', icon: 'calendar', onPress: () => p.setMine('registered') },
      ]}
    />
  );
  const list = (
    <>
      <Tabs p={p} phone={phone} />
      <Filters x={x} p={p} phone={phone} />
      {p.mine !== 'all' ? (
        <View style={s.mineNote}>
          <Text style={cs.small}>{p.mine === 'registered' ? 'Showing events you’re registered for.' : 'Showing events you saved as interesting.'}</Text>
          <Pressable onPress={() => p.setMine('all')} accessibilityRole="button">
            <Text style={s.link}>Show all</Text>
          </Pressable>
        </View>
      ) : null}
      {p.pageInfo.items.length ? (
        <View style={s.grid}>
          {p.pageInfo.items.map((e) => (
            <EventCard key={e.id} e={e} p={p} phone={phone} />
          ))}
        </View>
      ) : (
        <View style={s.empty}>
          <Text style={s.sideTitle}>No events match</Text>
          <Text style={cs.small}>Try other filters, or suggest an event you’d like.</Text>
        </View>
      )}
      <Pager info={p.pageInfo} noun="events" onPage={p.setPage} />
    </>
  );
  const side = (
    <>
      <Calendar x={x} p={p} />
      <UpcomingForMe x={x} p={p} />
      <PlanAround x={x} p={p} />
      <QuickActions p={p} />
    </>
  );
  return phone ? (
    <View style={s.stack}>
      {hero}
      {list}
      {side}
      <Sheets x={x} p={p} />
    </View>
  ) : (
    <View style={s.cols}>
      <View style={[s.flex, s.stack]}>
        {hero}
        {list}
      </View>
      <View style={s.right}>{side}</View>
      <Sheets x={x} p={p} />
    </View>
  );
}

const s = StyleSheet.create({
  block: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 16, borderRadius: 20, backgroundColor: BRAND_BLUE },
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stack: { gap: 16 },
  cols: { flexDirection: 'row', gap: 22, alignItems: 'flex-start' },
  right: { width: 350, gap: 18 },
  tabs: { flexDirection: 'row', gap: 4, borderBottomWidth: 1, borderBottomColor: L.line },
  tab: { height: 46, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 },
  tabText: { fontSize: 14, fontWeight: '500', color: L.ink },
  tabOn: { fontWeight: '700', color: BRAND_BLUE },
  tabLine: { position: 'absolute', left: 6, right: 6, bottom: -1, height: 3, borderRadius: 2, backgroundColor: BRAND_BLUE },
  filterBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  filterBarP: { flexDirection: 'column', alignItems: 'stretch' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, flexShrink: 1 },
  nowrap: { flexWrap: 'nowrap' },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mineNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderRadius: 10, backgroundColor: BRAND_SOFT },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: { overflow: 'hidden', borderRadius: 16, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  cardD: { width: '31.8%' },
  cardP: { width: '100%' },
  photo: { width: '100%', height: 112 },
  body: { gap: 5, padding: 14 },
  title: { fontSize: 15.5, lineHeight: 20, fontWeight: '800', color: L.navy },
  host: { fontSize: 13, color: L.ink },
  about: { minHeight: 34 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, fontWeight: '500', color: L.navy },
  btns: { flexDirection: 'row', gap: 8, marginTop: 8 },
  solid: { flex: 1, height: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 18, backgroundColor: BRAND_BLUE },
  solidText: { fontSize: 13, fontWeight: '700', color: L.white },
  done: { backgroundColor: Maple.successSoft },
  doneText: { fontSize: 13, fontWeight: '700', color: Maple.successText },
  outline: { flex: 1, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: Radii.control, borderWidth: 1.5, borderColor: Maple.blueLine },
  outlineText: { fontSize: 13, fontWeight: '700', color: BRAND_BLUE },
  empty: { alignItems: 'center', gap: 6, padding: 26, borderRadius: 14, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  sideTitle: { fontSize: 17, fontWeight: '800', color: L.navy },
  link: { fontSize: 13, fontWeight: '700', color: BRAND_BLUE },
  calHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  calNav: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, borderWidth: 1, borderColor: L.line },
  calMonth: { fontSize: 15, fontWeight: '700', color: L.navy },
  calRow: { flexDirection: 'row' },
  calDay: { flex: 1, fontSize: 12, fontWeight: '600', color: L.ink, textAlign: 'center' },
  calCell: { flex: 1, height: 36, alignItems: 'center', justifyContent: 'center' },
  calNum: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15 },
  calToday: { backgroundColor: BRAND_BLUE },
  calMine: { backgroundColor: BRAND_SOFT },
  calText: { fontSize: 13, fontWeight: '600', color: L.navy },
  calOut: { color: Maple.muted },
  calTodayText: { color: L.white },
  calDot: { position: 'absolute', bottom: 1, width: 5, height: 5, borderRadius: 3, backgroundColor: BRAND_BLUE },
  mineRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Maple.blueSelected },
  date: { width: 46, height: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: BRAND_SOFT },
  dateMon: { fontSize: 11, fontWeight: '700', color: BRAND_BLUE },
  dateDay: { fontSize: 18, fontWeight: '800', color: L.navy },
  mineTitle: { fontSize: 13.5, fontWeight: '700', color: L.navy },
  badge: { overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7, fontSize: 11.5, fontWeight: '700' },
  badgeReg: { color: Maple.successText, backgroundColor: Maple.successSoft },
  badgeInt: { color: BRAND_BLUE, backgroundColor: BRAND_SOFT },
  plan: { gap: 12, padding: 18, borderRadius: 16, borderWidth: 1, borderColor: Maple.blueSelected, backgroundColor: Maple.blueSoft },
  planHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  planArt: { width: 90, height: 88 },
  wideOutline: { height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: Radii.control, borderWidth: 1.5, borderColor: BRAND_BLUE, backgroundColor: L.white },
  tools: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tool: { width: '47%', minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: L.line },
  toolText: { fontSize: 13, fontWeight: '700', color: L.navy },
  toolSub: { fontSize: 11, color: L.body },
  sheetPhoto: { width: '100%', height: 150, borderRadius: 12 },
});
