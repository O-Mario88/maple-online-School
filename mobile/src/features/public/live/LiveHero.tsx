import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import type { MockData } from '@/mock';

import { Brand } from '../palette';

type Session = MockData['publicPages']['liveSession'];

const NAVY = '#0B1E4D';

/** The dark hero: live badge, title, promise, and when, where and who it's for, over the teacher's photo. */
export function LiveHero({ s, wide }: { s: Session; wide: boolean }) {
  const [saved, setSaved] = useState(false);
  const share = async () => {
    const url = Linking.createURL(`/live/${s.slug}`);
    try {
      await Share.share({ message: `${s.title.lead} ${s.title.accent} on Maple: ${url}`, url });
    } catch {
      // Sharing was cancelled or isn't available; nothing to do.
    }
  };
  const facts = [
    { icon: 'calendar' as const, title: s.when.day, detail: s.when.time },
    { icon: 'people' as const, title: s.where.title, detail: s.where.detail },
    { icon: 'chart' as const, title: s.level.title, detail: s.level.detail },
  ];
  return (
    <View style={[styles.hero, wide && styles.heroWide]}>
      <Image source={s.photo} style={wide ? styles.photoWide : styles.photo} contentFit="cover" contentPosition="left" accessibilityLabel={`${s.teacher.name} at a whiteboard of exam strategies`} />
      {/* Wide: the copy sits on a navy fade over the photo's left side. Phone: the photo sits above the copy. */}
      {wide ? (
        <LinearGradient
          colors={[NAVY, NAVY, 'rgba(11,30,77,0.65)', 'rgba(11,30,77,0)']}
          locations={[0, 0.44, 0.52, 0.6]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View style={styles.corner}>
        <Pressable style={styles.share} onPress={share} accessibilityRole="button" accessibilityLabel="Share this live class">
          <Icon name="share" size={14} color={Brand.ink} />
          <Text style={styles.shareText}>Share</Text>
        </Pressable>
        <Pressable style={styles.save} onPress={() => setSaved((v) => !v)} accessibilityRole="button" accessibilityLabel={saved ? 'Remove from saved' : 'Save for later'}>
          <Text style={[styles.saveText, saved && styles.saveTextOn]}>{saved ? '♥' : '♡'}</Text>
        </Pressable>
      </View>
      <View style={[styles.copy, wide && styles.copyWide]}>
        <View style={styles.badge}>
          <Icon name="live" size={14} color={Brand.surface} />
          <Text style={styles.badgeText}>{s.badge.toUpperCase()}</Text>
        </View>
        <Text style={[styles.title, wide && styles.titleWide]} accessibilityRole="header">
          {`${s.title.lead}\n`}
          <Text style={styles.accent}>{s.title.accent}</Text>
        </Text>
        <Text style={styles.sub}>{s.sub}</Text>
        <View style={styles.facts}>
          {facts.map((f) => (
            <View key={f.title} style={styles.fact}>
              <Icon name={f.icon} size={22} color={Brand.surface} />
              <View>
                <Text style={styles.factTitle}>{f.title}</Text>
                <Text style={styles.factDetail}>{f.detail}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 20, overflow: 'hidden', backgroundColor: NAVY },
  heroWide: { minHeight: 350, justifyContent: 'center', paddingBottom: 36 },
  photo: { height: 200 },
  photoWide: { position: 'absolute', top: 0, bottom: 0, right: 0, left: '47%' },
  corner: { position: 'absolute', top: 14, right: 14, flexDirection: 'row', gap: 8, zIndex: 1 },
  share: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, height: 32, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.92)' },
  shareText: { fontSize: 12, fontWeight: '600', color: Brand.ink },
  save: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.92)' },
  saveText: { fontSize: 18, color: Brand.ink },
  saveTextOn: { color: Brand.live },
  copy: { gap: 12, padding: 22 },
  copyWide: { maxWidth: 580, paddingHorizontal: 34, paddingVertical: 30 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, backgroundColor: Brand.live },
  badgeText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, color: Brand.surface },
  title: { fontSize: 30, lineHeight: 36, fontWeight: '800', color: Brand.surface, letterSpacing: -0.6 },
  titleWide: { fontSize: 46, lineHeight: 52, letterSpacing: -1.2 },
  accent: { color: '#5B9BFF' },
  sub: { fontSize: 16, lineHeight: 24, color: 'rgba(255,255,255,0.88)' },
  facts: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 28, rowGap: 14, marginTop: 10 },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  factTitle: { fontSize: 13, fontWeight: '700', color: Brand.surface },
  factDetail: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
});
