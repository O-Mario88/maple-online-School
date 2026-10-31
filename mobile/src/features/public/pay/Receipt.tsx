import { useState } from 'react';
import { Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { formatMoney } from '@/lib/finance/fees';

import { Brand, CARD_SHADOW } from '../palette';

const GRID = 21;
const CELL = 6;
// A receipt QR stays black on white so phone cameras can read it.
const QR_PAPER = '#FFFFFF';
const QR_INK = '#111111';

/** A stand-in QR pattern seeded from the receipt number (the real code comes from the API). */
function cellOn(seed: number, i: number): boolean {
  const r = Math.floor(i / GRID);
  const c = i % GRID;
  const finder = (rr: number, cc: number) => rr < 7 && cc < 7 && (rr === 0 || rr === 6 || cc === 0 || cc === 6 || (rr > 1 && rr < 5 && cc > 1 && cc < 5));
  if (r < 7 && c < 7) return finder(r, c);
  if (r < 7 && c >= GRID - 7) return finder(r, c - (GRID - 7));
  if (r >= GRID - 7 && c < 7) return finder(r - (GRID - 7), c);
  return (((i + 1) * 2654435761 + seed) >>> 0) % 5 < 2;
}

function seedOf(text: string): number {
  return [...text].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
}

export interface ReceiptData {
  receipt: string;
  invoice: string;
  learner: string;
  method: string;
  payer: string;
  amountUGX: number;
  paidAt: string;
}

/** "MTN MoMo (+256…)", or just "Apple Pay" when there is no separate payer to show. */
function paidWith(r: ReceiptData): string {
  return r.payer && r.payer !== r.method ? `${r.method} (${r.payer})` : r.method;
}

function receiptText(r: ReceiptData): string {
  return [
    'MAPLE GLOBAL ONLINE SCHOOL: PAYMENT RECEIPT',
    `Receipt: ${r.receipt}`,
    `Invoice: ${r.invoice}`,
    `Learner: ${r.learner}`,
    `Amount: ${formatMoney(r.amountUGX, 'UGX')}`,
    `Paid with: ${paidWith(r)}`,
    `Date: ${r.paidAt}`,
    `Verify: maple.school/verify/${r.receipt}`,
  ].join('\n');
}

/** The paid state: amount, details, a scannable receipt code, and an instant download. */
export function Receipt({ r }: { r: ReceiptData }) {
  const [saved, setSaved] = useState(false);
  const seed = seedOf(r.receipt);

  const download = async () => {
    const text = receiptText(r);
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${r.receipt}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      await Share.share({ title: `Receipt ${r.receipt}`, message: text });
    }
    setSaved(true);
  };

  return (
    <View style={styles.card} accessibilityLiveRegion="polite">
      <View style={styles.tick}>
        <Icon name="check" size={34} color={Brand.surface} />
      </View>
      <Text style={styles.title}>Payment received</Text>
      <Text style={styles.amount}>{formatMoney(r.amountUGX, 'UGX')}</Text>
      <Text style={styles.body}>{`${paidWith(r)} · ${r.paidAt}`}</Text>
      <View style={styles.qr} accessible accessibilityLabel={`Receipt code for ${r.receipt}`}>
        {Array.from({ length: GRID * GRID }, (_, i) => (
          <View key={i} style={[styles.cell, cellOn(seed, i) && styles.cellOn]} />
        ))}
      </View>
      <Text style={styles.receiptNo}>{r.receipt}</Text>
      <Text style={styles.muted}>Scan to check this receipt. The school has been told.</Text>
      <Pressable style={styles.download} onPress={download} accessibilityRole="button">
        <Icon name="download" size={18} color={Brand.surface} />
        <Text style={styles.downloadText}>{saved ? 'Receipt downloaded ✓' : 'Download Receipt'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: 8, padding: 24, borderRadius: 16, backgroundColor: Brand.surface, ...CARD_SHADOW },
  tick: { width: 64, height: 64, borderRadius: 32, backgroundColor: Brand.green, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: Brand.ink, marginTop: 6 },
  amount: { fontSize: 28, fontWeight: '900', color: Brand.green },
  body: { fontSize: 13, color: Brand.body, textAlign: 'center' },
  muted: { fontSize: 12, color: Brand.muted, textAlign: 'center' },
  // Size = cells + padding (8 each side) + border (1 each side), so each row holds exactly GRID cells.
  qr: { width: GRID * CELL + 18, height: GRID * CELL + 18, padding: 8, flexDirection: 'row', flexWrap: 'wrap', backgroundColor: QR_PAPER, borderRadius: 8, borderWidth: 1, borderColor: Brand.line, marginTop: 10 },
  cell: { width: CELL, height: CELL },
  cellOn: { backgroundColor: QR_INK },
  receiptNo: { fontSize: 14, fontWeight: '700', color: Brand.ink, letterSpacing: 1 },
  download: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 22, minHeight: 48, borderRadius: 10, backgroundColor: Brand.blue, marginTop: 6 },
  downloadText: { fontSize: 15, fontWeight: '700', color: Brand.surface },
});
