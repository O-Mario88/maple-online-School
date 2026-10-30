import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { formatMoney } from '@/lib/finance/fees';
import { calendarLink, seatsLeft, timeLeft } from '@/lib/live-event';
import type { MockData } from '@/mock';

import { Brand, CARD_SHADOW } from '../palette';

type Session = MockData['publicPages']['liveSession'];

const TICK_MS = 1000;

/** The current time, updated every second while the page is open. */
function useNow(): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);
  return now;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Countdown, seat counter, price, one-tap register and add-to-calendar. */
export function LiveSidebar({ s }: { s: Session }) {
  const now = useNow();
  const t = timeLeft(s.startUTC, now);
  const seats = seatsLeft(s.booked, s.capacity);
  const off = s.wasUGX > s.priceUGX ? Math.round(((s.wasUGX - s.priceUGX) / s.wasUGX) * 100) : 0;
  const units = [
    { value: t.days, label: 'Days' },
    { value: t.hours, label: 'Hours' },
    { value: t.minutes, label: 'Minutes' },
    { value: t.seconds, label: 'Seconds' },
  ];
  const addToCalendar = () =>
    Linking.openURL(calendarLink({ title: `${s.title.lead} ${s.title.accent}`, start: s.startUTC, minutes: s.minutes, details: `${s.where.title} with ${s.teacher.name}` }));

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>{t.started ? 'Live class is on now' : 'Live class starts in'}</Text>
      <View style={styles.countdown} accessibilityRole="timer" accessibilityLabel={`${t.days} days, ${t.hours} hours, ${t.minutes} minutes until the class starts`}>
        {units.map((u) => (
          <View key={u.label} style={styles.unit}>
            <Text style={styles.unitValue}>{pad(u.value)}</Text>
            <Text style={styles.unitLabel}>{u.label}</Text>
          </View>
        ))}
      </View>
      <View style={[styles.seats, seats.low ? styles.seatsLow : null]}>
        <Text style={[styles.seatsTitle, seats.low ? styles.seatsTitleLow : null]}>{seats.full ? 'Fully booked' : seats.low ? `🔥 Only ${seats.left} seats left!` : `${seats.left} seats left`}</Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${seats.booked * 100}%` }]} />
        </View>
        <View style={styles.between}>
          <Text style={styles.muted}>{`${s.booked} booked of ${s.capacity} seats`}</Text>
          <Text style={styles.muted}>{String(s.capacity)}</Text>
        </View>
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{formatMoney(s.priceUGX, 'UGX')}</Text>
        {s.wasUGX ? <Text style={styles.was}>{formatMoney(s.wasUGX, 'UGX')}</Text> : null}
        {off ? <Text style={styles.off}>{`${off}% OFF`}</Text> : null}
      </View>
      <Text style={styles.muted}>{s.access}</Text>
      <Pressable style={[styles.register, seats.full && styles.disabled]} disabled={seats.full} onPress={() => router.push('/checkout')} accessibilityRole="button">
        <Icon name="calendar" size={18} color={Brand.surface} />
        <Text style={styles.registerText}>{seats.full ? 'Join the waiting list' : 'Register for This Live Class'}</Text>
      </Pressable>
      <Pressable style={styles.calendar} onPress={addToCalendar} accessibilityRole="link" accessibilityHint="Opens Google Calendar">
        <Icon name="calendar" size={18} color={Brand.ink} />
        <Text style={styles.calendarText}>Add to Calendar</Text>
      </Pressable>
      <View style={styles.perks}>
        {s.perks.map((p) => (
          <View key={p.label} style={styles.perk}>
            <Icon name={p.icon} size={18} color={Brand.body} />
            <Text style={styles.perkText}>{p.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12, padding: 20, borderRadius: 16, backgroundColor: Brand.surface, ...CARD_SHADOW },
  heading: { fontSize: 16, fontWeight: '700', color: Brand.ink },
  countdown: { flexDirection: 'row', gap: 8 },
  unit: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: Brand.line },
  unitValue: { fontSize: 26, fontWeight: '800', color: Brand.ink, fontVariant: ['tabular-nums'] },
  unitLabel: { fontSize: 11, color: Brand.muted },
  seats: { gap: 8, padding: 12, borderRadius: 10, backgroundColor: Brand.canvas },
  seatsLow: { backgroundColor: Brand.liveSoft },
  seatsTitle: { fontSize: 14, fontWeight: '700', color: Brand.ink },
  seatsTitleLow: { color: Brand.live },
  track: { height: 8, borderRadius: 4, backgroundColor: Brand.surface, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: '#F97316' },
  between: { flexDirection: 'row', justifyContent: 'space-between' },
  muted: { fontSize: 12, color: Brand.muted },
  priceRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  price: { fontSize: 26, fontWeight: '800', color: Brand.ink },
  was: { fontSize: 13, color: Brand.muted, textDecorationLine: 'line-through' },
  off: { fontSize: 11, fontWeight: '700', color: Brand.surface, backgroundColor: Brand.green, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, overflow: 'hidden' },
  register: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 50, borderRadius: 10, backgroundColor: Brand.blue },
  registerText: { fontSize: 15, fontWeight: '600', color: Brand.surface },
  disabled: { opacity: 0.5 },
  calendar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 48, borderRadius: 10, borderWidth: 1, borderColor: Brand.line },
  calendarText: { fontSize: 15, fontWeight: '600', color: Brand.ink },
  perks: { flexDirection: 'row', gap: 10, marginTop: 4 },
  perk: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  perkText: { flex: 1, fontSize: 11, color: Brand.body },
});
