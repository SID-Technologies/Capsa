// Load the real weight files — the bare '@fontsource/space-grotesk' import is
// weight 400 only, which makes every heading a browser-synthesized faux bold.
// Space Grotesk ships 300–700; anything heavier would be synthesized again.
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import { createFont } from 'tamagui';

export const spaceGroteskFont = createFont({
  family: 'Space Grotesk',
  face: {
    400: { normal: 'Space Grotesk' },
    500: { normal: 'Space Grotesk' },
    600: { normal: 'Space Grotesk' },
    700: { normal: 'Space Grotesk' },
  },
  size: {
    1: 10,
    2: 11,
    sm: 11,
    3: 12,
    4: 14,
    true: 14,
    default: 14,
    md: 14,
    5: 16,
    lg: 16,
    6: 18,
    xl: 18,
    7: 20,
    8: 23,
    9: 30,
    10: 46,
    11: 55,
    12: 62,
    13: 75,
    14: 91,
    15: 110,
    16: 134,
  },
  lineHeight: {
    1: 10,
    2: 12,
    sm: 12,
    3: 13,
    4: 16,
    true: 16,
    default: 16,
    md: 16,
    5: 18,
    lg: 18,
    6: 20,
    xl: 20,
    7: 22,
    8: 25,
    9: 34,
    10: 52,
    11: 60,
    12: 70,
    13: 84,
    14: 102,
    15: 124,
    16: 150,
  },
  // Tamagui resolves the weight for sized text from the SAME key as the size
  // (fontSize="$5" → weight['5']), so an escalating map here silently bolds
  // every large paragraph — body text must default to 400 at every size.
  // Headings and emphasis set fontWeight explicitly. (Space Grotesk ships
  // 400–700; see the imports above.)
  weight: {
    1: '400',
    2: '400',
    3: '400',
    4: '400',
    5: '400',
    6: '400',
    7: '400',
    8: '400',
    9: '400',
    10: '400',
    11: '400',
    12: '400',
    13: '400',
    14: '400',
    15: '400',
    16: '400',
    true: '400',
  },
  letterSpacing: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    true: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
    11: 0,
    12: 0,
    13: 0,
    14: 0,
    15: 0,
    16: 0,
  },
});
