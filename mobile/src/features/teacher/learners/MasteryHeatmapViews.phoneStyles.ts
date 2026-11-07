import { fill, half, hidden, phoneSheet, restyle, stacked, wrapped } from '@/lib/phone-sheet';

import { s } from './MasteryHeatmapViews.styles';

/** MasteryHeatmapViews on phones: one column, nothing wider than the screen, text sized for 1:1 viewing. */
export const phoneS = phoneSheet(s, {
  page: restyle(s.page, ['width']),
  body: stacked(s.body),
  // The class insights menu is a desktop side panel.
  leftSide: hidden,
  centerCol: fill(s.centerCol),
  rightCol: fill(s.rightCol),
  headerRow: restyle(stacked(s.headerRow), ['justifyContent'], { alignItems: 'flex-start' }),
  headerFilters: wrapped(s.headerFilters),
  kpiRow: wrapped(s.kpiRow),
  kpiCard: half(s.kpiCard),
  matrixTopBar: restyle(stacked(s.matrixTopBar), ['justifyContent'], { alignItems: 'stretch' }),
  matrixSearchCluster: wrapped(s.matrixSearchCluster),
  searchBox: restyle(s.searchBox, ['width'], { flexGrow: 1 }),
  legendRow: wrapped(s.legendRow),
  // Insight cards one under another.
  insightsGrid: stacked(s.insightsGrid),
  insightCard: fill(s.insightCard),
});
