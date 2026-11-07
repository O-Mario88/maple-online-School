import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ParentDesk, ParentPhoneTop } from '@/features/portal/PortalFrame';
import { Card, UnderTabs } from '@/features/portal/PortalParts';
import { BODY, CANVAS, NAVY } from '@/features/portal/tokens';
import type { IconName } from '@/lib/icons';
import { PAGE_TITLE } from '@/lib/fonts/type';
import type { ParentPortal } from '@/mock/portal';

import { AccountCard, ChildrenCard, GuardiansCard, HowToCard, NotificationsCard, PrivacyCard } from './SettingsParts';

const DESK_TABS = ['Children', 'Notifications', 'Privacy & Permissions', 'Account'] as const;
const PHONE_TABS = ['Children', 'Notifications', 'Privacy', 'Account'] as const;
const TAB_ICONS: readonly IconName[] = ['people', 'bell', 'shield', 'person'];

/** Verified Children & Guardian Notification Settings on the desktop reference. */
export function SettingsDesk({ p }: { p: ParentPortal }) {
  const [tab, setTab] = useState<string>('Children');
  const s = p.settings;
  return (
    <ParentDesk list={p.children} me={p.me} search="Search classes, messages, or resources..." active="Settings">
      <Text style={styles.title} {...PAGE_TITLE}>
        Settings
      </Text>
      <Text style={styles.subtitle}>Manage your children, notifications, privacy, and account preferences.</Text>
      <Card style={styles.tabCard}>
        <UnderTabs items={DESK_TABS} icons={TAB_ICONS} active={tab} onChange={setTab} size={15.5} style={styles.tabs} />
      </Card>
      {tab === 'Children' ? (
        <View style={styles.row}>
          <View style={[styles.col, styles.colLeft]}>
            <ChildrenCard list={p.children} />
            <GuardiansCard s={s} />
            <PrivacyCard s={s} />
          </View>
          <View style={[styles.col, styles.colRight]}>
            <HowToCard s={s} />
            <NotificationsCard s={s} />
            <AccountCard s={s} />
          </View>
        </View>
      ) : (
        <View style={styles.single}>
          {tab === 'Notifications' ? <NotificationsCard s={s} /> : null}
          {tab === 'Privacy & Permissions' ? <PrivacyCard s={s} /> : null}
          {tab === 'Account' ? <AccountCard s={s} /> : null}
        </View>
      )}
    </ParentDesk>
  );
}

/** The phone reference: icon tabs, then the children, claiming another child and guardian access. */
export function SettingsPhone({ p }: { p: ParentPortal }) {
  const [tab, setTab] = useState<string>('Children');
  const s = p.settings;
  return (
    <View style={styles.phoneRoot}>
      <ParentPhoneTop me={p.me} />
      <ScrollView contentContainerStyle={styles.phoneScroll}>
        <Text style={styles.phoneTitle} accessibilityRole="header">
          Settings
        </Text>
        <Text style={styles.phoneSub}>Manage your children, notifications, and privacy.</Text>
        <UnderTabs items={PHONE_TABS} icons={TAB_ICONS} iconTop active={tab} onChange={setTab} size={14.5} spread style={styles.phoneTabs} />
        <View style={styles.phoneBody}>
          {tab === 'Children' ? (
            <>
              <ChildrenCard list={p.children} phone />
              <GuardiansCard s={s} phone />
            </>
          ) : null}
          {tab === 'Notifications' ? <NotificationsCard s={s} phone /> : null}
          {tab === 'Privacy' ? <PrivacyCard s={s} /> : null}
          {tab === 'Account' ? <AccountCard s={s} phone /> : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 34, fontWeight: '800', color: NAVY, letterSpacing: -0.6 },
  subtitle: { marginTop: 6, fontSize: 16, color: BODY },
  tabCard: { marginTop: 20, paddingVertical: 0, paddingHorizontal: 12 },
  tabs: { borderBottomWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 20, marginTop: 20 },
  col: { minWidth: 0, gap: 20 },
  colLeft: { flex: 1.08 },
  colRight: { flex: 1 },
  single: { marginTop: 20, maxWidth: 820, gap: 20 },
  phoneRoot: { flex: 1, backgroundColor: CANVAS },
  phoneScroll: { paddingBottom: 32 },
  phoneTitle: { marginTop: 6, paddingHorizontal: 20, fontSize: 28, fontWeight: '800', color: NAVY, letterSpacing: -0.5 },
  phoneSub: { marginTop: 4, paddingHorizontal: 20, fontSize: 15.5, color: BODY },
  phoneTabs: { marginTop: 14, marginHorizontal: 20 },
  phoneBody: { gap: 20, paddingHorizontal: 20, paddingTop: 20 },
});
