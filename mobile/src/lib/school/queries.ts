import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api/client';
import { collectPages } from '@/lib/api/pages';

import type { Class, ClassLevel, Mark, RegisterRequest, Roster, School } from './types';

function fail(error: { detail?: string } | undefined, fallback: string): never {
  throw new Error(error?.detail ?? fallback);
}

export function useClasses() {
  return useQuery({
    queryKey: ['classes'],
    // Every page: a school can have more than one page of 20 classes.
    queryFn: (): Promise<Class[]> =>
      collectPages(async (page) => {
        const { data, error } = await api.GET('/api/v1/classes/', { params: { query: { page } } });
        if (error || !data) fail(error, 'Could not load classes.');
        return data;
      }),
  });
}

/** The schools the person belongs to, with their country and level. */
export function useSchools() {
  return useQuery({
    queryKey: ['schools'],
    queryFn: async (): Promise<School[]> => {
      const { data, error } = await api.GET('/api/v1/institutions/');
      if (error || !data) fail(error as { detail?: string } | undefined, 'Could not load your schools.');
      return data.results;
    },
  });
}

export function useClassLevels() {
  return useQuery({
    queryKey: ['class-levels'],
    staleTime: Infinity,
    queryFn: async (): Promise<ClassLevel[]> => {
      const { data, error } = await api.GET('/api/v1/curriculum/class-levels/');
      if (error || !data) fail(error, 'Could not load the class levels.');
      return [...data.results].sort((a, b) => a.internal_canonical_grade - b.internal_canonical_grade);
    },
  });
}

/** Create a class (school leaders only); it starts published so learners can be added straight away. */
export function useCreateClass() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: { title: string; institution: number; class_level: number; teacher: number }): Promise<Class> => {
      const { data, error } = await api.POST('/api/v1/classes/', { body: { ...body, is_published: true } });
      if (error || !data) fail(error, 'Could not create the class.');
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['classes'] }),
  });
}

export function useRoster(classId: number) {
  return useQuery({
    queryKey: ['roster', classId],
    enabled: Number.isInteger(classId) && classId > 0,
    queryFn: async (): Promise<Roster> => {
      const { data, error } = await api.GET('/api/v1/classes/{id}/roster/', { params: { path: { id: classId } } });
      if (error || !data) fail(error, 'Could not load the class list.');
      return data;
    },
  });
}

export interface MarkQuery {
  class?: number;
  record_date?: string;
}

export function useMarks(query: MarkQuery = {}) {
  return useQuery({
    queryKey: ['marks', query],
    queryFn: async (): Promise<Mark[]> => {
      const { data, error } = await api.GET('/api/v1/attendance/daily/', { params: { query } });
      if (error || !data) fail(error, 'Could not load attendance.');
      return data.results;
    },
  });
}

/** One class's register for one day, every page of it: a class can be bigger than one page of 20. */
export function useClassDayMarks(classId: number, day: string) {
  return useQuery({
    queryKey: ['marks', 'class-day', classId, day],
    enabled: Number.isInteger(classId) && classId > 0,
    queryFn: () => classDayMarks(classId, day),
  });
}

export async function classDayMarks(classId: number, day: string): Promise<Mark[]> {
  return collectPages(async (page) => {
    const { data, error } = await api.GET('/api/v1/attendance/daily/', { params: { query: { class: classId, record_date: day, page } } });
    if (error || !data) fail(error, 'Could not load attendance.');
    return data;
  });
}

export function useSaveRegister() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: RegisterRequest) => {
      const { data, error } = await api.POST('/api/v1/attendance/daily/', { body });
      if (error || !data) fail(error, 'Could not save the register.');
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['marks'] }),
  });
}
