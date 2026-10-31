// Package lessons serves lesson plans for a class, their notes and
// recordings, and who attended each lesson.
package lessons

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/url"
	"slices"
	"strings"
	"time"
)

var (
	ErrNotFound = errors.New("not found")
	ErrInUse    = errors.New("lesson has history")
	ErrBadRef   = errors.New("unknown topic")
)

const (
	maxTitle        = 255
	maxURL          = 500
	maxRecordingSec = 24 * 60 * 60
	maxLessonMins   = 600
	draft           = "draft"
)

var (
	accessModes        = []string{draft, "published", "premium"}
	attendanceStatuses = []string{"present", "absent", "late"}
)

// Lesson matches Django's LessonSerializer, plus the class and topic names.
type Lesson struct {
	ID          int64      `json:"id"`
	Title       string     `json:"title"`
	AccessMode  string     `json:"access_mode"`
	ScheduledAt time.Time  `json:"scheduled_at"`
	PublishedAt *time.Time `json:"published_at"`
	CreatedAt   time.Time  `json:"created_at"`
	ParentClass int64      `json:"parent_class"`
	Topic       *int64     `json:"topic"`
	ClassTitle  string     `json:"class_title"`
	TopicName   string     `json:"topic_name"`

	school, teacher int64 // who may change it
}

type Note struct {
	ID            int64           `json:"id"`
	ContentBlocks json.RawMessage `json:"content_blocks"`
	CreatedAt     time.Time       `json:"created_at"`
	UpdatedAt     time.Time       `json:"updated_at"`
	Lesson        int64           `json:"lesson"`
}

type Recording struct {
	ID        int64     `json:"id"`
	URL       string    `json:"url"`
	Duration  int32     `json:"duration"`
	CreatedAt time.Time `json:"created_at"`
	Lesson    int64     `json:"lesson"`
}

type Attendance struct {
	ID              int64     `json:"id"`
	Status          string    `json:"status"`
	DurationMinutes int32     `json:"duration_minutes"`
	RecordedAt      time.Time `json:"recorded_at"`
	Lesson          int64     `json:"lesson"`
	Student         int64     `json:"student"`
	StudentName     string    `json:"student_name,omitempty"`
}

// Viewer is the signed-in person and the schools and learners they relate to.
type Viewer struct {
	UserID   int64
	Leaders  []int64
	Teachers []int64
	Learners []int64 // the student themself, or a parent's approved children
}

// manages reports whether the viewer plans lessons for a class: its own
// teacher, or a leader of its school.
func (v Viewer) manages(school, teacher int64) bool {
	return slices.Contains(v.Leaders, school) || (teacher == v.UserID && slices.Contains(v.Teachers, school))
}

// LessonFilter narrows the lesson list.
type LessonFilter struct {
	ParentClass, Topic *int64
	AccessMode         *string
}

// LessonInput is a create or PATCH body.
type LessonInput struct {
	ParentClass int64           `json:"parent_class"`
	Title       *string         `json:"title"`
	AccessMode  *string         `json:"access_mode"`
	ScheduledAt *string         `json:"scheduled_at"`
	Topic       json.RawMessage `json:"topic"`
}

// Draft is the full set of lesson fields Go writes.
type Draft struct {
	Title, AccessMode string
	ScheduledAt       time.Time
	Topic             *int64
}

func draftOf(l Lesson) Draft {
	return Draft{Title: l.Title, AccessMode: l.AccessMode, ScheduledAt: l.ScheduledAt, Topic: l.Topic}
}

// merge applies the body to d. It returns a message for a 400.
func (in LessonInput) merge(d Draft) (Draft, string) {
	if in.Title != nil {
		d.Title = strings.TrimSpace(*in.Title)
	}
	if in.AccessMode != nil {
		d.AccessMode = *in.AccessMode
	}
	if in.ScheduledAt != nil {
		t, err := time.Parse(time.RFC3339, *in.ScheduledAt)
		if err != nil {
			return d, "scheduled_at must be a date and time like 2026-11-02T09:00:00+03:00."
		}
		d.ScheduledAt = t
	}
	if msg := applyTopic(in.Topic, &d); msg != "" {
		return d, msg
	}
	switch {
	case d.Title == "" || len(d.Title) > maxTitle:
		return d, "Give the lesson a title of up to 255 characters."
	case d.ScheduledAt.IsZero():
		return d, "Say when the lesson is (scheduled_at)."
	case !slices.Contains(accessModes, d.AccessMode):
		return d, "access_mode must be draft, published or premium."
	}
	return d, ""
}

func applyTopic(raw json.RawMessage, d *Draft) string {
	if len(raw) == 0 {
		return ""
	}
	if bytes.Equal(raw, []byte("null")) {
		d.Topic = nil
		return ""
	}
	var id int64
	if err := json.Unmarshal(raw, &id); err != nil || id <= 0 {
		return "topic must be a topic id."
	}
	d.Topic = &id
	return ""
}

// validBlocks accepts a JSON object or list, as lesson notes are stored.
func validBlocks(raw json.RawMessage) bool {
	trimmed := bytes.TrimSpace(raw)
	return len(trimmed) > 0 && (trimmed[0] == '{' || trimmed[0] == '[') && json.Valid(trimmed)
}

func safeURL(s string) bool {
	u, err := url.Parse(s)
	return err == nil && (u.Scheme == "http" || u.Scheme == "https") && u.Host != "" && len(s) <= maxURL
}
