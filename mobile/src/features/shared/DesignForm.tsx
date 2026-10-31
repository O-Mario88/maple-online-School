import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

/** The designed pages' form pieces: white cards, pill choices, labelled inputs and a blue button. */
export const FORM = { ink: '#0B1424', body: '#4A5263', blue: '#1463F3', line: '#E6EBF2' } as const;

export function FormCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function FormLabel({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function Choices({ children }: { children: ReactNode }) {
  return (
    <View style={styles.choices} accessibilityRole="radiogroup">
      {children}
    </View>
  );
}

export function Choice({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.choice, on && styles.choiceOn]} onPress={onPress} accessibilityRole="radio" accessibilityState={{ checked: on }}>
      <Text style={[styles.choiceText, on && styles.choiceTextOn]}>{label}</Text>
    </Pressable>
  );
}

export function Input({ label, ...props }: { label: string } & ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <FormLabel>{label}</FormLabel>
      <TextInput style={styles.input} placeholderTextColor="#8A92A3" accessibilityLabel={label} {...props} />
    </View>
  );
}

export function FormRow({ children }: { children: ReactNode }) {
  return <View style={styles.pair}>{children}</View>;
}

export function FormMessage({ text, good = false }: { text: string | null | undefined; good?: boolean }) {
  if (!text) return null;
  return (
    <Text style={good ? styles.good : styles.error} accessibilityLiveRegion="polite">
      {text}
    </Text>
  );
}

export function PrimaryButton({ label, busy = false, onPress }: { label: string; busy?: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.primary, busy && styles.busy]} onPress={onPress} disabled={busy} accessibilityRole="button" accessibilityState={{ busy }}>
      {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>{label}</Text>}
    </Pressable>
  );
}

export function OutlineButton({ label, onPress, accessibilityLabel }: { label: string; onPress: () => void; accessibilityLabel?: string }) {
  return (
    <Pressable style={styles.outline} onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? label}>
      <Text style={styles.outlineText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: FORM.line, backgroundColor: '#FFFFFF' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: FORM.ink },
  label: { fontSize: 12.5, fontWeight: '600', color: FORM.ink },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: '#CFDAEC' },
  choiceOn: { borderColor: FORM.blue, backgroundColor: '#E8F0FE' },
  choiceText: { fontSize: 13, color: FORM.ink },
  choiceTextOn: { color: FORM.blue, fontWeight: '700' },
  pair: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  field: { flexGrow: 1, flexBasis: 200, gap: 4 },
  input: { height: 42, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#DCE3EE', fontSize: 14, color: FORM.ink, backgroundColor: '#FFFFFF' },
  error: { fontSize: 12.5, color: '#B42318' },
  good: { fontSize: 12.5, color: '#15803D' },
  primary: { height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: FORM.blue },
  busy: { opacity: 0.7 },
  primaryText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  outline: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 7, borderWidth: 1, borderColor: '#CFDAEC' },
  outlineText: { fontSize: 12.5, fontWeight: '700', color: FORM.blue },
});
