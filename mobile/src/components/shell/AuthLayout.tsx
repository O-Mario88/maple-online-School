import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { Breakpoints, Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import type { IconName } from '@/lib/icons';

import { BrandMark } from './BrandMark';

const PROMISES: readonly { icon: IconName; title: string; body: string }[] = [
  { icon: 'live', title: 'Live and recorded lessons', body: 'Classes that keep going on any connection.' },
  { icon: 'map', title: 'Uganda’s curriculum built in', body: 'Nursery to A-Level, ready on day one.' },
  { icon: 'wallet', title: 'Fees by mobile money', body: 'Families pay in one tap and get a receipt.' },
];

/** The signed-out frame: a brand panel beside the form on wide screens. */
export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const { theme, styles } = useStyles(makeStyles);
  const { width } = useWindowDimensions();
  const wide = width >= Breakpoints.wide;

  return (
    <SafeAreaView style={[styles.safe, wide && styles.row]}>
      {wide ? (
        <View style={styles.panel}>
          <View style={styles.brandRow}>
            <BrandMark size={40} />
            <Text style={styles.brandName}>Maple Global Online School</Text>
          </View>
          <View style={styles.pitch}>
            <Text style={styles.headline}>One school, every device, every family.</Text>
            {PROMISES.map((p) => (
              <View key={p.title} style={styles.promise}>
                <View style={styles.promiseIcon}>
                  <Icon name={p.icon} size={20} color={theme.accent} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.promiseTitle}>{p.title}</Text>
                  <Text style={styles.promiseBody}>{p.body}</Text>
                </View>
              </View>
            ))}
          </View>
          <Text style={styles.footnote}>© Maple Global Online School</Text>
        </View>
      ) : null}
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.formWrap} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            {wide ? null : (
              <View style={styles.brandRowSmall}>
                <BrandMark size={36} />
                <Text style={styles.brandNameSmall}>Maple</Text>
              </View>
            )}
            <View style={styles.heading}>
              <Text style={styles.title} accessibilityRole="header">
                {title}
              </Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    row: { flexDirection: 'row' },
    flex: { flex: 1 },
    panel: {
      width: '42%',
      maxWidth: 560,
      backgroundColor: t.sidebar,
      padding: Spacing.six,
      paddingVertical: Spacing.five,
      justifyContent: 'space-between',
    },
    brandRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
    brandName: { ...Type.heading, color: t.sidebarText },
    pitch: { gap: Spacing.four },
    headline: { ...Type.display, fontSize: 36, lineHeight: 44, color: t.sidebarText, marginBottom: Spacing.two },
    promise: { flexDirection: 'row', gap: Spacing.three, alignItems: 'flex-start' },
    promiseIcon: {
      width: 40,
      height: 40,
      borderRadius: Radius.md,
      backgroundColor: t.sidebarElement,
      alignItems: 'center',
      justifyContent: 'center',
    },
    promiseTitle: { ...Type.bodyStrong, color: t.sidebarText },
    promiseBody: { ...Type.small, color: t.sidebarMuted },
    footnote: { ...Type.caption, color: t.sidebarMuted },
    formWrap: { flexGrow: 1, justifyContent: 'center', padding: Spacing.four },
    form: { width: '100%', maxWidth: 420, alignSelf: 'center', gap: Spacing.three },
    brandRowSmall: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.three },
    brandNameSmall: { ...Type.title, color: t.text },
    heading: { gap: Spacing.one, marginBottom: Spacing.two },
    title: { ...Type.title, fontSize: 28, lineHeight: 36, color: t.text },
    subtitle: { ...Type.body, color: t.textSecondary },
  });
}
