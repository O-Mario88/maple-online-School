import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Btn } from '@/features/portal/PortalParts';
import { BODY, LINE, MUTED, NAVY, TONES, type Tone, WHITE } from '@/features/portal/tokens';

export interface ReasonAsk {
  title: string;
  body: string;
  confirm: string;
  tone?: Tone;
  placeholder?: string;
  /** Whether the reason can be left empty. */
  optional?: boolean;
  onConfirm: (note: string) => void;
}

/** Shortest reason accepted where one is required; it goes in the audit log. */
const MIN_REASON = 5;

/**
 * A small dialog that asks for a written reason before a decision (reject, block, override).
 * Mount it once per page with `ask` set to the decision waiting for a reason, or null.
 */
export function ReasonModal({ ask, onClose }: { ask: ReasonAsk | null; onClose: () => void }) {
  const [note, setNote] = useState('');
  const ready = ask?.optional || note.trim().length >= MIN_REASON;
  const close = () => {
    setNote('');
    onClose();
  };
  return (
    <Modal visible={!!ask} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.box} accessibilityViewIsModal>
          <View style={styles.head}>
            <Text style={styles.title} accessibilityRole="header">
              {ask?.title}
            </Text>
            <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close" hitSlop={10}>
              <Icon name="close" size={22} color={NAVY} />
            </Pressable>
          </View>
          <Text style={styles.body}>{ask?.body}</Text>
          <Text style={styles.label}>{ask?.optional ? 'Note (optional)' : 'Reason (required)'}</Text>
          <TextInput
            style={styles.field}
            value={note}
            onChangeText={setNote}
            multiline
            placeholder={ask?.placeholder ?? 'Write what you checked and why'}
            placeholderTextColor={MUTED}
            accessibilityLabel={ask?.optional ? 'Note' : 'Reason'}
          />
          {!ready ? <Text style={styles.hint}>{`At least ${MIN_REASON} characters. It is saved in the audit log and cannot be edited later.`}</Text> : null}
          <View style={styles.btns}>
            <Btn label="Cancel" kind="outline" onPress={close} height={44} style={styles.flex} />
            <Pressable
              style={[styles.confirm, { backgroundColor: TONES[ask?.tone ?? 'blue'].solid }, !ready && styles.disabled]}
              disabled={!ready}
              onPress={() => {
                ask?.onConfirm(note.trim());
                close();
              }}
              accessibilityRole="button"
              accessibilityState={{ disabled: !ready }}
              accessibilityLabel={ask?.confirm ?? 'Confirm'}>
              <Text style={styles.confirmText}>{ask?.confirm}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'rgba(10,20,50,0.45)' },
  box: { width: '100%', maxWidth: 460, gap: 10, padding: 20, borderRadius: 16, backgroundColor: WHITE },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { flex: 1, fontSize: 18, fontWeight: '800', color: NAVY },
  body: { fontSize: 13.5, lineHeight: 19, color: BODY },
  label: { marginTop: 4, fontSize: 13, fontWeight: '600', color: NAVY },
  field: { minHeight: 90, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: LINE, fontSize: 14, color: NAVY, textAlignVertical: 'top' },
  hint: { fontSize: 12, color: BODY },
  btns: { flexDirection: 'row', gap: 10, marginTop: 6 },
  confirm: { flex: 1, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.45 },
  confirmText: { fontSize: 15, fontWeight: '700', color: WHITE },
});
