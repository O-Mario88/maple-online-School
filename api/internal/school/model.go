// Package school serves classes, enrolment and the daily register.
package school

import (
	"errors"
	"slices"
	"time"
)

var (
	ErrNotFound      = errors.New("not found")
	ErrNoTerm        = errors.New("no academic term covers this date")
	ErrNotEnrolled   = errors.New("student is not enrolled in this class")
	ErrInvalidMember = errors.New("person is not an active member of this school")
	ErrInvalidLevel  = errors.New("class level does not exist")
)

// Statuses a register mark can have. They match the Django model's choices.
var Statuses = []string{"present", "late", "authorized_absent", "unauthorized_absent"}

// Viewer is the signed-in person and the schools and learners they can see.
type Viewer struct {
	UserID   int64
	Leader   []int64 // schools they lead
	Teacher  []int64 // schools they teach in
	Staff    []int64 // schools they work in (any staff role)
	Learners []int64 // themselves if a student, plus approved children if a parent
}

// Leads reports whether the viewer leads school.
func (v Viewer) Leads(school int64) bool { return slices.Contains(v.Leader, school) }

// CanRun reports whether the viewer may manage a class: its teacher or a leader of its school.
func (v Viewer) CanRun(c Class) bool { return c.Teacher == v.UserID || v.Leads(c.Institution) }

// Class matches the Django ClassSerializer's fields.
type Class struct {
	ID             int64     `json:"id"`
	Institution    int64     `json:"institution"`
	Subject        *int64    `json:"subject"`
	SubjectName    string    `json:"subject_name"`
	ClassLevel     int64     `json:"class_level"`
	ClassLevelName string    `json:"class_level_name"`
	Teacher        int64     `json:"teacher"`
	TeacherName    string    `json:"teacher_name"`
	Title          string    `json:"title"`
	Visibility     string    `json:"visibility"`
	IsPublished    bool      `json:"is_published"`
	CreatedAt      time.Time `json:"created_at"`
}

type RosterEntry struct {
	Enrollment  int64     `json:"enrollment"`
	Student     int64     `json:"student"`
	StudentName string    `json:"student_name"`
	EnrolledAt  time.Time `json:"enrolled_at"`
}

// Enrollment matches the Django ClassEnrollmentSerializer's fields.
type Enrollment struct {
	ID            int64     `json:"id"`
	EnrolledClass int64     `json:"enrolled_class"`
	ClassTitle    string    `json:"class_title,omitempty"`
	Student       int64     `json:"student"`
	StudentName   string    `json:"student_name,omitempty"`
	Status        string    `json:"status"`
	EnrolledAt    time.Time `json:"enrolled_at"`
}

// Mark is one daily register entry; fields match the Django DailyRegisterSerializer.
type Mark struct {
	ID           int64     `json:"id"`
	Institution  int64     `json:"institution"`
	Term         int64     `json:"term"`
	TermName     string    `json:"term_name"`
	Student      int64     `json:"student"`
	StudentName  string    `json:"student_name"`
	RecordDate   string    `json:"record_date"`
	Status       string    `json:"status"`
	RecordedBy   *int64    `json:"recorded_by"`
	RecorderName *string   `json:"recorder_name"`
	Notes        *string   `json:"notes"`
	CreatedAt    time.Time `json:"created_at"`
}

// NewClass is what a leader sends to create a class.
type NewClass struct {
	Title       string
	Institution int64
	ClassLevel  int64
	Teacher     int64
	IsPublished bool
}

// Entry is one student's mark in a register being saved.
type Entry struct {
	Student int64
	Status  string
	Notes   *string
}

// MarkFilter narrows a register listing.
type MarkFilter struct {
	Date    *time.Time
	Student *int64
	Class   *int64
}
