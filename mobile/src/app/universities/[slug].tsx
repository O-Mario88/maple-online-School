import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { UniversityProfile } from '@/features/learner/careers/UniversityProfile';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { DirectoryFrame } from '@/features/public/universities/DirectoryFrame';
import { mockData } from '@/lib/mock';

/** One institution's profile (`/universities/:slug`), free for everyone; `?view=programs` opens its programs. */
export default function UniversityScreen() {
  const mock = useMemo(() => mockData(), []);
  const { slug, view } = useLocalSearchParams<{ slug: string; view?: string }>();
  if (!mock) return <PreviewScreen title="University profile">{() => null}</PreviewScreen>;
  const cc = mock.learner.careerCompass;
  const name = cc.universities.find((u) => u.id === slug)?.name ?? 'Institution';
  return (
    <DirectoryFrame title={`${name} | Maple Universities & Programs`} description={`Programs, accreditation, entry requirements and open days at ${name}.`} avatar={mock.learner.learnerHome.avatar}>
      {(phone) => <UniversityProfile cc={cc} id={String(slug)} phone={phone} start={typeof view === 'string' ? view : undefined} />}
    </DirectoryFrame>
  );
}
