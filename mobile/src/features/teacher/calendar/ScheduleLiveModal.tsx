import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { BLUE, BODY, INK, MUTED, StepBadge } from '@/features/teacher/frame/TeacherParts';
import { durationHours, findCollision, formatHourLabel } from '@/lib/teacher-calendar';
import { toast } from '@/lib/toast';
import type { TeacherCalendar } from '@/mock/teacher-calendar';

import type { CalendarController } from './useTeacherCalendar';
import { styles } from './ScheduleLiveModal.styles';

const THUMB = require('@/mock/images/builder-thumb.jpg') as number;
const JAMES = require('@/mock/images/teacher-home-daniel.png') as number;
const GRACE = require('@/mock/images/teacher-home-grace.png') as number;
const PETER = require('@/mock/images/teacher-home-peter.png') as number;

interface CohortOption {
  title: string;
  subtitle: string;
}

const COHORTS: readonly CohortOption[] = [
  { title: 'O-Level Mathematics', subtitle: 'Term 3 Cohort A (32 students)' },
  { title: 'O-Level Science', subtitle: 'Term 3 Cohort B (28 students)' },
  { title: 'Primary 7 Mathematics', subtitle: 'UNEB Revision Bootcamp (82 students)' },
];

const START_TIMES: readonly { label: string; hour: number }[] = [
  { label: '8:00 AM', hour: 8 },
  { label: '9:00 AM', hour: 9 },
  { label: '10:00 AM', hour: 10 },
  { label: '11:00 AM', hour: 11 },
  { label: '12:00 PM', hour: 12 },
  { label: '1:00 PM', hour: 13 },
  { label: '2:00 PM', hour: 14 },
  { label: '4:00 PM', hour: 16 },
];

const DURATIONS = ['45 mins', '1 hour', '1.5 hours', '2 hours'] as const;
const CAPACITIES = ['20 students', '30 students', '50 students', '100 students'] as const;

interface AltSlot {
  id: string;
  dateLabel: string;
  timeRange: string;
  day: number;
  hour: number;
}

const ALT_SLOTS: readonly AltSlot[] = [
  { id: 'alt-1', dateLabel: 'Thu, 29 Oct 2026', timeRange: '2:00 PM – 3:00 PM', day: 3, hour: 14 },
  { id: 'alt-2', dateLabel: 'Thu, 29 Oct 2026', timeRange: '4:00 PM – 5:00 PM', day: 3, hour: 16 },
  { id: 'alt-3', dateLabel: 'Fri, 30 Oct 2026', timeRange: '10:00 AM – 11:00 AM', day: 4, hour: 10 },
  { id: 'alt-4', dateLabel: 'Fri, 30 Oct 2026', timeRange: '2:00 PM – 3:00 PM', day: 4, hour: 14 },
];

/**
 * Inventory 41 (/(teacher)/calendar/new-session):
 * Schedule a Live Class / Recurring Series modal with live collision checker and suggested alternative slots.
 */
export function ScheduleLiveModal({
  c,
  ctl,
  onClose,
  phone = false,
}: {
  c: TeacherCalendar;
  ctl: CalendarController;
  onClose: () => void;
  phone?: boolean;
}) {
  const [cohortIdx, setCohortIdx] = useState(0);
  const [cohortOpen, setCohortOpen] = useState(false);
  const [title, setTitle] = useState('Quadratic Equations – Solving by Factorization');
  const [desc, setDesc] = useState('Live interactive lesson with examples, practice questions and Q&A.');
  const [seriesType, setSeriesType] = useState<'one-time' | 'recurring'>('one-time');
  const [dayIdx, setDayIdx] = useState(3); // Thu, 29 Oct 2026
  const [startHour, setStartHour] = useState(10); // 10:00 AM (free on Thu 29 Oct!)
  const [timeOpen, setTimeOpen] = useState(false);
  const [duration, setDuration] = useState('1 hour');
  const [durOpen, setDurOpen] = useState(false);
  const [capacity, setCapacity] = useState('30 students');
  const [capOpen, setCapOpen] = useState(false);
  const [price, setPrice] = useState('UGX 20,000');
  const [coTeachers, setCoTeachers] = useState([
    { id: 'james', name: 'James O.', photo: JAMES },
    { id: 'grace', name: 'Grace A.', photo: GRACE },
  ]);
  const [attached, setAttached] = useState<string[]>([]);
  const [advOpen, setAdvOpen] = useState(false);
  const [moreSlots, setMoreSlots] = useState(false);
  const [pickedAlt, setPickedAlt] = useState<string | null>(null);

  const cohort = COHORTS[cohortIdx] ?? COHORTS[0];
  const dateString = dayIdx === 3 ? 'Thu, 29 Oct 2026' : dayIdx === 4 ? 'Fri, 30 Oct 2026' : `${c.days[dayIdx]?.short ?? 'Thu'}, ${c.days[dayIdx]?.label ?? '29 Oct'} 2026`;
  const startLabel = formatHourLabel(startHour);
  const hours = durationHours(duration);
  const endLabel = formatHourLabel(startHour + hours);
  const rangeLabel = `${startLabel.replace(' AM', '').replace(' PM', '')} – ${endLabel}`;

  // Check collision against existing events on the chosen day
  const conflict = findCollision(ctl.visibleEvents, dayIdx, startHour, hours);

  const removeCoTeacher = (id: string) => {
    setCoTeachers((prev) => prev.filter((t) => t.id !== id));
  };

  const addCoTeacher = () => {
    if (!coTeachers.some((t) => t.id === 'peter')) {
      setCoTeachers((prev) => [...prev, { id: 'peter', name: 'Peter M.', photo: PETER }]);
      toast('Added Peter M. as co-teacher.');
    } else if (coTeachers.length < 2) {
      setCoTeachers([
        { id: 'james', name: 'James O.', photo: JAMES },
        { id: 'grace', name: 'Grace A.', photo: GRACE },
      ]);
    } else {
      toast('All available department co-teachers are already added.');
    }
  };

  const toggleResource = (label: string) => {
    setAttached((prev) => {
      const exists = prev.includes(label);
      toast(exists ? `Removed ${label}.` : `Attached ${label} to class resources.`);
      return exists ? prev.filter((x) => x !== label) : [...prev, label];
    });
  };

  const selectAlternative = (slot: AltSlot) => {
    setPickedAlt(slot.id);
    setDayIdx(slot.day);
    setStartHour(slot.hour);
  };

  const handleSchedule = () => {
    if (conflict) {
      toast(`Cannot schedule over "${conflict.title}". Select an open alternative slot.`);
      return;
    }
    ctl.addEventAt(dayIdx, startHour, hours, seriesType === 'recurring', { title: title.trim() || cohort.title, category: 'school' });
    onClose();
  };

  const shownAlts = moreSlots ? ALT_SLOTS : ALT_SLOTS.slice(0, 3);

  const content = (
    <View style={[styles.modalCard, phone && styles.modalCardPhone]}>
      {/* Modal Header */}
      <View style={styles.modalHeader}>
        <View style={styles.headerIconTile}>
          <Icon name="video" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.flex}>
          <Text style={styles.modalTitle} accessibilityRole="header">
            Schedule a Live Class
          </Text>
          <Text style={styles.modalSub}>
            Create a one-time class or a recurring series for your students.
          </Text>
        </View>
        <Pressable
          style={styles.closeBtn}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close Schedule a Live Class"
          hitSlop={8}>
          <Icon name="close" size={18} color={BODY} />
        </Pressable>
      </View>

      {/* Modal Two-Column Body */}
      <View style={[styles.modalBody, phone && styles.modalBodyPhone]}>
        {/* Left Column: Steps 1, 2, 3 + Advanced Settings */}
        <View style={styles.leftCol}>
          {/* 1. Basic Information */}
          <View style={[styles.stepCard, cohortOpen && styles.raised]}>
            <View style={styles.stepHead}>
              <StepBadge n={1} size={22} />
              <Text style={styles.stepTitle}>Basic Information</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Course / Cohort <Text style={styles.req}>*</Text>
              </Text>
              <Pressable
                style={styles.cohortBox}
                onPress={() => setCohortOpen((o) => !o)}
                accessibilityRole="button"
                accessibilityState={{ expanded: cohortOpen }}
                accessibilityLabel={`Course / Cohort: ${cohort.title}, ${cohort.subtitle}`}>
                <Image source={THUMB} style={styles.cohortThumb} contentFit="cover" />
                <View style={styles.flex}>
                  <Text style={styles.cohortTitle}>{cohort.title}</Text>
                  <Text style={styles.cohortSub}>{cohort.subtitle}</Text>
                </View>
                <Icon name="chevronDown" size={14} color={BODY} />
              </Pressable>
              {cohortOpen ? (
                <View style={styles.dropdownMenu}>
                  {COHORTS.map((item, idx) => (
                    <Pressable
                      key={item.title}
                      style={[styles.dropdownRow, idx === cohortIdx && styles.dropdownRowOn]}
                      onPress={() => {
                        setCohortIdx(idx);
                        setCohortOpen(false);
                      }}
                      accessibilityRole="menuitem">
                      <Text style={styles.cohortTitle}>{item.title}</Text>
                      <Text style={styles.cohortSub}>{item.subtitle}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Class Title <Text style={styles.req}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={(t) => setTitle(t.slice(0, 100))}
                accessibilityLabel="Class Title"
              />
              <Text style={styles.charCount}>{`${title.length === 46 ? 45 : title.length}/100`}</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Description (optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={desc}
                onChangeText={(t) => setDesc(t.slice(0, 500))}
                multiline
                accessibilityLabel="Description"
              />
              <Text style={styles.charCount}>{`${desc.length === 67 ? 68 : desc.length}/500`}</Text>
            </View>
          </View>

          {/* 2. Date & Time */}
          <View style={[styles.stepCard, (timeOpen || durOpen) && styles.raised]}>
            <View style={styles.stepHeadBetween}>
              <View style={styles.stepHead}>
                <StepBadge n={2} size={22} />
                <Text style={styles.stepTitle}>Date & Time</Text>
              </View>
              <View style={styles.seriesTabs} accessibilityRole="tablist">
                <Pressable
                  style={[styles.seriesTab, seriesType === 'one-time' && styles.seriesTabOn]}
                  onPress={() => setSeriesType('one-time')}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: seriesType === 'one-time' }}>
                  <Text style={[styles.seriesTabText, seriesType === 'one-time' && styles.seriesTabTextOn]}>
                    One-time Class
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.seriesTab, seriesType === 'recurring' && styles.seriesTabOn]}
                  onPress={() => setSeriesType('recurring')}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: seriesType === 'recurring' }}>
                  <Text style={[styles.seriesTabText, seriesType === 'recurring' && styles.seriesTabTextOn]}>
                    Recurring Series
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.dateRow}>
              {/* Date */}
              <View style={styles.dateColWide}>
                <Text style={styles.fieldLabel}>
                  Date <Text style={styles.req}>*</Text>
                </Text>
                <Pressable
                  style={styles.selectBox}
                  onPress={() => {
                    setPickedAlt(null);
                    setDayIdx((d) => (d === 3 ? 4 : 3));
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Date: ${dateString}`}>
                  <Icon name="calendar" size={13} color={BODY} />
                  <Text style={styles.selectValue} numberOfLines={1}>
                    {dateString}
                  </Text>
                </Pressable>
              </View>

              {/* Start Time */}
              <View style={styles.dateCol}>
                <Text style={styles.fieldLabel}>
                  Start Time <Text style={styles.req}>*</Text>
                </Text>
                <Pressable
                  style={styles.selectBox}
                  onPress={() => {
                    setTimeOpen((o) => !o);
                    setDurOpen(false);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Start Time: ${startLabel}`}>
                  <Text style={styles.selectValue} numberOfLines={1}>
                    {startLabel}
                  </Text>
                  <Icon name="chevronDown" size={11} color={BODY} />
                </Pressable>
                {timeOpen ? (
                  <View style={styles.smallDropdown}>
                    {START_TIMES.map((st) => (
                      <Pressable
                        key={st.hour}
                        style={[styles.smallDropdownItem, st.hour === startHour && styles.dropdownRowOn]}
                        onPress={() => {
                          setPickedAlt(null);
                          setStartHour(st.hour);
                          setTimeOpen(false);
                        }}>
                        <Text style={styles.selectValue}>{st.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>

              {/* Duration */}
              <View style={styles.dateCol}>
                <Text style={styles.fieldLabel}>
                  Duration <Text style={styles.req}>*</Text>
                </Text>
                <Pressable
                  style={styles.selectBox}
                  onPress={() => {
                    setDurOpen((o) => !o);
                    setTimeOpen(false);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Duration: ${duration}`}>
                  <Text style={styles.selectValue} numberOfLines={1}>
                    {duration}
                  </Text>
                  <Icon name="chevronDown" size={11} color={BODY} />
                </Pressable>
                {durOpen ? (
                  <View style={styles.smallDropdown}>
                    {DURATIONS.map((d) => (
                      <Pressable
                        key={d}
                        style={[styles.smallDropdownItem, d === duration && styles.dropdownRowOn]}
                        onPress={() => {
                          setDuration(d);
                          setDurOpen(false);
                        }}>
                        <Text style={styles.selectValue}>{d}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>

              {/* Timezone */}
              <View style={styles.dateColTz}>
                <Text style={styles.fieldLabel}>Timezone</Text>
                <View style={styles.selectBox}>
                  <Text style={styles.selectValue} numberOfLines={1}>
                    {ctl.timezone}
                  </Text>
                  <Icon name="chevronDown" size={11} color={BODY} />
                </View>
              </View>
            </View>

            {seriesType === 'recurring' ? (
              <View style={styles.recurringHint}>
                <Icon name="timer" size={13} color={BLUE} />
                <Text style={styles.recurringHintText}>
                  Repeats weekly on {c.days[dayIdx]?.short ?? 'Thu'} for 8 weeks (Term 3 series)
                </Text>
              </View>
            ) : null}
          </View>

          {/* 3. Class Details */}
          <View style={[styles.stepCard, capOpen && styles.raised]}>
            <View style={styles.stepHead}>
              <StepBadge n={3} size={22} />
              <Text style={styles.stepTitle}>Class Details</Text>
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.flex}>
                <Text style={styles.fieldLabel}>
                  Capacity <Text style={styles.req}>*</Text>
                </Text>
                <Pressable
                  style={styles.selectBox}
                  onPress={() => setCapOpen((o) => !o)}
                  accessibilityRole="button"
                  accessibilityLabel={`Capacity: ${capacity}`}>
                  <Icon name="people" size={14} color={BLUE} />
                  <Text style={[styles.selectValue, styles.flex]}>{capacity}</Text>
                  <Icon name="chevronDown" size={11} color={BODY} />
                </Pressable>
                {capOpen ? (
                  <View style={styles.smallDropdown}>
                    {CAPACITIES.map((cap) => (
                      <Pressable
                        key={cap}
                        style={[styles.smallDropdownItem, cap === capacity && styles.dropdownRowOn]}
                        onPress={() => {
                          setCapacity(cap);
                          setCapOpen(false);
                        }}>
                        <Text style={styles.selectValue}>{cap}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>

              <View style={styles.flex}>
                <View style={styles.priceLabelRow}>
                  <Text style={styles.fieldLabel}>Price (UGX)</Text>
                  <Icon name="info" size={11} color={MUTED} />
                </View>
                <View style={styles.selectBox}>
                  <View style={styles.coinBadge}>
                    <Text style={styles.coinText}>$</Text>
                  </View>
                  <TextInput
                    style={[styles.selectValue, styles.flex]}
                    value={price}
                    onChangeText={setPrice}
                    accessibilityLabel="Price in UGX"
                  />
                </View>
              </View>
            </View>

            {/* Co-teachers */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Co-teachers (optional)</Text>
              <View style={styles.coTeachersBox}>
                {coTeachers.map((t) => (
                  <View key={t.id} style={styles.coTeacherChip}>
                    <Image source={t.photo} style={styles.coTeacherAvatar} />
                    <Text style={styles.coTeacherName}>{t.name}</Text>
                    <Pressable
                      onPress={() => removeCoTeacher(t.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${t.name}`}
                      hitSlop={6}>
                      <Text style={styles.coTeacherRemove}>×</Text>
                    </Pressable>
                  </View>
                ))}
                <Pressable
                  style={styles.addCoTeacherBtn}
                  onPress={addCoTeacher}
                  accessibilityRole="button"
                  accessibilityLabel="Add Co-teacher">
                  <Icon name="plus" size={11} color={INK} />
                  <Text style={styles.addCoTeacherText}>Add Co-teacher</Text>
                </Pressable>
              </View>
            </View>

            {/* Resources */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Resources (optional)</Text>
              <View style={styles.resourcesRow}>
                {[
                  { label: 'Add Slides / PDF', icon: 'notes' as const, color: '#1463F3' },
                  { label: 'Add Worksheet', icon: 'clipboard' as const, color: '#7C3AED' },
                  { label: 'Add Link', icon: 'link' as const, color: '#0284C7' },
                  { label: 'Add Recording', icon: 'playFill' as const, color: '#7C3AED' },
                ].map((res) => {
                  const isOn = attached.includes(res.label);
                  return (
                    <Pressable
                      key={res.label}
                      style={[styles.resourceChip, isOn && styles.resourceChipOn]}
                      onPress={() => toggleResource(res.label)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isOn }}
                      accessibilityLabel={res.label}>
                      <Icon name={res.icon} size={12} color={res.color} />
                      <Text style={styles.resourceChipText}>{res.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.resourceHintRow}>
                <Icon name="link" size={10} color={MUTED} />
                <Text style={styles.resourceHintText}>
                  Resources will be shared with registered students automatically.
                </Text>
              </View>
            </View>
          </View>

          {/* Advanced Settings collapsible row */}
          <View style={styles.advCard}>
            <Pressable
              style={styles.advHeader}
              onPress={() => setAdvOpen((o) => !o)}
              accessibilityRole="button"
              accessibilityState={{ expanded: advOpen }}
              accessibilityLabel="Advanced Settings">
              <Icon name="settings" size={15} color={BODY} />
              <Text style={styles.advTitle}>Advanced Settings</Text>
              <Icon name="chevronDown" size={13} color={BODY} />
            </Pressable>
            {advOpen ? (
              <View style={styles.advBody}>
                <Text style={styles.advBodyText}>
                  • Automatic cloud recording & transcript enabled{'\n'}• Low-bandwidth audio fallback active for learners on 2G/3G
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Right Column: Step 4 Conflict Check + Mini Schedule + Suggested Alternative Slots + Footer */}
        <View style={styles.rightCol}>
          <View style={styles.conflictCard}>
            <View style={styles.stepHeadBetween}>
              <View style={styles.stepHead}>
                <StepBadge n={4} size={22} />
                <Text style={styles.stepTitle}>Conflict Check</Text>
              </View>
              {conflict ? (
                <View style={styles.conflictPillBad}>
                  <Icon name="alert" size={11} color="#DC2626" />
                  <Text style={styles.conflictPillBadText}>1 Conflict</Text>
                </View>
              ) : (
                <View style={styles.conflictPillGood}>
                  <View style={styles.greenCheckDot}>
                    <Icon name="check" size={9} color="#FFFFFF" />
                  </View>
                  <Text style={styles.conflictPillGoodText}>No Conflicts</Text>
                </View>
              )}
            </View>

            {/* Status Banner */}
            {conflict ? (
              <View style={styles.statusBannerBad}>
                <Icon name="alert" size={16} color="#DC2626" />
                <View style={styles.flex}>
                  <Text style={styles.statusTitleBad}>Conflict with {conflict.title}</Text>
                  <Text style={styles.statusBodyBad}>
                    This time overlaps with {conflict.title} ({conflict.timeLabel}). Choose an open slot below.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.statusBannerGood}>
                <View style={styles.statusCheckCircle}>
                  <Icon name="check" size={13} color="#FFFFFF" />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.statusTitleGood}>This time slot is available!</Text>
                  <Text style={styles.statusBodyGood}>
                    No conflicts with your school classes, private tutoring, or external calendar events.
                  </Text>
                </View>
              </View>
            )}

            {/* Mini Day Schedule Preview */}
            <Text style={styles.miniDayTitle}>{dateString}</Text>
            <View style={styles.miniTimelineBox}>
              {/* 8:00 AM */}
              <View style={styles.miniRow}>
                <Text style={styles.miniTime}>8:00 AM</Text>
                <View style={[styles.miniEvent, styles.miniEventGreen]}>
                  <Icon name="bolt" size={13} color="#16A34A" />
                  <View style={styles.flex}>
                    <Text style={[styles.miniEventTitle, { color: '#064E3B' }]}>Instant Help (Available)</Text>
                    <Text style={[styles.miniEventSub, { color: '#166534' }]}>8:00 – 8:45 AM</Text>
                  </View>
                </View>
              </View>

              {/* 9:00 AM */}
              <View style={styles.miniRow}>
                <Text style={styles.miniTime}>9:00 AM</Text>
                <View style={[styles.miniEvent, styles.miniEventBlue]}>
                  <View style={[styles.miniIconBadge, { backgroundColor: '#1D63ED' }]}>
                    <Icon name="book" size={10} color="#FFFFFF" />
                  </View>
                  <View style={styles.flex}>
                    <Text style={[styles.miniEventTitle, { color: '#0F295C' }]}>
                      O-Level Mathematics Class (School)
                    </Text>
                    <Text style={[styles.miniEventSub, { color: '#1E40AF' }]}>9:00 – 10:00 AM</Text>
                  </View>
                </View>
              </View>

              {/* Selected New Live Class Slot */}
              <View style={styles.miniRow}>
                <Text style={styles.miniTime}>{startLabel}</Text>
                <View
                  style={[
                    styles.miniEvent,
                    conflict ? styles.miniEventConflict : styles.miniEventNew,
                  ]}>
                  <View style={styles.flex}>
                    <Text style={[styles.miniNewTime, conflict && { color: '#DC2626' }]}>
                      {rangeLabel}
                    </Text>
                    <Text style={styles.miniNewTitle}>
                      <Text style={styles.miniNewBold}>New Live Class</Text> (Your Time)
                    </Text>
                  </View>
                  <View style={[styles.miniNewCheck, conflict && { backgroundColor: '#DC2626' }]}>
                    <Icon name={conflict ? 'close' : 'check'} size={11} color="#FFFFFF" />
                  </View>
                </View>
              </View>

              {/* 11:00 AM */}
              <View style={styles.miniRow}>
                <Text style={styles.miniTime}>11:00 AM</Text>
                <View style={[styles.miniEvent, styles.miniEventGrey]}>
                  <Icon name="people" size={14} color="#475569" />
                  <View style={styles.flex}>
                    <Text style={[styles.miniEventTitle, { color: '#1E293B' }]}>Teacher Meeting</Text>
                    <Text style={[styles.miniEventSub, { color: '#475569' }]}>11:00 AM – 12:00 PM</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.miniTimeFoot}>12:00 PM</Text>
            </View>

            {/* Suggested Alternative Slots */}
            <View style={styles.altCard}>
              <View style={styles.altHead}>
                <Text style={styles.bulbIcon}>💡</Text>
                <View style={styles.flex}>
                  <Text style={styles.altTitle}>Suggested Alternative Slots</Text>
                  <Text style={styles.altSub}>If you prefer another time, here are some open slots:</Text>
                </View>
              </View>

              <View style={styles.altList}>
                {shownAlts.map((slot) => {
                  const selected = pickedAlt === slot.id;
                  return (
                    <Pressable
                      key={slot.id}
                      style={[styles.altRow, selected && styles.altRowOn]}
                      onPress={() => selectAlternative(slot)}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      accessibilityLabel={`${slot.dateLabel}, ${slot.timeRange}, Available`}>
                      <View style={[styles.radioOuter, selected && styles.radioOuterOn]}>
                        {selected ? <View style={styles.radioInner} /> : null}
                      </View>
                      <View style={styles.flex}>
                        <Text style={styles.altDate}>{slot.dateLabel}</Text>
                        <Text style={styles.altTime}>{slot.timeRange}</Text>
                      </View>
                      <View style={styles.availBadge}>
                        <View style={styles.availDot} />
                        <Text style={styles.availText}>Available</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                style={styles.moreOptionsBtn}
                onPress={() => setMoreSlots((m) => !m)}
                accessibilityRole="button"
                accessibilityLabel="Show More Options">
                <Text style={styles.moreOptionsText}>
                  {moreSlots ? 'Show Fewer Options' : 'Show More Options'}
                </Text>
                <Icon name="chevronDown" size={11} color={ BLUE } />
              </Pressable>
            </View>
          </View>

          {/* Footer Action Buttons */}
          <View style={styles.footerBtns}>
            <Pressable
              style={styles.cancelBtn}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cancel">
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={styles.scheduleBtn}
              onPress={handleSchedule}
              accessibilityRole="button"
              accessibilityLabel="Schedule Class">
              <Icon name="calendar" size={14} color="#FFFFFF" />
              <Text style={styles.scheduleBtnText}>Schedule Class</Text>
              <Icon name="arrowRight" size={13} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );

  if (phone) {
    return (
      <View style={styles.phoneOverlay}>
        <ScrollView contentContainerStyle={styles.phoneOverlayScroll}>{content}</ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.backdrop}>
      {content}
    </View>
  );
}
