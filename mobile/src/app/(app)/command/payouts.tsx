import { Redirect } from 'expo-router';

/** Payouts moved under Finance; old links land there. */
export default function PayoutsRedirect() {
  return <Redirect href={'/command/finance/payouts' as never} />;
}
