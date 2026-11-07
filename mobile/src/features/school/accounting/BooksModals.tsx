import { type ReactNode, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Btn } from '@/features/portal/PortalParts';
import { BLUE, BODY, GREEN, LINE, MUTED, NAVY, RED, WHITE } from '@/features/portal/tokens';

import { type Account, ACCOUNT_TYPES, type AccountType, codeRange, entryTotals, type JournalLine, validateEntry } from './books';

function Frame({ visible, title, onClose, children, wide = false }: { visible: boolean; title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.box, wide && styles.boxWide]} accessibilityViewIsModal>
          <View style={styles.head}>
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" hitSlop={10}>
              <Icon name="close" size={22} color={NAVY} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Chips({ items, active, onPick, label }: { items: readonly string[]; active: string; onPick: (v: string) => void; label: string }) {
  return (
    <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {items.map((x) => {
        const on = x === active;
        return (
          <Pressable key={x} style={[styles.chip, on && styles.chipOn]} onPress={() => onPick(x)} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={x}>
            <Text style={[styles.chipText, on && styles.chipTextOn]}>{x}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Actions({ onCancel, confirm, onConfirm, second }: { onCancel: () => void; confirm: string; onConfirm: () => void; second?: { label: string; onPress: () => void } }) {
  return (
    <View style={styles.btns}>
      <Btn label={second ? second.label : 'Cancel'} kind="outline" onPress={second ? second.onPress : onCancel} height={44} style={styles.flex} />
      <Pressable style={styles.confirm} onPress={onConfirm} accessibilityRole="button" accessibilityLabel={confirm}>
        <Text style={styles.confirmText}>{confirm}</Text>
      </Pressable>
    </View>
  );
}

export interface AccountDraft {
  code: string;
  name: string;
  type: AccountType;
  sub: string;
  parent?: string;
  description?: string;
}

/** Add a new account, or edit an existing one's name, description and parent (its code stays). */
export function AccountModal({
  visible,
  onClose,
  accounts,
  subs,
  editing,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  accounts: readonly Account[];
  subs: (type: AccountType) => readonly string[];
  editing?: Account | null;
  onSave: (d: AccountDraft) => string | undefined;
}) {
  const [type, setType] = useState<AccountType>(editing?.type ?? 'Income');
  const [code, setCode] = useState(editing?.code ?? '');
  const [name, setName] = useState(editing?.name ?? '');
  const [sub, setSub] = useState(editing?.sub ?? subs('Income')[0] ?? '');
  const [parent, setParent] = useState(editing?.parent ?? 'None');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [error, setError] = useState('');
  const parents = ['None', ...accounts.filter((a) => a.type === type && !a.parent && a.code !== code).map((a) => `${a.code} ${a.name}`)];
  const pickType = (t: string) => {
    const next = t as AccountType;
    setType(next);
    setSub(subs(next)[0] ?? '');
    setParent('None');
    setError('');
  };
  const save = () => {
    const err = onSave({ code: code.trim(), name, type, sub, parent: parent === 'None' ? undefined : parent.slice(0, 4), description: description.trim() || undefined });
    if (err) return setError(err);
    setError('');
    onClose();
  };
  return (
    <Frame visible={visible} title={editing ? `Edit ${editing.code}` : 'Add account'} onClose={onClose}>
      {editing ? null : (
        <>
          <Text style={styles.label}>Type</Text>
          <Chips items={ACCOUNT_TYPES} active={type} onPick={pickType} label="Account type" />
          <Text style={styles.label}>{`Code (${codeRange(type)})`}</Text>
          <TextInput style={styles.field} value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={4} placeholder={codeRange(type).slice(0, 4)} placeholderTextColor={MUTED} accessibilityLabel="Account code" />
        </>
      )}
      <Text style={styles.label}>Account name</Text>
      <TextInput style={styles.field} value={name} onChangeText={setName} placeholder="Tuition Fees - Secondary" placeholderTextColor={MUTED} accessibilityLabel="Account name" />
      <Text style={styles.label}>Sub-category</Text>
      <Chips items={subs(type)} active={sub} onPick={setSub} label="Sub-category" />
      <Text style={styles.label}>Parent account</Text>
      <Chips items={parents} active={parent} onPick={setParent} label="Parent account" />
      <Text style={styles.label}>Description</Text>
      <TextInput style={styles.field} value={description} onChangeText={setDescription} placeholder="What this account records" placeholderTextColor={MUTED} accessibilityLabel="Description" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Actions onCancel={onClose} confirm={editing ? 'Save Changes' : 'Add Account'} onConfirm={save} />
    </Frame>
  );
}

interface LineDraft {
  account: string;
  debit: string;
  credit: string;
}

const EMPTY_LINES: readonly LineDraft[] = [
  { account: '', debit: '', credit: '' },
  { account: '', debit: '', credit: '' },
];
const num = (s: string) => Number(s.replace(/[^\d]/g, '')) || 0;
const fmt = (n: number) => n.toLocaleString('en-US');

/** Write a journal entry line by line; it saves as a draft or posts once debits equal credits. */
export function EntryModal({
  visible,
  onClose,
  accounts,
  id,
  onSave,
  initial,
  editing = false,
}: {
  visible: boolean;
  onClose: () => void;
  accounts: readonly Account[];
  id: string;
  onSave: (e: { description: string; lines: readonly JournalLine[]; post: boolean }) => string | undefined;
  /** Starts from these lines: editing a draft, or copying an entry. */
  initial?: { description: string; lines: readonly JournalLine[] };
  editing?: boolean;
}) {
  const start = initial ? initial.lines.map((l) => ({ account: `${l.account} ${accounts.find((a) => a.code === l.account)?.name ?? ''}`.trim(), debit: l.debit ? String(l.debit) : '', credit: l.credit ? String(l.credit) : '' })) : EMPTY_LINES;
  const [description, setDescription] = useState(initial?.description ?? '');
  const [lines, setLines] = useState<readonly LineDraft[]>(start);
  const [focus, setFocus] = useState<number | null>(null);
  const [error, setError] = useState('');
  const parsed: readonly JournalLine[] = lines.filter((l) => l.account || l.debit || l.credit).map((l) => ({ account: l.account.slice(0, 4), debit: num(l.debit), credit: num(l.credit) }));
  const t = entryTotals({ lines: parsed });
  const set = (i: number, patch: Partial<LineDraft>) => setLines((prev) => prev.map((l, n) => (n === i ? { ...l, ...patch } : l)));
  const close = () => {
    setDescription('');
    setLines(EMPTY_LINES);
    setError('');
    onClose();
  };
  const save = (post: boolean) => {
    if (!description.trim()) return setError('Describe the transaction.');
    if (post) {
      const errs = validateEntry({ lines: parsed }, accounts);
      if (errs.length) return setError(errs.join('\n'));
    }
    const err = onSave({ description: description.trim(), lines: parsed, post });
    if (err) return setError(err);
    close();
  };
  const suggestions = (q: string) => {
    const s = q.trim().toLowerCase();
    return s ? accounts.filter((a) => a.status === 'Active' && `${a.code} ${a.name}`.toLowerCase().includes(s)).slice(0, 4) : [];
  };
  return (
    <Frame visible={visible} title={`${editing ? 'Edit' : 'New'} journal entry · ${id}`} onClose={close} wide>
      <Text style={styles.label}>Description</Text>
      <TextInput style={styles.field} value={description} onChangeText={setDescription} placeholder="School Fees Collection" placeholderTextColor={MUTED} accessibilityLabel="Description" />
      <View style={styles.lineHead}>
        <Text style={[styles.th, styles.flex]}>Account</Text>
        <Text style={[styles.th, styles.amount]}>Debit (UGX)</Text>
        <Text style={[styles.th, styles.amount]}>Credit (UGX)</Text>
        <View style={styles.removeCol} />
      </View>
      {lines.map((l, i) => (
        <View key={i} style={styles.block}>
          <View style={styles.lineRow}>
            <TextInput style={[styles.field, styles.flex]} value={l.account} onChangeText={(v) => set(i, { account: v })} onFocus={() => setFocus(i)} placeholder="Code or name, e.g. 1001" placeholderTextColor={MUTED} accessibilityLabel={`Line ${i + 1} account`} />
            <TextInput style={[styles.field, styles.amount]} value={l.debit} onChangeText={(v) => set(i, { debit: v, credit: v ? '' : l.credit })} keyboardType="numeric" placeholder="0" placeholderTextColor={MUTED} accessibilityLabel={`Line ${i + 1} debit`} />
            <TextInput style={[styles.field, styles.amount]} value={l.credit} onChangeText={(v) => set(i, { credit: v, debit: v ? '' : l.debit })} keyboardType="numeric" placeholder="0" placeholderTextColor={MUTED} accessibilityLabel={`Line ${i + 1} credit`} />
            <Pressable style={styles.removeCol} onPress={() => setLines((prev) => (prev.length > 2 ? prev.filter((_, n) => n !== i) : prev))} accessibilityRole="button" accessibilityLabel={`Remove line ${i + 1}`} hitSlop={6}>
              <Icon name="trash" size={16} color={lines.length > 2 ? RED : MUTED} />
            </Pressable>
          </View>
          {focus === i
            ? suggestions(l.account).map((a) => (
                <Pressable
                  key={a.code}
                  style={styles.suggest}
                  onPress={() => {
                    set(i, { account: `${a.code} ${a.name}` });
                    setFocus(null);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Use ${a.code} ${a.name}`}>
                  <Text style={styles.suggestText}>{`${a.code} · ${a.name}`}</Text>
                  <Text style={styles.small}>{a.type}</Text>
                </Pressable>
              ))
            : null}
        </View>
      ))}
      <Pressable style={styles.addLine} onPress={() => setLines((prev) => [...prev, { account: '', debit: '', credit: '' }])} accessibilityRole="button" accessibilityLabel="Add line">
        <Icon name="plus" size={15} color={BLUE} />
        <Text style={styles.link}>Add line</Text>
      </Pressable>
      <View style={styles.totals}>
        <Text style={[styles.th, styles.flex]}>Total</Text>
        <Text style={[styles.totalNum, styles.amount]}>{fmt(t.debit)}</Text>
        <Text style={[styles.totalNum, styles.amount]}>{fmt(t.credit)}</Text>
        <View style={styles.removeCol} />
      </View>
      <Text style={[styles.small, { color: t.balanced ? GREEN : RED }]}>{t.balanced ? 'Balanced. Ready to post.' : `Out of balance by ${fmt(Math.abs(t.debit - t.credit))}.`}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Actions onCancel={close} confirm="Post Entry" onConfirm={() => save(true)} second={{ label: 'Save Draft', onPress: () => save(false) }} />
    </Frame>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'rgba(10,20,50,0.45)' },
  box: { width: '100%', maxWidth: 520, maxHeight: '92%', padding: 20, borderRadius: 16, backgroundColor: WHITE },
  boxWide: { maxWidth: 640 },
  scroll: { gap: 10, paddingTop: 10 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { flex: 1, fontSize: 18, fontWeight: '800', color: NAVY },
  small: { fontSize: 12, color: BODY },
  label: { marginTop: 2, fontSize: 13, fontWeight: '600', color: NAVY },
  field: { height: 42, paddingHorizontal: 11, borderRadius: 9, borderWidth: 1, borderColor: LINE, fontSize: 13.5, color: NAVY, backgroundColor: WHITE },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 18, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  chipOn: { borderColor: BLUE, backgroundColor: '#EAF1FE' },
  chipText: { fontSize: 12.5, color: NAVY },
  chipTextOn: { fontWeight: '700', color: BLUE },
  error: { fontSize: 13, lineHeight: 19, color: RED },
  btns: { flexDirection: 'row', gap: 10, marginTop: 6 },
  confirm: { flex: 1, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: BLUE },
  confirmText: { fontSize: 15, fontWeight: '700', color: WHITE },
  block: { gap: 4 },
  lineHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  lineRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  th: { fontSize: 12, fontWeight: '700', color: NAVY },
  amount: { width: 112, textAlign: 'right' },
  removeCol: { width: 22, alignItems: 'center' },
  suggest: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F4F7FC' },
  suggestText: { flex: 1, fontSize: 12.5, fontWeight: '600', color: NAVY },
  addLine: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 4 },
  link: { fontSize: 13, fontWeight: '600', color: BLUE },
  totals: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 8, borderTopWidth: 1, borderColor: LINE },
  totalNum: { fontSize: 14, fontWeight: '800', color: NAVY },
});
