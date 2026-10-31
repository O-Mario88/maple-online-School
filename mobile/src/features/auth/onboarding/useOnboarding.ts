import { useState } from 'react';

import type { MockData } from '@/mock';

export type Wizard = MockData['publicPages']['onboardingWizard'];

/** The onboarding choices: role, country, curriculum, grade and subjects. Selects step to the next option on each tap. */
export function useOnboarding(w: Wizard) {
  const [role, setRole] = useState(w.roles[0].key);
  const [countryIdx, setCountryIdx] = useState(0);
  const [curriculumIdx, setCurriculumIdx] = useState(0);
  const [grade, setGrade] = useState(w.defaultGrade);
  const [subjects, setSubjects] = useState<readonly string[]>([w.subjects[0].name]);

  const country = w.countries[countryIdx];
  const curriculum = country.curricula[Math.min(curriculumIdx, country.curricula.length - 1)];

  return {
    role,
    setRole,
    country,
    curriculum,
    grade,
    subjects,
    nextCountry: () => {
      setCountryIdx((i) => (i + 1) % w.countries.length);
      setCurriculumIdx(0);
    },
    nextCurriculum: () => setCurriculumIdx((i) => (i + 1) % country.curricula.length),
    nextGrade: () => setGrade((g) => w.grades[(w.grades.indexOf(g) + 1) % w.grades.length]),
    toggleSubject: (name: string) => setSubjects((s) => (s.includes(name) ? s.filter((x) => x !== name) : [...s, name])),
    roleTitle: w.roles.find((r) => r.key === role)?.title ?? '',
  };
}

export type Onboarding = ReturnType<typeof useOnboarding>;
