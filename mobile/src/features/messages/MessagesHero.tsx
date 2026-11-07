import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SchoolHall } from '@/components/art/SchoolHall';
import { Button, ModeButton } from '@/components/ui';
import { Maple, TypeScale } from '@/constants/maple';
import { PAGE_TITLE } from '@/lib/fonts/type';

/** Space above the title on phones, below the status bar. */
const PHONE_TOP = 16;
const SUBTITLE = 'Conversations about your learning, your family, and the school.';

/** The Messages banner: serif title with a gold rule, the mode switcher and New conversation. */
export function MessagesHero({ phone, canStart }: { phone: boolean; canStart: boolean }) {
  // The banner runs under the status bar on phones, so its content starts below the notch.
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.hero, phone && styles.heroPhone, phone && { paddingTop: insets.top + PHONE_TOP }]}>
      <LinearGradient colors={[Maple.navyDeep, Maple.blue]} start={{ x: 0, y: 0.2 }} end={{ x: 1, y: 0.9 }} style={StyleSheet.absoluteFill} />
      {phone ? null : <SchoolHall style={styles.art} />}
      <View style={styles.titleRow}>
        <Text style={styles.title} {...PAGE_TITLE}>
          Messages
        </Text>
        <View style={[styles.rule, phone && styles.rulePhone]} />
      </View>
      <Text style={styles.sub}>{SUBTITLE}</Text>
      <View style={[styles.actions, phone && styles.actionsPhone]}>
        <ModeButton onDark />
        {canStart ? (
          <View style={phone ? styles.blockAction : undefined}>
            <Button label="New conversation" icon="plus" variant="accent" block={phone} onPress={() => router.push('/messages/new')} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { overflow: 'hidden', paddingHorizontal: 40, paddingTop: 36, paddingBottom: 64, gap: 8 },
  heroPhone: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 44, gap: 8 },
  art: { position: 'absolute', top: 0, right: 0, bottom: 0, width: '42%' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  title: { ...TypeScale.pageTitle, color: Maple.white },
  rule: { width: 96, height: 2, backgroundColor: Maple.gold },
  rulePhone: { width: 64 },
  sub: { maxWidth: 640, ...TypeScale.body, color: Maple.onBlueMuted },
  actions: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginTop: 14 },
  actionsPhone: { flexDirection: 'column', alignItems: 'flex-start', gap: 12, marginTop: 12 },
  blockAction: { alignSelf: 'stretch' },
});
