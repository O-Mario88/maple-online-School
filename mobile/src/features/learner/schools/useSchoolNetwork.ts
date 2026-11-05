import { type Href, router } from 'expo-router';
import { useState } from 'react';

import { toast } from '@/lib/toast';
import { todayISO } from '@/lib/today';
import type { MockData } from '@/mock';
import type { SchoolCard } from '@/mock/school-network';

import { progressOf } from './applicationForm';
import { latestApplication, seedApplication, useApplications } from './applications';
import { type Category, inCategory, listFor, type ListTab, matchReasons, type SchoolPrefs, type SchoolSort, searchSchools, sortSchools } from './schoolNetwork';

export type Net = MockData['learner']['schoolNetwork'];
export type NetTab = 'discover' | 'recs' | 'exams' | 'vacancies' | 'institutions';

const ANY = 'all';

/** Everything the School Network page needs. Saves, preferences and applications are the learner's own and private. */
export function useSchoolNetwork(net: Net, startProfile?: string) {
  const [tab, setTab] = useState<NetTab>('discover');
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [district, setDistrict] = useState(ANY);
  const [curriculum, setCurriculum] = useState(ANY);
  const [level, setLevel] = useState(ANY);
  const [category, setCategory] = useState<Category>('all');
  const [list, setList] = useState<ListTab>('recommended');
  const [sort, setSort] = useState<SchoolSort>('relevance');
  const [prefs, setPrefs] = useState<SchoolPrefs>(net.prefs);
  const [saved, setSaved] = useState<readonly string[]>(net.saved);
  const [profile, setProfile] = useState<string | null>(startProfile ?? null);
  seedApplication(net.apply.draft.schoolId, net.apply.draft.form);
  const latest = latestApplication(useApplications());
  const docs = net.apply.documents.map((d) => d.id);
  const application = latest ? { schoolId: latest.schoolId, submitted: latest.submitted, pct: progressOf(latest.form, docs, todayISO(), latest.submitted).pct } : null;
  const [filters, setFilters] = useState(false);

  const pick = (v: string) => (v === ANY ? undefined : v);
  const found = searchSchools(net.schools, { query, district: pick(district), curriculum: pick(curriculum), level: pick(level) }).filter((c) => inCategory(c, category));
  const byId = (id: string): SchoolCard | undefined => net.schools.find((c) => c.id === id);

  return {
    net,
    tab,
    setTab,
    draft,
    setDraft,
    search: () => {
      setQuery(draft);
      setTab('discover');
    },
    district,
    setDistrict,
    curriculum,
    setCurriculum,
    level,
    setLevel,
    category,
    setCategory,
    list,
    setList,
    sort,
    setSort,
    prefs,
    setPrefs,
    clearPrefs: () => setPrefs({}),
    filters,
    setFilters,
    shown: sortSchools(listFor(found, list, prefs), sort),
    recommended: listFor(net.schools, 'recommended', prefs),
    examCentres: net.schools.filter((c) => c.exam),
    reasons: (c: SchoolCard) => matchReasons(c, prefs),
    reasonFor: (c: SchoolCard) => (list === 'recommended' ? matchReasons(c, prefs)[0] : undefined),
    byId,
    isSaved: (id: string) => saved.includes(id),
    toggleSave: (id: string) => {
      const on = saved.includes(id);
      setSaved(on ? saved.filter((x) => x !== id) : [...saved, id]);
      toast(on ? 'Removed from your saved schools.' : 'Saved. Only you can see your saved schools; the school sees a total.');
    },
    profile: profile ? byId(profile) : undefined,
    setProfile,
    /** Opens the school's application form. */
    apply: (id: string) => {
      setProfile(null);
      router.push(`/learn/apply?school=${id}` as Href);
    },
    application,
    applicationSchool: application ? byId(application.schoolId) : undefined,
    openPricing: () => router.push('/schools/pricing' as Href),
  };
}

export type SN = ReturnType<typeof useSchoolNetwork>;
