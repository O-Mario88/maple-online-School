import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { useShell } from '@/components/ui';
import { LiveSetup } from '@/features/school/LiveSetup';
import { OnboardingDesk, OnboardingPhone } from '@/features/school/onboarding/OnboardingViews';
import { mockData } from '@/lib/mock';

/** Inventory 59: the 15-Minute Self-Service School Onboarding Wizard (`/(school-admin)/onboarding`). */
export default function OnboardingWizardScreen() {
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  const { plan } = useLocalSearchParams<{ plan?: string }>();
  // Real builds create the school and invite people through the API; design builds show the reference wizard.
  if (!mock) return <LiveSetup />;
  const o = mock.portal.school.onboarding;
  const picked = typeof plan === 'string' ? plan : undefined;
  return wide ? <OnboardingDesk o={o} plan={picked} /> : <OnboardingPhone o={o} plan={picked} />;
}
