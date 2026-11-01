import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import {
  type SideItem,
  type TeacherMe,
  TeacherPhoneTop,
  TeacherSideNav,
  TeacherTopBar,
} from '@/features/teacher/frame/TeacherFrame';
import { BLUE, BODY, CANVAS, INK, LINE, MUTED, Panel } from '@/features/teacher/frame/TeacherParts';
import type { CalendarNavKey, TeacherCalendar } from '@/mock/teacher-calendar';

import {
  AvailabilitySettingsCard,
  ExternalCalendarSyncCard,
  PhoneInstantHelpCard,
  SidebarAvailableCard,
  SidebarSectionBanner,
  UpcomingEventsCard,
} from './CalendarCards';
import {
  CalendarFilterBar,
  DayStrip,
  DesktopDayGrid,
  DesktopWeekGrid,
  MonthGrid,
  PhoneDayTimeline,
} from './CalendarGrid';
import { ScheduleLiveModal } from './ScheduleLiveModal';
import { type CalendarController, type CalendarMode, useTeacherCalendar } from './useTeacherCalendar';

/** The calendar reference's desktop width, laid out in its pixels and scaled via RefScale. */
export const CALENDAR_REF_WIDTH = 1180;

const MODES: readonly CalendarMode[] = ['Day', 'Week', 'Month'];

function MonthPicker({ c, ctl }: { c: TeacherCalendar; ctl: CalendarController }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={[styles.monthNavBox, open && styles.raised]}>
      <Pressable
        style={styles.monthArrow}
        onPress={() => ctl.stepMonth(-1)}
        accessibilityRole="button"
        accessibilityLabel="Previous month"
        hitSlop={6}>
        <Icon name="chevronLeft" size={13} color={INK} />
      </Pressable>
      <Pressable
        style={styles.monthCenter}
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`Month: ${ctl.month}`}>
        <Text style={styles.monthText}>{ctl.month}</Text>
        <Icon name="chevronDown" size={12} color={INK} />
      </Pressable>
      <Pressable
        style={styles.monthArrow}
        onPress={() => ctl.stepMonth(1)}
        accessibilityRole="button"
        accessibilityLabel="Next month"
        hitSlop={6}>
        <Icon name="chevronRight" size={13} color={INK} />
      </Pressable>
      {open ? (
        <View style={styles.monthDropdown}>
          {c.months.map((m) => (
            <Pressable
              key={m}
              style={[styles.monthOption, m === ctl.month && styles.monthOptionOn]}
              onPress={() => {
                ctl.setMonth(m);
                setOpen(false);
              }}
              accessibilityRole="menuitem">
              <Text style={[styles.monthOptionText, m === ctl.month && styles.monthOptionTextOn]}>{m}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** Desktop layout for the Unified Zero-Collision Calendar & External Sync reference. */
export function CalendarDesk({
  c,
  me,
  initialAdding = false,
}: {
  c: TeacherCalendar;
  me: TeacherMe;
  initialAdding?: boolean;
}) {
  const ctl = useTeacherCalendar(c, 'Week', initialAdding);
  const onSideItem = (item: SideItem) => {
    ctl.setSection(item.label as CalendarNavKey);
    return true;
  };
  return (
    <View style={styles.canvas}>
      <TeacherTopBar
        active="Calendar"
        me={{ ...me, notifications: c.me.notifications }}
        placeholder="Search students, classes, or resources..."
      />
      <View style={styles.body}>
        <TeacherSideNav
          title="Calendar"
          items={c.nav}
          active={ctl.section}
          onItem={onSideItem}>
          <SidebarAvailableCard c={c} ctl={ctl} />
        </TeacherSideNav>

        <View style={styles.main}>
          {/* Main Calendar White Card */}
          <Panel style={styles.calendarPanel}>
            <View style={[styles.calTopBar, styles.raised]}>
              <View style={styles.flex}>
                <Text style={styles.title} accessibilityRole="header">
                  My Calendar
                </Text>
                <Text style={styles.subtitle}>
                  Manage your school classes, private tutoring, and external calendar events in one place.
                </Text>
              </View>

              <View style={styles.controlsRow}>
                <Pressable
                  style={styles.todayBtn}
                  onPress={ctl.goToday}
                  accessibilityRole="button"
                  accessibilityLabel="Today">
                  <Text style={styles.todayBtnText}>Today</Text>
                </Pressable>

                <MonthPicker c={c} ctl={ctl} />

                <View style={styles.modeSeg} accessibilityRole="tablist">
                  {MODES.map((m) => {
                    const on = m === ctl.mode;
                    return (
                      <Pressable
                        key={m}
                        style={[styles.modeBtn, on && styles.modeBtnOn]}
                        onPress={() => ctl.setMode(m)}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: on }}
                        accessibilityLabel={`${m} view`}>
                        <Text style={[styles.modeBtnText, on && styles.modeBtnTextOn]}>{m}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Pressable
                  style={styles.addEventBtn}
                  onPress={() => ctl.setAdding(true)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: ctl.adding }}
                  accessibilityLabel="Add Event">
                  <Icon name="plus" size={14} color="#FFFFFF" />
                  <Text style={styles.addEventBtnText}>Add Event</Text>
                </Pressable>
              </View>
            </View>

            <SidebarSectionBanner c={c} ctl={ctl} />

            {ctl.mode === 'Week' ? <DesktopWeekGrid c={c} ctl={ctl} /> : null}
            {ctl.mode === 'Day' ? <DesktopDayGrid c={c} ctl={ctl} /> : null}
            {ctl.mode === 'Month' ? <MonthGrid c={c} ctl={ctl} /> : null}

            <CalendarFilterBar c={c} ctl={ctl} />
          </Panel>

          {/* Bottom 3 Cards Row */}
          <View style={styles.bottomRow}>
            <ExternalCalendarSyncCard ctl={ctl} />
            <AvailabilitySettingsCard c={c} ctl={ctl} />
            <UpcomingEventsCard c={c} />
          </View>
        </View>
      </View>

      {ctl.adding ? (
        <ScheduleLiveModal c={c} ctl={ctl} onClose={() => ctl.setAdding(false)} />
      ) : null}
    </View>
  );
}

/** Phone layout matching the right-hand mobile screen in the Calendar reference. */
export function CalendarPhone({
  c,
  me,
  initialAdding = false,
}: {
  c: TeacherCalendar;
  me: TeacherMe;
  initialAdding?: boolean;
}) {
  const ctl = useTeacherCalendar(c, 'Day', initialAdding);
  return (
    <View style={styles.phoneRoot}>
      <TeacherPhoneTop me={{ ...me, notifications: c.me.notifications }} />
      <ScrollView contentContainerStyle={styles.phoneScroll}>
        {/* Title + "+ Add" button */}
        <View style={styles.phoneHeadRow}>
          <Text style={styles.phoneTitle} accessibilityRole="header">
            My Calendar
          </Text>
          <Pressable
            style={styles.phoneAddBtn}
            onPress={() => ctl.setAdding((a) => !a)}
            accessibilityRole="button"
            accessibilityState={{ expanded: ctl.adding }}
            accessibilityLabel="Add Event">
            <Icon name="plus" size={14} color="#FFFFFF" />
            <Text style={styles.phoneAddBtnText}>Add</Text>
          </Pressable>
        </View>

        {ctl.adding ? (
          <ScheduleLiveModal c={c} ctl={ctl} onClose={() => ctl.setAdding(false)} phone />
        ) : null}

        {/* Month bar: "< October 2026 v" on left, "Today" + ">" on right */}
        <View style={styles.phoneMonthBar}>
          <View style={styles.phoneMonthLeft}>
            <Pressable
              onPress={() => ctl.stepMonth(-1)}
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              hitSlop={8}>
              <Icon name="chevronLeft" size={14} color={INK} />
            </Pressable>
            <Text style={styles.phoneMonthLabel}>{ctl.month}</Text>
            <Icon name="chevronDown" size={12} color={INK} />
          </View>
          <View style={styles.phoneMonthRight}>
            <Pressable
              style={styles.phoneTodayBtn}
              onPress={ctl.goToday}
              accessibilityRole="button"
              accessibilityLabel="Today">
              <Text style={styles.todayBtnText}>Today</Text>
            </Pressable>
            <Pressable
              style={styles.phoneNextBtn}
              onPress={() => ctl.stepMonth(1)}
              accessibilityRole="button"
              accessibilityLabel="Next month"
              hitSlop={8}>
              <Icon name="chevronRight" size={13} color={INK} />
            </Pressable>
          </View>
        </View>

        {/* Segmented underline tabs: Day | Week | Month */}
        <View style={styles.phoneTabs} accessibilityRole="tablist">
          {MODES.map((m) => {
            const on = m === ctl.mode;
            return (
              <Pressable
                key={m}
                style={[styles.phoneTab, on && styles.phoneTabOn]}
                onPress={() => ctl.setMode(m)}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`${m} view`}>
                <Text style={[styles.phoneTabText, on && styles.phoneTabTextOn]}>{m}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* 7-day strip (Mon 26 .. Thu 29 .. Sun 1) */}
        <DayStrip c={c} ctl={ctl} />

        {/* Selected view body */}
        {ctl.mode === 'Day' ? (
          <PhoneDayTimeline c={c} ctl={ctl} dayIndex={ctl.selectedDay} maxHour={18} />
        ) : null}
        {ctl.mode === 'Week' ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ width: 760 }}>
              <DesktopWeekGrid c={c} ctl={ctl} />
            </View>
          </ScrollView>
        ) : null}
        {ctl.mode === 'Month' ? <MonthGrid c={c} ctl={ctl} /> : null}

        {/* Green Instant Help availability card at the bottom of the phone screen */}
        <PhoneInstantHelpCard ctl={ctl} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  raised: { zIndex: 25 },
  canvas: {
    width: CALENDAR_REF_WIDTH,
    padding: 14,
    gap: 8,
    backgroundColor: CANVAS,
  },
  body: {
    flexDirection: 'row',
    gap: 8,
  },
  main: {
    flex: 1,
    gap: 10,
  },
  calendarPanel: {
    padding: 16,
    gap: 12,
  },
  calTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12.5,
    color: BODY,
    marginTop: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  todayBtn: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: INK,
  },
  monthNavBox: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    gap: 4,
  },
  monthArrow: {
    width: 22,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 6,
  },
  monthText: {
    fontSize: 12,
    fontWeight: '700',
    color: INK,
  },
  monthDropdown: {
    position: 'absolute',
    top: 36,
    left: 0,
    right: 0,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: LINE,
    shadowColor: '#0B1424',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  monthOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  monthOptionOn: {
    backgroundColor: '#EEF4FF',
  },
  monthOptionText: {
    fontSize: 11.5,
    color: INK,
  },
  monthOptionTextOn: {
    color: BLUE,
    fontWeight: '700',
  },
  modeSeg: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: '#F8FAFD',
  },
  modeBtn: {
    height: 26,
    paddingHorizontal: 11,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeBtnOn: {
    backgroundColor: '#DCEAFE',
  },
  modeBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: BODY,
  },
  modeBtnTextOn: {
    color: BLUE,
    fontWeight: '700',
  },
  addEventBtn: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    borderRadius: 7,
    backgroundColor: BLUE,
  },
  addEventBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'stretch',
  },
  phoneRoot: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  phoneScroll: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 100,
    gap: 8,
  },
  phoneHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phoneTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.4,
  },
  phoneAddBtn: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    borderRadius: 7,
    backgroundColor: BLUE,
  },
  phoneAddBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  phoneMonthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  phoneMonthLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phoneMonthLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: INK,
  },
  phoneMonthRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phoneTodayBtn: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneNextBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: LINE,
  },
  phoneTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 2.5,
    borderColor: 'transparent',
  },
  phoneTabOn: {
    borderColor: BLUE,
  },
  phoneTabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: MUTED,
  },
  phoneTabTextOn: {
    color: BLUE,
    fontWeight: '700',
  },
});

