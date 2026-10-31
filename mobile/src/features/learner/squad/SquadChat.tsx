import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { usePlayback } from '@/features/learner/exam/Walkthrough';
import { mmss, waveform } from '@/lib/feedback';

import type { Message, SquadState } from './useSquad';

const INK = '#0B1424';
const NAVY = '#0B2A6B';
const BODY = '#4A5263';
const BLUE = '#1463F3';
const BARS = waveform(48);
const QUICK = ['👍', '❤️'] as const;

/** A member's face, or their initials when there is no photo. */
export function Face({ s, id, size = 40 }: { s: SquadState; id: string; size?: number }) {
  const p = s.person(id);
  const style = { width: size, height: size, borderRadius: size / 2 };
  if (p.face) return <Image source={p.face} style={style} contentFit="cover" accessibilityLabel={p.name} />;
  const initials = p.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2);
  return (
    <View style={[style, styles.initials]} accessibilityLabel={p.name}>
      <Text style={[styles.initialsText, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

function VoiceNote({ seconds }: { seconds: number }) {
  const p = usePlayback(seconds);
  const played = Math.round((p.pos / seconds) * BARS.length);
  return (
    <View style={styles.voice}>
      <Pressable style={styles.play} onPress={p.toggle} accessibilityRole="button" accessibilityLabel={p.running ? 'Pause voice note' : 'Play voice note'}>
        <Icon name={p.running ? 'pause' : 'playFill'} size={13} color="#FFFFFF" />
      </Pressable>
      <View style={styles.wave}>
        {BARS.map((h, i) => (
          <View key={i} style={[styles.bar, { height: 4 + h * 16, backgroundColor: i < played || (!p.running && p.pos === 0) ? BLUE : '#BFD3F8' }]} />
        ))}
      </View>
      <Text style={styles.voiceTime}>{mmss(p.running || p.pos > 0 ? p.pos : seconds)}</Text>
      <Pressable style={styles.speed} onPress={p.nextSpeed} accessibilityRole="button" accessibilityLabel={`Playback speed ${p.speed}×`}>
        <Text style={styles.speedText}>{`${p.speed}x`}</Text>
      </Pressable>
    </View>
  );
}

function Bubble({ s, m, phone }: { s: SquadState; m: Message; phone: boolean }) {
  const p = s.person(m.who);
  const me = m.who === s.me;
  const counts = s.reactions(m);
  const shown = Object.entries(counts).filter(([, n]) => n > 0);
  return (
    <View style={styles.msg}>
      <Face s={s} id={m.who} size={phone ? 34 : 40} />
      <View style={styles.msgBody}>
        <View style={styles.msgHead}>
          <Text style={[styles.who, me && styles.whoMe]}>{me ? `${p.name} (You)` : p.name}</Text>
          <Text style={styles.time}>{m.time}</Text>
        </View>
        <Text style={[styles.text, me && styles.textMe]}>{m.text}</Text>
        {m.image ? <Image source={m.image} style={[styles.photo, phone && styles.photoP]} contentFit="cover" accessibilityLabel="A handwritten question: 5. Solve for x: 3(x − 2) = 2x + 7" /> : null}
        {m.voice ? <VoiceNote seconds={m.voice} /> : null}
        <View style={styles.reactions}>
          {shown.map(([e, n]) => (
            <Pressable key={e} style={[styles.reaction, s.reacted(m, e) && styles.reactionOn]} onPress={() => s.react(m, e)} accessibilityRole="button" accessibilityLabel={`${e} ${n}`} accessibilityState={{ selected: s.reacted(m, e) }}>
              <Text style={styles.reactionText}>{`${e} ${n}`}</Text>
            </Pressable>
          ))}
          {QUICK.filter((e) => !(e in counts) || counts[e] === 0).map((e) => (
            <Pressable key={e} style={styles.addReaction} onPress={() => s.react(m, e)} accessibilityRole="button" accessibilityLabel={`React ${e}`}>
              <Text style={styles.addReactionText}>{e}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

/** The moderated squad chat: messages, voice notes, reactions and a composer that checks every message. */
export function SquadChat({ s, phone = false, onAttach }: { s: SquadState; phone?: boolean; onAttach: () => void }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.day}>Today</Text>
      <View style={styles.list}>
        {s.chat.map((m) => (
          <Bubble key={m.id} s={s} m={m} phone={phone} />
        ))}
      </View>
      {s.held ? (
        <View style={styles.held} accessibilityLiveRegion="polite">
          <Icon name="shield" size={14} color="#B45309" />
          <Text style={styles.heldText}>{`Not sent. ${s.held}`}</Text>
        </View>
      ) : null}
      <View style={styles.composer}>
        <Pressable onPress={onAttach} accessibilityRole="button" accessibilityLabel="Share a resource" hitSlop={6}>
          <Icon name="link" size={18} color={BODY} />
        </Pressable>
        <TextInput style={styles.input} value={s.draft} onChangeText={s.setDraft} onSubmitEditing={s.send} placeholder="Type a message..." placeholderTextColor="#7A8396" returnKeyType="send" accessibilityLabel="Message the squad" />
        {phone ? null : <Text style={styles.emoji}>🙂</Text>}
        <Pressable onPress={() => s.toast('Hold to record a voice note in the app')} accessibilityRole="button" accessibilityLabel="Record a voice note" hitSlop={6}>
          <Icon name="mic" size={18} color={BODY} />
        </Pressable>
        <Pressable style={styles.send} onPress={s.send} accessibilityRole="button" accessibilityLabel="Send">
          <Icon name="send" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
      <Text style={styles.note}>{`Moderated by ${s.squad.moderator}. Messages with contact details, links or unkind words are held back.`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  initials: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#DDE7FB' },
  initialsText: { fontWeight: '700', color: NAVY },
  day: { alignSelf: 'center', marginBottom: 6, fontSize: 10.5, color: BODY },
  list: { flex: 1, gap: 14 },
  msg: { flexDirection: 'row', gap: 12 },
  msgBody: { flex: 1, alignItems: 'flex-start', gap: 6 },
  msgHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  who: { fontSize: 11.5, fontWeight: '700', color: NAVY },
  whoMe: { color: BLUE },
  time: { fontSize: 10.5, color: BODY },
  text: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#F2F5FA', fontSize: 12, lineHeight: 17, color: INK, overflow: 'hidden' },
  textMe: { backgroundColor: '#EAF1FE' },
  photo: { width: 232, height: 74, borderRadius: 6 },
  photoP: { width: 210, height: 67 },
  voice: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#E6ECF5' },
  play: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: '#0B6BFF' },
  wave: { flexDirection: 'row', alignItems: 'center', gap: 1.5, height: 22 },
  bar: { width: 2, borderRadius: 1 },
  voiceTime: { fontSize: 11, color: INK },
  speed: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4, backgroundColor: '#E8F0FE' },
  speedText: { fontSize: 10.5, fontWeight: '600', color: BLUE },
  reactions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  reaction: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: '#E6ECF5', backgroundColor: '#FFFFFF' },
  reactionOn: { borderColor: '#0B6BFF', backgroundColor: '#EAF1FE' },
  reactionText: { fontSize: 11, color: INK },
  addReaction: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 10, opacity: 0.45 },
  addReactionText: { fontSize: 11 },
  held: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, padding: 8, borderRadius: 6, backgroundColor: '#FEF3C7' },
  heldText: { flex: 1, fontSize: 11.5, color: '#92400E' },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12, paddingLeft: 14, borderRadius: 8, borderWidth: 1, borderColor: '#E1E7F0', backgroundColor: '#FFFFFF' },
  input: { flex: 1, height: 44, fontSize: 12.5, color: INK },
  emoji: { fontSize: 17 },
  send: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#0B6BFF' },
  note: { marginTop: 6, fontSize: 10, color: BODY },
});
