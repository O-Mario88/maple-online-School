/**
 * Small building blocks shared by every screen, so spacing, type and colour
 * stay consistent. Colours come from the theme (light and dark).
 */
import { type ReactNode, useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Theme = ReturnType<typeof useTheme>;

function useStyles() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return { theme, styles };
}

export function Screen({ children }: { children: ReactNode }) {
  const { styles } = useStyles();
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Heading({ children }: { children: ReactNode }) {
  const { styles } = useStyles();
  return (
    <Text style={styles.heading} accessibilityRole="header">
      {children}
    </Text>
  );
}

export function Body({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  const { styles } = useStyles();
  return <Text style={muted ? styles.muted : styles.body}>{children}</Text>;
}

interface CardProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function Card({ title, action, children }: CardProps) {
  const { styles } = useStyles();
  return (
    <View style={styles.card}>
      {title || action ? (
        <View style={styles.cardHeader}>
          {title ? <Text style={styles.cardTitle}>{title}</Text> : <View />}
          {action}
        </View>
      ) : null}
      {children}
    </View>
  );
}

interface RowProps {
  title: string;
  detail?: string;
  badge?: ReactNode;
  onPress?: () => void;
  accessibilityHint?: string;
}

export function Row({ title, detail, badge, onPress, accessibilityHint }: RowProps) {
  const { styles } = useStyles();
  const content = (
    <>
      <View style={styles.rowText}>
        <Text style={styles.body}>{title}</Text>
        {detail ? <Text style={styles.muted}>{detail}</Text> : null}
      </View>
      {badge}
    </>
  );
  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={detail ? `${title}, ${detail}` : title}
      accessibilityHint={accessibilityHint}>
      {content}
    </Pressable>
  );
}

export type BadgeTone = 'neutral' | 'accent' | 'good';

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  const { styles } = useStyles();
  const toneStyle = tone === 'accent' ? styles.badgeAccent : tone === 'good' ? styles.badgeGood : styles.badgeNeutral;
  const textStyle = tone === 'accent' ? styles.badgeTextAccent : styles.badgeText;
  return (
    <View style={[styles.badge, toneStyle]}>
      <Text style={textStyle}>{label}</Text>
    </View>
  );
}

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onPress, disabled = false, busy = false, variant = 'primary' }: ButtonProps) {
  const { theme, styles } = useStyles();
  const primary = variant === 'primary';
  const inactive = disabled || busy;
  return (
    <Pressable
      style={({ pressed }) => [primary ? styles.primary : styles.secondary, (inactive || pressed) && styles.dim]}
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy }}>
      {busy ? (
        <ActivityIndicator color={primary ? theme.onAccent : theme.text} />
      ) : (
        <Text style={primary ? styles.primaryText : styles.secondaryText}>{label}</Text>
      )}
    </Pressable>
  );
}

interface FieldProps extends TextInputProps {
  label: string;
}

export function Field({ label, multiline, ...input }: FieldProps) {
  const { theme, styles } = useStyles();
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...input}
        multiline={multiline}
        accessibilityLabel={label}
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, multiline && styles.inputMultiline]}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

export function ErrorText({ message }: { message: string | null | undefined }) {
  const { styles } = useStyles();
  if (!message) return null;
  return (
    <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
      {message}
    </Text>
  );
}

export function Loading({ label }: { label: string }) {
  const { theme, styles } = useStyles();
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={theme.accent} accessibilityLabel={label} />
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    container: { padding: Spacing.four, gap: Spacing.three, maxWidth: 640, width: '100%', alignSelf: 'center' },
    heading: { fontSize: 28, fontWeight: '700', color: t.text, letterSpacing: -0.5 },
    body: { fontSize: 17, color: t.text },
    muted: { fontSize: 15, color: t.textSecondary },
    card: {
      backgroundColor: t.backgroundElement,
      borderColor: t.border,
      borderWidth: 1,
      borderRadius: 16,
      padding: Spacing.three,
      gap: Spacing.two,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
    cardTitle: { fontSize: 15, fontWeight: '600', color: t.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
    row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, minHeight: 48, paddingVertical: Spacing.one },
    rowText: { flex: 1, gap: 2 },
    pressed: { opacity: 0.6 },
    badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
    badgeNeutral: { backgroundColor: t.backgroundSelected },
    badgeAccent: { backgroundColor: t.accent },
    badgeGood: { backgroundColor: t.backgroundSelected, borderWidth: 1, borderColor: t.accent },
    badgeText: { fontSize: 13, fontWeight: '600', color: t.text },
    badgeTextAccent: { fontSize: 13, fontWeight: '600', color: t.onAccent },
    primary: {
      minHeight: 52,
      borderRadius: 12,
      backgroundColor: t.accent,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.four,
    },
    primaryText: { color: t.onAccent, fontSize: 17, fontWeight: '600' },
    secondary: {
      minHeight: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.border,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.three,
    },
    secondaryText: { color: t.text, fontSize: 16, fontWeight: '600' },
    dim: { opacity: 0.6 },
    field: { gap: Spacing.two },
    label: { fontSize: 15, fontWeight: '600', color: t.text },
    input: {
      minHeight: 48,
      borderWidth: 1,
      borderColor: t.border,
      borderRadius: 12,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
      fontSize: 17,
      color: t.text,
      backgroundColor: t.background,
    },
    inputMultiline: { minHeight: 140 },
    error: { color: t.danger, fontSize: 15 },
    loading: { paddingVertical: Spacing.four, alignItems: 'center' },
  });
}
