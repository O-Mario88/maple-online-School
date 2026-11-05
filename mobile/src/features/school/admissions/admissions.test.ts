import { advance, contactFor, exportInquiries, type Inquiry, pipeline, type Viewer } from './admissions';

const inq = (over: Partial<Inquiry>): Inquiry => ({
  ref: 'INQ-1',
  name: 'Nalongo M.',
  level: 'S.1 (O-Level)',
  program: 'O-Level',
  date: '2026-11-01',
  stage: 'New',
  school: 'riverside',
  consent: null,
  contact: { phone: '+256 772 000 111', email: 'parent@example.com' },
  ...over,
});
const granted = { school: 'riverside', purpose: 'Admissions follow-up', channels: ['phone', 'email'] as const, status: 'granted' as const, at: '2026-11-02T09:00:00Z' };
const officer: Viewer = { school: 'riverside', role: 'admissions', name: 'Grace A.' };

describe('admissions and consent-based leads', () => {
  test('contact details show only to the authorised school’s admissions staff, and only while consent stands', () => {
    expect(contactFor(inq({ consent: granted }), officer)).toEqual({ phone: '+256 772 000 111', email: 'parent@example.com' });
    expect(contactFor(inq({}), officer)).toBeNull();
    expect(contactFor(inq({ consent: granted }), { ...officer, school: 'lakeview' })).toBeNull();
    expect(contactFor(inq({ consent: granted }), { ...officer, role: 'teacher' })).toBeNull();
    expect(contactFor(inq({ consent: { ...granted, status: 'withdrawn' } }), officer)).toBeNull();
  });

  test('only the channels the family allowed are shared', () => {
    expect(contactFor(inq({ consent: { ...granted, channels: ['email'] } }), officer)).toEqual({ email: 'parent@example.com' });
  });

  test('an inquiry moves one stage at a time, and never to Contacted without authorised contact', () => {
    expect(advance(inq({}))).toEqual({ error: 'This family hasn’t authorised contact yet. You can contact them once they do.' });
    expect(advance(inq({ consent: granted }))).toEqual({ inquiry: inq({ consent: granted, stage: 'Contact Authorized' }) });
    expect(advance(inq({ consent: granted, stage: 'Contact Authorized' }))).toEqual({ inquiry: inq({ consent: granted, stage: 'Contacted' }) });
    expect(advance(inq({ consent: granted, stage: 'Enrolled' }))).toEqual({ error: 'Already enrolled.' });
    expect(advance(inq({ consent: granted, stage: 'Withdrawn' }))).toEqual({ error: 'This inquiry is closed.' });
  });

  test('the pipeline groups inquiries by stage, in order', () => {
    const p = pipeline([inq({ ref: 'a' }), inq({ ref: 'b', stage: 'Applied' }), inq({ ref: 'c' })]);
    expect(p.map((c) => [c.stage, c.items.length])).toEqual([
      ['New', 2],
      ['Contact Authorized', 0],
      ['Contacted', 0],
      ['Interested', 0],
      ['Applied', 1],
      ['Enrolled', 0],
    ]);
  });

  test('exports need a purpose and an authorised role, carry only authorised contacts, and are logged', () => {
    const list = [inq({ ref: 'a', consent: granted }), inq({ ref: 'b' })];
    expect(exportInquiries(list, officer, ' ', '2026-11-05')).toEqual({ error: 'Say why you’re exporting; every export is logged.' });
    expect(exportInquiries(list, { ...officer, role: 'teacher' }, 'Follow-up calls', '2026-11-05')).toEqual({ error: 'Only admissions staff and administrators can export inquiries.' });
    const ok = exportInquiries(list, officer, 'Follow-up calls', '2026-11-05');
    expect('rows' in ok && ok.rows.map((r) => [r.ref, r.phone ?? null])).toEqual([
      ['a', '+256 772 000 111'],
      ['b', null],
    ]);
    expect('audit' in ok && ok.audit).toEqual({ by: 'Grace A.', purpose: 'Follow-up calls', at: '2026-11-05', count: 2 });
  });
});
