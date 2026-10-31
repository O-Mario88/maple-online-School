import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api/client';

import type { Programme } from './programme';

/** A country's national curriculum. It rarely changes, so it stays fresh for ten minutes. */
export function useProgramme(country: string) {
  return useQuery({
    queryKey: ['curriculum', 'programme', country],
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<Programme> => {
      const { data, error } = await api.GET('/api/v1/curriculum/programmes/{country}/', {
        params: { path: { country } },
      });
      if (error || !data) throw new Error('Could not load the curriculum.');
      return data;
    },
  });
}
