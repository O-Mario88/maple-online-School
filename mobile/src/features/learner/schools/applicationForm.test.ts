import { type ApplicationForm, ageOn, progressOf, stepErrors } from './applicationForm';

const TODAY = '2026-11-05';
const DOCS = ['report', 'birth', 'photo', 'guardianId'];

const form = (over: Partial<ApplicationForm> = {}): ApplicationForm => ({
  applyingFor: 'Senior Secondary (S.1)',
  first: 'Aisha',
  middle: 'Nalubega',
  last: 'Kato',
  dob: '2011-03-14',
  gender: 'Female',
  nationality: 'Ugandan',
  guardian: { name: 'John Kato', relationship: 'Father', phone: '772 345 678', email: 'john.kato@example.com', occupation: 'Accountant', address: 'Ntinda, Kampala' },
  current: { school: 'Bright Future Junior School', grade: 'P.7', year: '2025' },
  academic: { stream: 'Sciences', subjects: ['Mathematics', 'Physics'], pleAggregate: '', pleIndex: '', pleYear: '', boarding: '', needs: '' },
  documents: {},
  consent: false,
  ...over,
});

const academic = { stream: 'Sciences', subjects: ['Mathematics'], pleAggregate: '8', pleIndex: '012345/089', pleYear: '2025', boarding: 'Day' as const, needs: '' };
const allDocs = { report: 'report.pdf', birth: 'birth.pdf', photo: 'photo.jpg', guardianId: 'id.jpg' };

describe('school application form', () => {
  test('the filled applicant step from the design has no errors', () => {
    expect(stepErrors(form(), 'applicant', DOCS, TODAY)).toEqual({});
  });

  test('names, date of birth, gender, nationality and the guardian’s name, relationship, phone and address are required', () => {
    const e = stepErrors(form({ first: ' ', last: '', gender: '', guardian: { ...form().guardian, name: '', phone: '', address: '' } }), 'applicant', DOCS, TODAY);
    expect(Object.keys(e).sort()).toEqual(['first', 'gender', 'guardian.address', 'guardian.name', 'guardian.phone', 'last']);
    expect(e.first).toBe('Enter the first name');
  });

  test('a Ugandan phone number has nine digits after +256; email is optional but must look like one', () => {
    expect(stepErrors(form({ guardian: { ...form().guardian, phone: '77 345' } }), 'applicant', DOCS, TODAY)['guardian.phone']).toBe('Enter the 9 digits after +256, e.g. 772 345 678');
    expect(stepErrors(form({ guardian: { ...form().guardian, phone: '0772 345 678' } }), 'applicant', DOCS, TODAY)).toEqual({});
    expect(stepErrors(form({ guardian: { ...form().guardian, email: 'john@' } }), 'applicant', DOCS, TODAY)['guardian.email']).toBe('Enter an email like name@example.com');
    expect(stepErrors(form({ guardian: { ...form().guardian, email: '' } }), 'applicant', DOCS, TODAY)).toEqual({});
  });

  test('the date of birth must be a real past date for a learner aged 5 to 25', () => {
    expect(stepErrors(form({ dob: '2027-01-01' }), 'applicant', DOCS, TODAY).dob).toBe('Enter a date of birth in the past');
    expect(stepErrors(form({ dob: '2011-02-30' }), 'applicant', DOCS, TODAY).dob).toBe('Enter the date of birth');
    expect(stepErrors(form({ dob: '1990-01-01' }), 'applicant', DOCS, TODAY).dob).toBe('Learners must be 5 to 25 years old');
    expect(ageOn('2011-03-14', TODAY)).toBe(15);
    expect(ageOn('2011-11-06', TODAY)).toBe(14);
  });

  test('academic information needs the stream and PLE results, with the aggregate between 4 and 36', () => {
    expect(Object.keys(stepErrors(form(), 'academic', DOCS, TODAY)).sort()).toEqual(['pleAggregate', 'pleIndex', 'pleYear']);
    expect(stepErrors(form({ academic: { ...academic, pleAggregate: '40' } }), 'academic', DOCS, TODAY).pleAggregate).toBe('PLE aggregates run from 4 to 36');
    expect(stepErrors(form({ academic: { ...academic, pleYear: '2027' } }), 'academic', DOCS, TODAY).pleYear).toBe('Enter the year of the PLE sitting');
    expect(stepErrors(form({ academic }), 'academic', DOCS, TODAY)).toEqual({});
  });

  test('every required document must be attached, and the review needs consent', () => {
    expect(Object.keys(stepErrors(form({ documents: { report: 'r.pdf' } }), 'documents', DOCS, TODAY))).toEqual(['birth', 'photo', 'guardianId']);
    expect(stepErrors(form({ documents: allDocs }), 'documents', DOCS, TODAY)).toEqual({});
    expect(stepErrors(form(), 'review', DOCS, TODAY).consent).toBe('Confirm the details are true and agree to share them with this school');
  });

  test('progress counts completed steps in order, a quarter each; only submitting reaches 100%', () => {
    expect(progressOf(form(), DOCS, TODAY, false)).toEqual({ pct: 25, done: 1 });
    expect(progressOf(form({ academic, documents: allDocs }), DOCS, TODAY, false)).toEqual({ pct: 75, done: 3 });
    expect(progressOf(form({ first: '', academic, documents: allDocs }), DOCS, TODAY, false)).toEqual({ pct: 0, done: 0 });
    expect(progressOf(form({ academic, documents: allDocs, consent: true }), DOCS, TODAY, true)).toEqual({ pct: 100, done: 4 });
  });
});
