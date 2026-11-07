import { fill, half, hidden, phoneSheet, restyle, stacked, wrapped } from '@/lib/phone-sheet';

import { s } from './EarningsViews.styles';

/** EarningsViews on phones: one column, nothing wider than the screen, text sized for 1:1 viewing. */
export const phoneS = phoneSheet(s, {
  page: restyle(s.page, ['width']),
  body: stacked(s.body),
  centerCol: fill(s.centerCol),
  rightCol: fill(s.rightCol),
  headerRow: restyle(stacked(s.headerRow), ['justifyContent'], { alignItems: 'flex-start' }),
  // KPI cards one under another.
  kpiRow: stacked(s.kpiRow),
  kpiTopCard: fill(s.kpiTopCard),
  kpiBotCard: fill(s.kpiBotCard),
  chartHeaderRow: wrapped(s.chartHeaderRow),
  chartLegend: wrapped(s.chartLegend),
  barStackWrap: restyle(s.barStackWrap, ['width'], { width: 14 }),
  tableTopBar: restyle(stacked(s.tableTopBar), ['justifyContent'], { alignItems: 'stretch' }),
  tableControls: wrapped(s.tableControls),
  searchBox: restyle(s.searchBox, ['width'], { flexGrow: 1 }),
  // The transactions table keeps date, description, amount and status.
  colType: hidden,
  colStudents: hidden,
  colActions: hidden,
  taxControlsRow: wrapped(s.taxControlsRow),
  // Payout methods two to a row.
  methodTilesRow: wrapped(s.methodTilesRow),
  methodTile: half(s.methodTile),
});
