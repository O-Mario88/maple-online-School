package livesessions

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

// LessonRef is what creating a session needs to know about its lesson.
type LessonRef struct {
	ID, School, Teacher, Class int64
	ScheduledAt                time.Time
}

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

// ---- sessions -----------------------------------------------------------------

func (s *PostgresStore) ListSessions(ctx context.Context, v Viewer, status *string, page httpx.Page) ([]Session, int64, error) {
	st := pgtype.Text{}
	if status != nil {
		st = pgtype.Text{String: *status, Valid: true}
	}
	count, err := s.q.CountVisibleLiveSessions(ctx, dbgen.CountVisibleLiveSessionsParams{
		LeaderSchools: v.Leaders, ViewerID: v.UserID, TeacherSchools: v.Teachers, LearnerIds: v.Learners, Status: st,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("count sessions: %w", err)
	}
	rows, err := s.q.ListVisibleLiveSessions(ctx, dbgen.ListVisibleLiveSessionsParams{
		LeaderSchools: v.Leaders, ViewerID: v.UserID, TeacherSchools: v.Teachers, LearnerIds: v.Learners, Status: st,
		PageLimit: page.Limit, PageOffset: page.Offset,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("list sessions: %w", err)
	}
	out := make([]Session, 0, len(rows))
	for _, r := range rows {
		out = append(out, toSession(dbgen.GetVisibleLiveSessionRow(r)))
	}
	return out, count, nil
}

func (s *PostgresStore) Session(ctx context.Context, v Viewer, sessionID int64) (Session, error) {
	r, err := s.q.GetVisibleLiveSession(ctx, dbgen.GetVisibleLiveSessionParams{
		ID: sessionID, LeaderSchools: v.Leaders, ViewerID: v.UserID, TeacherSchools: v.Teachers, LearnerIds: v.Learners,
	})
	if errors.Is(err, pgx.ErrNoRows) {
		return Session{}, ErrNotFound
	}
	if err != nil {
		return Session{}, fmt.Errorf("get session: %w", err)
	}
	return toSession(r), nil
}

func (s *PostgresStore) Lesson(ctx context.Context, v Viewer, lessonID int64) (LessonRef, error) {
	r, err := s.q.GetVisibleLesson(ctx, dbgen.GetVisibleLessonParams{
		ID: lessonID, LeaderSchools: v.Leaders, ViewerID: v.UserID, TeacherSchools: v.Teachers, LearnerIds: v.Learners,
	})
	if errors.Is(err, pgx.ErrNoRows) {
		return LessonRef{}, ErrNotFound
	}
	if err != nil {
		return LessonRef{}, fmt.Errorf("get lesson: %w", err)
	}
	return LessonRef{ID: r.ID, School: r.InstitutionID, Teacher: r.TeacherID, Class: r.ParentClassID, ScheduledAt: r.ScheduledAt.Time}, nil
}

// CreateSession adds the session and reserves its time for the teacher and
// the class in one transaction, so a clash leaves nothing behind.
func (s *PostgresStore) CreateSession(ctx context.Context, lesson LessonRef, d Draft) (int64, error) {
	var newID int64
	err := pgx.BeginFunc(ctx, s.pool, func(tx pgx.Tx) error {
		q := s.q.WithTx(tx)
		var err error
		newID, err = q.CreateLiveSession(ctx, dbgen.CreateLiveSessionParams{
			MeetingLink: d.MeetingLink, Provider: d.Provider, ScheduledStart: stamp(d.ScheduledStart),
			DurationMinutes: d.DurationMinutes, Capacity: d.Capacity, LessonID: lesson.ID,
		})
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrDuplicate
		}
		if err != nil {
			return fmt.Errorf("create session: %w", err)
		}
		return reserve(ctx, q, newID, lesson.Teacher, lesson.Class, d)
	})
	return newID, err
}

// UpdateSession saves the change and moves or frees the reserved time.
func (s *PostgresStore) UpdateSession(ctx context.Context, sess Session, d Draft) error {
	return pgx.BeginFunc(ctx, s.pool, func(tx pgx.Tx) error {
		q := s.q.WithTx(tx)
		err := q.UpdateLiveSession(ctx, dbgen.UpdateLiveSessionParams{
			ID: sess.ID, MeetingLink: d.MeetingLink, ReplayUrl: text(d.ReplayURL), Provider: d.Provider,
			ScheduledStart: stamp(d.ScheduledStart), DurationMinutes: d.DurationMinutes, Capacity: d.Capacity,
			Status: d.Status, ArtifactSyncStatus: d.SyncStatus,
		})
		if err != nil {
			return fmt.Errorf("update session: %w", err)
		}
		return reserve(ctx, q, sess.ID, sess.teacher, sess.class, d)
	})
}

// reserve holds the session's time while it is scheduled, and frees it once
// it is cancelled, completed or has no start time.
func reserve(ctx context.Context, q *dbgen.Queries, sessionID, teacher, class int64, d Draft) error {
	id := pgtype.Int8{Int64: sessionID, Valid: true}
	if d.Status != "scheduled" || d.ScheduledStart == nil {
		if err := q.ReleaseLiveSlot(ctx, id); err != nil {
			return fmt.Errorf("free time: %w", err)
		}
		return nil
	}
	err := q.ReserveLiveSlot(ctx, dbgen.ReserveLiveSlotParams{
		SessionID: id, TeacherID: teacher, CohortID: pgtype.Int8{Int64: class, Valid: true},
		StartsAt: stamp(d.ScheduledStart), Minutes: d.DurationMinutes, Status: "confirmed",
	})
	var pgErr interface{ SQLState() string }
	if errors.As(err, &pgErr) && pgErr.SQLState() == exclusionViolation {
		return ErrClash
	}
	if err != nil {
		return fmt.Errorf("reserve time: %w", err)
	}
	return nil
}

// exclusionViolation is raised by live_reservations' no-overlap constraints.
const exclusionViolation = "23P01"

// ---- reminders ------------------------------------------------------------------

func (s *PostgresStore) Reminders(ctx context.Context, sessionID int64) ([]Reminder, error) {
	rows, err := s.q.ListSessionReminders(ctx, sessionID)
	if err != nil {
		return nil, fmt.Errorf("list reminders: %w", err)
	}
	out := make([]Reminder, 0, len(rows))
	for _, r := range rows {
		out = append(out, toReminder(r))
	}
	return out, nil
}

func (s *PostgresStore) CreateReminder(ctx context.Context, sessionID int64, at time.Time) (Reminder, error) {
	r, err := s.q.CreateSessionReminder(ctx, dbgen.CreateSessionReminderParams{SendAt: stamp(&at), SessionID: sessionID})
	if err != nil {
		return Reminder{}, fmt.Errorf("create reminder: %w", err)
	}
	return toReminder(r), nil
}

func (s *PostgresStore) Reminder(ctx context.Context, reminderID int64) (Reminder, error) {
	r, err := s.q.GetSessionReminder(ctx, reminderID)
	if errors.Is(err, pgx.ErrNoRows) {
		return Reminder{}, ErrNotFound
	}
	if err != nil {
		return Reminder{}, fmt.Errorf("get reminder: %w", err)
	}
	return toReminder(r), nil
}

func (s *PostgresStore) DeleteReminder(ctx context.Context, reminderID int64) error {
	if err := s.q.DeleteSessionReminder(ctx, reminderID); err != nil {
		return fmt.Errorf("delete reminder: %w", err)
	}
	return nil
}

// ---- recovery -------------------------------------------------------------------

func (s *PostgresStore) Recoveries(ctx context.Context, sess Session, everyone bool, learners []int64) ([]Recovery, error) {
	rows, err := s.q.ListRecoveries(ctx, dbgen.ListRecoveriesParams{SessionID: sess.ID, AllStudents: everyone, LearnerIds: learners})
	if err != nil {
		return nil, fmt.Errorf("list recoveries: %w", err)
	}
	out := make([]Recovery, 0, len(rows))
	for _, r := range rows {
		out = append(out, toRecovery(dbgen.GetRecoveryRow(r), sess))
	}
	return s.withTasks(ctx, out)
}

// Recovery returns a recovery and the id of its session.
func (s *PostgresStore) Recovery(ctx context.Context, recoveryID int64) (Recovery, error) {
	r, err := s.q.GetRecovery(ctx, recoveryID)
	if errors.Is(err, pgx.ErrNoRows) {
		return Recovery{}, ErrNotFound
	}
	if err != nil {
		return Recovery{}, fmt.Errorf("get recovery: %w", err)
	}
	return toRecovery(r, Session{ID: r.SessionID}), nil
}

func (s *PostgresStore) Enrolled(ctx context.Context, classID, studentID int64) (bool, error) {
	ok, err := s.q.ActivelyEnrolled(ctx, dbgen.ActivelyEnrolledParams{EnrolledClassID: classID, StudentID: studentID})
	if err != nil {
		return false, fmt.Errorf("check enrolment: %w", err)
	}
	return ok, nil
}

func (s *PostgresStore) CreateRecovery(ctx context.Context, sess Session, studentID int64, summary string, recording *string) (Recovery, error) {
	newID, err := s.q.CreateRecovery(ctx, dbgen.CreateRecoveryParams{
		Summary: summary, RecordingUrl: text(recording), SessionID: sess.ID, StudentID: studentID,
	})
	if errors.Is(err, pgx.ErrNoRows) {
		return Recovery{}, ErrDuplicate
	}
	if err != nil {
		return Recovery{}, fmt.Errorf("create recovery: %w", err)
	}
	return s.fullRecovery(ctx, newID, sess)
}

func (s *PostgresStore) UpdateRecovery(ctx context.Context, rec Recovery, sess Session) (Recovery, error) {
	err := s.q.UpdateRecovery(ctx, dbgen.UpdateRecoveryParams{
		ID: rec.ID, Summary: rec.Summary, RecordingUrl: text(rec.RecordingURL), RecoveryStatus: rec.RecoveryStatus,
	})
	if err != nil {
		return Recovery{}, fmt.Errorf("update recovery: %w", err)
	}
	return s.fullRecovery(ctx, rec.ID, sess)
}

func (s *PostgresStore) fullRecovery(ctx context.Context, recoveryID int64, sess Session) (Recovery, error) {
	r, err := s.q.GetRecovery(ctx, recoveryID)
	if err != nil {
		return Recovery{}, fmt.Errorf("reload recovery: %w", err)
	}
	out, err := s.withTasks(ctx, []Recovery{toRecovery(r, sess)})
	if err != nil {
		return Recovery{}, err
	}
	return out[0], nil
}

func (s *PostgresStore) withTasks(ctx context.Context, recs []Recovery) ([]Recovery, error) {
	ids := make([]int64, 0, len(recs))
	for _, r := range recs {
		ids = append(ids, r.ID)
	}
	rows, err := s.q.RecoveryAssignments(ctx, ids)
	if err != nil {
		return nil, fmt.Errorf("load recovery tasks: %w", err)
	}
	byRecovery := map[int64][]RecoveryTask{}
	for _, t := range rows {
		byRecovery[t.RecoveryID] = append(byRecovery[t.RecoveryID], RecoveryTask{ID: t.ID, Title: t.Title, FileType: t.FileType, FileURL: str(t.FileUrl)})
	}
	out := make([]Recovery, 0, len(recs))
	for _, r := range recs {
		r.Assignments = byRecovery[r.ID]
		if r.Assignments == nil {
			r.Assignments = []RecoveryTask{}
		}
		out = append(out, r)
	}
	return out, nil
}

// ---- conversions ------------------------------------------------------------------

func toSession(r dbgen.GetVisibleLiveSessionRow) Session {
	subject := r.SubjectName
	if subject == "" {
		subject = "General"
	}
	start := optTime(r.ScheduledStart)
	return Session{
		ID: r.ID, MeetingLink: r.MeetingLink, ReplayURL: str(r.ReplayUrl), Provider: r.Provider,
		ProviderEventID: str(r.ProviderEventID), ScheduledStart: start, DurationMinutes: r.DurationMinutes,
		Capacity: r.Capacity, EnrolledCount: r.EnrolledCount, Status: r.Status, ArtifactSyncStatus: r.ArtifactSyncStatus,
		Lesson: r.LessonID, Title: r.Title, HostName: r.HostName, Subject: subject,
		ScheduledStartAlt: start, DurationAlt: r.DurationMinutes, EnrolledAlt: r.EnrolledCount,
		school: r.InstitutionID, teacher: r.TeacherID, class: r.ParentClassID,
	}
}

func toReminder(r dbgen.LiveSessionsSessionreminder) Reminder {
	return Reminder{ID: r.ID, SendAt: r.SendAt.Time, Status: r.Status, Session: r.SessionID}
}

func toRecovery(r dbgen.GetRecoveryRow, sess Session) Recovery {
	return Recovery{
		ID: r.ID, Session: r.SessionID, Student: r.StudentID, StudentName: r.StudentName,
		Subject: sess.Subject, Topic: sess.Title, HostName: sess.HostName, SessionDate: sess.ScheduledStart,
		Summary: r.Summary, RecordingURL: str(r.RecordingUrl), RecoveryStatus: r.RecoveryStatus,
		SubmittedAt: optTime(r.SubmittedAt), CreatedAt: r.CreatedAt.Time, Assignments: []RecoveryTask{},
	}
}

func stamp(t *time.Time) pgtype.Timestamptz {
	if t == nil {
		return pgtype.Timestamptz{}
	}
	return pgtype.Timestamptz{Time: *t, Valid: true}
}

func text(s *string) pgtype.Text {
	if s == nil {
		return pgtype.Text{}
	}
	return pgtype.Text{String: *s, Valid: true}
}

func str(t pgtype.Text) *string {
	if !t.Valid {
		return nil
	}
	return &t.String
}

func optTime(t pgtype.Timestamptz) *time.Time {
	if !t.Valid {
		return nil
	}
	return &t.Time
}
