import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { toast } from '@/lib/toast';
import type { HostStudentTile, TeacherHost } from '@/mock/teacher-host';

import { InkLayer, type InkTool, useInk } from './InkLayer';
import { s } from './WhiteboardStage.styles';

const COLORS = ['#0F172A', '#EF4444', '#1463F3', '#22C55E'] as const;
type DrawTool = InkTool;

interface Props {
  h: TeacherHost;
  studentsMutedAll: boolean;
  onToggleStudentMute: (id: string) => void;
  mutedIds: Record<string, boolean>;
}

/**
 * Center presenter stage of the Maple Live Teacher Host Console:
 * 1) Top card with vector whiteboard toolbar + split Interactive Vector Whiteboard & Synchronized PDF stage
 * 2) Bottom video strip with large Teacher video tile + 2-row student video grid
 */
export function WhiteboardStage({ h, studentsMutedAll, onToggleStudentMute, mutedIds }: Props) {
  const [activeTool, setActiveTool] = useState<DrawTool>('select');
  const [activeColor, setActiveColor] = useState<string>(COLORS[0]);
  const [zoom, setZoom] = useState(100);
  const [pdfPage, setPdfPage] = useState(h.pdf.page);
  const ink = useInk();
  const [focus, setFocus] = useState(false);

  const row1 = h.studentTiles.slice(0, 4);
  const row2 = h.studentTiles.slice(4, 8);

  return (
    <View style={s.col}>
      {/* Top Whiteboard + PDF Card */}
      <View style={s.stageCard}>
        {/* Whiteboard Toolbar */}
        <View style={s.toolbar}>
          <View style={s.toolGroup}>
            <Pressable style={[s.toolBtn, !ink.canUndo && s.toolOff]} disabled={!ink.canUndo} onPress={() => ink.dispatch({ type: 'undo' })} accessibilityRole="button" accessibilityLabel="Undo">
              <Icon name="undo" size={13} color="#475569" />
            </Pressable>
            <Pressable style={[s.toolBtn, !ink.canRedo && s.toolOff]} disabled={!ink.canRedo} onPress={() => ink.dispatch({ type: 'redo' })} accessibilityRole="button" accessibilityLabel="Redo">
              <Icon name="redo" size={13} color="#475569" />
            </Pressable>
          </View>

          <View style={s.toolSep} />

          <View style={s.toolGroup}>
            {/* Pointer / Select tool */}
            <Pressable
              style={[s.toolBtn, activeTool === 'select' && s.toolBtnOn]}
              onPress={() => setActiveTool('select')}
              accessibilityRole="button"
              accessibilityLabel="Select tool"
              accessibilityState={{ selected: activeTool === 'select' }}>
              <Text style={[s.pointerGlyph, activeTool === 'select' && s.pointerGlyphOn]}>↖</Text>
            </Pressable>

            {/* Pen with blue bar */}
            <Pressable
              style={[s.toolBtn, activeTool === 'pen' && s.toolBtnOn]}
              onPress={() => setActiveTool('pen')}
              accessibilityRole="button"
              accessibilityLabel="Pen tool"
              accessibilityState={{ selected: activeTool === 'pen' }}>
              <View style={s.penWrap}>
                <Icon name="edit" size={12} color={activeTool === 'pen' ? '#1463F3' : '#334155'} />
                <View style={[s.penBar, { backgroundColor: '#1463F3' }]} />
              </View>
            </Pressable>

            {/* Highlighter with red bar */}
            <Pressable
              style={[s.toolBtn, activeTool === 'highlighter' && s.toolBtnOn]}
              onPress={() => setActiveTool('highlighter')}
              accessibilityRole="button"
              accessibilityLabel="Highlighter tool"
              accessibilityState={{ selected: activeTool === 'highlighter' }}>
              <View style={s.penWrap}>
                <Icon name="edit" size={12} color={activeTool === 'highlighter' ? '#EF4444' : '#334155'} />
                <View style={[s.penBar, { backgroundColor: '#EF4444' }]} />
              </View>
            </Pressable>

            {/* Rectangle */}
            <Pressable
              style={[s.toolBtn, activeTool === 'rect' && s.toolBtnOn]}
              onPress={() => setActiveTool('rect')}
              accessibilityRole="button"
              accessibilityLabel="Rectangle tool"
              accessibilityState={{ selected: activeTool === 'rect' }}>
              <View style={[s.shapeRect, activeTool === 'rect' && { borderColor: '#1463F3' }]} />
            </Pressable>

            {/* Circle + chevron */}
            <Pressable
              style={[s.toolBtnWide, activeTool === 'circle' && s.toolBtnOn]}
              onPress={() => setActiveTool('circle')}
              accessibilityRole="button"
              accessibilityLabel="Circle tool"
              accessibilityState={{ selected: activeTool === 'circle' }}>
              <View style={[s.shapeCircle, activeTool === 'circle' && { borderColor: '#1463F3' }]} />
              <Icon name="chevronDown" size={9} color="#64748B" />
            </Pressable>

            {/* Text tool T */}
            <Pressable
              style={[s.toolBtn, activeTool === 'text' && s.toolBtnOn]}
              onPress={() => setActiveTool('text')}
              accessibilityRole="button"
              accessibilityLabel="Text tool"
              accessibilityState={{ selected: activeTool === 'text' }}>
              <Text style={[s.toolTextGlyph, activeTool === 'text' && { color: '#1463F3' }]}>T</Text>
            </Pressable>

            {/* Image tool */}
            <Pressable
              style={[s.toolBtn, activeTool === 'image' && s.toolBtnOn]}
              onPress={() => {
                setActiveTool('image');
                toast('Choose a picture to place on the board.');
              }}>
              <Icon name="gallery" size={13} color={activeTool === 'image' ? '#1463F3' : '#475569'} />
            </Pressable>
          </View>

          <View style={s.toolSep} />

          {/* Color Swatches */}
          <View style={s.colorGroup}>
            {COLORS.map((c) => {
              const selected = activeColor === c;
              return (
                <Pressable
                  key={c}
                  style={[s.colorDotWrap, selected && s.colorDotSelected]}
                  onPress={() => setActiveColor(c)}
                  accessibilityRole="button"
                  accessibilityLabel={`Colour ${c}`}
                  accessibilityState={{ selected }}>
                  <View style={[s.colorDot, { backgroundColor: c }]} />
                </Pressable>
              );
            })}
          </View>

          <View style={s.toolSep} />

          {/* Formula / Math Symbol button */}
          <Pressable
            style={[s.toolBtn, activeTool === 'formula' && s.toolBtnOn]}
            onPress={() => setActiveTool('formula')}
              accessibilityRole="button"
              accessibilityLabel="Formula tool"
              accessibilityState={{ selected: activeTool === 'formula' }}>
            <Text style={s.formulaGlyph}>A</Text>
          </Pressable>

          <View style={{ flex: 1 }} />

          {/* Zoom pill + Expand */}
          <Pressable
            style={s.zoomPill}
            onPress={() => setZoom((z) => (z === 100 ? 125 : z === 125 ? 90 : 100))}>
            <Icon name="search" size={11} color="#64748B" />
            <Text style={s.zoomText}>{zoom}%</Text>
            <Icon name="chevronDown" size={10} color="#64748B" />
          </Pressable>

          <Pressable style={[s.expandBtn, focus && s.toolBtnOn]} onPress={() => setFocus((f) => !f)} accessibilityRole="button" accessibilityLabel={focus ? 'Show the PDF again' : 'Make the board fill the stage'}>
            <Icon name="expand" size={12} color="#475569" />
          </Pressable>
        </View>

        {/* Split Whiteboard + PDF Stage */}
        <View style={s.stageBody}>
          {/* Left: Interactive Vector Whiteboard */}
          <View style={s.whiteboardPane}>
            {/* Left column of handwritten steps */}
            <View style={s.wbLeftCol}>
              <Text style={s.wbTitle}>Solve by factorization :</Text>
              <Text style={s.wbMainEq}>x² − 5x + 6 = 0</Text>

              {/* Step 1 */}
              <View style={s.wbStepBlock}>
                <View style={s.wbStepRow}>
                  <Text style={s.wbStepRedLabel}>Step 1 :</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.wbStepRedText}>Find two numbers that multiply to 6</Text>
                    <Text style={s.wbStepRedText}>and add to −5.</Text>
                  </View>
                </View>
                <Text style={s.wbStepSubDark}>The numbers are −2 and −3.</Text>
              </View>

              {/* Step 2 */}
              <View style={s.wbStepBlock}>
                <View style={s.wbStepRow}>
                  <Text style={s.wbStepBlueLabel}>Step 2 :</Text>
                  <Text style={s.wbStepBlueText}>Factorize</Text>
                </View>
                <Text style={s.wbFactorEq}>x² − 5x + 6 = (x − 2)(x − 3)</Text>
              </View>

              {/* Step 3 */}
              <View style={s.wbStepBlock}>
                <View style={s.wbStepRow}>
                  <Text style={s.wbStepGreenLabel}>Step 3 :</Text>
                  <Text style={s.wbStepGreenText}>Set each factor to zero</Text>
                </View>
                <Text style={s.wbZeroLine}>x − 2 = 0   →   x = 2</Text>
                <Text style={s.wbZeroLine}>x − 3 = 0   →   x = 3</Text>
              </View>

              {/* Green Box: Solutions */}
              <View style={s.wbSolutionsBox}>
                <Text style={s.wbSolutionsText}>Solutions:  x = 2  or  x = 3</Text>
              </View>
            </View>

            {/* Right column of whiteboard: Callout + Parabola Graph + Yellow Check Sticky Note */}
            <View style={s.wbRightCol}>
              {/* Blue Callout Box */}
              <View style={s.wbCalloutBox}>
                <Text style={s.wbCalloutText}>What do you notice</Text>
                <Text style={s.wbCalloutText}>about the roots?</Text>
              </View>

              {/* Curved arrow indicator */}
              <View style={s.wbCurveArrowWrap}>
                <View style={s.wbCurveArc} />
                <Text style={s.wbCurveArrowHead}>↙</Text>
              </View>

              {/* Coordinate Graph with Parabola */}
              <View style={s.graphWrap}>
                {/* Y axis */}
                <View style={s.yAxis}>
                  <Text style={s.axisArrowUp}>▲</Text>
                </View>
                <Text style={s.yAxisLabel}>y</Text>

                {/* X axis */}
                <View style={s.xAxis}>
                  <Text style={s.axisArrowRight}>▶</Text>
                </View>
                <Text style={s.xAxisLabel}>x</Text>

                {/* U-shaped Parabola curve */}
                <View style={s.parabolaViewport}>
                  <View style={s.parabolaCurve} />
                </View>

                {/* Root dots at x = 2 and x = 3 */}
                <View style={[s.rootDot, { left: 54 }]} />
                <View style={[s.rootDot, { left: 86 }]} />
                <Text style={[s.rootLabel, { left: 51 }]}>2</Text>
                <Text style={[s.rootLabel, { left: 84 }]}>3</Text>
              </View>

              {/* Yellow Check Sticky Note */}
              <View style={s.stickyNote}>
                <Text style={s.stickyTitle}>Check :</Text>
                <Text style={s.stickyEq}>(2)² − 5(2) + 6 = 0</Text>
                <View style={s.stickyBottomRow}>
                  <Text style={s.stickyEq}>(3)² − 5(3) + 6 = 0</Text>
                  <Text style={s.stickyCheck}>✓</Text>
                </View>
              </View>

            </View>
            <InkLayer tool={activeTool} color={activeColor} ink={ink} />
          </View>

          {/* Right: Synchronized PDF Stage */}
          <View style={[s.pdfPane, focus && s.hidden]}>
            {/* PDF Header */}
            <View style={s.pdfHeader}>
              <View style={s.pdfBadge}>
                <Text style={s.pdfBadgeText}>PDF</Text>
              </View>
              <Text style={s.pdfFilename} numberOfLines={1}>
                {h.pdf.filename}
              </Text>
              <Text style={s.pdfPageCount}>
                {pdfPage} / {h.pdf.totalPages}
              </Text>
              <View style={s.pdfNavBtns}>
                <Pressable
                  style={s.pdfNavBtn}
                  onPress={() => setPdfPage((p) => Math.max(1, p - 1))}>
                  <Icon name="chevronLeft" size={10} color="#475569" />
                </Pressable>
                <Pressable
                  style={s.pdfNavBtn}
                  onPress={() => setPdfPage((p) => Math.min(h.pdf.totalPages, p + 1))}>
                  <Icon name="chevronRight" size={10} color="#475569" />
                </Pressable>
              </View>
            </View>

            {/* PDF Slide Card */}
            <View style={s.pdfSlideCard}>
              <Text style={s.pdfHeading}>{h.pdf.heading}</Text>
              <Text style={s.pdfPrompt}>{h.pdf.prompt}</Text>
              <Text style={s.pdfEquation}>{h.pdf.equation}</Text>

              <View style={s.pdfStepsBox}>
                <Text style={s.pdfStepsTitle}>Key Steps:</Text>
                {h.pdf.steps.map((step, idx) => (
                  <View key={step} style={s.pdfStepRow}>
                    <Text style={s.pdfStepNum}>{idx + 1}.</Text>
                    <Text style={s.pdfStepText}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* PDF Bottom Controls */}
            <View style={s.pdfFooter}>
              <Pressable style={s.pdfFooterBtn} onPress={() => setZoom((z) => Math.min(150, z + 10))}>
                <Icon name="search" size={12} color="#475569" />
              </Pressable>
              <Pressable style={s.pdfFooterBtn} onPress={() => setZoom((z) => Math.max(75, z - 10))}>
                <Icon name="minus" size={12} color="#475569" />
              </Pressable>
              <Pressable
                style={s.pdfFooterBtn}
                onPress={() => setPdfPage((p) => Math.min(h.pdf.totalPages, p + 1))}>
                <Icon name="arrowRight" size={12} color="#475569" />
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Video Gallery Strip */}
      <View style={s.videoStrip}>
        {/* Left: Large Teacher Tile */}
        <View style={s.teacherTile}>
          <Image source={h.teacherVideo} style={s.tileImg} contentFit="cover" />
          <View style={s.tileTopMenu}>
            <Text style={s.tileDots}>⋮</Text>
          </View>
          <View style={s.teacherTileBar}>
            <View style={s.micBadgeGreen}>
              <Icon name="mic" size={10} color="#FFFFFF" />
            </View>
            <Text style={s.teacherTileName}>You (Teacher)</Text>
            <View style={{ flex: 1 }} />
            <Text style={s.tileMoreDots}>•••</Text>
          </View>
        </View>

        {/* Right: 2-row Student Video Grid */}
        <View style={s.studentGrid}>
          {/* Row 1: 4 student tiles */}
          <View style={s.studentRow}>
            {row1.map((st) => (
              <StudentVideoTile
                key={st.id}
                tile={st}
                muted={Boolean(studentsMutedAll || st.muted || mutedIds[st.id])}
                onPress={() => onToggleStudentMute(st.id)}
              />
            ))}
          </View>

          {/* Row 2: 4 student tiles + "+19 others" card */}
          <View style={s.studentRow}>
            {row2.map((st) => (
              <StudentVideoTile
                key={st.id}
                tile={st}
                muted={Boolean(studentsMutedAll || st.muted || mutedIds[st.id])}
                onPress={() => onToggleStudentMute(st.id)}
              />
            ))}
            <View style={s.othersTile}>
              <View style={s.othersIconCircle}>
                <Icon name="people" size={15} color="#E2E8F0" />
              </View>
              <Text style={s.othersText}>+{h.othersCount} others</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function StudentVideoTile({
  tile,
  muted,
  onPress,
}: {
  tile: HostStudentTile;
  muted: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={s.studentTile} onPress={onPress}>
      <Image source={tile.photo} style={s.tileImg} contentFit="cover" />
      <View style={s.tileTopMenuSmall}>
        <Text style={s.tileDotsSmall}>⋮</Text>
      </View>
      <View style={s.studentTileBar}>
        <View style={[s.micBadgeSmall, muted ? s.micBadgeRed : s.micBadgeGreen]}>
          <Icon name={muted ? 'micOff' : 'mic'} size={8} color="#FFFFFF" />
        </View>
        <Text style={s.studentTileName} numberOfLines={1}>
          {tile.name}
        </Text>
        <View style={{ flex: 1 }} />
        <Text style={s.tileDotsSmall}>⋮</Text>
      </View>
    </Pressable>
  );
}
