import { Image } from '@/components/picture';
import { type Href, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import type { IconName } from '@/lib/icons';
import { toast } from '@/lib/toast';
import { todayISO } from '@/lib/today';

import { JOIN_EARLY_MINUTES, joinState, SESSION_MINUTES, slotLabel } from './compass';
import { addAction, seedCounseling, seedSaves, toggleAction, useCareerSaves, useCounseling } from './saved';
import type { CC } from './useCompass';
import { Maple, Radii } from '@/constants/maple';
import { Palette } from '@/constants/palette';

const DARK = Maple.navy;
const PANEL = Maple.navy;
const LINE = Maple.navy;
const SOFT = Palette.blue300b;
const WIDE = 900;
const pad = (n: number) => String(n).padStart(2, '0');
const nowLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const wait = (m: number) => (m >= 1440 ? `${Math.floor(m / 1440)} days` : m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`);

function Back() {
  return (
    <Pressable style={s.back} onPress={() => (router.canGoBack() ? router.back() : router.replace('/learn/careers?tab=counselor' as Href))} accessibilityRole="link">
      <Icon name="arrowLeft" size={16} color={SOFT} />
      <Text style={s.backText}>Counselor & Sessions</Text>
    </Pressable>
  );
}

function Control({ icon, label, on = true, danger = false, onPress }: { icon: IconName; label: string; on?: boolean; danger?: boolean; onPress: () => void }) {
  return (
    <Pressable style={[s.control, !on && s.controlOff, danger && s.controlDanger]} onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: on }}>
      <Icon name={icon} size={20} color={Maple.surface} />
      <Text style={s.controlText}>{label}</Text>
    </Pressable>
  );
}

/** A one-to-one counseling call: waiting room, the call, and the end. Video comes from Maple's live service when the API issues the room. */
export function CounselingCall({ cc, sessionId }: { cc: CC; sessionId: string }) {
  seedCounseling({ credits: cc.counseling.credits, sessions: cc.counseling.booked });
  seedSaves({ ...cc.saved, actions: cc.actions, events: cc.registrations });
  const counseling = useCounseling();
  const saves = useCareerSaves();
  const { width } = useWindowDimensions();
  const wide = width >= WIDE;
  const [preview, setPreview] = useState(false);
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(false);
  const [panel, setPanel] = useState<'chat' | 'steps' | null>(wide ? 'chat' : null);
  const [draft, setDraft] = useState('');
  const [chat, setChat] = useState<readonly { from: 'me' | 'them'; text: string }[]>([]);
  const [step, setStep] = useState('');
  const session = counseling.sessions.find((b) => b.id === sessionId);
  const who = cc.counseling.counselors.find((p) => p.id === session?.counselorId);

  if (!session || !who)
    return (
      <SafeAreaView style={s.root}>
        <Back />
        <View style={s.center}>
          <Text style={s.title}>This session isn’t booked</Text>
          <Text style={s.soft}>It may have been moved or cancelled. Check My Sessions.</Text>
        </View>
      </SafeAreaView>
    );

  const now = nowLocal();
  const j = joinState(session.at, now);
  const live = j.state === 'open';

  if (j.state === 'ended')
    return (
      <SafeAreaView style={s.root}>
        <Back />
        <View style={s.center}>
          <Image decorative source={who.photo} style={s.bigPhoto} contentFit="cover" />
          <Text style={s.title}>This session has ended</Text>
          <Text style={s.soft}>{`Your next steps with ${who.name} are in My Plan. Session notes stay between you and your counselor.`}</Text>
        </View>
      </SafeAreaView>
    );

  if (!live && !preview)
    return (
      <SafeAreaView style={s.root}>
        <Back />
        <ScrollView contentContainerStyle={s.waiting}>
          <Image decorative source={who.photo} style={s.bigPhoto} contentFit="cover" />
          <Text style={s.title}>{`Your session with ${who.name}`}</Text>
          <Text style={s.soft}>{`${slotLabel(session.at)} · ${SESSION_MINUTES} minutes · ${session.topic}`}</Text>
          <View style={s.notice}>
            <Icon name="clock" size={18} color={Palette.yellow400b} />
            <Text style={s.noticeText}>{`The room opens ${JOIN_EARLY_MINUTES} minutes before your session, in ${wait(j.minutesToOpen)}.`}</Text>
          </View>
          <View style={s.checks}>
            {(
              [
                ['video', 'Camera', 'Your browser or phone will ask to use it when you join. You can keep it off.'],
                ['mic', 'Microphone', 'Use earphones if you can, for a clearer call.'],
                ['pulse', 'Connection', 'A steady mobile data or Wi-Fi connection works best.'],
                ['lock', 'Private', 'Sessions are never recorded. Only you and your counselor are in the room.'],
              ] as const
            ).map(([icon, t, d]) => (
              <View key={t} style={s.check}>
                <Icon name={icon} size={18} color={SOFT} />
                <View style={s.flex}>
                  <Text style={s.checkTitle}>{t}</Text>
                  <Text style={s.small}>{d}</Text>
                </View>
              </View>
            ))}
          </View>
          <Pressable style={s.primary} onPress={() => setPreview(true)} accessibilityRole="button">
            <Text style={s.primaryText}>Preview the room</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );

  const send = () => {
    if (!draft.trim()) return;
    setChat([...chat, { from: 'me', text: draft.trim() }]);
    setDraft('');
  };
  const addStep = () => {
    if (!step.trim()) return;
    addAction({ id: `a-call-${Date.now()}`, text: step.trim(), due: todayISO(), done: false });
    setStep('');
    toast('Added to your career path in My Plan');
  };
  const sidePanel = panel ? (
    <View style={[s.panel, wide ? s.panelD : s.panelP]}>
      <View style={s.panelTabs}>
        {(
          [
            ['chat', 'Chat'],
            ['steps', 'Next steps'],
          ] as const
        ).map(([k, l]) => (
          <Pressable key={k} style={[s.panelTab, panel === k && s.panelTabOn]} onPress={() => setPanel(k)} accessibilityRole="tab" accessibilityState={{ selected: panel === k }}>
            <Text style={[s.panelTabText, panel === k && s.white]}>{l}</Text>
          </Pressable>
        ))}
      </View>
      {panel === 'chat' ? (
        <>
          <ScrollView style={s.flex} contentContainerStyle={s.chatList}>
            <Text style={s.small}>{`Messages here are seen only by you and ${who.name}.`}</Text>
            {chat.map((m, i) => (
              <Text key={i} style={[s.bubble, m.from === 'me' ? s.mine : s.theirs]}>
                {m.text}
              </Text>
            ))}
          </ScrollView>
          <View style={s.inputRow}>
            <TextInput style={s.input} value={draft} onChangeText={setDraft} onSubmitEditing={send} placeholder="Type a message" placeholderTextColor={SOFT} accessibilityLabel="Message" />
            <Pressable style={s.send} onPress={send} accessibilityRole="button" accessibilityLabel="Send message">
              <Icon name="send" size={16} color={Maple.surface} />
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <ScrollView style={s.flex} contentContainerStyle={s.chatList}>
            <Text style={s.small}>Steps you agree on go to My Plan.</Text>
            {saves.actions.map((a) => (
              <Pressable key={a.id} style={s.stepRow} onPress={() => toggleAction(a.id)} accessibilityRole="checkbox" accessibilityState={{ checked: a.done }}>
                <View style={[s.box, a.done && s.boxOn]}>{a.done ? <Icon name="tick" size={11} color={Maple.surface} /> : null}</View>
                <Text style={[s.stepText, a.done && s.stepDone]}>{a.text}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={s.inputRow}>
            <TextInput style={s.input} value={step} onChangeText={setStep} onSubmitEditing={addStep} placeholder="Add a step we agreed" placeholderTextColor={SOFT} accessibilityLabel="New step" />
            <Pressable style={s.send} onPress={addStep} accessibilityRole="button" accessibilityLabel="Add step">
              <Icon name="plus" size={16} color={Maple.surface} />
            </Pressable>
          </View>
        </>
      )}
    </View>
  ) : null;

  return (
    <SafeAreaView style={s.root}>
      <View style={s.top}>
        <Back />
        <View style={s.flex} />
        <View style={s.badge}>
          <Icon name="lock" size={13} color={Palette.green300} />
          <Text style={s.badgeText}>Private · not recorded</Text>
        </View>
      </View>
      <View style={[s.stageRow, !wide && s.stageCol]}>
        <View style={s.stage}>
          {/* Until video connects, the stage shows the counselor's portrait. */}
          <View style={s.portrait}>
            <Image decorative source={who.photo} style={s.portraitPhoto} contentFit="cover" />
            <Text style={s.title}>{who.name}</Text>
            <Text style={s.soft}>{live ? 'Connecting video…' : 'Not here yet'}</Text>
          </View>
          <View style={s.nameTag}>
            <Text style={s.nameText}>{who.name}</Text>
          </View>
          {!live ? (
            <View style={s.waitTag}>
              <Text style={s.waitText}>{`Preview: ${who.name} joins at ${slotLabel(session.at).split(' · ')[1]}. Video connects when you both join.`}</Text>
            </View>
          ) : null}
          <View style={s.self}>
            <Text style={s.selfText}>{cam ? 'You' : 'Camera off'}</Text>
            {!mic ? <Icon name="micOff" size={14} color={Palette.red300e} /> : null}
          </View>
        </View>
        {sidePanel}
      </View>
      <View style={s.controls}>
        <Control icon={mic ? 'mic' : 'micOff'} label={mic ? 'Mute' : 'Unmute'} on={mic} onPress={() => setMic(!mic)} />
        <Control icon={cam ? 'video' : 'videoOff'} label={cam ? 'Stop video' : 'Start video'} on={cam} onPress={() => setCam(!cam)} />
        <Control icon="chat" label="Chat" on={panel === 'chat'} onPress={() => setPanel(panel === 'chat' ? null : 'chat')} />
        <Control icon="notes" label="Next steps" on={panel === 'steps'} onPress={() => setPanel(panel === 'steps' ? null : 'steps')} />
        <Control
          icon="close"
          label="Leave"
          danger
          onPress={() => {
            router.replace('/learn/careers?tab=counselor' as Href);
            if (live) toast('You left the session. You can rejoin while it’s running.');
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  white: { color: Maple.surface },
  root: { flex: 1, backgroundColor: DARK },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  waiting: { alignItems: 'center', gap: 14, padding: 24, paddingBottom: 60 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 16 },
  backText: { fontSize: 14, fontWeight: '600', color: SOFT },
  title: { fontSize: 22, fontWeight: '800', color: Maple.surface, textAlign: 'center' },
  soft: { maxWidth: 520, fontSize: 14.5, lineHeight: 20, color: SOFT, textAlign: 'center' },
  small: { fontSize: 12.5, lineHeight: 17, color: SOFT },
  bigPhoto: { width: 120, height: 120, borderRadius: 60 },
  notice: { maxWidth: 520, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, backgroundColor: Maple.navy },
  noticeText: { flex: 1, fontSize: 14, color: Palette.yellow300 },
  checks: { width: '100%', maxWidth: 520, gap: 10 },
  check: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, borderRadius: 12, backgroundColor: PANEL },
  checkTitle: { fontSize: 14.5, fontWeight: '700', color: Maple.surface },
  primary: { height: 46, justifyContent: 'center', paddingHorizontal: 26, borderRadius: Radii.control, backgroundColor: Maple.blue },
  primaryText: { fontSize: 15, fontWeight: '700', color: Maple.surface },
  top: { flexDirection: 'row', alignItems: 'center', paddingRight: 16 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: Palette.teal950b },
  badgeText: { fontSize: 12, fontWeight: '700', color: Palette.green300 },
  stageRow: { flex: 1, flexDirection: 'row', gap: 14, paddingHorizontal: 16 },
  stageCol: { flexDirection: 'column' },
  stage: { flex: 1, overflow: 'hidden', borderRadius: 18, backgroundColor: PANEL },
  portrait: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  portraitPhoto: { width: 168, height: 168, borderRadius: 84, borderWidth: 4, borderColor: Maple.navy },
  nameTag: { position: 'absolute', left: 14, bottom: 14, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: 'rgba(15,18,34,0.7)' },
  nameText: { fontSize: 13.5, fontWeight: '700', color: Maple.surface },
  waitTag: { position: 'absolute', top: 14, left: 14, right: 14, padding: 10, borderRadius: 10, backgroundColor: 'rgba(15,18,34,0.78)' },
  waitText: { fontSize: 13, color: Palette.yellow300 },
  self: { position: 'absolute', right: 14, bottom: 14, width: 150, height: 96, alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: Maple.navy },
  selfText: { fontSize: 12.5, fontWeight: '600', color: SOFT },
  panel: { overflow: 'hidden', borderRadius: 18, backgroundColor: PANEL },
  panelD: { width: 340 },
  panelP: { height: 300 },
  panelTabs: { flexDirection: 'row', gap: 6, padding: 10, borderBottomWidth: 1, borderBottomColor: LINE },
  panelTab: { height: 32, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 16 },
  panelTabOn: { backgroundColor: Maple.blue },
  panelTabText: { fontSize: 13, fontWeight: '700', color: SOFT },
  chatList: { gap: 8, padding: 12 },
  bubble: { maxWidth: '85%', overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, fontSize: 13.5, color: Maple.surface },
  mine: { alignSelf: 'flex-end', backgroundColor: Maple.blue },
  theirs: { alignSelf: 'flex-start', backgroundColor: Maple.navy },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderTopWidth: 1, borderTopColor: LINE },
  input: { flex: 1, height: 40, paddingHorizontal: 12, borderRadius: 10, fontSize: 14, color: Maple.surface, backgroundColor: Maple.navy },
  send: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: Maple.blue },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  box: { width: 18, height: 18, alignItems: 'center', justifyContent: 'center', borderRadius: 5, borderWidth: 1.5, borderColor: SOFT },
  boxOn: { borderColor: Maple.successText, backgroundColor: Maple.successText },
  stepText: { flex: 1, fontSize: 13.5, color: Maple.surface },
  stepDone: { color: SOFT, textDecorationLine: 'line-through' },
  controls: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, padding: 16 },
  control: { minWidth: 82, alignItems: 'center', gap: 4, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 14, backgroundColor: Maple.navy },
  controlOff: { backgroundColor: Maple.navy },
  controlDanger: { backgroundColor: Maple.error },
  controlText: { fontSize: 11.5, fontWeight: '600', color: Maple.surface },
});
