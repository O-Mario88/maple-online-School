import { Image } from '@/components/picture';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import {
  type BoardSnapshot,
  computeSceneDelta,
  estimateBandwidthKbps,
  type ExcalidrawDeltaPacket,
  type ExcalidrawElement,
  exportBoardSnapshot,
  type ExportFormat,
} from '@/lib/excalidraw-livekit';
import { toast } from '@/lib/toast';
import { Maple } from '@/constants/maple';

const EXTRA_WORKED_STEPS = [
  '5/6 − 1/4 = 10/12 − 3/12 = 7/12',
  '2/5 + 3/10 = 4/10 + 3/10 = 7/10',
  '7/8 − 1/2 = 7/8 − 4/8 = 3/8',
] as const;

interface Props {
  elements: readonly ExcalidrawElement[];
  onChangeElements: (next: readonly ExcalidrawElement[], packet: ExcalidrawDeltaPacket | null) => void;
  /** True for view-only learners (the role Excalidraw calls `viewModeEnabled`). */
  viewModeEnabled: boolean;
  activeDrawerName: string;
  teacherName: string;
  teacherPhoto: number;
  pipInCorner: boolean;
  onTogglePipLocation: () => void;
  onSaveSnapshot: (snapshot: BoardSnapshot) => void;
  packets: readonly ExcalidrawDeltaPacket[];
}

/**
 * The class whiteboard, built in-app to behave like an Excalidraw board. It is not the Excalidraw
 * library and is not connected to LiveKit yet: the "synced live" figure and the change packets are
 * simulated in lib/excalidraw-livekit.ts so the design can be tried before the live service exists.
 * - Change packets shaped like LiveKit `useDataChannel` messages (simulated)
 * - Read-only `viewModeEnabled` enforcement for students unless granted "Allow Draw"
 * - Corner Picture-in-Picture (PiP) teacher camera box (or docked to bottom strip)
 * - One-click "Save Board to Notes" (PNG / SVG / PDF) exporter
 */
export function ExcalidrawBoard({
  elements,
  onChangeElements,
  viewModeEnabled,
  activeDrawerName,
  teacherName,
  teacherPhoto,
  pipInCorner,
  onTogglePipLocation,
  onSaveSnapshot,
  packets,
}: Props) {
  const [tool, setTool] = useState<'pen' | 'equation' | 'rect' | 'pdf'>('pen');
  const [strokeColor, setStrokeColor] = useState<string>(Maple.blue);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const [stepIdx, setStepIdx] = useState(0);

  const kbps = estimateBandwidthKbps(packets.slice(-4), 1) || 1.42;

  const handleAddWorkedStep = () => {
    if (viewModeEnabled) {
      toast('The board is view only. Raise your hand to ask the teacher if you can draw.');
      return;
    }
    const formula = EXTRA_WORKED_STEPS[stepIdx % EXTRA_WORKED_STEPS.length];
    const nextEl: ExcalidrawElement = {
      id: `el-live-${Date.now()}`,
      type: tool === 'rect' ? 'rectangle' : 'equation',
      x: 24,
      y: 204 + (stepIdx % 3) * 32,
      strokeColor,
      text: `${activeDrawerName}:  ${formula}`,
      version: 1,
      author: activeDrawerName,
    };
    const next = [...elements, nextEl];
    const packet = computeSceneDelta(elements, next, activeDrawerName);
    setStepIdx((i) => i + 1);
    onChangeElements(next, packet);
  };

  const handleSaveToNotes = () => {
    const snap = exportBoardSnapshot(
      elements,
      exportFormat,
      'Fractions: Worked Board Snapshot',
      activeDrawerName,
    );
    onSaveSnapshot(snap);
    toast(`Saved ${exportFormat.toUpperCase()} snapshot & worked examples to Lesson Notes!`);
  };

  return (
    <View style={s.root}>
      {/* Top bar: board name, sync rate, who can draw */}
      <View style={s.topBar}>
        <View style={s.sdkBadge}>
          <Icon name="edit" size={12} color={Maple.blue} />
          <Text style={s.sdkBadgeText}>Class whiteboard</Text>
        </View>

        {/* LiveKit DataChannel Bandwidth Pill */}
        <View style={s.dataChannelPill}>
          <View style={s.greenDot} />
          <Text style={s.dataChannelText}>
            Synced live · {kbps} KB/s
          </Text>
        </View>

        {/* Read-Only vs Drawing Allowed Badge */}
        <View style={[s.permPill, viewModeEnabled ? s.permReadOnly : s.permCanDraw]}>
          <Icon
            name={viewModeEnabled ? 'lock' : 'edit'}
            size={10}
            color={viewModeEnabled ? Maple.secondary : Maple.successText}
          />
          <Text
            style={[
              s.permText,
              viewModeEnabled ? s.permTextReadOnly : s.permTextCanDraw,
            ]}>
            {viewModeEnabled
              ? 'View only'
              : `Drawing now: ${activeDrawerName}`}
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        {/* Format cycle + One-Click Save Board to Notes */}
        <Pressable
          style={s.formatBtn}
          onPress={() =>
            setExportFormat((f) => (f === 'png' ? 'svg' : f === 'svg' ? 'pdf' : 'png'))
          }>
          <Text style={s.formatBtnText}>{exportFormat.toUpperCase()} ⌄</Text>
        </Pressable>

        <Pressable
          style={s.saveNotesBtn}
          onPress={handleSaveToNotes}
          accessibilityRole="button"
          accessibilityLabel="Save Board to Notes">
          <Icon name="download" size={12} color={Maple.surface} />
          <Text style={s.saveNotesText}>Save Board to Notes</Text>
        </Pressable>
      </View>

      {/* Excalidraw Interactive Canvas */}
      <Pressable style={s.canvas} onPress={handleAddWorkedStep}>
        {/* Left: Worked Math Derivation on Board */}
        <View style={s.boardContent}>
          <View style={s.boardHeaderBanner}>
            <Text style={s.boardHeaderText}>Fractions: Adding and Subtracting</Text>
          </View>

          <View style={s.boardColumns}>
            <View style={s.workedCol}>
              <Text style={s.exampleHeading}>Example 1</Text>
              <Text style={s.equationRow}>Find   3/4  +  2/3</Text>
              <Text style={s.equationStep}>=  (3 × 3)/(4 × 3)  +  (2 × 4)/(3 × 4)</Text>
              <Text style={s.equationStep}>=  9/12  +  8/12</Text>
              <View style={s.finalAnswerRow}>
                <Text style={s.equationStep}>=  17/12   =</Text>
                <View style={s.redAnswerBox}>
                  <Text style={s.redAnswerText}>1  5/12</Text>
                </View>
              </View>

              {/* Dynamic strokes added via Excalidraw onChange / LiveKit DataChannel */}
              {elements.slice(5).map((el) => (
                <View key={el.id} style={[s.liveStrokePill, { borderColor: el.strokeColor }]}>
                  <Text style={[s.liveStrokeText, { color: el.strokeColor }]}>
                    ✏️ {el.text}
                  </Text>
                </View>
              ))}
            </View>

            {/* Steps box on right side of whiteboard */}
            <View style={s.stepsCol}>
              <Text style={s.stepsHeading}>Steps:</Text>
              {[
                'Find a common denominator',
                'Convert the fractions',
                'Add the numerators',
                'Simplify the answer',
                'Change to a mixed number',
              ].map((st, idx) => (
                <View key={st} style={s.stepRow}>
                  <View style={s.stepCircle}>
                    <Text style={s.stepNum}>{idx + 1}</Text>
                  </View>
                  <Text style={s.stepLabel}>{st}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Floating Excalidraw Tool Palette (enabled when viewModeEnabled={false}) */}
        <View style={[s.floatingToolbar, viewModeEnabled && s.floatingToolbarDisabled]}>
          {(['pen', 'equation', 'rect', 'pdf'] as const).map((k) => {
            const active = tool === k;
            return (
              <Pressable
                key={k}
                style={[s.toolChip, active && s.toolChipOn]}
                onPress={() => {
                  setTool(k);
                  handleAddWorkedStep();
                }}>
                <Text style={[s.toolChipText, active && s.toolChipTextOn]}>
                  {k === 'pen'
                    ? '✏️ Draw Step'
                    : k === 'equation'
                      ? '∑ Fraction'
                      : k === 'rect'
                        ? '▭ Box'
                        : '📄 PDF Sheet'}
                </Text>
              </Pressable>
            );
          })}
          {[Maple.blue, Maple.error, Maple.successText].map((c) => (
            <Pressable
              key={c}
              style={[
                s.colorSwatch,
                { backgroundColor: c },
                strokeColor === c && s.colorSwatchOn,
              ]}
              onPress={() => setStrokeColor(c)}
            />
          ))}
        </View>

        {/* Corner Picture-in-Picture (PiP) Teacher Camera Box */}
        {pipInCorner ? (
          <View style={s.pipBox}>
            <Image source={teacherPhoto} style={StyleSheet.absoluteFill} contentFit="cover" />
            <View style={s.pipOverlay}>
              <View style={s.pipLiveDot} />
              <Text style={s.pipName} numberOfLines={1}>
                {teacherName}
              </Text>
              <Pressable
                style={s.pipPinBtn}
                onPress={onTogglePipLocation}
                accessibilityRole="button"
                accessibilityLabel="Pin teacher camera to bottom strip">
                <Text style={s.pipPinText}>Dock ↓</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable style={s.restorePipBadge} onPress={onTogglePipLocation}>
            <Icon name="video" size={11} color={Maple.surface} />
            <Text style={s.restorePipText}>Pin Teacher PiP to Corner ↗</Text>
          </Pressable>
        )}
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Maple.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Maple.blueSelected,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Maple.blueSoft,
    borderBottomWidth: 1,
    borderBottomColor: Maple.border,
    flexWrap: 'wrap',
  },
  sdkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Maple.blueSoft,
    borderWidth: 1,
    borderColor: Maple.blueLine,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
  },
  sdkBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Maple.blue,
  },
  dataChannelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Maple.successSoft,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Maple.successText,
  },
  dataChannelText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: Maple.successText,
  },
  permPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderWidth: 1,
  },
  permReadOnly: {
    backgroundColor: Maple.blueSoft,
    borderColor: Maple.borderStrong,
  },
  permCanDraw: {
    backgroundColor: Maple.successSoft,
    borderColor: '#86EFAC',
  },
  permText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  permTextReadOnly: {
    color: Maple.body,
  },
  permTextCanDraw: {
    color: Maple.successText,
  },
  formatBtn: {
    backgroundColor: Maple.surface,
    borderWidth: 1,
    borderColor: Maple.borderStrong,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  formatBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Maple.body,
  },
  saveNotesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Maple.blue,
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  saveNotesText: {
    fontSize: 11,
    fontWeight: '700',
    color: Maple.surface,
  },

  /* Canvas */
  canvas: {
    flex: 1,
    padding: 16,
    backgroundColor: Maple.surface,
    justifyContent: 'space-between',
    position: 'relative',
  },
  boardContent: {
    gap: 12,
  },
  boardHeaderBanner: {
    backgroundColor: Maple.blue,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  boardHeaderText: {
    fontSize: 15,
    fontWeight: '800',
    color: Maple.surface,
  },
  boardColumns: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'flex-start',
  },
  workedCol: {
    flex: 1.2,
    backgroundColor: Maple.blueSoft,
    borderRadius: 10,
    padding: 14,
    gap: 6,
  },
  exampleHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: Maple.navy,
  },
  equationRow: {
    fontSize: 17,
    fontWeight: '700',
    color: Maple.navy,
  },
  equationStep: {
    fontSize: 14,
    fontWeight: '600',
    color: Maple.navy,
  },
  finalAnswerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  redAnswerBox: {
    borderWidth: 2,
    borderColor: Maple.error,
    backgroundColor: Maple.errorSoft,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  redAnswerText: {
    fontSize: 15,
    fontWeight: '800',
    color: Maple.navy,
  },
  liveStrokePill: {
    marginTop: 4,
    borderWidth: 1.5,
    borderRadius: 6,
    backgroundColor: Maple.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  liveStrokeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepsCol: {
    flex: 1,
    gap: 7,
  },
  stepsHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: Maple.navy,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Maple.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    fontSize: 11,
    fontWeight: '700',
    color: Maple.surface,
  },
  stepLabel: {
    fontSize: 12.5,
    fontWeight: '500',
    color: Maple.navy,
  },

  /* Floating Excalidraw Toolbar */
  floatingToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: Maple.blueSoft,
    borderWidth: 1,
    borderColor: Maple.borderStrong,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 44,
  },
  floatingToolbarDisabled: {
    opacity: 0.65,
  },
  toolChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: Maple.surface,
    borderWidth: 1,
    borderColor: Maple.border,
  },
  toolChipOn: {
    backgroundColor: Maple.blueSoft,
    borderColor: Maple.blue,
  },
  toolChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Maple.body,
  },
  toolChipTextOn: {
    color: Maple.blue,
    fontWeight: '700',
  },
  colorSwatch: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  colorSwatchOn: {
    borderWidth: 2,
    borderColor: Maple.navy,
  },

  /* Corner Picture-in-Picture (PiP) Teacher Camera */
  pipBox: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 156,
    height: 98,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Maple.blue,
    backgroundColor: Maple.navy,
  },
  pipOverlay: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  pipLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Maple.success,
  },
  pipName: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    color: Maple.surface,
  },
  pipPinBtn: {
    backgroundColor: Maple.blue,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
  },
  pipPinText: {
    fontSize: 9,
    fontWeight: '700',
    color: Maple.surface,
  },
  restorePipBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Maple.navy,
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  restorePipText: {
    fontSize: 10,
    fontWeight: '600',
    color: Maple.surface,
  },
});

