import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api/client';

import type { Assessment, Grade, NewAssessment, Submission } from './types';

const KEYS = {
  assignments: ['assignments'] as const,
  submissions: ['submissions'] as const,
  grades: ['grades'] as const,
};

function fail(error: { detail?: string } | undefined, fallback: string): never {
  throw new Error(error?.detail ?? fallback);
}

export function useAssignments() {
  return useQuery({
    queryKey: KEYS.assignments,
    queryFn: async (): Promise<Assessment[]> => {
      const { data, error } = await api.GET('/api/v1/assessments/assessment/');
      if (error || !data) fail(error, 'Could not load assignments.');
      return data.results;
    },
  });
}

export function useAssignment(id: number) {
  return useQuery({
    queryKey: [...KEYS.assignments, id],
    enabled: Number.isInteger(id) && id > 0,
    queryFn: async (): Promise<Assessment> => {
      const { data, error } = await api.GET('/api/v1/assessments/assessment/{id}/', { params: { path: { id } } });
      if (error || !data) fail(error, 'Could not load this assignment.');
      return data;
    },
  });
}

export function useSubmissions() {
  return useQuery({
    queryKey: KEYS.submissions,
    queryFn: async (): Promise<Submission[]> => {
      const { data, error } = await api.GET('/api/v1/assessments/submission/');
      if (error || !data) fail(error, 'Could not load submissions.');
      return data.results;
    },
  });
}

export function useGrades(student?: number) {
  return useQuery({
    queryKey: [...KEYS.grades, student ?? 'all'],
    queryFn: async (): Promise<Grade[]> => {
      const { data, error } = await api.GET('/api/v1/grading/records/', {
        params: { query: student ? { student } : {} },
      });
      if (error || !data) fail(error, 'Could not load grades.');
      return data.results;
    },
  });
}

export function useCreateAssignment() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: NewAssessment): Promise<Assessment> => {
      const { data, error } = await api.POST('/api/v1/assessments/assessment/', { body });
      if (error || !data) fail(error, 'Could not create the assignment.');
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: KEYS.assignments }),
  });
}

export function useSubmitWork() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: { assessment: number; answer: string }): Promise<Submission> => {
      const { data, error } = await api.POST('/api/v1/assessments/submission/', {
        body: { assessment: input.assessment, answers_data: { essay: input.answer } },
      });
      if (error || !data) fail(error, 'Could not submit your work.');
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: KEYS.submissions }),
  });
}

export function useGradeSubmission() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: { submission: number; score: string; feedback: string }): Promise<Grade> => {
      const { data, error } = await api.POST('/api/v1/grading/records/', {
        body: { submission: input.submission, score: input.score, teacher_feedback: input.feedback },
      });
      if (error || !data) fail(error, 'Could not save the grade.');
      return data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: KEYS.grades });
      client.invalidateQueries({ queryKey: KEYS.submissions });
    },
  });
}
