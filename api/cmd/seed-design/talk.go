package main

import "fmt"

const (
	libraryLanguage = "en"
	libraryKind     = "textbook" // the fake API's "book"
)

// seedLibrary publishes the fake API's books to the first school, uploaded by its teacher.
func (s *seeder) seedLibrary() error {
	items, err := apiList[apiLibraryItem](s.data, "/api/v1/library/items/")
	if err != nil {
		return err
	}
	uploader, err := s.user(s.data.Accounts["teacher"].FullName)
	if err != nil {
		return err
	}
	for _, it := range items {
		level, err := s.level(it.ClassLevelName)
		if err != nil {
			return err
		}
		var subject any
		if id := s.subject(it.SubjectName); id != 0 {
			subject = id
		}
		err = s.exec(`INSERT INTO resources_contentitem (
			  id, title, description, content_type, owner_type, school_level, visibility_scope, publication_status,
			  moderation_status, rejection_reason, external_url, mime_type, vimeo_video_id, vimeo_upload_status, language,
			  version, is_featured, created_at, updated_at, published_at, class_level_id, owner_institution_id, subject_id, uploaded_by_id)
			VALUES (gen_random_uuid(), $1, $2, $3, 'institution', '', 'institution', 'published',
			  'approved', '', $4, '', '', 'none', $5, 1, false, now(), now(), now(), $6, $7, $8, $9)`,
			it.Title, fmt.Sprintf("%s for %s.", it.SubjectName, it.ClassLevelName), libraryKind, it.URL, libraryLanguage,
			level, s.schools[1], subject, uploader)
		if err != nil {
			return fmt.Errorf("library item %s: %w", it.Title, err)
		}
	}
	return nil
}

// seedMessages: the fake API's two conversations between staff and the demo parent.
func (s *seeder) seedMessages() error {
	threads, err := apiList[apiThread](s.data, "/api/v1/messages/threads/")
	if err != nil {
		return err
	}
	for _, t := range threads {
		full, err := apiOne[apiThread](s.data, fmt.Sprintf("/api/v1/messages/threads/%d/", t.ID))
		if err != nil {
			return err
		}
		if err := s.thread(full); err != nil {
			return fmt.Errorf("conversation %q: %w", t.Subject, err)
		}
	}
	return nil
}

func (s *seeder) thread(t apiThread) error {
	student, err := s.user(t.Student.Name)
	if err != nil {
		return err
	}
	staff, err := s.user(t.Staff.Name)
	if err != nil {
		return err
	}
	var last any
	if n := len(t.Messages); n > 0 {
		last = t.Messages[n-1].CreatedAt
	}
	id, err := s.scalar(`INSERT INTO msg_threads (school_id, student_id, staff_id, subject, created_by, created_at, last_message_at)
		VALUES ($1, $2, $3, $4, $3, COALESCE($5::timestamptz, now()), $5) RETURNING id`, s.schools[1], student, staff, t.Subject, last)
	if err != nil {
		return err
	}
	for _, m := range t.Messages {
		author, err := s.user(m.Author.Name)
		if err != nil {
			return err
		}
		if err := s.exec(`INSERT INTO msg_messages (thread_id, author_id, body, created_at) VALUES ($1, $2, $3, $4)`, id, author, m.Body, m.CreatedAt); err != nil {
			return err
		}
	}
	return nil
}

// seedNotices: the learner account's notifications, as the fake inbox shows them.
func (s *seeder) seedNotices() error {
	notes, err := apiList[apiNote](s.data, "/api/v1/inbox/")
	if err != nil {
		return err
	}
	learner, err := s.user(s.data.Accounts["student"].FullName)
	if err != nil {
		return err
	}
	for _, n := range notes {
		err := s.exec(`INSERT INTO inbox_notifications (user_id, kind, title, body, link, created_at, read_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
			learner, n.Kind, n.Title, n.Body, n.Link, n.CreatedAt, n.ReadAt)
		if err != nil {
			return fmt.Errorf("notification %q: %w", n.Title, err)
		}
	}
	return nil
}
