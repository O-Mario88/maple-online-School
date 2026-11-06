import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api/client';

import type { CareerRequest, CareerRequestKind } from './requests';

const KEY = ['career-requests'] as const;

/** The learner's own requests, newest first, with the career team's answer. */
export function useMyCareerRequests() {
  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<CareerRequest[]> => {
      const { data, error } = await api.GET('/api/v1/career-requests/');
      if (error || !data) throw new Error('Could not load your requests.');
      return data.results;
    },
  });
}

/** Sends a request to Maple's career team; the API checks the kind and length and limits how many an hour. */
export function useSendCareerRequest() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: { kind: CareerRequestKind; body: string }): Promise<CareerRequest> => {
      const { data, error } = await api.POST('/api/v1/career-requests/', { body: input });
      if (error || !data) throw new Error((error as { detail?: string } | undefined)?.detail ?? 'Could not send your request. Please try again.');
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: KEY }),
  });
}
