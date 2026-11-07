import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { L } from '@/features/learner/frame/LightFrame';
import { useMyCareerRequests, useSendCareerRequest } from '@/lib/careers/queries';
import { type CareerRequestKind, requestStatus } from '@/lib/careers/requests';
import { toast } from '@/lib/toast';

import { cs, BRAND_BLUE, shortDate, Tag } from './CareerParts';
import { Maple, Radii } from '@/constants/maple';

const MIN = 3;
const MAX = 500;

/** Send a request to Maple's career team (saved by the API), and see earlier ones with the team's answer. */
export function CareerRequestForm({ kind, intro, placeholder, sentToast, onSent }: { kind: CareerRequestKind; intro: string; placeholder: string; sentToast: string; onSent?: () => void }) {
  const [text, setText] = useState('');
  const send = useSendCareerRequest();
  const mine = useMyCareerRequests();
  const ready = text.trim().length >= MIN && !send.isPending;
  const earlier = (mine.data ?? []).filter((r) => r.kind === kind);
  const submit = () =>
    send.mutate(
      { kind, body: text.trim() },
      {
        onSuccess: () => {
          setText('');
          toast(sentToast);
          onSent?.();
        },
      },
    );
  return (
    <View style={s.stack}>
      <Text style={cs.body}>{intro}</Text>
      <TextInput style={s.input} value={text} onChangeText={setText} placeholder={placeholder} placeholderTextColor={L.body} multiline maxLength={MAX} accessibilityLabel={placeholder} />
      <Text style={cs.note}>{`${text.trim().length}/${MAX}`}</Text>
      {send.error ? <Text style={s.error}>{send.error.message}</Text> : null}
      <Pressable style={[s.btn, !ready && s.disabled]} disabled={!ready} onPress={submit} accessibilityRole="button" accessibilityState={{ disabled: !ready, busy: send.isPending }}>
        {send.isPending ? <ActivityIndicator color={L.white} /> : <Text style={s.btnText}>Send</Text>}
      </Pressable>
      <Text style={s.label}>Your earlier requests</Text>
      {mine.isLoading ? <ActivityIndicator color={BRAND_BLUE} /> : null}
      {mine.isError ? <Text style={cs.small}>Couldn’t load your earlier requests just now. Try again later.</Text> : null}
      {mine.data && !earlier.length ? <Text style={cs.small}>None yet.</Text> : null}
      {earlier.map((r) => {
        const st = requestStatus(r.status);
        return (
          <View key={r.id} style={s.row}>
            <View style={s.flex}>
              <Text style={cs.body}>{r.body}</Text>
              <Text style={cs.small}>{shortDate(r.created_at.slice(0, 10))}</Text>
            </View>
            <Tag text={st.label} tone={st.tone} />
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  stack: { gap: 10 },
  input: { minHeight: 90, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: L.line, fontSize: 14, color: L.ink, textAlignVertical: 'top' },
  error: { fontSize: 13, color: Maple.error },
  btn: { minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: Radii.control, backgroundColor: BRAND_BLUE },
  btnText: { fontSize: 14, fontWeight: '700', color: L.white },
  disabled: { opacity: 0.45 },
  label: { marginTop: 6, fontSize: 13.5, fontWeight: '700', color: L.navy },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Maple.blueSelected },
});
