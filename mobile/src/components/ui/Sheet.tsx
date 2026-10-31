import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';

const INK = '#0B1F4D';
const BLUE = '#1463F3';

interface SheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** A centred pop-up with a title, a close button and a scrolling body: the frame every small dialog shares. */
export function Sheet({ visible, title, onClose, children }: SheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.scrim}>
        <View style={styles.dialog} accessibilityViewIsModal>
          <View style={styles.head}>
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" hitSlop={10}>
              <Icon name="close" size={18} color={INK} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

interface SheetButtonProps {
  label: string;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
}

/** A full-width button for a sheet's actions: blue when it is the main one, outlined otherwise. */
export function SheetButton({ label, onPress, primary = false, disabled = false }: SheetButtonProps) {
  return (
    <Pressable
      style={[styles.button, primary ? styles.primary : styles.outline, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}>
      <Text style={[styles.buttonText, primary && styles.primaryText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'rgba(8,12,20,0.5)' },
  dialog: { width: '100%', maxWidth: 460, maxHeight: '90%', borderRadius: 14, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 18, paddingTop: 16 },
  title: { flex: 1, fontSize: 17, fontWeight: '700', color: INK },
  body: { gap: 10, padding: 18 },
  button: { height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  primary: { backgroundColor: BLUE },
  outline: { borderWidth: 1, borderColor: '#D5DEEB' },
  disabled: { opacity: 0.5 },
  buttonText: { fontSize: 14, fontWeight: '600', color: INK },
  primaryText: { color: '#FFFFFF' },
});
