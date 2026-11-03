import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ComboChart } from '@/features/command/kit/CmdCharts';
import { CmdSelect, CmdStat, CountTabs, DetailRow, type Kpi, OutlineBtn, PageStrip, Panel, PrimaryBtn } from '@/features/command/kit/CmdParts';
import { Card, Pill } from '@/features/portal/PortalParts';
import { PremiumTile } from '@/features/portal/Premium';
import { BLUE, BODY, LINE, NAVY, TONES, type Tone, WHITE } from '@/features/portal/tokens';
import { AdminPhone, Cell, type Column, DataTable, PageHead, Search, SelectBox, useChoice, useSelection } from '@/features/school/kit/AdminKit';
import type { IconName } from '@/lib/icons';
import { toast } from '@/lib/toast';
import type { MockData } from '@/mock';
import type { BookAccount } from '@/mock/school-books';

import { accountBalance, ACCOUNT_TYPES, type AccountType, addAccount, canDelete, categoryTree } from './books';
import { BooksDesk, BooksHead } from './BooksFrame';
import { type AccountDraft, AccountModal } from './BooksModals';

type Admin = MockData['schoolAdmin'];
const PER_PAGE = 15;
export const TYPE_LOOK: Readonly<Record<AccountType, { tone: Tone; icon: IconName; plural: string }>> = {
  Income: { tone: 'green', icon: 'plus', plural: 'Income' },
  Expense: { tone: 'red', icon: 'minus', plural: 'Expenses' },
  Asset: { tone: 'blue', icon: 'building', plural: 'Assets' },
  Liability: { tone: 'orange', icon: 'wallet', plural: 'Liabilities' },
  Equity: { tone: 'purple', icon: 'balance', plural: 'Equity' },
};
const short = (n: number) => (n >= 1e6 ? `UGX ${(n / 1e6).toFixed(1)}M` : `UGX ${n.toLocaleString('en-US')}`);

function useChart(a: Admin) {
  const b = a.books;
  const ME = a.me.name;
  const [list, setList] = useState<readonly BookAccount[]>(b.accounts);
  const [extraSubs, setExtraSubs] = useState<readonly { type: AccountType; name: string }[]>([]);
  const [type, setType] = useState<AccountType>('Income');
  const [sub, setSub] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus, statuses] = useChoice(['All Statuses', 'Active', 'Inactive']);
  const [page, setPage] = useState(1);
  const [openCode, setOpenCode] = useState<string | null>(b.featuredAccount);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [activity, setActivity] = useState<readonly string[]>([]);
  const [selected, toggle] = useSelection();
  const balance = (acc: BookAccount) => acc.opening + accountBalance(acc.code, b.entries, list);
  const tree = useMemo(() => {
    const base = categoryTree(list);
    return base.map((t) => ({ ...t, subs: [...t.subs, ...extraSubs.filter((x) => x.type === t.type && !t.subs.some((s) => s.name === x.name)).map((x) => ({ name: x.name, count: 0 }))] }));
  }, [list, extraSubs]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...list].sort((p, q) => p.code.localeCompare(q.code)).filter((x) => (q ? true : x.type === type) && (!sub || q || x.sub === sub) && (status === 'All Statuses' || x.status === status) && (!q || `${x.code} ${x.name} ${x.sub} ${x.description ?? ''}`.toLowerCase().includes(q)));
  }, [list, type, sub, query, status]);
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const p = Math.min(page, pages);
  const rows = shown.slice((p - 1) * PER_PAGE, p * PER_PAGE);
  const open = list.find((x) => x.code === openCode) ?? null;
  const log = (line: string) => setActivity((prev) => [`Oct 26, 2026 • ${ME}: ${line}`, ...prev]);
  const subsOf = (t: AccountType) => tree.find((x) => x.type === t)?.subs.map((s) => s.name) ?? [];
  const totals = ACCOUNT_TYPES.map((t) => ({ type: t, count: list.filter((x) => x.type === t).length, amount: list.filter((x) => x.type === t).reduce((s, x) => s + balance(x), 0) }));

  const pickCategory = (t: AccountType, s: string | null) => {
    setType(t);
    setSub(s);
    setPage(1);
    setQuery('');
  };
  const save = (d: AccountDraft): string | undefined => {
    if (modal === 'edit' && open) {
      if (!d.name.trim()) return 'Give the account a name.';
      setList((prev) => prev.map((x) => (x.code === open.code ? { ...x, name: d.name.trim(), sub: d.sub, parent: d.parent, description: d.description, updated: 'Oct 26, 2026, 10:30' } : x)));
      log(`edited ${open.code}`);
      toast(`${open.code} ${d.name.trim()} saved.`);
      return undefined;
    }
    const r = addAccount(list, { code: d.code, name: d.name, type: d.type, sub: d.sub, parent: d.parent, description: d.description });
    if (r.error) return r.error;
    const added = r.list[r.list.length - 1];
    setList((prev) => [...prev, { ...added, opening: 0, created: 'Oct 26, 2026, 10:30', updated: 'Oct 26, 2026, 10:30' }]);
    pickCategory(d.type, d.sub);
    setOpenCode(d.code);
    log(`added ${d.code} ${added.name}`);
    toast(`${d.code} ${added.name} added under ${d.type} › ${d.sub}.`);
    return undefined;
  };
  const toggleStatus = (acc: BookAccount) => {
    const next = acc.status === 'Active' ? 'Inactive' : 'Active';
    setList((prev) => prev.map((x) => (x.code === acc.code ? { ...x, status: next } : x)));
    log(`${next === 'Active' ? 'reactivated' : 'deactivated'} ${acc.code}`);
    toast(next === 'Active' ? `${acc.code} is active again.` : `${acc.code} is inactive. It keeps its history but takes no new entries.`);
  };
  const remove = (acc: BookAccount) => {
    const r = canDelete(acc.code, b.entries);
    if (!r.ok) return toast(r.reason ?? 'This account cannot be deleted.');
    if (list.some((x) => x.parent === acc.code)) return toast(`${acc.code} has sub-accounts. Move them first.`);
    setList((prev) => prev.filter((x) => x.code !== acc.code));
    setOpenCode(null);
    toast(`${acc.code} ${acc.name} deleted.`);
  };
  const addCategory = () => {
    const name = `New ${TYPE_LOOK[type].plural} Group ${extraSubs.filter((x) => x.type === type).length + 1}`;
    setExtraSubs((prev) => [...prev, { type, name }]);
    setSub(name);
    toast(`Sub-category "${name}" added under ${TYPE_LOOK[type].plural}. Add accounts to it.`);
  };
  const pick = (code: string) => setOpenCode(code);
  return { b, me: ME, list, tree, totals, type, sub, pickCategory, query, setQuery, status, setStatus, statuses, page: p, pages, setPage, rows, shown, open, pick, setOpenCode, modal, setModal, save, toggleStatus, remove, addCategory, balance, subsOf, activity, selected, toggle };
}
type U = ReturnType<typeof useChart>;

function kpis(u: U): readonly Kpi[] {
  const c = (t: AccountType) => u.totals.find((x) => x.type === t)?.count ?? 0;
  return [
    { label: 'Total Accounts', value: String(u.list.length), icon: 'clipboard', tone: 'green', delta: '12%', caption: 'vs. last year' },
    { label: 'Income Accounts', value: String(c('Income')), icon: 'plus', tone: 'red' },
    { label: 'Expense Accounts', value: String(c('Expense')), icon: 'minus', tone: 'orange' },
    { label: 'Asset Accounts', value: String(c('Asset')), icon: 'building', tone: 'blue' },
    { label: 'Liability Accounts', value: String(c('Liability')), icon: 'wallet', tone: 'orange' },
    { label: 'Equity Accounts', value: String(c('Equity')), icon: 'balance', tone: 'purple' },
  ];
}

function TypeIcon({ type, size = 30 }: { type: AccountType; size?: number }) {
  const t = TONES[TYPE_LOOK[type].tone];
  return (
    <View style={[styles.typeIcon, { width: size, height: size, backgroundColor: t.solid }]}>
      <Icon name={TYPE_LOOK[type].icon} size={size * 0.55} color={WHITE} />
    </View>
  );
}

function Categories({ u }: { u: U }) {
  return (
    <Card style={styles.cats}>
      <View style={styles.inline}>
        <Text style={[styles.catsTitle, styles.flex]} numberOfLines={1}>
          Account Categories
        </Text>
        <OutlineBtn label="Add Category" icon="plus" small onPress={u.addCategory} />
      </View>
      {u.tree.map((t) => {
        const on = u.type === t.type;
        return (
          <View key={t.type} style={[styles.catGroup, on && { borderLeftColor: TONES[TYPE_LOOK[t.type].tone].solid }]}>
            <Pressable style={[styles.catHead, on && !u.sub && styles.catOn]} onPress={() => u.pickCategory(t.type, null)} accessibilityRole="button" accessibilityState={{ selected: on && !u.sub }} accessibilityLabel={`${TYPE_LOOK[t.type].plural}, ${t.count} accounts`}>
              <TypeIcon type={t.type} />
              <Text style={[styles.catName, styles.flex]}>{TYPE_LOOK[t.type].plural}</Text>
              <Text style={styles.catCount}>{t.count}</Text>
            </Pressable>
            {t.subs.map((s) => {
              const here = on && u.sub === s.name;
              return (
                <Pressable key={s.name} style={[styles.subRow, here && styles.catOn]} onPress={() => u.pickCategory(t.type, s.name)} accessibilityRole="button" accessibilityState={{ selected: here }} accessibilityLabel={`${s.name}, ${s.count} accounts`}>
                  <Icon name={TYPE_LOOK[t.type].icon} size={13} color={TONES[TYPE_LOOK[t.type].tone].solid} />
                  <Text style={[styles.subName, styles.flex]}>{s.name}</Text>
                  <Text style={styles.subCount}>{s.count}</Text>
                </Pressable>
              );
            })}
          </View>
        );
      })}
    </Card>
  );
}

function cols(u: U): readonly Column<BookAccount>[] {
  return [
    { label: 'Code', width: 50, render: (x) => <Cell small>{x.code}</Cell> },
    { label: 'Account Name', flex: 1.5, render: (x) => <Cell small>{x.name}</Cell> },
    { label: 'Type', width: 62, render: (x) => <Cell small>{x.type}</Cell> },
    { label: 'Sub-Category', flex: 1.1, render: (x) => <Cell small>{x.sub}</Cell> },
    { label: 'Balance', width: 96, render: (x) => <Cell small>{u.balance(x).toLocaleString('en-US')}</Cell> },
    { label: 'Status', width: 72, render: (x) => <Pill label={x.status} tone={x.status === 'Active' ? 'green' : 'grey'} size={10.5} /> },
  ];
}

function AccountsTable({ u }: { u: U }) {
  const title = u.query.trim() ? 'Search Results' : `Accounts (${u.sub ?? TYPE_LOOK[u.type].plural})`;
  return (
    <Card style={[styles.tableCard, styles.flex]}>
      <Text style={styles.panelTitle}>{title}</Text>
      <View style={styles.inline}>
        <Search placeholder="Search by code, name or description..." value={u.query} onChange={u.setQuery} style={styles.flex} />
        <CmdSelect value={u.status} options={u.statuses} onChange={u.setStatus} width={120} label="Status" />
      </View>
      <DataTable columns={cols(u)} rows={u.rows} rowKey={(x) => x.code} check selected={u.selected} onToggle={u.toggle} compact menu onMenu={(x) => u.pick(x.code)} onRowPress={(x) => u.pick(x.code)} activeKey={u.open?.code} />
      <PageStrip label={`Showing ${u.shown.length ? (u.page - 1) * PER_PAGE + 1 : 0}–${Math.min(u.page * PER_PAGE, u.shown.length)} of ${u.shown.length} accounts`} page={u.page} pages={u.pages} onPage={u.setPage} />
    </Card>
  );
}

function DetailsPanel({ u, onClose }: { u: U; onClose?: () => void }) {
  const x = u.open;
  const [tab, setTab] = useState('Overview');
  if (!x)
    return (
      <Card style={styles.panel}>
        <Text style={styles.small}>Pick an account to see it.</Text>
      </Card>
    );
  const parent = u.list.find((p) => p.code === x.parent);
  const entries = u.b.entries.filter((e) => e.lines.some((l) => l.account === x.code));
  const tabs = ['Overview', 'Settings', `Activity (${entries.length + u.activity.length})`];
  return (
    <Card style={styles.panel}>
      <View style={styles.inline}>
        <Text style={[styles.panelTitle, styles.flex]}>Account Details</Text>
        {onClose ? (
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close details" hitSlop={8}>
            <Icon name="close" size={18} color={BODY} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.inline}>
        <TypeIcon type={x.type} size={46} />
        <View style={styles.flex}>
          <Text style={styles.code}>{x.code}</Text>
          <Text style={styles.accName}>{x.name}</Text>
        </View>
        <Pill label={x.status} tone={x.status === 'Active' ? 'green' : 'grey'} size={11} />
      </View>
      <CountTabs tabs={tabs.map((label) => ({ label }))} active={tabs.find((t) => t.startsWith(tab)) ?? tabs[0]} onChange={(l) => setTab(l.split(' (')[0])} size={12.5} dense style={styles.noWrap} />
      {tab === 'Overview' ? (
        <>
          <DetailRow label="Code" value={x.code} />
          <DetailRow label="Account Name" value={x.name} />
          <DetailRow label="Type">
            <Pill label={x.type} tone={TYPE_LOOK[x.type].tone} size={10.5} style={styles.pillStart} />
          </DetailRow>
          <DetailRow label="Sub-Category" value={x.sub} />
          <DetailRow label="Description" value={x.description ?? '—'} />
          <DetailRow label="Balance" value={`UGX ${u.balance(x).toLocaleString('en-US')}`} />
          <DetailRow label="Parent Account" value={parent ? `${parent.code} - ${parent.name}` : '—'} />
          <DetailRow label="Currency" value="UGX" />
          <DetailRow label="Tax Applicable" value="No" />
          <DetailRow label="Is Bank Account" value={u.b.bankCodes.includes(x.code) ? 'Yes' : 'No'} />
          <DetailRow label="Created" value={x.created} />
          <DetailRow label="Last Updated" value={x.updated} />
          <DetailRow label="Created By" value={u.me} />
        </>
      ) : null}
      {tab === 'Settings' ? (
        <View style={styles.block}>
          <Text style={styles.small}>{x.status === 'Active' ? 'Inactive accounts keep their history but take no new entries.' : 'This account takes no new entries.'}</Text>
          <OutlineBtn label={x.status === 'Active' ? 'Make Inactive' : 'Make Active'} icon="lock" onPress={() => u.toggleStatus(x)} />
          <OutlineBtn label="Delete Account" icon="trash" onPress={() => u.remove(x)} />
        </View>
      ) : null}
      {tab === 'Activity' ? (
        <View style={styles.block}>
          {u.activity.map((l) => (
            <Text key={l} style={styles.small}>
              {l}
            </Text>
          ))}
          {entries.map((e) => (
            <Text key={e.id} style={styles.small}>{`${e.id} • ${e.description} • ${e.status}`}</Text>
          ))}
          {!entries.length && !u.activity.length ? <Text style={styles.small}>No entries yet.</Text> : null}
        </View>
      ) : null}
      <View style={styles.inline}>
        <OutlineBtn label="Edit Account" icon="edit" small onPress={() => u.setModal('edit')} style={styles.flex} />
        <OutlineBtn label="View Journal Entries" icon="doc" small onPress={() => router.push('/admin/finance/journal-entries' as never)} style={styles.editWide} />
      </View>
    </Card>
  );
}

function Trend({ u }: { u: U }) {
  const [span, setSpan] = useState('This Year');
  const t = u.b.balanceTrend;
  return (
    <Panel title="Account Balance Trend" right={<CmdSelect value={span} options={['This Year', 'Last Year']} onChange={setSpan} width={110} label="Period" />} style={[styles.block, styles.flex]}>
      <ComboChart labels={t.labels} bars={[{ name: u.open?.name ?? 'Balance', color: '#22A55A', values: span === 'This Year' ? t.values : t.values.map((v) => Math.round(v * 0.8)) }]} max={300} height={150} format={(n) => (n ? `${n}M` : '0')} barWidth={14} />
    </Panel>
  );
}

function TopIncome({ u }: { u: U }) {
  const income = u.list.filter((x) => x.type === 'Income').map((x) => ({ x, v: u.balance(x) }));
  const total = income.reduce((s, r) => s + r.v, 0) || 1;
  const top = [...income].sort((p, q) => q.v - p.v).slice(0, 5);
  return (
    <Panel title="Top Income Accounts" onAll={() => u.pickCategory('Income', null)} style={[styles.block, styles.top]}>
      {top.map(({ x, v }) => (
        <Pressable key={x.code} style={styles.topRow} onPress={() => u.pick(x.code)} accessibilityRole="button" accessibilityLabel={`${x.name}, UGX ${v.toLocaleString('en-US')}`}>
          <TypeIcon type="Income" size={22} />
          <View style={styles.flex}>
            <View style={styles.inline}>
              <Text style={[styles.subName, styles.flex]} numberOfLines={1}>
                {x.name}
              </Text>
              <Text style={styles.topAmt}>{`UGX ${v.toLocaleString('en-US')}`}</Text>
              <Text style={styles.topPct}>{`${Math.round((v / total) * 100)}%`}</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.round((v / total) * 100)}%` }]} />
            </View>
          </View>
        </Pressable>
      ))}
    </Panel>
  );
}

function Modal({ u }: { u: U }) {
  return <AccountModal key={u.modal === 'edit' ? `edit-${u.open?.code}` : 'add'} visible={!!u.modal} onClose={() => u.setModal(null)} accounts={u.list} subs={u.subsOf} editing={u.modal === 'edit' ? u.open : null} onSave={u.save} />;
}

/** School admin › Accounting › Chart of Accounts on the desktop reference. */
export function ChartDesk({ a }: { a: Admin }) {
  const u = useChart(a);
  return (
    <BooksDesk a={a} sub="Chart of Accounts" search="Search accounts, transactions, vendors, or reports...">
      <BooksHead
        a={a}
        icon="clipboard"
        title="Chart of Accounts"
        subtitle="Manage your school's chart of accounts for accurate financial reporting and compliance."
        actions={
          <>
            <OutlineBtn label="Import" icon="upload" onPress={() => toast('Import accounts from CSV or Excel. Codes are checked against their type ranges.')} />
            <OutlineBtn label="Export" chevron onPress={() => toast('Chart of accounts export: CSV, XLSX or PDF.')} />
            <PrimaryBtn label="Add Account" icon="plus" onPress={() => u.setModal('add')} />
          </>
        }
      />
      <View style={styles.kpis}>
        {kpis(u).map((k) => (
          <CmdStat key={k.label} k={k} style={styles.flex} />
        ))}
      </View>
      <View style={styles.row}>
        <Categories u={u} />
        <View style={[styles.flex, styles.stack]}>
          <View style={styles.row}>
            <AccountsTable u={u} />
            <View style={styles.side}>
              <DetailsPanel u={u} onClose={() => u.setOpenCode(null)} />
            </View>
          </View>
          <View style={styles.row}>
            <Trend u={u} />
            <TopIncome u={u} />
          </View>
        </View>
      </View>
      <Modal u={u} />
    </BooksDesk>
  );
}

const CHIPS: readonly { label: string; type: AccountType | null }[] = [{ label: 'All', type: null }, ...ACCOUNT_TYPES.map((t) => ({ label: TYPE_LOOK[t].plural, type: t }))];

/** The phone version: three tiles, search, type chips and the category cards. */
export function ChartPhone({ a }: { a: Admin }) {
  const u = useChart(a);
  const [chip, setChip] = useState('All');
  const [view, setView] = useState<'list' | 'accounts' | 'detail'>('list');
  const [term, setTerm, terms] = useChoice(a.books.terms);
  if (view === 'detail') {
    return (
      <AdminPhone key="detail" me={a.me}>
        <PageHead title={u.open?.name ?? 'Account'} subtitle={u.open ? `${u.open.code} • ${u.open.type}` : ''} phone onBack={() => setView('accounts')} />
        <DetailsPanel u={u} />
        <Modal u={u} />
      </AdminPhone>
    );
  }
  if (view === 'accounts') {
    return (
      <AdminPhone key="accounts" me={a.me}>
        <PageHead title={u.sub ?? TYPE_LOOK[u.type].plural} subtitle={`${u.shown.length} accounts`} phone onBack={() => setView('list')} />
        {u.rows.map((x) => (
          <Pressable
            key={x.code}
            style={styles.card}
            onPress={() => {
              u.pick(x.code);
              setView('detail');
            }}
            accessibilityRole="button"
            accessibilityLabel={`${x.code} ${x.name}`}>
            <View style={styles.inline}>
              <Text style={styles.code}>{x.code}</Text>
              <Text style={[styles.subName, styles.flex]}>{x.name}</Text>
              <Icon name="chevronRight" size={16} color={BODY} />
            </View>
            <View style={styles.inline}>
              <Pill label={x.status} tone={x.status === 'Active' ? 'green' : 'grey'} size={10.5} />
              <Text style={[styles.small, styles.flex]}>{x.sub}</Text>
              <Text style={styles.cardAmt}>{short(u.balance(x))}</Text>
            </View>
          </Pressable>
        ))}
        <PageStrip label={`${u.shown.length} accounts`} page={u.page} pages={u.pages} onPage={u.setPage} />
        <Modal u={u} />
      </AdminPhone>
    );
  }
  const subCount = u.tree.reduce((s, t) => s + t.subs.length, 0);
  const groups = u.tree.filter((t) => chip === 'All' || TYPE_LOOK[t.type].plural === chip);
  const openSub = (t: AccountType, s: string | null) => {
    u.pickCategory(t, s);
    setView('accounts');
  };
  return (
    <AdminPhone key="list" me={a.me}>
      <PageHead title="Chart of Accounts" subtitle="Your accounts by type, with balances." phone right={<SelectBox value={term} options={terms} onChange={setTerm} width={140} />} />
      <View style={styles.tilesCard}>
        <Text style={styles.cardTitle}>Accounts Overview</Text>
        <Text style={styles.cardSub}>Your chart of accounts at a glance.</Text>
        <View style={styles.tilesRow}>
        <PremiumTile item={{ label: 'Total Accounts', value: String(u.list.length), icon: 'clipboard', tone: 'green' }} style={styles.flex} minHeight={128} />
        <PremiumTile item={{ label: 'Main Categories', value: String(ACCOUNT_TYPES.length), icon: 'layers', tone: 'blue' }} style={styles.flex} minHeight={128} />
        <PremiumTile item={{ label: 'Sub-Categories', value: String(subCount), icon: 'grid', tone: 'orange' }} style={styles.flex} minHeight={128} />
      </View>
      </View>
      <Search placeholder="Search accounts..." value={u.query} onChange={u.setQuery} />
      {u.query.trim() ? (
        u.shown.slice(0, 12).map((x) => (
          <Pressable
            key={x.code}
            style={styles.card}
            onPress={() => {
              u.pick(x.code);
              setView('detail');
            }}
            accessibilityRole="button"
            accessibilityLabel={`${x.code} ${x.name}`}>
            <Text style={styles.subName}>{`${x.code} · ${x.name}`}</Text>
            <Text style={styles.small}>{`${x.type} › ${x.sub} • ${short(u.balance(x))}`}</Text>
          </Pressable>
        ))
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chips}>
              {CHIPS.map((c) => (
                <Pressable key={c.label} style={[styles.chip, chip === c.label && styles.chipOn]} onPress={() => setChip(c.label)} accessibilityRole="tab" accessibilityState={{ selected: chip === c.label }} accessibilityLabel={c.label}>
                  <Text style={[styles.chipText, chip === c.label && styles.chipTextOn]}>{c.label}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <Card style={styles.groupCard}>
            {groups.map((t, gi) => {
              const total = u.totals.find((x) => x.type === t.type)?.amount ?? 0;
              return (
                <View key={t.type} style={[styles.phoneGroup, gi > 0 && styles.groupRule]}>
                  <Pressable style={styles.phoneHead} onPress={() => openSub(t.type, null)} accessibilityRole="button" accessibilityLabel={`${TYPE_LOOK[t.type].plural}, ${t.count} accounts, ${short(total)}`}>
                    <TypeIcon type={t.type} size={40} />
                    <View style={styles.flex}>
                      <Text style={styles.phoneName}>{TYPE_LOOK[t.type].plural}</Text>
                      <Text style={styles.small}>{`${t.count} accounts`}</Text>
                    </View>
                    <Text style={[styles.phoneAmt, { color: TONES[TYPE_LOOK[t.type].tone].text }]}>{short(total)}</Text>
                    <Icon name="chevronRight" size={18} color={BODY} />
                  </Pressable>
                  {chip !== 'All' || t.type === 'Income' || t.type === 'Expense'
                    ? t.subs.map((s) => (
                        <Pressable key={s.name} style={styles.phoneSub} onPress={() => openSub(t.type, s.name)} accessibilityRole="button" accessibilityLabel={`${s.name}, ${s.count} accounts`}>
                          <Icon name={TYPE_LOOK[t.type].icon} size={16} color={TONES[TYPE_LOOK[t.type].tone].solid} />
                          <View style={styles.flex}>
                            <Text style={styles.subName}>{s.name}</Text>
                            <Text style={styles.small}>{`${s.count} accounts`}</Text>
                          </View>
                          <Icon name="chevronRight" size={16} color={BODY} />
                        </Pressable>
                      ))
                    : null}
                </View>
              );
            })}
          </Card>
          <PrimaryBtn label="Add Account" icon="plus" onPress={() => u.setModal('add')} />
        </>
      )}
      <Modal u={u} />
    </AdminPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stack: { gap: 12 },
  kpis: { flexDirection: 'row', gap: 12 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  noWrap: { flexWrap: 'nowrap' },
  block: { gap: 8 },
  small: { fontSize: 12, lineHeight: 17, color: BODY },
  panelTitle: { fontSize: 15, fontWeight: '800', color: NAVY },
  catsTitle: { fontSize: 14, fontWeight: '800', color: NAVY },
  cats: { width: 262, gap: 10, padding: 12 },
  catGroup: { gap: 2, paddingLeft: 6, paddingBottom: 6, borderLeftWidth: 3, borderLeftColor: 'transparent', borderBottomWidth: 1, borderBottomColor: LINE },
  catHead: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 6, borderRadius: 8 },
  catOn: { backgroundColor: '#EAF1FE' },
  catName: { fontSize: 13.5, fontWeight: '700', color: NAVY },
  catCount: { fontSize: 13, fontWeight: '700', color: NAVY },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, paddingLeft: 14, paddingRight: 6, borderRadius: 8 },
  subName: { fontSize: 12.5, fontWeight: '600', color: NAVY },
  subCount: { fontSize: 12, color: BODY },
  typeIcon: { borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  tableCard: { gap: 10, padding: 12 },
  side: { width: 320 },
  panel: { gap: 7, padding: 14 },
  code: { fontSize: 15, fontWeight: '800', color: NAVY },
  accName: { fontSize: 13.5, color: NAVY },
  pillStart: { alignSelf: 'flex-start' },
  editWide: { flex: 1.4, minWidth: 0 },
  top: { width: 300 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 3 },
  topAmt: { fontSize: 11.5, fontWeight: '700', color: NAVY },
  topPct: { width: 30, textAlign: 'right', fontSize: 11.5, color: BODY },
  track: { height: 4, marginTop: 4, borderRadius: 2, backgroundColor: '#E8EEF8', overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2, backgroundColor: '#22A55A' },
  tilesCard: { gap: 10, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  tilesRow: { flexDirection: 'row', gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: NAVY },
  cardSub: { marginTop: -6, fontSize: 12.5, color: BODY },
  chips: { flexDirection: 'row', gap: 6 },
  chip: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 9, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  chipOn: { borderColor: BLUE, backgroundColor: BLUE },
  chipText: { fontSize: 13, color: NAVY },
  chipTextOn: { fontWeight: '700', color: WHITE },
  groupCard: { padding: 0, overflow: 'hidden' },
  phoneGroup: { paddingVertical: 6 },
  groupRule: { borderTopWidth: 1, borderColor: LINE },
  phoneHead: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 8 },
  phoneName: { fontSize: 16, fontWeight: '800', color: NAVY },
  phoneAmt: { fontSize: 15, fontWeight: '800' },
  phoneSub: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 30, paddingRight: 14, paddingVertical: 8 },
  card: { gap: 6, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  cardAmt: { fontSize: 13, fontWeight: '800', color: NAVY },
});
