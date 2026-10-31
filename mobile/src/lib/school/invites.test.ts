import { parseEmails } from './invites';

describe('parseEmails', () => {
  it('reads one address per line or separated by commas, without repeats', () => {
    expect(parseEmails('a@school.ug, B@School.ug\nc@school.ug;a@school.ug')).toEqual({
      valid: ['a@school.ug', 'b@school.ug', 'c@school.ug'],
      invalid: [],
    });
  });
  it('lists what it could not read', () => {
    expect(parseEmails('ok@school.ug, not-an-email,  ')).toEqual({ valid: ['ok@school.ug'], invalid: ['not-an-email'] });
  });
});
