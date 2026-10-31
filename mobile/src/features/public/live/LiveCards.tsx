import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { formatMoney } from '@/lib/finance/fees';

import { Brand, CARD_SHADOW } from '../palette';
import type { Session } from './LiveBooking';

/** A filled check in a circle, as the reference's lists use. */
export function Tick({ size = 15, color = '#16A34A' }: { size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.62, lineHeight: size * 0.8, fontWeight: '800', color: Brand.surface }}>✓</Text>
    </View>
  );
}

export function AboutLive({ s, phone = false, collapsed = false }: { s: Session; phone?: boolean; collapsed?: boolean }) {
  const p = phone;
  return (
    <View>
      <Text style={[styles.title, p && styles.titleP]} accessibilityRole="header">
        About This Live Class
      </Text>
      <Text style={[styles.body, p && styles.bodyP]} numberOfLines={collapsed ? 3 : undefined}>
        {s.about}
      </Text>
      {collapsed ? null : (
        <>
          <View style={styles.points}>
            {s.aboutPoints.map((pt) => (
              <View key={pt} style={[styles.point, p && styles.pointP]}>
                <Tick size={p ? 17 : 15} />
                <Text style={[styles.pointText, p && styles.bodyP]}>{pt}</Text>
              </View>
            ))}
          </View>
          <View style={[styles.who, p && styles.whoP]}>
            <View style={styles.whoIcon}>
              <Icon name="people" size={15} color={Brand.surface} />
            </View>
            <View style={styles.flex}>
              <Text style={[styles.whoTitle, p && styles.whoTitleP]}>Who is this for?</Text>
              <Text style={[styles.whoText, p && styles.whoTextP]}>{s.forWho}</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

export function LearnList({ s, phone = false }: { s: Session; phone?: boolean }) {
  const p = phone;
  return (
    <View>
      <Text style={[styles.title, p && styles.titleP]} accessibilityRole="header">
        What You Will Learn
      </Text>
      <View style={styles.learn}>
        {s.syllabus.map((x) => (
          <View key={x.title} style={styles.learnRow}>
            <View style={[styles.tile, p && styles.tileP, { backgroundColor: x.bg }]}>
              <Icon name={x.icon} size={p ? 20 : 18} color={x.fg} />
            </View>
            <View style={styles.flex}>
              <Text style={[styles.learnTitle, p && styles.learnTitleP]}>{x.title}</Text>
              <Text style={[styles.learnDetail, p && styles.learnDetailP]}>{x.detail}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const BADGE_COLOURS = ['#7C5CFF', '#4F8BFF', '#16A34A'] as const;

export function TeacherCard({ s, phone = false }: { s: Session; phone?: boolean }) {
  const t = s.teacher;
  const p = phone;
  return (
    <View>
      <Text style={[styles.title, p && styles.titleP]} accessibilityRole="header">
        Meet Your Teacher
      </Text>
      <View style={styles.tHead}>
        <View>
          <Image source={t.photo} style={styles.tPhoto} contentFit="cover" accessibilityLabel={t.name} />
          <View style={styles.tPhotoBadge}>
            <Tick size={13} color={Brand.blue} />
          </View>
        </View>
        <View style={styles.flex}>
          <View style={styles.tNameRow}>
            <Text style={[styles.tName, p && styles.tNameP]}>{t.name}</Text>
            <Tick size={p ? 16 : 14} color={Brand.blue} />
          </View>
          <Text style={[styles.tTitle, p && styles.tTitleP]}>{t.title}</Text>
          <View style={styles.tBadges}>
            {t.badges.map((b, i) => (
              <View key={b} style={styles.tBadge}>
                <Tick size={p ? 12 : 10} color={BADGE_COLOURS[i % BADGE_COLOURS.length]} />
                <Text style={[styles.tBadgeText, p && styles.tBadgeTextP]}>{b}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      <View style={styles.tStats}>
        {t.stats.map((st) => (
          <View key={st.label} style={styles.tStat}>
            <View style={styles.tStatTop}>
              <Icon name={st.icon} size={p ? 15 : 13} color={st.color} />
              <Text style={[styles.tStatValue, p && styles.tStatValueP]}>{st.value}</Text>
            </View>
            <Text style={[styles.tStatLabel, p && styles.tStatLabelP]}>{st.label}</Text>
          </View>
        ))}
      </View>
      <Text style={[styles.tBio, p && styles.bodyP]}>{t.bio}</Text>
      <Pressable style={[styles.profile, p && styles.profileP]} onPress={() => router.push(`/@${t.handle}`)} accessibilityRole="link">
        <Text style={[styles.profileText, p && styles.profileTextP]}>View Full Profile →</Text>
      </Pressable>
    </View>
  );
}

export function MoreLive({ s, phone = false }: { s: Session; phone?: boolean }) {
  const cards = s.more.map((m) => {
    const live = m.status === 'live';
    return (
      <Pressable key={m.title} style={[styles.more, phone && styles.moreP]} onPress={() => router.push(`/live/${s.slug}`)} accessibilityRole="link" accessibilityLabel={`${m.title}, ${m.when}`}>
        <Image source={m.photo} style={styles.moreThumb} contentFit="cover" />
        <View style={styles.flex}>
          <View style={[styles.morePill, { backgroundColor: live ? Brand.live : '#4F5BD5' }]}>
            <Text style={styles.morePillText}>{live ? '(•) LIVE' : '(•) UPCOMING'}</Text>
          </View>
          <Text style={styles.moreTitle} numberOfLines={1}>
            {m.title}
          </Text>
          <Text style={styles.moreWhen}>{m.when}</Text>
          <View style={styles.moreFoot}>
            <Text style={styles.morePrice}>{formatMoney(m.priceUGX, 'UGX')}</Text>
            <View style={styles.moreSeats}>
              <Icon name="people" size={13} color="#4A5263" />
              <Text style={styles.moreWhen}>{String(m.seats)}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  });
  return (
    <View>
      <View style={styles.moreHead}>
        <Text style={[styles.moreHeading, phone && styles.titleP]} accessibilityRole="header">
          More Live Classes You May Like
        </Text>
        {phone ? null : (
          <Pressable onPress={() => router.push('/explore')} accessibilityRole="link">
            <Text style={styles.viewAll}>View all →</Text>
          </Pressable>
        )}
      </View>
      {phone ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moreRowP}>
          {cards}
        </ScrollView>
      ) : (
        <View style={styles.moreRow}>{cards}</View>
      )}
    </View>
  );
}

/** A white card with the reference's soft shadow. */
export const card = { borderRadius: 12, backgroundColor: Brand.surface, ...CARD_SHADOW } as const;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: { fontSize: 15.5, fontWeight: '700', color: Brand.ink },
  titleP: { fontSize: 18 },
  body: { marginTop: 10, fontSize: 12, lineHeight: 19, color: '#3D4656' },
  bodyP: { fontSize: 13.5, lineHeight: 20 },
  points: { marginTop: 14 },
  point: { height: 24, flexDirection: 'row', alignItems: 'center', gap: 10 },
  pointP: { height: 28 },
  pointText: { fontSize: 12, color: '#2A3242' },
  who: { flexDirection: 'row', gap: 13, marginTop: 14, padding: 13, borderRadius: 10, backgroundColor: '#F2F7FE' },
  whoP: { marginTop: 16 },
  whoIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center' },
  whoTitle: { fontSize: 12, fontWeight: '700', color: Brand.ink },
  whoTitleP: { fontSize: 14 },
  whoText: { marginTop: 4, fontSize: 10.5, lineHeight: 17, color: '#3D4656' },
  whoTextP: { fontSize: 12.5, lineHeight: 18 },

  learn: { marginTop: 12, gap: 14 },
  learnRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  tile: { width: 36, height: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  tileP: { width: 40, height: 40, borderRadius: 10 },
  learnTitle: { fontSize: 11.5, fontWeight: '700', color: Brand.ink },
  learnTitleP: { fontSize: 13.5 },
  learnDetail: { marginTop: 3, fontSize: 10.5, color: '#4A5263' },
  learnDetailP: { fontSize: 12 },

  tHead: { flexDirection: 'row', gap: 12, marginTop: 12 },
  tPhoto: { width: 74, height: 74, borderRadius: 37 },
  tPhotoBadge: { position: 'absolute', right: 2, bottom: 4, borderRadius: 8, borderWidth: 1.5, borderColor: Brand.surface },
  tNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  tName: { fontSize: 13, fontWeight: '700', color: Brand.ink },
  tNameP: { fontSize: 16 },
  tTitle: { marginTop: 4, fontSize: 8.5, fontWeight: '600', color: '#2A3242' },
  tTitleP: { fontSize: 11 },
  tBadges: { marginTop: 9, gap: 6 },
  tBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tBadgeText: { fontSize: 9, color: '#2A3242' },
  tBadgeTextP: { fontSize: 11 },
  tStats: { flexDirection: 'row', marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EEF1F6' },
  tStat: { flex: 1, alignItems: 'center' },
  tStatTop: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  tStatValue: { fontSize: 13, fontWeight: '700', color: Brand.ink },
  tStatValueP: { fontSize: 15 },
  tStatLabel: { marginTop: 3, fontSize: 8.5, color: '#4A5263' },
  tStatLabelP: { fontSize: 10.5 },
  tBio: { marginTop: 16, fontSize: 10.5, lineHeight: 17.5, color: '#3D4656' },
  profile: { height: 29, marginTop: 16, alignItems: 'center', justifyContent: 'center', borderRadius: 6, borderWidth: 1, borderColor: '#9DBBF8' },
  profileP: { height: 44, borderRadius: 10 },
  profileText: { fontSize: 11.5, fontWeight: '600', color: Brand.blue },
  profileTextP: { fontSize: 14 },

  moreHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  moreHeading: { fontSize: 16, fontWeight: '700', color: Brand.ink },
  viewAll: { fontSize: 11, fontWeight: '500', color: Brand.blue },
  moreRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  moreRowP: { gap: 12, paddingTop: 12, paddingBottom: 4 },
  more: { width: 288, height: 111, flexDirection: 'row', gap: 10, padding: 10, ...card, borderRadius: 10 },
  moreP: { width: 290 },
  moreThumb: { width: 98, height: 91, borderRadius: 6 },
  morePill: { alignSelf: 'flex-start', paddingHorizontal: 5, paddingVertical: 1.5, borderRadius: 3 },
  morePillText: { fontSize: 8.5, fontWeight: '700', color: Brand.surface },
  moreTitle: { marginTop: 7, fontSize: 10.5, fontWeight: '700', color: Brand.ink, letterSpacing: -0.2 },
  moreWhen: { marginTop: 6, fontSize: 10, color: '#4A5263' },
  moreFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  morePrice: { marginTop: 6, fontSize: 11, fontWeight: '700', color: Brand.ink },
  moreSeats: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
