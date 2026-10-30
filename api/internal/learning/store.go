package learning

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/O-Mario88/maple-online-School/api/internal/platform/dbgen"
	"github.com/O-Mario88/maple-online-School/api/internal/roles"
)

// Scope describes which schools a signed-in person can act in.
type Scope struct {
	UserID       int64
	ActiveSchool []int64 // any active membership
	StaffSchool  []int64 // active membership with a staff role
}

// IsStaff reports whether the person teaches or administers in any school.
func (s Scope) IsStaff() bool { return len(s.StaffSchool) > 0 }

// PostgresStore implements Store.
type PostgresStore struct {
	pool *pgxpool.Pool
	q    *dbgen.Queries
}

// NewPostgresStore wraps the connection pool.
func NewPostgresStore(pool *pgxpool.Pool) *PostgresStore {
	return &PostgresStore{pool: pool, q: dbgen.New(pool)}
}

func (s *PostgresStore) Scope(ctx context.Context, userID int64) (Scope, error) {
	active, err := s.q.ActiveSchoolIDs(ctx, userID)
	if err != nil {
		return Scope{}, fmt.Errorf("load schools: %w", err)
	}
	staff, err := s.q.StaffSchoolIDs(ctx, dbgen.StaffSchoolIDsParams{UserID: userID, StaffRoles: roles.Staff})
	if err != nil {
		return Scope{}, fmt.Errorf("load staff schools: %w", err)
	}
	return Scope{UserID: userID, ActiveSchool: active, StaffSchool: staff}, nil
}

// ---- assignments --------------------------------------------------------------

func (s *PostgresStore) ListAssessments(ctx context.Context, sc Scope, publishedOnly, withAnswers bool, page Paging) ([]Assessment, int64, error) {
	viewer := pgtype.Int8{Int64: sc.UserID, Valid: true}
	count, err := s.q.CountVisibleAssessments(ctx, dbgen.CountVisibleAssessmentsParams{
		ViewerID: viewer, SchoolIds: sc.ActiveSchool, PublishedOnly: publishedOnly,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("count assignments: %w", err)
	}
	rows, err := s.q.ListVisibleAssessments(ctx, dbgen.ListVisibleAssessmentsParams{
		ViewerID: viewer, SchoolIds: sc.ActiveSchool, PublishedOnly: publishedOnly,
		PageLimit: page.Limit, PageOffset: page.Offset,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("list assignments: %w", err)
	}
	out := make([]Assessment, 0, len(rows))
	for _, r := range rows {
		out = append(out, toAssessment(r))
	}
	if err := s.attachQuestions(ctx, out, withAnswers); err != nil {
		return nil, 0, err
	}
	return out, count, nil
}

func (s *PostgresStore) GetAssessment(ctx context.Context, sc Scope, id int64, publishedOnly, withAnswers bool) (Assessment, error) {
	row, err := s.q.GetVisibleAssessment(ctx, dbgen.GetVisibleAssessmentParams{
		ID: id, ViewerID: pgtype.Int8{Int64: sc.UserID, Valid: true}, SchoolIds: sc.ActiveSchool, PublishedOnly: publishedOnly,
	})
	if errors.Is(err, pgx.ErrNoRows) {
		return Assessment{}, ErrNotFound
	}
	if err != nil {
		return Assessment{}, fmt.Errorf("get assignment: %w", err)
	}
	out := []Assessment{toAssessment(dbgen.ListVisibleAssessmentsRow(row))}
	if err := s.attachQuestions(ctx, out, withAnswers); err != nil {
		return Assessment{}, err
	}
	return out[0], nil
}

func (s *PostgresStore) CreateAssessment(ctx context.Context, in NewAssessment) (Assessment, error) {
	maxScore, err := toNumeric(in.MaxScore)
	if err != nil {
		return Assessment{}, err
	}
	row, err := s.q.CreateAssessment(ctx, dbgen.CreateAssessmentParams{
		Title: in.Title, Instructions: in.Instructions, Type: in.Type, Source: "manual_school_test",
		MaxScore: maxScore, IsPublished: in.IsPublished, CreatedByID: pgtype.Int8{Int64: in.CreatedBy, Valid: true},
	})
	if err != nil {
		return Assessment{}, fmt.Errorf("create assignment: %w", err)
	}
	a := toAssessment(dbgen.ListVisibleAssessmentsRow(row))
	a.Questions = []Question{}
	return a, nil
}

func (s *PostgresStore) attachQuestions(ctx context.Context, list []Assessment, withAnswers bool) error {
	if len(list) == 0 {
		return nil
	}
	idx := make(map[int64]int, len(list))
	ids := make([]int64, 0, len(list))
	for i := range list {
		list[i].Questions = []Question{}
		idx[list[i].ID] = i
		ids = append(ids, list[i].ID)
	}
	rows, err := s.q.ListQuestions(ctx, ids)
	if err != nil {
		return fmt.Errorf("list questions: %w", err)
	}
	for _, r := range rows {
		q := Question{ID: r.ID, Type: r.Type, Content: r.Content, Marks: decimalString(r.Marks), Order: r.Order, Options: json.RawMessage(r.Options)}
		if withAnswers {
			answer := r.CorrectAnswer
			q.CorrectAnswer = &answer
		}
		i := idx[r.AssessmentID]
		list[i].Questions = append(list[i].Questions, q)
	}
	return nil
}

// ---- submissions --------------------------------------------------------------

func (s *PostgresStore) ListStudentSubmissions(ctx context.Context, studentID int64, page Paging) ([]Submission, int64, error) {
	count, err := s.q.CountStudentSubmissions(ctx, studentID)
	if err != nil {
		return nil, 0, fmt.Errorf("count submissions: %w", err)
	}
	rows, err := s.q.ListStudentSubmissions(ctx, dbgen.ListStudentSubmissionsParams{StudentID: studentID, PageLimit: page.Limit, PageOffset: page.Offset})
	if err != nil {
		return nil, 0, fmt.Errorf("list submissions: %w", err)
	}
	out := make([]Submission, 0, len(rows))
	for _, r := range rows {
		out = append(out, withSubmissionContext(r))
	}
	return out, count, nil
}

func (s *PostgresStore) ListStaffSubmissions(ctx context.Context, schools []int64, page Paging) ([]Submission, int64, error) {
	count, err := s.q.CountStaffSubmissions(ctx, schools)
	if err != nil {
		return nil, 0, fmt.Errorf("count submissions: %w", err)
	}
	rows, err := s.q.ListStaffSubmissions(ctx, dbgen.ListStaffSubmissionsParams{SchoolIds: schools, PageLimit: page.Limit, PageOffset: page.Offset})
	if err != nil {
		return nil, 0, fmt.Errorf("list submissions: %w", err)
	}
	out := make([]Submission, 0, len(rows))
	for _, r := range rows {
		out = append(out, withSubmissionContext(dbgen.ListStudentSubmissionsRow(r)))
	}
	return out, count, nil
}

// Submit records a student's answers once. Multiple-choice questions are
// marked straight away; anything else waits for the teacher.
func (s *PostgresStore) Submit(ctx context.Context, a Assessment, studentID int64, answers map[string]json.RawMessage) (Submission, error) {
	var out Submission
	err := pgx.BeginFunc(ctx, s.pool, func(tx pgx.Tx) error {
		q := s.q.WithTx(tx)
		key := "submission:" + strconv.FormatInt(a.ID, 10) + ":" + strconv.FormatInt(studentID, 10)
		if err := q.LockStudentAssessment(ctx, key); err != nil {
			return fmt.Errorf("lock submission: %w", err)
		}
		exists, err := q.SubmissionExists(ctx, dbgen.SubmissionExistsParams{AssessmentID: a.ID, StudentID: studentID})
		if err != nil {
			return fmt.Errorf("check submission: %w", err)
		}
		if exists {
			return ErrAlreadySubmitted
		}
		status, total, err := autoMark(ctx, q, a.ID, answers)
		if err != nil {
			return err
		}
		body, err := json.Marshal(answers)
		if err != nil {
			return fmt.Errorf("encode answers: %w", err)
		}
		row, err := q.CreateSubmission(ctx, dbgen.CreateSubmissionParams{
			AssessmentID: a.ID, StudentID: studentID, Status: status, AnswersData: body, TotalScore: total,
		})
		if err != nil {
			return fmt.Errorf("create submission: %w", err)
		}
		out = toSubmission(row)
		return nil
	})
	return out, err
}

// autoMark scores multiple-choice questions. A submission is only marked
// "graded" when every question is multiple choice and there is at least one.
func autoMark(ctx context.Context, q *dbgen.Queries, assessmentID int64, answers map[string]json.RawMessage) (string, pgtype.Numeric, error) {
	questions, err := q.ListQuestions(ctx, []int64{assessmentID})
	if err != nil {
		return "", pgtype.Numeric{}, fmt.Errorf("list questions: %w", err)
	}
	if len(questions) == 0 {
		return "submitted", pgtype.Numeric{}, nil
	}
	total, objective := 0.0, true
	for _, qu := range questions {
		if qu.Type != "mcq" {
			objective = false
			continue
		}
		var given string
		if raw, ok := answers[strconv.FormatInt(qu.ID, 10)]; ok && json.Unmarshal(raw, &given) == nil && given == qu.CorrectAnswer {
			total += fromNumeric(qu.Marks)
		}
	}
	score, err := toNumeric(total)
	if err != nil {
		return "", pgtype.Numeric{}, err
	}
	if objective {
		return "graded", score, nil
	}
	return "submitted", score, nil
}

// ---- grades -------------------------------------------------------------------

func (s *PostgresStore) ListStudentGrades(ctx context.Context, students []int64, page Paging) ([]Grade, int64, error) {
	count, err := s.q.CountStudentGrades(ctx, students)
	if err != nil {
		return nil, 0, fmt.Errorf("count grades: %w", err)
	}
	rows, err := s.q.ListStudentGrades(ctx, dbgen.ListStudentGradesParams{StudentIds: students, PageLimit: page.Limit, PageOffset: page.Offset})
	if err != nil {
		return nil, 0, fmt.Errorf("list grades: %w", err)
	}
	out := make([]Grade, 0, len(rows))
	for _, r := range rows {
		out = append(out, withGradeContext(dbgen.ListStaffGradesRow(r)))
	}
	return out, count, nil
}

func (s *PostgresStore) ListStaffGrades(ctx context.Context, schools []int64, page Paging) ([]Grade, int64, error) {
	count, err := s.q.CountStaffGrades(ctx, schools)
	if err != nil {
		return nil, 0, fmt.Errorf("count grades: %w", err)
	}
	rows, err := s.q.ListStaffGrades(ctx, dbgen.ListStaffGradesParams{SchoolIds: schools, PageLimit: page.Limit, PageOffset: page.Offset})
	if err != nil {
		return nil, 0, fmt.Errorf("list grades: %w", err)
	}
	out := make([]Grade, 0, len(rows))
	for _, r := range rows {
		out = append(out, withGradeContext(r))
	}
	return out, count, nil
}

// Grade records or updates the grade for a submission the staff member can
// reach, and marks the submission graded. It reports whether it was new.
func (s *PostgresStore) Grade(ctx context.Context, staffSchools []int64, submissionID int64, score float64, feedback *string) (Grade, bool, error) {
	var (
		out     Grade
		created bool
	)
	err := pgx.BeginFunc(ctx, s.pool, func(tx pgx.Tx) error {
		q := s.q.WithTx(tx)
		sub, err := q.GetSubmissionForGrading(ctx, dbgen.GetSubmissionForGradingParams{SubmissionID: submissionID, SchoolIds: staffSchools})
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrNotFound
		}
		if err != nil {
			return fmt.Errorf("load submission: %w", err)
		}
		if score > fromNumeric(sub.MaxScore) {
			return ErrScoreTooHigh
		}
		value, err := toNumeric(score)
		if err != nil {
			return err
		}
		text := pgtype.Text{}
		if feedback != nil {
			text = pgtype.Text{String: *feedback, Valid: true}
		}
		row, err := q.UpsertGrade(ctx, dbgen.UpsertGradeParams{SubmissionID: submissionID, Score: value, TeacherFeedback: text})
		if err != nil {
			return fmt.Errorf("save grade: %w", err)
		}
		if err := q.MarkSubmissionGraded(ctx, submissionID); err != nil {
			return fmt.Errorf("mark graded: %w", err)
		}
		out = Grade{ID: row.ID, Submission: row.SubmissionID, Score: decimalString(row.Score), TeacherFeedback: optionalText(row.TeacherFeedback), GradedAt: row.GradedAt.Time}
		created = row.Created
		return nil
	})
	return out, created, err
}

// ---- row conversion -----------------------------------------------------------

func toAssessment(r dbgen.ListVisibleAssessmentsRow) Assessment {
	return Assessment{
		ID: r.ID, Title: r.Title, Instructions: r.Instructions, Type: r.Type, Source: r.Source,
		MaxScore: decimalString(r.MaxScore), IsPublished: r.IsPublished, CreatedAt: r.CreatedAt.Time,
		CreatedBy: optionalID(r.CreatedByID), TargetGroup: optionalID(r.TargetGroupID),
		Term: optionalID(r.TermID), Topic: optionalID(r.TopicID), Window: optionalID(r.WindowID),
	}
}

func toSubmission(r dbgen.CreateSubmissionRow) Submission {
	return Submission{
		ID: r.ID, Assessment: r.AssessmentID, Student: r.StudentID, Status: r.Status,
		SubmittedAt: optionalTime(r.SubmittedAt), AnswersData: json.RawMessage(r.AnswersData),
		TotalScore: optionalDecimal(r.TotalScore),
	}
}

func withSubmissionContext(r dbgen.ListStudentSubmissionsRow) Submission {
	sub := toSubmission(dbgen.CreateSubmissionRow{
		ID: r.ID, AssessmentID: r.AssessmentID, StudentID: r.StudentID, Status: r.Status,
		SubmittedAt: r.SubmittedAt, AnswersData: r.AnswersData, TotalScore: r.TotalScore,
	})
	sub.AssessmentTitle, sub.StudentName = r.AssessmentTitle, r.StudentName
	return sub
}

func withGradeContext(r dbgen.ListStaffGradesRow) Grade {
	return Grade{
		ID: r.ID, Submission: r.SubmissionID, Score: decimalString(r.Score),
		TeacherFeedback: optionalText(r.TeacherFeedback), GradedAt: r.GradedAt.Time,
		Assessment: r.AssessmentID, AssessmentTitle: r.AssessmentTitle, MaxScore: decimalString(r.MaxScore),
		Student: r.StudentID, StudentName: r.StudentName,
	}
}
