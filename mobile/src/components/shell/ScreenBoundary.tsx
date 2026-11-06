/**
 * Error boundaries that keep Maple standing. `ScreenBoundary` wraps each screen
 * inside the signed-in Stack, so a crash replaces only that page: the shell,
 * the menus and every other open page stay mounted. `RootErrorBoundary` is the
 * last resort for a crash outside a screen (the root layout exports it).
 */
import type { ErrorBoundaryProps } from 'expo-router';
import { router } from 'expo-router';
import { Component, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/primitives';
import { Maple, Radii, Space, TypeScale } from '@/constants/maple';
import { errorCopy } from '@/lib/error-copy';

interface FallbackProps {
  error: unknown;
  onRetry: () => void;
}

/** The card shown in place of a page that threw while rendering. */
export function PageError({ error, onRetry }: FallbackProps) {
  const copy = errorCopy(error, __DEV__);
  return (
    <View style={s.page} accessibilityRole="alert">
      <View style={s.card}>
        <View style={s.icon}>
          <Icon name="alert" size={24} color={Maple.errorText} />
        </View>
        <Text style={s.title} accessibilityRole="header">
          {copy.title}
        </Text>
        <Text style={s.body}>{copy.body}</Text>
        {copy.detail ? (
          <Text style={s.detail} selectable>
            {copy.detail}
          </Text>
        ) : null}
        <View style={s.actions}>
          <Button label="Try again" icon="restart" onPress={onRetry} />
          <Button label="Go to Home" variant="secondary" icon="home" onPress={() => router.replace('/')} />
        </View>
      </View>
    </View>
  );
}

interface BoundaryState {
  error: unknown;
}

/** Wraps one screen. A class component, because React only catches render errors in classes. */
export class ScreenBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): BoundaryState {
    return { error };
  }

  retry = () => this.setState({ error: null });

  render() {
    if (this.state.error) return <PageError error={this.state.error} onRetry={this.retry} />;
    return this.props.children;
  }
}

/** Expo Router's boundary for the root layout: a crash in the shell itself. */
export function RootErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <PageError error={error} onRetry={() => void retry()} />;
}

const s = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Space.xl, backgroundColor: Maple.canvas },
  card: {
    width: '100%',
    maxWidth: 480,
    gap: Space.sm,
    padding: Space.xl,
    borderRadius: Radii.panel,
    borderWidth: 1,
    borderColor: Maple.border,
    backgroundColor: Maple.surface,
  },
  icon: { width: 44, height: 44, borderRadius: Radii.controlLarge, alignItems: 'center', justifyContent: 'center', backgroundColor: Maple.errorSoft },
  title: { ...TypeScale.sectionTitle, color: Maple.navy },
  body: { ...TypeScale.body, color: Maple.body },
  detail: { fontFamily: 'monospace', fontSize: 12, lineHeight: 18, color: Maple.secondary, padding: Space.sm, borderRadius: Radii.control, backgroundColor: Maple.subtle },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.xs, marginTop: Space.xs },
});
