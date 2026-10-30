import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import type { IconName } from '@/lib/icons';
import { calculate } from '@/lib/past-paper';

import { Brand, CARD_SHADOW } from '../palette';

type Tab = 'tools' | 'formulae' | 'calculator';

const TOOLS: readonly { label: string; icon: IconName }[] = [
  { label: 'Graphing Calculator', icon: 'chart' },
  { label: 'Scientific Calculator', icon: 'grid' },
  { label: 'Draw / Sketch', icon: 'notes' },
  { label: 'Ruler', icon: 'map' },
  { label: 'Protractor', icon: 'clock' },
  { label: 'Equation Solver', icon: 'sparkle' },
  { label: 'Formula Sheet', icon: 'book' },
  { label: 'Undo', icon: 'chevronLeft' },
  { label: 'Redo', icon: 'chevronRight' },
];
const KEYS = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '-', '0', '.', '(', '+', ')', 'C', '⌫', '='] as const;

function Calculator() {
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const press = (k: (typeof KEYS)[number]) => {
    if (k === 'C') {
      setExpr('');
      setResult(null);
    } else if (k === '⌫') setExpr((e) => e.slice(0, -1));
    else if (k === '=') {
      const v = calculate(expr);
      setResult(v === null ? 'Check the sum' : String(v));
    } else setExpr((e) => e + k);
  };
  return (
    <View style={styles.calc}>
      <TextInput style={styles.screen} value={expr} onChangeText={setExpr} placeholder="6 × 6 + 8 × 8" placeholderTextColor={Brand.muted} accessibilityLabel="Calculator input" />
      {result !== null ? <Text style={styles.result} accessibilityLiveRegion="polite">{`= ${result}`}</Text> : null}
      <View style={styles.keys}>
        {KEYS.map((k) => (
          <Pressable key={k} style={[styles.key, k === '=' && styles.keyEquals]} onPress={() => press(k)} accessibilityRole="button" accessibilityLabel={k === '⌫' ? 'Delete' : k}>
            <Text style={[styles.keyText, k === '=' && styles.keyEqualsText]}>{k}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** Tools, the paper's formula sheet, and a calculator. */
export function ToolsCard({ formulae }: { formulae: readonly string[] }) {
  const [tab, setTab] = useState<Tab>('tools');
  const tabs: { key: Tab; label: string }[] = [
    { key: 'tools', label: 'Tools' },
    { key: 'formulae', label: 'Formulae' },
    { key: 'calculator', label: 'Calculator' },
  ];
  return (
    <View style={styles.card}>
      <View style={styles.tabs} accessibilityRole="tablist">
        {tabs.map((t) => {
          const on = t.key === tab;
          return (
            <Pressable key={t.key} style={[styles.tab, on && styles.tabOn]} onPress={() => setTab(t.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
              <Text style={[styles.tabText, on && styles.tabTextOn]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {tab === 'tools' ? (
        <View style={styles.grid}>
          {TOOLS.map((t) => (
            <Pressable key={t.label} style={styles.tool} onPress={t.label === 'Formula Sheet' ? () => setTab('formulae') : t.label.includes('Calculator') ? () => setTab('calculator') : undefined} accessibilityRole="button">
              <Icon name={t.icon} size={22} color={Brand.purple} />
              <Text style={styles.toolText}>{t.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {tab === 'formulae' ? (
        <View style={styles.formulae}>
          {formulae.map((f) => (
            <Text key={f} style={styles.formula}>
              {f}
            </Text>
          ))}
        </View>
      ) : null}
      {tab === 'calculator' ? <Calculator /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12, padding: 14, borderRadius: 14, backgroundColor: Brand.surface, ...CARD_SHADOW },
  tabs: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 10, backgroundColor: Brand.canvas },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8 },
  tabOn: { backgroundColor: Brand.surface },
  tabText: { fontSize: 13, color: Brand.body },
  tabTextOn: { color: Brand.blue, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tool: { width: '31%', flexGrow: 1, alignItems: 'center', gap: 6, paddingVertical: 14, paddingHorizontal: 4, borderRadius: 10, borderWidth: 1, borderColor: Brand.line },
  toolText: { fontSize: 11, color: Brand.body, textAlign: 'center' },
  formulae: { gap: 8 },
  formula: { fontSize: 14, color: Brand.ink, padding: 10, borderRadius: 8, backgroundColor: Brand.canvas },
  calc: { gap: 8 },
  screen: { minHeight: 44, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: Brand.line, fontSize: 18, color: Brand.ink, textAlign: 'right' },
  result: { fontSize: 22, fontWeight: '800', color: Brand.blue, textAlign: 'right' },
  keys: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  key: { width: '23%', flexGrow: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8, backgroundColor: Brand.canvas },
  keyEquals: { backgroundColor: Brand.blue },
  keyText: { fontSize: 16, fontWeight: '600', color: Brand.ink },
  keyEqualsText: { color: Brand.surface },
});
