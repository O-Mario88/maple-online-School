import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Sheet, SheetButton } from '@/components/ui/Sheet';
import { useAuth } from '@/lib/auth/auth-context';
import { MAX_MESSAGE } from '@/lib/squad';
import { reviewProblem } from '@/lib/review';
import type { MockData } from '@/mock';

import { Brand } from '../palette';

type Course = MockData['publicPages']['coursePage'];
export type NewReview = { name: string; stars: number; text: string; when: string };

/** The surname a catalogue search finds a teacher's courses by ("Mr. James Kato" → "Kato"). */
const surname = (name: string) => name.trim().split(/\s+/).pop() ?? name;

/** The teacher's full profile: photo, stats, bio and a link to all their courses. */
export function TeacherSheet({ course, visible, onClose }: { course: Course; visible: boolean; onClose: () => void }) {
  const t = course.teacher;
  const seeCourses = () => {
    onClose();
    router.push({ pathname: '/explore', params: { q: surname(t.name) } });
  };
  return (
    <Sheet visible={visible} title={t.name} onClose={onClose}>
      <View style={styles.teacherTop}>
        <View style={styles.avatar}>{t.photo ? <Image source={t.photo} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel={t.name} /> : null}</View>
        <View style={styles.flex}>
          <Text style={styles.strong}>{`${t.name}${t.verified ? '  ✓ Verified' : ''}`}</Text>
          <Text style={styles.body}>{t.title}</Text>
        </View>
      </View>
      <View style={styles.stats}>
        {t.stats.map((s) => (
          <View key={s.label} style={styles.stat}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.muted}>{s.label}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.body}>{t.bio}</Text>
      <SheetButton primary label={`See all courses by ${t.name}`} onPress={seeCourses} />
    </Sheet>
  );
}

/** Rate and review the course. Visitors are asked to sign in first; a learner's review is added for a quick check. */
export function ReviewSheet({ visible, onClose, onPosted }: { visible: boolean; onClose: () => void; onPosted: (r: NewReview) => void }) {
  const { status } = useAuth();
  const [stars, setStars] = useState(0);
  const [text, setText] = useState('');
  const [tried, setTried] = useState(false);
  const problem = reviewProblem(stars, text);

  const close = () => {
    setStars(0);
    setText('');
    setTried(false);
    onClose();
  };
  const post = () => {
    setTried(true);
    if (problem) return;
    onPosted({ name: 'You', stars, text: text.trim(), when: 'Just now · awaiting a quick check' });
    close();
  };

  if (status !== 'signedIn') {
    return (
      <Sheet visible={visible} title="Write a review" onClose={close}>
        <Text style={styles.body}>Sign in with the account you study this course on, so other learners know every review comes from a real student.</Text>
        <SheetButton
          primary
          label="Sign in to review"
          onPress={() => {
            close();
            router.push('/sign-in');
          }}
        />
        <SheetButton label="Not now" onPress={close} />
      </Sheet>
    );
  }

  return (
    <Sheet visible={visible} title="Write a review" onClose={close}>
      <Text style={styles.label}>Your rating</Text>
      <View style={styles.starRow} accessibilityRole="radiogroup">
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => setStars(n)} hitSlop={6} accessibilityRole="radio" accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`} accessibilityState={{ checked: stars === n }}>
            <Text style={[styles.star, n <= stars && styles.starOn]}>★</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>Your review</Text>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        multiline
        maxLength={MAX_MESSAGE}
        placeholder="What helped you most? What could be better?"
        placeholderTextColor="#8A92A3"
        accessibilityLabel="Your review"
      />
      {tried && problem ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {problem}
        </Text>
      ) : null}
      <SheetButton primary label="Post review" onPress={post} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  teacherTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 64, height: 64, borderRadius: 32, overflow: 'hidden', backgroundColor: Brand.blueSoft },
  strong: { fontSize: 15, fontWeight: '700', color: Brand.ink },
  body: { fontSize: 13.5, lineHeight: 20, color: Brand.body },
  muted: { fontSize: 12, color: Brand.muted },
  stats: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, padding: 10, borderRadius: 10, backgroundColor: '#F4F7FC' },
  statValue: { fontSize: 15, fontWeight: '700', color: Brand.ink },
  label: { fontSize: 12.5, fontWeight: '600', color: Brand.ink },
  starRow: { flexDirection: 'row', gap: 6 },
  star: { fontSize: 28, color: '#D5DEEB' },
  starOn: { color: '#F5A524' },
  input: { minHeight: 96, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#D5DEEB', fontSize: 14, color: Brand.ink, textAlignVertical: 'top' },
  error: { fontSize: 12.5, color: '#B42318' },
});
