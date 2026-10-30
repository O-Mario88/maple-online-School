import { checkNewLink, libraryChoices, resourceDetail, resourceHref, type Resource } from './library';

const base: Resource = {
  id: 1,
  title: 'Photosynthesis notes',
  description: null,
  author: null,
  author_name: 'Teacher Adongo',
  category: 'Notes',
  price: '0.00',
  rating: '4.00',
  is_featured: false,
  file_path: null,
  external_url: null,
  visibility: 'institution_only',
  subject: null,
  class_level: null,
  topic: null,
  uploaded_by: 3,
  owner_type: 'institution',
  owner_institution: 9,
  created_at: '2026-10-30T09:00:00Z',
  vimeo_video_id: null,
};

describe('resourceHref', () => {
  it('opens the link a teacher added', () => {
    expect(resourceHref({ ...base, external_url: 'https://example.org/a' }, 'http://media.test')).toBe('https://example.org/a');
  });
  it('opens uploaded files from the media server', () => {
    expect(resourceHref({ ...base, file_path: '/media/resources/a.pdf' }, 'http://media.test/')).toBe(
      'http://media.test/media/resources/a.pdf',
    );
  });
  it('has nothing to open when there is neither', () => {
    expect(resourceHref(base, 'http://media.test')).toBeNull();
  });
});

describe('resourceDetail', () => {
  it('names the category, author and where it is shared', () => {
    expect(resourceDetail(base)).toBe('Notes · Teacher Adongo · School library');
    expect(resourceDetail({ ...base, category: null, visibility: 'private' })).toBe('Teacher Adongo · Only you');
  });
});

describe('checkNewLink', () => {
  it('needs a title and a web address', () => {
    expect(checkNewLink(' ', 'https://example.org')).toMatch(/title/);
    expect(checkNewLink('Notes', 'example.org')).toMatch(/http/);
    expect(checkNewLink('Notes', 'javascript:alert(1)')).toMatch(/http/);
    expect(checkNewLink('Notes', 'https://example.org/notes')).toBeNull();
  });
});

describe('libraryChoices', () => {
  it('offers the libraries of schools where the person is active staff', () => {
    const memberships = [
      { institution_id: 9, institution_name: 'Hill School', role: 'subject_teacher', status: 'active' },
      { institution_id: 10, institution_name: 'Old School', role: 'subject_teacher', status: 'suspended' },
      { institution_id: 11, institution_name: 'Kid School', role: 'student', status: 'active' },
    ];
    expect(libraryChoices(memberships)).toEqual([{ id: 9, name: 'Hill School' }]);
  });
});
