import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

import type { ClassResource, Resource } from './library';

type ResourceInput = components['schemas']['ResourceInput'];

function fail(error: { detail?: string } | undefined, fallback: string): never {
  throw new Error(error?.detail ?? fallback);
}

/** Resources the person can see, optionally matching a search. */
export function useResources(search: string) {
  const term = search.trim();
  return useQuery({
    queryKey: ['resources', term],
    queryFn: async (): Promise<Resource[]> => {
      const query = term ? { search: term } : {};
      const { data, error } = await api.GET('/api/v1/resources/', { params: { query } });
      if (error || !data) fail(error, 'Could not load the library.');
      return data.results;
    },
  });
}

/** Resources shared with the person's classes (or their children's). */
export function useClassResources() {
  return useQuery({
    queryKey: ['class-resources'],
    queryFn: async (): Promise<ClassResource[]> => {
      const { data, error } = await api.GET('/api/v1/resources/shared-resource-link/');
      if (error || !data) fail(error, 'Could not load class resources.');
      return data.results;
    },
  });
}

/** Adds a resource by link. */
export function useAddResource() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: ResourceInput): Promise<Resource> => {
      const { data, error } = await api.POST('/api/v1/resources/', { body });
      if (error || !data) fail(error, 'Could not add the resource.');
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['resources'] }),
  });
}
