import { router } from 'expo-router';
import { useState } from 'react';

import { Button, Card, Chip, ChipRow, Field, KeyValue, ToggleRow } from '@/components/ui';
import { LanguageMenu } from '@/components/shell/LanguageMenu';
import { useAuth } from '@/lib/auth/auth-context';
import { toast } from '@/lib/toast';
import type { MockData } from '@/mock';

type Account = MockData['learner']['learnerAccount'];
export const ACCOUNT_SECTIONS = ['profile', 'preferences', 'settings'] as const;
export type AccountSection = (typeof ACCOUNT_SECTIONS)[number];
export const SECTION_LABELS: Readonly<Record<AccountSection, string>> = { profile: 'Profile', preferences: 'Learning Preferences', settings: 'Settings' };

/** Name and class can be changed here; the school, ID and guardian come from the school's records. */
export function ProfileSection({ a }: { a: Account }) {
  const [name, setName] = useState(a.profile.name);
  const [grade, setGrade] = useState(a.profile.grade);
  return (
    <>
      <Card title="About you" icon="person">
        <Field label="Your name" value={name} onChangeText={setName} autoCapitalize="words" />
        <ChipRow>
          {a.grades.map((g) => (
            <Chip key={g} label={g} selected={g === grade} onPress={() => setGrade(g)} />
          ))}
        </ChipRow>
        <Button label="Save changes" icon="check" disabled={name.trim().length < 2} onPress={() => toast('Profile saved.')} />
      </Card>
      <Card title="From your school" subtitle="Ask your school to change these" icon="school">
        <KeyValue
          items={[
            { label: 'School', value: a.profile.school },
            { label: 'Learner ID', value: a.profile.learnerId },
            { label: 'Guardian', value: a.profile.guardian },
            { label: 'Phone', value: a.profile.phone },
          ]}
        />
      </Card>
    </>
  );
}

/** Curriculum, subjects, a daily goal and the time of day the learner likes to study. */
export function PreferencesSection({ a }: { a: Account }) {
  const [subjects, setSubjects] = useState<readonly string[]>(a.chosen);
  const [goal, setGoal] = useState(a.goal);
  const [time, setTime] = useState(a.studyTime);
  const flip = (s: string) => setSubjects((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  return (
    <>
      <Card title="Curriculum" subtitle={a.curriculum} icon="map">
        <ChipRow>
          {a.subjects.map((s) => (
            <Chip key={s} label={s} selected={subjects.includes(s)} onPress={() => flip(s)} />
          ))}
        </ChipRow>
      </Card>
      <Card title="Daily goal" subtitle="Minutes of study a day" icon="timer">
        <ChipRow>
          {a.goals.map((g) => (
            <Chip key={g} label={`${g} min`} selected={g === goal} onPress={() => setGoal(g)} />
          ))}
        </ChipRow>
      </Card>
      <Card title="When you like to study" icon="clock">
        <ChipRow>
          {a.studyTimes.map((t) => (
            <Chip key={t} label={t} selected={t === time} onPress={() => setTime(t)} />
          ))}
        </ChipRow>
      </Card>
      <Card title="Language" icon="globe">
        <LanguageMenu>
          <Chip label="English · change" />
        </LanguageMenu>
      </Card>
      <Button label="Save preferences" icon="check" disabled={subjects.length === 0} onPress={() => toast('Preferences saved. Your home page will follow them.')} />
    </>
  );
}

/** Data, reminders and privacy switches, plus signing out. */
export function SettingsSection({ a }: { a: Account }) {
  const { signOut } = useAuth();
  return (
    <>
      <Card title="Settings" icon="settings">
        {a.settings.map((s) => (
          <ToggleRow key={s.label} label={s.label} detail={s.detail} initial={s.on} />
        ))}
      </Card>
      <Card title="Your data" icon="lock">
        <Button label="Read the Privacy Policy" variant="secondary" onPress={() => router.push('/privacy')} />
        <Button label="Ask for a copy of my data" variant="secondary" onPress={() => toast('We’ll send a copy of your data to your guardian within 7 days.')} />
      </Card>
      <Button label="Sign out" icon="logout" variant="danger" onPress={() => signOut().catch(() => toast('Could not sign out. Check your connection and try again.'))} />
    </>
  );
}
