import { Redirect } from 'expo-router';

/** Revenue moved under Finance; old links land there. */
export default function RevenueRedirect() {
  return <Redirect href={'/command/finance/revenue' as never} />;
}
