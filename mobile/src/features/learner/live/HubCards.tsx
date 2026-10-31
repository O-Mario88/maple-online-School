import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { DomainChip } from '@/features/learner/cbc/CbcParts';
import { formatMoney } from '@/lib/finance/fees';
import { addDays, clock12, dayParts } from '@/lib/live-hub';

import { BLUE, BODY, GREEN, INK, LiveBadge } from './HubSchedule';
import type { Hub, HubState, Tutor } from './useLiveHub';

const ugx = (n: number) => formatMoney(n, 'UGX');
const STAR = '#F5A524';

export function Head({ title, link, onLink, sub, small = false }: { title: string; link?: string; onLink?: () => void; sub?: string; small?: boolean }) {
  return (
    <View>
      <View style={styles.head}>
        <Text style={[styles.headTitle, small && styles.headTitleS]}>{title}</Text>
        {link ? (
          <Pressable style={styles.link} onPress={onLink} accessibilityRole="link" hitSlop={8}>
            <Text style={[styles.linkText, small && styles.linkTextS]}>{link}</Text>
            <Icon name="arrowRight" size={small ? 11 : 13} color={BLUE} />
          </Pressable>
        ) : null}
      </View>
      {sub ? <Text style={styles.headSub}>{sub}</Text> : null}
    </View>
  );
}

function Online() {
  return (
    <View style={styles.online}>
      <View style={styles.onlineDot} />
      <Text style={styles.onlineText}>Online</Text>
    </View>
  );
}

/** A tutor who can help now: book a 15-minute rescue, or join it once booked. */
export function TutorCard({ hub, t, s, phone = false }: { hub: Hub; t: Tutor; s: HubState; phone?: boolean }) {
  const booked = s.bookedWith(t);
  const button = booked ? (
    <Pressable style={[styles.book, phone && styles.bookP, styles.joinBooked]} onPress={() => router.push('/learn/live-room')} accessibilityRole="button" accessibilityLabel={`Join your session with ${t.name}`}>
      <Text style={styles.bookText}>{phone ? 'Join' : 'Join Session'}</Text>
    </Pressable>
  ) : (
    <Pressable style={[styles.book, phone && styles.bookP]} onPress={() => s.setBooking(t)} accessibilityRole="button" accessibilityLabel={`Book ${t.name}, ${ugx(t.priceUGX)}`}>
      <Text style={[styles.bookText, phone && styles.bookTextP]}>{phone ? 'Book' : 'Book Now'}</Text>
    </Pressable>
  );
  return (
    <View style={[styles.tutor, phone && styles.tutorP]}>
      <View>
        <Image source={t.photo} style={phone ? styles.tutorPhotoP : styles.tutorPhoto} contentFit="cover" />
        <Online />
      </View>
      <Text style={[styles.tutorName, phone && styles.tutorNameP]}>{t.name}</Text>
      <Text style={[styles.tutorSub, phone && styles.tutorSubP]}>{phone ? t.short : t.subject}</Text>
      <View style={styles.meta}>
        <Icon name="star" size={phone ? 10 : 12} color={STAR} />
        <Text style={[styles.metaText, phone && styles.tutorSubP]}>{phone ? `${t.rating}` : `${t.rating} (${t.reviews})`}</Text>
      </View>
      {phone ? null : (
        <>
          <View style={styles.meta}>
            <Icon name="cap" size={12} color={BODY} />
            <Text style={styles.metaText} numberOfLines={1}>
              {t.levels}
            </Text>
          </View>
          <View style={styles.meta}>
            <Icon name="clock" size={12} color={BODY} />
            <Text style={styles.metaText}>{`${hub.sessionMinutes} min session`}</Text>
          </View>
        </>
      )}
      <Text style={[styles.price, phone && styles.priceP]}>{ugx(t.priceUGX)}</Text>
      {button}
    </View>
  );
}

/** Confirms a rescue booking: tutor, length, price and the wallet it is paid from. */
export function BookingSheet({ hub, s }: { hub: Hub; s: HubState }) {
  const insets = useSafeAreaInsets();
  const t = s.booking;
  return (
    <Modal visible={t != null} transparent animationType="fade" onRequestClose={() => s.setBooking(null)}>
      <Pressable style={[styles.scrim, { paddingBottom: insets.bottom + 16 }]} onPress={() => s.setBooking(null)} accessibilityLabel="Close booking">
        {t ? (
          <Pressable style={styles.sheet} accessibilityRole="none">
            <Text style={styles.sheetTitle}>{`Book a ${hub.sessionMinutes}-min Homework Rescue`}</Text>
            <View style={styles.sheetTutor}>
              <Image source={t.photo} style={styles.sheetPhoto} contentFit="cover" />
              <View style={styles.flex}>
                <Text style={styles.tutorName}>{t.name}</Text>
                <Text style={styles.tutorSub}>{`${t.subject} • ${t.levels}`}</Text>
                <View style={styles.meta}>
                  <Icon name="star" size={12} color={STAR} />
                  <Text style={styles.metaText}>{`${t.rating} (${t.reviews} reviews) • Online now`}</Text>
                </View>
              </View>
            </View>
            {[
              ['Session', `${hub.sessionMinutes} minutes, starts now`],
              ['Price', ugx(t.priceUGX)],
              ['Pay from', `Maple Wallet • ${ugx(hub.walletUGX)} balance`],
            ].map(([k, v]) => (
              <View key={k} style={styles.sheetRow}>
                <Text style={styles.sheetKey}>{k}</Text>
                <Text style={styles.sheetValue}>{v}</Text>
              </View>
            ))}
            <Pressable style={styles.confirm} onPress={() => s.book(t)} accessibilityRole="button">
              <Text style={styles.confirmText}>{`Confirm and pay ${ugx(t.priceUGX)}`}</Text>
            </Pressable>
            <Pressable style={styles.cancel} onPress={() => s.setBooking(null)} accessibilityRole="button">
              <Text style={styles.linkText}>Not now</Text>
            </Pressable>
          </Pressable>
        ) : null}
      </Pressable>
    </Modal>
  );
}

type LiveClass = Hub['liveClasses'][number];

function when(hub: Hub, c: LiveClass) {
  const tomorrow = c.day === addDays(hub.now.day, 1);
  const day = c.day === hub.now.day ? 'Today' : tomorrow ? 'Tomorrow' : dayParts(c.day).long;
  return `${day} • ${clock12(c.start)}`;
}

function ClassButton({ c, s, phone = false }: { c: LiveClass; s: HubState; phone?: boolean }) {
  if (s.action(c) === 'join')
    return (
      <Pressable style={[styles.classBtn, styles.classJoin, phone && styles.classBtnP]} onPress={() => router.push('/learn/live-room')} accessibilityRole="button" accessibilityLabel={`Join ${c.title}`}>
        <Icon name="video" size={15} color="#FFFFFF" />
        <Text style={[styles.classBtnText, styles.white]}>Join</Text>
      </Pressable>
    );
  const on = s.reminded(c.id);
  return (
    <Pressable style={[styles.classBtn, on && styles.classDone]} onPress={() => s.toggleReminder(c.id)} accessibilityRole="button" accessibilityLabel={`${on ? 'Reminder set for' : 'Remind me about'} ${c.title}`}>
      <Icon name={on ? 'check' : 'bell'} size={14} color={on ? GREEN : BLUE} />
      <Text style={[styles.classBtnText, on && { color: GREEN }]}>{on ? 'Reminder Set' : 'Remind Me'}</Text>
    </Pressable>
  );
}

export function LiveClassCard({ hub, c, s }: { hub: Hub; c: LiveClass; s: HubState }) {
  return (
    <View style={styles.classCard}>
      <View>
        <Image source={c.thumb} style={styles.thumb} contentFit="cover" />
        {s.action(c) === 'join' ? (
          <View style={styles.thumbBadge}>
            <LiveBadge text="Live" />
          </View>
        ) : null}
      </View>
      <View style={styles.classBody}>
        <Text style={styles.classSubject}>{c.subject}</Text>
        <Text style={styles.classTitle}>{c.title}</Text>
        <View style={styles.classDomain}>
          <DomainChip domain={c.domain} />
        </View>
        <Text style={styles.classWhen}>{when(hub, c)}</Text>
        <View style={styles.teacher}>
          <Image source={c.face} style={styles.face} />
          <Text style={styles.classWhen}>{c.teacher}</Text>
        </View>
        <ClassButton c={c} s={s} />
      </View>
    </View>
  );
}

export function LiveClassRow({ hub, c, s }: { hub: Hub; c: LiveClass; s: HubState }) {
  return (
    <View style={styles.classRow}>
      <View>
        <Image source={c.thumb} style={styles.thumbP} contentFit="cover" />
        {s.action(c) === 'join' ? (
          <View style={styles.thumbBadgeP}>
            <LiveBadge text="Live" />
          </View>
        ) : null}
      </View>
      <View style={styles.flex}>
        <Text style={styles.rowTitle} numberOfLines={1}>{`${c.subject} - ${c.title}`}</Text>
        <Text style={styles.rowSub}>{when(hub, c)}</Text>
        <Text style={styles.rowSub}>{c.teacher}</Text>
      </View>
      <ClassButton c={c} s={s} phone />
    </View>
  );
}

type Camp = Hub['bootcamps'][number];

export function BootcampRow({ b }: { b: Camp }) {
  const progress = b.done != null && b.total ? { done: b.done, total: b.total } : null;
  const ongoing = progress != null;
  return (
    <View style={styles.camp}>
      <Image source={b.icon} style={styles.campIcon} />
      <View style={styles.flex}>
        <View style={styles.campTop}>
          <Text style={[styles.rowTitle, styles.campTitle]} numberOfLines={1}>
            {b.title}
          </Text>
          {ongoing ? <Text style={styles.ongoing}>{b.status}</Text> : null}
        </View>
        {progress ? (
          <>
            <Text style={styles.rowSub}>{`${progress.done}/${progress.total} sessions completed`}</Text>
            <View style={styles.campBar}>
              <View style={[styles.campFill, { width: `${(progress.done / progress.total) * 100}%` }]} />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.rowSub}>{b.starts}</Text>
            <Text style={styles.rowSub}>{b.meta}</Text>
          </>
        )}
      </View>
      {ongoing ? (
        <Pressable style={[styles.campBtn, styles.classJoin]} onPress={() => router.push('/learn/live-room')} accessibilityRole="button" accessibilityLabel={`Join ${b.title}`}>
          <Text style={[styles.classBtnText, styles.white]}>Join Now</Text>
        </Pressable>
      ) : (
        <Pressable style={[styles.campBtn, styles.soft]} onPress={() => router.push(`/live/${b.slug}`)} accessibilityRole="link" accessibilityLabel={`View details for ${b.title}`}>
          <Text style={styles.classBtnText}>View Details</Text>
        </Pressable>
      )}
    </View>
  );
}

/** A session on offer this week; adding it puts it on the learner's calendar. */
export function WeekRow({ hub, x, s, phone = false }: { hub: Hub; x: Hub['thisWeek'][number]; s: HubState; phone?: boolean }) {
  const on = s.isAdded(x.id);
  return (
    <View style={styles.week}>
      <Pressable style={phone ? styles.weekDateP : styles.weekDate} onPress={() => s.setDay(x.day)} accessibilityRole="button" accessibilityLabel={`Show ${dayParts(x.day).long}`}>
        <Text style={styles.weekDay}>{dayParts(x.day).long}</Text>
        <Text style={styles.rowSub}>{clock12(x.start)}</Text>
      </Pressable>
      <Image source={hub.icons[x.icon]} style={styles.weekIcon} />
      <View style={styles.flex}>
        <Text style={styles.rowTitle}>{x.title}</Text>
        <Text style={styles.rowSub}>{x.teacher}</Text>
      </View>
      <Pressable style={[styles.addBtn, on && styles.classDone]} onPress={() => s.toggleAdded(x.id)} accessibilityRole="button" accessibilityState={{ selected: on }}>
        {on ? <Icon name="check" size={12} color={GREEN} /> : null}
        <Text style={[styles.addText, on && { color: GREEN }]}>{on ? 'Added' : phone ? 'Add' : 'Add to Calendar'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  white: { color: '#FFFFFF' },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headTitle: { fontSize: 17, fontWeight: '700', color: INK, letterSpacing: -0.2 },
  headTitleS: { fontSize: 15 },
  headSub: { marginTop: 8, fontSize: 11.5, color: BODY },
  link: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  linkText: { fontSize: 12.5, color: BLUE },
  linkTextS: { fontSize: 11 },
  tutor: { width: 136, padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E8EDF4', backgroundColor: '#FFFFFF' },
  tutorP: { width: 104, padding: 0, borderWidth: 0, backgroundColor: 'transparent' },
  tutorPhoto: { width: 120, height: 93, borderRadius: 6 },
  tutorPhotoP: { width: 104, height: 66, borderRadius: 6 },
  online: { position: 'absolute', right: 3, bottom: 3, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9, backgroundColor: '#E3F6E9' },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: GREEN },
  onlineText: { fontSize: 10.5, color: '#14532D' },
  tutorName: { marginTop: 8, fontSize: 14, fontWeight: '700', color: INK },
  tutorNameP: { marginTop: 6, fontSize: 11.5 },
  tutorSub: { marginTop: 3, fontSize: 12.5, color: BODY },
  tutorSubP: { marginTop: 1, fontSize: 10.5 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  metaText: { flexShrink: 1, fontSize: 11.5, color: BODY },
  price: { marginTop: 8, fontSize: 14.5, fontWeight: '700', color: INK },
  priceP: { marginTop: 4, fontSize: 11.5 },
  book: { height: 29, alignItems: 'center', justifyContent: 'center', marginTop: 8, borderRadius: 4, backgroundColor: '#0B6BFF' },
  bookP: { height: 26, marginTop: 6 },
  joinBooked: { backgroundColor: GREEN },
  bookText: { fontSize: 13, fontWeight: '500', color: '#FFFFFF' },
  bookTextP: { fontSize: 11.5 },
  scrim: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: 'rgba(8,12,20,0.55)' },
  sheet: { width: '100%', maxWidth: 420, padding: 20, borderRadius: 14, backgroundColor: '#FFFFFF' },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: INK },
  sheetTutor: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14, marginBottom: 8 },
  sheetPhoto: { width: 64, height: 64, borderRadius: 32 },
  sheetRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#EEF1F6' },
  sheetKey: { fontSize: 13, color: BODY },
  sheetValue: { fontSize: 13, fontWeight: '600', color: INK },
  confirm: { height: 46, alignItems: 'center', justifyContent: 'center', marginTop: 12, borderRadius: 8, backgroundColor: '#0B6BFF' },
  confirmText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  cancel: { height: 40, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  classCard: { width: 147, borderRadius: 8, borderWidth: 1, borderColor: '#E8EDF4', backgroundColor: '#FFFFFF', overflow: 'hidden' },
  thumb: { width: 147, height: 74 },
  thumbBadge: { position: 'absolute', left: 6, top: 6, width: 44, height: 18, backgroundColor: 'transparent' },
  classBody: { padding: 9 },
  classSubject: { fontSize: 13.5, fontWeight: '600', color: INK },
  classTitle: { marginTop: 3, fontSize: 13, color: '#2B3445' },
  classDomain: { marginTop: 5 },
  classWhen: { marginTop: 5, fontSize: 12.5, color: BODY },
  teacher: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  face: { width: 16, height: 16, marginTop: 5, borderRadius: 8 },
  classBtn: { height: 33, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 10, borderRadius: 4, borderWidth: 1, borderColor: '#BBD0F4', backgroundColor: '#FFFFFF' },
  classBtnP: { width: 64, marginTop: 0 },
  classJoin: { borderWidth: 0, backgroundColor: '#0B6BFF' },
  classDone: { borderColor: '#B9E3C8', backgroundColor: '#F0FAF3' },
  classBtnText: { fontSize: 12.5, fontWeight: '500', color: BLUE },
  classRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  thumbP: { width: 44, height: 44, borderRadius: 8 },
  thumbBadgeP: { position: 'absolute', left: 2, top: 2 },
  rowTitle: { fontSize: 13.5, fontWeight: '600', color: INK },
  rowSub: { marginTop: 3, fontSize: 12.5, color: BODY },
  camp: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  campIcon: { width: 58, height: 58 },
  campTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  campTitle: { flexShrink: 1, fontSize: 13 },
  ongoing: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5, backgroundColor: '#E5F6EB', fontSize: 11.5, fontWeight: '500', color: '#15803D', overflow: 'hidden' },
  campBar: { width: '100%', maxWidth: 236, height: 4, marginTop: 9, borderRadius: 2, backgroundColor: '#E3E8F0', overflow: 'hidden' },
  campFill: { height: 4, borderRadius: 2, backgroundColor: GREEN },
  campBtn: { width: 82, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 5 },
  soft: { backgroundColor: '#E6EEFB' },
  week: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  weekDate: { width: 72 },
  weekDateP: { width: 64 },
  weekDay: { fontSize: 13, color: INK },
  weekIcon: { width: 38, height: 38 },
  addBtn: { height: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 9, borderRadius: 5, borderWidth: 1, borderColor: 'transparent', backgroundColor: '#E6EEFB' },
  addText: { fontSize: 12, fontWeight: '500', color: BLUE },
});
