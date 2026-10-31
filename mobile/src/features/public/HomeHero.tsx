import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { HeroActions, HeroCopy } from './home/HeroCopy';
import { HeroPhotoDesktop, HeroPhotoPhone } from './home/HeroPhoto';
import type { Landing } from './home/types';

/** The hero's height in the reference (y 57 to 572). */
export const HERO_HEIGHT = 515;
const HERO_SKY = ['#FFFFFF', '#F8FAFE', '#DCEEFA'] as const;

/** Desktop hero, laid out in the reference's pixels (render it inside RefScale). */
export function HomeHeroDesktop({ landing }: { landing: Landing }) {
  return (
    <View style={styles.desk}>
      <LinearGradient colors={HERO_SKY} style={StyleSheet.absoluteFill} />
      <HeroPhotoDesktop landing={landing} left={620} height={HERO_HEIGHT} />
      <View style={styles.copy}>
        <HeroCopy landing={landing} />
      </View>
      <View style={styles.actions}>
        <HeroActions landing={landing} />
      </View>
    </View>
  );
}

/** Phone and tablet hero: the same pieces in one column. */
export function HomeHeroPhone({ landing, width }: { landing: Landing; width: number }) {
  return (
    <View style={styles.phone}>
      <LinearGradient colors={HERO_SKY} style={StyleSheet.absoluteFill} />
      <HeroCopy landing={landing} phone />
      <View style={styles.phonePhoto}>
        <HeroPhotoPhone landing={landing} width={width} />
      </View>
      <View style={styles.phoneActions}>
        <HeroActions landing={landing} phone />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  desk: { height: HERO_HEIGHT },
  copy: { position: 'absolute', left: 101, top: 58 },
  actions: { position: 'absolute', left: 101, top: 287 },
  phone: { paddingTop: 28, paddingBottom: 24 },
  phonePhoto: { marginTop: 22 },
  phoneActions: { marginTop: 22 },
});
