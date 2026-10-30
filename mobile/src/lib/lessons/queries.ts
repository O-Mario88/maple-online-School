import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

import type { Lesson } from './lessons';
import type { LiveSession } from './live';

type LessonInput = components['schemas']['LessonInput'];

function fail(error: { detail?: string } | undefined, fallback: string): never {
  throw new Error(error?.detail ?? fallback);
}

/** Lessons the person can see (the first page, earliest first). */
export function useLessons() {
  return useQuery({
    queryKey: ['lessons'],
    queryFn: async (): Promise<Lesson[]> => {
      const { data, error } = await api.GET('/api/v1/lessons/lesson/');
      if (error || !data) fail(error, 'Could not load lessons.');
      return data.results;
    },
  });
}

export function usePlanLesson() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: LessonInput): Promise<Lesson> => {
      const { data, error } = await api.POST('/api/v1/lessons/lesson/', { body });
      if (error || !data) fail(error, 'Could not plan the lesson.');
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['lessons'] }),
  });
}

export function usePublishLesson() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: number): Promise<Lesson> => {
      const { data, error } = await api.PATCH('/api/v1/lessons/lesson/{id}/', {
        params: { path: { id } },
        body: { access_mode: 'published' },
      });
      if (error || !data) fail(error, 'Could not publish the lesson.');
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['lessons'] }),
  });
}

type LiveSessionInput = components['schemas']['LiveSessionInput'];

/** Live sessions for lessons the person can see. */
export function useLiveSessions() {
  return useQuery({
    queryKey: ['live-sessions'],
    queryFn: async (): Promise<LiveSession[]> => {
      const { data, error } = await api.GET('/api/v1/live-sessions/live-session/');
      if (error || !data) fail(error, 'Could not load live sessions.');
      return data.results;
    },
  });
}

/** Staff attach a Meet or Zoom link to a lesson. */
export function useAddLiveSession() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: LiveSessionInput): Promise<LiveSession> => {
      const { data, error } = await api.POST('/api/v1/live-sessions/live-session/', { body });
      if (error || !data) fail(error, 'Could not add the live session.');
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['live-sessions'] }),
  });
}
