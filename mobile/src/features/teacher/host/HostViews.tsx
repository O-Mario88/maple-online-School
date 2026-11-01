import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import type { IconName } from '@/lib/icons';
import { toast } from '@/lib/toast';
import type { HostMaterial, HostToolKey, TeacherHost } from '@/mock/teacher-host';

import { HostRightPanels, usePulseQuizTimer } from './HostRightPanels';
import { WhiteboardStage } from './WhiteboardStage';
import { d, p } from './HostViews.styles';

export { HOST_REF_WIDTH } from './HostViews.styles';

function formatHMS(totalSeconds: number) {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return [hrs, mins, secs].map((n) => String(n).padStart(2, '0')).join(':');
}

/**
 * Desktop Maple Live Teacher Host Console (`/(teacher)/live-host/[sessionId]`),
 * matching the presenter studio reference design.
 */
export function HostDesk({ h }: { h: TeacherHost }) {
  const router = useRouter();
  const [activeTool, setActiveTool] = useState<HostToolKey>('Whiteboard');
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(h.elapsedSeconds);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [recording, setRecording] = useState(true);
  const [locksOpen, setLocksOpen] = useState(false);
  const [lockStudentMics, setLockStudentMics] = useState(false);
  const [lockStudentCams, setLockStudentCams] = useState(false);
  const [allowedDrawStudent, setAllowedDrawStudent] = useState<string | null>(null);
  const [materials, setMaterials] = useState<HostMaterial[]>(h.materials);
  const [mutedIds, setMutedIds] = useState<Record<string, boolean>>({ s7: true });
  const [endAsk, setEndAsk] = useState(false);

  const saveBoardToResources = () => {
    const id = `snap-${Date.now()}`;
    setMaterials((prev) => [
      ...prev,
      {
        id,
        title: 'Board Snapshot (Quadratics).png',
        kind: 'pro',
        color: '#16A34A',
      },
    ]);
    toast('Board saved to Lesson Notes and Class Materials.');
  };

  const quiz = usePulseQuizTimer(h.pulseQuiz.durationSeconds);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [paused]);

  const toggleStudentMute = (id: string) => {
    setMutedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <View style={d.root}>
      {/* Top Dark Navy Presenter Bar */}
      <View style={d.topBar}>
        {/* Brand Cluster */}
        <Pressable style={d.brandCluster} onPress={() => router.push('/teach/calendar' as never)}>
          <View style={d.leafWrap}>
            <Text style={d.leafIcon}>🍁</Text>
          </View>
          <View>
            <Text style={d.brandTitle}>Maple Live</Text>
            <Text style={d.brandSub}>Teacher Host Console</Text>
          </View>
        </Pressable>

        <View style={d.topSep} />

        {/* Course & Topic */}
        <View style={d.courseCluster}>
          <Text style={d.courseTitle}>{h.course}</Text>
          <Text style={d.courseTopic}>{h.topic}</Text>
        </View>

        <View style={{ flex: 1 }} />

        {/* Live Timer Pill */}
        <View style={d.liveBadgeGroup}>
          <View style={[d.livePillRed, paused && { backgroundColor: '#F59E0B' }]}>
            <View style={d.liveDotWhite} />
            <Text style={d.livePillText}>{paused ? 'PAUSED' : 'LIVE'}</Text>
          </View>
          <View style={d.liveTimeBox}>
            <Text style={d.liveTimeText}>{formatHMS(elapsed)}</Text>
          </View>
        </View>

        {/* Student & Co-teacher Counters */}
        <View style={d.metaStat}>
          <View style={d.greenStatDot}>
            <Icon name="people" size={9} color="#FFFFFF" />
          </View>
          <Text style={d.metaStatText}>{h.studentsCount} students</Text>
        </View>

        <View style={d.metaStat}>
          <Icon name="people" size={13} color="#CBD5E1" />
          <Text style={d.metaStatText}>{h.coTeachersCount} co-teachers</Text>
        </View>

        {/* Action Buttons */}
        <View style={d.topActions}>
          <Pressable
            style={d.topDarkBtn}
            onPress={() => toast('Join link copied. Share it with learners or a co-teacher.')}
            accessibilityRole="button"
            accessibilityLabel="Invite: copy the join link">
            <Icon name="plus" size={11} color="#FFFFFF" />
            <Text style={d.topDarkBtnText}>Invite</Text>
          </Pressable>

          <Pressable style={d.topDarkBtn} onPress={() => setPaused((p) => !p)}>
            <Icon name={paused ? 'playFill' : 'pause'} size={11} color="#FFFFFF" />
            <Text style={d.topDarkBtnText}>{paused ? 'Resume Class' : 'Pause Class'}</Text>
          </Pressable>

          <Pressable
            style={d.endClassBtn}
            onPress={() => setEndAsk(true)}
            accessibilityRole="button"
            accessibilityLabel="End class">
            <View style={d.endStopSquare} />
            <Text style={d.endClassText}>End Class</Text>
          </Pressable>

          <Pressable
            style={[d.topMoreBtn, locksOpen && d.topMoreBtnOn]}
            onPress={() => setLocksOpen((o) => !o)}>
            <Text style={d.topMoreDots}>⋮</Text>
          </Pressable>
        </View>
      </View>

      {/* Host Mic/Camera Locks Popover Strip (when toggled via ⋮, Settings, or More) */}
      {locksOpen ? (
        <View style={d.locksBar}>
          <View style={d.locksTitleCluster}>
            <Icon name="lock" size={12} color="#1463F3" />
            <Text style={d.locksBarTitle}>Host Room Controls & Permissions:</Text>
          </View>

          <Pressable
            style={[d.lockChip, lockStudentMics && d.lockChipActive]}
            onPress={() => setLockStudentMics((v) => !v)}>
            <Icon
              name={lockStudentMics ? 'micOff' : 'mic'}
              size={11}
              color={lockStudentMics ? '#DC2626' : '#334155'}
            />
            <Text style={[d.lockChipText, lockStudentMics && d.lockChipTextActive]}>
              {lockStudentMics ? 'Student Mics Locked (28)' : 'Lock All Student Mics'}
            </Text>
          </Pressable>

          <Pressable
            style={[d.lockChip, lockStudentCams && d.lockChipActive]}
            onPress={() => setLockStudentCams((v) => !v)}>
            <Icon
              name={lockStudentCams ? 'videoOff' : 'video'}
              size={11}
              color={lockStudentCams ? '#DC2626' : '#334155'}
            />
            <Text style={[d.lockChipText, lockStudentCams && d.lockChipTextActive]}>
              {lockStudentCams ? 'Student Cameras Locked' : 'Lock Student Cameras'}
            </Text>
          </Pressable>

          <Pressable
            style={[d.lockChip, allowedDrawStudent != null && d.allowDrawChipOn]}
            onPress={() => {
              const next = allowedDrawStudent === 'Daniel O.' ? null : 'Daniel O.';
              setAllowedDrawStudent(next);
              toast(
                next
                  ? 'Daniel O. can now draw on the board.'
                  : 'Only you can draw on the board now.',
              );
            }}>
            <Icon
              name="edit"
              size={11}
              color={allowedDrawStudent ? '#15803D' : '#334155'}
            />
            <Text style={[d.lockChipText, allowedDrawStudent != null && { color: '#15803D', fontWeight: '600' }]}>
              {allowedDrawStudent
                ? `Drawing allowed: ${allowedDrawStudent}`
                : 'Allow Draw: Daniel O. (Students Read-Only)'}
            </Text>
          </Pressable>

          <Pressable style={d.lockChip} onPress={saveBoardToResources}>
            <Icon name="download" size={11} color="#1463F3" />
            <Text style={[d.lockChipText, { color: '#1463F3', fontWeight: '600' }]}>
              Save Board to Notes & Resources
            </Text>
          </Pressable>

          <View style={{ flex: 1 }} />
          <Pressable onPress={() => setLocksOpen(false)}>
            <Text style={d.locksDoneText}>Done</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Main 3-Column Studio Body */}
      <View style={d.body}>
        {/* Left and centre columns, with the control dock under them (the right panels run full height) */}
        <View style={d.mainCol}>
        <View style={d.mainRow}>
        {/* Left Navigation & Materials Sidebar */}
        <View style={d.leftSidebar}>
          <View style={d.navList}>
            {h.nav.map((item) => {
              const active = activeTool === item.label;
              return (
                <Pressable
                  key={item.label}
                  style={[d.navItem, active && d.navItemActive]}
                  onPress={() => {
                    setActiveTool(item.label);
                    if (item.label === 'Pulse Quiz') quiz.launch();
                    if (item.label === 'Settings' || item.label === 'Class Tools') {
                      setLocksOpen((o) => !o);
                    }
                  }}>
                  <Icon
                    name={item.icon}
                    size={13}
                    color={active ? '#FFFFFF' : '#475569'}
                  />
                  <Text style={[d.navLabel, active && d.navLabelActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={d.sideSep} />

          {/* Class Materials Section */}
          <View style={d.materialsSection}>
            <View style={d.materialsHeader}>
              <Text style={d.materialsTitle}>Class Materials</Text>
              <Pressable style={d.materialsAddBtn} onPress={saveBoardToResources}>
                <Icon name="plus" size={11} color="#475569" />
              </Pressable>
            </View>

            <View style={d.materialsList}>
              {materials.map((mat) => (
                <Pressable
                  key={mat.id}
                  style={d.materialRow}
                  onPress={() => {
                    setActiveTool(mat.kind === 'video' ? 'Media (Video)' : 'Slides / PDF');
                    toast(`Presenting ${mat.title} to the class.`);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Present ${mat.title}`}>
                  <View style={[d.materialIconBox, { backgroundColor: mat.color }]}>
                    {mat.kind === 'video' ? (
                      <Icon name="playFill" size={8} color="#FFFFFF" />
                    ) : (
                      <Text style={d.materialIconText}>
                        {mat.kind === 'pro' ? 'PRO' : 'PDF'}
                      </Text>
                    )}
                  </View>
                  <Text style={d.materialName} numberOfLines={1}>
                    {mat.title}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={d.addResourceRow} onPress={saveBoardToResources}>
              <Icon name="plus" size={11} color="#1463F3" />
              <Text style={d.addResourceText}>Save Board / Resource</Text>
            </Pressable>
          </View>
        </View>

        {/* Center Presenter Stage */}
        <WhiteboardStage
          h={h}
          studentsMutedAll={lockStudentMics}
          onToggleStudentMute={toggleStudentMute}
          mutedIds={mutedIds}
        />

        </View>
          {/* Bottom Presenter Control Dock */}
          <View style={d.bottomDock}>
            <View style={d.dockInner}>
              {/* Primary Mic Circle */}
              <Pressable style={d.dockPrimaryItem} onPress={() => setMicOn((m) => !m)}>
                <View style={d.dockCircleRow}>
                  <View style={[d.dockCircleGreen, !micOn && { backgroundColor: '#EF4444' }]}>
                    <Icon name={micOn ? 'mic' : 'micOff'} size={15} color="#FFFFFF" />
                  </View>
                  <Text style={d.dockCaret}>⌃</Text>
                </View>
                <Text style={d.dockLabel}>Mic</Text>
              </Pressable>

              {/* Primary Camera Circle */}
              <Pressable style={d.dockPrimaryItem} onPress={() => setCamOn((c) => !c)}>
                <View style={d.dockCircleRow}>
                  <View style={[d.dockCircleDark, !camOn && { backgroundColor: '#EF4444' }]}>
                    <Icon name={camOn ? 'video' : 'videoOff'} size={15} color="#FFFFFF" />
                  </View>
                  <Text style={d.dockCaret}>⌃</Text>
                </View>
                <Text style={d.dockLabel}>Camera</Text>
              </Pressable>

              {/* Standard Dock Items */}
              <DockItem
                icon="screen"
                label="Share Screen"
                onPress={() => setActiveTool('Screen Share')}
              />

              {/* Record button with red dot */}
              <Pressable style={d.dockItem} onPress={() => setRecording((r) => !r)}>
                <View style={d.recordIconRing}>
                  <View style={[d.recordIconDot, !recording && { backgroundColor: '#94A3B8' }]} />
                </View>
                <Text style={d.dockLabel}>Record</Text>
              </Pressable>

              <DockItem icon="hand" label="Raise Hand" />
              <DockItem icon="smile" label="Reactions" />
              <DockItem icon="chat" label="Chat" />

              {/* Participants with 28 pill */}
              <Pressable style={d.dockItem} onPress={() => setLocksOpen((o) => !o)}>
                <View style={d.participantsIconWrap}>
                  <Icon name="people" size={16} color="#1E293B" />
                  <View style={d.participantsCountPill}>
                    <Text style={d.participantsCountText}>{h.studentsCount}</Text>
                  </View>
                </View>
                <Text style={d.dockLabel}>Participants</Text>
              </Pressable>

              <DockItem
                icon="grid"
                label="Breakout Rooms"
                onPress={() => setActiveTool('Breakout Rooms')}
              />
              <DockItem
                icon="bolt"
                label="Pulse Quiz"
                onPress={quiz.launch}
              />
              <DockItem
                icon="more"
                label="More"
                onPress={() => setLocksOpen((o) => !o)}
              />
            </View>
          </View>
        </View>

        {/* Right 4-Card Stack */}
        <HostRightPanels
          h={h}
          quizTimer={quiz.seconds}
          quizRunning={quiz.running}
          onLaunchQuiz={quiz.launch}
        />
      </View>

      {endAsk ? (
        <View style={d.confirmScrim}>
          <View style={d.confirmCard} accessibilityRole="alert">
            <Text style={d.confirmTitle}>End the class for everyone?</Text>
            <Text style={d.confirmBody}>
              All {h.studentsCount} students leave the room. The recording, chat and transcript are saved to Class Materials.
            </Text>
            <View style={d.confirmRow}>
              <Pressable style={d.confirmKeep} onPress={() => setEndAsk(false)} accessibilityRole="button">
                <Text style={d.confirmKeepText}>Keep teaching</Text>
              </Pressable>
              <Pressable
                style={d.confirmEnd}
                onPress={() => {
                  setEndAsk(false);
                  toast('Class ended. The recording and transcript are in Class Materials.');
                  router.push('/teach/calendar' as never);
                }}
                accessibilityRole="button">
                <Text style={d.confirmEndText}>End for everyone</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function DockItem({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={d.dockItem} onPress={onPress}>
      <View style={d.dockIconBox}>
        <Icon name={icon} size={16} color="#1E293B" />
      </View>
      <Text style={d.dockLabel}>{label}</Text>
    </Pressable>
  );
}

/**
 * Compact mobile view of the Maple Live Teacher Host Console for narrow viewports.
 */
export function HostPhone({ h }: { h: TeacherHost }) {
  const quiz = usePulseQuizTimer(h.pulseQuiz.durationSeconds);
  const [mutedIds, setMutedIds] = useState<Record<string, boolean>>({ s7: true });
  const [lockMics, setLockMics] = useState(false);

  return (
    <ScrollView style={p.scroll} contentContainerStyle={p.content}>
      <View style={p.header}>
        <View style={p.headerTop}>
          <Text style={p.leaf}>🍁</Text>
          <View style={{ flex: 1 }}>
            <Text style={p.title}>{h.course}</Text>
            <Text style={p.sub}>{h.topic}</Text>
          </View>
          <View style={p.liveBadge}>
            <Text style={p.liveText}>● LIVE 00:32:15</Text>
          </View>
        </View>
        <View style={p.lockRow}>
          <Pressable
            style={[p.lockBtn, lockMics && p.lockBtnActive]}
            onPress={() => setLockMics((v) => !v)}>
            <Icon name={lockMics ? 'micOff' : 'mic'} size={12} color="#FFFFFF" />
            <Text style={p.lockBtnText}>
              {lockMics ? 'Mics Locked (28)' : 'Lock Student Mics'}
            </Text>
          </Pressable>
        </View>
      </View>

      <WhiteboardStage
        h={h}
        studentsMutedAll={lockMics}
        onToggleStudentMute={(id) =>
          setMutedIds((prev) => ({ ...prev, [id]: !prev[id] }))
        }
        mutedIds={mutedIds}
      />

      <View style={{ width: '100%', alignItems: 'center' }}>
        <HostRightPanels
          h={h}
          quizTimer={quiz.seconds}
          quizRunning={quiz.running}
          onLaunchQuiz={quiz.launch}
        />
      </View>
    </ScrollView>
  );
}
