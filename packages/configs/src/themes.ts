import * as Colors from '@tamagui/colors';
import { createThemes } from '@tamagui/config/v4';

// =============================================================================
// MOTION TOKENS (Tier 1)
// =============================================================================
// Consistent animation durations and easing curves across all themes.
// Use these for transitions, animations, and micro-interactions.

export const motionTokens = {
  // Duration tokens
  durationInstant: '50ms',
  durationFast: '100ms',
  durationNormal: '200ms',
  durationSlow: '300ms',
  durationSluggish: '500ms',

  // Easing tokens (CSS cubic-bezier)
  easingDefault: 'cubic-bezier(0.4, 0, 0.2, 1)', // ease-in-out
  easingIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easingOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easingLinear: 'linear',
  easingBounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  easingElastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  easingSpring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

// =============================================================================
// CHART COLORS (Tier 2) - OKLCH for perceptual uniformity
// =============================================================================
// These colors are designed for data visualization with good contrast
// and accessibility. They work in both light and dark modes.

export const chartColorsLight = {
  chart1: '#2563eb', // Blue
  chart2: '#16a34a', // Green
  chart3: '#ea580c', // Orange
  chart4: '#8b5cf6', // Purple
  chart5: '#db2777', // Pink
  chart6: '#0891b2', // Cyan
  chart7: '#ca8a04', // Yellow
};

export const chartColorsDark = {
  chart1: '#3b82f6', // Blue (brighter)
  chart2: '#22c55e', // Green (brighter)
  chart3: '#f97316', // Orange (brighter)
  chart4: '#a78bfa', // Purple (brighter)
  chart5: '#ec4899', // Pink (brighter)
  chart6: '#06b6d4', // Cyan (brighter)
  chart7: '#eab308', // Yellow (brighter)
};

// =============================================================================
// THEME STYLE TOKENS
// =============================================================================
// These define per-theme design tokens beyond just colors - shadows, radii, etc.
// Components can use these for theme-specific styling variations.

// Default radius values (as strings for Tamagui theme compatibility)
const defaultRadiusTokens = {
  radiusNone: '0px',
  radiusSm: '4px',
  radiusMd: '6px',
  radiusLg: '8px',
  radiusXl: '12px',
  radius2xl: '16px',
  radius3xl: '24px',
  radiusFull: '9999px',
};

// Retro radius values - sharp corners for video game aesthetic
const retroRadiusTokens = {
  radiusNone: '0px',
  radiusSm: '0px',
  radiusMd: '0px',
  radiusLg: '0px',
  radiusXl: '0px',
  radius2xl: '2px',
  radius3xl: '2px',
  radiusFull: '2px',
};

const defaultStyleTokens = {
  // Shadow styles
  shadowCard: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
  shadowCardHover: '0 10px 20px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.08)',
  shadowModal: '0 25px 50px rgba(0,0,0,0.25)',
  shadowButton: '0 1px 2px rgba(0,0,0,0.05)',
  // Input shadow tokens
  shadowInput: '0 1px 2px rgba(0,0,0,0.04)',
  shadowInputHover: '0 2px 4px rgba(0,0,0,0.06)',
  shadowInputFocus: '0 0 0 3px rgba(59, 130, 246, 0.15)',
  // Interactive element tokens
  hoverLift: '-2px',
  pressLift: '0px',
  radiusStyle: 'default',
  ...defaultRadiusTokens,
};

const auroraStyleTokens = {
  // Aurora website uses subtle shadows with purple tints
  shadowCard: '0 2px 8px rgba(139, 92, 246, 0.08), 0 1px 3px rgba(0,0,0,0.12)',
  shadowCardHover: '0 12px 28px rgba(139, 92, 246, 0.18), 0 6px 12px rgba(0,0,0,0.1)',
  shadowModal: '0 25px 50px rgba(0,0,0,0.5)',
  shadowButton: '0 2px 4px rgba(139, 92, 246, 0.2)',
  shadowGlow: '0 0 40px rgba(139, 92, 246, 0.3)',
  // Input shadow tokens (purple tinted)
  shadowInput: '0 1px 3px rgba(139, 92, 246, 0.06)',
  shadowInputHover: '0 2px 6px rgba(139, 92, 246, 0.1)',
  shadowInputFocus: '0 0 0 3px rgba(139, 92, 246, 0.2)',
  // Interactive element tokens
  hoverLift: '-3px',
  pressLift: '0px',
  radiusStyle: 'default',
  ...defaultRadiusTokens,
};

const retroStyleTokens = {
  // Retro theme uses harder shadows and sharper edges
  shadowCard: '4px 4px 0px rgba(0,0,0,0.2)',
  shadowCardHover: '6px 6px 0px rgba(0,0,0,0.25)',
  shadowModal: '8px 8px 0px rgba(0,0,0,0.3)',
  shadowButton: '3px 3px 0px rgba(0,0,0,0.2)',
  shadowInset: 'inset 2px 2px 0px rgba(255,255,255,0.1)',
  // Input shadow tokens (hard shadows)
  shadowInput: '2px 2px 0px rgba(0,0,0,0.1)',
  shadowInputHover: '3px 3px 0px rgba(0,0,0,0.15)',
  shadowInputFocus: '3px 3px 0px rgba(217, 119, 6, 0.3)',
  // Interactive element tokens (retro uses harder movement)
  hoverLift: '-2px',
  pressLift: '1px',
  radiusStyle: 'retro',
  ...retroRadiusTokens,
};

const shadcnStyleTokens = {
  // Shadcn uses extremely subtle shadows, relies more on borders
  shadowCard: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  shadowCardHover: '0 4px 12px 0 rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  shadowModal: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  shadowButton: 'none',
  // Input shadow tokens (minimal, subtle)
  shadowInput: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  shadowInputHover: '0 1px 3px 0 rgba(0, 0, 0, 0.07)',
  shadowInputFocus: '0 0 0 2px rgba(148, 163, 184, 0.25)',
  // Interactive element tokens (subtle lift)
  hoverLift: '-1px',
  pressLift: '0px',
  radiusStyle: 'shadcn',
  ...defaultRadiusTokens,
};

// =============================================================================
// SEMANTIC COLOR TOKENS
// =============================================================================
// These map semantic meanings to color values, making theming consistent
// and allowing easy rebranding by changing these mappings.

// =============================================================================
// LABEL/CATEGORY COLOR PALETTE
// =============================================================================
// Standardized colors for labels, tags, categories, kanban cards, etc.
// Use these instead of hardcoding hex values throughout the app.

const labelColors = {
  // Reds
  labelRed: '#ef4444',
  labelRose: '#f43f5e',
  labelPink: '#ec4899',
  // Oranges
  labelOrange: '#f97316',
  labelAmber: '#f59e0b',
  // Yellows
  labelYellow: '#eab308',
  labelLime: '#84cc16',
  // Greens
  labelGreen: '#22c55e',
  labelEmerald: '#10b981',
  labelTeal: '#14b8a6',
  // Blues
  labelCyan: '#06b6d4',
  labelSky: '#0ea5e9',
  labelBlue: '#3b82f6',
  // Purples
  labelIndigo: '#6366f1',
  labelViolet: '#8b5cf6',
  labelPurple: '#a855f7',
  labelFuchsia: '#d946ef',
  // Neutrals
  labelSlate: '#64748b',
};

// Light theme semantic tokens
const lightSemanticColors = {
  // ---------------------------------------------------------------------------
  // PRIMARY/ACCENT with FOREGROUND PAIRS (Tier 1)
  // ---------------------------------------------------------------------------
  accent: Colors.blue.blue9,
  accentForeground: '#ffffff', // Text on accent background
  accentLight: Colors.blue.blue3,
  accentLightForeground: Colors.blue.blue11, // Text on accentLight background
  accentLighter: Colors.blue.blue1,
  accentDark: Colors.blue.blue10,
  accentDarker: Colors.blue.blue11,
  accentBorder: Colors.blue.blue6,
  accentBorderHover: Colors.blue.blue8,

  // Secondary (muted actions, less prominent)
  secondary: 'hsl(0, 0%, 96%)',
  secondaryForeground: 'hsl(0, 0%, 9%)',
  secondaryHover: 'hsl(0, 0%, 91%)',

  // Muted (subtle backgrounds, disabled states)
  muted: 'hsl(0, 0%, 94%)',
  mutedForeground: 'hsl(0, 0%, 45.1%)',

  // ---------------------------------------------------------------------------
  // STATUS COLORS with FOREGROUND PAIRS
  // ---------------------------------------------------------------------------
  success: Colors.green.green10,
  successForeground: '#ffffff',
  successLight: Colors.green.green1,
  successLightForeground: Colors.green.green11,
  successLighter: Colors.green.green2,
  successDark: Colors.green.green11,
  successBorder: Colors.green.green6,

  error: Colors.red.red10,
  errorForeground: '#ffffff',
  errorLight: Colors.red.red1,
  errorLightForeground: Colors.red.red11,
  errorLighter: Colors.red.red2,
  errorDark: Colors.red.red11,
  errorBorder: Colors.red.red6,
  errorBorderStrong: Colors.red.red8,

  warning: Colors.yellow.yellow10,
  warningForeground: '#000000', // Dark text on yellow
  warningLight: Colors.yellow.yellow2,
  warningLightForeground: Colors.yellow.yellow11,
  warningLighter: Colors.yellow.yellow1,
  warningDark: Colors.yellow.yellow11,
  warningBorder: Colors.yellow.yellow6,

  info: Colors.blue.blue10,
  infoForeground: '#ffffff',
  infoLight: Colors.blue.blue1,
  infoLightForeground: Colors.blue.blue11,
  infoDark: Colors.blue.blue11,
  infoBorder: Colors.blue.blue6,

  // ---------------------------------------------------------------------------
  // FOCUS RING TOKENS (Tier 1 - Accessibility)
  // ---------------------------------------------------------------------------
  ring: Colors.blue.blue7, // Default focus ring color
  ringOffset: '#ffffff', // Ring offset background (usually page bg)
  ringWidth: '2px',
  ringOffsetWidth: '2px',

  // ---------------------------------------------------------------------------
  // ELEVATION/SURFACE LEVELS (Tier 1)
  // ---------------------------------------------------------------------------
  // Level 0: Base page background
  surface: '#ffffff',
  surfaceForeground: 'hsl(0, 0%, 9%)',

  // Level 1: Cards, raised elements
  surfaceRaised: '#ffffff',
  surfaceRaisedForeground: 'hsl(0, 0%, 9%)',

  // Level 2: Popovers, dropdowns
  popover: '#ffffff',
  popoverForeground: 'hsl(0, 0%, 9%)',

  // Level 3: Modals, dialogs
  dialog: '#ffffff',
  dialogForeground: 'hsl(0, 0%, 9%)',

  // Elevation shadows (coordinated with surface levels)
  elevation0: 'none',
  elevation1: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  elevation2: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  elevation3: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  elevation4: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  elevation5: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

  // ---------------------------------------------------------------------------
  // INPUT STATE TOKENS (Tier 2)
  // ---------------------------------------------------------------------------
  input: '#ffffff', // Input background
  inputForeground: 'hsl(0, 0%, 9%)',
  inputPlaceholder: 'hsl(0, 0%, 45.1%)',
  inputBorder: 'hsl(0, 0%, 90.0%)',
  inputBorderHover: 'hsl(0, 0%, 81.0%)',
  inputBorderFocus: Colors.blue.blue7,
  inputBorderError: Colors.red.red6,
  inputBorderSuccess: Colors.green.green6,
  inputDisabled: 'hsl(0, 0%, 96.1%)',
  inputDisabledForeground: 'hsl(0, 0%, 45.1%)',

  // ---------------------------------------------------------------------------
  // NAVIGATION/SIDEBAR TOKENS (Tier 2)
  // ---------------------------------------------------------------------------
  sidebar: 'hsl(0, 0%, 98%)', // Sidebar background
  sidebarForeground: 'hsl(0, 0%, 9%)',
  sidebarBorder: 'hsl(0, 0%, 90.0%)',
  sidebarMuted: 'hsl(0, 0%, 45.1%)',
  sidebarHover: 'hsl(0, 0%, 96.1%)',
  sidebarActive: Colors.blue.blue3,
  sidebarActiveForeground: Colors.blue.blue11,

  nav: '#ffffff',
  navForeground: 'hsl(0, 0%, 9%)',
  navBorder: 'hsl(0, 0%, 90.0%)',
  navHover: 'hsl(0, 0%, 96.1%)',
  navActive: Colors.blue.blue3,
  navActiveForeground: Colors.blue.blue11,

  // ---------------------------------------------------------------------------
  // LABEL/CATEGORY COLORS
  // ---------------------------------------------------------------------------
  ...labelColors,

  // ---------------------------------------------------------------------------
  // CHART COLORS
  // ---------------------------------------------------------------------------
  ...chartColorsLight,

  // ---------------------------------------------------------------------------
  // MOTION TOKENS
  // ---------------------------------------------------------------------------
  ...motionTokens,

  // ---------------------------------------------------------------------------
  // UTILITY TOKENS
  // ---------------------------------------------------------------------------
  textInverse: '#ffffff',
  skeleton: 'hsl(0, 0%, 90.0%)',
  skeletonLight: 'hsl(0, 0%, 94.1%)',
  overlay: 'rgba(0,0,0,0.5)',
  overlayLight: 'rgba(0,0,0,0.3)',
  transparent: 'transparent',

  // Border colors (semantic)
  borderDefault: 'hsl(0, 0%, 90.0%)',
  borderMuted: 'hsl(0, 0%, 92.0%)',
  borderStrong: 'hsl(0, 0%, 81.0%)',
  borderFocus: Colors.blue.blue7,
};

// Dark theme semantic tokens
const darkSemanticColors = {
  // ---------------------------------------------------------------------------
  // PRIMARY/ACCENT with FOREGROUND PAIRS (Tier 1)
  // ---------------------------------------------------------------------------
  accent: Colors.blueDark.blue9,
  accentForeground: '#ffffff',
  accentLight: Colors.blueDark.blue3,
  accentLightForeground: Colors.blueDark.blue11,
  accentLighter: Colors.blueDark.blue1,
  accentDark: Colors.blueDark.blue10,
  accentDarker: Colors.blueDark.blue11,
  accentBorder: Colors.blueDark.blue6,
  accentBorderHover: Colors.blueDark.blue8,

  // Secondary (muted actions, less prominent)
  secondary: 'hsl(0, 0%, 16%)',
  secondaryForeground: 'hsl(0, 0%, 98%)',
  secondaryHover: 'hsl(0, 0%, 22%)',

  // Muted (subtle backgrounds, disabled states)
  muted: 'hsl(0, 0%, 20%)',
  mutedForeground: 'hsl(0, 0%, 63.9%)',

  // ---------------------------------------------------------------------------
  // STATUS COLORS with FOREGROUND PAIRS
  // ---------------------------------------------------------------------------
  success: Colors.greenDark.green10,
  successForeground: '#ffffff',
  successLight: Colors.greenDark.green1,
  successLightForeground: Colors.greenDark.green11,
  successLighter: Colors.greenDark.green2,
  successDark: Colors.greenDark.green11,
  successBorder: Colors.greenDark.green6,

  error: Colors.redDark.red10,
  errorForeground: '#ffffff',
  errorLight: Colors.redDark.red1,
  errorLightForeground: Colors.redDark.red11,
  errorLighter: Colors.redDark.red2,
  errorDark: Colors.redDark.red11,
  errorBorder: Colors.redDark.red6,
  errorBorderStrong: Colors.redDark.red8,

  warning: Colors.yellowDark.yellow10,
  warningForeground: '#000000',
  warningLight: Colors.yellowDark.yellow2,
  warningLightForeground: Colors.yellowDark.yellow11,
  warningLighter: Colors.yellowDark.yellow1,
  warningDark: Colors.yellowDark.yellow11,
  warningBorder: Colors.yellowDark.yellow6,

  info: Colors.blueDark.blue10,
  infoForeground: '#ffffff',
  infoLight: Colors.blueDark.blue1,
  infoLightForeground: Colors.blueDark.blue11,
  infoDark: Colors.blueDark.blue11,
  infoBorder: Colors.blueDark.blue6,

  // ---------------------------------------------------------------------------
  // FOCUS RING TOKENS (Tier 1 - Accessibility)
  // ---------------------------------------------------------------------------
  ring: Colors.blueDark.blue7,
  ringOffset: '#050505', // Dark background
  ringWidth: '2px',
  ringOffsetWidth: '2px',

  // ---------------------------------------------------------------------------
  // ELEVATION/SURFACE LEVELS (Tier 1)
  // ---------------------------------------------------------------------------
  surface: '#050505',
  surfaceForeground: '#ffffff',

  surfaceRaised: '#151515',
  surfaceRaisedForeground: '#ffffff',

  popover: '#191919',
  popoverForeground: '#ffffff',

  dialog: '#232323',
  dialogForeground: '#ffffff',

  // Elevation shadows (darker for dark mode)
  elevation0: 'none',
  elevation1: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  elevation2: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
  elevation3: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
  elevation4: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
  elevation5: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',

  // ---------------------------------------------------------------------------
  // INPUT STATE TOKENS (Tier 2)
  // ---------------------------------------------------------------------------
  input: '#151515',
  inputForeground: '#ffffff',
  inputPlaceholder: 'hsl(0, 0%, 63.9%)',
  inputBorder: 'hsl(0, 0%, 25%)',
  inputBorderHover: 'hsl(0, 0%, 35%)',
  inputBorderFocus: Colors.blueDark.blue7,
  inputBorderError: Colors.redDark.red6,
  inputBorderSuccess: Colors.greenDark.green6,
  inputDisabled: 'hsl(0, 0%, 14.9%)',
  inputDisabledForeground: 'hsl(0, 0%, 45%)',

  // ---------------------------------------------------------------------------
  // NAVIGATION/SIDEBAR TOKENS (Tier 2)
  // ---------------------------------------------------------------------------
  sidebar: '#0a0a0a',
  sidebarForeground: '#ffffff',
  sidebarBorder: 'hsl(0, 0%, 20%)',
  sidebarMuted: 'hsl(0, 0%, 63.9%)',
  sidebarHover: 'hsl(0, 0%, 14.9%)',
  sidebarActive: Colors.blueDark.blue3,
  sidebarActiveForeground: Colors.blueDark.blue11,

  nav: '#050505',
  navForeground: '#ffffff',
  navBorder: 'hsl(0, 0%, 20%)',
  navHover: 'hsl(0, 0%, 14.9%)',
  navActive: Colors.blueDark.blue3,
  navActiveForeground: Colors.blueDark.blue11,

  // ---------------------------------------------------------------------------
  // LABEL/CATEGORY COLORS
  // ---------------------------------------------------------------------------
  ...labelColors,

  // ---------------------------------------------------------------------------
  // CHART COLORS
  // ---------------------------------------------------------------------------
  ...chartColorsDark,

  // ---------------------------------------------------------------------------
  // MOTION TOKENS
  // ---------------------------------------------------------------------------
  ...motionTokens,

  // ---------------------------------------------------------------------------
  // UTILITY TOKENS
  // ---------------------------------------------------------------------------
  textInverse: '#000000',
  skeleton: 'hsl(0, 0%, 20%)',
  skeletonLight: 'hsl(0, 0%, 15%)',
  overlay: 'rgba(0,0,0,0.7)',
  overlayLight: 'rgba(0,0,0,0.5)',
  transparent: 'transparent',

  // Border colors (semantic)
  borderDefault: 'hsl(0, 0%, 25%)',
  borderMuted: 'hsl(0, 0%, 20%)',
  borderStrong: 'hsl(0, 0%, 35%)',
  borderFocus: Colors.blueDark.blue7,
};

const darkPalette = [
  '#050505',
  '#151515',
  '#191919',
  '#232323',
  '#282828',
  '#323232',
  '#424242',
  '#494949',
  '#545454',
  '#626262',
  '#a5a5a5',
  '#fff',
];

const lightPalette = [
  '#fff',
  '#f8f8f8',
  'hsl(0, 0%, 96.3%)',
  'hsl(0, 0%, 94.1%)',
  'hsl(0, 0%, 92.0%)',
  'hsl(0, 0%, 90.0%)',
  'hsl(0, 0%, 88.5%)',
  'hsl(0, 0%, 81.0%)',
  'hsl(0, 0%, 56.1%)',
  'hsl(0, 0%, 50.3%)',
  'hsl(0, 0%, 42.5%)',
  'hsl(0, 0%, 9.0%)',
];

const lightShadows = {
  shadow1: 'rgba(0,0,0,0.04)',
  shadow2: 'rgba(0,0,0,0.08)',
  shadow3: 'rgba(0,0,0,0.16)',
  shadow4: 'rgba(0,0,0,0.24)',
  shadow5: 'rgba(0,0,0,0.32)',
  shadow6: 'rgba(0,0,0,0.4)',
};

const darkShadows = {
  shadow1: 'rgba(0,0,0,0.2)',
  shadow2: 'rgba(0,0,0,0.3)',
  shadow3: 'rgba(0,0,0,0.4)',
  shadow4: 'rgba(0,0,0,0.5)',
  shadow5: 'rgba(0,0,0,0.6)',
  shadow6: 'rgba(0,0,0,0.7)',
};

const extraColors = {
  black1: darkPalette[0],
  black2: darkPalette[1],
  black3: darkPalette[2],
  black4: darkPalette[3],
  black5: darkPalette[4],
  black6: darkPalette[5],
  black7: darkPalette[6],
  black8: darkPalette[7],
  black9: darkPalette[8],
  black10: darkPalette[9],
  black11: darkPalette[10],
  black12: darkPalette[11],
  white1: lightPalette[0],
  white2: lightPalette[1],
  white3: lightPalette[2],
  white4: lightPalette[3],
  white5: lightPalette[4],
  white6: lightPalette[5],
  white7: lightPalette[6],
  white8: lightPalette[7],
  white9: lightPalette[8],
  white10: lightPalette[9],
  white11: lightPalette[10],
  white12: lightPalette[11],
};

// =============================================================================
// AURORA THEME (purple accent, dark-first)
// =============================================================================

const auroraDarkPalette = [
  '#0a0a0b', // color1 - deep dark background
  '#111113', // color2
  '#18181b', // color3
  '#222225', // color4
  '#2c2c30', // color5
  '#37373d', // color6
  '#47474f', // color7
  '#5f5f6b', // color8
  '#78788a', // color9 - secondary text
  '#9898a8', // color10
  '#b8b8c5', // color11
  '#fafafa', // color12 - primary text
];

const auroraLightPalette = [
  '#f5f0ff', // color1 - noticeably purple-tinted background
  '#ede5fc', // color2 - light purple wash
  '#e4dafc', // color3
  '#d9ccf9', // color4
  '#ccbdf5', // color5
  '#bfaef0', // color6
  '#a394d6', // color7
  '#8778b8', // color8
  '#6b5c9a', // color9
  '#50447c', // color10
  '#352d5e', // color11
  '#1a1540', // color12 - deep purple text
];

const auroraSemanticColorsLight = {
  // Purple accent (aurora brand color)
  accent: '#8b5cf6',
  accentForeground: '#ffffff',
  accentLight: '#c4b5fd',
  accentLightForeground: '#6d28d9',
  accentLighter: '#ede9fe',
  accentDark: '#7c3aed',
  accentDarker: '#6d28d9',
  accentBorder: '#a78bfa',
  accentBorderHover: '#8b5cf6',

  // Secondary/Muted
  secondary: '#ede9fe',
  secondaryForeground: '#6d28d9',
  secondaryHover: '#ddd6fe',
  muted: '#f5f0ff',
  mutedForeground: '#8778b8',

  // Gradient colors for special effects
  accentGradientStart: '#8b5cf6',
  accentGradientEnd: '#a855f7',

  // Status colors with foregrounds
  success: Colors.green.green10,
  successForeground: '#ffffff',
  successLight: Colors.green.green1,
  successLightForeground: Colors.green.green11,
  successBorder: Colors.green.green6,
  error: Colors.red.red10,
  errorForeground: '#ffffff',
  errorLight: Colors.red.red1,
  errorLightForeground: Colors.red.red11,
  errorBorder: Colors.red.red6,
  warning: Colors.yellow.yellow10,
  warningForeground: '#000000',
  warningLight: Colors.yellow.yellow1,
  warningLightForeground: Colors.yellow.yellow11,
  warningBorder: Colors.yellow.yellow6,
  info: '#8b5cf6',
  infoForeground: '#ffffff',
  infoLight: '#ede9fe',
  infoLightForeground: '#6d28d9',
  infoBorder: '#a78bfa',

  // Focus ring
  ring: '#8b5cf6',
  ringOffset: '#f5f0ff',
  ringWidth: '2px',
  ringOffsetWidth: '2px',

  // Elevation/Surface
  surface: '#f5f0ff',
  surfaceForeground: '#1a1540',
  surfaceRaised: '#ffffff',
  surfaceRaisedForeground: '#1a1540',
  popover: '#ffffff',
  popoverForeground: '#1a1540',
  dialog: '#ffffff',
  dialogForeground: '#1a1540',
  elevation0: 'none',
  elevation1: '0 2px 8px rgba(139, 92, 246, 0.08), 0 1px 3px rgba(0,0,0,0.08)',
  elevation2: '0 4px 12px rgba(139, 92, 246, 0.12), 0 2px 4px rgba(0,0,0,0.08)',
  elevation3: '0 8px 24px rgba(139, 92, 246, 0.15), 0 4px 8px rgba(0,0,0,0.1)',
  elevation4: '0 16px 32px rgba(139, 92, 246, 0.2), 0 8px 16px rgba(0,0,0,0.1)',
  elevation5: '0 24px 48px rgba(139, 92, 246, 0.25)',

  // Input states
  input: '#ffffff',
  inputForeground: '#1a1540',
  inputPlaceholder: '#8778b8',
  inputBorder: '#ccbdf5',
  inputBorderHover: '#a78bfa',
  inputBorderFocus: '#8b5cf6',
  inputBorderError: Colors.red.red6,
  inputBorderSuccess: Colors.green.green6,
  inputDisabled: '#ede9fe',
  inputDisabledForeground: '#a394d6',

  // Sidebar/Navigation
  sidebar: '#ede9fe',
  sidebarForeground: '#1a1540',
  sidebarBorder: '#ccbdf5',
  sidebarMuted: '#8778b8',
  sidebarHover: '#e4dafc',
  sidebarActive: '#c4b5fd',
  sidebarActiveForeground: '#6d28d9',
  nav: '#f5f0ff',
  navForeground: '#1a1540',
  navBorder: '#ccbdf5',
  navHover: '#ede9fe',
  navActive: '#c4b5fd',
  navActiveForeground: '#6d28d9',

  // Labels & Charts
  ...labelColors,
  ...chartColorsLight,
  ...motionTokens,

  // Utility
  textInverse: '#ffffff',
  skeleton: '#d9ccf9',
  skeletonLight: '#ede9fe',
  overlay: 'rgba(26, 21, 64, 0.5)',
  overlayLight: 'rgba(26, 21, 64, 0.3)',
  transparent: 'transparent',
  borderDefault: '#ccbdf5',
  borderMuted: '#d9ccf9',
  borderStrong: '#a394d6',
  borderFocus: '#8b5cf6',

  // Aurora-specific style tokens
  ...auroraStyleTokens,
};

const auroraSemanticColorsDark = {
  // Purple accent
  accent: '#8b5cf6',
  accentForeground: '#ffffff',
  accentLight: '#2e1065',
  accentLightForeground: '#c084fc',
  accentLighter: '#1e0a4a',
  accentDark: '#a855f7',
  accentDarker: '#c084fc',
  accentBorder: '#6d28d9',
  accentBorderHover: '#8b5cf6',

  secondary: '#27272a',
  secondaryForeground: '#fafafa',
  secondaryHover: '#3f3f46',
  muted: '#18181b',
  mutedForeground: '#78788a',

  accentGradientStart: '#8b5cf6',
  accentGradientEnd: '#a855f7',

  // Status colors with foregrounds
  success: Colors.greenDark.green10,
  successForeground: '#ffffff',
  successLight: Colors.greenDark.green1,
  successLightForeground: Colors.greenDark.green11,
  successBorder: Colors.greenDark.green6,
  error: Colors.redDark.red10,
  errorForeground: '#ffffff',
  errorLight: Colors.redDark.red1,
  errorLightForeground: Colors.redDark.red11,
  errorBorder: Colors.redDark.red6,
  warning: Colors.yellowDark.yellow10,
  warningForeground: '#000000',
  warningLight: Colors.yellowDark.yellow1,
  warningLightForeground: Colors.yellowDark.yellow11,
  warningBorder: Colors.yellowDark.yellow6,
  info: '#8b5cf6',
  infoForeground: '#ffffff',
  infoLight: '#2e1065',
  infoLightForeground: '#c084fc',
  infoBorder: '#6d28d9',

  // Focus ring
  ring: '#8b5cf6',
  ringOffset: '#0a0a0b',
  ringWidth: '2px',
  ringOffsetWidth: '2px',

  // Elevation/Surface
  surface: '#0a0a0b',
  surfaceForeground: '#fafafa',
  surfaceRaised: '#111113',
  surfaceRaisedForeground: '#fafafa',
  popover: '#18181b',
  popoverForeground: '#fafafa',
  dialog: '#222225',
  dialogForeground: '#fafafa',
  elevation0: 'none',
  elevation1: '0 2px 8px rgba(0, 0, 0, 0.4), 0 0 20px rgba(139, 92, 246, 0.05)',
  elevation2: '0 4px 12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(139, 92, 246, 0.08)',
  elevation3: '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 40px rgba(139, 92, 246, 0.1)',
  elevation4: '0 16px 32px rgba(0, 0, 0, 0.7), 0 0 50px rgba(139, 92, 246, 0.12)',
  elevation5: '0 25px 50px rgba(0, 0, 0, 0.8), 0 0 60px rgba(139, 92, 246, 0.15)',

  // Input states
  input: '#111113',
  inputForeground: '#fafafa',
  inputPlaceholder: '#78788a',
  inputBorder: '#27272a',
  inputBorderHover: '#37373d',
  inputBorderFocus: '#8b5cf6',
  inputBorderError: Colors.redDark.red6,
  inputBorderSuccess: Colors.greenDark.green6,
  inputDisabled: '#18181b',
  inputDisabledForeground: '#47474f',

  // Sidebar/Navigation
  sidebar: '#0a0a0b',
  sidebarForeground: '#fafafa',
  sidebarBorder: '#27272a',
  sidebarMuted: '#78788a',
  sidebarHover: '#18181b',
  sidebarActive: '#2e1065',
  sidebarActiveForeground: '#c084fc',
  nav: '#0a0a0b',
  navForeground: '#fafafa',
  navBorder: '#27272a',
  navHover: '#18181b',
  navActive: '#2e1065',
  navActiveForeground: '#c084fc',

  // Labels & Charts
  ...labelColors,
  ...chartColorsDark,
  ...motionTokens,

  textInverse: '#0a0a0b',
  skeleton: '#222225',
  skeletonLight: '#18181b',
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  transparent: 'transparent',
  borderDefault: '#27272a',
  borderMuted: '#222225',
  borderStrong: '#37373d',
  borderFocus: '#8b5cf6',

  ...auroraStyleTokens,
};

// =============================================================================
// STEEL THEME (silver/metallic, steel-blue accent, fintech)
// =============================================================================

const steelDarkPalette = [
  '#0b0d0f', // color1 - graphite background
  '#121417', // color2
  '#191c20', // color3
  '#23272c', // color4
  '#2d3138', // color5
  '#383d45', // color6
  '#474d57', // color7
  '#5d646f', // color8
  '#79808b', // color9 - secondary text
  '#9aa1ac', // color10
  '#c2c8d0', // color11
  '#f5f7fa', // color12 - primary text (cool white)
];

const steelLightPalette = [
  '#f6f7f9', // color1 - silver background
  '#eef0f3', // color2
  '#e5e8ec', // color3
  '#d8dde2', // color4
  '#c8ced6', // color5
  '#b6bdc7', // color6
  '#98a1ad', // color7
  '#7b8593', // color8
  '#5e6877', // color9
  '#454e5c', // color10
  '#2c3440', // color11
  '#141a22', // color12 - graphite text
];

const steelStyleTokens = {
  // Neutral, low-tint shadows for a clean metallic feel
  shadowCard: '0 2px 8px rgba(20, 26, 34, 0.08), 0 1px 3px rgba(0,0,0,0.12)',
  shadowCardHover: '0 12px 28px rgba(20, 26, 34, 0.16), 0 6px 12px rgba(0,0,0,0.1)',
  shadowModal: '0 25px 50px rgba(0,0,0,0.5)',
  shadowButton: '0 2px 4px rgba(74, 115, 168, 0.2)',
  shadowGlow: '0 0 40px rgba(74, 115, 168, 0.25)',
  shadowInput: '0 1px 3px rgba(20, 26, 34, 0.06)',
  shadowInputHover: '0 2px 6px rgba(20, 26, 34, 0.1)',
  shadowInputFocus: '0 0 0 3px rgba(74, 115, 168, 0.2)',
  hoverLift: '-3px',
  pressLift: '0px',
  radiusStyle: 'default',
  ...defaultRadiusTokens,
};

const steelSemanticColorsLight = {
  accent: '#4a73a8',
  accentForeground: '#ffffff',
  accentLight: '#a9c0dc',
  accentLightForeground: '#2f4d70',
  accentLighter: '#e6edf5',
  accentDark: '#3a5d8a',
  accentDarker: '#2f4d70',
  accentBorder: '#7ea0c6',
  accentBorderHover: '#4a73a8',

  secondary: '#e5e8ec',
  secondaryForeground: '#2c3440',
  secondaryHover: '#d8dde2',
  muted: '#eef0f3',
  mutedForeground: '#7b8593',

  accentGradientStart: '#4a73a8',
  accentGradientEnd: '#6b8fc0',

  success: Colors.green.green10,
  successForeground: '#ffffff',
  successLight: Colors.green.green1,
  successLightForeground: Colors.green.green11,
  successBorder: Colors.green.green6,
  error: Colors.red.red10,
  errorForeground: '#ffffff',
  errorLight: Colors.red.red1,
  errorLightForeground: Colors.red.red11,
  errorBorder: Colors.red.red6,
  warning: Colors.yellow.yellow10,
  warningForeground: '#000000',
  warningLight: Colors.yellow.yellow1,
  warningLightForeground: Colors.yellow.yellow11,
  warningBorder: Colors.yellow.yellow6,
  info: '#4a73a8',
  infoForeground: '#ffffff',
  infoLight: '#e6edf5',
  infoLightForeground: '#2f4d70',
  infoBorder: '#7ea0c6',

  ring: '#4a73a8',
  ringOffset: '#f6f7f9',
  ringWidth: '2px',
  ringOffsetWidth: '2px',

  surface: '#f6f7f9',
  surfaceForeground: '#141a22',
  surfaceRaised: '#ffffff',
  surfaceRaisedForeground: '#141a22',
  popover: '#ffffff',
  popoverForeground: '#141a22',
  dialog: '#ffffff',
  dialogForeground: '#141a22',
  codeBackground: '#eef0f3',
  elevation0: 'none',
  elevation1: '0 2px 8px rgba(20, 26, 34, 0.06), 0 1px 3px rgba(0,0,0,0.08)',
  elevation2: '0 4px 12px rgba(20, 26, 34, 0.1), 0 2px 4px rgba(0,0,0,0.08)',
  elevation3: '0 8px 24px rgba(20, 26, 34, 0.12), 0 4px 8px rgba(0,0,0,0.1)',
  elevation4: '0 16px 32px rgba(20, 26, 34, 0.16), 0 8px 16px rgba(0,0,0,0.1)',
  elevation5: '0 24px 48px rgba(20, 26, 34, 0.2)',

  input: '#ffffff',
  inputForeground: '#141a22',
  inputPlaceholder: '#7b8593',
  inputBorder: '#c8ced6',
  inputBorderHover: '#7ea0c6',
  inputBorderFocus: '#4a73a8',
  inputBorderError: Colors.red.red6,
  inputBorderSuccess: Colors.green.green6,
  inputDisabled: '#eef0f3',
  inputDisabledForeground: '#98a1ad',

  sidebar: '#eef0f3',
  sidebarForeground: '#141a22',
  sidebarBorder: '#d8dde2',
  sidebarMuted: '#7b8593',
  sidebarHover: '#e5e8ec',
  sidebarActive: '#a9c0dc',
  sidebarActiveForeground: '#2f4d70',
  nav: '#f6f7f9',
  navForeground: '#141a22',
  navBorder: '#d8dde2',
  navHover: '#eef0f3',
  navActive: '#a9c0dc',
  navActiveForeground: '#2f4d70',

  ...labelColors,
  ...chartColorsLight,
  ...motionTokens,

  textInverse: '#ffffff',
  skeleton: '#d8dde2',
  skeletonLight: '#e5e8ec',
  overlay: 'rgba(20, 26, 34, 0.5)',
  overlayLight: 'rgba(20, 26, 34, 0.3)',
  transparent: 'transparent',
  borderDefault: '#c8ced6',
  borderMuted: '#d8dde2',
  borderStrong: '#98a1ad',
  borderFocus: '#4a73a8',

  ...steelStyleTokens,
};

const steelSemanticColorsDark = {
  accent: '#5b86bd',
  accentForeground: '#ffffff',
  accentLight: '#16263a',
  accentLightForeground: '#9bbce0',
  accentLighter: '#0f1c2c',
  accentDark: '#4a73a8',
  accentDarker: '#9bbce0',
  accentBorder: '#3a5d8a',
  accentBorderHover: '#5b86bd',

  secondary: '#23272c',
  secondaryForeground: '#f5f7fa',
  secondaryHover: '#2d3138',
  muted: '#191c20',
  mutedForeground: '#79808b',

  accentGradientStart: '#5b86bd',
  accentGradientEnd: '#7ea0c6',

  success: Colors.greenDark.green10,
  successForeground: '#ffffff',
  successLight: Colors.greenDark.green1,
  successLightForeground: Colors.greenDark.green11,
  successBorder: Colors.greenDark.green6,
  error: Colors.redDark.red10,
  errorForeground: '#ffffff',
  errorLight: Colors.redDark.red1,
  errorLightForeground: Colors.redDark.red11,
  errorBorder: Colors.redDark.red6,
  warning: Colors.yellowDark.yellow10,
  warningForeground: '#000000',
  warningLight: Colors.yellowDark.yellow1,
  warningLightForeground: Colors.yellowDark.yellow11,
  warningBorder: Colors.yellowDark.yellow6,
  info: '#5b86bd',
  infoForeground: '#ffffff',
  infoLight: '#16263a',
  infoLightForeground: '#9bbce0',
  infoBorder: '#3a5d8a',

  ring: '#5b86bd',
  ringOffset: '#0b0d0f',
  ringWidth: '2px',
  ringOffsetWidth: '2px',

  surface: '#0b0d0f',
  surfaceForeground: '#f5f7fa',
  surfaceRaised: '#121417',
  surfaceRaisedForeground: '#f5f7fa',
  popover: '#191c20',
  popoverForeground: '#f5f7fa',
  dialog: '#23272c',
  dialogForeground: '#f5f7fa',
  codeBackground: '#121417',
  elevation0: 'none',
  elevation1: '0 2px 8px rgba(0, 0, 0, 0.4)',
  elevation2: '0 4px 12px rgba(0, 0, 0, 0.5)',
  elevation3: '0 8px 24px rgba(0, 0, 0, 0.6)',
  elevation4: '0 16px 32px rgba(0, 0, 0, 0.7)',
  elevation5: '0 25px 50px rgba(0, 0, 0, 0.8)',

  input: '#121417',
  inputForeground: '#f5f7fa',
  inputPlaceholder: '#79808b',
  inputBorder: '#2d3138',
  inputBorderHover: '#383d45',
  inputBorderFocus: '#5b86bd',
  inputBorderError: Colors.redDark.red6,
  inputBorderSuccess: Colors.greenDark.green6,
  inputDisabled: '#191c20',
  inputDisabledForeground: '#474d57',

  sidebar: '#0b0d0f',
  sidebarForeground: '#f5f7fa',
  sidebarBorder: '#23272c',
  sidebarMuted: '#79808b',
  sidebarHover: '#191c20',
  sidebarActive: '#16263a',
  sidebarActiveForeground: '#9bbce0',
  nav: '#0b0d0f',
  navForeground: '#f5f7fa',
  navBorder: '#23272c',
  navHover: '#191c20',
  navActive: '#16263a',
  navActiveForeground: '#9bbce0',

  ...labelColors,
  ...chartColorsDark,
  ...motionTokens,

  textInverse: '#0b0d0f',
  skeleton: '#23272c',
  skeletonLight: '#191c20',
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  transparent: 'transparent',
  borderDefault: '#23272c',
  borderMuted: '#191c20',
  borderStrong: '#383d45',
  borderFocus: '#5b86bd',

  ...steelStyleTokens,
};

// =============================================================================
// RETRO THEME (warm colors, hard shadows, sharp corners)
// =============================================================================

const retroDarkPalette = [
  '#1a1814', // color1 - warm dark brown
  '#252118', // color2
  '#302a1f', // color3
  '#3d3526', // color4
  '#4a402d', // color5
  '#5c5038', // color6
  '#736344', // color7
  '#8a7a55', // color8
  '#a69470', // color9
  '#c2af8b', // color10
  '#decaa6', // color11
  '#faf4e6', // color12 - cream text
];

const retroLightPalette = [
  '#faf4e6', // color1 - cream background
  '#f5ecd8', // color2
  '#ebe0c4', // color3
  '#ddd2b0', // color4
  '#cfc49c', // color5
  '#c2b088', // color6
  '#a69470', // color7
  '#8a7a55', // color8
  '#6e6040', // color9
  '#52462d', // color10
  '#362c1a', // color11
  '#1a1814', // color12 - dark brown text
];

const retroSemanticColorsLight = {
  // Orange/amber accent for retro feel
  accent: '#d97706',
  accentForeground: '#ffffff',
  accentLight: '#fef3c7',
  accentLightForeground: '#92400e',
  accentLighter: '#fffbeb',
  accentDark: '#b45309',
  accentDarker: '#92400e',
  accentBorder: '#f59e0b',
  accentBorderHover: '#d97706',

  secondary: '#ebe0c4',
  secondaryForeground: '#362c1a',
  secondaryHover: '#ddd2b0',
  muted: '#f5ecd8',
  mutedForeground: '#6e6040',

  // Retro-styled feedback colors with foregrounds
  success: '#15803d',
  successForeground: '#ffffff',
  successLight: '#dcfce7',
  successLightForeground: '#15803d',
  successBorder: '#22c55e',
  error: '#b91c1c',
  errorForeground: '#ffffff',
  errorLight: '#fee2e2',
  errorLightForeground: '#b91c1c',
  errorBorder: '#ef4444',
  warning: '#a16207',
  warningForeground: '#ffffff',
  warningLight: '#fef9c3',
  warningLightForeground: '#a16207',
  warningBorder: '#eab308',
  info: '#d97706',
  infoForeground: '#ffffff',
  infoLight: '#fef3c7',
  infoLightForeground: '#92400e',
  infoBorder: '#f59e0b',

  // Focus ring
  ring: '#d97706',
  ringOffset: '#faf4e6',
  ringWidth: '2px',
  ringOffsetWidth: '2px',

  // Elevation/Surface (retro uses hard shadows)
  surface: '#faf4e6',
  surfaceForeground: '#1a1814',
  surfaceRaised: '#ffffff',
  surfaceRaisedForeground: '#1a1814',
  popover: '#ffffff',
  popoverForeground: '#1a1814',
  dialog: '#ffffff',
  dialogForeground: '#1a1814',
  elevation0: 'none',
  elevation1: '2px 2px 0px rgba(0,0,0,0.15)',
  elevation2: '4px 4px 0px rgba(0,0,0,0.2)',
  elevation3: '6px 6px 0px rgba(0,0,0,0.25)',
  elevation4: '8px 8px 0px rgba(0,0,0,0.3)',
  elevation5: '10px 10px 0px rgba(0,0,0,0.35)',

  // Input states
  input: '#ffffff',
  inputForeground: '#1a1814',
  inputPlaceholder: '#8a7a55',
  inputBorder: '#cfc49c',
  inputBorderHover: '#a69470',
  inputBorderFocus: '#d97706',
  inputBorderError: '#ef4444',
  inputBorderSuccess: '#22c55e',
  inputDisabled: '#f5ecd8',
  inputDisabledForeground: '#a69470',

  // Sidebar/Navigation
  sidebar: '#f5ecd8',
  sidebarForeground: '#1a1814',
  sidebarBorder: '#cfc49c',
  sidebarMuted: '#8a7a55',
  sidebarHover: '#ebe0c4',
  sidebarActive: '#fef3c7',
  sidebarActiveForeground: '#92400e',
  nav: '#faf4e6',
  navForeground: '#1a1814',
  navBorder: '#cfc49c',
  navHover: '#f5ecd8',
  navActive: '#fef3c7',
  navActiveForeground: '#92400e',

  // Labels & Charts
  ...labelColors,
  ...chartColorsLight,
  ...motionTokens,

  textInverse: '#faf4e6',
  skeleton: '#ddd2b0',
  skeletonLight: '#ebe0c4',
  overlay: 'rgba(26, 24, 20, 0.6)',
  overlayLight: 'rgba(26, 24, 20, 0.3)',
  transparent: 'transparent',
  borderDefault: '#cfc49c',
  borderMuted: '#ddd2b0',
  borderStrong: '#a69470',
  borderFocus: '#d97706',

  ...retroStyleTokens,
};

const retroSemanticColorsDark = {
  accent: '#f59e0b',
  accentForeground: '#1a1814',
  accentLight: '#451a03',
  accentLightForeground: '#fcd34d',
  accentLighter: '#2a1000',
  accentDark: '#fbbf24',
  accentDarker: '#fcd34d',
  accentBorder: '#b45309',
  accentBorderHover: '#f59e0b',

  secondary: '#302a1f',
  secondaryForeground: '#faf4e6',
  secondaryHover: '#4a402d',
  muted: '#252118',
  mutedForeground: '#a69470',

  // Status colors with foregrounds
  success: '#22c55e',
  successForeground: '#052e16',
  successLight: '#052e16',
  successLightForeground: '#22c55e',
  successBorder: '#15803d',
  error: '#ef4444',
  errorForeground: '#450a0a',
  errorLight: '#450a0a',
  errorLightForeground: '#ef4444',
  errorBorder: '#b91c1c',
  warning: '#eab308',
  warningForeground: '#1a1814',
  warningLight: '#422006',
  warningLightForeground: '#eab308',
  warningBorder: '#a16207',
  info: '#f59e0b',
  infoForeground: '#1a1814',
  infoLight: '#451a03',
  infoLightForeground: '#fcd34d',
  infoBorder: '#b45309',

  // Focus ring
  ring: '#f59e0b',
  ringOffset: '#1a1814',
  ringWidth: '2px',
  ringOffsetWidth: '2px',

  // Elevation/Surface (retro hard shadows)
  surface: '#1a1814',
  surfaceForeground: '#faf4e6',
  surfaceRaised: '#252118',
  surfaceRaisedForeground: '#faf4e6',
  popover: '#302a1f',
  popoverForeground: '#faf4e6',
  dialog: '#3d3526',
  dialogForeground: '#faf4e6',
  elevation0: 'none',
  elevation1: '2px 2px 0px rgba(0,0,0,0.3)',
  elevation2: '4px 4px 0px rgba(0,0,0,0.4)',
  elevation3: '6px 6px 0px rgba(0,0,0,0.5)',
  elevation4: '8px 8px 0px rgba(0,0,0,0.6)',
  elevation5: '10px 10px 0px rgba(0,0,0,0.7)',

  // Input states
  input: '#252118',
  inputForeground: '#faf4e6',
  inputPlaceholder: '#a69470',
  inputBorder: '#4a402d',
  inputBorderHover: '#5c5038',
  inputBorderFocus: '#f59e0b',
  inputBorderError: '#ef4444',
  inputBorderSuccess: '#22c55e',
  inputDisabled: '#302a1f',
  inputDisabledForeground: '#736344',

  // Sidebar/Navigation
  sidebar: '#1a1814',
  sidebarForeground: '#faf4e6',
  sidebarBorder: '#4a402d',
  sidebarMuted: '#a69470',
  sidebarHover: '#252118',
  sidebarActive: '#451a03',
  sidebarActiveForeground: '#fcd34d',
  nav: '#1a1814',
  navForeground: '#faf4e6',
  navBorder: '#4a402d',
  navHover: '#252118',
  navActive: '#451a03',
  navActiveForeground: '#fcd34d',

  // Labels & Charts
  ...labelColors,
  ...chartColorsDark,
  ...motionTokens,

  textInverse: '#1a1814',
  skeleton: '#3d3526',
  skeletonLight: '#302a1f',
  overlay: 'rgba(0, 0, 0, 0.75)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  transparent: 'transparent',
  borderDefault: '#4a402d',
  borderMuted: '#3d3526',
  borderStrong: '#5c5038',
  borderFocus: '#f59e0b',

  ...retroStyleTokens,
};

// =============================================================================
// SHADCN THEME (Slate-based, minimal, clean)
// =============================================================================
// Based on shadcn/ui's default slate color scheme - exact official values

// Shadcn slate palette - light mode (exact shadcn/ui default)
const shadcnLightPalette = [
  '#ffffff', // color1 - background
  '#f8fafc', // color2 - subtle background (slate-50)
  '#f1f5f9', // color3 - muted background (slate-100)
  '#e2e8f0', // color4 - border color (slate-200)
  '#cbd5e1', // color5 - input border (slate-300)
  '#94a3b8', // color6 - muted foreground (slate-400)
  '#64748b', // color7 - secondary text (slate-500)
  '#475569', // color8 - (slate-600)
  '#334155', // color9 - (slate-700)
  '#1e293b', // color10 - strong text (slate-800)
  '#0f172a', // color11 - foreground (slate-900)
  '#020617', // color12 - primary text (slate-950)
];

// Shadcn slate palette - dark mode (exact shadcn/ui default)
const shadcnDarkPalette = [
  '#020617', // color1 - background (slate-950)
  '#0f172a', // color2 - subtle background (slate-900)
  '#1e293b', // color3 - muted background (slate-800)
  '#334155', // color4 - border color (slate-700)
  '#475569', // color5 - input border (slate-600)
  '#64748b', // color6 - muted foreground (slate-500)
  '#94a3b8', // color7 - secondary text (slate-400)
  '#cbd5e1', // color8 - (slate-300)
  '#e2e8f0', // color9 - (slate-200)
  '#f1f5f9', // color10 - strong text (slate-100)
  '#f8fafc', // color11 - foreground (slate-50)
  '#ffffff', // color12 - primary text
];

const shadcnSemanticColorsLight = {
  // Primary accent - slate (exact shadcn/ui default)
  accent: '#0f172a', // slate-900 (primary button bg)
  accentForeground: '#f8fafc', // slate-50 (text on primary)
  accentLight: '#f1f5f9', // slate-100 (secondary button bg)
  accentLightForeground: '#0f172a', // slate-900
  accentLighter: '#f8fafc', // slate-50
  accentDark: '#020617', // slate-950
  accentDarker: '#000000',
  accentBorder: '#e2e8f0', // slate-200
  accentBorderHover: '#cbd5e1', // slate-300

  // Secondary (slate-100/secondary button)
  secondary: '#f1f5f9', // slate-100
  secondaryForeground: '#0f172a', // slate-900
  secondaryHover: '#e2e8f0', // slate-200

  // Muted (subtle backgrounds)
  muted: '#f8fafc', // slate-50
  mutedForeground: '#64748b', // slate-500

  // Success
  success: '#16a34a', // green-600
  successForeground: '#ffffff',
  successLight: '#f0fdf4', // green-50
  successLightForeground: '#15803d', // green-700
  successLighter: '#dcfce7', // green-100
  successBorder: '#86efac', // green-300

  // Error
  error: '#dc2626', // red-600
  errorForeground: '#ffffff',
  errorLight: '#fef2f2', // red-50
  errorLightForeground: '#b91c1c', // red-700
  errorLighter: '#fee2e2', // red-100
  errorBorder: '#fca5a5', // red-300
  errorBorderStrong: '#f87171', // red-400

  // Warning
  warning: '#d97706', // amber-600
  warningForeground: '#ffffff',
  warningLight: '#fffbeb', // amber-50
  warningLightForeground: '#b45309', // amber-700
  warningLighter: '#fef3c7', // amber-100
  warningBorder: '#fcd34d', // amber-300

  // Info
  info: '#2563eb', // blue-600
  infoForeground: '#ffffff',
  infoLight: '#eff6ff', // blue-50
  infoLightForeground: '#1d4ed8', // blue-700
  infoDark: '#1d4ed8', // blue-700
  infoBorder: '#93c5fd', // blue-300

  // Focus ring (shadcn uses slate-400)
  ring: '#94a3b8', // slate-400
  ringOffset: '#ffffff',
  ringWidth: '2px',
  ringOffsetWidth: '2px',

  // Elevation/Surface (shadcn uses minimal elevation)
  surface: '#ffffff',
  surfaceForeground: '#0f172a', // slate-900
  surfaceRaised: '#ffffff',
  surfaceRaisedForeground: '#0f172a',
  popover: '#ffffff',
  popoverForeground: '#0f172a',
  dialog: '#ffffff',
  dialogForeground: '#0f172a',
  elevation0: 'none',
  elevation1: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  elevation2: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  elevation3: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  elevation4: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  elevation5: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',

  // Input states
  input: '#ffffff',
  inputForeground: '#0f172a',
  inputPlaceholder: '#64748b', // slate-500
  inputBorder: '#e2e8f0', // slate-200
  inputBorderHover: '#cbd5e1', // slate-300
  inputBorderFocus: '#94a3b8', // slate-400
  inputBorderError: '#f87171', // red-400
  inputBorderSuccess: '#4ade80', // green-400
  inputDisabled: '#f1f5f9', // slate-100
  inputDisabledForeground: '#94a3b8', // slate-400

  // Sidebar/Navigation (shadcn sidebar tokens)
  sidebar: '#f8fafc', // slate-50
  sidebarForeground: '#0f172a', // slate-900
  sidebarBorder: '#e2e8f0', // slate-200
  sidebarMuted: '#64748b', // slate-500
  sidebarHover: '#f1f5f9', // slate-100
  sidebarActive: '#f1f5f9', // slate-100
  sidebarActiveForeground: '#0f172a', // slate-900
  nav: '#ffffff',
  navForeground: '#0f172a',
  navBorder: '#e2e8f0',
  navHover: '#f1f5f9',
  navActive: '#f1f5f9',
  navActiveForeground: '#0f172a',

  // Labels & Charts
  ...labelColors,
  ...chartColorsLight,
  ...motionTokens,

  // Utility
  textInverse: '#f8fafc', // slate-50
  skeleton: '#e2e8f0', // slate-200
  skeletonLight: '#f1f5f9', // slate-100
  overlay: 'rgba(0, 0, 0, 0.8)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  transparent: 'transparent',

  // Borders
  borderDefault: '#e2e8f0', // slate-200
  borderMuted: '#f1f5f9', // slate-100
  borderStrong: '#cbd5e1', // slate-300
  borderFocus: '#94a3b8', // slate-400

  ...shadcnStyleTokens,
};

const shadcnSemanticColorsDark = {
  // Primary accent - inverted for dark mode (exact shadcn/ui default)
  accent: '#f8fafc', // slate-50 (primary button bg in dark)
  accentForeground: '#0f172a', // slate-900 (text on primary)
  accentLight: '#1e293b', // slate-800 (secondary button bg)
  accentLightForeground: '#f8fafc', // slate-50
  accentLighter: '#0f172a', // slate-900
  accentDark: '#ffffff',
  accentDarker: '#ffffff',
  accentBorder: '#334155', // slate-700
  accentBorderHover: '#475569', // slate-600

  // Secondary (slate-800/secondary button)
  secondary: '#1e293b', // slate-800
  secondaryForeground: '#f8fafc', // slate-50
  secondaryHover: '#334155', // slate-700

  // Muted
  muted: '#0f172a', // slate-900
  mutedForeground: '#94a3b8', // slate-400

  // Success
  success: '#22c55e', // green-500
  successForeground: '#052e16', // green-950
  successLight: '#052e16', // green-950
  successLightForeground: '#22c55e', // green-500
  successLighter: '#14532d', // green-900
  successBorder: '#166534', // green-800

  // Error
  error: '#ef4444', // red-500
  errorForeground: '#450a0a', // red-950
  errorLight: '#450a0a', // red-950
  errorLightForeground: '#ef4444', // red-500
  errorLighter: '#7f1d1d', // red-900
  errorBorder: '#991b1b', // red-800
  errorBorderStrong: '#b91c1c', // red-700

  // Warning
  warning: '#f59e0b', // amber-500
  warningForeground: '#451a03', // amber-950
  warningLight: '#451a03', // amber-950
  warningLightForeground: '#f59e0b', // amber-500
  warningLighter: '#78350f', // amber-900
  warningBorder: '#92400e', // amber-800

  // Info
  info: '#3b82f6', // blue-500
  infoForeground: '#172554', // blue-950
  infoLight: '#172554', // blue-950
  infoLightForeground: '#3b82f6', // blue-500
  infoDark: '#60a5fa', // blue-400
  infoBorder: '#1e40af', // blue-800

  // Focus ring (shadcn uses slate-600 in dark)
  ring: '#475569', // slate-600
  ringOffset: '#020617', // slate-950
  ringWidth: '2px',
  ringOffsetWidth: '2px',

  // Elevation/Surface
  surface: '#020617', // slate-950
  surfaceForeground: '#f8fafc', // slate-50
  surfaceRaised: '#0f172a', // slate-900
  surfaceRaisedForeground: '#f8fafc',
  popover: '#0f172a', // slate-900
  popoverForeground: '#f8fafc',
  dialog: '#0f172a',
  dialogForeground: '#f8fafc',
  elevation0: 'none',
  elevation1: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  elevation2: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
  elevation3: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
  elevation4: '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -4px rgba(0, 0, 0, 0.5)',
  elevation5: '0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.6)',

  // Input states
  input: '#0f172a', // slate-900
  inputForeground: '#f8fafc',
  inputPlaceholder: '#94a3b8', // slate-400
  inputBorder: '#334155', // slate-700
  inputBorderHover: '#475569', // slate-600
  inputBorderFocus: '#475569', // slate-600
  inputBorderError: '#f87171', // red-400
  inputBorderSuccess: '#4ade80', // green-400
  inputDisabled: '#1e293b', // slate-800
  inputDisabledForeground: '#64748b', // slate-500

  // Sidebar/Navigation
  sidebar: '#020617', // slate-950
  sidebarForeground: '#f8fafc', // slate-50
  sidebarBorder: '#1e293b', // slate-800
  sidebarMuted: '#94a3b8', // slate-400
  sidebarHover: '#1e293b', // slate-800
  sidebarActive: '#1e293b', // slate-800
  sidebarActiveForeground: '#f8fafc', // slate-50
  nav: '#020617',
  navForeground: '#f8fafc',
  navBorder: '#1e293b',
  navHover: '#1e293b',
  navActive: '#1e293b',
  navActiveForeground: '#f8fafc',

  // Labels & Charts
  ...labelColors,
  ...chartColorsDark,
  ...motionTokens,

  // Utility
  textInverse: '#0f172a', // slate-900
  skeleton: '#334155', // slate-700
  skeletonLight: '#1e293b', // slate-800
  overlay: 'rgba(0, 0, 0, 0.8)',
  overlayLight: 'rgba(0, 0, 0, 0.6)',
  transparent: 'transparent',

  // Borders
  borderDefault: '#1e293b', // slate-800
  borderMuted: '#0f172a', // slate-900
  borderStrong: '#334155', // slate-700
  borderFocus: '#475569', // slate-600

  ...shadcnStyleTokens,
};

const generatedThemes = createThemes({
  // componentThemes: defaultComponentThemes,
  // componentThemes: defaultConfig.themes,

  base: {
    palette: {
      dark: darkPalette,
      light: lightPalette,
    },

    // for values we don't want being inherited onto sub-themes
    extra: {
      light: {
        ...Colors.blue,
        ...Colors.green,
        ...Colors.red,
        ...Colors.yellow,
        ...Colors.orange,
        ...Colors.purple,
        ...Colors.pink,
        ...Colors.gray,
        ...lightShadows,
        ...extraColors,
        ...lightSemanticColors,
        ...defaultStyleTokens,
        shadowColor: lightShadows.shadow1,
      },
      dark: {
        ...Colors.blueDark,
        ...Colors.greenDark,
        ...Colors.redDark,
        ...Colors.yellowDark,
        ...Colors.orangeDark,
        ...Colors.purpleDark,
        ...Colors.pinkDark,
        ...Colors.grayDark,
        ...darkShadows,
        ...extraColors,
        ...darkSemanticColors,
        ...defaultStyleTokens,
        shadowColor: darkShadows.shadow1,
      },
    },
  },

  // inverse accent theme
  accent: {
    palette: {
      dark: lightPalette,
      light: darkPalette,
    },
  },

  childrenThemes: {
    blue: {
      palette: {
        dark: Object.values(Colors.blueDark),
        light: Object.values(Colors.blue),
      },
    },
    red: {
      palette: {
        dark: Object.values(Colors.redDark),
        light: Object.values(Colors.red),
      },
    },
    yellow: {
      palette: {
        dark: Object.values(Colors.yellowDark),
        light: Object.values(Colors.yellow),
      },
    },
    green: {
      palette: {
        dark: Object.values(Colors.greenDark),
        light: Object.values(Colors.green),
      },
    },

    // ==========================================================================
    // AURORA THEME - purple accent
    // ==========================================================================
    aurora: {
      palette: {
        dark: auroraDarkPalette,
        light: auroraLightPalette,
      },
      extra: {
        light: {
          ...Colors.purple,
          ...lightShadows,
          ...extraColors,
          ...auroraSemanticColorsLight,
          shadowColor: 'rgba(139, 92, 246, 0.1)',
        },
        dark: {
          ...Colors.purpleDark,
          ...darkShadows,
          ...extraColors,
          ...auroraSemanticColorsDark,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    },

    // ==========================================================================
    // STEEL THEME - silver/metallic, steel-blue accent
    // ==========================================================================
    steel: {
      palette: {
        dark: steelDarkPalette,
        light: steelLightPalette,
      },
      extra: {
        light: {
          ...Colors.blue,
          ...lightShadows,
          ...extraColors,
          ...steelSemanticColorsLight,
          shadowColor: 'rgba(20, 26, 34, 0.1)',
        },
        dark: {
          ...Colors.blueDark,
          ...darkShadows,
          ...extraColors,
          ...steelSemanticColorsDark,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    },

    // ==========================================================================
    // RETRO THEME - Warm colors, hard shadows, sharp aesthetic
    // ==========================================================================
    retro: {
      palette: {
        dark: retroDarkPalette,
        light: retroLightPalette,
      },
      extra: {
        light: {
          ...Colors.orange,
          ...Colors.amber,
          ...extraColors,
          ...retroSemanticColorsLight,
          shadowColor: 'rgba(0, 0, 0, 0.2)',
        },
        dark: {
          ...Colors.orangeDark,
          ...extraColors,
          ...retroSemanticColorsDark,
          shadowColor: 'rgba(0, 0, 0, 0.4)',
        },
      },
    },

    // ==========================================================================
    // SHADCN THEME - Slate-based, minimal, clean (exact shadcn/ui default)
    // ==========================================================================
    shadcn: {
      palette: {
        dark: shadcnDarkPalette,
        light: shadcnLightPalette,
      },
      extra: {
        light: {
          ...Colors.gray,
          ...Colors.blue,
          ...Colors.green,
          ...Colors.red,
          ...Colors.yellow,
          ...extraColors,
          ...shadcnSemanticColorsLight,
          shadowColor: 'rgba(0, 0, 0, 0.05)',
        },
        dark: {
          ...Colors.grayDark,
          ...Colors.blueDark,
          ...Colors.greenDark,
          ...Colors.redDark,
          ...Colors.yellowDark,
          ...extraColors,
          ...shadcnSemanticColorsDark,
          shadowColor: 'rgba(0, 0, 0, 0.25)',
        },
      },
    },
  },

  // Add borderRadius and spacing per theme using getTheme callback
  getTheme: ({ theme, name }) => {
    const isRetro = name.includes('retro');
    const isShadcn = name.includes('shadcn');

    // Shared border radius values
    const defaultBorderRadius = {
      borderRadius: 8,
      borderRadiusSm: 4,
      borderRadiusMd: 6,
      borderRadiusLg: 8,
      borderRadiusXl: 12,
      borderRadius2xl: 16,
      borderRadius3xl: 24,
      borderRadiusFull: 9999,
    };

    const retroBorderRadius = {
      borderRadius: 0,
      borderRadiusSm: 0,
      borderRadiusMd: 0,
      borderRadiusLg: 0,
      borderRadiusXl: 0,
      borderRadius2xl: 2,
      borderRadius3xl: 2,
      borderRadiusFull: 2,
    };

    // Retro theme - sharp corners for video game aesthetic
    if (isRetro) {
      return {
        ...theme,
        ...retroBorderRadius,
      };
    }

    // Shadcn theme - exact shadcn/ui colors and radius
    // (Tailwind spacing is now global in tamagui.config.ts)
    if (isShadcn) {
      return {
        ...theme,
        ...defaultBorderRadius,
      };
    }

    // Default/Aurora themes - standard rounded corners
    return {
      ...theme,
      ...defaultBorderRadius,
    };
  },
});

export type TamaguiThemes = typeof generatedThemes;

/**
 * Always include themes in the bundle.
 * The SSR optimization (empty themes on client) doesn't apply to SPAs.
 */
export const themes: TamaguiThemes = generatedThemes as any;

// =============================================================================
// EXPORTED CONSTANTS
// =============================================================================
// Export label colors as an array for use in color pickers, etc.

export const LABEL_COLOR_PRESETS = Object.values(labelColors);

export const LABEL_COLOR_MAP = labelColors;
