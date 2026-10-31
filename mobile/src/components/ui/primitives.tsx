/**
 * Maple's basic building blocks: text, cards, rows, badges, buttons and
 * fields. Every value comes from the design tokens in constants/theme.
 */
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Elevation, Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import type { IconName } from '@/lib/icons';

export function Heading({ children }: { children: ReactNode }) {
  const { styles } = useStyles(makeStyles);
  return (
    <Text style={styles.heading} accessibilityRole="header">
      {children}
    </Text>
  );
}

export function Body({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  const { styles } = useStyles(makeStyles);
  return <Text style={muted ? styles.muted : styles.body}>{children}</Text>;
}

export function Overline({ children }: { children: ReactNode }) {
  const { styles } = useStyles(makeStyles);
  return <Text style={styles.overline}>{children}</Text>;
}

interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: IconName;
  action?: ReactNode;
  children: ReactNode;
}

export function Card({ title, subtitle, icon, action, children }: CardProps) {
  const { theme, styles } = useStyles(makeStyles);
  const hasHeader = Boolean(title || action);
  return (
    <View style={styles.card}>
      {hasHeader ? (
        <View style={styles.cardHeader}>
          <View style={styles.cardHeading}>
            {icon ? (
              <View style={styles.cardIcon}>
                <Icon name={icon} size={18} color={theme.accentText} />
              </View>
            ) : null}
            <View style={styles.flex}>
              {title ? (
                <Text style={styles.cardTitle} accessibilityRole="header">
                  {title}
                </Text>
              ) : null}
              {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
            </View>
          </View>
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
  icon?: IconName;
  badge?: ReactNode;
  onPress?: () => void;
  accessibilityHint?: string;
}

export function Row({ title, detail, icon, badge, onPress, accessibilityHint }: RowProps) {
  const { theme, styles } = useStyles(makeStyles);
  const content = (
    <>
      {icon ? (
        <View style={styles.rowIcon}>
          <Icon name={icon} size={18} color={theme.textSecondary} />
        </View>
      ) : null}
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        {detail ? <Text style={styles.muted}>{detail}</Text> : null}
      </View>
      {badge}
      {onPress ? <Icon name="chevronRight" size={16} color={theme.textMuted} /> : null}
    </>
  );
  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }
  return (
    <Pressable
      style={({ pressed, hovered }) => [styles.row, styles.rowPressable, (hovered || pressed) && styles.rowHover]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={detail ? `${title}, ${detail}` : title}
      accessibilityHint={accessibilityHint}>
      {content}
    </Pressable>
  );
}

export type BadgeTone = 'neutral' | 'accent' | 'good' | 'warning' | 'danger' | 'info';

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  const { theme, styles } = useStyles(makeStyles);
  const [background, color] = badgeColors(theme, tone);
  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function badgeColors(t: Theme, tone: BadgeTone): [string, string] {
  switch (tone) {
    case 'accent':
      return [t.accentSoft, t.accentText];
    case 'good':
      return [t.successSoft, t.success];
    case 'warning':
      return [t.warningSoft, t.warning];
    case 'danger':
      return [t.dangerSoft, t.danger];
    case 'info':
      return [t.infoSoft, t.info];
    default:
      return [t.backgroundSelected, t.textSecondary];
  }
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
  variant?: ButtonVariant;
  icon?: IconName;
  compact?: boolean;
}

export function Button({ label, onPress, disabled = false, busy = false, variant = 'primary', icon, compact = false }: ButtonProps) {
  const { theme, styles } = useStyles(makeStyles);
  const inactive = disabled || busy;
  const filled = variant === 'primary' || variant === 'danger';
  const textColor = filled ? theme.onAccent : variant === 'ghost' ? theme.accentText : theme.text;
  return (
    <Pressable
      style={({ pressed, hovered }) => [
        styles.button,
        compact && styles.buttonCompact,
        styles[variant],
        hovered && !inactive && styles[`${variant}Hover`],
        (inactive || pressed) && styles.dim,
      ]}
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy }}>
      {busy ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={18} color={textColor} /> : null}
          <Text style={[styles.buttonText, compact && styles.buttonTextCompact, { color: textColor }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

interface FieldProps extends TextInputProps {
  label: string;
  hint?: string;
}

export function Field({ label, hint, multiline, ...input }: FieldProps) {
  const { theme, styles } = useStyles(makeStyles);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...input}
        multiline={multiline}
        accessibilityLabel={label}
        accessibilityHint={hint}
        placeholderTextColor={theme.textMuted}
        style={[styles.input, multiline && styles.inputMultiline]}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function ErrorText({ message }: { message: string | null | undefined }) {
  const { styles } = useStyles(makeStyles);
  if (!message) return null;
  return (
    <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
      {message}
    </Text>
  );
}

export function Loading({ label }: { label: string }) {
  const { theme, styles } = useStyles(makeStyles);
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={theme.accent} accessibilityLabel={label} />
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    flex: { flex: 1 },
    heading: { ...Type.title, color: t.text },
    body: { ...Type.body, color: t.text },
    muted: { ...Type.small, color: t.textSecondary },
    overline: { ...Type.overline, color: t.textMuted },
    card: {
      flexGrow: 1,
      backgroundColor: t.backgroundElement,
      borderColor: t.border,
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderRadius: Radius.lg,
      padding: Spacing.four,
      gap: Spacing.three,
      ...Elevation.card,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.three },
    cardHeading: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, flex: 1 },
    cardIcon: {
      width: 36,
      height: 36,
      borderRadius: Radius.md,
      backgroundColor: t.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardTitle: { ...Type.heading, color: t.text },
    cardSubtitle: { ...Type.small, color: t.textSecondary },
    row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, minHeight: 52, paddingVertical: Spacing.two },
    rowPressable: { marginHorizontal: -Spacing.two, paddingHorizontal: Spacing.two, borderRadius: Radius.md },
    rowHover: { backgroundColor: t.backgroundSelected },
    rowIcon: {
      width: 32,
      height: 32,
      borderRadius: Radius.sm,
      backgroundColor: t.backgroundSelected,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowText: { flex: 1, gap: 2 },
    rowTitle: { ...Type.bodyStrong, color: t.text },
    badge: { borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
    badgeText: { ...Type.caption },
    button: {
      minHeight: 48,
      borderRadius: Radius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      paddingHorizontal: Spacing.four,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    buttonCompact: { minHeight: 40, paddingHorizontal: Spacing.three },
    buttonText: { ...Type.bodyStrong },
    buttonTextCompact: { ...Type.small, fontWeight: '600' },
    primary: { backgroundColor: t.accent },
    primaryHover: { backgroundColor: t.accentHover },
    danger: { backgroundColor: t.danger },
    dangerHover: { opacity: 0.9 },
    secondary: { backgroundColor: t.backgroundElement, borderColor: t.borderStrong },
    secondaryHover: { backgroundColor: t.backgroundSelected },
    ghost: { backgroundColor: 'transparent' },
    ghostHover: { backgroundColor: t.accentSoft },
    dim: { opacity: 0.6 },
    field: { gap: Spacing.two },
    label: { ...Type.small, fontWeight: '600', color: t.text },
    hint: { ...Type.caption, color: t.textMuted },
    input: {
      minHeight: 48,
      borderWidth: 1,
      borderColor: t.borderStrong,
      borderRadius: Radius.md,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
      ...Type.body,
      color: t.text,
      backgroundColor: t.backgroundElement,
    },
    inputMultiline: { minHeight: 140 },
    error: { ...Type.small, color: t.danger },
    loading: { paddingVertical: Spacing.four, alignItems: 'center' },
  });
}
