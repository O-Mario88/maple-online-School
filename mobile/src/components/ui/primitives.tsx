/**
 * Maple's basic building blocks: text, cards, rows, badges, buttons and
 * fields. Every value comes from the design tokens in constants/theme.
 */
import { type ReactNode, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ControlHeight, Maple, Radii, Space, TypeScale } from '@/constants/maple';
import { Elevation, Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import type { IconName } from '@/lib/icons';

/** The narrowest a row's text gets before its badge or buttons move below it. */
const ROW_TEXT_MIN = 120;

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
      {badge || onPress ? (
        <View style={styles.rowEnd}>
          {badge}
          {onPress ? <Icon name="chevronRight" size={16} color={theme.textMuted} /> : null}
        </View>
      ) : null}
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

/**
 * The one Maple button. Primary is solid Maple Blue; secondary is white with
 * a 1px blue outline and blue text; tertiary is blue text only; danger is for
 * destructive actions; accent is pale gold with navy text, for the one main action on a dark
 * Maple Blue surface such as a hero. All are 8px rounded rectangles, never pills.
 * `ghost` is the old name for tertiary.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger' | 'accent';
export type ButtonSize = 'standard' | 'compact' | 'large';

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
  variant?: ButtonVariant;
  icon?: IconName;
  /** Shorthand for size="compact". */
  compact?: boolean;
  size?: ButtonSize;
  /** Stretch to the width of its container. */
  block?: boolean;
  accessibilityHint?: string;
}

export function Button({
  label,
  onPress,
  disabled = false,
  busy = false,
  variant = 'primary',
  icon,
  compact = false,
  size,
  block = false,
  accessibilityHint,
}: ButtonProps) {
  const { styles } = useStyles(makeStyles);
  const kind = variant === 'ghost' ? 'tertiary' : variant;
  const scale = size ?? (compact ? 'compact' : 'standard');
  const inactive = disabled || busy;
  const textColor = disabled ? Maple.disabledText : kind === 'primary' || kind === 'danger' ? Maple.white : kind === 'accent' ? Maple.navy : Maple.blueText;
  return (
    <Pressable
      style={({ pressed, hovered, focused }: PressState) => [
        styles.button,
        scale === 'compact' && styles.buttonCompact,
        scale === 'large' && styles.buttonLarge,
        block && styles.buttonBlock,
        styles[kind],
        !inactive && (hovered || pressed) && styles[`${kind}Hover`],
        focused && styles.buttonFocus,
        disabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy }}>
      {busy ? <ActivityIndicator color={textColor} accessibilityLabel={`${label}, working`} /> : null}
      {!busy && icon ? <Icon name={icon} size={scale === 'compact' ? 16 : 18} color={textColor} /> : null}
      <Text style={[styles.buttonText, { color: textColor }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Pressable's style callback state, including web hover and focus. */
interface PressState {
  pressed: boolean;
  hovered?: boolean;
  focused?: boolean;
}

interface FieldProps extends TextInputProps {
  label: string;
  hint?: string;
}

export function Field({ label, hint, multiline, onFocus, onBlur, ...input }: FieldProps) {
  const { styles } = useStyles(makeStyles);
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...input}
        multiline={multiline}
        accessibilityLabel={label}
        accessibilityHint={hint}
        placeholderTextColor={Maple.muted}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[styles.input, multiline && styles.inputMultiline, focused && styles.inputFocus, input.editable === false && styles.inputDisabled]}
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
    // When the right-hand side (a badge, price or buttons) doesn't fit beside the text, it moves to its own line.
    row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.three, rowGap: Spacing.two, minHeight: 52, paddingVertical: Spacing.two },
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
    rowText: { flexGrow: 1, flexShrink: 1, flexBasis: ROW_TEXT_MIN, minWidth: 0, gap: 2 },
    rowEnd: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: Spacing.two,
      flexShrink: 1,
      marginLeft: 'auto',
    },
    rowTitle: { ...Type.bodyStrong, color: t.text },
    badge: { borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
    badgeText: { ...Type.caption },
    button: {
      minHeight: ControlHeight.standard,
      borderRadius: Radii.control,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      paddingHorizontal: Space.md,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    buttonCompact: { minHeight: ControlHeight.compact, paddingHorizontal: Space.sm },
    buttonLarge: { minHeight: ControlHeight.large, paddingHorizontal: Space.xl },
    buttonBlock: { alignSelf: 'stretch' },
    buttonText: { ...TypeScale.button },
    buttonFocus: Platform.select({ web: { outlineStyle: 'solid', outlineWidth: 2, outlineColor: Maple.blue, outlineOffset: 2 } as object, default: {} }),
    buttonDisabled: { backgroundColor: Maple.disabledSurface, borderColor: Maple.disabledBorder },
    primary: { backgroundColor: Maple.blue, borderColor: Maple.blue },
    primaryHover: { backgroundColor: Maple.blueHover, borderColor: Maple.blueHover },
    danger: { backgroundColor: Maple.error, borderColor: Maple.error },
    dangerHover: { backgroundColor: Maple.errorText, borderColor: Maple.errorText },
    accent: { backgroundColor: Maple.goldSoft, borderColor: Maple.goldSoft },
    accentHover: { backgroundColor: Maple.goldHover, borderColor: Maple.goldHover },
    secondary: { backgroundColor: Maple.surface, borderColor: Maple.blue },
    secondaryHover: { backgroundColor: Maple.blueSoft },
    tertiary: { backgroundColor: 'transparent', paddingHorizontal: Space.xs },
    tertiaryHover: { backgroundColor: Maple.blueSoft },
    field: { gap: Spacing.two },
    label: { ...TypeScale.label, color: Maple.navy },
    hint: { ...Type.caption, color: t.textMuted },
    input: {
      minHeight: ControlHeight.touch,
      borderWidth: 1,
      borderColor: Maple.borderStrong,
      borderRadius: Radii.control,
      paddingHorizontal: Space.sm,
      paddingVertical: Space.xs,
      ...TypeScale.body,
      color: Maple.navy,
      backgroundColor: Maple.surface,
    },
    inputFocus: { borderColor: Maple.blue, ...Platform.select({ web: { boxShadow: `0 0 0 3px ${Maple.blueSelected}` } as object, default: {} }) },
    inputDisabled: { backgroundColor: Maple.disabledSurface, color: Maple.disabledText },
    inputMultiline: { minHeight: 140 },
    error: { ...Type.small, color: t.danger },
    loading: { paddingVertical: Spacing.four, alignItems: 'center' },
  });
}
