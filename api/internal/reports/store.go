package reports

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/O-Mario88/maple-online-School/api/internal/httpx"
	"github.com/O-Mario88/maple-online-School/api/internal/platform/dbgen"
)

var (
	ErrNotFound        = errors.New("not found")
	ErrNoTerm          = errors.New("no term")
	ErrNotEnrolled     = errors.New("student not enrolled")
	ErrReportPublished = errors.New("report already published")
)

// ClassInfo is what the handler needs to decide who may act on a class.
type ClassInfo struct {
	ID, Institution, Teacher int64
	Title                    string
}

// SubjectMark matches the fields of the Django SubjectGrade model.
type SubjectMark struct {
	ID             int64     `json:"id"`
	Student        int64     `json:"student"`
	StudentName    string    `json:"student_name"`
	AssignedClass  int64     `json:"assigned_class"`
	ClassTitle     string    `json:"class_title"`
	Term           int64     `json:"term"`
	TermName       string    `json:"term_name"`
	FormativeScore string    `json:"formative_score"`
	SummativeScore string    `json:"summative_score"`
	TotalScore     *string   `json:"total_score"`
	GradeLetter    *string   `json:"grade_letter"`
	Descriptor     *string   `json:"descriptor"`
	TeacherRemarks *string   `json:"teacher_remarks"`
	FinalizedBy    *int64    `json:"finalized_by"`
	FinalizedAt    time.Time `json:"finalized_at"`
}

// Report matches the Django ReportCardSerializer, plus the subjects on a detail view.
type Report struct {
	ID                  int64         `json:"id"`
	Institution         int64         `json:"institution"`
	Student             int64         `json:"student"`
	StudentName         string        `json:"student_name"`
	Term                int64         `json:"term"`
	TermName            string        `json:"term_name"`
	OverallScore        *string       `json:"overall_score"`
	OverallGradeLetter  *string       `json:"overall_grade_letter"`
	PromotionStatus     *string       `json:"promotion_status"`
	ClassTeacherRemarks *string       `json:"class_teacher_remarks"`
	HeadteacherRemarks  *string       `json:"headteacher_remarks"`
	IsPublished         bool          `json:"is_published"`
	PublishedAt         *time.Time    `json:"published_at"`
	GeneratedAt         time.Time     `json:"generated_at"`
	Subjects            []SubjectMark `json:"subjects,omitempty"`
}

// MarkEntry is one student's scores for a class this term.
type MarkEntry struct {
	Student              int64
	Formative, Summative float64
	Remarks              *string
}

// Filter narrows a listing.
type Filter struct {
	Class, Term, Student *int64
}

// ReportChange holds the fields a PATCH may change (nil = unchanged).
type ReportChange struct {
	ClassTeacherRemarks, HeadteacherRemarks, PromotionStatus *string
	IsPublished                                              *bool
}

// PostgresStore implements Store.
type PostgresStore struct {
	pool *pgxpool.Pool
	q    *dbgen.Queries
}

// NewPostgresStore wraps the connection pool.
func NewPostgresStore(pool *pgxpool.Pool) *PostgresStore {
	return &PostgresStore{pool: pool, q: dbgen.New(pool)}
}

func (s *PostgresStore) SchoolsWithRoles(ctx context.Context, userID int64, rs []string) ([]int64, error) {
	ids, err := s.q.StaffSchoolIDs(ctx, dbgen.StaffSchoolIDsParams{UserID: userID, StaffRoles: rs})
	if err != nil {
		return nil, fmt.Errorf("load schools: %w", err)
	}
	return ids, nil
}

func (s *PostgresStore) Class(ctx context.Context, id int64) (ClassInfo, error) {
	row, err := s.q.ClassBasics(ctx, id)
	if errors.Is(err, pgx.ErrNoRows) {
		return ClassInfo{}, ErrNotFound
	}
	if err != nil {
		return ClassInfo{}, fmt.Errorf("load class: %w", err)
	}
	return ClassInfo{ID: row.ID, Institution: row.InstitutionID, Teacher: row.TeacherID, Title: row.Title}, nil
}

// Term returns the requested term if it belongs to the school, or the current one.
func (s *PostgresStore) Term(ctx context.Context, school int64, requested *int64) (int64, error) {
	if requested != nil {
		ok, err := s.q.TermInSchool(ctx, dbgen.TermInSchoolParams{ID: *requested, InstitutionID: school})
		if err != nil {
			return 0, fmt.Errorf("check term: %w", err)
		}
		if !ok {
			return 0, ErrNoTerm
		}
		return *requested, nil
	}
	id, err := s.q.ActiveTerm(ctx, dbgen.ActiveTermParams{InstitutionID: school, OnDate: pgtype.Date{Time: time.Now(), Valid: true}})
	if errors.Is(err, pgx.ErrNoRows) {
		return 0, ErrNoTerm
	}
	if err != nil {
		return 0, fmt.Errorf("find term: %w", err)
	}
	return id, nil
}

// SaveMarks records every entry or none. Marks behind a published report are locked.
func (s *PostgresStore) SaveMarks(ctx context.Context, c ClassInfo, term int64, entries []MarkEntry, by int64) error {
	return pgx.BeginFunc(ctx, s.pool, func(tx pgx.Tx) error {
		q := s.q.WithTx(tx)
		roster, err := q.ActiveRosterIDs(ctx, c.ID)
		if err != nil {
			return fmt.Errorf("load roster: %w", err)
		}
		enrolled := make(map[int64]bool, len(roster))
		for _, id := range roster {
			enrolled[id] = true
		}
		for _, e := range entries {
			if !enrolled[e.Student] {
				return ErrNotEnrolled
			}
			published, err := q.ReportPublished(ctx, dbgen.ReportPublishedParams{StudentID: e.Student, TermID: term})
			if err != nil {
				return fmt.Errorf("check report: %w", err)
			}
			if published {
				return ErrReportPublished
			}
			result := Band(e.Formative + e.Summative)
			params := dbgen.UpsertSubjectGradeParams{
				StudentID: e.Student, AssignedClassID: c.ID, TermID: term,
				FormativeScore: numeric(e.Formative), SummativeScore: numeric(e.Summative), TotalScore: numeric(result.Total),
				GradeLetter: text(&result.Grade), Descriptor: text(&result.Descriptor), TeacherRemarks: text(e.Remarks),
				FinalizedByID: pgtype.Int8{Int64: by, Valid: true},
			}
			if err := q.UpsertSubjectGrade(ctx, params); err != nil {
				return fmt.Errorf("save mark: %w", err)
			}
		}
		return nil
	})
}

// Generate creates or refreshes draft report cards for the class's students.
// It returns how many were written and how many were already published.
func (s *PostgresStore) Generate(ctx context.Context, c ClassInfo, term int64) (int, int, error) {
	written, skipped := 0, 0
	err := pgx.BeginFunc(ctx, s.pool, func(tx pgx.Tx) error {
		q := s.q.WithTx(tx)
		roster, err := q.ActiveRosterIDs(ctx, c.ID)
		if err != nil {
			return fmt.Errorf("load roster: %w", err)
		}
		for _, student := range roster {
			avg, err := q.StudentTermAverage(ctx, dbgen.StudentTermAverageParams{StudentID: student, TermID: term, InstitutionID: c.Institution})
			if err != nil {
				return fmt.Errorf("average: %w", err)
			}
			params := dbgen.UpsertDraftReportParams{InstitutionID: c.Institution, StudentID: student, TermID: term}
			if avg.Subjects > 0 {
				result := Band(avg.Average)
				params.OverallScore, params.OverallGradeLetter = numeric(result.Total), text(&result.Grade)
			}
			n, err := q.UpsertDraftReport(ctx, params)
			if err != nil {
				return fmt.Errorf("save report: %w", err)
			}
			if n == 0 {
				skipped++
			} else {
				written++
			}
		}
		return nil
	})
	return written, skipped, err
}

func (s *PostgresStore) ListMarks(ctx context.Context, staff, learners []int64, f Filter, page httpx.Page) ([]SubjectMark, int64, error) {
	count, err := s.q.CountSubjectMarks(ctx, dbgen.CountSubjectMarksParams{StaffSchools: staff, LearnerIds: learners, ClassID: opt(f.Class), TermID: opt(f.Term), StudentID: opt(f.Student)})
	if err != nil {
		return nil, 0, fmt.Errorf("count marks: %w", err)
	}
	rows, err := s.q.ListSubjectMarks(ctx, dbgen.ListSubjectMarksParams{
		StaffSchools: staff, LearnerIds: learners, ClassID: opt(f.Class), TermID: opt(f.Term), StudentID: opt(f.Student),
		PageLimit: page.Limit, PageOffset: page.Offset,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("list marks: %w", err)
	}
	out := make([]SubjectMark, 0, len(rows))
	for _, r := range rows {
		out = append(out, SubjectMark{
			ID: r.ID, Student: r.StudentID, StudentName: r.StudentName, AssignedClass: r.AssignedClassID, ClassTitle: r.ClassTitle,
			Term: r.TermID, TermName: r.TermName, FormativeScore: decimal(r.FormativeScore), SummativeScore: decimal(r.SummativeScore),
			TotalScore: optDecimal(r.TotalScore), GradeLetter: optText(r.GradeLetter), Descriptor: optText(r.Descriptor),
			TeacherRemarks: optText(r.TeacherRemarks), FinalizedBy: optID(r.FinalizedByID), FinalizedAt: r.FinalizedAt.Time,
		})
	}
	return out, count, nil
}

func (s *PostgresStore) ListReports(ctx context.Context, staff, learners []int64, f Filter, page httpx.Page) ([]Report, int64, error) {
	count, err := s.q.CountReports(ctx, dbgen.CountReportsParams{StaffSchools: staff, LearnerIds: learners, TermID: opt(f.Term), StudentID: opt(f.Student)})
	if err != nil {
		return nil, 0, fmt.Errorf("count reports: %w", err)
	}
	rows, err := s.q.ListReports(ctx, dbgen.ListReportsParams{
		StaffSchools: staff, LearnerIds: learners, TermID: opt(f.Term), StudentID: opt(f.Student), PageLimit: page.Limit, PageOffset: page.Offset,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("list reports: %w", err)
	}
	out := make([]Report, 0, len(rows))
	for _, r := range rows {
		out = append(out, toReport(dbgen.GetReportRow(r)))
	}
	return out, count, nil
}

// GetReport returns a visible report with its subject marks.
func (s *PostgresStore) GetReport(ctx context.Context, staff, learners []int64, id int64) (Report, error) {
	row, err := s.q.GetReport(ctx, dbgen.GetReportParams{ID: id, StaffSchools: staff, LearnerIds: learners})
	if errors.Is(err, pgx.ErrNoRows) {
		return Report{}, ErrNotFound
	}
	if err != nil {
		return Report{}, fmt.Errorf("get report: %w", err)
	}
	r := toReport(row)
	// The report is visible, so the student's marks for that term are too.
	subjects, _, err := s.ListMarks(ctx, []int64{r.Institution}, nil, Filter{Term: &r.Term, Student: &r.Student}, httpx.Page{Number: 1, Limit: 100})
	if err != nil {
		return Report{}, err
	}
	r.Subjects = subjects
	return r, nil
}

func (s *PostgresStore) UpdateReport(ctx context.Context, id int64, c ReportChange) error {
	params := dbgen.UpdateReportParams{
		ID: id, ClassTeacherRemarks: text(c.ClassTeacherRemarks), HeadteacherRemarks: text(c.HeadteacherRemarks),
		PromotionStatus: text(c.PromotionStatus),
	}
	if c.IsPublished != nil {
		params.IsPublished = pgtype.Bool{Bool: *c.IsPublished, Valid: true}
	}
	if err := s.q.UpdateReport(ctx, params); err != nil {
		return fmt.Errorf("update report: %w", err)
	}
	return nil
}

// ---- conversions ---------------------------------------------------------------

func toReport(r dbgen.GetReportRow) Report {
	out := Report{
		ID: r.ID, Institution: r.InstitutionID, Student: r.StudentID, StudentName: r.StudentName, Term: r.TermID, TermName: r.TermName,
		OverallScore: optDecimal(r.OverallScore), OverallGradeLetter: optText(r.OverallGradeLetter), PromotionStatus: optText(r.PromotionStatus),
		ClassTeacherRemarks: optText(r.ClassTeacherRemarks), HeadteacherRemarks: optText(r.HeadteacherRemarks),
		IsPublished: r.IsPublished, GeneratedAt: r.GeneratedAt.Time,
	}
	if r.PublishedAt.Valid {
		out.PublishedAt = &r.PublishedAt.Time
	}
	return out
}

func numeric(f float64) pgtype.Numeric {
	var n pgtype.Numeric
	_ = n.Scan(strconv.FormatFloat(f, 'f', 2, 64)) // a formatted float always scans
	return n
}

func decimal(n pgtype.Numeric) string {
	f, err := n.Float64Value()
	if err != nil || !f.Valid {
		return "0.00"
	}
	return strconv.FormatFloat(f.Float64, 'f', 2, 64)
}

func optDecimal(n pgtype.Numeric) *string {
	if !n.Valid {
		return nil
	}
	s := decimal(n)
	return &s
}

func text(s *string) pgtype.Text {
	if s == nil {
		return pgtype.Text{}
	}
	return pgtype.Text{String: *s, Valid: true}
}

func optText(t pgtype.Text) *string {
	if !t.Valid {
		return nil
	}
	return &t.String
}

func optID(v pgtype.Int8) *int64 {
	if !v.Valid {
		return nil
	}
	return &v.Int64
}

func opt(v *int64) pgtype.Int8 {
	if v == nil {
		return pgtype.Int8{}
	}
	return pgtype.Int8{Int64: *v, Valid: true}
}
