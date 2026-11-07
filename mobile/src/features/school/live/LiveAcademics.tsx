import { useQueries } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { EmptyState, ErrorText, Screen, useShell } from '@/components/ui';
import { ACADEMICS_NAV, ACADEMICS_QUICK_ACTIONS, ACADEMICS_SECTIONS, ACADEMICS_TABLES, ACADEMICS_TABS, academicsAction, type AcademicsPage } from '@/features/school/academics/academicsShape';
import { AdminAcademicsDesk, AdminAcademicsPhone, type AcademicsActions } from '@/features/school/academics/AdminAcademicsViews';
import { BLUE } from '@/features/portal/tokens';
import { api } from '@/lib/api/client';
import { useMe } from '@/lib/auth/auth-context';
import { useProgramme } from '@/lib/curriculum/queries';
import { useUnreadCount } from '@/lib/inbox/queries';
import { leaderSchools, type SchoolRef } from '@/lib/roles';
import { academicsData, type AcademicsKey } from '@/lib/school/academics-live';
import { adminMe, countryName } from '@/lib/school/admin-me';
import { useClasses, useClassLevels, useSchools } from '@/lib/school/queries';
import { rosterGroups } from '@/lib/school/roster';
import { useMembers } from '@/lib/school/roster-queries';
import { useTerms } from '@/lib/school/timetable-queries';

import { AddGradeSheet, AddTermSheet } from './AcademicsForms';

const LEVEL_NAMES: Readonly<Record<string, string>> = { primary: 'Primary', secondary: 'Secondary', nursery: 'Nursery' };
type Sheet = 'term' | 'grade' | null;

/** The designed Academics page on the school's real data. */
function SchoolAcademics({ school }: { school: SchoolRef }) {
  const { wide } = useShell();
  const me = useMe();
  const unread = useUnreadCount();
  const schools = useSchools();
  const terms = useTerms();
  const classes = useClasses();
  const levels = useClassLevels();
  const members = useMembers();
  const detail = schools.data?.find((s) => s.id === school.id);
  const programme = useProgramme(detail?.country_code ?? 'UG');
  const schoolClasses = (classes.data ?? []).filter((c) => c.institution === school.id);
  const rosters = useQueries({
    queries: schoolClasses.map((c) => ({
      queryKey: ['roster', c.id],
      queryFn: async () => {
        const { data, error } = await api.GET('/api/v1/classes/{id}/roster/', { params: { path: { id: c.id } } });
        if (error || !data) throw new Error(error?.detail ?? 'Could not load the class list.');
        return data;
      },
    })),
  });
  const [sheet, setSheet] = useState<Sheet>(null);

  const core = [me, schools, terms, classes, levels, members];
  if (core.some((q) => q.isPending)) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={BLUE} size="large" accessibilityLabel="Loading the academic set-up" />
      </View>
    );
  }
  const failed = core.find((q) => q.error)?.error;
  if (failed || !me.data) return <ErrorText message={failed?.message ?? 'Could not load your account.'} />;

  const groups = rosterGroups(members.data ?? [], school.id, '');
  const data = academicsData({
    school: { name: school.name, country: countryName(detail?.country_code ?? ''), level: LEVEL_NAMES[detail?.school_level ?? ''] ?? detail?.school_level ?? '' },
    learners: groups.learners.filter((m) => m.status === 'active').length,
    terms: (terms.data ?? []).filter((t) => t.institution === school.id),
    classes: schoolClasses,
    levels: levels.data ?? [],
    classLearners: new Map(schoolClasses.map((c, i) => [c.id, rosters[i]?.data?.students.length ?? 0])),
    programme: programme.data ?? null,
  });
  const page: AcademicsPage = {
    me: adminMe(me.data, school.id, unread.data ?? 0),
    school: school.name,
    matrices: data.matrices,
    nav: ACADEMICS_NAV,
    sections: ACADEMICS_SECTIONS.map((s) => ({ ...s, count: data.counts[s.key as AcademicsKey] ?? 0 })),
    tabs: ACADEMICS_TABS,
    quickActions: ACADEMICS_QUICK_ACTIONS,
    tables: ACADEMICS_TABLES.map((t) => ({ ...t, rows: data.rows[t.key as AcademicsKey] ?? [] })),
  };

  const act: AcademicsActions = {
    onAction: (action) => {
      const target = academicsAction(action);
      if (target === 'curriculum') router.push('/curriculum');
      else if (target) setSheet(target);
    },
    // Buttons the API has no form for yet are drawn disabled instead of answering with a toast.
    isAvailable: (action) => academicsAction(action) !== null,
  };

  return (
    <>
      {wide ? <AdminAcademicsDesk a={page} act={act} /> : <AdminAcademicsPhone a={page} act={act} />}
      <AddTermSheet visible={sheet === 'term'} onClose={() => setSheet(null)} school={school.id} />
      <AddGradeSheet
        visible={sheet === 'grade'}
        onClose={() => setSheet(null)}
        school={school.id}
        levels={levels.data ?? []}
        teachers={groups.staff.filter((m) => m.status === 'active')}
      />
    </>
  );
}

/** Real builds: the designed Academics page for the school the person leads. */
export function LiveAcademics() {
  const me = useMe();
  const school = me.data ? leaderSchools(me.data.memberships)[0] : undefined;
  if (me.data && !school) {
    return (
      <Screen title="Academics">
        <EmptyState icon="map" title="For school leaders" body="Your school's leaders set up classes and terms." />
      </Screen>
    );
  }
  return school ? <SchoolAcademics key={school.id} school={school} /> : null;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48 },
});
