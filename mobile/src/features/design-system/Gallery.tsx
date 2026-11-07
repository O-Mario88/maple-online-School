/**
 * The Maple Design System gallery: every token and every shared control in
 * each of its states, on one page. Open /design-system to review a change to
 * the system before it reaches the portals.
 */
import { type ReactNode, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Badge, Button, Field, IconButton, SearchField, Tabs } from '@/components/ui';
import { Categorical, ControlHeight, Maple, Radii, Space, TypeScale } from '@/constants/maple';
import type { IconName } from '@/lib/icons';
import { PAGE_TITLE } from '@/lib/fonts/type';

const SWATCHES: readonly (keyof typeof Maple)[] = [
  'blue', 'blueHover', 'blueSoft', 'blueSelected', 'navy', 'body', 'secondary', 'muted', 'faint',
  'canvas', 'surface', 'border', 'borderStrong', 'disabledSurface', 'disabledText',
  'success', 'successSoft', 'warning', 'warningSoft', 'error', 'errorSoft',
];

const SUBJECTS: readonly { label: string; icon: IconName }[] = [
  { label: 'Mathematics', icon: 'calculator' },
  { label: 'English', icon: 'book' },
  { label: 'Science', icon: 'flask' },
  { label: 'Social Studies', icon: 'globe' },
  { label: 'ICT', icon: 'screen' },
  { label: 'Life Skills', icon: 'leaf' },
  { label: 'Library', icon: 'library' },
  { label: 'Career Compass', icon: 'map' },
  { label: 'School Network', icon: 'school' },
  { label: 'Live Classes', icon: 'video' },
];

const noop = () => {};

export function Gallery() {
  const [tab, setTab] = useState<'plan' | 'subjects' | 'schedule' | 'goals'>('plan');
  const [query, setQuery] = useState('');
  const [crash, setCrash] = useState(false);
  if (crash) throw new Error('Simulated page error from the design-system gallery');
  return (
    <ScrollView style={s.page} contentContainerStyle={s.content}>
      <Text style={s.pageTitle} {...PAGE_TITLE}>
        Maple Design System
      </Text>
      <Text style={s.lead}>One set of tokens and components for every Maple portal. Values live in constants/maple.ts.</Text>

      <Section title="Colour">
        <View style={s.swatches}>
          {SWATCHES.map((k) => (
            <View key={k} style={s.swatch}>
              <View style={[s.chip, { backgroundColor: Maple[k] }]} />
              <Text style={s.meta}>{k}</Text>
              <Text style={s.code}>{Maple[k]}</Text>
            </View>
          ))}
        </View>
        <Text style={s.label}>Categorical (charts and subject markers only)</Text>
        <View style={s.swatches}>
          {Object.entries(Categorical).map(([k, v]) => (
            <View key={k} style={s.swatch}>
              <View style={[s.chip, { backgroundColor: v }]} />
              <Text style={s.meta}>{k}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Type">
        {Object.entries(TypeScale).map(([k, v]) => (
          <View key={k} style={s.typeRow}>
            <Text style={s.typeName}>{k}</Text>
            <Text style={[v, s.typeSample]}>Continue learning Mathematics</Text>
          </View>
        ))}
      </Section>

      <Section title="Buttons">
        <View style={s.row}>
          <Button label="Start Learning" onPress={noop} />
          <Button label="View Details" variant="secondary" onPress={noop} />
          <Button label="Compare Plans" variant="tertiary" onPress={noop} />
          <Button label="Delete" variant="danger" onPress={noop} />
          <Button label="Pay Now" disabled onPress={noop} />
          <Button label="Saving" busy onPress={noop} />
        </View>
        <View style={s.row}>
          <Button label="Book Now" icon="calendar" onPress={noop} />
          <Button label="Add to My Books" icon="plus" variant="secondary" onPress={noop} />
          <Button label="Compact" compact onPress={noop} />
          <Button label="Large action" size="large" onPress={noop} />
          <IconButton icon="bell" label="Notifications" dot onPress={noop} />
          <IconButton icon="settings" label="Settings" variant="outline" onPress={noop} />
          <IconButton icon="plus" label="Add" variant="primary" onPress={noop} />
          <IconButton icon="trash" label="Delete" disabled onPress={noop} />
        </View>
      </Section>

      <Section title="Tabs">
        <Tabs
          label="Learning plan sections"
          active={tab}
          onChange={setTab}
          items={[
            { key: 'plan', label: 'My Plan', icon: 'map' },
            { key: 'subjects', label: 'Subjects', icon: 'book', count: 6 },
            { key: 'schedule', label: 'Schedule', icon: 'calendar' },
            { key: 'goals', label: 'Goals', icon: 'target' },
          ]}
        />
      </Section>

      <Section title="Search and inputs">
        <View style={s.narrow}>
          <SearchField label="Search courses, teachers and books" shortcut value={query} onChangeText={setQuery} />
          <SearchField label="Search books" />
          <Field label="School name" placeholder="e.g. Greenhill Academy" />
          <Field label="Disabled field" value="Locked" editable={false} />
        </View>
      </Section>

      <Section title="Badges">
        <View style={s.row}>
          <Badge label="Neutral" />
          <Badge label="Active" tone="accent" />
          <Badge label="Completed" tone="good" />
          <Badge label="Due soon" tone="warning" />
          <Badge label="Overdue" tone="danger" />
        </View>
      </Section>

      {__DEV__ ? (
        <Section title="Error state">
          <Text style={s.meta}>Throws while rendering this page. Only this page is replaced by the error card; the menus stay.</Text>
          <View style={s.row}>
            <Button label="Simulate a page error" variant="danger" icon="alert" onPress={() => setCrash(true)} />
          </View>
        </Section>
      ) : null}

      <Section title="Subject and feature icons (vector)">
        <View style={s.tiles}>
          {SUBJECTS.map((t) => (
            <View key={t.label} style={s.tile}>
              <View style={s.tileIcon}>
                <Icon name={t.icon} size={24} color={Maple.blue} />
              </View>
              <Text style={s.tileLabel}>{t.label}</Text>
            </View>
          ))}
        </View>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={s.card}>
      <Text style={s.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: Maple.canvas },
  content: { padding: Space.xl, gap: Space.xl, maxWidth: 1200, width: '100%', alignSelf: 'center' },
  pageTitle: { ...TypeScale.pageTitle, color: Maple.navy },
  lead: { ...TypeScale.body, color: Maple.secondary, marginTop: -Space.md },
  card: { backgroundColor: Maple.surface, borderWidth: 1, borderColor: Maple.border, borderRadius: Radii.card, padding: Space.xl, gap: Space.md },
  sectionTitle: { ...TypeScale.sectionTitle, color: Maple.navy },
  label: { ...TypeScale.label, color: Maple.body },
  meta: { ...TypeScale.meta, color: Maple.body },
  code: { fontSize: 12, color: Maple.secondary, fontVariant: ['tabular-nums'] },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.md },
  swatch: { width: 104, gap: 4 },
  chip: { height: 44, borderRadius: Radii.control, borderWidth: 1, borderColor: Maple.border },
  typeRow: { flexDirection: 'row', alignItems: 'baseline', gap: Space.md, flexWrap: 'wrap' },
  typeName: { width: 120, ...TypeScale.meta, color: Maple.secondary },
  typeSample: { color: Maple.navy, flexShrink: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm, alignItems: 'center' },
  narrow: { maxWidth: 480, gap: Space.md },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm },
  tile: { width: 132, minHeight: ControlHeight.large * 2, padding: Space.sm, gap: Space.xs, borderRadius: Radii.card, borderWidth: 1, borderColor: Maple.border, backgroundColor: Maple.surface },
  tileIcon: { width: 44, height: 44, borderRadius: Radii.controlLarge, backgroundColor: Maple.blueSoft, alignItems: 'center', justifyContent: 'center' },
  tileLabel: { ...TypeScale.label, color: Maple.navy },
});
