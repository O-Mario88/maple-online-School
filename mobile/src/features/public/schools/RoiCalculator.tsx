import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { formatMoney } from '@/lib/finance/fees';
import { estimateRoi, type RoiEstimate } from '@/lib/roi';
import type { MockData } from '@/mock';

import { Brand } from '../palette';

type Roi = MockData['publicPages']['schoolsPage']['roi'];

const NAVY = '#0B1E4D';
const DEFAULT_STUDENTS = '300';

/** Students, curriculum and subjects in; the year-one estimate out. */
export function RoiCalculator({ roi }: { roi: Roi }) {
  const [students, setStudents] = useState(DEFAULT_STUDENTS);
  const [curriculum, setCurriculum] = useState(roi.curricula[0]);
  const [picking, setPicking] = useState(false);
  const [subjects, setSubjects] = useState<readonly string[]>(roi.defaultSubjects);
  const [estimate, setEstimate] = useState<RoiEstimate>(() => estimateRoi(Number(DEFAULT_STUDENTS), roi.defaultSubjects.length));

  const toggle = (s: string) => setSubjects((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  const calculate = () => setEstimate(estimateRoi(Number(students), subjects.length));

  const lines = [
    { value: estimate.improvement, label: 'Expected improvement in exam results', icon: 'chart' as const, tint: Brand.green },
    { value: formatMoney(estimate.costSavedUGX, 'UGX'), label: 'Estimated cost vs. traditional tuition', icon: 'school' as const, tint: Brand.blue },
    { value: formatMoney(estimate.valueUGX, 'UGX'), label: 'Potential value (improved results, retention and reputation)', icon: 'book' as const, tint: Brand.purple },
    { value: `${estimate.multiple.toFixed(1)}×`, label: 'Estimated return on investment', icon: 'star' as const, tint: Brand.amber },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.title} accessibilityRole="header">
        ROI Calculator
      </Text>
      <Text style={styles.sub}>See the potential impact for your school</Text>

      <Text style={styles.label}>Number of students</Text>
      <View style={styles.field}>
        <Icon name="people" size={16} color={Brand.body} />
        <TextInput style={styles.input} value={students} onChangeText={(t) => setStudents(t.replace(/\D/g, ''))} keyboardType="number-pad" accessibilityLabel="Number of students" />
      </View>

      <Text style={styles.label}>Curriculum</Text>
      <Pressable style={styles.field} onPress={() => setPicking((p) => !p)} accessibilityRole="button" accessibilityState={{ expanded: picking }}>
        <Text style={styles.input}>{curriculum}</Text>
        <Icon name="chevronDown" size={16} color={Brand.body} />
      </Pressable>
      {picking ? (
        <View style={styles.menu}>
          {roi.curricula.map((c) => (
            <Pressable
              key={c}
              style={styles.menuItem}
              onPress={() => {
                setCurriculum(c);
                setPicking(false);
              }}
              accessibilityRole="menuitem">
              <Text style={[styles.menuText, c === curriculum && styles.menuTextOn]}>{c}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <Text style={styles.label}>{`Subjects (${subjects.length})`}</Text>
      <View style={styles.subjects}>
        {roi.subjects.map((s) => {
          const on = subjects.includes(s);
          return (
            <Pressable key={s} style={[styles.subject, on && styles.subjectOn]} onPress={() => toggle(s)} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
              <Text style={[styles.subjectText, on && styles.subjectTextOn]}>{s}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.calculate} onPress={calculate} accessibilityRole="button">
        <Text style={styles.calculateText}>Calculate ROI</Text>
      </Pressable>

      <View style={styles.impact} accessibilityLiveRegion="polite">
        <Text style={styles.impactTitle}>Estimated Impact (Year 1)</Text>
        {lines.map((l) => (
          <View key={l.label} style={styles.line}>
            <View style={[styles.lineIcon, { backgroundColor: `${l.tint}1A` }]}>
              <Icon name={l.icon} size={18} color={l.tint} />
            </View>
            <View style={styles.flexShrink}>
              <Text style={[styles.lineValue, { color: l.tint }]}>{l.value}</Text>
              <Text style={styles.lineLabel}>{l.label}</Text>
            </View>
          </View>
        ))}
        <Text style={styles.footnote}>Estimates based on pilot schools; your results will vary.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flexShrink: { flexShrink: 1 },
  card: { gap: 6, padding: 14, borderRadius: 12, backgroundColor: NAVY },
  title: { fontSize: 17, fontWeight: '800', color: Brand.surface },
  sub: { fontSize: 10.5, color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  label: { fontSize: 11, color: Brand.surface, marginTop: 6 },
  field: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 34, paddingHorizontal: 11, borderRadius: 6, backgroundColor: Brand.surface },
  input: { flex: 1, fontSize: 12, color: Brand.ink, minHeight: 32, lineHeight: 32 },
  menu: { borderRadius: 8, backgroundColor: Brand.surface, overflow: 'hidden' },
  menuItem: { paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Brand.line },
  menuText: { fontSize: 13, color: Brand.ink },
  menuTextOn: { color: Brand.blue, fontWeight: '700' },
  subjects: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  subject: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  subjectOn: { backgroundColor: Brand.surface, borderColor: Brand.surface },
  subjectText: { fontSize: 10.5, color: Brand.surface },
  subjectTextOn: { color: Brand.blue, fontWeight: '700' },
  calculate: { alignItems: 'center', justifyContent: 'center', minHeight: 44, borderRadius: 8, backgroundColor: Brand.blue, marginTop: 10 },
  calculateText: { fontSize: 12.5, fontWeight: '700', color: Brand.surface },
  impact: { gap: 10, padding: 12, borderRadius: 12, backgroundColor: Brand.surface, marginTop: 8 },
  impactTitle: { fontSize: 11, fontWeight: '600', color: Brand.blue, backgroundColor: Brand.blueSoft, marginHorizontal: -12, marginTop: -12, paddingHorizontal: 12, paddingVertical: 10, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  lineIcon: { width: 30, height: 30, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  lineValue: { fontSize: 12.5, fontWeight: '800' },
  lineLabel: { fontSize: 9, color: Brand.body },
  footnote: { fontSize: 10, color: Brand.muted },
});
