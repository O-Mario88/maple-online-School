import { Image } from '@/components/picture';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import {
  TeacherGrowSideNav,
  type TeacherMe,
  TeacherPhoneTop,
  TeacherTopBar,
} from '@/features/teacher/frame/TeacherFrame';
import { BLUE, INK, MUTED, Panel } from '@/features/teacher/frame/TeacherParts';
import { toast } from '@/lib/toast';
import type { EarningsLedger, EarningsTransactionRow } from '@/mock/teacher-earnings';
import { EARNINGS_REF_WIDTH, s as deskS } from './EarningsViews.styles';
import { phoneS } from './EarningsViews.phoneStyles';
import { PhoneScroll } from '@/features/teacher/frame/PhoneScroll';
import { Maple } from '@/constants/maple';

export { EARNINGS_REF_WIDTH };

type PayoutMethodKey = 'mtn' | 'airtel' | 'mpesa' | 'bank';

/**
 * Image 3 — Teacher Earnings, Escrow Ledger & Instant Mobile-Money Payouts (`/(teacher)/earnings`).
 * Transparent breakdown of BYOS (0% fee) vs. Marketplace sales, pending escrow classes,
 * unlocked balance, 1-tap payout to MTN MoMo / Airtel Money / M-Pesa / Bank, and downloadable tax statements.
 */
export function EarningsDesk({ e, me, phone = false }: { e: EarningsLedger; me: TeacherMe; phone?: boolean }) {
  // Phones: the same page without the desktop top bar and side menu, stacked in one column.
  const s = phone ? phoneS : deskS;
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethodKey>('mtn');
  const [phoneNumber, setPhoneNumber] = useState(e.defaultPhone);
  const [payoutAmount, setPayoutAmount] = useState(e.availableBalanceVal);
  const [ledgerTab, setLedgerTab] = useState<
    'Transactions' | 'Escrow (Pending)' | 'Payout History' | 'Invoices & Tax Statements'
  >('Transactions');
  const [txQuery, setTxQuery] = useState('');
  const [primaryMethodId, setPrimaryMethodId] = useState('pm-1');

  const filteredTx: EarningsTransactionRow[] = e.transactions.filter((tx) => {
    if (ledgerTab === 'Escrow (Pending)' && tx.status !== 'In Escrow') return false;
    if (!txQuery.trim()) return true;
    const q = txQuery.trim().toLowerCase();
    return (
      tx.description.toLowerCase().includes(q) ||
      tx.type.toLowerCase().includes(q)
    );
  });

  return (
    <View style={s.page}>
      {phone ? null : (
        <TeacherTopBar
          active="Earnings"
          tabsVariant="live"
          me={me}
          placeholder="Search students, classes, or resources..."
        />
      )}

      <View style={s.body}>
        {/* Left Sidebar */}
        {phone ? null : (
          <TeacherGrowSideNav active="Earnings" />
        )}

        {/* Center Main Column */}
        <View style={s.centerCol}>
          {/* Header Row */}
          <View style={s.headerRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={s.pageTitle}>Earnings</Text>
              <Text style={s.pageSub}>
                Track your income, manage payouts, and download your financial statements.
              </Text>
            </View>

            <Pressable
              style={s.dateRangeBtn}
              onPress={() => toast('Selected period: Oct 1, 2026 – Oct 31, 2026')}>
              <Icon name="calendar" size={12} color={BLUE} />
              <Text style={s.dateRangeText}>{e.dateRange}</Text>
              <Icon name="chevronDown" size={10} color={INK} />
            </Pressable>
          </View>

          {/* Row 1 KPIs: Total Earnings, BYOS Classes (0% fee), Marketplace Sales */}
          <View style={s.kpiRow}>
            <Panel style={s.kpiTopCard}>
              <View style={[s.kpiBigTile, { backgroundColor: BLUE }]}>
                <Icon name="wallet" size={20} color={Maple.surface} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={s.kpiTopLabel}>Total Earnings</Text>
                <Text style={s.kpiTopValue}>{e.totalEarnings}</Text>
                <View style={s.growthRow}>
                  <View style={s.growthArrowCircle}>
                    <Text style={s.growthArrowText}>↑</Text>
                  </View>
                  <Text style={s.growthPct}>{e.totalGrowth}</Text>
                  <Text style={s.kpiSubNote}>vs. previous month</Text>
                </View>
              </View>
            </Panel>

            <Panel style={s.kpiTopCard}>
              <View style={[s.kpiBigTile, { backgroundColor: Maple.successText }]}>
                <Icon name="people" size={20} color={Maple.surface} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={s.kpiTopLabel}>BYOS Classes (0% fee)</Text>
                <Text style={s.kpiTopValue}>{e.byosEarnings}</Text>
                <Text style={s.kpiSubNote}>{e.byosShare}</Text>
              </View>
            </Panel>

            <Panel style={s.kpiTopCard}>
              <View style={[s.kpiBigTile, { backgroundColor: Maple.blue }]}>
                <Icon name="grid" size={20} color={Maple.surface} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={s.kpiTopLabel}>Marketplace Sales</Text>
                <Text style={s.kpiTopValue}>{e.marketplaceEarnings}</Text>
                <Text style={s.kpiSubNote}>{e.marketplaceShare}</Text>
              </View>
            </Panel>
          </View>

          {/* Row 2 KPIs: Pending in Escrow, Unlocked Balance, Lifetime Earnings */}
          <View style={s.kpiRow}>
            <Panel style={s.kpiBotCard}>
              <View style={[s.kpiSmallCircle, { backgroundColor: Maple.blueSelected }]}>
                <Icon name="clock" size={15} color={BLUE} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={s.kpiTopLabel}>Pending in Escrow</Text>
                <Text style={s.kpiBotValue}>{e.pendingEscrow}</Text>
                <Text style={s.kpiSubNote}>{e.pendingEscrowDetail}</Text>
              </View>
            </Panel>

            <Panel style={s.kpiBotCard}>
              <View style={[s.kpiSmallCircle, { backgroundColor: Maple.successSoft }]}>
                <Icon name="lock" size={15} color={Maple.successText} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={s.kpiTopLabel}>Unlocked Balance</Text>
                <Text style={s.kpiBotValue}>{e.unlockedBalance}</Text>
                <Text style={s.kpiSubNote}>{e.unlockedDetail}</Text>
              </View>
            </Panel>

            <Panel style={s.kpiBotCard}>
              <View style={[s.kpiSmallCircle, { backgroundColor: Maple.blueSelected }]}>
                <Icon name="chart" size={15} color={BLUE} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={s.kpiTopLabel}>Lifetime Earnings</Text>
                <Text style={s.kpiBotValue}>{e.lifetimeEarnings}</Text>
                <Text style={s.kpiSubNote}>{e.lifetimeDetail}</Text>
              </View>
            </Panel>
          </View>

          {/* Earnings Overview Stacked Bar Chart */}
          <Panel style={s.chartCard}>
            <View style={s.chartHeaderRow}>
              <Text style={s.chartTitle}>Earnings Overview</Text>
              <View style={s.chartLegend}>
                <View style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: Maple.blue }]} />
                  <Text style={s.legendText}>BYOS (0% fee)</Text>
                </View>
                <View style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: Maple.blue }]} />
                  <Text style={s.legendText}>Marketplace (platform fee)</Text>
                </View>
              </View>
            </View>

            <View style={s.chartBody}>
              {/* Y-Axis Labels */}
              <View style={s.yAxisCol}>
                {['UGX 8M', 'UGX 6M', 'UGX 4M', 'UGX 2M', '0'].map((lbl) => (
                  <Text key={lbl} style={s.yAxisLabel}>
                    {lbl}
                  </Text>
                ))}
              </View>

              {/* Stacked Bars Plot Area */}
              <View style={s.plotArea}>
                {/* Gridlines */}
                {[0, 1, 2, 3, 4].map((idx) => (
                  <View
                    key={idx}
                    style={[s.gridLine, { top: `${idx * 25}%` }]}
                  />
                ))}

                <View style={s.barsRow}>
                  {e.monthlyBars.map((b) => {
                    const byosH = Math.round((b.byosM / 8) * 116);
                    const mktH = Math.round((b.marketM / 8) * 116);
                    return (
                      <View key={b.month} style={s.barCol}>
                        <View style={s.barStackWrap}>
                          <View
                            style={[
                              s.barMarketSeg,
                              { height: mktH },
                            ]}
                          />
                          <View
                            style={[
                              s.barByosSeg,
                              { height: byosH },
                            ]}
                          />
                        </View>
                        <Text style={s.xAxisLabel} numberOfLines={1} accessibilityLabel={b.month}>
                          {/* Phones show the month's first letter: "Oct 2025" is wider than its bar. */}
                          {phone ? b.month.charAt(0) : b.month}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          </Panel>

          {/* Transactions & Escrow Ledger Table */}
          <Panel style={s.tableCard}>
            <View style={s.tableTopBar}>
              <PhoneScroll phone={phone}>
                  <View style={s.tableTabs}>
                  {(
                    [
                      'Transactions',
                      'Escrow (Pending)',
                      'Payout History',
                      'Invoices & Tax Statements',
                    ] as const
                  ).map((t) => {
                    const on = ledgerTab === t;
                    return (
                      <Pressable
                        key={t}
                        style={[s.tableTab, on && s.tableTabOn]}
                        onPress={() => setLedgerTab(t)}>
                        <Text style={[s.tableTabText, on && s.tableTabTextOn]}>
                          {t}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </PhoneScroll>

              <View style={s.tableControls}>
                <View style={s.searchBox}>
                  <Icon name="search" size={11} color={MUTED} />
                  <TextInput
                    value={txQuery}
                    onChangeText={setTxQuery}
                    placeholder="Search transactions..."
                    placeholderTextColor={MUTED}
                    style={s.searchInput}
                  />
                </View>
                <Pressable
                  style={s.filterBtn}
                  onPress={() => toast('Filtered transactions ledger.')}>
                  <Icon name="list" size={11} color={INK} />
                  <Text style={s.filterBtnText}>Filter</Text>
                </Pressable>
              </View>
            </View>

            {/* Table Column Headers */}
            <View style={s.thRow}>
              <Text style={[s.thText, s.colDate]}>Date</Text>
              <Text style={[s.thText, s.colType]}>Type</Text>
              <Text style={[s.thText, s.colDesc]}>Description</Text>
              <Text style={[s.thText, s.colStudents]}>Students</Text>
              <Text style={[s.thText, s.colAmount]}>Amount (UGX)</Text>
              <Text style={[s.thText, s.colStatus]}>Status</Text>
              <Text style={[s.thText, s.colActions]}>Actions</Text>
            </View>

            {/* Table Rows */}
            {filteredTx.map((tx) => {
              const isByos = tx.type === 'BYOS Class';
              const isResource = tx.type === 'Resource Sale';
              const typeBadgeBg = isByos
                ? Maple.blue
                : isResource
                  ? Maple.successText
                  : Maple.blue;
              const typeIcon = isByos
                ? 'video'
                : isResource
                  ? 'notes'
                  : 'people';
              const isCompleted = tx.status === 'Completed';
              return (
                <View key={tx.id} style={s.trRow}>
                  <Text style={[s.tdText, s.colDate]}>{tx.date}</Text>

                  <View style={[s.typeCell, s.colType]}>
                    <View
                      style={[
                        s.typeIconBadge,
                        { backgroundColor: typeBadgeBg },
                      ]}>
                      <Icon name={typeIcon} size={10} color={Maple.surface} />
                    </View>
                    <Text style={s.tdText} numberOfLines={1}>
                      {tx.type}
                    </Text>
                  </View>

                  <Text style={[s.tdText, s.colDesc]} numberOfLines={1}>
                    {tx.description}
                  </Text>

                  <Text style={[s.tdText, s.colStudents]}>{tx.students}</Text>

                  <Text style={[s.tdAmount, s.colAmount]}>{tx.amount}</Text>

                  <View style={s.colStatus}>
                    <View
                      style={[
                        s.statusPill,
                        {
                          backgroundColor: isCompleted
                            ? Maple.successSoft
                            : Maple.warningSoft,
                        },
                      ]}>
                      <View
                        style={[
                          s.statusDot,
                          {
                            backgroundColor: isCompleted
                              ? Maple.successText
                              : Maple.warning,
                          },
                        ]}
                      />
                      <Text
                        style={[
                          s.statusPillText,
                          {
                            color: isCompleted ? Maple.successText : Maple.warningText,
                          },
                        ]}>
                        {tx.status}
                      </Text>
                    </View>
                  </View>

                  <View style={[s.actionsCell, s.colActions]}>
                    <Pressable
                      style={s.viewBtn}
                      onPress={() =>
                        toast(`Viewing receipt for ${tx.description} (UGX ${tx.amount})`)
                      }>
                      <Text style={s.viewBtnText}>View</Text>
                    </Pressable>
                    <Pressable style={s.dotsBtn}>
                      <Text style={s.dotsBtnText}>•••</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </Panel>
        </View>

        {/* Right Column: Request Payout, Payout Methods, Tax Statements */}
        <View style={s.rightCol}>
          {/* Card 1: Request Payout */}
          <Panel style={s.rightCard}>
            <View style={s.rightHeaderRow}>
              <View style={s.payoutHeaderTile}>
                <Icon name="wallet" size={16} color={Maple.surface} />
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <View style={s.titleWithInfoRow}>
                  <Text style={s.rightCardTitle}>Request Payout</Text>
                  <Icon name="info" size={12} color={MUTED} />
                </View>
                <Text style={s.rightCardSub}>
                  Withdraw your unlocked balance to your preferred payment method.
                </Text>
              </View>
            </View>

            {/* Available Balance Box */}
            <View style={s.availBalanceBox}>
              <View style={s.availWalletCircle}>
                <Icon name="wallet" size={14} color={Maple.successText} />
              </View>
              <View style={{ gap: 1 }}>
                <Text style={s.availLabel}>Available Balance</Text>
                <Text style={s.availValue}>{e.unlockedBalance}</Text>
              </View>
            </View>

            {/* Select Payout Method (4 Tiles) */}
            <View style={{ gap: 5 }}>
              <Text style={s.fieldLabel}>Select Payout Method</Text>
              <View style={s.methodTilesRow}>
                {(
                  [
                    { key: 'mtn', label: 'MTN MoMo' },
                    { key: 'airtel', label: 'Airtel Money' },
                    { key: 'mpesa', label: 'M-Pesa' },
                    { key: 'bank', label: 'Bank Transfer' },
                  ] as const
                ).map((m) => {
                  const on = payoutMethod === m.key;
                  return (
                    <Pressable
                      key={m.key}
                      style={[s.methodTile, on && s.methodTileOn]}
                      onPress={() => setPayoutMethod(m.key)}>
                      {on ? (
                        <View style={s.methodCheckCircle}>
                          <Text style={s.methodCheckMark}>✓</Text>
                        </View>
                      ) : null}

                      {m.key === 'mtn' ? (
                        <Image decorative
                          source={e.mtnLogo}
                          style={s.methodLogo}
                          contentFit="contain"
                        />
                      ) : m.key === 'airtel' ? (
                        <Image decorative
                          source={e.airtelLogo}
                          style={s.methodLogo}
                          contentFit="contain"
                        />
                      ) : m.key === 'mpesa' ? (
                        <Image decorative
                          source={e.mpesaLogo}
                          style={s.methodLogo}
                          contentFit="contain"
                        />
                      ) : (
                        <Icon name="school" size={18} color={BLUE} />
                      )}

                      <Text
                        style={[
                          s.methodTileText,
                          on && { color: BLUE, fontWeight: '700' },
                        ]}
                        numberOfLines={1}>
                        {m.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Mobile Money Number */}
            <View style={{ gap: 4 }}>
              <Text style={s.fieldLabel}>Mobile Money Number</Text>
              <View style={s.phoneInputRow}>
                <TextInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  style={s.phoneTextInput}
                />
                <Pressable
                  style={s.contactBookBtn}
                  onPress={() => toast('Selected saved number +256 772 123 456')}>
                  <Icon name="person" size={13} color={BLUE} />
                </Pressable>
              </View>
            </View>

            {/* Payout Amount */}
            <View style={{ gap: 4 }}>
              <Text style={s.fieldLabel}>Payout Amount</Text>
              <View style={s.phoneInputRow}>
                <View style={s.amountInputBox}>
                  <Text style={s.amountCurrency}>UGX</Text>
                  <TextInput
                    value={payoutAmount}
                    onChangeText={setPayoutAmount}
                    style={s.amountInput}
                  />
                </View>
                <Pressable
                  style={s.maxBtn}
                  onPress={() => setPayoutAmount(e.availableBalanceVal)}>
                  <Text style={s.maxBtnText}>Max</Text>
                </Pressable>
              </View>
            </View>

            <Pressable
              style={s.requestPayoutBtn}
              onPress={() =>
                toast(
                  `Instant payout of UGX ${payoutAmount} initiated to ${payoutMethod.toUpperCase()} (${phoneNumber})!`,
                )
              }>
              <Icon name="send" size={13} color={Maple.surface} />
              <Text style={s.requestPayoutBtnText}>Request Payout</Text>
            </Pressable>

            <Text style={s.instantNote}>
              Payouts are usually instant. 0% fee on BYOS earnings.
            </Text>
          </Panel>

          {/* Card 2: Payout Methods */}
          <Panel style={s.rightCard}>
            <View style={s.savedMethodsHeader}>
              <View style={s.titleWithInfoRow}>
                <Text style={s.rightCardTitle}>Payout Methods</Text>
                <Icon name="info" size={11} color={MUTED} />
              </View>
              <Pressable onPress={() => toast('Managing saved payout methods.')}>
                <Text style={s.manageLink}>Manage</Text>
              </Pressable>
            </View>

            <View style={s.savedMethodsList}>
              {e.savedMethods.map((pm) => {
                const isPrimary = pm.id === primaryMethodId;
                return (
                  <View key={pm.id} style={s.savedMethodRow}>
                    <View
                      style={[
                        s.savedMethodBadge,
                        pm.kind === 'mtn'
                          ? { backgroundColor: Maple.warning }
                          : pm.kind === 'airtel'
                            ? { backgroundColor: Maple.error }
                            : { backgroundColor: BLUE },
                      ]}>
                      {pm.kind === 'mtn' ? (
                        <Text style={s.mtnBadgeText}>MTN</Text>
                      ) : pm.kind === 'airtel' ? (
                        <Text style={s.airtelBadgeText}>Airtel</Text>
                      ) : (
                        <Icon name="school" size={13} color={Maple.surface} />
                      )}
                    </View>

                    <View style={{ flex: 1, gap: 1 }}>
                      <Text style={s.savedMethodTitle}>{pm.title}</Text>
                      <Text style={s.savedMethodSub}>{pm.detail}</Text>
                    </View>

                    {isPrimary ? (
                      <View style={s.primaryPill}>
                        <Text style={s.primaryPillText}>Primary</Text>
                      </View>
                    ) : (
                      <Pressable
                        style={s.setPrimaryBtn}
                        onPress={() => {
                          setPrimaryMethodId(pm.id);
                          toast(`${pm.title} set as primary payout method.`);
                        }}>
                        <Text style={s.setPrimaryText}>Set as Primary</Text>
                      </Pressable>
                    )}

                    <Pressable style={s.dotsBtn}>
                      <Text style={s.dotsBtnText}>•••</Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </Panel>

          {/* Card 3: Tax Statements */}
          <Panel style={s.rightCard}>
            <View style={s.rightHeaderRow}>
              <View style={s.payoutHeaderTile}>
                <Icon name="notes" size={16} color={Maple.surface} />
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <View style={s.titleWithInfoRow}>
                  <Text style={s.rightCardTitle}>Tax Statements</Text>
                  <Icon name="info" size={11} color={MUTED} />
                </View>
                <Text style={s.rightCardSub}>
                  Download your earnings statements for tax purposes.
                </Text>
              </View>
            </View>

            <View style={s.taxControlsRow}>
              <View style={s.taxYearSelect}>
                <Text style={s.taxYearText}>2026 (Jan – Dec)</Text>
                <Icon name="chevronDown" size={10} color={INK} />
              </View>

              <Pressable
                style={s.downloadPdfBtn}
                onPress={() =>
                  toast('Downloaded 2026_Maple_Educator_Tax_Statement.pdf')
                }>
                <Icon name="download" size={12} color={Maple.surface} />
                <Text style={s.downloadPdfText}>Download PDF</Text>
              </Pressable>
            </View>

            <View style={s.taxInfoBanner}>
              <View style={s.infoCircleBlue}>
                <Text style={s.infoCircleGlyph}>i</Text>
              </View>
              <Text style={s.taxInfoText}>
                Your statements include all BYOS and Marketplace earnings, fees (if any), and payouts.
              </Text>
            </View>
          </Panel>
        </View>
      </View>
    </View>
  );
}

export function EarningsPhone({ e, me }: { e: EarningsLedger; me: TeacherMe }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: Maple.blueSelected }}>
      <TeacherPhoneTop me={me} />
      <EarningsDesk e={e} me={me} phone />
    </ScrollView>
  );
}
