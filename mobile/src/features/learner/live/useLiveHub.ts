import { useState } from 'react';

import { addDays, addMinutes, addMonths, dayDot, sessionAction, type SessionKind } from '@/lib/live-hub';
import type { MockData } from '@/mock';

export type Hub = MockData['learner']['liveHub'];
export type Session = Hub['sessions'][number];
export type Tutor = Hub['tutors'][number];
export type TabKey = 'all' | SessionKind | 'recordings';
export type View = 'week' | 'month';

export const TABS: readonly { key: TabKey; label: string; phone?: string }[] = [
  { key: 'all', label: 'My Schedule', phone: 'My Schedule' },
  { key: 'school', label: 'School Classes', phone: 'School' },
  { key: 'bootcamp', label: 'My Bootcamps', phone: 'Bootcamps' },
  { key: 'tutor', label: 'Instant Tutors', phone: 'Tutors' },
  { key: 'recordings', label: 'Recordings' },
];

const byStart = (a: Session, b: Session) => (a.day + a.start).localeCompare(b.day + b.start);

/** The hub's state: the tab, the chosen day and view, reminders, sessions added from "this week" and booked tutors. */
export function useLiveHub(hub: Hub) {
  const [tab, setTab] = useState<TabKey>('all');
  const [day, setDay] = useState(hub.now.day);
  const [view, setView] = useState<View>('week');
  const [reminders, setReminders] = useState<readonly string[]>([]);
  const [added, setAdded] = useState<readonly string[]>([]);
  const [booked, setBooked] = useState<readonly Session[]>([]);
  const [booking, setBooking] = useState<Tutor | null>(null);

  const all = [...hub.sessions, ...hub.thisWeek.filter((x) => added.includes(x.id)), ...booked];
  const action = (x: { day: string; start: string; end: string }) => sessionAction(x, hub.now);
  const list =
    tab === 'recordings'
      ? all.filter((x) => x.recording && action(x) === 'ended').sort(byStart)
      : all.filter((x) => x.day === day && (tab === 'all' || x.kind === tab)).sort(byStart);
  const toggle = (ids: readonly string[], id: string) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);

  return {
    tab,
    setTab,
    day,
    setDay,
    view,
    setView,
    list,
    action,
    booking,
    setBooking,
    dot: (d: string) => dayDot(all.filter((x) => x.day === d), d < hub.now.day),
    reminded: (id: string) => reminders.includes(id),
    toggleReminder: (id: string) => setReminders((r) => toggle(r, id)),
    isAdded: (id: string) => added.includes(id),
    toggleAdded: (id: string) => setAdded((a) => toggle(a, id)),
    bookedWith: (t: Tutor) => booked.find((x) => x.id === `rescue-${t.id}`),
    /** Books a 15-minute rescue that starts now and puts it on today's schedule. */
    book: (t: Tutor) => {
      const start = hub.now.time;
      const session: Session = {
        id: `rescue-${t.id}`,
        day: hub.now.day,
        start,
        end: addMinutes(start, hub.sessionMinutes),
        kind: 'tutor',
        title: `Homework Rescue: ${t.subject}`,
        short: `Rescue: ${t.subject}`,
        teacher: t.name,
        context: `Instant Tutor • ${hub.sessionMinutes} min`,
        icon: t.icon,
      };
      setBooked((b) => [...b.filter((x) => x.id !== session.id), session]);
      setBooking(null);
      setDay(hub.now.day);
    },
    today: () => setDay(hub.now.day),
    shift: (n: number) => setDay((d) => (view === 'week' ? addDays(d, 7 * n) : addMonths(d, n))),
  };
}

export type HubState = ReturnType<typeof useLiveHub>;
