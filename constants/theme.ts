// constants/theme.ts
/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Paleta de cores do Librefy baseada no Paleta.md
const redScale = {
  50: '#fbe4e4',
  100: '#f4d1d3',
  200: '#e4b3b3',
  300: '#d3a0a0',
  400: '#c17d7d',
  500: '#a87076',
  600: '#854c50',
  700: '#902c2c',
  800: '#721d1d',
  900: '#5e1a1a',
};

const grayScale = {
  50: '#f0f0f0',
  100: '#d3d3d3',
  200: '#c8c8c8',
  300: '#b3b3b3',
  400: '#a1a1a1',
  500: '#7d7d7d',
  600: '#595959',
  700: '#323232',
  800: '#2d2d2d',
  900: '#161616',
};

const blueScale = {
  50: '#f1f7ff',
  100: '#dbeeff',
  200: '#aad7ff',
  300: '#91c3f3',
  400: '#82acdf',
  500: '#6194ed',
  600: '#3f58de',
  700: '#1031e6',
  800: '#0f24b6',
  900: '#0d23a0',
};

const greenScale = {
  50: '#e1ffe1',
  100: '#b7f2e6',
  200: '#acf0dd',
  300: '#87e6b5',
  400: '#52e6b6',
  500: '#16e66e',
  600: '#34db3b',
  700: '#00cc27',
  800: '#0aa046',
  900: '#077c04',
};

const tintColorLight = redScale[700];
const tintColorDark = redScale[300];

export const Colors = {
  light: {
    text: grayScale[900],
    textSecondary: grayScale[600],
    background: '#fff',
    backgroundSecondary: grayScale[50],
    tint: tintColorLight,
    icon: grayScale[600],
    tabIconDefault: grayScale[600],
    tabIconSelected: tintColorLight,
    border: grayScale[200],
    inputBackground: grayScale[50],
    primary: redScale[700],
    primaryLight: redScale[400],
    success: greenScale[700],
    info: blueScale[600],
    error: redScale[700],
    disabled: grayScale[300],
  },
  dark: {
    text: grayScale[50],
    textSecondary: grayScale[400],
    background: grayScale[900],
    backgroundSecondary: grayScale[800],
    tint: tintColorDark,
    icon: grayScale[400],
    tabIconDefault: grayScale[400],
    tabIconSelected: tintColorDark,
    border: grayScale[700],
    inputBackground: grayScale[800],
    primary: redScale[400],
    primaryLight: redScale[300],
    success: greenScale[500],
    info: blueScale[400],
    error: redScale[400],
    disabled: grayScale[600],
  },
};

// Tipografia baseada em Poppins conforme Paleta.md
export const Typography = {
  h1: {
    fontSize: 22,
    lineHeight: 35.2,
    fontWeight: '700' as const,
  },
  h2: {
    fontSize: 20,
    lineHeight: 32,
    fontWeight: '700' as const,
  },
  h3: {
    fontSize: 18,
    lineHeight: 28.8,
    fontWeight: '600' as const,
  },
  h4: {
    fontSize: 16,
    lineHeight: 25.6,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 14,
    lineHeight: 22.4,
    fontWeight: '400' as const,
  },
  small: {
    fontSize: 12,
    lineHeight: 19.2,
    fontWeight: '400' as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Espaçamentos consistentes
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
};