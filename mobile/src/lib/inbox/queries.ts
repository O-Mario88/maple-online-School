import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api/client';

import type { Notification } from './inbox';

const UNREAD_POLL_MS = 60 * 1000;

/** The person's notifications, newest first. */
export function useInbox() {
  return useQuery({
    queryKey: ['inbox', 'list'],
    queryFn: async (): Promise<Notification[]> => {
      const { data, error } = await api.GET('/api/v1/inbox/');
      if (error || !data) throw new Error('Could not load your notifications.');
      return data.results;
    },
  });
}

/** How many are unread; checked again every minute while the app is open. */
export function useUnreadCount() {
  return useQuery({
    queryKey: ['inbox', 'unread'],
    refetchInterval: UNREAD_POLL_MS,
    queryFn: async (): Promise<number> => {
      const { data, error } = await api.GET('/api/v1/inbox/summary/');
      if (error || !data) throw new Error('Could not check notifications.');
      return data.unread;
    },
  });
}

export function useMarkRead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | 'all') => {
      const res =
        id === 'all'
          ? await api.POST('/api/v1/inbox/read-all/')
          : await api.POST('/api/v1/inbox/{id}/read/', { params: { path: { id } } });
      if (res.error) throw new Error('Could not update your notifications.');
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['inbox'] }),
  });
}
