/**
 * Maple's shared controls: tabs, search and icon buttons. Light-only like the
 * designed pages, with every value from constants/maple.
 */
import { type ComponentRef, type ReactNode, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ControlHeight, IconSize, Maple, Radii, Space, TabIndicator, TypeScale } from '@/constants/maple';
import { nextTabKey } from '@/lib/design-system/tabs';
import type { IconName } from '@/lib/icons';

export interface TabItem<K extends string = string> {
  key: K;
  label: string;
  icon?: IconName;
  /** A count shown after the label, such as unread items. */
  count?: number;
}

interface TabsProps<K extends string> {
  items: readonly TabItem<K>[];
  active: K;
  onChange: (key: K) => void;
  /** Scroll sideways instead of wrapping when the tabs don't fit (phones). */
  scroll?: boolean;
  /** Label for screen readers, e.g. "Learning plan sections". */
  label?: string;
}

/**
 * The one Maple tab bar: the active tab has Maple Blue text and a 3px blue
 * underline; the others are muted but fully interactive. Arrow keys move
 * between tabs on the web.
 */
export function Tabs<K extends string>({ items, active, onChange, scroll = false, label }: TabsProps<K>) {
  const strip = useRef<ComponentRef<typeof ScrollView>>(null);
  const spots = useRef<Partial<Record<K, number>>>({});
  useEffect(() => {
    const x = spots.current[active];
    if (scroll && x !== undefined) strip.current?.scrollTo({ x: Math.max(0, x - Space.md), animated: true });
  }, [active, scroll]);

  // Arrow keys, Home and End move between tabs (web keyboard support).
  const webKeys = {
    onKeyDown: (e: { key: string; preventDefault: () => void }) => {
      const next = nextTabKey(items, active, e.key);
      if (next) {
        e.preventDefault();
        onChange(next);
      }
    },
  };

  const row = (
    <View
      style={[s.row, scroll && s.rowScroll]}
      accessibilityRole="tablist"
      accessibilityLabel={label}
      {...(Platform.OS === 'web' ? (webKeys as object) : {})}>
      {items.map((t) => {
        const on = t.key === active;
        return (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            onLayout={(e) => {
              spots.current[t.key] = e.nativeEvent.layout.x;
            }}
            style={({ hovered, focused }: { hovered?: boolean; focused?: boolean }) => [
              s.tab,
              !on && hovered && s.tabHover,
              focused && s.tabFocus,
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={t.count !== undefined ? `${t.label}, ${t.count}` : t.label}>
            {t.icon ? <Icon name={t.icon} size={IconSize.standard} color={on ? Maple.blue : Maple.secondary} /> : null}
            <Text style={[s.tabText, on && s.tabTextOn]} numberOfLines={1}>
              {t.label}
            </Text>
            {t.count !== undefined ? (
              <View style={[s.count, on && s.countOn]}>
                <Text style={[s.countText, on && s.countTextOn]}>{t.count}</Text>
              </View>
            ) : null}
            {on ? <View style={s.indicator} /> : null}
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View style={s.bar}>
      {scroll ? (
        <ScrollView ref={strip} horizontal showsHorizontalScrollIndicator={false}>
          {row}
        </ScrollView>
      ) : (
        row
      )}
    </View>
  );
}

interface SearchFieldProps extends Omit<TextInputProps, 'style'> {
  /** What is being searched, read to screen readers: "Search books". */
  label: string;
  /** Shows the "/" shortcut hint on the web (header search). */
  shortcut?: boolean;
  trailing?: ReactNode;
}

/**
 * The one Maple search input: 44px tall, 8px corners, the search icon inside
 * the field and a soft blue focus ring. Used for the header search and every
 * page-level search.
 */
export function SearchField({ label, shortcut = false, trailing, onFocus, onBlur, placeholder, ...input }: SearchFieldProps) {
  const [focused, setFocused] = useState(false);
  const field = useRef<ComponentRef<typeof TextInput>>(null);

  useEffect(() => {
    if (!shortcut || Platform.OS !== 'web' || typeof document === 'undefined') return undefined;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (e.key === '/' && !typing) {
        e.preventDefault();
        field.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [shortcut]);

  return (
    <View style={[s.search, focused && s.searchFocus]}>
      <Icon name="search" size={IconSize.standard} color={focused ? Maple.blue : Maple.secondary} />
      <TextInput
        ref={field}
        {...input}
        placeholder={placeholder ?? label}
        placeholderTextColor={Maple.muted}
        accessibilityLabel={label}
        accessibilityRole="search"
        returnKeyType="search"
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={s.searchInput}
      />
      {shortcut && Platform.OS === 'web' && !focused ? (
        <View style={s.kbd}>
          <Text style={s.kbdText}>/</Text>
        </View>
      ) : null}
      {trailing}
    </View>
  );
}

interface IconButtonProps {
  icon: IconName;
  /** Required: there is no visible text for screen readers to announce. */
  label: string;
  onPress: () => void;
  variant?: 'plain' | 'outline' | 'primary';
  disabled?: boolean;
  /** A dot for unread notifications. */
  dot?: boolean;
}

/** A square icon-only button with a 40px target (44px hit area). */
export function IconButton({ icon, label, onPress, variant = 'plain', disabled = false, dot = false }: IconButtonProps) {
  const color = disabled ? Maple.disabledText : variant === 'primary' ? Maple.white : variant === 'outline' ? Maple.blueText : Maple.body;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={2}
      style={({ hovered, pressed, focused }: { hovered?: boolean; pressed: boolean; focused?: boolean }) => [
        s.iconBtn,
        variant === 'outline' && s.iconBtnOutline,
        variant === 'primary' && s.iconBtnPrimary,
        !disabled && (hovered || pressed) && (variant === 'primary' ? s.iconBtnPrimaryHover : s.iconBtnHover),
        focused && s.tabFocus,
        disabled && s.iconBtnDisabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}>
      <Icon name={icon} size={IconSize.standard} color={color} />
      {dot ? <View style={s.dot} /> : null}
    </Pressable>
  );
}

const focusRing = Platform.select({
  web: { outlineStyle: 'solid', outlineWidth: 2, outlineColor: Maple.blue, outlineOffset: 2 } as object,
  default: {},
});

const s = StyleSheet.create({
  bar: { borderBottomWidth: 1, borderBottomColor: Maple.border },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.xs },
  rowScroll: { flexWrap: 'nowrap' },
  tab: {
    minHeight: ControlHeight.large,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.xs,
    paddingHorizontal: Space.sm,
    borderRadius: Radii.control,
  },
  tabHover: { backgroundColor: Maple.subtle },
  tabFocus: focusRing,
  tabText: { ...TypeScale.nav, color: Maple.secondary },
  tabTextOn: { color: Maple.blue, fontWeight: '600' },
  indicator: {
    position: 'absolute',
    left: Space.xs,
    right: Space.xs,
    bottom: -1,
    height: TabIndicator.thickness,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    backgroundColor: Maple.blue,
  },
  count: { minWidth: 20, paddingHorizontal: 6, height: 20, borderRadius: Radii.pill, backgroundColor: Maple.disabledSurface, alignItems: 'center', justifyContent: 'center' },
  countOn: { backgroundColor: Maple.blueSelected },
  countText: { fontSize: 12, fontWeight: '600', color: Maple.secondary },
  countTextOn: { color: Maple.blueText },
  search: {
    height: ControlHeight.search,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.xs,
    paddingHorizontal: Space.sm,
    borderRadius: Radii.control,
    borderWidth: 1,
    borderColor: Maple.border,
    backgroundColor: Maple.surface,
  },
  searchFocus: {
    borderColor: Maple.blue,
    ...Platform.select({ web: { boxShadow: `0 0 0 3px ${Maple.blueSelected}` } as object, default: {} }),
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    paddingVertical: 0,
    ...TypeScale.bodySecondary,
    color: Maple.navy,
    ...Platform.select({ web: { outlineStyle: 'none' } as object, default: {} }),
  },
  kbd: { minWidth: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: Maple.border, alignItems: 'center', justifyContent: 'center' },
  kbdText: { fontSize: 12, fontWeight: '600', color: Maple.secondary },
  iconBtn: { width: 40, height: 40, borderRadius: Radii.control, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent' },
  iconBtnOutline: { borderColor: Maple.border, backgroundColor: Maple.surface },
  iconBtnPrimary: { backgroundColor: Maple.blue },
  iconBtnHover: { backgroundColor: Maple.blueSoft },
  iconBtnPrimaryHover: { backgroundColor: Maple.blueHover },
  iconBtnDisabled: { backgroundColor: Maple.disabledSurface, borderColor: Maple.disabledBorder },
  dot: { position: 'absolute', top: 8, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: Maple.error, borderWidth: 1.5, borderColor: Maple.surface },
});
