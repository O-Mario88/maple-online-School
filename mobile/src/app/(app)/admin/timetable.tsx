import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Banner, Button } from '@/components/ui';
import { Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { useStyles } from '@/hooks/use-styles';
import { toast } from '@/lib/toast';

/** Inventory 63: the week for a class, with clash checks and substitutes. */
export default function TimetableScreen() {
  const { styles } = useStyles(makeStyles);
  return (
    <PreviewScreen title="Timetable" subtitle="Teachers, classes and rooms across the week; clashes are caught before they happen">
      {(m) => {
        const t = m.school.timetable;
        return (
          <>
            <Banner tone="warning" title="1 clash to resolve" body={`${t.days[t.clash.day]} ${t.periods[t.clash.period]}: ${t.clash.detail}`} />
            <ScrollView horizontal>
              <View style={styles.grid}>
                <View style={styles.row}>
                  <Text style={[styles.head, styles.corner]}>{t.cls}</Text>
                  {t.periods.map((p) => (
                    <Text key={p} style={styles.head}>
                      {p}
                    </Text>
                  ))}
                </View>
                {t.grid.map((day, di) => (
                  <View key={t.days[di]} style={styles.row}>
                    <Text style={[styles.head, styles.corner]}>{t.days[di]}</Text>
                    {day.map((lesson, pi) => {
                      const clash = di === t.clash.day && pi === t.clash.period;
                      return (
                        <View key={`${di}-${pi}`} style={[styles.cell, clash && styles.clash]}>
                          <Text style={styles.subject} numberOfLines={1}>
                            {lesson.split(' · ')[0]}
                          </Text>
                          <Text style={styles.teacher} numberOfLines={1}>
                            {lesson.split(' · ')[1] ?? ''}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>
            <View style={styles.actions}>
              <Button label="Find a substitute" icon="people" variant="secondary" compact onPress={() => toast('Free teachers for that period have been asked to cover.')} />
              <Button label="Publish timetable" icon="check" compact onPress={() => toast('Timetable published. Teachers, learners and parents can see it now.')} />
            </View>
          </>
        );
      }}
    </PreviewScreen>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    grid: { borderWidth: 1, borderColor: t.border, borderRadius: Radius.lg, overflow: 'hidden' },
    row: { flexDirection: 'row' },
    head: { width: 120, padding: Spacing.two, ...Type.caption, color: t.textSecondary, backgroundColor: t.backgroundSelected },
    corner: { width: 80 },
    cell: { width: 120, padding: Spacing.two, borderTopWidth: StyleSheet.hairlineWidth, borderLeftWidth: StyleSheet.hairlineWidth, borderColor: t.border, backgroundColor: t.backgroundElement },
    clash: { backgroundColor: t.dangerSoft },
    subject: { ...Type.small, fontWeight: '600', color: t.text },
    teacher: { ...Type.caption, color: t.textSecondary },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  });
}
