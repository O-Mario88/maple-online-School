import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type Slot = components['schemas']['Slot'];

/** JavaScript counts Sunday as 0; the timetable counts Monday as 0. */
export function mondayFirstDay(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** Today's lessons for the signed-in person. */
export function useTodaySlots() {
  const day = mondayFirstDay(new Date());
  return useQuery({
    queryKey: ['timetable', 'day', day],
    queryFn: async (): Promise<Slot[]> => {
      const { data, error } = await api.GET('/api/v1/scheduling/timetable/', { params: { query: { day } } });
      if (error || !data) throw new Error('Could not load the timetable.');
      return data.results;
    },
  });
}
