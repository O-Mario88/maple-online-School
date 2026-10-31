/**
 * A page: safe areas, scrolling, a readable content width and the page
 * header (back link, eyebrow, title, subtitle and actions).
 */
import { router } from 'expo-router';
import { createContext, type ReactNode, useContext } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { MaxContentWidth, Spacing, type Theme, Type } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useSwitcher } from '@/lib/switcher-context';

export interface ShellState {
  /** True inside the signed-in app shell (sidebar or tab bar). */
  inShell: boolean;
  /** True when the sidebar is showing. */
  wide: boolean;
}

export const ShellContext = createContext<ShellState>({ inShell: false, wide: false });

export function useShell(): ShellState {
  return useContext(ShellContext);
}

interface ScreenProps {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  /** Shows a Back link above the title. */
  back?: boolean;
  actions?: ReactNode;
  width?: 'narrow' | 'wide';
  children: ReactNode;
}

const NARROW_WIDTH = 720;

export function Screen({ title, subtitle, eyebrow, back = false, actions, width = 'narrow', children }: ScreenProps) {
  const { styles } = useStyles(makeStyles);
  const shell = useShell();
  // In the shell the tab bar owns the bottom inset and the sidebar the left.
  const edges: Edge[] = shell.inShell ? (shell.wide ? ['top', 'right'] : ['top', 'left', 'right']) : ['top', 'left', 'right', 'bottom'];
  const maxWidth = width === 'wide' ? MaxContentWidth : NARROW_WIDTH;
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <ScrollView
        contentContainerStyle={[styles.container, shell.wide && styles.containerWide, { maxWidth }]}
        keyboardShouldPersistTaps="handled">
        {back || title ? (
          <PageHeader title={title} subtitle={subtitle} eyebrow={eyebrow} back={back} actions={actions} />
        ) : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  back?: boolean;
  actions?: ReactNode;
}

/** The current mode with a swap arrow; opens the role and school switcher. Renders nothing outside the app shell. */
export function ModeButton({ onDark = false }: { onDark?: boolean }) {
  const { theme, styles } = useStyles(makeStyles);
  const switcher = useSwitcher();
  if (!switcher) return null;
  return (
    <Pressable
      onPress={switcher.open}
      style={({ hovered }) => [styles.mode, onDark && styles.modeDark, hovered && styles.modeHover]}
      accessibilityRole="button"
      accessibilityLabel={`${switcher.label}. Switch mode`}>
      <Text style={[styles.modeText, onDark && styles.modeTextDark]} numberOfLines={1}>
        {switcher.label}
      </Text>
      <Icon name="swap" size={15} color={onDark ? theme.sidebarText : theme.accentText} />
    </Pressable>
  );
}

export function PageHeader({ title, subtitle, eyebrow, back, actions }: PageHeaderProps) {
  const { theme, styles } = useStyles(makeStyles);
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));
  return (
    <View style={styles.header}>
      {back ? (
        <Pressable
          onPress={goBack}
          style={({ hovered }) => [styles.back, hovered && styles.backHover]}
          accessibilityRole="link"
          accessibilityLabel="Back"
          hitSlop={8}>
          <Icon name="chevronLeft" size={16} color={theme.textSecondary} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      ) : null}
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          {title ? (
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
          ) : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.actions}>
          <ModeButton />
          {actions}
        </View>
      </View>
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    container: {
      padding: Spacing.three,
      paddingBottom: Spacing.six,
      gap: Spacing.four,
      width: '100%',
      alignSelf: 'center',
    },
    containerWide: { paddingHorizontal: Spacing.five, paddingTop: Spacing.five },
    header: { gap: Spacing.two },
    back: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.one,
      alignSelf: 'flex-start',
      paddingVertical: Spacing.one,
      paddingRight: Spacing.two,
      borderRadius: 6,
    },
    backHover: { backgroundColor: t.backgroundSelected },
    backText: { ...Type.small, fontWeight: '600', color: t.textSecondary },
    titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', gap: Spacing.three },
    titleBlock: { flexGrow: 1, flexShrink: 1, flexBasis: 280, gap: Spacing.one },
    eyebrow: { ...Type.overline, color: t.accentText },
    title: { ...Type.display, color: t.text },
    subtitle: { ...Type.body, color: t.textSecondary },
    actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.two },
    mode: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, maxWidth: 240, minHeight: 36, paddingHorizontal: Spacing.three, borderRadius: 999, borderWidth: 1, borderColor: t.border, backgroundColor: t.backgroundElement },
    modeDark: { alignSelf: 'stretch', justifyContent: 'space-between', borderRadius: 10, borderColor: t.sidebarElement, backgroundColor: t.sidebarElement },
    modeHover: { opacity: 0.85 },
    modeText: { ...Type.small, fontWeight: '600', color: t.accentText, flexShrink: 1 },
    modeTextDark: { color: t.sidebarText },
  });
}
