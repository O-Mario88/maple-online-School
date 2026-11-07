import { Pressable, Text, View } from 'react-native';

import type { s as deskS } from './SpeedGraderViews.styles';

interface AnswerSheetProps {
  s: typeof deskS;
  activeTool: string;
  aiHighlights: boolean;
  annotationsCleared: boolean;
  extraStamp: string | null;
  onStamp: (stamp: string) => void;
}

/** The student's scanned handwritten answers with the teacher's and AI's marks drawn over them. */
export function AnswerSheet({ s, activeTool, aiHighlights, annotationsCleared, extraStamp, onStamp }: AnswerSheetProps) {
  return (
    <Pressable
      style={s.paperSheet}
      onPress={() => {
        if (activeTool !== 'select') {
          onStamp('✓ Full marks on factorization (+10)');
        }
      }}>
      <Text style={s.qPrompt}>1.  Solve the following quadratic equations.</Text>

      {/* Part a) */}
      <View style={s.partBlock}>
        <Text style={s.partTitle}>a)   x² − 5x + 6 = 0</Text>
        <Text style={s.handLine}>x² − 5x + 6 = 0</Text>

        <View style={s.annotatedFactorRow}>
          <View
            style={[
              s.redOvalWrap,
              annotationsCleared && { borderColor: 'transparent' },
            ]}>
            <Text style={s.handLine}>(x − 2)(x − 3) = 0</Text>
          </View>

          {!annotationsCleared ? (
            <Text style={s.redHandNote}>✓  Good factorization!</Text>
          ) : null}
        </View>

        <Text style={s.handLine}>x − 2 = 0     or     x − 3 = 0</Text>
        <Text style={s.handLine}>    x = 2                x = 3</Text>

        <View style={s.annotatedAnsRow}>
          <View
            style={[
              s.greenAnsBox,
              (!aiHighlights || annotationsCleared) && {
                borderColor: 'transparent',
                backgroundColor: 'transparent',
              },
            ]}>
            <Text style={s.handLine}>∴   x = 2    or    x = 3 .</Text>
          </View>
          {aiHighlights && !annotationsCleared ? (
            <Text style={s.greenHandNote}>✓  Correct answer</Text>
          ) : null}
        </View>
      </View>

      {/* Part b) */}
      <View style={s.partBlock}>
        <Text style={s.partTitle}>b)   2x² + 3x − 2 = 0</Text>
        <View style={s.partBRow}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={s.handLine}>2x² + 3x − 2 = 0</Text>
            <View
              style={[
                s.yellowHighlightBand,
                !aiHighlights && { backgroundColor: 'transparent' },
              ]}>
              <Text style={s.handLine}>(2x − 1)(x + 2) = 0</Text>
            </View>
            <Text style={s.handLine}>2x − 1 = 0    or    x + 2 = 0</Text>
            <View style={s.handFractionRow}>
              <Text style={s.handLine}>     x = </Text>
              <View style={s.stackedFrac}>
                <Text style={s.stackedFracText}>1</Text>
                <View style={s.stackedFracBar} />
                <Text style={s.stackedFracText}>2</Text>
              </View>
              <Text style={s.handLine}>            x = −2</Text>
            </View>
            <View style={s.handFractionRow}>
              <Text style={s.handLine}>∴   x = </Text>
              <View style={s.stackedFrac}>
                <Text style={s.stackedFracText}>1</Text>
                <View style={s.stackedFracBar} />
                <Text style={s.stackedFracText}>2</Text>
              </View>
              <Text style={s.handLine}>   or   x = −2</Text>
            </View>
          </View>

          {/* Yellow Sticky Note Callout */}
          {aiHighlights && !annotationsCleared ? (
            <View style={s.yellowStickyWrap}>
              <Text style={s.yellowArrow}>↙</Text>
              <View style={s.yellowSticky}>
                <Text style={s.yellowStickyText}>Check your working</Text>
                <Text style={s.yellowStickyText}>here. Factorization</Text>
                <Text style={s.yellowStickyText}>is correct but show</Text>
                <Text style={s.yellowStickyText}>more steps.</Text>
              </View>
            </View>
          ) : null}
        </View>
      </View>

      {/* Part c) */}
      <View style={s.partBlock}>
        <Text style={s.partTitle}>c)   x² + 4x + 4 = 0</Text>
        <Text style={s.handLine}>    (x + 2)² = 0</Text>
        <Text style={s.handLine}>    x = −2</Text>
        <View style={s.annotatedAnsRow}>
          <View
            style={[
              s.greenAnsBox,
              (!aiHighlights || annotationsCleared) && {
                borderColor: 'transparent',
                backgroundColor: 'transparent',
              },
            ]}>
            <Text style={s.handLine}>∴   x = −2 .</Text>
          </View>
          {aiHighlights && !annotationsCleared ? (
            <Text style={s.greenCheckBig}>✓</Text>
          ) : null}
        </View>
      </View>

      {extraStamp ? (
        <View style={s.extraStampPill}>
          <Text style={s.extraStampText}>{extraStamp}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}
