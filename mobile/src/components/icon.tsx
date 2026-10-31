import { SymbolView } from 'expo-symbols';
import type { ColorValue } from 'react-native';

import { ICONS, type IconName } from '@/lib/icons';

interface IconProps {
  name: IconName;
  size?: number;
  color: ColorValue;
}

/** A decorative icon. Pair it with text: it is hidden from screen readers. */
export function Icon({ name, size = 20, color }: IconProps) {
  const icon = ICONS[name];
  return (
    <SymbolView
      name={{ ios: icon.ios, android: icon.material, web: icon.material }}
      size={size}
      tintColor={color}
      accessible={false}
      importantForAccessibility="no"
      style={{ width: size, height: size }}
    />
  );
}
