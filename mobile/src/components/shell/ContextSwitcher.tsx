import { Image } from 'expo-image';
import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { Breakpoints } from '@/constants/theme';
import type { IconName } from '@/lib/icons';
import { mockData } from '@/lib/mock';
import { type Portal, PORTAL_LABELS } from '@/lib/navigation';
import { usePortal } from '@/lib/portal-context';
import { SwitcherContext } from '@/lib/switcher-context';

interface Mode {
  key: string;
  portal: Portal;
  title: string;
  tagline: string;
  detail: string;
  short: string;
  icon: IconName;
  tint: string;
  tile?: number;
  photo?: number;
}
interface Account {
  name: string;
  role: string;
  photo: number;
  current: boolean;
}

const BLUE = '#1463F3';
const INK = '#0B1424';
const PORTAL_ICONS: Readonly<Record<Portal, IconName>> = { learner: 'cap', teacher: 'school', parent: 'people', school: 'grid', command: 'settings' };

/** Design builds show the reference's four modes and two accounts; real builds list the person's own portals. */
function modesFor(portals: readonly Portal[]): Mode[] {
  const designed = mockData()?.shared.contexts;
  if (designed) return [...designed];
  return portals.map((p) => ({ key: p, portal: p, title: `${PORTAL_LABELS[p]} Mode`, tagline: '', detail: '', short: '', icon: PORTAL_ICONS[p], tint: BLUE }));
}

function Tile({ m, phone }: { m: Mode; phone: boolean }) {
  const size = phone ? 52 : 70;
  if (m.tile) return <Image source={m.tile} style={{ width: size, height: size, borderRadius: phone ? 12 : 16 }} />;
  return (
    <View style={[styles.tileBox, { width: size, height: size, backgroundColor: `${m.tint}1A` }]}>
      <Icon name={m.icon} size={phone ? 24 : 32} color={m.tint} />
    </View>
  );
}

function ModeCard({ m, on, phone, onPress }: { m: Mode; on: boolean; phone: boolean; onPress: () => void }) {
  const p = phone;
  return (
    <Pressable style={[styles.card, p && styles.cardP, on && styles.cardOn]} onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={`${m.title}${m.tagline ? `, ${m.tagline}` : ''}`}>
      <Tile m={m} phone={p} />
      <View style={styles.flex}>
        <Text style={[styles.mTitle, p && styles.mTitleP]}>{m.title}</Text>
        {m.tagline ? <Text style={[styles.mTag, p && styles.mTagP]}>{m.tagline}</Text> : null}
        {m.detail ? <Text style={[styles.mBody, p && styles.mBodyP]}>{p ? m.short : m.detail}</Text> : null}
      </View>
      {m.photo ? <Image source={m.photo} style={p ? styles.photoP : styles.photo} /> : null}
      {on ? (
        <View style={[styles.tick, p && styles.tickP]}>
          <Icon name="check" size={p ? 13 : 16} color="#FFFFFF" />
        </View>
      ) : (
        <View style={styles.chev}>
          <Icon name="chevronRight" size={p ? 16 : 20} color={INK} />
        </View>
      )}
    </Pressable>
  );
}

function Accounts({ list }: { list: readonly Account[] }) {
  return (
    <>
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>Your Accounts</Text>
        <View style={styles.line} />
      </View>
      <View style={styles.accounts}>
        {list.map((a, i) => (
          <View key={a.name} style={[styles.account, i > 0 && styles.accountRule]}>
            <Image source={a.photo} style={styles.face} />
            <View style={styles.flex}>
              <Text style={styles.accName}>{a.name}</Text>
              <Text style={styles.accRole}>{a.role}</Text>
            </View>
            {a.current ? <Text style={styles.current}>Current</Text> : null}
          </View>
        ))}
      </View>
    </>
  );
}

/** The 1-tap role and school switcher: a sheet that slides up on phones and sits centred on wide screens (built to its reference). */
export function SwitcherProvider({ children }: { children: ReactNode }) {
  const { portal, portals, setPortal } = usePortal();
  const modes = modesFor(portals);
  const accounts = mockData()?.shared.accounts;
  const [visible, setVisible] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const wide = width >= Breakpoints.wide;
  const phone = !wide;
  // The chosen mode while its portal is still the one in use; otherwise the first mode for the portal.
  const current = modes.find((m) => m.key === chosen && m.portal === portal) ?? modes.find((m) => m.portal === portal) ?? modes[0];

  const choose = (m: Mode) => {
    setChosen(m.key);
    setPortal(m.portal);
    setVisible(false);
    router.replace('/');
  };
  const value = { open: () => setVisible(true), label: current?.title ?? '' };

  return (
    <SwitcherContext.Provider value={value}>
      {children}
      <Modal visible={visible} transparent animationType={wide ? 'fade' : 'slide'} onRequestClose={() => setVisible(false)}>
        <View style={[styles.backdrop, wide && styles.backdropWide]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setVisible(false)} accessibilityRole="button" accessibilityLabel="Close" />
          <View style={[styles.sheet, wide ? styles.sheetWide : [styles.sheetP, { paddingBottom: insets.bottom + 16 }]]} accessibilityViewIsModal>
            {phone ? <View style={styles.handle} /> : null}
            <View style={styles.head}>
              <View style={styles.flex}>
                <Text style={[styles.title, phone && styles.titleP]} accessibilityRole="header">
                  Switch Your Role & School
                </Text>
                <Text style={[styles.sub, phone && styles.subP]}>Choose how you want to use Maple. You can switch anytime.</Text>
              </View>
              <Pressable onPress={() => setVisible(false)} accessibilityRole="button" accessibilityLabel="Close" hitSlop={10} style={styles.close}>
                <Text style={[styles.closeText, phone && styles.closeTextP]}>✕</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.scroll} contentContainerStyle={[styles.list, phone && styles.listP]} showsVerticalScrollIndicator={false}>
              {modes.map((m) => (
                <ModeCard key={m.key} m={m} on={m.key === current?.key} phone={phone} onPress={() => choose(m)} />
              ))}
              {wide && accounts ? <Accounts list={accounts} /> : null}
              <Pressable style={[styles.add, phone && styles.addP]} onPress={() => setVisible(false)} accessibilityRole="button">
                <View style={styles.addIcon}>
                  <Icon name="plus" size={phone ? 13 : 15} color={BLUE} />
                </View>
                <Text style={[styles.addText, phone && styles.addTextP]}>Add Another Account</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SwitcherContext.Provider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(11, 20, 36, 0.4)' },
  backdropWide: { justifyContent: 'center', alignItems: 'center', padding: 24 },
  sheet: { backgroundColor: '#FFFFFF' },
  sheetWide: { width: 580, maxHeight: '96%', paddingHorizontal: 22, paddingTop: 20, paddingBottom: 20, borderRadius: 14 },
  sheetP: { maxHeight: '86%', paddingHorizontal: 12, paddingTop: 8, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  handle: { alignSelf: 'center', width: 32, height: 4, borderRadius: 2, marginBottom: 14, backgroundColor: '#8A93A6' },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 2 },
  title: { fontSize: 22, fontWeight: '700', color: INK, letterSpacing: -0.4 },
  titleP: { fontSize: 18 },
  sub: { marginTop: 6, fontSize: 14.5, color: '#3D4656' },
  subP: { marginTop: 8, fontSize: 12.5, lineHeight: 17 },
  close: { paddingTop: 4, paddingHorizontal: 4 },
  closeText: { fontSize: 20, color: INK },
  closeTextP: { fontSize: 16 },
  scroll: { flexGrow: 0 },
  list: { gap: 13, paddingTop: 22 },
  listP: { gap: 9, paddingTop: 18 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 18, minHeight: 107, paddingLeft: 18, paddingRight: 18, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E6EAF1', backgroundColor: '#FFFFFF' },
  cardP: { gap: 12, minHeight: 82, paddingLeft: 10, paddingRight: 10, paddingVertical: 10 },
  cardOn: { borderWidth: 2, borderColor: '#4C8DF6', backgroundColor: '#F3F8FF' },
  tileBox: { borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  mTitle: { fontSize: 16, fontWeight: '700', color: INK },
  mTitleP: { fontSize: 12.5 },
  mTag: { marginTop: 2, fontSize: 14, color: '#3D4656' },
  mTagP: { fontSize: 11 },
  mBody: { marginTop: 8, fontSize: 12.5, lineHeight: 17, color: '#3D4656' },
  mBodyP: { marginTop: 5, fontSize: 9.5, lineHeight: 14 },
  photo: { width: 64, height: 64, borderRadius: 32 },
  photoP: { width: 44, height: 44, borderRadius: 22, alignSelf: 'flex-start', marginTop: 2 },
  tick: { width: 26, height: 26, borderRadius: 13, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start', marginTop: 8 },
  tickP: { width: 20, height: 20, borderRadius: 10, marginTop: 4 },
  chev: { width: 26, alignItems: 'center' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 6 },
  line: { flex: 1, height: 1, backgroundColor: '#E1E6EF' },
  dividerText: { fontSize: 14.5, color: '#3D4656' },
  accounts: { borderRadius: 10, borderWidth: 1, borderColor: '#E6EAF1', paddingHorizontal: 16 },
  account: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10 },
  accountRule: { borderTopWidth: 1, borderTopColor: '#EEF1F6' },
  face: { width: 44, height: 44, borderRadius: 22 },
  accName: { fontSize: 15.5, fontWeight: '600', color: INK },
  accRole: { marginTop: 2, fontSize: 13.5, color: '#3D4656' },
  current: { paddingHorizontal: 13, paddingVertical: 5, borderRadius: 999, backgroundColor: '#E5F0FF', fontSize: 13.5, fontWeight: '500', color: BLUE, overflow: 'hidden' },
  add: { height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, borderRadius: 10, borderWidth: 1, borderColor: '#DCE6F5', backgroundColor: '#EEF4FF' },
  addP: { height: 42, marginTop: 4, borderColor: '#EEF4FF' },
  addIcon: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: BLUE, alignItems: 'center', justifyContent: 'center' },
  addText: { fontSize: 15, fontWeight: '500', color: INK },
  addTextP: { fontSize: 12.5 },
});
