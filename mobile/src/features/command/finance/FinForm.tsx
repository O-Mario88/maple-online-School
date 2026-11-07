import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Btn } from '@/features/portal/PortalParts';
import { BLUE, BODY, LINE, MUTED, NAVY, RED, WHITE } from '@/features/portal/tokens';

export interface Field {
  key: string;
  label: string;
  kind: 'text' | 'number' | 'choice';
  options?: readonly string[];
  placeholder?: string;
  initial?: string;
}

export interface FormAsk {
  title: string;
  body?: string;
  fields: readonly Field[];
  confirm: string;
  /** Returns an error to show, or nothing when it went through. */
  onSubmit: (values: Readonly<Record<string, string>>) => string | undefined;
}

const start = (fields: readonly Field[]) => Object.fromEntries(fields.map((f) => [f.key, f.initial ?? (f.kind === 'choice' ? (f.options?.[0] ?? '') : '')]));

/** A small form in a dialog: text, number and pick-one fields, with the error from the page's rules. */
export function FormModal({ ask, onClose }: { ask: FormAsk | null; onClose: () => void }) {
  return ask ? <Form key={ask.title} ask={ask} onClose={onClose} /> : null;
}

function Form({ ask, onClose }: { ask: FormAsk; onClose: () => void }) {
  const [values, setValues] = useState<Readonly<Record<string, string>>>(() => start(ask.fields));
  const [error, setError] = useState('');
  const set = (k: string, v: string) => {
    setValues((x) => ({ ...x, [k]: v }));
    setError('');
  };
  const submit = () => {
    const err = ask.onSubmit(values);
    if (err) return setError(err);
    onClose();
  };
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.box} accessibilityViewIsModal>
          <View style={styles.head}>
            <Text style={styles.title} accessibilityRole="header">
              {ask.title}
            </Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" hitSlop={10}>
              <Icon name="close" size={22} color={NAVY} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            {ask.body ? <Text style={styles.body}>{ask.body}</Text> : null}
            {ask.fields.map((f) => (
              <View key={f.key} style={styles.field}>
                <Text style={styles.label}>{f.label}</Text>
                {f.kind === 'choice' ? (
                  <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={f.label}>
                    {(f.options ?? []).map((o) => {
                      const on = values[f.key] === o;
                      return (
                        <Pressable key={o} style={[styles.chip, on && styles.chipOn]} onPress={() => set(f.key, o)} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={o}>
                          <Text style={[styles.chipText, on && styles.chipTextOn]}>{o}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : (
                  <TextInput
                    style={styles.input}
                    value={values[f.key]}
                    onChangeText={(v) => set(f.key, v)}
                    keyboardType={f.kind === 'number' ? 'numeric' : 'default'}
                    placeholder={f.placeholder}
                    placeholderTextColor={MUTED}
                    accessibilityLabel={f.label}
                  />
                )}
              </View>
            ))}
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </ScrollView>
          <View style={styles.btns}>
            <Btn label="Cancel" kind="outline" onPress={onClose} height={44} style={styles.flex} />
            <Pressable style={styles.confirm} onPress={submit} accessibilityRole="button" accessibilityLabel={ask.confirm}>
              <Text style={styles.confirmText}>{ask.confirm}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/** "12,500,000" or "12.5m" → 12500000; 0 when it is not a number. */
export function amount(v: string | undefined): number {
  const s = (v ?? '').trim().toLowerCase().replace(/,/g, '');
  const m = /^([\d.]+)\s*([kmb])?$/.exec(s);
  if (!m) return 0;
  const n = Number(m[1]);
  const scale = m[2] === 'b' ? 1e9 : m[2] === 'm' ? 1e6 : m[2] === 'k' ? 1e3 : 1;
  return Number.isFinite(n) ? Math.round(n * scale) : 0;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'rgba(10,20,50,0.45)' },
  box: { width: '100%', maxWidth: 520, maxHeight: '90%', gap: 12, padding: 20, borderRadius: 16, backgroundColor: WHITE },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { flex: 1, fontSize: 18, fontWeight: '800', color: NAVY },
  scroll: { gap: 12 },
  body: { fontSize: 13.5, lineHeight: 19, color: BODY },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: NAVY },
  input: { height: 44, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: LINE, fontSize: 14, color: NAVY },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 18, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  chipOn: { borderColor: BLUE, backgroundColor: '#EAF1FE' },
  chipText: { fontSize: 12.5, color: NAVY },
  chipTextOn: { fontWeight: '700', color: BLUE },
  error: { fontSize: 13, lineHeight: 18, color: RED },
  btns: { flexDirection: 'row', gap: 10 },
  confirm: { flex: 1, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: BLUE },
  confirmText: { fontSize: 15, fontWeight: '700', color: WHITE },
});
