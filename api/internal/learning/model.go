// Package learning serves assignments, submissions and grades: the loop where
// a teacher assigns work, a student submits it, the teacher grades it, and the
// student and their parents see the result.
package learning

import (
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

var (
	ErrNotFound         = errors.New("not found")
	ErrAlreadySubmitted = errors.New("already submitted")
	ErrScoreTooHigh     = errors.New("score is above the assignment's maximum")
)

// JSON shapes match the Django serializers so existing clients keep working.
// Decimals are strings with two places, as Django REST Framework sends them.

type Question struct {
	ID            int64           `json:"id"`
	Type          string          `json:"type"`
	Content       string          `json:"content"`
	Marks         string          `json:"marks"`
	Order         int32           `json:"order"`
	Options       json.RawMessage `json:"options"`
	CorrectAnswer *string         `json:"correct_answer,omitempty"` // staff only
}

type Assessment struct {
	ID           int64      `json:"id"`
	Title        string     `json:"title"`
	Instructions string     `json:"instructions"`
	Type         string     `json:"type"`
	Source       string     `json:"source"`
	MaxScore     string     `json:"max_score"`
	IsPublished  bool       `json:"is_published"`
	CreatedAt    time.Time  `json:"created_at"`
	CreatedBy    *int64     `json:"created_by"`
	TargetGroup  *int64     `json:"target_group"`
	Term         *int64     `json:"term"`
	Topic        *int64     `json:"topic"`
	Window       *int64     `json:"window"`
	Questions    []Question `json:"questions"`
}

type Submission struct {
	ID          int64           `json:"id"`
	Assessment  int64           `json:"assessment"`
	Student     int64           `json:"student"`
	Status      string          `json:"status"`
	SubmittedAt *time.Time      `json:"submitted_at"`
	AnswersData json.RawMessage `json:"answers_data"`
	TotalScore  *string         `json:"total_score"`
	// Extra context for the apps; Django didn't send these.
	AssessmentTitle string `json:"assessment_title,omitempty"`
	StudentName     string `json:"student_name,omitempty"`
}

type Grade struct {
	ID              int64     `json:"id"`
	Submission      int64     `json:"submission"`
	Score           string    `json:"score"`
	TeacherFeedback *string   `json:"teacher_feedback"`
	GradedAt        time.Time `json:"graded_at"`
	// Extra context for the apps; Django didn't send these.
	Assessment      int64  `json:"assessment,omitempty"`
	AssessmentTitle string `json:"assessment_title,omitempty"`
	MaxScore        string `json:"max_score,omitempty"`
	Student         int64  `json:"student,omitempty"`
	StudentName     string `json:"student_name,omitempty"`
}

// NewAssessment is what a teacher sends to create an assignment.
type NewAssessment struct {
	Title        string
	Instructions string
	Type         string
	MaxScore     float64
	IsPublished  bool
	CreatedBy    int64
}

// ---- decimals ---------------------------------------------------------------

const maxDecimal = 999.99 // numeric(5,2)

// parseScore accepts "85", "85.5" or a JSON number and returns it rounded to cents.
func parseScore(raw json.RawMessage) (float64, error) {
	s := strings.Trim(strings.TrimSpace(string(raw)), `"`)
	f, err := strconv.ParseFloat(s, 64)
	if err != nil || math.IsNaN(f) || math.IsInf(f, 0) {
		return 0, fmt.Errorf("must be a number")
	}
	f = math.Round(f*100) / 100
	if f < 0 || f > maxDecimal {
		return 0, fmt.Errorf("must be between 0 and %.2f", maxDecimal)
	}
	return f, nil
}

func toNumeric(f float64) (pgtype.Numeric, error) {
	var n pgtype.Numeric
	if err := n.Scan(strconv.FormatFloat(f, 'f', 2, 64)); err != nil {
		return n, fmt.Errorf("convert decimal: %w", err)
	}
	return n, nil
}

func fromNumeric(n pgtype.Numeric) float64 {
	f, err := n.Float64Value()
	if err != nil || !f.Valid {
		return 0
	}
	return f.Float64
}

func decimalString(n pgtype.Numeric) string {
	return strconv.FormatFloat(fromNumeric(n), 'f', 2, 64)
}

func optionalDecimal(n pgtype.Numeric) *string {
	if !n.Valid {
		return nil
	}
	s := decimalString(n)
	return &s
}

func optionalID(v pgtype.Int8) *int64 {
	if !v.Valid {
		return nil
	}
	return &v.Int64
}

func optionalTime(v pgtype.Timestamptz) *time.Time {
	if !v.Valid {
		return nil
	}
	return &v.Time
}

func optionalText(v pgtype.Text) *string {
	if !v.Valid {
		return nil
	}
	return &v.String
}
