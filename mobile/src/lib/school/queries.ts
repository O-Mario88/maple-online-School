import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api/client';

import type { Class, Mark, RegisterRequest, Roster } from './types';

function fail(error: { detail?: string } | undefined, fallback: string): never {
  throw new Error(error?.detail ?? fallback);
}

export function useClasses() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: async (): Promise<Class[]> => {
      const { data, error } = await api.GET('/api/v1/classes/');
      if (error || !data) fail(error, 'Could not load classes.');
      return data.results;
    },
  });
}

export function useRoster(classId: number) {
  return useQuery({
    queryKey: ['roster', classId],
    enabled: Number.isInteger(classId) && classId > 0,
    queryFn: async (): Promise<Roster> => {
      const { data, error } = await api.GET('/api/v1/classes/{id}/roster/', { params: { path: { id: classId } } });
      if (error || !data) fail(error, 'Could not load the class list.');
      return data;
    },
  });
}

export interface MarkQuery {
  class?: number;
  record_date?: string;
}

export function useMarks(query: MarkQuery = {}) {
  return useQuery({
    queryKey: ['marks', query],
    queryFn: async (): Promise<Mark[]> => {
      const { data, error } = await api.GET('/api/v1/attendance/daily/', { params: { query } });
      if (error || !data) fail(error, 'Could not load attendance.');
      return data.results;
    },
  });
}

export function useSaveRegister() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: RegisterRequest) => {
      const { data, error } = await api.POST('/api/v1/attendance/daily/', { body });
      if (error || !data) fail(error, 'Could not save the register.');
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['marks'] }),
  });
}
