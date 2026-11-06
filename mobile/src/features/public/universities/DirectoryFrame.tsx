import Head from 'expo-router/head';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LearnerPhoneTop } from '@/features/learner/dashboard/DashPhone';
import { LearnerChrome } from '@/components/shell/LearnerChrome';
import { L, LightFrame } from '@/features/learner/frame/LightFrame';
import { RefScale } from '@/features/public/home/RefScale';
import { HomeNav } from '@/features/public/HomeNav';
import { PhoneBar } from '@/features/public/PhoneBar';
import { LightOnly } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth/auth-context';

/** From this width the page is laid out at the reference width and scaled to fit. */
const DESKTOP_MIN = 1200;
const REF_WIDTH = 1536;

/**
 * The directory's frame: signed-in learners get the light learner frame (the reference); visitors get
 * the public top bar. The directory is free either way.
 */
export function DirectoryFrame({ title, description, avatar, children }: { title: string; description: string; avatar?: number; children: (phone: boolean) => ReactNode }) {
  const { width } = useWindowDimensions();
  const { status } = useAuth();
  const phone = width < DESKTOP_MIN;
  const head = (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
    </Head>
  );
  if (status === 'signedIn') {
    return phone ? (
      <View style={s.phoneRoot}>
        {head}
        {avatar ? <LearnerPhoneTop avatar={avatar} /> : null}
        <ScrollView contentContainerStyle={s.phone}>{children(true)}</ScrollView>
      </View>
    ) : (
      <LearnerChrome>
        <LightFrame>
          {head}
          {children(false)}
        </LightFrame>
      </LearnerChrome>
    );
  }
  return (
    <LightOnly>
      {head}
      <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
        {phone ? <PhoneBar /> : <HomeNav wide />}
        <ScrollView contentContainerStyle={phone ? s.phone : undefined}>
          {phone ? (
            children(true)
          ) : (
            <RefScale width={width} refWidth={REF_WIDTH}>
              <View style={s.desk}>{children(false)}</View>
            </RefScale>
          )}
        </ScrollView>
      </SafeAreaView>
    </LightOnly>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: L.canvas },
  phoneRoot: { flex: 1, backgroundColor: L.canvas },
  phone: { gap: 16, padding: 16, paddingBottom: 110 },
  desk: { width: REF_WIDTH, paddingHorizontal: 40, paddingVertical: 28, backgroundColor: L.canvas },
});
