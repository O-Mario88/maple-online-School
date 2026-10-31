import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { bookingQuote } from '@/lib/booking';
import { formatMoney } from '@/lib/finance/fees';
import type { MockData } from '@/mock';

import { Brand } from '../palette';

type Storefront = MockData['publicPages']['teacherStorefront'];

/** Pick 1:1 or group, a day and a time, then book in one tap. The commission depends on how the learner arrived. */
export function BookingCard({ t, refParam }: { t: Storefront; refParam: string | undefined }) {
  const b = t.booking;
  const [modeKey, setModeKey] = useState(b.modes[0].key);
  const firstOpen = b.days.find((d) => d.slots.length > 0) ?? b.days[0];
  const [dayKey, setDayKey] = useState(firstOpen.key);
  const day = b.days.find((d) => d.key === dayKey) ?? firstOpen;
  const [slot, setSlot] = useState<string | null>(day.slots[0] ?? null);
  const mode = b.modes.find((m) => m.key === modeKey) ?? b.modes[0];
  const quote = bookingQuote(mode.priceUGX, refParam);
  const pct = Math.round(quote.commissionRate * 100);
  const firstName = t.name.replace(/^(Mr|Ms|Mrs|Dr)\.\s*/, '').split(' ')[0];

  const pickDay = (key: string) => {
    const next = b.days.find((d) => d.key === key);
    setDayKey(key);
    setSlot(next?.slots[0] ?? null);
  };

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.headIcon}>
          <Icon name="calendar" size={22} color={Brand.blue} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.title} accessibilityRole="header">
            Book a Live Class or Tutoring Session
          </Text>
          <Text style={styles.muted}>{`Get personal help from ${t.name.split(' ').slice(0, 2).join(' ')}. Choose a time that works for you.`}</Text>
        </View>
      </View>
      <View style={styles.modes} accessibilityRole="tablist">
        {b.modes.map((m) => {
          const on = m.key === modeKey;
          return (
            <Pressable key={m.key} style={[styles.mode, on && styles.modeOn]} onPress={() => setModeKey(m.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
              <Text style={[styles.modeText, on && styles.modeTextOn]}>{m.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.days}>
        {b.days.map((d) => {
          const on = d.key === dayKey;
          const full = d.slots.length === 0;
          return (
            <Pressable
              key={d.key}
              style={[styles.day, on && styles.dayOn, full && styles.dayFull]}
              onPress={() => pickDay(d.key)}
              disabled={full}
              accessibilityRole="button"
              accessibilityState={{ selected: on, disabled: full }}
              accessibilityLabel={`${d.day} ${d.date}${full ? ', fully booked' : ''}`}>
              <Text style={[styles.dayText, on && styles.dayTextOn]}>{d.day}</Text>
              <Text style={[styles.dayDate, on && styles.dayTextOn]}>{d.date}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.slots}>
        {day.slots.length === 0 ? <Text style={styles.muted}>Fully booked. Pick another day.</Text> : null}
        {day.slots.map((s) => {
          const on = s === slot;
          return (
            <Pressable key={s} style={[styles.slot, on && styles.slotOn]} onPress={() => setSlot(s)} accessibilityRole="radio" accessibilityState={{ selected: on }}>
              <Text style={[styles.slotText, on && styles.slotTextOn]}>{s}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.quote}>
        <View style={styles.between}>
          <Text style={styles.quoteTitle}>{mode.title}</Text>
          <Text style={[styles.commission, quote.direct ? styles.commissionZero : styles.commissionStd]}>{`${pct}% Commission`}</Text>
        </View>
        <Text style={styles.price}>
          {formatMoney(mode.priceUGX, 'UGX')}
          <Text style={styles.muted}>{` / ${mode.minutes} minutes`}</Text>
        </Text>
        <Text style={styles.muted}>
          {quote.direct
            ? `You came through ${firstName}'s own link, so the full amount goes to the teacher (0% commission).`
            : `Booked through Maple: ${firstName} receives ${formatMoney(quote.teacherGetsUGX, 'UGX')} after Maple's ${pct}% fee. Use the teacher's own link and they keep 100%.`}
        </Text>
        <Pressable style={[styles.book, !slot && styles.disabled]} disabled={!slot} onPress={() => router.push('/checkout')} accessibilityRole="button">
          <Icon name="calendar" size={18} color={Brand.surface} />
          <Text style={styles.bookText}>{slot ? `Book ${day.day} ${slot}` : 'Pick a time'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  card: { gap: 14, padding: 18, borderRadius: 16, backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line },
  head: { flexDirection: 'row', gap: 12 },
  headIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: Brand.blueSoft, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '700', color: Brand.ink },
  muted: { fontSize: 13, lineHeight: 19, color: Brand.muted },
  modes: { flexDirection: 'row', gap: 6 },
  mode: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: Brand.line },
  modeOn: { backgroundColor: Brand.blue, borderColor: Brand.blue },
  modeText: { fontSize: 14, color: Brand.ink },
  modeTextOn: { color: Brand.surface, fontWeight: '600' },
  days: { flexDirection: 'row', gap: 6 },
  day: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: Brand.line },
  dayOn: { backgroundColor: Brand.blue, borderColor: Brand.blue },
  dayFull: { opacity: 0.4 },
  dayText: { fontSize: 13, color: Brand.ink },
  dayDate: { fontSize: 12, color: Brand.body },
  dayTextOn: { color: Brand.surface, fontWeight: '600' },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: { flexBasis: '30%', flexGrow: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: Brand.line },
  slotOn: { backgroundColor: Brand.blue, borderColor: Brand.blue },
  slotText: { fontSize: 13, color: Brand.ink },
  slotTextOn: { color: Brand.surface, fontWeight: '600' },
  quote: { gap: 8, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: Brand.line },
  quoteTitle: { fontSize: 15, fontWeight: '700', color: Brand.ink },
  commission: { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, overflow: 'hidden' },
  commissionZero: { color: Brand.green, backgroundColor: Brand.greenSoft },
  commissionStd: { color: Brand.amber, backgroundColor: Brand.amberSoft },
  price: { fontSize: 18, fontWeight: '800', color: Brand.ink },
  book: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 48, borderRadius: 10, backgroundColor: Brand.blue, marginTop: 4 },
  bookText: { fontSize: 15, fontWeight: '600', color: Brand.surface },
  disabled: { opacity: 0.45 },
});
