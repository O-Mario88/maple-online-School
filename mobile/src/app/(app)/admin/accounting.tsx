import { Redirect } from 'expo-router';

/** The accounting suite moved under Finance; old links land there. */
export default function AccountingRedirect() {
  return <Redirect href={'/admin/finance/accounting' as never} />;
}
