import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api/client';

import type { Room, Slot, Term } from './types';

function fail(error: { detail?: string } | undefined, fallback: string): never {
  throw new Error(error?.detail ?? fallback);
}

export function useTerms() {
  return useQuery({
    queryKey: ['terms'],
    queryFn: async (): Promise<Term[]> => {
      const { data, error } = await api.GET('/api/v1/scheduling/terms/');
      if (error || !data) fail(error, 'Could not load the terms.');
      return data.results;
    },
  });
}

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: async (): Promise<Room[]> => {
      const { data, error } = await api.GET('/api/v1/scheduling/rooms/');
      if (error || !data) fail(error, 'Could not load the rooms.');
      return data.results;
    },
  });
}

/** One term's lessons, optionally for one class. */
export function useSlots(term: number | null, classId: number | null) {
  return useQuery({
    queryKey: ['timetable', 'term', term, classId],
    enabled: term !== null,
    queryFn: async (): Promise<Slot[]> => {
      const query = classId === null ? { term: term ?? undefined } : { term: term ?? undefined, class: classId };
      const { data, error } = await api.GET('/api/v1/scheduling/timetable/', { params: { query } });
      if (error || !data) fail(error, 'Could not load the timetable.');
      return data.results;
    },
  });
}

export interface NewLesson {
  class: number;
  term: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room?: number;
}

/** Add a lesson; a clash comes back as an error whose message names what it clashes with. */
export function useAddLesson() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: NewLesson): Promise<Slot> => {
      const { data, error } = await api.POST('/api/v1/scheduling/timetable/', { body });
      if (error || !data) fail(error, 'Could not add the lesson.');
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['timetable'] }),
  });
}

export function useRemoveLesson() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const { error } = await api.DELETE('/api/v1/scheduling/timetable/{id}/', { params: { path: { id } } });
      if (error) fail(error, 'Could not remove the lesson.');
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['timetable'] }),
  });
}

export interface NewTerm {
  institution: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export function useAddTerm() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: NewTerm): Promise<Term> => {
      const { data, error } = await api.POST('/api/v1/scheduling/terms/', { body });
      if (error || !data) fail(error as { detail?: string } | undefined, 'Could not add the term.');
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['terms'] }),
  });
}

export interface NewRoom {
  institution: number;
  name: string;
  capacity: number;
}

export function useAddRoom() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: NewRoom): Promise<Room> => {
      const { data, error } = await api.POST('/api/v1/scheduling/rooms/', { body });
      if (error || !data) fail(error as { detail?: string } | undefined, 'Could not add the room.');
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['rooms'] }),
  });
}
