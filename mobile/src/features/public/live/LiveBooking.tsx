import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { formatMoney } from '@/lib/finance/fees';
import { calendarLink, seatsLeft, timeLeft } from '@/lib/live-event';
import type { MockData } from '@/mock';

import { Brand } from '../palette';

export type Session = MockData['publicPages']['liveSession'];

const TICK_MS = 1000;
const SEAT_BAR = ['#FF393F', '#FE9B4A'] as const;

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

export function register(): void {
  router.push('/checkout');
}

/**
 * Countdown, seat counter, price, one-tap register and add-to-calendar, as the
 * live class reference draws them. Desktop sizes are the reference's pixels.
 */
export function LiveBooking({ s, phone = false }: { s: Session; phone?: boolean }) {
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
  const p = phone;

  return (
    <View>
      <Text style={[styles.heading, p && styles.headingP]}>{t.started ? 'Live class is on now' : 'Live class starts in'}</Text>
      <View style={styles.countdown} accessibilityRole="timer" accessibilityLabel={`${t.days} days, ${t.hours} hours, ${t.minutes} minutes until the class starts`}>
        {units.map((u) => (
          <View key={u.label} style={[styles.unit, p && styles.unitP]}>
            <Text style={[styles.unitValue, p && styles.unitValueP]}>{pad(u.value)}</Text>
            <Text style={[styles.unitLabel, p && styles.unitLabelP]}>{u.label}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.seats, p && styles.seatsP]}>
        <View style={styles.seatsHead}>
          <Text style={styles.fire}>🔥</Text>
          <Text style={[styles.seatsTitle, p && styles.seatsTitleP]}>{seats.full ? 'Fully booked' : `Only ${seats.left} seats left!`}</Text>
        </View>
        <View style={styles.track}>
          <LinearGradient colors={SEAT_BAR} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.fill, { width: `${seats.booked * 100}%` }]} />
        </View>
        <View style={styles.seatsFoot}>
          <Text style={[styles.small, p && styles.smallP]}>{`${s.booked} booked of ${s.capacity} seats`}</Text>
          <Text style={[styles.small, p && styles.smallP]}>{String(s.capacity)}</Text>
        </View>
      </View>

      <View style={[styles.priceRow, p && styles.priceRowP]}>
        <Text style={[styles.price, p && styles.priceP]}>{formatMoney(s.priceUGX, 'UGX')}</Text>
        {s.wasUGX > s.priceUGX ? <Text style={[styles.was, p && styles.wasP]}>{formatMoney(s.wasUGX, 'UGX')}</Text> : null}
        <View style={styles.spacer} />
        {off > 0 ? (
          <View style={styles.off}>
            <Text style={styles.offText}>{`${off}% OFF`}</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.access, p && styles.accessP]}>{s.access.replace(/ · /g, ' • ')}</Text>

      <Pressable style={[styles.primary, p && styles.primaryP]} onPress={register} accessibilityRole="button">
        <Icon name="calendar" size={p ? 17 : 15} color={Brand.surface} />
        <Text style={[styles.primaryText, p && styles.btnTextP]}>Register for This Live Class</Text>
      </Pressable>
      <Pressable style={[styles.secondary, p && styles.secondaryP]} onPress={addToCalendar} accessibilityRole="button">
        <Icon name="calendar" size={p ? 17 : 15} color={Brand.ink} />
        <Text style={[styles.secondaryText, p && styles.btnTextP]}>Add to Calendar</Text>
      </Pressable>

      <View style={[styles.perks, p && styles.perksP]}>
        {s.perks.map((k) => (
          <View key={k.label} style={[styles.perk, p && styles.perkP]}>
            <Icon name={k.icon} size={p ? 17 : 18} color={Brand.ink} />
            <Text style={[styles.perkText, p && styles.perkTextP]}>{p ? k.short : k.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 13, fontWeight: '700', color: Brand.ink },
  headingP: { fontSize: 14 },
  countdown: { flexDirection: 'row', gap: 5, marginTop: 10 },
  unit: { flex: 1, height: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#F4F6FA' },
  unitP: { height: 62, borderRadius: 10 },
  unitValue: { fontSize: 20, lineHeight: 24, fontWeight: '700', color: Brand.ink },
  unitValueP: { fontSize: 22, lineHeight: 27 },
  unitLabel: { fontSize: 9.5, color: '#4A5263' },
  unitLabelP: { fontSize: 11 },
  seats: { marginTop: 14, paddingHorizontal: 13, paddingTop: 11, paddingBottom: 9, borderRadius: 8, backgroundColor: '#FDF2F3' },
  seatsP: { paddingHorizontal: 14, paddingTop: 13, paddingBottom: 11, borderRadius: 10 },
  seatsHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fire: { fontSize: 12 },
  seatsTitle: { fontSize: 11, fontWeight: '700', color: '#E5484D' },
  seatsTitleP: { fontSize: 13 },
  track: { height: 6, marginTop: 10, borderRadius: 3, backgroundColor: '#F8D5D8', overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  seatsFoot: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  small: { fontSize: 9, color: '#2A3242' },
  smallP: { fontSize: 11 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 17 },
  priceRowP: { marginTop: 18 },
  price: { fontSize: 20, fontWeight: '700', color: Brand.ink },
  priceP: { fontSize: 24 },
  was: { fontSize: 11, color: '#8A92A3', textDecorationLine: 'line-through' },
  wasP: { fontSize: 12.5 },
  spacer: { flex: 1 },
  off: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: '#12B76A' },
  offText: { fontSize: 9.5, fontWeight: '700', color: Brand.surface },
  access: { marginTop: 6, fontSize: 10.5, color: '#4A5263' },
  accessP: { fontSize: 12 },
  primary: { height: 38, marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 6, backgroundColor: Brand.blue },
  primaryP: { height: 50, marginTop: 18, borderRadius: 10 },
  primaryText: { fontSize: 12.5, fontWeight: '600', color: Brand.surface },
  btnTextP: { fontSize: 15 },
  secondary: { height: 38, marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 6, borderWidth: 1, borderColor: '#D5DCE7', backgroundColor: Brand.surface },
  secondaryP: { height: 48, borderRadius: 10 },
  secondaryText: { fontSize: 12.5, fontWeight: '500', color: Brand.ink },
  perks: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  perksP: { marginTop: 18 },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  perkP: { flex: 1, flexDirection: 'column', gap: 4 },
  perkText: { fontSize: 9, lineHeight: 12.5, color: '#2A3242' },
  perkTextP: { fontSize: 11, lineHeight: 14, textAlign: 'center' },
});
