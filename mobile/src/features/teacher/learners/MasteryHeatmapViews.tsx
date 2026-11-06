import { Image } from '@/components/picture';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { PremiumTiles } from '@/features/portal/Premium';
import {
  type TeacherMe,
  TeacherPhoneTop,
  TeacherTopBar,
} from '@/features/teacher/frame/TeacherFrame';
import { BLUE, BODY, INK, MUTED, Panel } from '@/features/teacher/frame/TeacherParts';
import { toast } from '@/lib/toast';
import type {
  HeatCellTier,
  MasteryHeatmap,
  MasteryStudentRow,
} from '@/mock/teacher-learners';
import { MASTERY_REF_WIDTH, s as deskS } from './MasteryHeatmapViews.styles';
import { phoneS } from './MasteryHeatmapViews.phoneStyles';
import { PhoneScroll } from '@/features/teacher/frame/PhoneScroll';
import { Maple } from '@/constants/maple';

export { MASTERY_REF_WIDTH };

const TIER_COLORS: Readonly<Record<HeatCellTier, { bg: string; fg: string }>> = {
  darkGreen: { bg: Maple.success, fg: '#052E16' },
  lightGreen: { bg: '#9AE6B4', fg: '#064E3B' },
  yellow: { bg: '#FDE68A', fg: '#78350F' },
  orange: { bg: '#FDBA74', fg: '#7C2D12' },
  red: { bg: '#FCA5A5', fg: Maple.errorText },
};

function overallTone(score: number): { fg: string; bar: string } {
  if (score >= 80) return { fg: Maple.navy, bar: Maple.successText };
  if (score >= 68) return { fg: Maple.warningText, bar: Maple.warning };
  if (score >= 60) return { fg: '#C2410C', bar: '#EA580C' };
  return { fg: Maple.error, bar: Maple.error };
}

/**
 * Class Mastery Heatmap & 1-Click Intervention Centre (`/(teacher)/learners`).
 * Matrix of students vs. curriculum competencies; flags learning gaps and lets the teacher send
 * an auto-assembled Intervention Pack (remedial video + 5 questions) or parent voice update in 1 tap.
 */
export function MasteryHeatmapDesk({ m, me, phone = false }: { m: MasteryHeatmap; me: TeacherMe; phone?: boolean }) {
  // Phones: the same page without the desktop top bar and side menu, stacked in one column.
  const s = phone ? phoneS : deskS;
  const [selectedStudentId, setSelectedStudentId] = useState<string>('m-2'); // Daniel O.
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});
  const [activeSide, setActiveSide] = useState('Mastery Heatmap');
  const [activeClassId, setActiveClassId] = useState('mc-1');
  const [matrixTab, setMatrixTab] = useState<
    'Mastery Heatmap' | 'Competency Analysis' | 'Intervention Centre' | 'Parent Communication'
  >('Mastery Heatmap');
  const [studentQuery, setStudentQuery] = useState('');
  const [rightTab, setRightTab] = useState<
    'Overview' | 'Learning Gaps' | 'Interventions' | 'History'
  >('Overview');
  const [packChecks, setPackChecks] = useState({
    video: true,
    questions: true,
    autoAssign: true,
  });

  const selectedStudent: MasteryStudentRow =
    m.students.find((s) => s.id === selectedStudentId) ?? m.students[1];
  const firstName = selectedStudent.name.split(' ')[0];

  const filteredStudents = m.students.filter(
    (st) =>
      !studentQuery.trim() ||
      st.name.toLowerCase().includes(studentQuery.trim().toLowerCase()),
  );

  return (
    <View style={s.page}>
      {phone ? null : (
        <TeacherTopBar
          active="Students"
          tabsVariant="live"
          me={me}
          placeholder="Search students, classes, or resources..."
        />
      )}

      <View style={s.body}>
        {/* Left Sidebar: Class Insights + My Classes */}
        <View style={s.leftSide}>
          <Text style={s.sideHeading}>Class Insights</Text>

          <View style={s.sideList}>
            {m.sideNav.map((item) => {
              const on = activeSide === item.label;
              return (
                <Pressable
                  key={item.label}
                  style={[s.sideItem, on && s.sideItemOn]}
                  onPress={() => setActiveSide(item.label)}>
                  <Icon name={item.icon} size={15} color={on ? BLUE : Maple.body} />
                  <Text style={[s.sideText, on && s.sideTextOn]} numberOfLines={1}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={s.sideDivider} />

          <View style={s.myClassesHeader}>
            <Text style={s.myClassesTitle}>My Classes</Text>
            <Icon name="chevronDown" size={10} color={BODY} />
          </View>

          <View style={s.myClassesList}>
            {m.myClasses.map((cl) => {
              const on = activeClassId === cl.id;
              return (
                <Pressable
                  key={cl.id}
                  style={[s.myClassRow, on && s.myClassRowOn]}
                  onPress={() => setActiveClassId(cl.id)}>
                  <View style={[s.classDot, { backgroundColor: cl.color }]} />
                  <Text style={[s.myClassText, on && s.myClassTextOn]} numberOfLines={1}>
                    {cl.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={s.addClassBtn}
            onPress={() => toast('Opened New Class cohort wizard.')}>
            <Icon name="plus" size={12} color={BLUE} />
            <Text style={s.addClassText}>Add Class</Text>
          </Pressable>
        </View>

        {/* Center Main Column */}
        <View style={s.centerCol}>
          {/* Header Row */}
          <View style={s.headerRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={s.pageTitle}>Class Mastery Heatmap</Text>
              <Text style={s.pageSub}>
                {m.course}   •   {m.term}   •   {m.studentsCount} students
              </Text>
            </View>

            <View style={s.headerFilters}>
              <View style={s.filterCol}>
                <Text style={s.filterLabel}>Curriculum View</Text>
                <View style={s.filterSelect}>
                  <Text style={s.filterSelectText}>By Competencies</Text>
                  <Icon name="chevronDown" size={10} color={INK} />
                </View>
              </View>

              <View style={s.filterCol}>
                <Text style={s.filterLabel}>Time Period</Text>
                <View style={s.filterSelect}>
                  <Text style={s.filterSelectText}>This Term</Text>
                  <Icon name="chevronDown" size={10} color={INK} />
                </View>
              </View>

              <Pressable
                style={s.exportBtn}
                onPress={() => toast('Exported Class Mastery Heatmap report (CSV & PDF).')}>
                <Icon name="download" size={13} color={INK} />
                <Text style={s.exportBtnText}>Export</Text>
              </Pressable>
            </View>
          </View>

          {/* 5 KPI Summary Cards */}
          {phone ? (
            <PremiumTiles title="Class Mastery" subtitle="How your learners are doing on this unit." minHeight={132} items={m.kpis.map((k) => ({ label: k.label, value: k.value, icon: k.icon ?? 'people', tone: 'blue' as const, color: k.color }))} />
          ) : (
          <View style={s.kpiRow}>
            {m.kpis.map((k) => (
              <View key={k.id} style={s.kpiCard}>
                {k.id === 'total' ? (
                  <Icon name={k.icon} size={22} color={k.color} />
                ) : (
                  <View style={[s.kpiIconCircle, { backgroundColor: k.color }]}>
                    <Icon name={k.icon} size={14} color={Maple.surface} />
                  </View>
                )}
                <View style={{ gap: 1 }}>
                  <Text style={s.kpiVal}>{k.value}</Text>
                  <Text style={s.kpiLabel}>{k.label}</Text>
                </View>
              </View>
            ))}
          </View>
          )}

          {/* Matrix Card */}
          <Panel style={s.matrixCard}>
            {/* Tabs + Search / Filter */}
            <View style={s.matrixTopBar}>
              <PhoneScroll phone={phone}>
                  <View style={s.matrixTabs}>
                  {(
                    [
                      'Mastery Heatmap',
                      'Competency Analysis',
                      'Intervention Centre',
                      'Parent Communication',
                    ] as const
                  ).map((t) => {
                    const on = matrixTab === t;
                    return (
                      <Pressable
                        key={t}
                        style={[s.matrixTab, on && s.matrixTabOn]}
                        onPress={() => setMatrixTab(t)}>
                        <Text style={[s.matrixTabText, on && s.matrixTabTextOn]}>{t}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </PhoneScroll>

              <View style={s.matrixSearchCluster}>
                <View style={s.searchBox}>
                  <Icon name="search" size={11} color={MUTED} />
                  <TextInput
                    value={studentQuery}
                    onChangeText={setStudentQuery}
                    placeholder="Search students..."
                    placeholderTextColor={MUTED}
                    style={s.searchInput}
                  />
                </View>
                <Pressable
                  style={s.filterPillBtn}
                  onPress={() => toast('Filtered matrix by competency band.')}>
                  <Icon name="list" size={11} color={INK} />
                  <Text style={s.filterPillText}>Filter</Text>
                </Pressable>
              </View>
            </View>

            {/* Phones: the grid keeps its columns and scrolls sideways. */}
            <PhoneScroll phone={phone}>
              <View style={phone ? s.matrixGridPhone : s.matrixGrid}>
                {/* Heatmap Column Headers */}
                <View style={s.thRow}>
                  <View style={s.colCheck}>
                    <View style={s.checkbox} />
                  </View>
                  <Text style={[s.thStudent, s.colStudent]}>Students ({m.studentsCount})</Text>
                  {m.competencies.map((comp) => (
                    <Text key={comp.key} style={[s.thComp, s.colComp]}>
                      {comp.label}
                    </Text>
                  ))}
                  <Text style={[s.thOverall, s.colOverall]}>Overall</Text>
                </View>

                {/* Heatmap Student Rows */}
                {filteredStudents.map((st) => {
                  const isSelected = st.id === selectedStudent.id;
                  const checked = Boolean(checkedIds[st.id]);
                  const ov = overallTone(st.overall);
                  return (
                    <Pressable
                      key={st.id}
                      style={[s.trRow, isSelected && s.trRowSelected]}
                      onPress={() => setSelectedStudentId(st.id)}>
                      <Pressable
                        style={s.colCheck}
                        onPress={() =>
                          setCheckedIds((prev) => ({ ...prev, [st.id]: !prev[st.id] }))
                        }>
                        <View style={[s.checkbox, checked && s.checkboxOn]}>
                          {checked ? <Text style={s.checkboxTick}>✓</Text> : null}
                        </View>
                      </Pressable>

                      <View style={[s.studentCell, s.colStudent]}>
                        <Image source={st.photo} style={s.avatar} contentFit="cover" />
                        <Text style={[s.studentName, isSelected && { color: BLUE }]} numberOfLines={1}>
                          {st.name}
                        </Text>
                      </View>

                      {st.scores.map((sc, idx) => {
                        const tier = st.tiers[idx] ?? 'lightGreen';
                        const tone = TIER_COLORS[tier];
                        return (
                          <View key={idx} style={s.colComp}>
                            <View style={[s.heatCell, { backgroundColor: tone.bg }]}>
                              <Text style={[s.heatCellText, { color: tone.fg }]}>{sc}</Text>
                            </View>
                          </View>
                        );
                      })}

                      <View style={[s.overallCell, s.colOverall]}>
                        <Text style={[s.overallPct, { color: ov.fg }]}>{st.overall}%</Text>
                        <View style={s.overallTrack}>
                          <View
                            style={[
                              s.overallFill,
                              { width: `${st.overall}%`, backgroundColor: ov.bar },
                            ]}
                          />
                        </View>
                      </View>
                    </Pressable>
                  );
                })}

                {/* Class Average Footer Row */}
                <View style={s.avgRow}>
                  <View style={s.colCheck} />
                  <Text style={[s.avgLabel, s.colStudent]}>Class Average</Text>
                  {m.competencies.map((comp) => {
                    const bg =
                      comp.avgTone === 'red'
                        ? Maple.errorSoft
                        : comp.avgTone === 'yellow'
                          ? '#FEF9C3'
                          : Maple.successSoft;
                    const fg = comp.avgTone === 'red' ? Maple.error : Maple.navy;
                    return (
                      <View key={comp.key} style={s.colComp}>
                        <View style={[s.avgCell, { backgroundColor: bg }]}>
                          <Text style={[s.avgCellText, { color: fg }]}>{comp.avg}%</Text>
                        </View>
                      </View>
                    );
                  })}
                  <View style={[s.overallCell, s.colOverall]}>
                    <Text style={[s.overallPct, { color: Maple.warningText }]}>{m.overallAvg}%</Text>
                    <View style={s.overallTrack}>
                      <View
                        style={[
                          s.overallFill,
                          { width: `${m.overallAvg}%`, backgroundColor: Maple.warning },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </PhoneScroll>

            {/* Legend Row */}
            <View style={s.legendRow}>
              {[
                { color: Maple.success, label: '≥ 85% Mastered' },
                { color: '#86EFAC', label: '70–84% On Track' },
                { color: Maple.warning, label: '55–69% Needs Support' },
                { color: Maple.error, label: '< 55% At Risk' },
                { color: Maple.muted, label: 'Not Enough Data' },
              ].map((item) => (
                <View key={item.label} style={s.legendItem}>
                  <View style={[s.legendSquare, { backgroundColor: item.color }]} />
                  <Text style={s.legendText}>{item.label}</Text>
                </View>
              ))}
            </View>
          </Panel>

          {/* Bottom AI Insights & Recommendations */}
          <Panel style={s.insightsPanel}>
            <View style={s.insightsHeader}>
              <Text style={s.aiSparkle}>✦</Text>
              <Text style={s.insightsTitle}>AI Insights & Recommendations</Text>
            </View>

            <View style={s.insightsGrid}>
              {/* 1. Red At-Risk Card */}
              <View style={[s.insightCard, s.insightCardRed]}>
                <View style={s.insightTopRow}>
                  <View style={[s.insightBadge, { backgroundColor: Maple.error }]}>
                    <Text style={s.insightBadgeText}>!</Text>
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[s.insightHeading, { color: Maple.error }]}>
                      5 students at risk
                    </Text>
                    <Text style={s.insightBody}>
                      These students have &lt; 55% in one or more competencies. Consider immediate intervention.
                    </Text>
                  </View>
                </View>
                <Pressable
                  style={[s.insightBtn, { borderColor: '#FCA5A5' }]}
                  onPress={() => {
                    setSelectedStudentId('m-8');
                    toast('Focused on At-Risk students (David M., James T.).');
                  }}>
                  <Text style={[s.insightBtnText, { color: Maple.error }]}>
                    View At-Risk Students
                  </Text>
                </Pressable>
              </View>

              {/* 2. Amber Common Gaps Card */}
              <View style={[s.insightCard, s.insightCardAmber]}>
                <View style={s.insightTopRow}>
                  <View style={[s.insightBadge, { backgroundColor: Maple.warning }]}>
                    <Text style={s.insightBadgeText}>!</Text>
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[s.insightHeading, { color: '#92400E' }]}>
                      Common class gaps
                    </Text>
                    <Text style={s.insightBody}>
                      Trigonometry (68%) and Equations & Inequalities (73%) are the lowest performing areas.
                    </Text>
                  </View>
                </View>
                <Pressable
                  style={[s.insightBtn, { borderColor: Maple.blueLine }]}
                  onPress={() =>
                    toast('Generated Trigonometry & Equations Class Intervention Plan!')
                  }>
                  <Text style={[s.insightBtnText, { color: BLUE }]}>
                    Generate Class Intervention Plan
                  </Text>
                </Pressable>
              </View>

              {/* 3. Green Celebrate Progress Card */}
              <View style={[s.insightCard, s.insightCardGreen]}>
                <View style={s.insightTopRow}>
                  <View style={[s.insightBadge, { backgroundColor: Maple.successText }]}>
                    <Text style={s.insightBadgeText}>★</Text>
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[s.insightHeading, { color: Maple.successText }]}>
                      Celebrate progress
                    </Text>
                    <Text style={s.insightBody}>
                      18 students are on track or above. Consider enrichment activities to keep them challenged.
                    </Text>
                  </View>
                </View>
                <Pressable
                  style={[s.insightBtn, { borderColor: Maple.blueLine }]}
                  onPress={() => {
                    setSelectedStudentId('m-7');
                    toast('Viewing High Performers (Sarah L. 92%, Grace A. 88%, Amina K. 87%).');
                  }}>
                  <Text style={[s.insightBtnText, { color: BLUE }]}>
                    View High Performers
                  </Text>
                </Pressable>
              </View>
            </View>
          </Panel>
        </View>

        {/* Right Column: Selected Student Profile & 1-Click Intervention Centre */}
        <Panel style={s.rightCol}>
          {/* Student Header */}
          <View style={s.studentDrawerHeader}>
            <Image
              source={selectedStudent.drawerPhoto ?? selectedStudent.photo}
              style={s.drawerAvatar}
              contentFit="cover"
            />
            <View style={{ flex: 1, gap: 2 }}>
              <View style={s.drawerNameRow}>
                <Text style={s.drawerName}>{selectedStudent.name}</Text>
                <Icon name="close" size={12} color={MUTED} />
              </View>
              <View style={s.drawerMetaRow}>
                <Text style={s.drawerMeta}>
                  {m.term}   •   {selectedStudent.overall}% Overall
                </Text>
                <View
                  style={[
                    s.drawerStatusPill,
                    selectedStudent.status === 'On Track'
                      ? { backgroundColor: Maple.successSoft }
                      : selectedStudent.status === 'At Risk'
                        ? { backgroundColor: Maple.errorSoft }
                        : { backgroundColor: Maple.warningSoft },
                  ]}>
                  <Text
                    style={[
                      s.drawerStatusText,
                      selectedStudent.status === 'On Track'
                        ? { color: Maple.successText }
                        : selectedStudent.status === 'At Risk'
                          ? { color: Maple.error }
                          : { color: Maple.warningText },
                    ]}>
                    {selectedStudent.status}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 4 Sub-Tabs */}
          <View style={s.drawerTabs}>
            {(['Overview', 'Learning Gaps', 'Interventions', 'History'] as const).map(
              (t) => {
                const on = rightTab === t;
                return (
                  <Pressable
                    key={t}
                    style={[s.drawerTab, on && s.drawerTabOn]}
                    onPress={() => setRightTab(t)}>
                    <Text style={[s.drawerTabText, on && s.drawerTabTextOn]}>{t}</Text>
                  </Pressable>
                );
              },
            )}
          </View>

          {/* Competency Breakdown */}
          <View style={s.breakdownSection}>
            <Text style={s.sectionTitle}>Competency Breakdown</Text>
            <View style={s.breakdownList}>
              {m.competencies.map((comp, idx) => {
                const sc = selectedStudent.scores[idx] ?? 75;
                const barColor =
                  sc >= 80 ? Maple.successText : sc >= 65 ? Maple.warning : Maple.error;
                return (
                  <View key={comp.key} style={s.breakdownRow}>
                    <Text style={s.breakdownLabel} numberOfLines={1}>
                      {comp.singleLine}
                    </Text>
                    <Text style={s.breakdownPct}>{sc}%</Text>
                    <View style={s.breakdownTrack}>
                      <View
                        style={[
                          s.breakdownFill,
                          { width: `${sc}%`, backgroundColor: barColor },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* 1-Click Intervention Actions */}
          <View style={s.interventionsSection}>
            <Text style={s.sectionTitle}>Intervention Actions</Text>

            {/* 1. Send Intervention Pack */}
            <View style={s.packCard}>
              <View style={s.packHeader}>
                <View style={[s.actionIconBox, { backgroundColor: Maple.blueSelected }]}>
                  <Icon name="book" size={14} color={BLUE} />
                </View>
                <View style={{ flex: 1, gap: 1 }}>
                  <View style={s.actionTitleRow}>
                    <Text style={s.actionTitle}>Send Intervention Pack</Text>
                    <View style={s.oneClickPill}>
                      <Text style={s.oneClickText}>1-Click</Text>
                    </View>
                  </View>
                  <Text style={s.actionSub}>
                    Auto-assembles a remedial video + 5 targeted questions based on {firstName}&apos;s learning gaps.
                  </Text>
                </View>
              </View>

              <View style={s.packChecklist}>
                {(
                  [
                    { key: 'video', label: 'Remedial video (10–15 min)' },
                    { key: 'questions', label: '5 practice questions' },
                    {
                      key: 'autoAssign',
                      label: `Automatically assigns to ${firstName}`,
                    },
                  ] as const
                ).map((item) => {
                  const on = packChecks[item.key];
                  return (
                    <Pressable
                      key={item.key}
                      style={s.packCheckRow}
                      onPress={() =>
                        setPackChecks((prev) => ({
                          ...prev,
                          [item.key]: !prev[item.key],
                        }))
                      }>
                      <View style={[s.checkbox, on && s.checkboxOn]}>
                        {on ? <Text style={s.checkboxTick}>✓</Text> : null}
                      </View>
                      <Text style={s.packCheckLabel}>{item.label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                style={s.sendPackBtn}
                onPress={() =>
                  toast(
                    `Sent auto-assembled Intervention Pack (Remedial Video + 5 Questions) to ${selectedStudent.name}!`,
                  )
                }>
                <Icon name="send" size={12} color={Maple.surface} />
                <Text style={s.sendPackBtnText}>Send Intervention Pack</Text>
              </Pressable>
            </View>

            {/* 2. Send Parent Voice Update */}
            <View style={s.actionCard}>
              <View style={s.packHeader}>
                <View style={[s.actionIconBox, { backgroundColor: Maple.successSoft }]}>
                  <Icon name="phone" size={14} color={Maple.successText} />
                </View>
                <View style={{ flex: 1, gap: 1 }}>
                  <View style={s.actionTitleRow}>
                    <Text style={s.actionTitle}>Send Parent Voice Update</Text>
                    <View style={s.oneClickPill}>
                      <Text style={s.oneClickText}>1-Click</Text>
                    </View>
                  </View>
                  <Text style={s.actionSub}>
                    Share a short voice update with {firstName}&apos;s parent/guardian about current progress and next steps.
                  </Text>
                </View>
              </View>
              <Pressable
                style={s.outlineActionBtn}
                onPress={() =>
                  toast(
                    `Recorded & sent 1-Click Parent Voice Update to ${selectedStudent.name}'s guardian!`,
                  )
                }>
                <Text style={s.outlineActionBtnText}>Record & Send Voice Update</Text>
              </Pressable>
            </View>

            {/* 3. Create Small Group */}
            <View style={s.actionCard}>
              <View style={s.packHeader}>
                <View style={[s.actionIconBox, { backgroundColor: Maple.blueSelected }]}>
                  <Icon name="people" size={14} color={Maple.blue} />
                </View>
                <View style={{ flex: 1, gap: 1 }}>
                  <Text style={s.actionTitle}>Create Small Group</Text>
                  <Text style={s.actionSub}>
                    Add {firstName} to a targeted intervention group with similar gaps.
                  </Text>
                </View>
              </View>
              <Pressable
                style={s.outlineActionBtn}
                onPress={() =>
                  toast(
                    `Added ${selectedStudent.name} to Trigonometry & Algebra Intervention Group!`,
                  )
                }>
                <Text style={s.outlineActionBtnText}>Add to Intervention Group</Text>
              </Pressable>
            </View>
          </View>
        </Panel>
      </View>
    </View>
  );
}

export function MasteryHeatmapPhone({ m, me }: { m: MasteryHeatmap; me: TeacherMe }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: Maple.blueSelected }}>
      <TeacherPhoneTop me={me} />
      <MasteryHeatmapDesk m={m} me={me} phone />
    </ScrollView>
  );
}
