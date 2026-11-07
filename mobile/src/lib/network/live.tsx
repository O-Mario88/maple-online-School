/**
 * The School Network pages on the API: the listed schools with the learner's own saves and
 * applications, and the calls the designed pages make. Shared by /learn/schools and /learn/apply.
 */
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ErrorText } from '@/components/ui';
import { L } from '@/features/learner/frame/LightFrame';
import type { ApplyActions } from '@/features/learner/schools/useApply';
import type { NetActions } from '@/features/learner/schools/useSchoolNetwork';
import { pickFile } from '@/lib/pick-file';
import { todayISO } from '@/lib/today';

import { useNetworkApplications, useNetworkSaves, useNetworkSchools, useSetSaved, useStartApplication, useSubmitApplication, useViewSchool } from './queries';
import { networkData, toApplicationBody } from './school-network';

const HERO = require('@/assets/images/school-network-hero.png') as number;

export function useLiveNetwork() {
  const schools = useNetworkSchools();
  const saves = useNetworkSaves();
  const applications = useNetworkApplications();
  const save = useSetSaved();
  const start = useStartApplication();
  const submit = useSubmitApplication();
  const view = useViewSchool();

  const queries = [schools, saves, applications];
  const setSaved = async (id: string, on: boolean) => {
    await save.mutateAsync({ id: Number(id), on });
  };
  const network: NetActions = { setSaved, viewed: (id) => view.mutate(Number(id)) };
  const apply: ApplyActions = {
    setSaved,
    start: async (id) => {
      await start.mutateAsync(Number(id));
    },
    // Starting again returns the same application, so this finds its id before sending.
    submit: async (id, form) => {
      const app = await start.mutateAsync(Number(id));
      await submit.mutateAsync({ id: app.id, body: toApplicationBody(form) });
    },
    pickFile,
  };
  const net =
    schools.data && saves.data && applications.data ? networkData({ schools: schools.data, saved: saves.data, applications: applications.data, today: todayISO(), hero: HERO }) : undefined;
  return { pending: queries.some((q) => q.isPending), error: queries.find((q) => q.error)?.error, net, network, apply };
}

/** While the School Network loads, or if it can't. */
export function NetworkStatus({ pending, error }: { pending: boolean; error?: Error | null }) {
  if (pending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={L.blue} size="large" accessibilityLabel="Loading the School Network" />
      </View>
    );
  }
  return (
    <View style={styles.center}>
      <ErrorText message={error?.message ?? 'Could not load the School Network.'} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: L.canvas },
});
