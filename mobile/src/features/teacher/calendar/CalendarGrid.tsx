import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { useTeacherGo } from '@/features/teacher/frame/TeacherFrame';
import { MUTED } from '@/features/teacher/frame/TeacherParts';
import { type CalendarCategory, formatHourLabel } from '@/lib/teacher-calendar';
import type { CalendarEventItem, CategoryMeta, TeacherCalendar } from '@/mock/teacher-calendar';

import type { CalendarController } from './useTeacherCalendar';
import { ROW_H, styles } from './CalendarGrid.styles';

const START_HOUR = 8;

function categoryMeta(c: TeacherCalendar, key: CalendarCategory): CategoryMeta {
  return c.categories.find((x) => x.key === key) ?? c.categories[0];
}

/** The desktop 7-day week grid (Mon 26 Oct – Sun 1 Nov) with the 10:30 AM red line and Sunday Personal Time. */
export function DesktopWeekGrid({ c, ctl }: { c: TeacherCalendar; ctl: CalendarController }) {
  const go = useTeacherGo();
  const totalHeight = c.hours.length * ROW_H;
  const nowTop = (c.nowHour - START_HOUR) * ROW_H;

  return (
    <View style={styles.gridWrap}>
      {/* Day column headers */}
      <View style={styles.headerRow}>
        <View style={styles.timeHeaderCell} />
        {c.days.map((d) => {
          const isSelected = d.today;
          return (
            <Pressable
              key={d.index}
              style={[styles.dayHeaderCell, isSelected && styles.dayHeaderToday]}
              onPress={() => ctl.setSelectedDay(d.index)}
              accessibilityRole="button"
              accessibilityLabel={`${d.short} ${d.label}`}>
              <Text style={[styles.dayHeaderShort, isSelected && styles.dayHeaderTextToday]}>{d.short}</Text>
              <Text style={[styles.dayHeaderDate, isSelected && styles.dayHeaderDateToday]}>{d.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Main grid body */}
      <View style={[styles.gridBody, { height: totalHeight }]}>
        {/* Left time axis */}
        <View style={styles.timeCol}>
          {c.hours.map((h, i) => (
            <View key={h} style={[styles.timeCell, { top: i * ROW_H }]}>
              <Text style={styles.timeText}>{formatHourLabel(h)}</Text>
            </View>
          ))}
          {/* 10:30 AM red pill badge */}
          <View style={[styles.nowBadge, { top: nowTop - 10 }]}>
            <Text style={styles.nowBadgeText}>{c.nowLabel}</Text>
          </View>
        </View>

        {/* 7 Day columns */}
        <View style={styles.daysArea}>
          {/* Horizontal hour grid lines across Mon-Sat */}
          {c.hours.map((h, i) => (
            <View key={h} style={[styles.hourLine, { top: i * ROW_H }]} pointerEvents="none" />
          ))}

          <View style={styles.columnsRow}>
            {c.days.map((d) => {
              if (d.personal) {
                return (
                  <View key={d.index} style={[styles.dayCol, styles.personalCol]}>
                    <View style={styles.personalBadge}>
                      <Icon name="coffee" size={20} color="#64748B" />
                      <Text style={styles.personalText}>Personal Time</Text>
                    </View>
                  </View>
                );
              }
              const dayEvents = ctl.visibleEvents.filter((e) => e.day === d.index);
              return (
                <View key={d.index} style={[styles.dayCol, d.today && styles.dayColToday]}>
                  {dayEvents.map((e) => {
                    const cat = categoryMeta(c, e.category);
                    const top = (e.start - START_HOUR) * ROW_H + 2;
                    const height = Math.max(38, e.duration * ROW_H - 4);
                    return (
                      <Pressable
                        key={e.id}
                        style={[
                          styles.eventBlock,
                          {
                            top,
                            height,
                            backgroundColor: cat.cardBg,
                            borderLeftColor: cat.border,
                          },
                        ]}
                        onPress={() => go(e.go)}
                        accessibilityRole="button"
                        accessibilityLabel={`${d.short} ${e.timeLabel} ${e.title} ${e.subtitle ?? ''}`}>
                        <Text style={[styles.eventTime, { color: cat.subColor }]} numberOfLines={1}>
                          {e.timeLabel}
                        </Text>
                        <View style={styles.eventTitleRow}>
                          {e.bolt ? <Icon name="bolt" size={11} color="#16A34A" /> : null}
                          <Text style={[styles.eventTitle, { color: cat.titleColor }]} numberOfLines={1}>
                            {e.title}
                          </Text>
                        </View>
                        {e.subtitle ? (
                          <Text style={[styles.eventSub, { color: cat.subColor }]} numberOfLines={1}>
                            {e.subtitle}
                          </Text>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              );
            })}
          </View>

          {/* Red 10:30 AM current-time line across Mon–Sat */}
          <View style={[styles.nowLineWrap, { top: nowTop }]} pointerEvents="none">
            <View style={styles.nowDotLeft} />
            <View style={styles.nowLine} />
          </View>
        </View>
      </View>
    </View>
  );
}

/** Single-day view for desktop when "Day" mode is selected. */
export function DesktopDayGrid({ c, ctl }: { c: TeacherCalendar; ctl: CalendarController }) {
  const day = c.days[ctl.selectedDay] ?? c.days[3];
  return (
    <View style={styles.dayModeWrap}>
      <DayStrip c={c} ctl={ctl} />
      <PhoneDayTimeline c={c} ctl={ctl} dayIndex={day.index} maxHour={20} />
    </View>
  );
}

/** Month overview grid when "Month" mode is selected. */
export function MonthGrid({ c, ctl }: { c: TeacherCalendar; ctl: CalendarController }) {
  const weeks = [
    ['28 Sep', '29', '30', '1 Oct', '2', '3', '4'],
    ['5', '6', '7', '8', '9', '10', '11'],
    ['12', '13', '14', '15', '16', '17', '18'],
    ['19', '20', '21', '22', '23', '24', '25'],
    ['26', '27', '28', '29', '30', '31', '1 Nov'],
  ];
  return (
    <View style={styles.gridWrap}>
      <View style={styles.headerRow}>
        {c.days.map((d) => (
          <View key={d.index} style={styles.monthDayHead}>
            <Text style={styles.dayHeaderShort}>{d.short}</Text>
          </View>
        ))}
      </View>
      {weeks.map((w, wi) => (
        <View key={wi} style={styles.monthRow}>
          {w.map((cell, di) => {
            const isTargetWeek = wi === 4;
            const isToday = isTargetWeek && di === 3;
            const dayEvents = isTargetWeek ? ctl.visibleEvents.filter((e) => e.day === di).slice(0, 3) : [];
            return (
              <Pressable
                key={cell}
                style={[styles.monthCell, isToday && styles.dayColToday]}
                onPress={() => {
                  if (isTargetWeek) {
                    ctl.setSelectedDay(di);
                    ctl.setMode('Day');
                  }
                }}
                accessibilityRole="button"
                accessibilityLabel={`Oct ${cell}`}>
                <Text style={[styles.monthCellNum, isToday && styles.dayHeaderDateToday]}>{cell}</Text>
                {dayEvents.map((e) => {
                  const cat = categoryMeta(c, e.category);
                  return (
                    <View key={e.id} style={[styles.monthPill, { backgroundColor: cat.cardBg, borderLeftColor: cat.border }]}>
                      <Text style={[styles.monthPillText, { color: cat.titleColor }]} numberOfLines={1}>
                        {e.title}
                      </Text>
                    </View>
                  );
                })}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

/** Category filter checkboxes and timezone dropdown below the desktop calendar grid. */
export function CalendarFilterBar({ c, ctl }: { c: TeacherCalendar; ctl: CalendarController }) {
  const [tzOpen, setTzOpen] = useState(false);
  return (
    <View style={[styles.filterBar, tzOpen && styles.raised]}>
      <View style={styles.filterList}>
        {c.categories.map((cat) => {
          const checked = ctl.enabledCategories[cat.key];
          return (
            <Pressable
              key={cat.key}
              style={styles.filterItem}
              onPress={() => ctl.toggleCategory(cat.key)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              accessibilityLabel={cat.label}>
              <View style={[styles.checkbox, { backgroundColor: checked ? cat.checkBg : '#FFFFFF', borderColor: cat.checkBg }]}>
                {checked ? <Icon name="check" size={11} color="#FFFFFF" /> : null}
              </View>
              <Text style={styles.filterLabel}>{cat.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View>
        <Pressable
          style={styles.tzBtn}
          onPress={() => setTzOpen((o) => !o)}
          accessibilityRole="button"
          accessibilityState={{ expanded: tzOpen }}
          accessibilityLabel={`Time zone: ${ctl.timezone}`}>
          <Icon name="globe" size={13} color={MUTED} />
          <Text style={styles.tzText}>{ctl.timezone}</Text>
          <Icon name="chevronDown" size={11} color={MUTED} />
        </Pressable>
        {tzOpen ? (
          <View style={styles.tzMenu}>
            {c.timezones.map((tz) => (
              <Pressable
                key={tz}
                style={[styles.tzOption, tz === ctl.timezone && styles.tzOptionOn]}
                onPress={() => {
                  ctl.setTimezone(tz);
                  setTzOpen(false);
                }}
                accessibilityRole="menuitem">
                <Text style={[styles.tzOptionText, tz === ctl.timezone && styles.tzOptionTextOn]}>{tz}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

/** The 7-day strip (Mon 26 .. Thu 29 .. Sun 1) shown in the phone reference and Day mode. */
export function DayStrip({ c, ctl }: { c: TeacherCalendar; ctl: CalendarController }) {
  return (
    <View style={styles.stripRow}>
      {c.days.map((d) => {
        const on = d.index === ctl.selectedDay;
        return (
          <Pressable
            key={d.index}
            style={styles.stripDay}
            onPress={() => ctl.setSelectedDay(d.index)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${d.short} ${d.num}`}>
            <Text style={[styles.stripShort, on && styles.stripShortOn]}>{d.short}</Text>
            <View style={[styles.stripNumBox, on && styles.stripNumBoxOn]}>
              <Text style={[styles.stripNum, on && styles.stripNumOn]}>{d.num}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

/** The vertical daily timeline (8:00 AM – 6:00 PM) with icon-badged cards and 10:30 AM red line, matching the phone reference. */
export function PhoneDayTimeline({
  c,
  ctl,
  dayIndex,
  maxHour = 18,
}: {
  c: TeacherCalendar;
  ctl: CalendarController;
  dayIndex: number;
  maxHour?: number;
}) {
  const go = useTeacherGo();
  const hours = c.hours.filter((h) => h <= maxHour);
  const hourHeight = 46;
  const totalHeight = hours.length * hourHeight;
  const nowTop = (c.nowHour - START_HOUR) * hourHeight;
  const day = c.days[dayIndex];
  const dayEvents = ctl.visibleEvents.filter((e) => e.day === dayIndex && e.start <= maxHour);

  if (day?.personal) {
    return (
      <View style={styles.personalPhoneCard}>
        <Icon name="coffee" size={24} color="#64748B" />
        <Text style={styles.personalPhoneTitle}>Personal Time (Sunday)</Text>
        <Text style={styles.personalPhoneSub}>No school classes or tutoring sessions scheduled today.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.phoneTimeline, { height: totalHeight }]}>
      {/* Left time labels */}
      <View style={styles.phoneTimeCol}>
        {hours.map((h, i) => (
          <View key={h} style={[styles.phoneTimeCell, { top: i * hourHeight }]}>
            <Text style={styles.phoneTimeText}>{formatHourLabel(h)}</Text>
          </View>
        ))}
        <View style={[styles.phoneNowBadge, { top: nowTop - 10 }]}>
          <Text style={styles.nowBadgeText}>{c.nowLabel}</Text>
        </View>
      </View>

      {/* Right events track */}
      <View style={styles.phoneEventsTrack}>
        {hours.map((h, i) => (
          <View key={h} style={[styles.phoneHourLine, { top: i * hourHeight }]} pointerEvents="none" />
        ))}

        {dayEvents.map((e: CalendarEventItem) => {
          const cat = categoryMeta(c, e.category);
          const top = (e.start - START_HOUR) * hourHeight + 2;
          const height = Math.max(40, e.duration * hourHeight - 4);
          return (
            <Pressable
              key={e.id}
              style={[
                styles.phoneEventCard,
                {
                  top,
                  height,
                  backgroundColor: cat.cardBg,
                  borderLeftColor: cat.border,
                },
              ]}
              onPress={() => go(e.go)}
              accessibilityRole="button"
              accessibilityLabel={`${e.phoneTitle ?? e.title}, ${e.phoneTime ?? e.timeLabel}`}>
              <View style={[styles.phoneEventIcon, { backgroundColor: e.bolt ? 'transparent' : cat.iconBg }]}>
                <Icon name={e.icon} size={e.bolt ? 16 : 12} color={e.bolt ? '#16A34A' : '#FFFFFF'} />
              </View>
              <View style={styles.flex}>
                <Text style={[styles.phoneEventTitle, { color: cat.titleColor }]} numberOfLines={1}>
                  {e.phoneTitle ?? e.title}
                </Text>
                <Text style={[styles.phoneEventTime, { color: cat.subColor }]} numberOfLines={1}>
                  {e.phoneTime ?? e.timeLabel}
                </Text>
              </View>
            </Pressable>
          );
        })}

        {/* 10:30 AM red current-time indicator */}
        <View style={[styles.phoneNowLineRow, { top: nowTop }]} pointerEvents="none">
          <View style={styles.phoneNowDot} />
          <View style={styles.nowLine} />
        </View>
      </View>
    </View>
  );
}
