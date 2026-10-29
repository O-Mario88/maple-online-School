import { Stack } from 'expo-router';

/** Screens only signed-in users can reach. The root layout guards this group. */
export default function SignedInLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
