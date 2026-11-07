import { Image } from '@/components/picture';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import {
  type TeacherMe,
  TeacherPhoneTop,
  TeacherTopBar,
} from '@/features/teacher/frame/TeacherFrame';
import { BLUE, BODY, INK, MUTED, Panel } from '@/features/teacher/frame/TeacherParts';
import { toast } from '@/lib/toast';
import type {
  SpeedGrader,
  SpeedGraderCriterion,
  SpeedGraderSubmission,
} from '@/mock/teacher-speed-grader';
import { SPEED_GRADER_REF_WIDTH, s, s as deskS } from './SpeedGraderViews.styles';
import { phoneS } from './SpeedGraderViews.phoneStyles';
import { PhoneScroll } from '@/features/teacher/frame/PhoneScroll';
import { AnswerSheet } from './AnswerSheet';
import { Maple } from '@/constants/maple';

export { SPEED_GRADER_REF_WIDTH };

type DrawTool = 'select' | 'redPen' | 'bluePen' | 'eraser' | 'rect' | 'circle' | 'text';

/**
 * Image 3 — Rapid Speed-Grader (Voice-Note & Screen-Draw Studio) (`/(teacher)/grading/[assignmentId]`).
 * View scanned handwritten student work with AI rubric pre-highlights, draw/circle directly on screen,
 * and hold-to-record a 30-second voice feedback note.
 */
export function SpeedGraderDesk({ g, me, phone = false }: { g: SpeedGrader; me: TeacherMe; phone?: boolean }) {
  // Phones: the same page without the desktop top bar and side menu, stacked in one column.
  const s = phone ? phoneS : deskS;
  const [submissions, setSubmissions] = useState<SpeedGraderSubmission[]>(g.submissions);
  const [selectedSubId, setSelectedSubId] = useState<string>(g.submissions[0].id);
  const [queueFilter, setQueueFilter] = useState<'toGrade' | 'graded' | 'all'>('toGrade');
  const [studentQuery, setStudentQuery] = useState('');

  // Center Paper & Screen-Draw Studio state
  const [activeTool, setActiveTool] = useState<DrawTool>('select');
  const [aiHighlights, setAiHighlights] = useState(true);
  const [annotationsCleared, setAnnotationsCleared] = useState(false);
  const [extraStamp, setExtraStamp] = useState<string | null>(null);
  const [activePage, setActivePage] = useState(1);

  // Right Rubric & Voice Note state
  const [rightTab, setRightTab] = useState<'rubric' | 'comments' | 'insights'>('rubric');
  const [criteria, setCriteria] = useState<SpeedGraderCriterion[]>(g.criteria);
  const [feedbackTab, setFeedbackTab] = useState<'voice' | 'text' | 'quick'>('voice');
  const [recordingVoice, setRecordingVoice] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [selectedQuickComments, setSelectedQuickComments] = useState<Record<string, boolean>>({});
  const [shareAnnotated, setShareAnnotated] = useState(true);

  useEffect(() => {
    if (!recordingVoice) return;
    const id = setInterval(() => {
      setVoiceSeconds((s) => {
        if (s >= 30) {
          setRecordingVoice(false);
          return 30;
        }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [recordingVoice]);

  const currentSub =
    submissions.find((sub) => sub.id === selectedSubId) ?? submissions[0];
  const currentIdx = submissions.findIndex((sub) => sub.id === currentSub.id);

  const totalScore = criteria.reduce((sum, c) => sum + c.score, 0);
  const gradeLabel =
    totalScore >= 85
      ? 'A (Excellent)'
      : totalScore >= 70
        ? 'B (Good)'
        : totalScore >= 55
          ? 'C (Credit)'
          : 'D (Pass)';

  const bumpCriterion = (id: string) => {
    setCriteria((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const nextScore = c.score >= c.max ? Math.max(0, c.max - 6) : c.score + 2;
        return { ...c, score: Math.min(c.max, nextScore) };
      }),
    );
  };

  const handleSaveAndNext = () => {
    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === currentSub.id
          ? { ...sub, score: totalScore, status: 'Graded' }
          : sub,
      ),
    );
    const nextSub = submissions[(currentIdx + 1) % submissions.length];
    setSelectedSubId(nextSub.id);
    toast(`Saved ${currentSub.name} (${totalScore}/100) · Advanced to ${nextSub.name}`);
  };

  const filteredSubmissions = submissions.filter(
    (sub) =>
      !studentQuery.trim() ||
      sub.name.toLowerCase().includes(studentQuery.trim().toLowerCase()),
  );

  return (
    <View style={s.page}>
      {phone ? null : (
        <TeacherTopBar
          active="Assignments"
          tabsVariant="live"
          me={me}
          placeholder="Search students, classes, or resources..."
        />
      )}

      {/* Speed-Grader Sub-Header */}
      <View style={s.subHeader}>
        <Pressable
          style={s.backBtn}
          onPress={() => router.push('/teach/assignments/new')}>
          <Icon name="arrowLeft" size={13} color={BLUE} />
          <Text style={s.backBtnText}>Back to Assignment</Text>
        </Pressable>

        <View style={s.titleBlock}>
          <Text style={s.pageTitle}>Speed-Grader</Text>
          <Text style={s.assignTitle}>{g.title}</Text>
          <Text style={s.assignMeta}>
            {g.dueLabel}   •   {g.totalSubmissions} submissions   •   Auto rubric applied
          </Text>
        </View>

        {phone ? null : <View style={{ flex: 1 }} />}

        {/* Student Counter & Post Grades */}
        <View style={s.headerActions}>
          <View style={s.counterGroup}>
            <Pressable
              style={s.counterArrow}
              onPress={() => {
                const prev =
                  submissions[(currentIdx - 1 + submissions.length) % submissions.length];
                setSelectedSubId(prev.id);
              }}>
              <Icon name="chevronLeft" size={11} color={INK} />
            </Pressable>
            <View style={s.counterBox}>
              <Text style={s.counterText}>
                {g.currentIndex + currentIdx} of {g.totalSubmissions}
              </Text>
            </View>
            <Pressable
              style={s.counterArrow}
              onPress={() => {
                const next = submissions[(currentIdx + 1) % submissions.length];
                setSelectedSubId(next.id);
              }}>
              <Icon name="chevronRight" size={11} color={INK} />
            </Pressable>
          </View>

          <Pressable
            style={s.studentViewBtn}
            onPress={() => toast(`Previewing ${currentSub.name}'s graded feedback view.`)}>
            <Icon name="cap" size={13} color={INK} />
            <Text style={s.studentViewText}>Student View</Text>
          </Pressable>

          <Pressable
            style={s.postGradesBtn}
            onPress={() => toast('Posted grades & voice feedback to students!')}>
            <Icon name="check" size={13} color={Maple.surface} />
            <Text style={s.postGradesText}>Post Grades (1)</Text>
          </Pressable>
        </View>
      </View>

      {/* Main 3-Column Studio */}
      <View style={s.cols}>
        {/* LEFT COLUMN: Submissions Queue */}
        <Panel style={s.leftCol}>
          <View style={s.queueTabs}>
            {(
              [
                { key: 'toGrade', label: `To Grade (${g.toGradeCount})` },
                { key: 'graded', label: `Graded (${g.gradedCount})` },
                { key: 'all', label: `All (${g.totalSubmissions})` },
              ] as const
            ).map((t) => {
              const on = queueFilter === t.key;
              return (
                <Pressable
                  key={t.key}
                  style={[s.queueTab, on && s.queueTabOn]}
                  onPress={() => setQueueFilter(t.key)}>
                  <Text style={[s.queueTabText, on && s.queueTabTextOn]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={s.queueFilterRow}>
            <View style={s.queueSearchBox}>
              <Icon name="search" size={11} color={MUTED} />
              <TextInput
                value={studentQuery}
                onChangeText={setStudentQuery}
                placeholder="Search students..."
                placeholderTextColor={MUTED}
                style={s.queueSearchInput}
              />
            </View>
            <View style={s.statusFilterBtn}>
              <Text style={s.statusFilterText}>All Status</Text>
              <Icon name="chevronDown" size={9} color={INK} />
            </View>
          </View>

          {/* Phones: the queue scrolls sideways so the paper stays near the top. */}
          <PhoneScroll phone={phone}>
              <View style={s.subList}>
              {filteredSubmissions.map((sub) => {
                const active = sub.id === currentSub.id;
                return (
                  <Pressable
                    key={sub.id}
                    style={[s.subCard, active && s.subCardActive]}
                    onPress={() => setSelectedSubId(sub.id)}>
                    <View style={[s.checkbox, active && s.checkboxActiveOutline]} />

                    <Image decorative source={sub.photo} style={s.subAvatar} contentFit="cover" />

                    <View style={{ flex: 1, gap: 2 }}>
                      <View style={s.subTopRow}>
                        <Text style={s.subName}>{sub.name}</Text>
                        {sub.score != null ? (
                          <View style={s.scorePill}>
                            <Text
                              style={[
                                s.scorePillStrong,
                                sub.score >= 90 && {
                                  color: Maple.successText,
                                  textDecorationLine: 'underline',
                                },
                              ]}>
                              {sub.score}
                            </Text>
                            <Text style={s.scorePillMax}> / {sub.maxScore}</Text>
                          </View>
                        ) : active ? (
                          <View style={s.scorePill}>
                            <Text style={s.scorePillMax}>- / {sub.maxScore}</Text>
                          </View>
                        ) : (
                          <StatusChip status={sub.status} />
                        )}
                      </View>

                      <Text style={s.subTime}>{sub.submittedAt}</Text>

                      {sub.score != null || active ? <StatusChip status={sub.status} /> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </PhoneScroll>
        </Panel>

        {/* CENTER COLUMN: Scanned Handwritten Work + Screen-Draw Studio */}
        <Panel style={s.centerCol}>
          {/* PDF Header Bar */}
          <View style={s.pdfTopBar}>
            <View style={s.pdfRedIcon}>
              <Text style={s.pdfRedIconText}>PDF</Text>
            </View>
            <View>
              <Text style={s.pdfName}>{currentSub.filename}</Text>
              <Text style={s.pdfPageMeta}>Page {activePage} of 3</Text>
            </View>

            <View style={{ flex: 1 }} />

            <View style={s.pdfControls}>
              <Pressable
                style={s.pdfCtrlBtn}
                onPress={() => setActivePage((p) => Math.max(1, p - 1))}>
                <Icon name="chevronLeft" size={10} color={INK} />
              </Pressable>
              <Pressable
                style={s.pdfCtrlBtn}
                onPress={() => setActivePage((p) => Math.min(3, p + 1))}>
                <Icon name="chevronRight" size={10} color={INK} />
              </Pressable>
              <View style={s.zoomSelect}>
                <Text style={s.zoomSelectText}>100%</Text>
                <Icon name="chevronDown" size={9} color={INK} />
              </View>
              <Pressable style={s.pdfCtrlBtn}>
                <Icon name="search" size={11} color={INK} />
              </Pressable>
              <Pressable style={s.pdfCtrlBtn}>
                <Icon name="scan" size={11} color={INK} />
              </Pressable>
              <Pressable style={s.pdfCtrlBtn}>
                <Icon name="download" size={11} color={INK} />
              </Pressable>
              <Pressable style={s.pdfCtrlBtn}>
                <Icon name="expand" size={11} color={INK} />
              </Pressable>
            </View>
          </View>

          {/* Annotation Drawing Toolbar */}
          <View style={s.drawToolbar}>
            <Pressable
              style={[s.drawToolBtn, activeTool === 'select' && s.drawToolBtnOn]}
              onPress={() => setActiveTool('select')}>
              <Text style={[s.pointerGlyph, activeTool === 'select' && { color: BLUE }]}>↖</Text>
            </Pressable>

            <Pressable
              style={[s.drawToolBtn, activeTool === 'redPen' && s.drawToolBtnOn]}
              onPress={() => setActiveTool('redPen')}>
              <View style={s.penStack}>
                <Icon name="edit" size={12} color={Maple.error} />
                <View style={[s.penUnderline, { backgroundColor: Maple.error }]} />
              </View>
            </Pressable>

            <Pressable
              style={[s.drawToolBtn, activeTool === 'bluePen' && s.drawToolBtnOn]}
              onPress={() => setActiveTool('bluePen')}>
              <View style={s.penStack}>
                <Icon name="edit" size={12} color={BLUE} />
                <View style={[s.penUnderline, { backgroundColor: BLUE }]} />
              </View>
            </Pressable>

            <Pressable
              style={[s.drawToolBtn, activeTool === 'eraser' && s.drawToolBtnOn]}
              onPress={() => setActiveTool('eraser')}>
              <Icon name="edit" size={12} color={Maple.body} />
            </Pressable>

            <Pressable
              style={[s.drawToolBtn, activeTool === 'rect' && s.drawToolBtnOn]}
              onPress={() => setActiveTool('rect')}>
              <View style={s.shapeSquare} />
            </Pressable>

            <Pressable
              style={[s.drawToolBtn, activeTool === 'circle' && s.drawToolBtnOn]}
              onPress={() => setActiveTool('circle')}>
              <View style={s.shapeCircle} />
            </Pressable>

            <Pressable
              style={[s.drawToolBtn, activeTool === 'text' && s.drawToolBtnOn]}
              onPress={() => setActiveTool('text')}>
              <Text style={s.textToolGlyph}>T</Text>
            </Pressable>

            <View style={s.toolDivider} />

            <Pressable
              style={s.drawToolBtn}
              onPress={() => {
                setAnnotationsCleared(false);
                setExtraStamp(null);
              }}>
              <Icon name="undo" size={12} color={BODY} />
            </Pressable>
            <Pressable
              style={s.drawToolBtn}
              onPress={() => setExtraStamp('✓ +2 Method Marks')}>
              <Icon name="redo" size={12} color={BODY} />
            </Pressable>

            <Pressable
              style={s.clearBtn}
              onPress={() => {
                setAnnotationsCleared((v) => !v);
                setExtraStamp(null);
              }}>
              <Text style={s.clearBtnText}>{annotationsCleared ? 'Restore' : 'Clear'}</Text>
            </Pressable>

            <View style={{ flex: 1 }} />

            {/* AI Highlights Toggle */}
            <View style={s.aiToggleRow}>
              <Text style={s.aiToggleLabel}>AI Highlights</Text>
              <Pressable
                style={[s.switchTrack, aiHighlights && s.switchTrackOn]}
                onPress={() => setAiHighlights((v) => !v)}>
                <View style={[s.switchThumb, aiHighlights && s.switchThumbOn]} />
              </Pressable>
            </View>
          </View>

          {/* Main Paper Canvas + Right Page Thumbnails */}
          <View style={s.paperBodyRow}>
            {/* Scanned Handwritten Student Work Sheet */}
            <AnswerSheet s={s} activeTool={activeTool} aiHighlights={aiHighlights} annotationsCleared={annotationsCleared} extraStamp={extraStamp} onStamp={setExtraStamp} />

            {/* Right Strip: 3 Page Thumbnails */}
            <View style={s.thumbsStrip}>
              {g.pageThumbs.map((img, idx) => {
                const pageNum = idx + 1;
                const on = activePage === pageNum;
                return (
                  <Pressable
                    key={pageNum}
                    style={s.thumbItem}
                    onPress={() => setActivePage(pageNum)}>
                    <View style={[s.thumbFrame, on && s.thumbFrameOn]}>
                      <Image decorative source={img} style={s.thumbImg} contentFit="cover" />
                    </View>
                    <View style={[s.thumbNumPill, on && s.thumbNumPillOn]}>
                      <Text style={[s.thumbNumText, on && s.thumbNumTextOn]}>{pageNum}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Panel>

        {/* RIGHT COLUMN: AI Rubric Analysis & 30-Second Voice Feedback Studio */}
        <Panel style={s.rightCol}>
          {/* Top Tabs */}
          <View style={s.rightTopTabs}>
            {(
              [
                { key: 'rubric', label: 'Rubric & Feedback' },
                { key: 'comments', label: 'Comments (2)' },
                { key: 'insights', label: 'AI Insights' },
              ] as const
            ).map((t) => {
              const on = rightTab === t.key;
              return (
                <Pressable
                  key={t.key}
                  style={[s.rightTopTab, on && s.rightTopTabOn]}
                  onPress={() => setRightTab(t.key)}>
                  <Text style={[s.rightTopTabText, on && s.rightTopTabTextOn]}>
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* AI Rubric Analysis Banner */}
          <View style={s.aiBanner}>
            <Text style={s.aiSparkle}>✦</Text>
            <View style={{ flex: 1, gap: 1 }}>
              <Text style={s.aiBannerTitle}>AI Rubric Analysis</Text>
              <Text style={s.aiBannerSub}>
                Based on the assignment rubric, AI has pre-analysed this submission.
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.aiSuggestedScore}>
                {totalScore} <Text style={s.aiSuggestedMax}>/ 100</Text>
              </Text>
              <Text style={s.aiSuggestedLabel}>Suggested Score</Text>
            </View>
          </View>

          {/* 4 Interactive Criterion Rows */}
          <View style={s.criteriaList}>
            {criteria.map((cr) => {
              const pct = Math.round((cr.score / cr.max) * 100);
              return (
                <Pressable
                  key={cr.id}
                  style={s.criterionRow}
                  onPress={() => bumpCriterion(cr.id)}>
                  <Text style={s.crTitle}>{cr.title}</Text>
                  <Text style={s.crDesc}>{cr.description}</Text>
                  <View style={s.crScoreCol}>
                    <View style={s.crScoreTop}>
                      <Text style={s.crScoreStrong}>
                        {cr.score} <Text style={s.crScoreMax}>/ {cr.max}</Text>
                      </Text>
                      <Icon name="chevronDown" size={9} color={BODY} />
                    </View>
                    <View style={s.crBarTrack}>
                      <View
                        style={[
                          s.crBarFill,
                          { width: `${pct}%`, backgroundColor: cr.color },
                        ]}
                      />
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Final Score & Grade */}
          <View style={s.finalScoreRow}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={s.fieldLabel}>Final Score</Text>
              <View style={s.finalScoreInputWrap}>
                <View style={s.finalScoreBox}>
                  <Text style={s.finalScoreVal}>{totalScore}</Text>
                </View>
                <Text style={s.finalScoreOut}>/ 100</Text>
              </View>
            </View>

            <View style={{ flex: 1, gap: 4 }}>
              <Text style={s.fieldLabel}>Grade</Text>
              <View style={s.gradeDropdown}>
                <View style={s.gradeBadge}>
                  <Text style={s.gradeBadgeText}>{gradeLabel}</Text>
                </View>
                <Icon name="chevronDown" size={10} color={BODY} />
              </View>
            </View>
          </View>

          {/* Voice / Text / Quick Comments Sub-Tabs */}
          <View style={s.rightTopTabs}>
            {(
              [
                { key: 'voice', label: 'Voice Feedback' },
                { key: 'text', label: 'Text Feedback' },
                { key: 'quick', label: 'Quick Comments' },
              ] as const
            ).map((t) => {
              const on = feedbackTab === t.key;
              return (
                <Pressable
                  key={t.key}
                  style={[s.rightTopTab, on && s.rightTopTabOn]}
                  onPress={() => setFeedbackTab(t.key)}>
                  <Text style={[s.rightTopTabText, on && s.rightTopTabTextOn]}>
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Hold-to-Record 30-Second Voice Note Studio */}
          <View style={s.voiceStudioCard}>
            <Pressable
              style={[s.micOuterRing, recordingVoice && s.micOuterRingActive]}
              onPressIn={() => {
                setVoiceSeconds(0);
                setRecordingVoice(true);
              }}
              onPressOut={() => {
                if (recordingVoice) {
                  setRecordingVoice(false);
                  toast(`Attached ${Math.max(1, voiceSeconds)}s voice feedback note!`);
                }
              }}
              onPress={() => {
                setRecordingVoice((r) => !r);
              }}
              accessibilityRole="button"
              accessibilityLabel="Hold to record 30 second voice feedback">
              <View style={s.micCoralCircle}>
                <Icon name="mic" size={18} color={Maple.surface} />
              </View>
            </Pressable>

            <View style={s.waveformCol}>
              <View style={s.waveformBars}>
                {g.waveformHeights.map((h, i) => (
                  <View
                    key={i}
                    style={[
                      s.waveBar,
                      {
                        height: Math.max(4, Math.round(h * 26)),
                        backgroundColor:
                          recordingVoice && i % 2 === 0 ? Maple.error : Maple.blue,
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={s.holdToRecordLabel}>
                {recordingVoice
                  ? 'Recording voice note... Click to stop'
                  : 'Hold to record (max 30 seconds)'}
              </Text>
            </View>

            <Text style={s.voiceTimerText}>
              0:{String(voiceSeconds).padStart(2, '0')} / 0:30
            </Text>
          </View>

          {/* Quick Comments */}
          <View style={{ gap: 6 }}>
            <Text style={s.fieldLabel}>Quick Comments</Text>
            <View style={s.quickChipsWrap}>
              {g.quickComments.map((comment) => {
                const on = Boolean(selectedQuickComments[comment]);
                return (
                  <Pressable
                    key={comment}
                    style={[s.quickChip, on && s.quickChipOn]}
                    onPress={() =>
                      setSelectedQuickComments((prev) => ({
                        ...prev,
                        [comment]: !prev[comment],
                      }))
                    }>
                    <Text style={[s.quickChipText, on && s.quickChipTextOn]}>
                      {comment}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Share Annotated Copy Switch */}
          <View style={s.shareRow}>
            <Pressable
              style={[s.switchTrack, shareAnnotated && s.switchTrackOn]}
              onPress={() => setShareAnnotated((v) => !v)}>
              <View style={[s.switchThumb, shareAnnotated && s.switchThumbOn]} />
            </Pressable>
            <Text style={s.shareLabel}>Share annotated copy with student</Text>
            <Icon name="info" size={12} color={MUTED} />
          </View>

          {/* Bottom Save Draft / Save & Next */}
          <View style={s.bottomBtnsRow}>
            <Pressable
              style={s.saveDraftBtn}
              onPress={() => toast(`Saved grading draft for ${currentSub.name}.`)}>
              <Text style={s.saveDraftText}>Save Draft</Text>
            </Pressable>
            <Pressable style={s.saveNextBtn} onPress={handleSaveAndNext}>
              <Text style={s.saveNextText}>Save & Next</Text>
              <Icon name="arrowRight" size={13} color={Maple.surface} />
            </Pressable>
          </View>
        </Panel>
      </View>
    </View>
  );
}

export function SpeedGraderPhone({ g, me }: { g: SpeedGrader; me: TeacherMe }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: Maple.blueSelected }}>
      <TeacherPhoneTop me={me} />
      <SpeedGraderDesk g={g} me={me} phone />
    </ScrollView>
  );
}

function StatusChip({ status }: { status: SpeedGraderSubmission['status'] }) {
  if (status === 'AI Scored') {
    return (
      <View style={[s.statusTag, { backgroundColor: Maple.successSoft }]}>
        <Text style={[s.statusTagText, { color: Maple.successText }]}>• AI Scored</Text>
      </View>
    );
  }
  if (status === 'Graded') {
    return (
      <View style={[s.statusTag, { backgroundColor: Maple.successSoft }]}>
        <Text style={[s.statusTagText, { color: Maple.successText }]}>✓ Graded</Text>
      </View>
    );
  }
  return (
    <View style={[s.statusTag, { backgroundColor: Maple.warningSoft }]}>
      <Text style={[s.statusTagText, { color: Maple.warningText }]}>• Needs Review</Text>
    </View>
  );
}
