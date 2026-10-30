import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Radius, type Theme, Type } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useUnreadCount } from '@/lib/inbox/queries';

const MAX_SHOWN = 9;

/** Opens notifications; shows how many are unread. `onDark` for the sidebar. */
export function InboxBell({ onDark = false }: { onDark?: boolean }) {
  const { theme, styles } = useStyles(makeStyles);
  const unread = useUnreadCount().data ?? 0;
  const label = unread > 0 ? `Notifications, ${unread} unread` : 'Notifications';
  return (
    <Pressable
      onPress={() => router.navigate('/inbox')}
      style={({ hovered }) => [styles.button, onDark ? styles.onDark : styles.onLight, hovered && (onDark ? styles.hoverDark : styles.hoverLight)]}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}>
      <Icon name="bell" size={20} color={onDark ? theme.sidebarMuted : theme.textSecondary} />
      {unread > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unread > MAX_SHOWN ? `${MAX_SHOWN}+` : unread}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    button: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
    onDark: { backgroundColor: 'transparent' },
    onLight: { backgroundColor: t.backgroundElement, borderWidth: 1, borderColor: t.border },
    hoverDark: { backgroundColor: t.sidebarElement },
    hoverLight: { backgroundColor: t.backgroundSelected },
    badge: {
      position: 'absolute',
      top: 4,
      right: 4,
      minWidth: 18,
      height: 18,
      paddingHorizontal: 4,
      borderRadius: 9,
      backgroundColor: t.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: { ...Type.caption, fontSize: 11, lineHeight: 14, fontWeight: '700', color: t.onAccent },
  });
}
