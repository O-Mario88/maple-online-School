import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { formatMoney } from '@/lib/finance/fees';
import type { MockData } from '@/mock';

import { Brand, CARD_SHADOW } from '../palette';

type Invoice = MockData['publicPages']['invoicePage'];

const WHATSAPP_GREEN = '#25D366';

/** Page header: logo, "secure payment", and WhatsApp help. */
export function CheckoutHeader({ wide }: { wide: boolean }) {
  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <Text style={styles.leaf}>🍁</Text>
        <View>
          <Text style={styles.name}>Maple</Text>
          <Text style={styles.tag}>Global Online School</Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        <View style={styles.headerItem}>
          <Icon name="lock" size={18} color={Brand.ink} />
          <View>
            <Text style={styles.strong}>Secure Payment</Text>
            {wide ? <Text style={styles.muted}>Your information is encrypted</Text> : null}
          </View>
        </View>
        {wide ? (
          <View style={styles.headerItem}>
            <Text style={styles.whatsapp}>✆</Text>
            <View>
              <Text style={styles.strong}>Need help?</Text>
              <Text style={styles.link}>Chat on WhatsApp</Text>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

/** Who the payment is for, what it covers, and the total. */
export function CheckoutSummary({ inv, total }: { inv: Invoice; total: number }) {
  const facts = [
    { icon: 'school' as const, text: inv.child.school },
    { icon: 'people' as const, text: `Parent/Guardian: ${inv.child.guardian}` },
    { icon: 'calendar' as const, text: `Academic Year: ${inv.child.year}` },
    { icon: 'notes' as const, text: `Invoice: ${inv.invoice}` },
  ];
  return (
    <View style={styles.gap}>
      <View style={styles.child}>
        <Image source={inv.child.photo} style={styles.photo} contentFit="cover" accessibilityLabel={inv.child.name} />
        <View style={styles.flex}>
          <Text style={styles.childName}>{inv.child.name}</Text>
          <Text style={styles.body}>{`${inv.child.level}  •  ${inv.child.school}`}</Text>
          <View style={styles.facts}>
            {facts.map((f) => (
              <View key={f.text} style={styles.fact}>
                <Icon name={f.icon} size={15} color={Brand.body} />
                <Text style={styles.factText}>{f.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.title} accessibilityRole="header">
          Payment Summary
        </Text>
        {inv.items.map((i) => (
          <View key={i.title} style={styles.item}>
            <View style={[styles.itemIcon, { backgroundColor: `${i.tint}1A` }]}>
              <Icon name={i.icon} size={20} color={i.tint} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.strong}>{i.title}</Text>
              <Text style={styles.muted}>{i.detail}</Text>
            </View>
            <Text style={styles.amount}>{formatMoney(i.ugx, 'UGX')}</Text>
          </View>
        ))}
        <View style={styles.total}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>{formatMoney(total, 'UGX')}</Text>
        </View>
      </View>
    </View>
  );
}

/** "One-time link, no login" and when it expires. */
export function LinkFacts({ validUntil }: { validUntil: string }) {
  return (
    <View style={styles.gap}>
      <View style={[styles.note, styles.noteBlue]}>
        <Icon name="lock" size={20} color={Brand.blue} />
        <View style={styles.flex}>
          <Text style={styles.strong}>This is a secure, one-time payment link.</Text>
          <Text style={styles.body}>No login or password is required.</Text>
        </View>
      </View>
      <View style={[styles.note, styles.noteRed]}>
        <Icon name="clock" size={20} color={Brand.live} />
        <View style={styles.flex}>
          <Text style={[styles.body, styles.red]}>This payment link is valid until</Text>
          <Text style={[styles.strong, styles.red]}>{validUntil}</Text>
        </View>
      </View>
    </View>
  );
}

/** Four reassurances at the bottom of the summary. */
export function Promises({ inv }: { inv: Invoice }) {
  return (
    <View style={styles.promises}>
      {inv.promises.map((p) => (
        <View key={p.title} style={styles.promise}>
          <Icon name={p.icon} size={22} color={Brand.blue} />
          <Text style={styles.promiseTitle}>{p.title}</Text>
          <Text style={styles.promiseText}>{p.detail}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: Brand.surface, ...CARD_SHADOW },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  leaf: { fontSize: 30 },
  name: { fontSize: 20, fontWeight: '800', color: Brand.ink },
  tag: { fontSize: 10, color: Brand.body, marginTop: -2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 28 },
  headerItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  whatsapp: { fontSize: 18, color: Brand.surface, backgroundColor: WHATSAPP_GREEN, width: 30, height: 30, borderRadius: 15, textAlign: 'center', lineHeight: 30, overflow: 'hidden' },
  strong: { fontSize: 13, fontWeight: '700', color: Brand.ink },
  muted: { fontSize: 11, color: Brand.muted },
  body: { fontSize: 13, color: Brand.body },
  link: { fontSize: 12, color: Brand.blue },
  child: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  photo: { width: 120, height: 150, borderRadius: 14 },
  childName: { fontSize: 22, fontWeight: '800', color: Brand.ink },
  facts: { gap: 6, marginTop: 10 },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  factText: { fontSize: 12, color: Brand.body, flexShrink: 1 },
  card: { gap: 12, padding: 18, borderRadius: 14, backgroundColor: Brand.surface, ...CARD_SHADOW },
  title: { fontSize: 17, fontWeight: '800', color: Brand.ink },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Brand.line },
  itemIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  amount: { fontSize: 14, fontWeight: '700', color: Brand.ink },
  total: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 },
  totalLabel: { fontSize: 15, color: Brand.ink },
  totalValue: { fontSize: 20, fontWeight: '800', color: Brand.ink },
  note: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12 },
  noteBlue: { backgroundColor: Brand.blueSoft },
  noteRed: { backgroundColor: Brand.liveSoft },
  red: { color: Brand.live },
  promises: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  promise: { flexGrow: 1, flexBasis: 110, alignItems: 'center', gap: 4, padding: 12, borderRadius: 12, backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line },
  promiseTitle: { fontSize: 11, fontWeight: '700', color: Brand.ink, textAlign: 'center' },
  promiseText: { fontSize: 10, color: Brand.muted, textAlign: 'center' },
});
