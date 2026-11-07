import { useMemo, useState } from 'react';

import {
  type CalendarCategory,
  filterCalendarEvents,
  findCollision,
  formatHourLabel,
  suggestFreeSlots,
} from '@/lib/teacher-calendar';
import { toast } from '@/lib/toast';
import type { CalendarEventItem, CalendarNavKey, SyncProvider, TeacherCalendar } from '@/mock/teacher-calendar';

export type CalendarMode = 'Day' | 'Week' | 'Month';

export function useTeacherCalendar(
  c: TeacherCalendar,
  initialMode: CalendarMode = 'Week',
  initialAdding = false,
) {
  const [mode, setMode] = useState<CalendarMode>(initialMode);
  const [selectedDay, setSelectedDay] = useState(3); // Thu 29 Oct
  const [month, setMonth] = useState(c.monthLabel);
  const [section, setSection] = useState<CalendarNavKey>('My Calendar');
  const [availableNow, setAvailableNow] = useState(c.availableNow);
  const [timezone, setTimezone] = useState(c.timezone);
  const [providers, setProviders] = useState<SyncProvider[]>(() => [...c.providers]);
  const [duration, setDuration] = useState(c.availability.duration);
  const [daily, setDaily] = useState(c.availability.daily);
  const [buffer, setBuffer] = useState(c.availability.buffer);
  const [events, setEvents] = useState<CalendarEventItem[]>(() => [...c.events]);
  const [adding, setAdding] = useState(initialAdding);
  const [newTitle, setNewTitle] = useState('O-Level Mathematics Revision');
  const [newCategory, setNewCategory] = useState<CalendarCategory>('school');
  const [newDay, setNewDay] = useState(3);
  const [newStart, setNewStart] = useState(11);

  const [enabledCategories, setEnabledCategories] = useState<Record<CalendarCategory, boolean>>({
    school: true,
    tutoring: true,
    instant: true,
    tasks: true,
    content: true,
    external: true,
  });

  const toggleCategory = (key: CalendarCategory) => {
    setEnabledCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAvailableNow = (next?: boolean) => {
    setAvailableNow((prev) => {
      const val = next ?? !prev;
      toast(
        val
          ? 'You are now visible as available for 15-minute Instant Help sessions.'
          : 'Instant Help availability paused.',
      );
      return val;
    });
  };

  const stepMonth = (delta: -1 | 1) => {
    const idx = c.months.indexOf(month);
    const nextIdx = Math.max(0, Math.min(c.months.length - 1, (idx === -1 ? 1 : idx) + delta));
    setMonth(c.months[nextIdx] ?? c.monthLabel);
  };

  const goToday = () => {
    setMonth(c.monthLabel);
    setSelectedDay(3);
    toast('Jumped to Thu, 29 Oct 2026 (Today).');
  };

  const toggleProvider = (id: SyncProvider['id']) => {
    setProviders((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next = !p.connected;
        toast(next ? `${p.name} connected. Busy times are now synced.` : `${p.name} disconnected.`);
        return { ...p, connected: next };
      }),
    );
  };

  const syncProviderNow = (name: string) => {
    toast(`${name} synced just now — zero collisions found.`);
  };

  const visibleEvents = useMemo(
    () =>
      filterCalendarEvents(events, enabledCategories).filter(
        (e) => availableNow || !(e.category === 'instant' && e.subtitle === '(Available)'),
      ),
    [events, enabledCategories, availableNow],
  );

  const collision = useMemo(
    () => findCollision(events, newDay, newStart, 1),
    [events, newDay, newStart],
  );

  const freeSlots = useMemo(
    () =>
      suggestFreeSlots(
        events,
        c.days.map((d) => `${d.short} ${d.label}`),
        newDay,
        1,
        3,
      ),
    [events, c.days, newDay],
  );

  /**
   * Adds a class of `duration` hours; `weekly` marks it as a repeating series (8 weeks, same day and time).
   * The schedule pop-up passes its own title and category: state set just before would not be read yet.
   */
  const addEventAt = (day: number, start: number, duration = 1, weekly = false, given?: { title: string; category: CalendarCategory }) => {
    const title = given?.title.trim() || newTitle.trim() || 'New Session';
    const category = given?.category ?? newCategory;
    const clash = findCollision(events, day, start, duration);
    if (clash) {
      toast(`Time collision with "${clash.title}". Pick one of the suggested free slots.`);
      return;
    }
    const endHour = start + duration;
    const fmtShort = (h: number) => formatHourLabel(h).replace(/ (AM|PM)$/, '');
    const kind = category === 'school' ? 'Class (School)' : category === 'tutoring' ? '(1-on-1)' : '(Scheduled)';
    const created: CalendarEventItem = {
      id: `custom-${Date.now()}`,
      day,
      start,
      duration,
      timeLabel: `${fmtShort(start)}–${fmtShort(endHour)}`,
      title,
      subtitle: weekly ? `${kind} · Weekly` : kind,
      phoneTitle: title,
      phoneTime: `${formatHourLabel(start)} – ${formatHourLabel(endHour)}`,
      category,
      icon: category === 'school' ? 'book' : category === 'tutoring' ? 'smile' : 'calendar',
      go: '/teach/host',
    };
    setEvents((prev) => [...prev, created]);
    setAdding(false);
    setSelectedDay(day);
    const dayName = c.days[day]?.short ?? 'Day';
    toast(
      weekly
        ? `Scheduled 8 weekly classes: "${title}", every ${dayName} at ${formatHourLabel(start)}.`
        : `Added "${title}" on ${dayName} at ${formatHourLabel(start)}.`,
    );
  };

  return {
    mode,
    setMode,
    selectedDay,
    setSelectedDay,
    month,
    setMonth,
    stepMonth,
    goToday,
    section,
    setSection,
    availableNow,
    toggleAvailableNow,
    timezone,
    setTimezone,
    providers,
    toggleProvider,
    syncProviderNow,
    duration,
    setDuration,
    daily,
    setDaily,
    buffer,
    setBuffer,
    enabledCategories,
    toggleCategory,
    visibleEvents,
    adding,
    setAdding,
    newTitle,
    setNewTitle,
    newCategory,
    setNewCategory,
    newDay,
    setNewDay,
    newStart,
    setNewStart,
    collision,
    freeSlots,
    addEventAt,
  };
}

export type CalendarController = ReturnType<typeof useTeacherCalendar>;

