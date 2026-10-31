import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Badge, Banner, Button, Card, Field, Segmented, ToggleRow } from '@/components/ui';
import { Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { useStyles } from '@/hooks/use-styles';
import type { EventKind } from '@/mock/teacher';
import { toast } from '@/lib/toast';

const HOUR = 44;
const LEGEND: { kind: EventKind; label: string }[] = [
  { kind: 'school', label: 'School class' },
  { kind: 'live', label: 'Maple Live' },
  { kind: 'tutoring', label: 'Tutoring' },
  { kind: 'busy', label: 'Busy (synced)' },
];

/** Inventory 40 and 41: the week, synced busy time, and scheduling a live class with clash checks. */
export default function CalendarScreen() {
  const { theme, styles } = useStyles(makeStyles);
  const [view, setView] = useState<'week' | 'schedule'>('week');
  const [title, setTitle] = useState('Revision: matrices');
  const colour = (k: EventKind) =>
    k === 'school' ? theme.warning : k === 'live' ? theme.accent : k === 'tutoring' ? theme.success : theme.textMuted;
  const soft = (k: EventKind) =>
    k === 'school' ? theme.warningSoft : k === 'live' ? theme.accentSoft : k === 'tutoring' ? theme.successSoft : theme.backgroundSelected;
  return (
    <PreviewScreen title="Calendar" subtitle="School classes, live sessions, tutoring and your synced busy time, with no double-booking">
      {(m) => {
        const c = m.teacher.calendar;
        return (
          <>
            <Segmented
              label="View"
              options={[
                { value: 'week', label: c.week },
                { value: 'schedule', label: 'Schedule a live class' },
              ]}
              value={view}
              onChange={setView}
            />
            {view === 'week' ? (
              <>
                <View style={styles.legend}>
                  {LEGEND.map((l) => (
                    <View key={l.kind} style={styles.legendItem}>
                      <View style={[styles.swatch, { backgroundColor: colour(l.kind) }]} />
                      <Text style={styles.legendText}>{l.label}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.grid}>
                  <View style={styles.hours}>
                    {c.hours.map((h) => (
                      <Text key={h} style={[styles.hour, { height: HOUR }]}>{`${h}:00`}</Text>
                    ))}
                  </View>
                  {c.days.map((d, di) => (
                    <View key={d} style={styles.day}>
                      <Text style={styles.dayLabel}>{d}</Text>
                      <View style={[styles.column, { height: HOUR * c.hours.length }]}>
                        {c.events
                          .filter((e) => e.day === di)
                          .map((e) => (
                            <View
                              key={`${e.title}-${e.start}`}
                              style={[styles.event, { top: (e.start - c.hours[0]) * HOUR, height: e.length * HOUR - 4, backgroundColor: soft(e.kind), borderLeftColor: colour(e.kind) }]}
                              accessible
                              accessibilityLabel={`${d} ${e.start}:00, ${e.title}, ${e.room}`}>
                              <Text style={styles.eventTitle} numberOfLines={2}>
                                {e.title}
                              </Text>
                              <Text style={styles.eventRoom} numberOfLines={1}>
                                {e.room}
                              </Text>
                            </View>
                          ))}
                      </View>
                    </View>
                  ))}
                </View>
                <Card title="Calendar sync" icon="calendar">
                  <ToggleRow label="Available now for 15-minute homework help" detail="Learners can book you while this is on" initial={c.availableNow} />
                  <ToggleRow label="Google Calendar" detail="Busy times block bookings" initial />
                  <ToggleRow label="Outlook" initial />
                </Card>
              </>
            ) : (
              <Card title="Schedule a live class" icon="live">
                <Field label="Title" value={title} onChangeText={setTitle} />
                <Field label="When" value="Wed 4 Nov · 13:00–14:00" editable={false} />
                <Banner tone="warning" title="Clash: UCE revision bootcamp, Wed 13:00–15:00" body="Try Wed 15:00, Thu 13:00 or Fri 11:00 instead." />
                <View style={styles.slots}>
                  {['Wed 15:00', 'Thu 13:00', 'Fri 11:00'].map((s) => (
                    <Badge key={s} label={s} tone="good" />
                  ))}
                </View>
                <Field label="Capacity" value="40 learners" editable={false} />
                <Button label="Schedule at Thu 13:00" icon="check" onPress={() => toast('Scheduled for Thursday at 13:00. Learners have been told.')} />
              </Card>
            )}
          </>
        );
      }}
    </PreviewScreen>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    legend: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
    swatch: { width: 10, height: 10, borderRadius: 3 },
    legendText: { ...Type.caption, color: t.textSecondary },
    grid: { flexDirection: 'row', borderWidth: 1, borderColor: t.border, borderRadius: Radius.lg, overflow: 'hidden', backgroundColor: t.backgroundElement },
    hours: { width: 48, paddingTop: 32 },
    hour: { ...Type.caption, color: t.textMuted, textAlign: 'right', paddingRight: Spacing.two },
    day: { flex: 1, borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: t.border, minWidth: 0 },
    dayLabel: { ...Type.caption, color: t.textSecondary, textAlign: 'center', height: 32, lineHeight: 32, backgroundColor: t.backgroundSelected },
    column: { position: 'relative' },
    event: { position: 'absolute', left: 3, right: 3, borderRadius: Radius.sm, borderLeftWidth: 3, padding: 4, overflow: 'hidden' },
    eventTitle: { ...Type.caption, color: t.text },
    eventRoom: { ...Type.caption, fontSize: 11, color: t.textSecondary },
    slots: { flexDirection: 'row', gap: Spacing.two },
  });
}
