import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Card, IconTile, UnderTabs } from '@/features/portal/PortalParts';
import { BODY, GREEN, NAVY, RED, type Tone } from '@/features/portal/tokens';
import { change } from '@/features/school/growth/growth';
import type { IconName } from '@/lib/icons';
import { Maple } from '@/constants/maple';

/** The title of a school-growth page: icon tile, title and line, with actions on the right. */
export function HubHeader({ icon, title, subtitle, right, phone = false }: { icon: IconName; title: string; subtitle: string; right?: ReactNode; phone?: boolean }) {
  return (
    <View style={[s.head, phone && s.headP]}>
      <View style={s.headMain}>
        <IconTile icon={icon} tone="purple" size={phone ? 42 : 52} radius={12} solid />
        <View style={s.flex}>
          <Text style={[s.h1, phone && s.h1P]} accessibilityRole="header">
            {title}
          </Text>
          <Text style={s.sub}>{subtitle}</Text>
        </View>
      </View>
      {right ? <View style={[s.actions, phone && s.actionsP]}>{right}</View> : null}
    </View>
  );
}

/** The page's tabs in a white bar (scrolling on phones). */
export function HubTabs({ items, icons, active, onChange, phone = false }: { items: readonly string[]; icons?: readonly IconName[]; active: string; onChange: (t: string) => void; phone?: boolean }) {
  const tabs = <UnderTabs items={items} active={active} onChange={onChange} icons={phone ? undefined : icons} size={phone ? 13 : 14} />;
  return phone ? (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {tabs}
    </ScrollView>
  ) : (
    <Card style={s.tabs}>{tabs}</Card>
  );
}

/** A total with its change on the previous term. */
export function KpiCard({ label, icon, tone, now, before, value }: { label: string; icon: IconName; tone: Tone; now: number; before?: number; value?: string }) {
  const c = before === undefined ? null : change(now, before);
  return (
    <Card style={s.kpi}>
      <IconTile icon={icon} tone={tone} size={46} radius={12} />
      <View style={s.flex}>
        <Text style={s.kpiLabel} numberOfLines={2}>
          {label}
        </Text>
        <View style={s.kpiRow}>
          <Text style={s.kpiValue}>{value ?? now.toLocaleString('en-US')}</Text>
          {c ? (
            <View style={[s.delta, { backgroundColor: c.up ? Maple.successSoft : Maple.errorSoft }]} accessibilityLabel={`${c.up ? 'Up' : 'Down'} ${c.pct}% on last term`}>
              <Icon name={c.up ? 'arrowUp' : 'arrowDown'} size={11} color={c.up ? GREEN : RED} />
              <Text style={[s.deltaText, { color: c.up ? GREEN : RED }]}>{`${c.pct}%`}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

/** A row of KPI cards that wraps on narrow screens. */
export function KpiRow({ children }: { children: ReactNode }) {
  return <View style={s.kpis}>{children}</View>;
}

/** The privacy line every growth and admissions page carries. */
export function PrivacyNote({ text }: { text: string }) {
  return (
    <View style={s.privacy}>
      <Icon name="shield" size={15} color={Maple.blue} />
      <Text style={s.privacyText}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14 },
  headP: { flexDirection: 'column', alignItems: 'stretch' },
  headMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  h1: { fontSize: 26, fontWeight: '800', color: NAVY },
  h1P: { fontSize: 22 },
  sub: { marginTop: 2, fontSize: 14, color: BODY },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  actionsP: { flexWrap: 'wrap' },
  tabs: { alignSelf: 'flex-start', marginBottom: 16, paddingHorizontal: 8, paddingVertical: 0 },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 16 },
  kpi: { flexGrow: 1, flexBasis: 200, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  kpiLabel: { fontSize: 13, fontWeight: '600', color: NAVY },
  kpiRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  kpiValue: { fontSize: 24, fontWeight: '800', color: NAVY },
  delta: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  deltaText: { fontSize: 12, fontWeight: '700' },
  privacy: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  privacyText: { flex: 1, fontSize: 12.5, color: BODY },
});
