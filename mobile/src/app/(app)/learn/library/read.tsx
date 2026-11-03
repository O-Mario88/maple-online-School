import { Redirect } from 'expo-router';

/** The first reader link (`/learn/library/read`) now opens "Our Environment" at its own address. */
export default function BookReaderRedirect() {
  return <Redirect href="/learn/library/our-environment" />;
}
