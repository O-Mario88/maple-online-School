import { type Href, router } from 'expo-router';
import { useState } from 'react';

import { toast } from '@/lib/toast';
import { todayISO } from '@/lib/today';

import { progressOf } from './applicationForm';
import { latestApplication, seedApplication, useApplications } from './applications';
import { formFor, type SchoolCard, type SchoolNetworkData } from './networkData';
import { type Category, inCategory, listFor, type ListTab, matchReasons, type SchoolPrefs, type SchoolSort, searchSchools, sortSchools } from './schoolNetwork';

export type Net = SchoolNetworkData;
export type NetTab = 'discover' | 'recs' | 'exams' | 'vacancies' | 'institutions';

/** What the page asks the API to do in real builds. Design builds leave it out and keep everything on the page. */
export interface NetActions {
  setSaved: (schoolId: string, on: boolean) => Promise<void>;
  /** Opening a profile; the school's view total goes up, never who. */
  viewed: (schoolId: string) => void;
}

const ANY = 'all';
const DONE_PCT = 100;
const hasPrefs = (p: SchoolPrefs) => Object.values(p).some((v) => (Array.isArray(v) ? v.length > 0 : v !== undefined));
const message = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong. Please try again.');

/** Everything the School Network page needs. Saves, preferences and applications are the learner's own and private. */
export function useSchoolNetwork(net: Net, startProfile?: string, actions?: NetActions) {
  const [tab, setTab] = useState<NetTab>('discover');
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [district, setDistrict] = useState(ANY);
  const [curriculum, setCurriculum] = useState(ANY);
  const [level, setLevel] = useState(ANY);
  const [category, setCategory] = useState<Category>('all');
  // With no matching choices yet, Recommended would be empty.
  const [list, setList] = useState<ListTab>(hasPrefs(net.prefs) ? 'recommended' : 'popular');
  const [sort, setSort] = useState<SchoolSort>('relevance');
  const [prefs, setPrefs] = useState<SchoolPrefs>(net.prefs);
  const [saved, setSaved] = useState<readonly string[]>(net.saved);
  const [profile, setProfileId] = useState<string | null>(startProfile ?? null);
  const [filters, setFilters] = useState(false);
  if (net.apply.draft) seedApplication(net.apply.draft.schoolId, net.apply.draft.form);
  const local = latestApplication(useApplications());

  const pick = (v: string) => (v === ANY ? undefined : v);
  const found = searchSchools(net.schools, { query, district: pick(district), curriculum: pick(curriculum), level: pick(level) }).filter((c) => inCategory(c, category));
  const byId = (id: string): SchoolCard | undefined => net.schools.find((c) => c.id === id);
  const sent = (id: string) => net.applications.some((a) => a.schoolId === id && a.submitted);

  // The draft on this device comes first; otherwise the latest application on Maple.
  const application = (() => {
    if (local) {
      const school = byId(local.schoolId);
      const docs = school ? formFor(net.apply, school).documents.map((d) => d.id) : [];
      const submitted = local.submitted || sent(local.schoolId);
      return { schoolId: local.schoolId, submitted, pct: submitted ? DONE_PCT : progressOf(local.form, docs, todayISO(), false).pct };
    }
    const latest = net.applications[0];
    return latest ? { schoolId: latest.schoolId, submitted: latest.submitted, pct: latest.submitted ? DONE_PCT : 0 } : null;
  })();

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
      const before = saved;
      setSaved(on ? saved.filter((x) => x !== id) : [...saved, id]);
      const said = on ? 'Removed from your saved schools.' : 'Saved. Only you can see your saved schools; the school sees a total.';
      if (!actions) return toast(said);
      actions.setSaved(id, !on).then(
        () => toast(said),
        (e: unknown) => {
          setSaved(before);
          toast(message(e));
        },
      );
    },
    profile: profile ? byId(profile) : undefined,
    setProfile: (id: string | null) => {
      if (id) actions?.viewed(id);
      setProfileId(id);
    },
    /** Opens the school's application form. */
    apply: (id: string) => {
      setProfileId(null);
      router.push(`/learn/apply?school=${id}` as Href);
    },
    application,
    applicationSchool: application ? byId(application.schoolId) : undefined,
    openPricing: () => router.push('/schools/pricing' as Href),
  };
}

export type SN = ReturnType<typeof useSchoolNetwork>;
