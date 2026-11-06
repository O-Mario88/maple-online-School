import { Image } from '@/components/picture';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Avatar, Btn, Card, CardHead, Pill, Toggle } from '@/features/portal/PortalParts';
import { BLUE, BODY, GREEN, LINE, NAVY, SELECT, SOFT, WHITE } from '@/features/portal/tokens';
import type { IconName } from '@/lib/icons';
import { toast } from '@/lib/toast';
import type { ParentPortal, PortalChild } from '@/mock/portal';
import { Maple } from '@/constants/maple';

type Settings = ParentPortal['settings'];

const addChild = () => router.push('/claim-child');

/** My Children: each linked child with their school, and "Claim Another Child". */
export function ChildrenCard({ list, phone = false }: { list: readonly PortalChild[]; phone?: boolean }) {
  const rows = (
    <View style={styles.childList}>
      {list.map((c) => (
        <Pressable
          key={c.id}
          style={({ hovered }) => [styles.child, phone && styles.childPhone, hovered && styles.hover]}
          onPress={() => toast(`${c.name}'s profile: ${c.level}, ${c.school}.`)}
          accessibilityRole="button"
          accessibilityLabel={`${c.name}, ${c.level}, ${c.school}`}>
          <Image source={c.avatar} style={phone ? styles.childAvatarPhone : styles.childAvatar} contentFit="cover" />
          <View style={styles.flex}>
            <Text style={styles.childName}>{c.name}</Text>
            {phone ? (
              <>
                <Text style={styles.childMeta}>{c.level}</Text>
                <Text style={styles.childMeta}>{c.school}</Text>
              </>
            ) : (
              <Text style={styles.childMeta}>{`${c.level}   •   ${c.school}`}</Text>
            )}
          </View>
          {phone ? null : <Pill label="Active" tone="green" size={14} style={styles.active} />}
          <Icon name="chevronRight" size={22} color={BLUE} />
        </Pressable>
      ))}
      <Pressable style={[styles.claim, phone && styles.claimPhone]} onPress={addChild} accessibilityRole="button" accessibilityLabel="Claim Another Child">
        <View style={[styles.claimTile, phone && styles.claimTilePhone]}>
          <Icon name="qr" size={34} color={BLUE} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.claimTitle}>Claim Another Child</Text>
          <Text style={styles.claimBody}>
            {phone
              ? "Scan your child's school QR code or enter the join code to add them to your account."
              : "Scan your child's school QR code or enter the 6-digit join code provided by the school to add them to your account."}
          </Text>
        </View>
        <Icon name="chevronRight" size={22} color={BLUE} />
      </Pressable>
    </View>
  );
  if (phone) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.phoneSection}>My Children</Text>
          <Btn label="Add Child" icon="plus" onPress={addChild} height={48} style={styles.addBtn} />
        </View>
        {rows}
      </View>
    );
  }
  return (
    <Card style={styles.gapCard}>
      <CardHead title="My Children" subtitle="Manage the children linked to your account." size={20} right={<Btn label="Add Child" icon="plus" onPress={addChild} height={50} style={styles.addBtn} />} />
      {rows}
    </Card>
  );
}

/** How to Add a Child: the three steps beside the reference's phone mock-up. */
export function HowToCard({ s }: { s: Settings }) {
  return (
    <Card style={styles.howCard}>
      <View style={styles.howSteps}>
        <Text style={styles.cardTitle}>How to Add a Child</Text>
        {s.howTo.map((h) => (
          <View key={h.title} style={styles.howStep}>
            <View style={styles.howIcon}>
              <Icon name={h.icon} size={26} color={BLUE} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.howTitle}>{h.title}</Text>
              <Text style={styles.howBody}>{h.body}</Text>
            </View>
          </View>
        ))}
      </View>
      <Image source={s.qrPhone} style={styles.qrPhone} contentFit="contain" accessibilityLabel="A phone scanning a school QR code" />
    </Card>
  );
}

/** Parent & Guardian Access: who else can see the children's updates, and how much. */
export function GuardiansCard({ s, phone = false }: { s: Settings; phone?: boolean }) {
  const add = () => toast('Invite a guardian by phone number or email.');
  return (
    <Card style={[styles.gapCard, phone && styles.cardPhone]}>
      <CardHead
        title="Parent & Guardian Access"
        subtitle={phone ? 'Allow other trusted guardians to receive updates for your children.' : "Add family members who can receive updates and access your children's information."}
        size={phone ? 19 : 20}
        right={phone ? undefined : <Btn label="Add Guardian" icon="plus" kind="soft" onPress={add} height={50} style={styles.addBtn} />}
      />
      <View style={styles.childList}>
        {s.guardians.slice(0, phone ? 2 : 3).map((g) => (
          <View key={g.name} style={[styles.guardian, phone && styles.guardianPhone]}>
            <Avatar source={g.avatar} size={phone ? 48 : 64} badge={g.name.startsWith('John') && !phone ? 'check' : 'none'} />
            <View style={styles.flex}>
              <Text style={[styles.guardianName, phone && styles.guardianNamePhone]} numberOfLines={1}>
                {g.name}
              </Text>
              <Text style={[styles.childMeta, phone && styles.guardianRolePhone]} numberOfLines={1}>
                {g.role}
              </Text>
            </View>
            <Pill label={g.access} tone={g.you ? 'green' : 'blue'} size={phone ? 13.5 : 14} style={phone ? styles.accessPhone : styles.access} />
            {g.you ? (
              phone ? (
                <View style={styles.dotsSpace} />
              ) : (
                <View style={styles.youChip}>
                  <Text style={styles.youText}>You</Text>
                </View>
              )
            ) : (
              <Pressable style={styles.dots} onPress={() => toast(`Change ${g.name}'s access or remove them.`)} accessibilityRole="button" accessibilityLabel={`Options for ${g.name}`} hitSlop={8}>
                <Icon name="more" size={22} color={BLUE} />
              </Pressable>
            )}
          </View>
        ))}
      </View>
      {phone ? <Btn label="Add Guardian" icon="plus" kind="soft" onPress={add} height={50} /> : null}
    </Card>
  );
}

/** A row with an icon, a title and a line, and a switch on the right. */
function SwitchRow({
  icon,
  title,
  body,
  value,
  onChange,
  whatsapp,
}: {
  icon?: IconName;
  title: string;
  body: string;
  value: boolean;
  onChange: (v: boolean) => void;
  whatsapp?: number;
}) {
  return (
    <View style={styles.switchRow}>
      {whatsapp ? <Image source={whatsapp} style={styles.whatsapp} contentFit="contain" /> : icon ? <Icon name={icon} size={28} color={BLUE} /> : null}
      <View style={styles.flex}>
        <Text style={styles.switchTitle}>{title}</Text>
        <Text style={styles.switchBody}>{body}</Text>
      </View>
      <Toggle value={value} onChange={onChange} label={title} />
    </View>
  );
}

/** Privacy & permissions: three switches and the privacy policy. */
export function PrivacyCard({ s }: { s: Settings }) {
  const [on, setOn] = useState<Readonly<Record<string, boolean>>>({ photos: true, names: true, contact: true });
  return (
    <Card style={styles.gapCard}>
      <CardHead title="Privacy & permissions" subtitle="Control what information can be shared and how your child's data is used." size={20} />
      <View style={styles.boxList}>
        {s.privacy.map((p, i) => (
          <View key={p.key} style={i > 0 ? styles.boxLine : undefined}>
            <SwitchRow icon={p.icon} title={p.title} body={p.body} value={on[p.key] ?? false} onChange={(v) => setOn((prev) => ({ ...prev, [p.key]: v }))} />
          </View>
        ))}
      </View>
      <Btn label="View Full Privacy Policy" icon="doc" kind="outline" onPress={() => router.push('/privacy')} height={50} />
    </Card>
  );
}

/** Notifications: the Sunday WhatsApp digest and its number, then the other alerts. */
export function NotificationsCard({ s, phone = false }: { s: Settings; phone?: boolean }) {
  const d = s.digest;
  const [on, setOn] = useState<Readonly<Record<string, boolean>>>({ digest: true, announcements: true, reminders: true, grades: true, messages: true });
  const set = (key: string) => (v: boolean) => setOn((prev) => ({ ...prev, [key]: v }));
  return (
    <Card style={styles.gapCard}>
      <CardHead title="Notifications" subtitle="Choose how and when you receive updates." size={20} />
      <View style={styles.digest}>
        <SwitchRow whatsapp={d.whatsapp} title={d.title} body={d.body} value={on.digest ?? false} onChange={set('digest')} />
        {on.digest ? (
          <View style={[styles.digestPhone, phone && styles.digestPhoneNarrow]}>
            <Text style={styles.digestLabel}>WhatsApp phone number</Text>
            <View style={styles.phoneRow}>
              <View style={styles.flagBox}>
                <Image source={d.flag} style={styles.flag} contentFit="cover" />
              </View>
              <View style={styles.phoneField}>
                <Text style={styles.phoneText} numberOfLines={1}>
                  {d.phone}
                </Text>
              </View>
              <Btn label="Edit" kind="outline" onPress={() => toast('Change the number the digest is sent to.')} height={50} style={styles.editBtn} />
            </View>
            <View style={styles.note}>
              <Icon name="check" size={20} color={GREEN} />
              <Text style={styles.noteText}>{d.note}</Text>
            </View>
          </View>
        ) : null}
      </View>
      <View style={styles.boxList}>
        {s.alerts.map((a, i) => (
          <View key={a.key} style={i > 0 ? styles.boxLine : undefined}>
            <SwitchRow icon={a.icon} title={a.title} body={a.body} value={on[a.key] ?? false} onChange={set(a.key)} />
          </View>
        ))}
      </View>
    </Card>
  );
}

/** Account Settings: name, email, phone and password, each opening its own edit. */
export function AccountCard({ s, phone = false }: { s: Settings; phone?: boolean }) {
  return (
    <Card style={styles.gapCard}>
      <CardHead title="Account Settings" subtitle="Manage your personal account." size={20} />
      <View style={styles.boxList}>
        {s.account.map((a, i) => (
          <Pressable
            key={a.label}
            style={({ hovered }) => [styles.accountRow, i > 0 && styles.boxLine, hovered && styles.hover]}
            onPress={() => toast(a.label === 'Change Password' ? 'We’ll text you a code to set a new password.' : `Edit your ${a.label.toLowerCase()}.`)}
            accessibilityRole="button"
            accessibilityLabel={a.value ? `${a.label}: ${a.value}` : a.label}>
            <Icon name={a.icon} size={22} color={BLUE} />
            <View style={[styles.flex, !phone && styles.accountInline]}>
              <Text style={[styles.accountLabel, !phone && styles.accountLabelWide]}>{a.label}</Text>
              {a.value ? (
                <Text style={[styles.accountValue, phone && styles.accountValuePhone]} numberOfLines={1}>
                  {a.value}
                </Text>
              ) : null}
            </View>
            <Icon name="chevronRight" size={20} color={BLUE} />
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  hover: { backgroundColor: SOFT },
  gapCard: { gap: 18 },
  cardPhone: { padding: 16, gap: 14 },
  section: { gap: 14 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  phoneSection: { fontSize: 21, fontWeight: '800', color: NAVY },
  cardTitle: { fontSize: 20, fontWeight: '800', color: NAVY, letterSpacing: -0.2 },
  addBtn: { paddingHorizontal: 22 },
  childList: { gap: 12 },
  child: { flexDirection: 'row', alignItems: 'center', gap: 22, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  childPhone: { gap: 18, paddingHorizontal: 14, paddingVertical: 12 },
  childAvatar: { width: 84, height: 84, borderRadius: 42 },
  childAvatarPhone: { width: 84, height: 84, borderRadius: 42 },
  childName: { fontSize: 20, fontWeight: '800', color: NAVY },
  childMeta: { marginTop: 3, fontSize: 15.5, color: BODY },
  active: { alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  claim: { flexDirection: 'row', alignItems: 'center', gap: 22, padding: 18, borderRadius: 14, backgroundColor: Maple.blueSelected },
  claimPhone: { gap: 14, padding: 14 },
  claimTile: { width: 74, height: 74, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: WHITE, borderWidth: 1, borderColor: Maple.blueLine },
  claimTilePhone: { width: 64, height: 64 },
  claimTitle: { fontSize: 17, fontWeight: '700', color: BLUE },
  claimBody: { marginTop: 4, fontSize: 14.5, lineHeight: 21, color: BODY },
  howCard: { flexDirection: 'row', gap: 16, paddingBottom: 0, overflow: 'hidden' },
  howSteps: { flex: 1, gap: 22, paddingBottom: 20 },
  howStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 18 },
  howIcon: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', backgroundColor: SELECT },
  howTitle: { fontSize: 16.5, fontWeight: '700', color: NAVY },
  howBody: { marginTop: 4, fontSize: 14.5, lineHeight: 21, color: BODY },
  qrPhone: { width: 196, height: 300, alignSelf: 'flex-end' },
  guardian: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 4 },
  guardianName: { fontSize: 16.5, fontWeight: '700', color: NAVY },
  guardianPhone: { gap: 12 },
  guardianNamePhone: { fontSize: 15 },
  guardianRolePhone: { fontSize: 14 },
  accessPhone: { alignSelf: 'center', paddingHorizontal: 10, paddingVertical: 7 },
  access: { alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 8 },
  youChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: SELECT, borderWidth: 1, borderColor: Maple.blueLine },
  youText: { fontSize: 14, fontWeight: '600', color: BLUE },
  dots: { width: 22, alignItems: 'center' },
  dotsSpace: { width: 22 },
  boxList: { borderRadius: 14, borderWidth: 1, borderColor: LINE },
  boxLine: { borderTopWidth: 1, borderColor: LINE },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 18, paddingHorizontal: 18, paddingVertical: 14 },
  switchTitle: { fontSize: 16, fontWeight: '700', color: NAVY },
  switchBody: { marginTop: 3, fontSize: 14, lineHeight: 20, color: BODY },
  whatsapp: { width: 38, height: 38 },
  digest: { borderRadius: 14, borderWidth: 1, borderColor: LINE, paddingBottom: 16 },
  digestPhone: { gap: 10, marginLeft: 74, marginRight: 18 },
  digestPhoneNarrow: { marginLeft: 18 },
  digestLabel: { fontSize: 14.5, color: BODY },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flagBox: { width: 50, height: 50, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: Maple.errorSoft },
  flag: { width: 30, height: 22, borderRadius: 4 },
  phoneField: { flex: 1, minWidth: 0, height: 50, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: LINE },
  phoneText: { fontSize: 16.5, color: NAVY },
  editBtn: { paddingHorizontal: 18 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  noteText: { flex: 1, fontSize: 14.5, color: BODY },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: 18, paddingHorizontal: 18, paddingVertical: 15 },
  accountInline: { flexDirection: 'row', alignItems: 'center' },
  accountLabel: { fontSize: 15.5, color: BODY },
  accountLabelWide: { width: 220 },
  accountValue: { flex: 1, minWidth: 0, fontSize: 15.5, color: BODY },
  accountValuePhone: { flex: 0, marginTop: 2, fontSize: 14, color: NAVY },
});
