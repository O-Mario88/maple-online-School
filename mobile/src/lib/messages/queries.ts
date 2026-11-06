import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

import { isThread } from './view';

export type ThreadSummary = components['schemas']['ThreadSummary'];
export type Thread = components['schemas']['Thread'];
export interface Contact {
  id: number;
  name: string;
  role: string;
}

function fail(error: unknown, fallback: string): never {
  throw new Error((error as { detail?: string } | undefined)?.detail ?? fallback);
}

export function useThreads() {
  return useQuery({
    queryKey: ['messages', 'threads'],
    queryFn: async (): Promise<ThreadSummary[]> => {
      const { data, error } = await api.GET('/api/v1/messages/threads/');
      if (error || !data) fail(error, 'Could not load your messages.');
      return data.results;
    },
  });
}

export function useThread(id: number) {
  return useQuery({
    queryKey: ['messages', 'thread', id],
    refetchInterval: 30 * 1000,
    queryFn: async (): Promise<Thread> => {
      const { data, error } = await api.GET('/api/v1/messages/threads/{id}/', { params: { path: { id } } });
      if (error || !data) fail(error, 'Could not open this conversation.');
      return data;
    },
  });
}

export function useContacts(student: number | null) {
  return useQuery({
    queryKey: ['messages', 'contacts', student],
    enabled: student != null,
    queryFn: async (): Promise<Contact[]> => {
      const { data, error } = await api.GET('/api/v1/messages/contacts/', { params: { query: { student: student as number } } });
      if (error || !data) fail(error, 'Could not load who you can write to.');
      return data.results;
    },
  });
}

export function useStartThread() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: { student: number; staff?: number; subject: string; body: string }): Promise<Thread> => {
      const { data, error } = await api.POST('/api/v1/messages/threads/', { body });
      if (error || !data) fail(error, 'Could not send.');
      // The form opens the new conversation next, so it needs the conversation back, not just an acknowledgement.
      if (!isThread(data)) fail(undefined, 'Sent, but the conversation could not be opened. Find it in Messages.');
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['messages'] }),
  });
}

export function useReply(id: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: string): Promise<Thread> => {
      const { data, error } = await api.POST('/api/v1/messages/threads/{id}/messages/', { params: { path: { id } }, body: { body } });
      if (error || !data) fail(error, 'Could not send.');
      return data;
    },
    onSuccess: (thread) => {
      // Show the updated conversation straight away when the server sends it; otherwise fetch it again.
      if (isThread(thread)) client.setQueryData(['messages', 'thread', id], thread);
      else void client.invalidateQueries({ queryKey: ['messages', 'thread', id] });
      return client.invalidateQueries({ queryKey: ['messages', 'threads'] });
    },
  });
}
