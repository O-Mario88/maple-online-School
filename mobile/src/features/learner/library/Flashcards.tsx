import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { MathLine } from '@/features/learner/work/MathText';
import { deckProgress, nextCard, RATINGS, type Rating } from '@/lib/library/shelf';
import type { IconName } from '@/lib/icons';

import type { Hub } from './useShelf';

const INK = '#0B1424';
const NAVY = '#0B2A6B';
const BODY = '#4A5263';
const BLUE = '#1463F3';

type DeckKey = keyof Hub['reader']['decks'];
const DECKS: readonly DeckKey[] = ['My Decks', 'Class Decks', 'Saved'];

const TONE: Record<Rating, { bg: string; fg: string; icon: IconName }> = {
  again: { bg: '#FDECEE', fg: '#E11D48', icon: 'heart' },
  hard: { bg: '#FEF3E2', fg: '#B45309', icon: 'edit' },
  good: { bg: '#E8F0FE', fg: BLUE, icon: 'check' },
  easy: { bg: '#E6F6EC', fg: '#15803D', icon: 'thumbUp' },
};

type Speech = { speechSynthesis?: { speak: (u: unknown) => void; cancel: () => void }; SpeechSynthesisUtterance?: new (t: string) => unknown };
const speech = (globalThis as Speech).speechSynthesis && (globalThis as Speech).SpeechSynthesisUtterance ? (globalThis as Speech) : null;
const say = (text: string) => {
  if (!speech?.speechSynthesis || !speech.SpeechSynthesisUtterance) return;
  speech.speechSynthesis.cancel();
  speech.speechSynthesis.speak(new speech.SpeechSynthesisUtterance(text.replace(/(\d+)\/(\d+)/g, '$1 over $2')));
};

/** One deck's study state: which card, its ratings and stars. Rating a card moves on to the next. */
export function useDecks(hub: Hub) {
  const [deck, setDeck] = useState<DeckKey>('My Decks');
  const [index, setIndex] = useState<Record<DeckKey, number>>({ 'My Decks': 0, 'Class Decks': 0, Saved: 0 });
  const [ratings, setRatings] = useState<Record<DeckKey, Readonly<Record<number, Rating>>>>({ 'My Decks': hub.reader.startRatings, 'Class Decks': {}, Saved: {} });
  const [stars, setStars] = useState<readonly string[]>([]);
  const d = hub.reader.decks[deck];
  const i = index[deck];
  const card = d.cards[i];
  const step = (by: number) => setIndex((x) => ({ ...x, [deck]: nextCard(x[deck], by, d.cards.length) }));
  return {
    deck,
    setDeck,
    d,
    i,
    card,
    step,
    rated: ratings[deck][i],
    progress: deckProgress(ratings[deck], d.cards.length),
    rate: (r: Rating) => {
      setRatings((x) => ({ ...x, [deck]: { ...x[deck], [i]: r } }));
      step(1);
    },
    starred: stars.includes(card.front),
    toggleStar: () => setStars((s) => (s.includes(card.front) ? s.filter((x) => x !== card.front) : [...s, card.front])),
  };
}
export type DeckState = ReturnType<typeof useDecks>;

function DeckPicker({ hub, f }: { hub: Hub; f: DeckState }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.pickerWrap}>
      <Pressable style={styles.picker} onPress={() => setOpen(!open)} accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={`Deck: ${f.d.name}, ${f.d.cards.length} cards`}>
        <Text style={styles.pickerText} numberOfLines={1}>
          {f.d.name} <Text style={styles.muted}>{`(${f.d.cards.length} cards)`}</Text>
        </Text>
        <Icon name="chevronDown" size={14} color={INK} />
      </Pressable>
      <View style={styles.progressBox} accessibilityLabel={`${f.progress}% known`}>
        <Text style={styles.progressText}>{`${f.progress}%`}</Text>
      </View>
      {open ? (
        <View style={styles.menu}>
          {DECKS.map((k) => (
            <Pressable
              key={k}
              style={styles.menuItem}
              onPress={() => {
                f.setDeck(k);
                setOpen(false);
              }}
              accessibilityRole="menuitem">
              <Text style={[styles.menuText, f.deck === k && styles.menuOn]}>{`${hub.reader.decks[k].name} (${hub.reader.decks[k].cards.length})`}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function Card({ f }: { f: DeckState }) {
  return (
    <View style={styles.cardRow}>
      <Pressable style={styles.arrow} onPress={() => f.step(-1)} accessibilityRole="button" accessibilityLabel="Previous card" hitSlop={6}>
        <Icon name="chevronLeft" size={15} color={INK} />
      </Pressable>
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.count}>{`${f.i + 1} / ${f.d.cards.length}`}</Text>
          <Pressable style={styles.star} onPress={f.toggleStar} accessibilityRole="button" accessibilityLabel={f.starred ? 'Unstar card' : 'Star card'} accessibilityState={{ selected: f.starred }}>
            <Icon name="star" size={15} color={f.starred ? '#F59E0B' : '#C3CAD6'} />
          </Pressable>
        </View>
        <View style={styles.qRow}>
          <MathLine text={f.card.front} size={18} color={NAVY} />
          {speech && Platform.OS === 'web' ? (
            <Pressable onPress={() => say(`${f.card.front}. ${f.card.back}`)} accessibilityRole="button" accessibilityLabel="Read the card aloud" hitSlop={6}>
              <Icon name="volume" size={15} color={BLUE} />
            </Pressable>
          ) : null}
        </View>
        <View style={styles.answer}>
          <MathLine text={f.card.back} size={12.5} color={BODY} />
        </View>
        <View style={styles.tags}>
          <Text style={[styles.tag, styles.tagBlue]}>Mathematics</Text>
          <Text style={[styles.tag, styles.tagGreen]}>{f.card.tag}</Text>
          {f.rated ? <Text style={[styles.tag, { backgroundColor: TONE[f.rated].bg, color: TONE[f.rated].fg }]}>{`Rated ${f.rated}`}</Text> : null}
        </View>
      </View>
      <Pressable style={[styles.arrow, styles.arrowRight]} onPress={() => f.step(1)} accessibilityRole="button" accessibilityLabel="Next card" hitSlop={6}>
        <Icon name="chevronRight" size={15} color={INK} />
      </Pressable>
    </View>
  );
}

function Ratings({ f }: { f: DeckState }) {
  return (
    <View style={styles.ratings}>
      {RATINGS.map((r) => (
        <Pressable key={r.key} style={[styles.rate, { backgroundColor: TONE[r.key].bg }]} onPress={() => f.rate(r.key)} accessibilityRole="button" accessibilityLabel={`${r.label}: see again in ${r.next}`}>
          <Icon name={TONE[r.key].icon} size={13} color={TONE[r.key].fg} />
          <Text style={[styles.rateLabel, { color: TONE[r.key].fg }]}>{r.label}</Text>
          <Text style={styles.rateNext}>{r.next}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** Flashcards panel: deck tabs, picker, the card, spaced-repetition ratings and the auto-generated deck. */
export function Flashcards({ hub, f }: { hub: Hub; f: DeckState }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>Flashcards</Text>
      <View style={styles.tabs} accessibilityRole="tablist">
        {DECKS.map((k) => (
          <Pressable key={k} style={[styles.tab, f.deck === k && styles.tabOn]} onPress={() => f.setDeck(k)} accessibilityRole="tab" accessibilityState={{ selected: f.deck === k }}>
            <Text style={[styles.tabText, f.deck === k && styles.tabTextOn]}>{k}</Text>
          </Pressable>
        ))}
      </View>
      <DeckPicker hub={hub} f={f} />
      <Card f={f} />
      <Ratings f={f} />
      <View style={styles.auto}>
        <View style={styles.autoHead}>
          <Image source={hub.reader.autoIcon} style={styles.autoIcon} contentFit="contain" />
          <Text style={styles.autoTitle}>Auto-Generated From Your Classes</Text>
        </View>
        <Text style={styles.autoText}>This deck was created from your recent live classes and notes on Fractions and Decimals.</Text>
        <Pressable style={styles.autoBtn} onPress={() => router.push('/learn/course')} accessibilityRole="link">
          <Text style={styles.autoBtnText}>View Source Lessons</Text>
          <Icon name="arrowRight" size={14} color={BLUE} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: 12 },
  title: { fontSize: 17, fontWeight: '700', color: INK },
  tabs: { flexDirection: 'row', gap: 4 },
  tab: { flex: 1, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 5 },
  tabOn: { backgroundColor: '#E8F0FE' },
  tabText: { fontSize: 12, color: INK },
  tabTextOn: { fontWeight: '600', color: BLUE },
  pickerWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 4 },
  picker: { flex: 1, height: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: '#DCE3EE', backgroundColor: '#FFFFFF' },
  pickerText: { flex: 1, fontSize: 11.5, color: INK },
  muted: { color: BODY },
  progressBox: { width: 40, height: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: '#EEF4FF' },
  progressText: { fontSize: 10.5, fontWeight: '700', color: BLUE },
  menu: { position: 'absolute', top: 38, left: 0, right: 48, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#E1E7F0', backgroundColor: '#FFFFFF' },
  menuItem: { height: 30, justifyContent: 'center', paddingHorizontal: 12 },
  menuText: { fontSize: 12, color: INK },
  menuOn: { fontWeight: '700', color: BLUE },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  arrow: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginRight: -12, borderRadius: 14, borderWidth: 1, borderColor: '#E1E7F0', backgroundColor: '#FFFFFF', zIndex: 2 },
  arrowRight: { marginRight: 0, marginLeft: -12 },
  card: { flex: 1, minHeight: 250, paddingHorizontal: 22, paddingVertical: 14, borderRadius: 8, borderWidth: 1, borderColor: '#E8EDF4', backgroundColor: '#FFFFFF' },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  count: { fontSize: 11, color: BODY },
  star: { position: 'absolute', right: 0 },
  qRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 18 },
  answer: { marginTop: 18 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 'auto', paddingTop: 14 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, fontSize: 10.5, overflow: 'hidden' },
  tagBlue: { backgroundColor: '#E8F0FE', color: BLUE },
  tagGreen: { backgroundColor: '#E6F6EC', color: '#15803D' },
  ratings: { flexDirection: 'row', gap: 8 },
  rate: { flex: 1, height: 62, alignItems: 'center', justifyContent: 'center', gap: 2, borderRadius: 6 },
  rateLabel: { fontSize: 12, fontWeight: '600' },
  rateNext: { fontSize: 10, color: BODY },
  auto: { gap: 8, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#EEF1F6' },
  autoHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  autoIcon: { width: 22, height: 22 },
  autoTitle: { fontSize: 12.5, fontWeight: '600', color: INK },
  autoText: { fontSize: 11.5, lineHeight: 17, color: BODY },
  autoBtn: { height: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 6, borderWidth: 1, borderColor: '#DCE3EE' },
  autoBtnText: { fontSize: 12, fontWeight: '500', color: BLUE },
});
