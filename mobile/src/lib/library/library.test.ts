import { checkNewLink, dueLabel, itemDetail, itemHref, libraryChoices, type LibraryItem } from './library';

const base: LibraryItem = {
  id: '6f1c2b1e-0000-4000-8000-000000000001',
  title: 'Photosynthesis notes',
  description: '',
  content_type: 'notes',
  owner_type: 'institution',
  visibility_scope: 'institution',
  publication_status: 'published',
  moderation_status: '',
  rejection_reason: '',
  file_url: null,
  external_url: 'https://example.org/a',
  language: 'en',
  is_featured: false,
  created_at: '2026-10-30T09:00:00Z',
  updated_at: '2026-10-30T09:00:00Z',
  uploaded_by: 3,
  uploader_name: 'Teacher Adongo',
  subject_name: '',
  topic_name: '',
};

describe('itemHref', () => {
  it('opens the link, or an uploaded file from the media server', () => {
    expect(itemHref(base, 'http://media.test')).toBe('https://example.org/a');
    expect(itemHref({ ...base, external_url: '', file_url: '/media/content/a.pdf' }, 'http://media.test/')).toBe(
      'http://media.test/media/content/a.pdf',
    );
    expect(itemHref({ ...base, external_url: '' }, 'http://media.test')).toBeNull();
  });
});

describe('itemDetail', () => {
  it('names the type, author and where it is shared', () => {
    expect(itemDetail(base)).toBe('Notes · Teacher Adongo · School library');
    expect(itemDetail({ ...base, content_type: 'mock_exam', visibility_scope: 'global', publication_status: 'under_review' })).toBe(
      'Past paper · Teacher Adongo · Waiting for review',
    );
    expect(itemDetail({ ...base, visibility_scope: 'global', publication_status: 'rejected' })).toBe('Notes · Teacher Adongo · Not approved');
  });
});

describe('dueLabel', () => {
  const now = new Date(2026, 10, 2, 12, 0); // Monday 2 Nov 2026, noon
  it('says how soon reading is due', () => {
    expect(dueLabel(null, now)).toBeNull();
    expect(dueLabel(new Date(2026, 10, 2, 18, 0).toISOString(), now)).toBe('Due today');
    expect(dueLabel(new Date(2026, 10, 3, 9, 0).toISOString(), now)).toBe('Due tomorrow');
    expect(dueLabel(new Date(2026, 10, 6, 9, 0).toISOString(), now)).toBe('Due in 4 days');
    expect(dueLabel(new Date(2026, 10, 1, 9, 0).toISOString(), now)).toBe('Overdue');
  });
});

describe('checkNewLink', () => {
  it('needs a title and a web address', () => {
    expect(checkNewLink(' ', 'https://example.org')).toMatch(/title/);
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
