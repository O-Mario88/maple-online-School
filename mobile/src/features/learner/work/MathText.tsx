import { StyleSheet, Text, View } from 'react-native';

import { parseDoc, parseMath } from '@/lib/assignment-work';

export const INK = '#0B1424';
export const BODY = '#4A5263';
export const BLUE = '#1463F3';
export const GREEN = '#22A35A';
export const RED = '#E5484D';
export const ORANGE = '#F28C28';

function Frac({ num, den, size, color }: { num: string; den: string; size: number; color: string }) {
  const s = size * 0.82;
  return (
    <View style={styles.frac} accessible accessibilityLabel={`${num} over ${den}`}>
      <Text style={{ fontSize: s, lineHeight: s * 1.1, color }}>{num}</Text>
      <View style={[styles.bar, { backgroundColor: color }]} />
      <Text style={{ fontSize: s, lineHeight: s * 1.1, color }}>{den}</Text>
    </View>
  );
}

/** One line of the light maths markup: "2/3" draws as a stacked fraction, with bold, italic and underline marks. */
export function MathLine({ text, size = 14, color = INK, bold = false }: { text: string; size?: number; color?: string; bold?: boolean }) {
  return (
    <View style={[styles.line, { columnGap: size * 0.3 }]}>
      {parseMath(text).map((t, i) =>
        t.kind === 'frac' ? (
          <View key={i} style={styles.fracWrap}>
            <Frac num={t.num} den={t.den} size={size} color={color} />
            {t.after ? <Text style={{ fontSize: size, color }}>{t.after}</Text> : null}
          </View>
        ) : (
          <Text
            key={i}
            style={[
              { fontSize: size, lineHeight: size * 1.45, color },
              (bold || t.bold) && styles.bold,
              t.italic && styles.italic,
              t.underline && styles.underline,
            ]}>
            {t.text}
          </Text>
        ),
      )}
    </View>
  );
}

/** A whole answer: "# " headings and paragraphs. */
export function MathDoc({ text, size = 14.5 }: { text: string; size?: number }) {
  return (
    <View style={styles.doc}>
      {parseDoc(text).map((l, i) => (
        <View key={i} style={l.heading && i > 0 ? styles.headGap : undefined}>
          <MathLine text={l.text} size={l.heading ? size + 1.5 : size} bold={l.heading} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  line: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', rowGap: 4 },
  frac: { alignItems: 'center', paddingHorizontal: 1 },
  fracWrap: { flexDirection: 'row', alignItems: 'center' },
  bar: { alignSelf: 'stretch', height: 1, marginVertical: 1 },
  bold: { fontWeight: '700' },
  italic: { fontStyle: 'italic' },
  underline: { textDecorationLine: 'underline' },
  doc: { gap: 12 },
  headGap: { marginTop: 10 },
});
