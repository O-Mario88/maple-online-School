import { type ReactNode, useState } from 'react';
import { Modal, Pressable, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Icon } from '@/components/icon';

const LANGUAGES = [
  { name: 'English', ready: true },
  { name: 'Luganda', ready: false },
  { name: 'Kiswahili', ready: false },
  { name: 'Français', ready: false },
] as const;

/** Wraps a language button (keeping its look) so it opens the list: English is active, the others are marked as coming. */
export function LanguageMenu({ style, children }: { style?: StyleProp<ViewStyle>; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable style={style} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel="Language: English. Change language" hitSlop={8}>
        {children}
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.scrim} onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Close">
          <View style={styles.sheet}>
            <Text style={styles.title}>Language</Text>
            {LANGUAGES.map((l) => (
              <Pressable key={l.name} style={styles.row} disabled={!l.ready} onPress={() => setOpen(false)} accessibilityRole="radio" accessibilityState={{ checked: l.name === 'English', disabled: !l.ready }}>
                <Text style={[styles.name, !l.ready && styles.muted]}>{l.name}</Text>
                {l.name === 'English' ? <Icon name="check" size={16} color="#1463F3" /> : <Text style={styles.soon}>Coming soon</Text>}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(8,12,20,0.45)' },
  sheet: { width: '100%', maxWidth: 320, paddingVertical: 8, borderRadius: 14, backgroundColor: '#FFFFFF' },
  title: { paddingHorizontal: 18, paddingVertical: 10, fontSize: 15, fontWeight: '700', color: '#0B1424' },
  row: { height: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, borderTopWidth: 1, borderTopColor: '#F0F3F7' },
  name: { fontSize: 14, color: '#0B1424' },
  muted: { color: '#9AA3B2' },
  soon: { fontSize: 11.5, color: '#9AA3B2' },
});
