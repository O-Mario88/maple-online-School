import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api/client';
import { collectPages } from '@/lib/api/pages';
import type { components } from '@/lib/api/schema';

type ApiSchool = components['schemas']['NetworkSchool'];
type Application = components['schemas']['NetworkApplication'];
type Submission = components['schemas']['NetworkSubmission'];

const KEY = ['network'] as const;

function fail(error: { detail?: string } | undefined, fallback: string): never {
  throw new Error(error?.detail ?? fallback);
}

/** Every listed school. The page searches and ranks them itself. */
export function useNetworkSchools() {
  return useQuery({
    queryKey: [...KEY, 'schools'],
    queryFn: (): Promise<ApiSchool[]> =>
      collectPages(async (page) => {
        const { data, error } = await api.GET('/api/v1/network/schools/', { params: { query: { page } } });
        if (error || !data) fail(error, 'Could not load the School Network.');
        return data;
      }),
  });
}

/** The learner's own saved schools (only they can see them). */
export function useNetworkSaves() {
  return useQuery({
    queryKey: [...KEY, 'saves'],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/v1/network/saves/');
      if (error || !data) fail(error, 'Could not load your saved schools.');
      return data.results;
    },
  });
}

/** The learner's own applications, most recent first. */
export function useNetworkApplications() {
  return useQuery({
    queryKey: [...KEY, 'applications'],
    queryFn: async (): Promise<Application[]> => {
      const { data, error } = await api.GET('/api/v1/network/applications/');
      if (error || !data) fail(error, 'Could not load your applications.');
      return data.results;
    },
  });
}

export function useSetSaved() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, on }: { id: number; on: boolean }) => {
      const params = { params: { path: { id } } };
      const { data, error } = on ? await api.PUT('/api/v1/network/schools/{id}/save/', params) : await api.DELETE('/api/v1/network/schools/{id}/save/', params);
      if (error || !data) fail(error, 'Could not update your saved schools.');
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: [...KEY, 'saves'] }),
  });
}

export function useStartApplication() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: number): Promise<Application> => {
      const { data, error } = await api.POST('/api/v1/network/schools/{id}/applications/', { params: { path: { id } } });
      if (error || !data) fail(error, 'Could not start the application.');
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: [...KEY, 'applications'] }),
  });
}

export function useSubmitApplication() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: number; body: Submission }): Promise<Application> => {
      const { data, error } = await api.POST('/api/v1/network/applications/{id}/submit/', { params: { path: { id } }, body });
      if (error || !data) fail(error, 'Could not send the application.');
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: [...KEY, 'applications'] }),
  });
}

/** Opening a profile adds one to the school's view total. Who viewed is never stored. */
export function useViewSchool() {
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await api.GET('/api/v1/network/schools/{id}/', { params: { path: { id } } });
      if (error) fail(error, 'Could not open the profile.');
    },
  });
}
