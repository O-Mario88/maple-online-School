package school

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

// PostgresStore implements Store.
type PostgresStore struct {
	pool *pgxpool.Pool
	q    *dbgen.Queries
}

// NewPostgresStore wraps the connection pool.
func NewPostgresStore(pool *pgxpool.Pool) *PostgresStore {
	return &PostgresStore{pool: pool, q: dbgen.New(pool)}
}

// SchoolsWithRoles lists the schools where the user is active in one of the given roles.
func (s *PostgresStore) SchoolsWithRoles(ctx context.Context, userID int64, rs []string) ([]int64, error) {
	ids, err := s.q.StaffSchoolIDs(ctx, dbgen.StaffSchoolIDsParams{UserID: userID, StaffRoles: rs})
	if err != nil {
		return nil, fmt.Errorf("load schools: %w", err)
	}
	return ids, nil
}

// ---- classes ------------------------------------------------------------------

func (s *PostgresStore) ListClasses(ctx context.Context, v Viewer, page httpx.Page) ([]Class, int64, error) {
	count, err := s.q.CountVisibleClasses(ctx, dbgen.CountVisibleClassesParams{
		LeaderSchools: v.Leader, ViewerID: v.UserID, TeacherSchools: v.Teacher, LearnerIds: v.Learners,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("count classes: %w", err)
	}
	rows, err := s.q.ListVisibleClasses(ctx, dbgen.ListVisibleClassesParams{
		LeaderSchools: v.Leader, ViewerID: v.UserID, TeacherSchools: v.Teacher, LearnerIds: v.Learners,
		PageLimit: page.Limit, PageOffset: page.Offset,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("list classes: %w", err)
	}
	out := make([]Class, 0, len(rows))
	for _, r := range rows {
		out = append(out, toClass(dbgen.GetVisibleClassRow(r)))
	}
	return out, count, nil
}

func (s *PostgresStore) GetClass(ctx context.Context, v Viewer, id int64) (Class, error) {
	row, err := s.q.GetVisibleClass(ctx, dbgen.GetVisibleClassParams{
		ID: id, LeaderSchools: v.Leader, ViewerID: v.UserID, TeacherSchools: v.Teacher, LearnerIds: v.Learners,
	})
	if errors.Is(err, pgx.ErrNoRows) {
		return Class{}, ErrNotFound
	}
	if err != nil {
		return Class{}, fmt.Errorf("get class: %w", err)
	}
	return toClass(row), nil
}

// CreateClass checks the teacher works at the school and the level exists.
func (s *PostgresStore) CreateClass(ctx context.Context, in NewClass) (int64, error) {
	ok, err := s.q.IsActiveMember(ctx, dbgen.IsActiveMemberParams{UserID: in.Teacher, InstitutionID: in.Institution, MemberRoles: roles.Staff})
	if err != nil {
		return 0, fmt.Errorf("check teacher: %w", err)
	}
	if !ok {
		return 0, ErrInvalidMember
	}
	exists, err := s.q.ClassLevelExists(ctx, in.ClassLevel)
	if err != nil {
		return 0, fmt.Errorf("check level: %w", err)
	}
	if !exists {
		return 0, ErrInvalidLevel
	}
	id, err := s.q.CreateClass(ctx, dbgen.CreateClassParams{
		Title: in.Title, IsPublished: in.IsPublished, ClassLevelID: in.ClassLevel, InstitutionID: in.Institution, TeacherID: in.Teacher,
	})
	if err != nil {
		return 0, fmt.Errorf("create class: %w", err)
	}
	return id, nil
}

// UpdateClass changes the title, teacher or published flag (nil = unchanged).
func (s *PostgresStore) UpdateClass(ctx context.Context, c Class, title *string, teacher *int64, published *bool) error {
	params := dbgen.UpdateClassParams{ID: c.ID}
	if title != nil {
		params.Title = pgtype.Text{String: *title, Valid: true}
	}
	if teacher != nil {
		ok, err := s.q.IsActiveMember(ctx, dbgen.IsActiveMemberParams{UserID: *teacher, InstitutionID: c.Institution, MemberRoles: roles.Staff})
		if err != nil {
			return fmt.Errorf("check teacher: %w", err)
		}
		if !ok {
			return ErrInvalidMember
		}
		params.TeacherID = pgtype.Int8{Int64: *teacher, Valid: true}
	}
	if published != nil {
		params.IsPublished = pgtype.Bool{Bool: *published, Valid: true}
	}
	if err := s.q.UpdateClass(ctx, params); err != nil {
		return fmt.Errorf("update class: %w", err)
	}
	return nil
}

func (s *PostgresStore) Roster(ctx context.Context, classID int64) ([]RosterEntry, error) {
	rows, err := s.q.ClassRoster(ctx, classID)
	if err != nil {
		return nil, fmt.Errorf("load roster: %w", err)
	}
	out := make([]RosterEntry, 0, len(rows))
	for _, r := range rows {
		out = append(out, RosterEntry{Enrollment: r.EnrollmentID, Student: r.StudentID, StudentName: r.StudentName, EnrolledAt: r.EnrolledAt.Time})
	}
	return out, nil
}

// ---- enrolment ----------------------------------------------------------------

// Enrol adds a student of the class's school to the class (or re-activates them).
func (s *PostgresStore) Enrol(ctx context.Context, c Class, studentID int64) (Enrollment, error) {
	ok, err := s.q.IsActiveMember(ctx, dbgen.IsActiveMemberParams{UserID: studentID, InstitutionID: c.Institution, MemberRoles: []string{"student"}})
	if err != nil {
		return Enrollment{}, fmt.Errorf("check student: %w", err)
	}
	if !ok {
		return Enrollment{}, ErrInvalidMember
	}
	row, err := s.q.EnrolStudent(ctx, dbgen.EnrolStudentParams{EnrolledClassID: c.ID, StudentID: studentID})
	if err != nil {
		return Enrollment{}, fmt.Errorf("enrol: %w", err)
	}
	return Enrollment{ID: row.ID, EnrolledClass: row.EnrolledClassID, ClassTitle: c.Title, Student: row.StudentID, Status: row.Status, EnrolledAt: row.EnrolledAt.Time}, nil
}

// EnrollmentSchool returns the school an enrolment belongs to.
func (s *PostgresStore) EnrollmentSchool(ctx context.Context, id int64) (int64, error) {
	row, err := s.q.GetEnrollment(ctx, id)
	if errors.Is(err, pgx.ErrNoRows) {
		return 0, ErrNotFound
	}
	if err != nil {
		return 0, fmt.Errorf("get enrolment: %w", err)
	}
	return row.InstitutionID, nil
}

func (s *PostgresStore) Unenrol(ctx context.Context, id int64) error {
	if err := s.q.SuspendEnrollment(ctx, id); err != nil {
		return fmt.Errorf("unenrol: %w", err)
	}
	return nil
}

func (s *PostgresStore) ListEnrollments(ctx context.Context, learners []int64, page httpx.Page) ([]Enrollment, int64, error) {
	count, err := s.q.CountLearnerEnrollments(ctx, learners)
	if err != nil {
		return nil, 0, fmt.Errorf("count enrolments: %w", err)
	}
	rows, err := s.q.ListLearnerEnrollments(ctx, dbgen.ListLearnerEnrollmentsParams{LearnerIds: learners, PageLimit: page.Limit, PageOffset: page.Offset})
	if err != nil {
		return nil, 0, fmt.Errorf("list enrolments: %w", err)
	}
	out := make([]Enrollment, 0, len(rows))
	for _, r := range rows {
		out = append(out, Enrollment{ID: r.ID, EnrolledClass: r.EnrolledClassID, ClassTitle: r.ClassTitle, Student: r.StudentID, StudentName: r.StudentName, Status: r.Status, EnrolledAt: r.EnrolledAt.Time})
	}
	return out, count, nil
}

// ---- register -----------------------------------------------------------------

// SaveRegister records each entry for the class on the date, all or nothing.
// Saving the same student and date again updates the mark, so a retry after a
// dropped connection or a second save never creates duplicates.
func (s *PostgresStore) SaveRegister(ctx context.Context, c Class, on time.Time, entries []Entry, recorder int64) (int, error) {
	err := pgx.BeginFunc(ctx, s.pool, func(tx pgx.Tx) error {
		q := s.q.WithTx(tx)
		day := pgtype.Date{Time: on, Valid: true}
		term, err := q.ActiveTerm(ctx, dbgen.ActiveTermParams{InstitutionID: c.Institution, OnDate: day})
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrNoTerm
		}
		if err != nil {
			return fmt.Errorf("find term: %w", err)
		}
		ids, err := q.ActiveRosterIDs(ctx, c.ID)
		if err != nil {
			return fmt.Errorf("load roster: %w", err)
		}
		enrolled := make(map[int64]bool, len(ids))
		for _, id := range ids {
			enrolled[id] = true
		}
		for _, e := range entries {
			if !enrolled[e.Student] {
				return fmt.Errorf("%w: %d", ErrNotEnrolled, e.Student)
			}
			notes := pgtype.Text{}
			if e.Notes != nil {
				notes = pgtype.Text{String: *e.Notes, Valid: true}
			}
			if _, err := q.UpsertDailyRegister(ctx, dbgen.UpsertDailyRegisterParams{
				InstitutionID: c.Institution, TermID: term, StudentID: e.Student, RecordDate: day,
				Status: e.Status, Notes: notes, RecordedByID: pgtype.Int8{Int64: recorder, Valid: true},
			}); err != nil {
				return fmt.Errorf("save mark: %w", err)
			}
		}
		return nil
	})
	if err != nil {
		return 0, err
	}
	return len(entries), nil
}

func (s *PostgresStore) ListMarks(ctx context.Context, staffSchools, learners []int64, f MarkFilter, page httpx.Page) ([]Mark, int64, error) {
	date := pgtype.Date{}
	if f.Date != nil {
		date = pgtype.Date{Time: *f.Date, Valid: true}
	}
	student, class := optional(f.Student), optional(f.Class)
	count, err := s.q.CountAttendance(ctx, dbgen.CountAttendanceParams{StaffSchools: staffSchools, LearnerIds: learners, OnDate: date, StudentID: student, ClassID: class})
	if err != nil {
		return nil, 0, fmt.Errorf("count marks: %w", err)
	}
	rows, err := s.q.ListAttendance(ctx, dbgen.ListAttendanceParams{
		StaffSchools: staffSchools, LearnerIds: learners, OnDate: date, StudentID: student, ClassID: class,
		PageLimit: page.Limit, PageOffset: page.Offset,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("list marks: %w", err)
	}
	out := make([]Mark, 0, len(rows))
	for _, r := range rows {
		m := Mark{
			ID: r.ID, Institution: r.InstitutionID, Term: r.TermID, TermName: r.TermName,
			Student: r.StudentID, StudentName: r.StudentName, RecordDate: r.RecordDate.Time.Format(time.DateOnly),
			Status: r.Status, CreatedAt: r.CreatedAt.Time,
		}
		if r.RecordedByID.Valid {
			m.RecordedBy = &r.RecordedByID.Int64
		}
		if r.RecorderName.Valid {
			m.RecorderName = &r.RecorderName.String
		}
		if r.Notes.Valid {
			m.Notes = &r.Notes.String
		}
		out = append(out, m)
	}
	return out, count, nil
}

func optional(v *int64) pgtype.Int8 {
	if v == nil {
		return pgtype.Int8{}
	}
	return pgtype.Int8{Int64: *v, Valid: true}
}

func toClass(r dbgen.GetVisibleClassRow) Class {
	c := Class{
		ID: r.ID, Institution: r.InstitutionID, SubjectName: r.SubjectName, ClassLevel: r.ClassLevelID,
		ClassLevelName: r.ClassLevelName, Teacher: r.TeacherID, TeacherName: r.TeacherName, Title: r.Title,
		Visibility: r.Visibility, IsPublished: r.IsPublished, CreatedAt: r.CreatedAt.Time,
	}
	if r.InstitutionSubjectID.Valid {
		c.Subject = &r.InstitutionSubjectID.Int64
	}
	return c
}
