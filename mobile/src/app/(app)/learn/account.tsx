import { router, useLocalSearchParams } from 'expo-router';

import { Chip, ChipRow } from '@/components/ui';
import {
  ACCOUNT_SECTIONS,
  type AccountSection,
  PreferencesSection,
  ProfileSection,
  SECTION_LABELS,
  SettingsSection,
} from '@/features/learner/account/AccountSections';
import { PreviewScreen } from '@/features/preview/PreviewScreen';

const isSection = (v: unknown): v is AccountSection => ACCOUNT_SECTIONS.some((s) => s === v);

/** The learner's account: Profile, Learning Preferences and Settings, one tab each (?section=). */
export default function AccountScreen() {
  const { section } = useLocalSearchParams<{ section?: string }>();
  const current: AccountSection = isSection(section) ? section : 'profile';
  return (
    <PreviewScreen back title={SECTION_LABELS[current]} subtitle="Your Maple account">
      {(m) => {
        const a = m.learner.learnerAccount;
        return (
          <>
            <ChipRow>
              {ACCOUNT_SECTIONS.map((s) => (
                <Chip key={s} label={SECTION_LABELS[s]} selected={s === current} onPress={() => router.setParams({ section: s })} />
              ))}
            </ChipRow>
            {current === 'profile' ? <ProfileSection a={a} /> : null}
            {current === 'preferences' ? <PreferencesSection a={a} /> : null}
            {current === 'settings' ? <SettingsSection a={a} /> : null}
          </>
        );
      }}
    </PreviewScreen>
  );
}
