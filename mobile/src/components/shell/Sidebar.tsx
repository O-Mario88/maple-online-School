import { type Href, router, usePathname } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { Avatar } from '@/components/ui';
import { Radius, SidebarWidth, Spacing, type Theme, Type } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useAuth, useMe } from '@/lib/auth/auth-context';
import { MOCK_DATA } from '@/lib/mock';
import { activeKey, navFor, PORTAL_LABELS } from '@/lib/navigation';
import { usePortal } from '@/lib/portal-context';

import { BrandMark } from './BrandMark';
import { InboxBell } from './InboxBell';

/** The wide-screen menu: brand, portal switcher, sections and account. */
export function Sidebar() {
  const { theme, styles } = useStyles(makeStyles);
  const pathname = usePathname();
  const { portal, portals, setPortal } = usePortal();
  const { signOut } = useAuth();
  const me = useMe();
  const items = navFor(portal, MOCK_DATA);
  const active = activeKey(items, pathname);

  return (
    <SafeAreaView style={styles.sidebar} edges={['top', 'left', 'bottom']}>
      <View style={styles.brand}>
        <BrandMark size={32} />
        <View style={styles.flexText}>
          <Text style={styles.brandName}>Maple</Text>
          <Text style={styles.brandSub}>Global Online School</Text>
        </View>
        <InboxBell onDark />
      </View>

      {portals.length > 1 ? (
        <View style={styles.portals} accessibilityRole="tablist" accessibilityLabel="Switch portal">
          {portals.map((p) => {
            const selected = p === portal;
            return (
              <Pressable
                key={p}
                onPress={() => {
                  setPortal(p);
                  router.replace('/');
                }}
                style={({ hovered }) => [styles.portal, selected && styles.portalOn, hovered && !selected && styles.portalHover]}
                accessibilityRole="tab"
                accessibilityState={{ selected }}>
                <Text style={[styles.portalText, selected && styles.portalTextOn]}>{PORTAL_LABELS[p]}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <Text style={styles.portalName}>{PORTAL_LABELS[portal]}</Text>
      )}

      <ScrollView style={styles.navScroll} contentContainerStyle={styles.nav} accessibilityRole="menu">
        {items.map((item) => {
          const selected = item.key === active;
          return (
            <Pressable
              key={item.key}
              onPress={() => router.navigate(item.href as Href)}
              style={({ hovered }) => [styles.item, selected && styles.itemOn, hovered && !selected && styles.itemHover]}
              accessibilityRole="menuitem"
              accessibilityState={{ selected }}
              accessibilityLabel={item.label}>
              <Icon name={item.icon} size={20} color={selected ? theme.sidebarText : theme.sidebarMuted} />
              <Text style={[styles.itemText, selected && styles.itemTextOn]}>{item.label}</Text>
              {selected ? <View style={styles.marker} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>

      {MOCK_DATA ? <Text style={styles.mockNote}>Design preview · mock data</Text> : null}

      {me.data ? (
        <View style={styles.account}>
          <Avatar name={me.data.full_name} size={36} />
          <View style={styles.accountText}>
            <Text style={styles.accountName} numberOfLines={1}>
              {me.data.full_name}
            </Text>
            <Text style={styles.accountEmail} numberOfLines={1}>
              {me.data.email}
            </Text>
          </View>
          <Pressable
            onPress={signOut}
            style={({ hovered }) => [styles.signOut, hovered && styles.itemHover]}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            hitSlop={6}>
            <Icon name="logout" size={18} color={theme.sidebarMuted} />
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    sidebar: { width: SidebarWidth, backgroundColor: t.sidebar, paddingHorizontal: Spacing.three, paddingVertical: Spacing.four },
    brand: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.two, marginBottom: Spacing.four },
    flexText: { flex: 1 },
    brandName: { ...Type.heading, color: t.sidebarText },
    brandSub: { ...Type.caption, color: t.sidebarMuted },
    portals: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.one,
      padding: Spacing.one,
      borderRadius: Radius.md,
      backgroundColor: t.sidebarElement,
      marginBottom: Spacing.four,
    },
    portal: { flexGrow: 1, minHeight: 32, paddingHorizontal: Spacing.two, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
    portalOn: { backgroundColor: t.accent },
    portalHover: { backgroundColor: t.sidebar },
    portalText: { ...Type.caption, color: t.sidebarMuted },
    portalTextOn: { color: t.onAccent },
    portalName: { ...Type.overline, color: t.sidebarMuted, paddingHorizontal: Spacing.two, marginBottom: Spacing.two },
    navScroll: { flex: 1, marginHorizontal: -Spacing.one },
    nav: { gap: 2, paddingHorizontal: Spacing.one, paddingBottom: Spacing.three },
    mockNote: { ...Type.caption, color: t.warning, textAlign: 'center', marginBottom: Spacing.two },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
      minHeight: 44,
      paddingHorizontal: Spacing.three,
      borderRadius: Radius.md,
    },
    itemOn: { backgroundColor: t.sidebarElement },
    itemHover: { backgroundColor: t.sidebarElement },
    itemText: { ...Type.small, fontWeight: '500', color: t.sidebarMuted, flex: 1 },
    itemTextOn: { color: t.sidebarText, fontWeight: '600' },
    marker: { width: 6, height: 6, borderRadius: 3, backgroundColor: t.accent },
    spacer: { flex: 1 },
    account: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
      padding: Spacing.two,
      borderRadius: Radius.md,
      backgroundColor: t.sidebarElement,
    },
    accountText: { flex: 1, minWidth: 0 },
    accountName: { ...Type.small, fontWeight: '600', color: t.sidebarText },
    accountEmail: { ...Type.caption, color: t.sidebarMuted },
    signOut: { width: 36, height: 36, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  });
}
