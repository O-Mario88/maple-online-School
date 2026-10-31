import { type Href, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';

import { Brand } from '../palette';

const NAVY = '#0E1B3D';
const NAVY_ON = '#1D3A8A';

interface Props {
  boards: readonly { label: string; href: string }[];
  subjects: readonly string[];
  activeBoardHref: string;
  activeSubject: string;
}

/** The dark left sidebar: exam boards, then subjects. */
export function PaperSidebar({ boards, subjects, activeBoardHref, activeSubject }: Props) {
  return (
    <ScrollView style={styles.side} contentContainerStyle={styles.inner}>
      <Text style={styles.heading}>Past Papers</Text>
      <Pressable style={styles.item} onPress={() => router.push('/explore')} accessibilityRole="link">
        <Icon name="grid" size={18} color={Brand.surface} />
        <Text style={styles.label}>Overview</Text>
      </Pressable>
      {boards.map((b) => {
        const on = b.href === activeBoardHref;
        return (
          <Pressable key={b.href} style={[styles.item, on && styles.itemOn]} onPress={() => router.push(b.href as Href)} accessibilityRole="link" accessibilityState={{ selected: on }}>
            <Icon name="school" size={18} color={Brand.surface} />
            <Text style={styles.label}>{b.label}</Text>
          </Pressable>
        );
      })}
      <Text style={[styles.heading, styles.subjectsHeading]}>Subjects</Text>
      {subjects.map((s) => {
        const on = s === activeSubject;
        return (
          <View key={s} style={[styles.item, on && styles.itemOn]} accessibilityState={{ selected: on }}>
            <Icon name={on ? 'chart' : 'book'} size={18} color={Brand.surface} />
            <Text style={styles.label}>{s}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // The reference's sidebar is 162px wide at its 1252px page width.
  side: { width: 162, flexGrow: 0, backgroundColor: NAVY },
  inner: { paddingVertical: 10, paddingHorizontal: 7, gap: 2 },
  heading: { fontSize: 14, fontWeight: '800', color: Brand.surface, paddingHorizontal: 10, paddingVertical: 10 },
  subjectsHeading: { marginTop: 10, fontSize: 12 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 9, minHeight: 32, paddingHorizontal: 9, borderRadius: 7 },
  itemOn: { backgroundColor: NAVY_ON },
  label: { flex: 1, fontSize: 10, color: Brand.surface },
});
