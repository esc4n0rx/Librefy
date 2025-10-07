// components/ui/icon-symbol.tsx
// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps } from 'react';
import { type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'envelope.fill': 'email',
  'lock.fill': 'lock',
  'eye': 'visibility',
  'eye.slash': 'visibility-off',
  'phone.fill': 'phone',
  'checkmark.circle.fill': 'check-circle',
  'g.circle.fill': 'g-translate',
  'bird.fill': 'flutter-dash',
  'f.circle.fill': 'facebook',
  'person.2.fill': 'people',
  'bookmark.fill': 'bookmark',
  'bell.fill': 'notifications',
  'magnifyingglass': 'search',
  'slider.horizontal.3': 'tune',
  'books.vertical.fill': 'library-books',
  'compass.fill': 'explore',
  'person.fill': 'person',
  'star.fill': 'star',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string;
  style?: StyleProp<TextStyle>;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}