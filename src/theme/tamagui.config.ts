import { createTamagui } from 'tamagui';
import { themes } from './themes';
import { spaceGroteskFont } from './fonts';
import { defaultConfig } from '@tamagui/config/v4';

/**
 * Tailwind-compatible Space Token Scale (n × 4px)
 *
 * Used for padding, margin, gap. Matches Tailwind's spacing scale.
 * - space.1: 4px (p-1)
 * - space.2: 8px (p-2)
 * - space.4: 16px (p-4)
 * - space.6: 24px (p-6)
 * - etc.
 */
export const space = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  true: 16, // Tamagui default
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
  72: 288,
  80: 320,
  96: 384,
  // Negative values for negative margins
  '-0.5': -2,
  '-1': -4,
  '-1.5': -6,
  '-2': -8,
  '-2.5': -10,
  '-3': -12,
  '-3.5': -14,
  '-4': -16,
  '-5': -20,
  '-6': -24,
  '-7': -28,
  '-8': -32,
  '-9': -36,
  '-10': -40,
  '-11': -44,
  '-12': -48,
} as const;

/**
 * Size Token Scale for Component Heights
 *
 * These are used by Tamagui components for height/width.
 * Different from space tokens - optimized for UI component sizes.
 *
 * Small sizes (icons, badges):
 * - size.0.5: 12px - Tiny icon
 * - size.1: 16px - Small icon
 * - size.1.5: 20px - Medium icon
 * - size.2: 24px - Large icon, small badge
 * - size.2.5: 28px - Badge, icon button
 *
 * Component sizes (buttons, inputs):
 * - size.3: 32px - Small button
 * - size.3.5: 36px - Medium button (Tailwind h-9)
 * - size.4: 40px - Default button (Tailwind h-10)
 * - size.5: 44px - Large button (Tailwind h-11)
 * - size.6: 48px - Extra large
 * - size.true: 40px - Default (same as $4)
 */
export const size = {
  0: 0,
  0.5: 12,
  1: 16,
  1.5: 20,
  2: 24,
  2.5: 28,
  3: 32,
  3.5: 36,
  4: 40,
  true: 40, // Default for buttons/inputs
  5: 44,
  6: 48,
  7: 56,
  8: 64,
  9: 72,
  10: 80,
  11: 96,
  12: 112,
  14: 128,
  16: 160,
  20: 200,
  24: 240,
  28: 280,
  32: 320,
  36: 360,
  40: 400,
  44: 440,
  48: 480,
  52: 520,
  56: 560,
  60: 600,
  64: 640,
  72: 720,
  80: 800,
  96: 960,
} as const;

/**
 * Z-Index Token Scale
 *
 * Use these for consistent stacking:
 * - zIndex.0: Base (1)
 * - zIndex.1: Local elevated (10)
 * - zIndex.2: Floating elements (100)
 * - zIndex.3: Sticky/navbar (200)
 * - zIndex.4: Dropdown/popover (300)
 * - zIndex.5: Sidebar backdrop (500)
 * - zIndex.6: Sidebar (501)
 * - zIndex.7: Modal backdrop (1000)
 * - zIndex.8: Modal content (1001)
 * - zIndex.9: Select in modal (1100)
 * - zIndex.10: Command palette (2000)
 */
export const zIndex = {
  0: 1,
  1: 10,
  2: 100,
  3: 200,
  4: 300,
  5: 500,
  6: 501,
  7: 1000,
  8: 1001,
  9: 1100,
  10: 2000,
} as const;

/**
 * Border Radius Token Scale (Static fallback)
 *
 * For theme-aware radius, use theme values like $borderRadiusSm, $borderRadiusMd, etc.
 * These are set per-theme via the getTheme callback in themes.ts
 *
 * Static tokens (use for non-theme-aware cases):
 * - radius.none: 0px - No rounding
 * - radius.sm: 4px - Subtle rounding (badges, small chips)
 * - radius.md: 6px - Default for inputs, buttons
 * - radius.lg: 8px - Cards, dialogs
 * - radius.xl: 12px - Large cards, panels
 * - radius.2xl: 16px - Hero sections
 * - radius.3xl: 24px - Large decorative elements
 * - radius.full: 9999px - Pills, avatars
 */
export const radius = {
  // Semantic names (recommended)
  none: 0,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
  // Numeric scale (for compatibility with default config)
  0: 0,
  1: 2,
  2: 4,
  3: 6,
  4: 8,
  true: 8, // Default value
  5: 10,
  6: 12,
  7: 14,
  8: 16,
  9: 20,
  10: 24,
  11: 32,
  12: 9999,
} as const;

export const config = createTamagui({
  ...defaultConfig,
  themes,

  tokens: {
    ...defaultConfig.tokens,
    space,
    size,
    zIndex,
    radius,
  },

  fonts: {
    ...defaultConfig.fonts, // Optionally keep default fonts like '$mono' if needed

    // Set 'Space Grotesk' as the primary body font
    body: spaceGroteskFont,

    // Set 'Space Grotesk' as the primary heading font (or define a separate one)
    heading: spaceGroteskFont,
  },
});

export default config;
