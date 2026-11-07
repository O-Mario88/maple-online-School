import { TypeScale } from '@/constants/maple';

import { typeRole } from './type-role';

describe('text by role', () => {
  test('a role takes its size, line height and weight from the type scale', () => {
    expect(typeRole('body', 'default').style).toMatchObject(TypeScale.body);
    expect(typeRole('kpi', 'default').style).toMatchObject(TypeScale.kpi);
  });

  test('page titles are the page h1; section and card titles are headings; the rest is text', () => {
    expect(typeRole('pageTitle', 'default').heading).toBe(1);
    expect(typeRole('sectionTitle', 'default').heading).toBe(2);
    expect(typeRole('cardTitle', 'default').heading).toBe(2);
    expect(typeRole('body', 'default').heading).toBeNull();
  });

  test('titles are navy, body text is body ink, meta is secondary, and onDark is white', () => {
    expect(typeRole('pageTitle', 'default').style.color).toBe('#101E45');
    expect(typeRole('body', 'default').style.color).toBe('#253553');
    expect(typeRole('meta', 'default').style.color).toBe('#617089');
    expect(typeRole('body', 'muted').style.color).toBe('#617089');
    expect(typeRole('cardTitle', 'onDark').style.color).toBe('#FFFFFF');
  });
});
