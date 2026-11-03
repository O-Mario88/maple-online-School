import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { Paywall } from '@/features/access/Paywall';
import { useAccess } from '@/lib/access/access-context';

/** The plans that continue the free month, for whoever is signed in. */
export default function PlansScreen() {
  const { access } = useAccess();
  if (!access) return <PreviewScreen back title="Plans">{() => null}</PreviewScreen>;
  return <Paywall />;
}
