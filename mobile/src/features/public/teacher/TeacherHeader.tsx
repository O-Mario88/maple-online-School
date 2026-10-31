import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { lengthSeconds, VideoSheet } from '@/features/shared/VideoSheet';
import type { MockData } from '@/mock';

import { Brand } from '../palette';
import { MessageSheet } from './MessageSheet';

type Storefront = MockData['publicPages']['teacherStorefront'];

const SCRIPT_FONT = Platform.select({ web: '"Segoe Print", "Bradley Hand", cursive', default: undefined });

/** Intro-video banner, then the profile card: photo, name, badges, tags, stats and Follow, Share, Message. */
export function TeacherHeader({ t, wide }: { t: Storefront; wide: boolean }) {
  const [following, setFollowing] = useState(false);
  const [shared, setShared] = useState(false);
  const [watching, setWatching] = useState(false);
  const [writing, setWriting] = useState(false);

  // Sharing always sends the direct link, so bookings through it are commission-free.
  const share = async () => {
    const url = Linking.createURL(`/@${t.handle}`, { queryParams: { ref: 'direct' } });
    try {
      await Share.share({ message: `Book a lesson with ${t.name} on Maple: ${url}`, url });
      setShared(true);
    } catch {
      setShared(false);
    }
  };

  return (
    <View>
      <VideoSheet visible={watching} poster={t.bannerPhoto} title={`${t.name}: introduction`} seconds={lengthSeconds(t.introLength)} onClose={() => setWatching(false)} />
      <MessageSheet teacher={t.name} visible={writing} onClose={() => setWriting(false)} />
      {t.bannerPhoto ? (
        // The reference banner already shows her quotes and the "Watch my introduction" button.
        <Pressable style={[styles.banner, wide && styles.bannerPhotoWide]} accessibilityRole="button" accessibilityLabel={`Watch ${t.name}'s introduction, ${t.introLength}`} onPress={() => setWatching(true)}>
          <Image source={t.bannerPhoto} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition={wide ? 'center' : 'left'} />
        </Pressable>
      ) : (
      <LinearGradient colors={['#C9A27A', '#8C6A4F', '#5B4636']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.banner, wide && styles.bannerWide]}>
        {wide ? <Text style={[styles.quote, styles.quoteLeft, { fontFamily: SCRIPT_FONT }]}>{`“ ${t.quotes[0]} ♡`}</Text> : null}
        <Text style={styles.bannerFace} accessibilityElementsHidden>
          👩🏾‍🏫
        </Text>
        <Pressable style={styles.intro} accessibilityRole="button" accessibilityLabel={`Watch ${t.name}'s introduction, ${t.introLength}`} onPress={() => setWatching(true)}>
          <View style={styles.introPlay}>
            <Icon name="play" size={18} color={Brand.surface} />
          </View>
          <Text style={styles.introText}>{`Watch my introduction (${t.introLength})`}</Text>
        </Pressable>
        {wide ? <Text style={[styles.quote, styles.quoteRight, { fontFamily: SCRIPT_FONT }]}>{`“ ${t.quotes[1]} ♡`}</Text> : null}
      </LinearGradient>
      )}

      <View style={[styles.card, wide && styles.cardWide]}>
        <View style={[styles.identity, wide && styles.identityWide]}>
          <View style={styles.photoWrap}>
            <View style={styles.photo}>
              {t.avatar ? (
                <Image source={t.avatar} style={styles.fill} contentFit="cover" accessibilityLabel={t.name} />
              ) : (
                <Text style={styles.photoFace} accessibilityElementsHidden>
                  👩🏾
                </Text>
              )}
            </View>
            {t.online ? <Text style={styles.online}>● Online now</Text> : null}
          </View>
          <View style={styles.flex}>
            <Text style={styles.name} accessibilityRole="header">{`${t.name}  ✓`}</Text>
            <Text style={styles.title}>{t.title}</Text>
            <View style={styles.badges}>
              {t.badges.map((b) => (
                <View key={b.label} style={styles.badge}>
                  <Icon name={b.icon} size={15} color={Brand.blue} />
                  <Text style={styles.badgeText}>{b.label}</Text>
                </View>
              ))}
            </View>
            <View style={styles.tags}>
              {t.tags.map((tag) => (
                <Text key={tag} style={styles.tag}>
                  {tag}
                </Text>
              ))}
            </View>
          </View>
        </View>
        <View style={[styles.right, wide && styles.rightWide]}>
          <View style={styles.stats}>
            {t.stats.map((s) => (
              <View key={s.label} style={styles.stat}>
                <Icon name={s.icon} size={18} color={s.icon === 'star' ? Brand.amber : Brand.blue} />
                <View>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              </View>
            ))}
          </View>
          <View style={styles.actions}>
            <Pressable style={styles.ghost} onPress={() => setFollowing((f) => !f)} accessibilityRole="button">
              <Text style={styles.ghostText}>{following ? '♥ Following' : '♡ Follow'}</Text>
            </Pressable>
            <Pressable style={styles.ghost} onPress={share} accessibilityRole="button" accessibilityLabel="Share this page">
              <Text style={styles.ghostTextDark}>{shared ? 'Link shared' : '↗ Share'}</Text>
            </Pressable>
            <Pressable style={styles.primary} accessibilityRole="button" onPress={() => setWriting(true)}>
              <Icon name="chat" size={16} color={Brand.surface} />
              <Text style={styles.primaryText}>Message</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fill: { width: '100%', height: '100%' },
  banner: { height: 220, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  bannerWide: { height: 300, borderRadius: 20 },
  // The reference banner keeps its own shape on wide screens so its quotes aren't cut off.
  bannerPhotoWide: { height: undefined, aspectRatio: 2045 / 319, borderRadius: 20 },
  bannerFace: { fontSize: 170, position: 'absolute', bottom: 34 },
  quote: { position: 'absolute', top: 30, width: 260, fontSize: 24, lineHeight: 32, color: Brand.surface },
  quoteLeft: { left: 40, transform: [{ rotate: '-6deg' }] },
  quoteRight: { right: 40, transform: [{ rotate: '4deg' }] },
  intro: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, paddingLeft: 6, paddingRight: 16, borderRadius: 999, backgroundColor: 'rgba(11,20,36,0.6)', marginTop: 40 },
  introPlay: { width: 40, height: 40, borderRadius: 20, backgroundColor: Brand.blue, alignItems: 'center', justifyContent: 'center' },
  introText: { fontSize: 14, fontWeight: '600', color: Brand.surface },
  card: { gap: 20, padding: 20, marginTop: -30, marginHorizontal: 12, borderRadius: 16, backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line },
  cardWide: { flexDirection: 'row', marginHorizontal: 20, marginTop: -40 },
  identity: { gap: 16 },
  identityWide: { flexDirection: 'row', flex: 1 },
  photoWrap: { alignItems: 'center', gap: 6 },
  photo: { width: 140, height: 140, borderRadius: 70, borderWidth: 4, borderColor: Brand.surface, backgroundColor: '#E9D5C0', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  photoFace: { fontSize: 100 },
  online: { fontSize: 12, fontWeight: '600', color: Brand.green, backgroundColor: Brand.greenSoft, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
  name: { fontSize: 30, fontWeight: '800', color: Brand.ink, letterSpacing: -0.6 },
  title: { fontSize: 15, color: Brand.body, marginTop: 2 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  badgeText: { fontSize: 13, color: Brand.ink },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tag: { fontSize: 12, color: Brand.ink, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, backgroundColor: Brand.canvas, overflow: 'hidden' },
  right: { gap: 16 },
  rightWide: { alignItems: 'flex-end' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, minWidth: 120, borderRadius: 10, borderWidth: 1, borderColor: Brand.line },
  statValue: { fontSize: 18, fontWeight: '800', color: Brand.ink },
  statLabel: { fontSize: 11, color: Brand.muted },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ghost: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 18, borderRadius: 8, borderWidth: 1, borderColor: Brand.line },
  ghostText: { fontSize: 14, fontWeight: '600', color: Brand.blue },
  ghostTextDark: { fontSize: 14, fontWeight: '600', color: Brand.ink },
  primary: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, paddingHorizontal: 20, borderRadius: 8, backgroundColor: Brand.blue },
  primaryText: { fontSize: 14, fontWeight: '600', color: Brand.surface },
});
