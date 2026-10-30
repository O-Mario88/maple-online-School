import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

import type { AssignedReading, ContinueItem, LibraryItem } from './library';

type ItemInput = components['schemas']['LibraryItemInput'];
type ShareInput = components['schemas']['ShareInput'];

function fail(error: { detail?: string } | undefined, fallback: string): never {
  throw new Error(error?.detail ?? fallback);
}

/** Library items the person can see, optionally matching a search or only their own. */
export function useLibrary(search: string, mine = false) {
  const q = search.trim();
  return useQuery({
    queryKey: ['library', q, mine],
    queryFn: async (): Promise<LibraryItem[]> => {
      const query = { ...(q ? { q } : {}), ...(mine ? { mine: '1' } : {}) };
      const { data, error } = await api.GET('/api/v1/library/items/', { params: { query } });
      if (error || !data) fail(error, 'Could not load the library.');
      return data.results;
    },
  });
}

/** Reading assigned to the student, or to a parent's children. */
export function useAssignedReading() {
  return useQuery({
    queryKey: ['library', 'assigned'],
    queryFn: async (): Promise<AssignedReading[]> => {
      const { data, error } = await api.GET('/api/v1/library/assigned/');
      if (error || !data) fail(error, 'Could not load assigned reading.');
      return data.results;
    },
  });
}

/** The learner's unfinished items. */
export function useContinue(enabled: boolean) {
  return useQuery({
    queryKey: ['library', 'continue'],
    enabled,
    queryFn: async (): Promise<ContinueItem[]> => {
      const { data, error } = await api.GET('/api/v1/library/continue/');
      if (error || !data) fail(error, 'Could not load your unfinished items.');
      return data.results;
    },
  });
}

export function useAddItem() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: ItemInput): Promise<LibraryItem> => {
      const { data, error } = await api.POST('/api/v1/library/items/', { body });
      if (error || !data) fail(error, 'Could not add the item.');
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['library'] }),
  });
}

export function useShareWithClass() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: ShareInput }) => {
      const { data, error } = await api.POST('/api/v1/library/items/{id}/share/', { params: { path: { id } }, body });
      if (error || !data) fail(error, 'Could not share with the class.');
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['library'] }),
  });
}

/** Students record opening an item and finishing it. */
export function useRecordProgress() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: components['schemas']['ProgressInput']) => {
      const { data, error } = await api.POST('/api/v1/library/progress/', { body });
      if (error || !data) fail(error, 'Could not save your progress.');
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['library'] }),
  });
}
