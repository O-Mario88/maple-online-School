import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api/client';
import { collectPages } from '@/lib/api/pages';
import type { components } from '@/lib/api/schema';

export type Report = components['schemas']['Report'];
export type SubjectMark = components['schemas']['SubjectMark'];
export type MarksRequest = components['schemas']['MarksRequest'];

function fail(error: { detail?: string } | undefined, fallback: string): never {
  throw new Error(error?.detail ?? fallback);
}

export function useReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: async (): Promise<Report[]> => {
      const { data, error } = await api.GET('/api/v1/grading/reports/');
      if (error || !data) fail(error, 'Could not load report cards.');
      return data.results;
    },
  });
}

/** Every report card for one term: the API pages 20 at a time, so this follows the pages to the end. */
export function useTermReports(term: number | null) {
  return useQuery({
    queryKey: ['reports', 'term', term],
    enabled: term !== null,
    queryFn: (): Promise<Report[]> =>
      collectPages(async (page) => {
        const { data, error } = await api.GET('/api/v1/grading/reports/', { params: { query: { term: term ?? undefined, page } } });
        if (error || !data) fail(error, 'Could not load report cards.');
        return data;
      }),
  });
}

/** Publish several draft report cards to their families, one after another. */
export function usePublishReports() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (ids: readonly number[]): Promise<number> => {
      for (const id of ids) {
        const { error } = await api.PATCH('/api/v1/grading/reports/{id}/', { params: { path: { id } }, body: { is_published: true } });
        if (error) fail(error, 'Could not publish every report card.');
      }
      return ids.length;
    },
    onSettled: () => client.invalidateQueries({ queryKey: ['reports'] }),
  });
}

export function useReport(id: number) {
  return useQuery({
    queryKey: ['reports', id],
    enabled: Number.isInteger(id) && id > 0,
    queryFn: async (): Promise<Report> => {
      const { data, error } = await api.GET('/api/v1/grading/reports/{id}/', { params: { path: { id } } });
      if (error || !data) fail(error, 'Could not load this report card.');
      return data;
    },
  });
}

export function useClassMarks(classId: number) {
  return useQuery({
    queryKey: ['subject-marks', classId],
    enabled: Number.isInteger(classId) && classId > 0,
    queryFn: async (): Promise<SubjectMark[]> => {
      const { data, error } = await api.GET('/api/v1/grading/subjects/', { params: { query: { class: classId } } });
      if (error || !data) fail(error, 'Could not load marks.');
      return data.results;
    },
  });
}

export function useSaveMarks() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: MarksRequest) => {
      const { error } = await api.POST('/api/v1/grading/subjects/', { body });
      if (error) fail(error, 'Could not save the marks.');
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['subject-marks'] }),
  });
}

export function useGenerateReports() {
  const client = useQueryClient();
  return useMutation({
    /** A class id prepares the current term; `{ class, term }` prepares a chosen term. */
    mutationFn: async (target: number | { class: number; term: number }) => {
      const body = typeof target === 'number' ? { class: target } : target;
      const { data, error } = await api.POST('/api/v1/grading/reports/generate/', { body });
      if (error || !data) fail(error, 'Could not prepare report cards.');
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['reports'] }),
  });
}

export interface ReportChange {
  class_teacher_remarks?: string;
  headteacher_remarks?: string;
  is_published?: boolean;
}

export function useUpdateReport(id: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: ReportChange): Promise<Report> => {
      const { data, error } = await api.PATCH('/api/v1/grading/reports/{id}/', { params: { path: { id } }, body });
      if (error || !data) fail(error, 'Could not update the report card.');
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['reports'] }),
  });
}
