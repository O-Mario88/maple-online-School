import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { FormCard, OutlineButton } from './DesignForm';

const SHEET_MAX_WIDTH = 520;

/** A designed form in a centred pop-up: the white form card over a dimmed page, with a Close button. */
export function FormSheet({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.scrim}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" />
        <ScrollView style={styles.sheet} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <FormCard title={title}>
            {children}
            <OutlineButton label="Close" onPress={onClose} />
          </FormCard>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(11, 20, 36, 0.45)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  sheet: { width: '100%', maxWidth: SHEET_MAX_WIDTH, flexGrow: 0 },
  content: { flexGrow: 0 },
});
