import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Grid, Stat, Table } from '@/components/ui';
import { Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { useStyles } from '@/hooks/use-styles';
import { formatMoney } from '@/lib/finance/fees';
import { toast } from '@/lib/toast';

/** Inventory 50: earnings, escrow, and payouts to mobile money. */
export default function EarningsScreen() {
  const { styles } = useStyles(makeStyles);
  return (
    <PreviewScreen title="Earnings" subtitle="What you've earned, what's held until classes finish, and your payouts">
      {(m) => {
        const e = m.teacher.earnings;
        const peak = Math.max(...e.months.map((x) => x.ugx));
        return (
          <>
            <Grid min={170}>
              <Stat label="Ready to pay out" value={formatMoney(e.availableUGX, 'UGX')} icon="wallet" tone="good" />
              <Stat label="Held until classes run" value={formatMoney(e.escrowUGX, 'UGX')} icon="lock" />
              <Stat label="Your own links (0% fee)" value={formatMoney(e.byosUGX, 'UGX')} icon="globe" tone="accent" />
              <Stat label="Marketplace sales" value={formatMoney(e.marketplaceUGX, 'UGX')} icon="chart" />
            </Grid>
            <Button label={`Pay ${formatMoney(e.availableUGX, 'UGX')} to MTN MoMo now`} icon="wallet" onPress={() => toast(`${formatMoney(e.availableUGX, 'UGX')} is on its way to your MTN MoMo.`)} />
            <Card title="Monthly earnings" subtitle="Last five months" icon="chart">
              <View style={styles.chart} accessibilityLabel="Bar chart of monthly earnings">
                {e.months.map((x) => (
                  <View key={x.month} style={styles.col}>
                    <Text style={styles.value}>{Math.round(x.ugx / 1000)}k</Text>
                    <View style={[styles.bar, { height: (x.ugx / peak) * 120 }]} />
                    <Text style={styles.month}>{x.month}</Text>
                  </View>
                ))}
              </View>
            </Card>
            <Card title="Payouts" icon="check">
              <Table
                rows={e.payouts}
                rowKey={(p) => p.id}
                columns={[
                  { key: 'id', label: 'Payout', render: (p) => p.id },
                  { key: 'to', label: 'To', flex: 2, render: (p) => p.to },
                  { key: 'date', label: 'Date', render: (p) => p.date },
                  { key: 'amount', label: 'Amount', align: 'right', render: (p) => formatMoney(p.amountUGX, 'UGX') },
                ]}
              />
            </Card>
          </>
        );
      }}
    </PreviewScreen>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    chart: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.four, height: 170, paddingTop: Spacing.three },
    col: { flex: 1, alignItems: 'center', gap: Spacing.one },
    bar: { width: '70%', borderRadius: Radius.sm, backgroundColor: t.accent },
    value: { ...Type.caption, color: t.textSecondary },
    month: { ...Type.caption, color: t.textSecondary },
  });
}
