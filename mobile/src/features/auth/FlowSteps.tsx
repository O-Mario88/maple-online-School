import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Brand } from '@/features/public/palette';

export type StepState = 'done' | 'current' | 'todo' | 'first';

/** A row of numbered steps joined by lines: done steps show a tick, the current one is blue, later ones grey. */
export function FlowSteps({ steps, phone = false, lineWidth = 28 }: { steps: readonly { label: string; short?: string; state: StepState }[]; phone?: boolean; lineWidth?: number }) {
  return (
    <View style={[styles.row, phone && styles.rowP]}>
      {steps.map((s, i) => {
        const blue = s.state !== 'todo';
        const circle = (
          <View style={[styles.num, phone && styles.numP, blue && styles.numOn]}>
            {s.state === 'done' ? <Icon name="check" size={phone ? 14 : 18} color={Brand.surface} /> : <Text style={[styles.numText, phone && styles.numTextP]}>{String(i + 1)}</Text>}
          </View>
        );
        const label = <Text style={[phone ? styles.labelP : styles.label, s.state === 'current' && styles.labelOn]}>{phone ? s.short ?? s.label : s.label}</Text>;
        return phone ? (
          <View key={s.label} style={styles.stepP}>
            <View style={styles.topP}>
              {circle}
              {i < steps.length - 1 ? <View style={styles.lineP} /> : null}
            </View>
            {label}
          </View>
        ) : (
          <View key={s.label} style={styles.step}>
            {circle}
            {label}
            {i < steps.length - 1 ? <View style={[styles.line, { width: lineWidth }]} /> : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  rowP: { justifyContent: 'space-between' },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepP: { flex: 1, alignItems: 'center', gap: 6 },
  topP: { width: '100%', alignItems: 'center' },
  num: { width: 33, height: 33, borderRadius: 17, backgroundColor: '#B6C0D0', alignItems: 'center', justifyContent: 'center' },
  numP: { width: 24, height: 24, borderRadius: 12 },
  numOn: { backgroundColor: Brand.blue },
  numText: { fontSize: 15, fontWeight: '600', color: Brand.surface },
  numTextP: { fontSize: 11 },
  label: { fontSize: 13.5, color: '#4A5263' },
  labelP: { fontSize: 10, color: '#4A5263', textAlign: 'center' },
  labelOn: { color: Brand.blue, fontWeight: '600' },
  line: { height: 1, marginHorizontal: 12, backgroundColor: '#B8C3D4' },
  lineP: { position: 'absolute', left: '62%', right: '-38%', top: 12, height: 1, backgroundColor: '#B8C3D4' },
});
