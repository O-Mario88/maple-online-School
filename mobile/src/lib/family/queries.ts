import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api/client';

import type { FamilyLink, LinkStatus } from './links';

function fail(error: { detail?: string } | undefined, fallback: string): never {
  throw new Error(error?.detail ?? fallback);
}

/** Links the person can see: their school's learners, or their own children. */
export function useFamilyLinks(status?: LinkStatus) {
  return useQuery({
    queryKey: ['family', 'links', status ?? 'all'],
    queryFn: async (): Promise<FamilyLink[]> => {
      const { data, error } = await api.GET('/api/v1/family/links/', { params: { query: status ? { status } : {} } });
      if (error || !data) fail(error, 'Could not load family links.');
      return data.results;
    },
  });
}

/** Approve or decline a link; the parent's access follows at once. */
export function useDecideLink() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, approve }: { id: number; approve: boolean }): Promise<FamilyLink> => {
      const path = approve ? '/api/v1/family/links/{id}/approve/' : '/api/v1/family/links/{id}/decline/';
      const { data, error } = await api.POST(path, { params: { path: { id } } });
      if (error || !data) fail(error as { detail?: string } | undefined, 'Could not save the decision.');
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['family'] }),
  });
}
