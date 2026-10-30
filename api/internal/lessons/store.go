package lessons

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/O-Mario88/maple-online-School/api/internal/httpx"
	"github.com/O-Mario88/maple-online-School/api/internal/platform/dbgen"
	"github.com/O-Mario88/maple-online-School/api/internal/roles"
)

const foreignKeyViolation = "23503"

// PostgresStore implements Store.
type PostgresStore struct {
	pool *pgxpool.Pool
	q    *dbgen.Queries
}

func NewPostgresStore(pool *pgxpool.Pool) *PostgresStore {
	return &PostgresStore{pool: pool, q: dbgen.New(pool)}
}

func (s *PostgresStore) Viewer(ctx context.Context, userID int64, role string) (Viewer, error) {
	v := Viewer{UserID: userID, Learners: []int64{}}
	var err error
	if v.Leaders, err = s.q.StaffSchoolIDs(ctx, dbgen.StaffSchoolIDsParams{UserID: userID, StaffRoles: roles.Leaders}); err != nil {
		return v, fmt.Errorf("load led schools: %w", err)
	}
	if v.Teachers, err = s.q.StaffSchoolIDs(ctx, dbgen.StaffSchoolIDsParams{UserID: userID, StaffRoles: roles.Teachers}); err != nil {
		return v, fmt.Errorf("load teaching schools: %w", err)
	}
	switch role {
	case "student":
		v.Learners = []int64{userID}
	case "parent":
		kids, err := s.q.ApprovedChildren(ctx, userID)
		if err != nil {
			return v, fmt.Errorf("load children: %w", err)
		}
		for _, k := range kids {
			v.Learners = append(v.Learners, k.UserID)
		}
	}
	return v, nil
}

// ---- lessons ------------------------------------------------------------------

func (s *PostgresStore) ListLessons(ctx context.Context, v Viewer, f LessonFilter, page httpx.Page) ([]Lesson, int64, error) {
	count, err := s.q.CountVisibleLessons(ctx, dbgen.CountVisibleLessonsParams{
		LeaderSchools: v.Leaders, ViewerID: v.UserID, TeacherSchools: v.Teachers, LearnerIds: v.Learners,
		ParentClass: id(f.ParentClass), Topic: id(f.Topic), AccessMode: text(f.AccessMode),
	})
	if err != nil {
		return nil, 0, fmt.Errorf("count lessons: %w", err)
	}
	rows, err := s.q.ListVisibleLessons(ctx, dbgen.ListVisibleLessonsParams{
		LeaderSchools: v.Leaders, ViewerID: v.UserID, TeacherSchools: v.Teachers, LearnerIds: v.Learners,
		ParentClass: id(f.ParentClass), Topic: id(f.Topic), AccessMode: text(f.AccessMode),
		PageLimit: page.Limit, PageOffset: page.Offset,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("list lessons: %w", err)
	}
	out := make([]Lesson, 0, len(rows))
	for _, r := range rows {
		out = append(out, Lesson{ID: r.ID, Title: r.Title, AccessMode: r.AccessMode, ScheduledAt: r.ScheduledAt.Time,
			PublishedAt: optTime(r.PublishedAt), CreatedAt: r.CreatedAt.Time, ParentClass: r.ParentClassID,
			Topic: optID(r.TopicID), ClassTitle: r.ClassTitle, TopicName: r.TopicName})
	}
	return out, count, nil
}

func (s *PostgresStore) Lesson(ctx context.Context, v Viewer, lessonID int64) (Lesson, error) {
	r, err := s.q.GetVisibleLesson(ctx, dbgen.GetVisibleLessonParams{
		ID: lessonID, LeaderSchools: v.Leaders, ViewerID: v.UserID, TeacherSchools: v.Teachers, LearnerIds: v.Learners,
	})
	if errors.Is(err, pgx.ErrNoRows) {
		return Lesson{}, ErrNotFound
	}
	if err != nil {
		return Lesson{}, fmt.Errorf("get lesson: %w", err)
	}
	return Lesson{ID: r.ID, Title: r.Title, AccessMode: r.AccessMode, ScheduledAt: r.ScheduledAt.Time,
		PublishedAt: optTime(r.PublishedAt), CreatedAt: r.CreatedAt.Time, ParentClass: r.ParentClassID,
		Topic: optID(r.TopicID), ClassTitle: r.ClassTitle, TopicName: r.TopicName,
		school: r.InstitutionID, teacher: r.TeacherID}, nil
}

func (s *PostgresStore) ClassOwner(ctx context.Context, classID int64) (school, teacher int64, err error) {
	row, err := s.q.LessonClassOwner(ctx, classID)
	if errors.Is(err, pgx.ErrNoRows) {
		return 0, 0, ErrNotFound
	}
	if err != nil {
		return 0, 0, fmt.Errorf("load class: %w", err)
	}
	return row.InstitutionID, row.TeacherID, nil
}

func (s *PostgresStore) CreateLesson(ctx context.Context, classID int64, d Draft) (int64, error) {
	newID, err := s.q.CreateLesson(ctx, dbgen.CreateLessonParams{
		Title: d.Title, AccessMode: d.AccessMode, ScheduledAt: stamp(d.ScheduledAt), ParentClassID: classID, TopicID: id(d.Topic),
	})
	return newID, writeErr(err, "create lesson")
}

func (s *PostgresStore) UpdateLesson(ctx context.Context, lessonID int64, d Draft) error {
	err := s.q.UpdateLesson(ctx, dbgen.UpdateLessonParams{
		ID: lessonID, Title: d.Title, AccessMode: d.AccessMode, ScheduledAt: stamp(d.ScheduledAt), TopicID: id(d.Topic),
	})
	return writeErr(err, "update lesson")
}

// DeleteLesson removes a lesson nobody has attended, with its notes and
// recordings. Lessons with history must be hidden (set to draft) instead.
func (s *PostgresStore) DeleteLesson(ctx context.Context, lessonID int64) error {
	return pgx.BeginFunc(ctx, s.pool, func(tx pgx.Tx) error {
		q := s.q.WithTx(tx)
		used, err := q.LessonHasHistory(ctx, lessonID)
		if err != nil {
			return fmt.Errorf("check history: %w", err)
		}
		if used {
			return ErrInUse
		}
		steps := []func(context.Context, int64) error{
			q.DeleteLessonNotes, q.DeleteLessonRecordings, q.DeleteLessonResourceLinks, unplan(q), q.DeleteLesson,
		}
		for _, step := range steps {
			if err := step(ctx, lessonID); err != nil {
				return fmt.Errorf("delete lesson: %w", err)
			}
		}
		return nil
	})
}

func unplan(q *dbgen.Queries) func(context.Context, int64) error {
	return func(ctx context.Context, lessonID int64) error {
		return q.UnplanLessonInstances(ctx, pgtype.Int8{Int64: lessonID, Valid: true})
	}
}

// ---- notes and recordings ---------------------------------------------------------

func (s *PostgresStore) Notes(ctx context.Context, lessonID int64) ([]Note, error) {
	rows, err := s.q.ListLessonNotes(ctx, []int64{lessonID})
	if err != nil {
		return nil, fmt.Errorf("list notes: %w", err)
	}
	out := make([]Note, 0, len(rows))
	for _, r := range rows {
		out = append(out, toNote(dbgen.LessonsLessonnote(r)))
	}
	return out, nil
}

func (s *PostgresStore) Note(ctx context.Context, noteID int64) (Note, error) {
	r, err := s.q.GetLessonNote(ctx, noteID)
	if errors.Is(err, pgx.ErrNoRows) {
		return Note{}, ErrNotFound
	}
	if err != nil {
		return Note{}, fmt.Errorf("get note: %w", err)
	}
	return toNote(dbgen.LessonsLessonnote(r)), nil
}

func (s *PostgresStore) CreateNote(ctx context.Context, lessonID int64, blocks []byte) (Note, error) {
	r, err := s.q.CreateLessonNote(ctx, dbgen.CreateLessonNoteParams{ContentBlocks: blocks, LessonID: lessonID})
	if err != nil {
		return Note{}, fmt.Errorf("create note: %w", err)
	}
	return toNote(r), nil
}

func (s *PostgresStore) UpdateNote(ctx context.Context, noteID int64, blocks []byte) (Note, error) {
	r, err := s.q.UpdateLessonNote(ctx, dbgen.UpdateLessonNoteParams{ID: noteID, ContentBlocks: blocks})
	if err != nil {
		return Note{}, fmt.Errorf("update note: %w", err)
	}
	return toNote(r), nil
}

func (s *PostgresStore) DeleteNote(ctx context.Context, noteID int64) error {
	if err := s.q.DeleteLessonNote(ctx, noteID); err != nil {
		return fmt.Errorf("delete note: %w", err)
	}
	return nil
}

func (s *PostgresStore) Recordings(ctx context.Context, lessonID int64) ([]Recording, error) {
	rows, err := s.q.ListLessonRecordings(ctx, []int64{lessonID})
	if err != nil {
		return nil, fmt.Errorf("list recordings: %w", err)
	}
	out := make([]Recording, 0, len(rows))
	for _, r := range rows {
		out = append(out, toRecording(dbgen.LessonsLessonrecording(r)))
	}
	return out, nil
}

func (s *PostgresStore) Recording(ctx context.Context, recordingID int64) (Recording, error) {
	r, err := s.q.GetLessonRecording(ctx, recordingID)
	if errors.Is(err, pgx.ErrNoRows) {
		return Recording{}, ErrNotFound
	}
	if err != nil {
		return Recording{}, fmt.Errorf("get recording: %w", err)
	}
	return toRecording(dbgen.LessonsLessonrecording(r)), nil
}

func (s *PostgresStore) CreateRecording(ctx context.Context, lessonID int64, link string, seconds int32) (Recording, error) {
	r, err := s.q.CreateLessonRecording(ctx, dbgen.CreateLessonRecordingParams{Url: link, Duration: seconds, LessonID: lessonID})
	if err != nil {
		return Recording{}, fmt.Errorf("create recording: %w", err)
	}
	return toRecording(r), nil
}

func (s *PostgresStore) DeleteRecording(ctx context.Context, recordingID int64) error {
	if err := s.q.DeleteLessonRecording(ctx, recordingID); err != nil {
		return fmt.Errorf("delete recording: %w", err)
	}
	return nil
}

// ---- attendance -------------------------------------------------------------------

func (s *PostgresStore) Attendance(ctx context.Context, lessonID int64, everyone bool, learners []int64) ([]Attendance, error) {
	rows, err := s.q.ListLessonAttendance(ctx, dbgen.ListLessonAttendanceParams{LessonID: lessonID, AllStudents: everyone, LearnerIds: learners})
	if err != nil {
		return nil, fmt.Errorf("list attendance: %w", err)
	}
	out := make([]Attendance, 0, len(rows))
	for _, r := range rows {
		out = append(out, Attendance{ID: r.ID, Status: r.Status, DurationMinutes: r.DurationMinutes, RecordedAt: r.RecordedAt.Time,
			Lesson: r.LessonID, Student: r.StudentID, StudentName: r.StudentName})
	}
	return out, nil
}

func (s *PostgresStore) Enrolled(ctx context.Context, classID, studentID int64) (bool, error) {
	ok, err := s.q.ActivelyEnrolled(ctx, dbgen.ActivelyEnrolledParams{EnrolledClassID: classID, StudentID: studentID})
	if err != nil {
		return false, fmt.Errorf("check enrolment: %w", err)
	}
	return ok, nil
}

// RecordAttendance keeps one row per student per lesson, updating it on a
// repeat. created reports whether a new row was added.
func (s *PostgresStore) RecordAttendance(ctx context.Context, a Attendance) (Attendance, bool, error) {
	created := false
	err := pgx.BeginFunc(ctx, s.pool, func(tx pgx.Tx) error {
		q := s.q.WithTx(tx)
		if err := q.LockLessonAttendance(ctx, a.Lesson); err != nil {
			return fmt.Errorf("lock: %w", err)
		}
		row, err := q.UpdateLessonAttendance(ctx, dbgen.UpdateLessonAttendanceParams{
			LessonID: a.Lesson, StudentID: a.Student, Status: a.Status, DurationMinutes: a.DurationMinutes,
		})
		if err == nil {
			a.ID, a.RecordedAt = row.ID, row.RecordedAt.Time
			return nil
		}
		if !errors.Is(err, pgx.ErrNoRows) {
			return fmt.Errorf("update attendance: %w", err)
		}
		ins, err := q.InsertLessonAttendance(ctx, dbgen.InsertLessonAttendanceParams{
			LessonID: a.Lesson, StudentID: a.Student, Status: a.Status, DurationMinutes: a.DurationMinutes,
		})
		if err != nil {
			return fmt.Errorf("insert attendance: %w", err)
		}
		a.ID, a.RecordedAt, created = ins.ID, ins.RecordedAt.Time, true
		return nil
	})
	return a, created, err
}

// ---- conversions ------------------------------------------------------------------

func toNote(r dbgen.LessonsLessonnote) Note {
	return Note{ID: r.ID, ContentBlocks: r.ContentBlocks, CreatedAt: r.CreatedAt.Time, UpdatedAt: r.UpdatedAt.Time, Lesson: r.LessonID}
}

func toRecording(r dbgen.LessonsLessonrecording) Recording {
	return Recording{ID: r.ID, URL: r.Url, Duration: r.Duration, CreatedAt: r.CreatedAt.Time, Lesson: r.LessonID}
}

func writeErr(err error, action string) error {
	if err == nil {
		return nil
	}
	var pgErr interface{ SQLState() string }
	if errors.As(err, &pgErr) && pgErr.SQLState() == foreignKeyViolation {
		return ErrBadRef
	}
	return fmt.Errorf("%s: %w", action, err)
}

func stamp(t time.Time) pgtype.Timestamptz { return pgtype.Timestamptz{Time: t, Valid: true} }

func id(v *int64) pgtype.Int8 {
	if v == nil {
		return pgtype.Int8{}
	}
	return pgtype.Int8{Int64: *v, Valid: true}
}

func text(s *string) pgtype.Text {
	if s == nil {
		return pgtype.Text{}
	}
	return pgtype.Text{String: *s, Valid: true}
}

func optID(v pgtype.Int8) *int64 {
	if !v.Valid {
		return nil
	}
	return &v.Int64
}

func optTime(t pgtype.Timestamptz) *time.Time {
	if !t.Valid {
		return nil
	}
	return &t.Time
}
