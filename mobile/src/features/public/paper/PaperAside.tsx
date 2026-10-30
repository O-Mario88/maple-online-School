import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import type { IconName } from '@/lib/icons';
import type { MockData } from '@/mock';
import type { PastPaperEntry } from '@/mock/public';

import { Brand, CARD_SHADOW } from '../palette';

type Pages = MockData['publicPages']['pastPaperPages'];

/** "Complete this past paper": what an account unlocks, then sign up or sign in. */
export function CompletePaper({ benefits }: { benefits: Pages['benefits'] }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title} accessibilityRole="header">
        Complete This Past Paper
      </Text>
      {benefits.map((b) => (
        <View key={b} style={styles.row}>
          <Icon name="check" size={16} color={Brand.green} />
          <Text style={styles.body}>{b}</Text>
        </View>
      ))}
      <Pressable style={styles.primary} onPress={() => router.push('/sign-up')} accessibilityRole="button">
        <Icon name="lock" size={16} color={Brand.surface} />
        <Text style={styles.primaryText}>Continue with Full Paper</Text>
      </Pressable>
      <Text style={styles.note}>Create a free account to unlock all questions</Text>
      <Pressable style={styles.secondary} onPress={() => router.push('/sign-in')} accessibilityRole="button">
        <Text style={styles.link}>Sign in</Text>
      </Pressable>
    </View>
  );
}

/** The paper's facts: board, level, subject, year, marks, duration, files and language. */
export function PaperInfo({ paper }: { paper: PastPaperEntry }) {
  const facts: { label: string; value: string; icon: IconName; tint: string }[] = [
    { label: 'Board', value: paper.boardName.split(' ').length > 3 ? paper.title.split(' ')[0] : paper.boardName, icon: 'school', tint: '#2F6BFF' },
    { label: 'Level', value: paper.level, icon: 'chart', tint: '#2F6BFF' },
    { label: 'Subject', value: paper.subjectName, icon: 'book', tint: '#F59E0B' },
    { label: 'Year', value: paper.year, icon: 'calendar', tint: '#2F6BFF' },
    { label: 'Total Marks', value: `${paper.totalMarks} (Paper 1)`, icon: 'check', tint: '#16A34A' },
    { label: 'Duration', value: paper.duration, icon: 'clock', tint: '#8B5CF6' },
  ];
  return (
    <View style={styles.card}>
      <Text style={styles.title} accessibilityRole="header">
        Paper Information
      </Text>
      <View style={styles.facts}>
        {facts.map((f) => (
          <View key={f.label} style={styles.fact}>
            <View style={[styles.factIcon, { backgroundColor: `${f.tint}1A` }]}>
              <Icon name={f.icon} size={18} color={f.tint} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.muted}>{f.label}</Text>
              <Text style={styles.strong}>{f.value}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.row}>
        <Icon name="folder" size={18} color={Brand.purple} />
        <Text style={styles.body}>{`Files: ${paper.files}`}</Text>
      </View>
      <View style={styles.row}>
        <Icon name="globe" size={18} color={Brand.amber} />
        <Text style={styles.body}>Language: English</Text>
      </View>
    </View>
  );
}

/** Video lessons and revision linked to the paper's topics. */
export function RelatedResources({ videos }: { videos: Pages['videos'] }) {
  return (
    <View style={styles.card}>
      <View style={styles.between}>
        <Text style={styles.title} accessibilityRole="header">
          Related Resources
        </Text>
        <Pressable onPress={() => router.push('/explore')} accessibilityRole="link">
          <Text style={styles.link}>View all →</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.videos}>
        {videos.map((v) => (
          <Pressable key={v.title} style={styles.video} onPress={() => router.push('/shorts')} accessibilityRole="link" accessibilityLabel={`${v.title}, ${v.length}`}>
            <Image source={v.photo} style={styles.thumb} contentFit="cover" />
            <Text style={styles.videoTitle} numberOfLines={2}>
              {v.title}
            </Text>
            <Text style={styles.muted}>{`${v.length} · ${v.meta}`}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  card: { gap: 10, padding: 18, borderRadius: 14, backgroundColor: Brand.surface, ...CARD_SHADOW },
  title: { fontSize: 17, fontWeight: '800', color: Brand.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  body: { fontSize: 13, color: Brand.body, flexShrink: 1 },
  muted: { fontSize: 11, color: Brand.muted },
  strong: { fontSize: 13, fontWeight: '700', color: Brand.ink },
  link: { fontSize: 13, fontWeight: '600', color: Brand.blue },
  primary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 46, borderRadius: 10, backgroundColor: Brand.blue, marginTop: 6 },
  primaryText: { fontSize: 15, fontWeight: '700', color: Brand.surface },
  note: { fontSize: 12, color: Brand.muted, textAlign: 'center' },
  secondary: { alignItems: 'center', minHeight: 42, justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: Brand.blue },
  facts: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 12 },
  fact: { width: '50%', flexDirection: 'row', alignItems: 'center', gap: 10 },
  factIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  videos: { gap: 10 },
  video: { width: 100, gap: 4 },
  thumb: { width: 100, height: 92, borderRadius: 8 },
  videoTitle: { fontSize: 12, fontWeight: '700', color: Brand.ink },
});
