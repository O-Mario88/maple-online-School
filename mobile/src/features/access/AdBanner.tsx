import { router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Radius, Spacing, type Theme } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useAccess } from '@/lib/access/access-context';
import { adFor, adPick } from '@/lib/access/ads';
import { mockData } from '@/lib/mock';
import { toast } from '@/lib/toast';

/**
 * The free tier's ad: a bigger card on the pages the free tier opens (the library, the free
 * lessons), a slim strip elsewhere, each with a way to remove ads. Sample sponsors until an
 * ad network serves real ones; nothing shows in builds without them.
 */
export function AdBanner() {
  const { styles, theme } = useStyles(makeStyles);
  const { access, guest } = useAccess();
  const path = usePathname();
  const ads = mockData()?.shared.access.ads ?? [];
  const kind = adFor({ guest, phase: access?.phase ?? null, path });
  if (!kind || ads.length === 0) return null;
  const ad = ads[adPick(path, ads.length)];
  const open = () => toast(`${ad.sponsor}: a sample ad. Ads pay for the free plan.`);
  const removeAds = () => router.push(guest ? '/sign-up' : '/plans');
  const remove = (
    <Pressable onPress={removeAds} accessibilityRole="link" hitSlop={6}>
      <Text style={styles.remove}>Remove ads</Text>
    </Pressable>
  );

  if (kind === 'banner') {
    return (
      <View style={styles.banner} accessibilityLabel={`Advertisement from ${ad.sponsor}`}>
        <Text style={styles.tag}>Ad</Text>
        <Text style={styles.bannerText} numberOfLines={1}>
          <Text style={styles.sponsor}>{`${ad.sponsor}: `}</Text>
          {ad.title}
        </Text>
        <Pressable onPress={open} accessibilityRole="link" hitSlop={6}>
          <Text style={styles.cta}>{ad.cta}</Text>
        </Pressable>
        {remove}
      </View>
    );
  }
  return (
    <View style={styles.featured} accessibilityLabel={`Advertisement from ${ad.sponsor}`}>
      <View style={[styles.tile, { backgroundColor: `${ad.tint}1F` }]}>
        <Icon name={ad.icon} size={26} color={ad.tint} />
      </View>
      <View style={styles.flex}>
        <View style={styles.row}>
          <Text style={styles.tag}>Ad</Text>
          <Text style={styles.sponsorSmall} numberOfLines={1}>
            {ad.sponsor}
          </Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {ad.title}
        </Text>
        <Text style={styles.body} numberOfLines={2}>
          {ad.body}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable style={[styles.button, { backgroundColor: ad.tint }]} onPress={open} accessibilityRole="button">
          <Text style={[styles.buttonText, { color: theme.onAccent }]}>{ad.cta}</Text>
        </Pressable>
        {remove}
      </View>
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    flex: { flex: 1, minWidth: 0 },
    row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
    banner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.three, paddingVertical: 7, borderBottomWidth: StyleSheet.hairlineWidth, borderTopWidth: StyleSheet.hairlineWidth, borderColor: t.border, backgroundColor: t.backgroundElement },
    tag: { flexShrink: 0, overflow: 'hidden', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, fontSize: 11, fontWeight: '700', color: t.textSecondary, backgroundColor: t.background, borderWidth: StyleSheet.hairlineWidth, borderColor: t.borderStrong },
    bannerText: { flex: 1, fontSize: 13, color: t.text },
    sponsor: { fontWeight: '600' },
    cta: { fontSize: 13, fontWeight: '600', color: t.accentText },
    remove: { fontSize: 12, color: t.textMuted, textDecorationLine: 'underline' },
    featured: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, margin: Spacing.two, padding: Spacing.three, borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: t.borderStrong, backgroundColor: t.backgroundElement },
    tile: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md },
    sponsorSmall: { flexShrink: 1, fontSize: 12, color: t.textMuted },
    title: { marginTop: 2, fontSize: 15, fontWeight: '600', color: t.text },
    body: { marginTop: 1, fontSize: 13, color: t.textSecondary },
    actions: { alignItems: 'center', gap: 6 },
    button: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.pill },
    buttonText: { fontSize: 13, fontWeight: '600' },
  });
}
