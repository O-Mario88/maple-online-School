/**
 * Inter, the app's font on the web, iOS and Android, loaded once at start-up as one family
 * so fontWeight picks the face. Only the weights type.ts draws text in are bundled:
 * 400 for body (and its italic), 500 medium, 600 subheadings and 700 headings.
 */
import type { FontFamilyDefinition } from 'expo-font';

import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_400Regular_Italic } from '@expo-google-fonts/inter/400Regular_Italic';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';

import { INTER } from './type';

export const INTER_FAMILY: FontFamilyDefinition[] = [
  {
    fontFamily: INTER,
    fontDefinitions: [
      { path: Inter_400Regular, weight: 400, style: 'normal' },
      { path: Inter_400Regular_Italic, weight: 400, style: 'italic' },
      { path: Inter_500Medium, weight: 500, style: 'normal' },
      { path: Inter_600SemiBold, weight: 600, style: 'normal' },
      { path: Inter_700Bold, weight: 700, style: 'normal' },
    ],
  },
];
