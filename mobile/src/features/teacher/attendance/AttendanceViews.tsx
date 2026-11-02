import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import {
  type TeacherMe,
  TeacherPhoneTop,
  TeacherTopBar,
} from '@/features/teacher/frame/TeacherFrame';
import { BLUE, BODY, INK, MUTED, Panel } from '@/features/teacher/frame/TeacherParts';
import { toast } from '@/lib/toast';
import type {
  AttendanceRegister,
  AttendanceRow,
  AttendanceStatusKey,
  EngagementLevelKey,
} from '@/mock/teacher-attendance';
import { ATTENDANCE_REF_WIDTH, s, s as deskS } from './AttendanceViews.styles';
import { phoneS } from './AttendanceViews.phoneStyles';
import { PhoneScroll } from '@/features/teacher/frame/PhoneScroll';

export { ATTENDANCE_REF_WIDTH };

const STATUS_CYCLE: readonly AttendanceStatusKey[] = [
  'Present Engaged',
  'Present Passive',
  'Partial',
  'Late',
  'Absent',
  'Excused',
];

const STATUS_STYLE: Readonly<
  Record<AttendanceStatusKey, { bg: string; fg: string; badgeBg: string; glyph: string }>
> = {
  'Present Engaged': { bg: '#DCFCE7', fg: '#15803D', badgeBg: '#16A34A', glyph: '✓' },
  'Present Passive': { bg: '#DBEAFE', fg: '#1D4ED8', badgeBg: '#2563EB', glyph: '✓' },
  Partial: { bg: '#FEF3C7', fg: '#B45309', badgeBg: '#D97706', glyph: 'P' },
  Late: { bg: '#F3E8FF', fg: '#7E22CE', badgeBg: '#9333EA', glyph: '🕒' },
  Absent: { bg: '#FEE2E2', fg: '#DC2626', badgeBg: '#EF4444', glyph: '✕' },
  Excused: { bg: '#F1F5F9', fg: '#475569', badgeBg: '#64748B', glyph: '●' },
};

/**
 * Image 2 — Post-Class Attendance & Engagement Register (`/(teacher)/attendance/[sessionId]`).
 * Reviews auto-calculated attendance statuses, allows audited manual overrides with reason codes,
 * and previews auto-generated recording chapters.
 */
export function AttendanceDesk({ r, me, phone = false }: { r: AttendanceRegister; me: TeacherMe; phone?: boolean }) {
  // Phones: the same page without the desktop top bar and side menu, stacked in one column.
  const s = phone ? phoneS : deskS;
  const [rows, setRows] = useState<AttendanceRow[]>(r.students);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<
    'Attendance Register' | 'Engagement Analytics' | 'Participation Details' | 'Notes & Follow-up'
  >('Attendance Register');
  const [query, setQuery] = useState('');
  const [activeSide, setActiveSide] = useState('Attendance & Engagement');
  const [page, setPage] = useState(1);

  // Manual Override state (defaults to James T., row #4)
  const [overrideStudentId, setOverrideStudentId] = useState<string>('st-4');
  const [overrideStatus, setOverrideStatus] = useState<AttendanceStatusKey>('Partial');
  const [overrideReasonIdx, setOverrideReasonIdx] = useState(0);
  const [overrideNotes, setOverrideNotes] = useState(
    'Lost internet connection at 10:20 but rejoined at 10:40',
  );

  const overrideStudent =
    rows.find((st) => st.id === overrideStudentId) ?? rows[3] ?? rows[0];

  const selectStudentForOverride = (st: AttendanceRow) => {
    setOverrideStudentId(st.id);
    setOverrideStatus(st.status);
    setOverrideNotes(
      st.overrideNotes ?? 'Lost internet connection at 10:20 but rejoined at 10:40',
    );
  };

  const cycleRowStatus = (st: AttendanceRow) => {
    const idx = STATUS_CYCLE.indexOf(st.status);
    const nextStatus = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    setRows((prev) =>
      prev.map((item) => (item.id === st.id ? { ...item, status: nextStatus } : item)),
    );
    setOverrideStudentId(st.id);
    setOverrideStatus(nextStatus);
  };

  const applyManualOverride = () => {
    const reason = r.reasonCodes[overrideReasonIdx % r.reasonCodes.length];
    setRows((prev) =>
      prev.map((item) =>
        item.id === overrideStudent.id
          ? {
              ...item,
              status: overrideStatus,
              reasonCode: reason,
              overrideNotes,
            }
          : item,
      ),
    );
    toast(
      `Audited override saved for ${overrideStudent.name}: ${overrideStatus} (${reason}).`,
    );
  };

  const filtered = rows.filter(
    (st) => !query.trim() || st.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <View style={s.page}>
      {phone ? null : (
        <TeacherTopBar
          active="Calendar"
          tabsVariant="live"
          me={me}
          placeholder="Search students, classes, or resources..."
        />
      )}

      <View style={s.body}>
        {/* Left Sidebar with Course Header */}
        <View style={s.leftSide}>
          <Pressable
            style={s.backRow}
            onPress={() => router.push('/teach/calendar')}>
            <Icon name="arrowLeft" size={13} color={BLUE} />
            <Text style={s.backText}>Back to Live Classes</Text>
          </Pressable>

          <View style={s.courseCard}>
            <Image source={r.courseThumb} style={s.courseThumb} contentFit="cover" />
            <View style={{ flex: 1, gap: 1 }}>
              <Text style={s.courseTitle}>{r.course}</Text>
              <Text style={s.courseSub}>{r.topic}</Text>
            </View>
          </View>

          <View style={s.sideList}>
            {r.sideNav.map((item) => {
              const on = item.label === activeSide;
              return (
                <Pressable
                  key={item.label}
                  style={[s.sideItem, on && s.sideItemOn]}
                  onPress={() => setActiveSide(item.label)}>
                  <Icon name={item.icon} size={15} color={on ? BLUE : '#475569'} />
                  <Text style={[s.sideText, on && s.sideTextOn]} numberOfLines={1}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Center Main Column */}
        <View style={s.centerCol}>
          {/* Page Header */}
          <View style={s.headerRow}>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={s.pageTitle}>Attendance & Engagement Register</Text>
              <View style={s.metaRow}>
                <Text style={s.metaText}>
                  {r.dateLabel}   •   {r.timeLabel}   •   {r.course}
                </Text>
                <View style={s.completedPill}>
                  <Text style={s.completedPillText}>Session Completed</Text>
                </View>
              </View>
            </View>

            <View style={s.headerBtns}>
              <Pressable
                style={s.outlineBtn}
                onPress={() => toast('Downloaded attendance & engagement CSV report.')}>
                <Icon name="download" size={13} color={INK} />
                <Text style={s.outlineBtnText}>Download Report</Text>
              </Pressable>
              <Pressable
                style={s.saveBtn}
                onPress={() => toast('Saved attendance register changes.')}>
                <Text style={s.saveBtnText}>Save Changes</Text>
              </Pressable>
            </View>
          </View>

          {/* 7 KPI Summary Cards */}
          <View style={s.kpiRow}>
            {r.kpis.map((k) => (
              <View key={k.id} style={s.kpiCard}>
                {k.icon ? (
                  k.id === 'engaged' ? (
                    <Icon name={k.icon} size={22} color={k.color} />
                  ) : (
                    <View style={[s.kpiIconCircle, { backgroundColor: k.color }]}>
                      <Icon name={k.icon} size={13} color="#FFFFFF" />
                    </View>
                  )
                ) : null}
                <View style={{ gap: 1 }}>
                  <Text style={s.kpiVal}>{k.value}</Text>
                  <Text style={s.kpiLabel}>{k.label}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Main Register Table Card */}
          <Panel style={s.tableCard}>
            {/* Tabs + Search / Filter / Bulk Actions */}
            <View style={s.tableTopBar}>
              <PhoneScroll phone={phone}>
                  <View style={s.tabsRow}>
                  {(
                    [
                      'Attendance Register',
                      'Engagement Analytics',
                      'Participation Details',
                      'Notes & Follow-up',
                    ] as const
                  ).map((t) => {
                    const on = activeTab === t;
                    return (
                      <Pressable
                        key={t}
                        style={[s.tabBtn, on && s.tabBtnOn]}
                        onPress={() => setActiveTab(t)}>
                        <Text style={[s.tabBtnText, on && s.tabBtnTextOn]}>{t}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </PhoneScroll>

              <View style={s.tableControls}>
                <View style={s.searchBox}>
                  <Icon name="search" size={12} color={MUTED} />
                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search students..."
                    placeholderTextColor={MUTED}
                    style={s.searchInput}
                  />
                </View>

                <Pressable
                  style={s.filterBtn}
                  onPress={() => toast('Filtered attendance register.')}>
                  <Icon name="list" size={11} color={INK} />
                  <Text style={s.filterBtnText}>Filter</Text>
                </Pressable>

                <Pressable
                  style={s.filterBtn}
                  onPress={() => toast('Marked selected students Present Engaged.')}>
                  <Text style={s.filterBtnText}>Bulk Actions</Text>
                  <Icon name="chevronDown" size={10} color={INK} />
                </Pressable>
              </View>
            </View>

            {/* Table Header */}
            <View style={s.thRow}>
              <View style={s.colCheck}>
                <View style={s.checkbox} />
              </View>
              <Text style={[s.thText, s.colNum]}>#</Text>
              <Text style={[s.thText, s.colStudent]}>Student</Text>
              <Text style={[s.thText, s.colStatus]}>Attendance Status</Text>
              <Text style={[s.thText, s.colEngage]}>Engagement Level</Text>
              <Text style={[s.thText, s.colTime]}>Join Time</Text>
              <Text style={[s.thText, s.colTime]}>Leave Time</Text>
              <Text style={[s.thText, s.colDur]}>Duration</Text>
              <Text style={[s.thText, s.colAct]}>Actions</Text>
            </View>

            {/* Table Rows */}
            {filtered.map((st) => {
              const checked = Boolean(selectedIds[st.id]);
              const isSelectedOverride = st.id === overrideStudent.id;
              const stStyle = STATUS_STYLE[st.status];
              return (
                <Pressable
                  key={st.id}
                  style={[s.trRow, isSelectedOverride && s.trRowHighlighted]}
                  onPress={() => selectStudentForOverride(st)}>
                  <Pressable
                    style={s.colCheck}
                    onPress={() =>
                      setSelectedIds((prev) => ({ ...prev, [st.id]: !prev[st.id] }))
                    }>
                    <View style={[s.checkbox, checked && s.checkboxOn]}>
                      {checked ? <Text style={s.checkboxTick}>✓</Text> : null}
                    </View>
                  </Pressable>

                  <Text style={[s.tdNum, s.colNum]}>{st.num}</Text>

                  <View style={[s.studentCell, s.colStudent]}>
                    <Image source={st.photo} style={s.avatar} contentFit="cover" />
                    <View style={{ gap: 1 }}>
                      <Text style={s.studentName}>{st.name}</Text>
                      <Text style={s.studentCohort}>{st.cohort}</Text>
                    </View>
                  </View>

                  <View style={s.colStatus}>
                    <Pressable
                      style={[s.statusPill, { backgroundColor: stStyle.bg }]}
                      onPress={() => cycleRowStatus(st)}>
                      <View style={[s.statusGlyphCircle, { backgroundColor: stStyle.badgeBg }]}>
                        <Text style={s.statusGlyphText}>{stStyle.glyph}</Text>
                      </View>
                      <Text style={[s.statusPillText, { color: stStyle.fg }]}>{st.status}</Text>
                      <View style={{ flex: 1 }} />
                      <Icon name="chevronDown" size={9} color={stStyle.fg} />
                    </Pressable>
                  </View>

                  <View style={[s.engageCell, s.colEngage]}>
                    {st.engagementPct != null ? (
                      <>
                        <SignalBars level={st.engagementLevel} />
                        <Text style={s.engageLabel}>{st.engagementLevel}</Text>
                        <Text style={s.engagePct}>{st.engagementPct}%</Text>
                      </>
                    ) : (
                      <Text style={s.tdMuted}>—</Text>
                    )}
                  </View>

                  <Text style={[s.tdText, s.colTime]}>{st.joinTime}</Text>
                  <Text style={[s.tdText, s.colTime]}>{st.leaveTime}</Text>
                  <Text style={[s.tdText, s.colDur]}>{st.duration}</Text>

                  <View style={[s.colAct, { alignItems: 'center' }]}>
                    <Text style={s.dotsMenu}>⋮</Text>
                  </View>
                </Pressable>
              );
            })}

            {/* Pagination Footer */}
            <View style={s.paginationRow}>
              <Text style={s.paginationInfo}>Showing 1–10 of 28 students</Text>

              <View style={s.pageBtns}>
                {[1, 2, 3].map((n) => {
                  const on = page === n;
                  return (
                    <Pressable
                      key={n}
                      style={[s.pageBtn, on && s.pageBtnOn]}
                      onPress={() => setPage(n)}>
                      <Text style={[s.pageBtnText, on && s.pageBtnTextOn]}>{n}</Text>
                    </Pressable>
                  );
                })}
                <Pressable
                  style={s.pageBtn}
                  onPress={() => setPage((p) => (p < 3 ? p + 1 : 1))}>
                  <Icon name="arrowRight" size={11} color={INK} />
                </Pressable>
              </View>

              <View style={s.rowsPerPage}>
                <Text style={s.paginationInfo}>Rows per page</Text>
                <View style={s.rowsSelect}>
                  <Text style={s.rowsSelectText}>10</Text>
                  <Icon name="chevronDown" size={9} color={INK} />
                </View>
              </View>
            </View>
          </Panel>
        </View>

        {/* Right Column: Recording & Chapters + Manual Override */}
        <View style={s.rightCol}>
          {/* Top Card: Recording & Chapters */}
          <Panel style={s.rightCard}>
            <Text style={s.rightCardTitle}>Recording & Chapters</Text>

            {/* Video Preview Box */}
            <View style={s.videoBox}>
              <Image source={r.videoThumb} style={StyleSheet.absoluteFill} contentFit="cover" />
              <View style={s.videoBoardOverlay}>
                <Text style={s.videoBoardEq}>x² − 5x + 6 = 0</Text>
                <Text style={s.videoBoardSub}>(x − 2)(x − 3) = 0</Text>
                <Text style={s.videoBoardSub}>x = 2  or  x = 3</Text>
              </View>
              <Pressable
                style={s.playOverlayCircle}
                onPress={() => toast('Playing class recording from 00:00.')}>
                <Icon name="playFill" size={18} color="#FFFFFF" />
              </Pressable>

              <View style={s.videoControlsBar}>
                <View style={s.videoScrubberTrack}>
                  <View style={s.videoScrubberDot} />
                </View>
                <View style={s.videoControlsBottomRow}>
                  <Icon name="playFill" size={10} color="#FFFFFF" />
                  <Text style={s.videoTimeText}>0:00 / 1:00:00</Text>
                  <View style={{ flex: 1 }} />
                  <View style={s.speedChip}>
                    <Text style={s.speedChipText}>1x</Text>
                  </View>
                  <View style={s.speedChip}>
                    <Text style={s.speedChipText}>1x</Text>
                  </View>
                  <Icon name="expand" size={10} color="#FFFFFF" />
                </View>
              </View>
            </View>

            <Text style={s.chaptersSubTitle}>Auto-Generated Chapters</Text>

            <View style={s.chaptersList}>
              {r.chapters.map((ch) => (
                <Pressable
                  key={ch.id}
                  style={s.chapterRow}
                  onPress={() => toast(`Jumped recording to ${ch.timestamp} — ${ch.title.replace('\n', ' ')}`)}>
                  <Text style={s.chapterTime}>{ch.timestamp}</Text>
                  <Image source={ch.thumb} style={s.chapterThumb} contentFit="cover" />
                  <View style={{ flex: 1 }}>
                    <Text style={s.chapterTitle}>{ch.title}</Text>
                    <Text style={s.chapterDur}>{ch.duration}</Text>
                  </View>
                  <Text style={s.dotsMenu}>⋮</Text>
                </Pressable>
              ))}
            </View>
          </Panel>

          {/* Bottom Card: Audited Manual Override */}
          <Panel style={s.rightCard}>
            <View style={s.overrideHeader}>
              <Text style={s.rightCardTitle}>Manual Override</Text>
              <Icon name="close" size={12} color={MUTED} />
            </View>

            <View style={s.overrideStudentRow}>
              <Image source={overrideStudent.photo} style={s.overrideAvatar} contentFit="cover" />
              <View>
                <Text style={s.overrideName}>{overrideStudent.name}</Text>
                <Text style={s.overrideCohort}>{overrideStudent.cohort}</Text>
              </View>
            </View>

            <View style={s.overrideSelectsRow}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={s.overrideFieldLabel}>Attendance Status</Text>
                <Pressable
                  style={s.overrideDropdown}
                  onPress={() => {
                    const idx = STATUS_CYCLE.indexOf(overrideStatus);
                    setOverrideStatus(STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]);
                  }}>
                  <View
                    style={[
                      s.statusGlyphCircle,
                      { backgroundColor: STATUS_STYLE[overrideStatus].badgeBg },
                    ]}>
                    <Text style={s.statusGlyphText}>
                      {STATUS_STYLE[overrideStatus].glyph}
                    </Text>
                  </View>
                  <Text style={s.overrideDropdownText} numberOfLines={1}>
                    {overrideStatus}
                  </Text>
                  <Icon name="chevronDown" size={9} color={BODY} />
                </Pressable>
              </View>

              <View style={{ flex: 1, gap: 4 }}>
                <Text style={s.overrideFieldLabel}>Reason Code</Text>
                <Pressable
                  style={s.overrideDropdown}
                  onPress={() => setOverrideReasonIdx((i) => i + 1)}>
                  <Text style={s.overrideDropdownText} numberOfLines={1}>
                    {r.reasonCodes[overrideReasonIdx % r.reasonCodes.length]}
                  </Text>
                  <Icon name="chevronDown" size={9} color={BODY} />
                </Pressable>
              </View>
            </View>

            <View style={{ gap: 4 }}>
              <Text style={s.overrideFieldLabel}>Notes (optional)</Text>
              <TextInput
                value={overrideNotes}
                onChangeText={setOverrideNotes}
                multiline
                style={s.overrideNotesInput}
              />
            </View>

            <View style={s.overrideBtnsRow}>
              <Pressable
                style={s.overrideCancelBtn}
                onPress={() => selectStudentForOverride(overrideStudent)}>
                <Text style={s.overrideCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={s.overrideUpdateBtn} onPress={applyManualOverride}>
                <Text style={s.overrideUpdateText}>Update</Text>
              </Pressable>
            </View>
          </Panel>
        </View>
      </View>
    </View>
  );
}

export function AttendancePhone({ r, me }: { r: AttendanceRegister; me: TeacherMe }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#EAF1FB' }}>
      <TeacherPhoneTop me={me} />
      <AttendanceDesk r={r} me={me} phone />
    </ScrollView>
  );
}

function SignalBars({ level }: { level: EngagementLevelKey }) {
  const color =
    level === 'High' ? '#16A34A' : level === 'Medium' ? '#F59E0B' : '#EF4444';
  const activeCount = level === 'High' ? 3 : level === 'Medium' ? 2 : 1;
  return (
    <View style={s.signalWrap}>
      {[5, 8, 11].map((h, idx) => (
        <View
          key={h}
          style={[
            s.signalBar,
            {
              height: h,
              backgroundColor: idx < activeCount ? color : '#CBD5E1',
            },
          ]}
        />
      ))}
    </View>
  );
}
