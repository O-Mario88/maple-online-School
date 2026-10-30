import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

import type { Intervention, InterventionKind, LearnerInsight } from './insights';

type NamedRef = components['schemas']['NamedRef'];

function fail(error: unknown, fallback: string): never {
  throw new Error((error as { detail?: string } | undefined)?.detail ?? fallback);
}

export function useClassInsight(classId: number) {
  return useQuery({
    queryKey: ['insights', 'class', classId],
    queryFn: async (): Promise<{ class: NamedRef; learners: LearnerInsight[] }> => {
      const { data, error } = await api.GET('/api/v1/insights/classes/{id}/learners/', { params: { path: { id: classId } } });
      if (error || !data) fail(error, 'Could not load this class.');
      return data;
    },
  });
}

export function useInterventions(student: number | null) {
  return useQuery({
    queryKey: ['insights', 'interventions', student],
    enabled: student != null,
    queryFn: async (): Promise<Intervention[]> => {
      const { data, error } = await api.GET('/api/v1/insights/interventions/', { params: { query: { student: student as number } } });
      if (error || !data) fail(error, 'Could not load what has been done.');
      return data.results;
    },
  });
}

export function useIntervene() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: { class: number; student: number; kind: InterventionKind; note: string }): Promise<Intervention> => {
      const { data, error } = await api.POST('/api/v1/insights/interventions/', { body });
      if (error || !data) fail(error, 'Could not save that.');
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['insights'] }),
  });
}
