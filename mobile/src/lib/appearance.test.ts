import { Maple } from '@/constants/maple';

import { APP_SCHEME, mapleNavTheme } from './appearance';

// The theme tokens load the web stylesheet, which Jest can't read (Jest runs this before the import).
jest.mock('@/global.css', () => ({}));

const base = {
  dark: false,
  colors: { primary: '#007AFF', background: '#F2F2F2', card: '#FFFFFF', text: '#1C1C1E', border: '#D8D8D8', notification: '#FF3B30' },
  fonts: {},
};

describe('appearance', () => {
  test('Maple is drawn light everywhere until its dark theme is designed', () => {
    expect(APP_SCHEME).toBe('light');
  });

  test('between pages the navigator shows Maple’s own page colour, never black or grey', () => {
    const theme = mapleNavTheme(base);
    expect(theme.dark).toBe(false);
    expect(theme.colors.background).toBe(Maple.canvas);
    expect(theme.colors.card).toBe(Maple.canvas);
    expect(theme.colors.primary).toBe(Maple.blue);
    expect(base.colors.background).toBe('#F2F2F2');
  });
});
