import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api/client';

import type { SchoolMember } from './types';

function fail(error: { detail?: string } | undefined, fallback: string): never {
  throw new Error(error?.detail ?? fallback);
}

/** Everyone in the schools the person leads (and their own memberships elsewhere). */
export function useMembers() {
  return useQuery({
    queryKey: ['members'],
    queryFn: async (): Promise<SchoolMember[]> => {
      const { data, error } = await api.GET('/api/v1/institution-memberships/');
      if (error || !data) fail(error as { detail?: string } | undefined, 'Could not load the school’s people.');
      return data.results;
    },
  });
}

/** Suspend or reactivate a member; the API refuses to remove a school's last leader. */
export function useSetMemberStatus() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'active' | 'suspended' }): Promise<SchoolMember> => {
      const { data, error } = await api.PATCH('/api/v1/institution-memberships/{id}/', { params: { path: { id } }, body: { status } });
      if (error || !data) fail(error as { detail?: string } | undefined, 'Could not change this person’s access.');
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['members'] }),
  });
}

/** Put a learner of the school on a class list. */
export function useEnrol() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ classId, student }: { classId: number; student: number }) => {
      const { data, error } = await api.POST('/api/v1/class-enrollments/', { body: { enrolled_class: classId, student } });
      if (error || !data) fail(error as { detail?: string } | undefined, 'Could not add the learner to the class.');
      return data;
    },
    onSuccess: (_d, v) => client.invalidateQueries({ queryKey: ['roster', v.classId] }),
  });
}
