import { useState } from 'react';

import { todayISO } from '@/lib/today';
import type { Program } from '@/mock/career-compass';

import { programStatus, subjectFit } from './careers';
import { type DirFilters, type DirSort, filterInstitutions, INSTITUTION_TYPES, NO_FILTERS, paginate, programMatches, sortInstitutions } from './directory';
import { seedSaves, toggleInstitution, toggleProgram, useCareerSaves } from './saved';
import type { CC } from './useCompass';

const unique = (xs: readonly string[]) => [...new Set(xs)].sort();

/** The University & Programs Directory: filters, the type tabs, order, pages, saves and the program sheet. Free for everyone. */
export function useDirectory(cc: CC) {
  const [filters, setFilters] = useState<DirFilters>({ ...NO_FILTERS, type: 'University' });
  const [draft, setDraft] = useState('');
  const [sort, setSort] = useState<DirSort>('relevant');
  const [page, setPage] = useState(1);
  const [programId, openProgram] = useState<string | null>(null);
  seedSaves({ ...cc.saved, actions: cc.actions, events: cc.registrations });
  const saves = useCareerSaves();
  const today = todayISO();

  const set = (patch: Partial<DirFilters>) => {
    setFilters({ ...filters, ...patch });
    setPage(1);
  };
  const typeOf = (universityId: string) => cc.universities.find((u) => u.id === universityId)?.type ?? '';
  const anyType = { ...filters, type: 'all' };
  const counts = Object.fromEntries(INSTITUTION_TYPES.map((t) => [t.type, filterInstitutions(cc.universities, cc.programs, { ...anyType, type: t.type }, today).length]));
  const found = sortInstitutions(filterInstitutions(cc.universities, cc.programs, filters, today), cc.programs, sort);
  const q = filters.query.trim().toLowerCase();
  const programFiltered = q !== '' || [filters.level, filters.area, filters.mode, filters.fees, filters.accreditation].some((v) => v !== 'all');
  const nameOf = (universityId: string) => cc.universities.find((u) => u.id === universityId)?.name ?? '';
  const queryHits = (p: Program) => !q || `${p.title} ${p.faculty} ${nameOf(p.universityId)}`.toLowerCase().includes(q);
  // When a program filter or search is on, the programs that match are listed under the institutions.
  const matchingPrograms = programFiltered ? cc.programs.filter((p) => found.some((u) => u.id === p.universityId) && programMatches(p, typeOf(p.universityId), filters, today) && queryHits(p)) : [];

  return {
    cc,
    filters,
    set,
    clear: () => {
      setFilters({ ...NO_FILTERS, type: filters.type });
      setDraft('');
      setPage(1);
    },
    draft,
    setDraft,
    search: () => set({ query: draft }),
    sort,
    setSort,
    counts,
    pageInfo: paginate(found, page),
    setPage,
    matchingPrograms,
    areas: unique(cc.programs.map((p) => p.faculty)),
    towns: unique(cc.universities.map((u) => u.town)),
    programCount: (id: string) => cc.programs.filter((p) => p.universityId === id).length,
    programsOf: (id: string) => cc.programs.filter((p) => p.universityId === id),
    levelCount: (level: string) => cc.programs.filter((p) => programMatches(p, typeOf(p.universityId), { ...NO_FILTERS, level }, today)).length,
    uni: (id: string) => cc.universities.find((u) => u.id === id),
    status: (p: Program) => programStatus(p.accreditation, today),
    fit: (p: Program) => subjectFit(p.essentials, cc.learner.subjects),
    scholarshipsFor: (p: Program) => cc.scholarships.filter((x) => p.scholarshipIds.includes(x.id)),
    events: cc.events.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)),
    saves,
    toggleInstitution,
    toggleProgram,
    program: cc.programs.find((p) => p.id === programId),
    openProgram,
  };
}
export type Dir = ReturnType<typeof useDirectory>;
