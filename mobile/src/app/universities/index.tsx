import { type Href, router } from 'expo-router';
import { useMemo } from 'react';

import { DirectoryView } from '@/features/learner/careers/DirectoryViews';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { DirectoryFrame } from '@/features/public/universities/DirectoryFrame';
import { useOptionalAccess } from '@/lib/access/access-context';
import { mockData } from '@/lib/mock';

/** The University & Programs Directory (`/universities`): free for everyone, signed in or not. */
export default function UniversitiesScreen() {
  const mock = useMemo(() => mockData(), []);
  const access = useOptionalAccess();
  // Real builds show the preview placeholder until the API serves verified institutions.
  if (!mock) return <PreviewScreen title="Universities & Programs">{() => null}</PreviewScreen>;
  // Premium learners open Career Explorer; other learners see Premium; visitors see the plans.
  const careerPaths = () => router.push((access?.hasFeature('careerCompass') ? '/learn/careers?tab=explorer' : access ? '/plans?need=premium' : '/pricing') as Href);
  return (
    <DirectoryFrame
      title="Universities & Programs Directory | Maple"
      description="Verified universities, colleges, technical institutes and vocational providers in Uganda, with each program's accreditation, entry requirements, fees and scholarships."
      avatar={mock.learner.learnerHome.avatar}>
      {(phone) => <DirectoryView cc={mock.learner.careerCompass} phone={phone} onCareerPaths={careerPaths} />}
    </DirectoryFrame>
  );
}
