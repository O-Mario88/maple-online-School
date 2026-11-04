import { Image } from 'expo-image';
import { type Href, router, usePathname } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Icon } from '@/components/icon';
import { RefScale } from '@/features/public/home/RefScale';
import { useMe } from '@/lib/auth/auth-context';
import type { IconName } from '@/lib/icons';

/** The light learner frame of the Video Lessons and My Plan references, laid out at their 1536px width. */
export const LIGHT_REF_WIDTH = 1536;
const SIDE_WIDTH = 186;
const LOGO = require('@/assets/images/maple-leaf.png') as number;

export const L = {
  navy: '#0B1A3F',
  ink: '#1E293B',
  body: '#475569',
  muted: '#64748B',
  blue: '#1463F3',
  line: '#E6EBF3',
  canvas: '#F6F8FD',
  white: '#FFFFFF',
  green: '#16A34A',
  soft: '#EEF4FF',
} as const;

const NAV: readonly { label: string; icon: IconName; href: string; match?: readonly string[] }[] = [
  { label: 'Home', icon: 'home', href: '/' },
  { label: 'My Plan', icon: 'target', href: '/learn/plan' },
  { label: 'Subjects', icon: 'book', href: '/learn/course' },
  { label: 'Video Lessons', icon: 'play', href: '/learn/lessons', match: ['/learn/lessons', '/learn/lesson'] },
  { label: 'Live Classes', icon: 'live', href: '/learn/live' },
  { label: 'Assignments', icon: 'clipboard', href: '/learn/assignments' },
  { label: 'Progress', icon: 'chart', href: '/learn/progress' },
  { label: 'Library', icon: 'library', href: '/learn/library' },
  { label: 'Achievements', icon: 'trophy', href: '/learn/passport' },
];

function TopBar({ placeholder, avatar }: { placeholder: string; avatar?: number }) {
  const me = useMe();
  const name = me.data?.full_name ?? 'Learner';
  return (
    <View style={s.top}>
      <Pressable style={s.brand} onPress={() => router.push('/')} accessibilityRole="link" accessibilityLabel="Maple home">
        <Image source={LOGO} style={s.leaf} contentFit="contain" />
        <View>
          <Text style={s.brandName}>Maple</Text>
          <Text style={s.brandSub}>Global Online School</Text>
        </View>
      </Pressable>
      <Pressable style={s.search} onPress={() => router.push('/learn/explore')} accessibilityRole="search">
        <Icon name="search" size={22} color={L.body} />
        <Text style={s.searchText} numberOfLines={1}>
          {placeholder}
        </Text>
      </Pressable>
      <View style={s.bell}>
        <Icon name="bell" size={24} color={L.ink} />
        <View style={s.bellDot} />
      </View>
      {avatar ? (
        <Image source={avatar} style={s.avatar} contentFit="cover" accessibilityLabel={name} />
      ) : (
        <View style={[s.avatar, s.avatarBlank]}>
          <Text style={s.avatarText}>{name.slice(0, 1).toUpperCase()}</Text>
        </View>
      )}
      <Text style={s.name} numberOfLines={1}>
        {name}
      </Text>
      <Icon name="chevronDown" size={18} color={L.ink} />
    </View>
  );
}

function SideNav() {
  const path = usePathname();
  const on = (i: (typeof NAV)[number]) => (i.match ?? [i.href]).some((m) => path === m);
  return (
    <View style={s.side}>
      {NAV.map((i) => {
        const active = on(i);
        return (
          <Pressable key={i.label} style={[s.item, active && s.itemOn]} onPress={() => router.push(i.href as Href)} accessibilityRole="link" accessibilityState={{ selected: active }}>
            <Icon name={i.icon} size={22} color={active ? L.white : L.ink} />
            <Text style={[s.itemText, active && s.itemTextOn]}>{i.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** The frame: top bar, sidebar and the page, scaled from the reference width to the window. */
export function LightFrame({ placeholder, avatar, children }: { placeholder: string; avatar?: number; children: ReactNode }) {
  const { width } = useWindowDimensions();
  return (
    <ScrollView style={s.root}>
      <RefScale width={width} refWidth={LIGHT_REF_WIDTH}>
        <View style={s.canvas}>
          <TopBar placeholder={placeholder} avatar={avatar} />
          <View style={s.body}>
            <SideNav />
            <View style={s.main}>{children}</View>
          </View>
        </View>
      </RefScale>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: L.canvas },
  canvas: { width: LIGHT_REF_WIDTH, minHeight: 1024, backgroundColor: L.canvas },
  top: { height: 70, flexDirection: 'row', alignItems: 'center', paddingLeft: 45, paddingRight: 34, borderBottomWidth: 1, borderBottomColor: '#EEF1F7', backgroundColor: L.white },
  brand: { width: 418, flexDirection: 'row', alignItems: 'center', gap: 6 },
  leaf: { width: 38, height: 40 },
  brandName: { fontSize: 22, lineHeight: 24, fontWeight: '700', color: L.navy },
  brandSub: { fontSize: 11, lineHeight: 13, fontWeight: '600', color: L.navy },
  search: { width: 636, height: 42, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, borderRadius: 21, borderWidth: 1, borderColor: '#DCE2EC', backgroundColor: L.white },
  searchText: { flex: 1, fontSize: 14.5, color: L.body },
  bell: { marginLeft: 148 },
  bellDot: { position: 'absolute', right: -2, top: -2, width: 9, height: 9, borderRadius: 5, backgroundColor: '#EF4444' },
  avatar: { marginLeft: 48, width: 38, height: 38, borderRadius: 19 },
  avatarBlank: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#E6EEFF' },
  avatarText: { fontSize: 15, fontWeight: '700', color: L.blue },
  name: { flex: 1, marginLeft: 12, fontSize: 15.5, fontWeight: '600', color: L.navy },
  body: { flexDirection: 'row' },
  side: { width: SIDE_WIDTH, paddingTop: 12, gap: 3, borderRightWidth: 1, borderRightColor: '#EEF1F7', backgroundColor: L.white, minHeight: 954 },
  item: { marginHorizontal: 12, height: 46, flexDirection: 'row', alignItems: 'center', gap: 16, paddingLeft: 12, borderRadius: 12 },
  itemOn: { backgroundColor: L.blue },
  itemText: { fontSize: 14.5, fontWeight: '500', color: L.ink },
  itemTextOn: { fontWeight: '600', color: L.white },
  main: { flex: 1, minWidth: 0, paddingLeft: 20, paddingRight: 16, paddingTop: 20, paddingBottom: 24 },
});
