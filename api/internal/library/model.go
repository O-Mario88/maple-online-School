// Package library is Maple's one library (playbook section 5): notes,
// books, videos, past papers and links, with who may see what, review of
// platform-wide items, and each learner's progress.
package library

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
	ErrBadRef   = errors.New("unknown school, subject, topic or class level")
)

// Who can see an item.
const (
	Private     = "private"
	Class       = "class"
	Institution = "institution"
	Global      = "global"
)

// Where an item is in its life.
const (
	Published   = "published"
	UnderReview = "under_review"
	Rejected    = "rejected"
)

const (
	maxTitle       = 500
	maxDescription = 10_000
	maxURL         = 1_000
	maxLanguage    = 10
	maxReason      = 2_000
	maxActive      = 24 * 60 * 60
	platformAdmin  = "admin"
)

var scopes = []string{Private, Class, Institution, Global}

// contentTypes match Django's ContentItem.CONTENT_TYPE_CHOICES.
var contentTypes = []string{
	"notes", "textbook", "pdf", "document", "video", "slides", "worksheet", "assignment", "project",
	"activity", "revision", "teacher_guide", "lesson_attachment", "topic_resource", "class_resource",
	"library_resource", "mock_exam", "intervention", "other",
}

// Item is one library entry as the apps see it.
type Item struct {
	ID                string     `json:"id"`
	Title             string     `json:"title"`
	Description       string     `json:"description"`
	ContentType       string     `json:"content_type"`
	OwnerType         string     `json:"owner_type"`
	VisibilityScope   string     `json:"visibility_scope"`
	PublicationStatus string     `json:"publication_status"`
	ModerationStatus  string     `json:"moderation_status"`
	RejectionReason   string     `json:"rejection_reason"`
	FileURL           *string    `json:"file_url"`
	ExternalURL       string     `json:"external_url"`
	DurationSeconds   *int32     `json:"duration_seconds"`
	Language          string     `json:"language"`
	IsFeatured        bool       `json:"is_featured"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
	PublishedAt       *time.Time `json:"published_at"`
	ClassLevel        *int64     `json:"class_level"`
	OwnerInstitution  *int64     `json:"owner_institution"`
	Subject           *int64     `json:"subject"`
	Topic             *int64     `json:"topic"`
	UploadedBy        int64      `json:"uploaded_by"`
	UploaderName      string     `json:"uploader_name"`
	SubjectName       string     `json:"subject_name"`
	TopicName         string     `json:"topic_name"`
}

// Progress is one learner's progress on one item.
type Progress struct {
	ViewCount            int32      `json:"view_count"`
	ActiveTimeSeconds    int32      `json:"active_time_seconds"`
	CompletionPercentage string     `json:"completion_percentage"`
	LastPosition         int32      `json:"last_position"`
	IsCompleted          bool       `json:"is_completed"`
	Status               string     `json:"status"`
	FirstAccessed        *time.Time `json:"first_accessed"`
	LastAccessed         *time.Time `json:"last_accessed"`
	CompletedAt          *time.Time `json:"completed_at"`
}

// Continue is an unfinished item on the "continue" list.
type Continue struct {
	Item                 string     `json:"item"`
	Title                string     `json:"title"`
	ContentType          string     `json:"content_type"`
	ExternalURL          string     `json:"external_url"`
	FileURL              *string    `json:"file_url"`
	DurationSeconds      *int32     `json:"duration_seconds"`
	CompletionPercentage string     `json:"completion_percentage"`
	LastPosition         int32      `json:"last_position"`
	LastAccessed         *time.Time `json:"last_accessed"`
}

// Viewer is the signed-in person and the schools and classes they relate to.
type Viewer struct {
	UserID   int64
	Role     string
	Members  []int64
	Staff    []int64
	Leaders  []int64
	Learners []int64
	Classes  []int64
}

func (v Viewer) isAdmin() bool { return v.Role == platformAdmin }

// canAuthor: teachers, school staff and administrators add to the library.
func (v Viewer) canAuthor() bool {
	return v.isAdmin() || v.Role == "teacher" || v.Role == "institution" || len(v.Staff) > 0
}

// Filter narrows the item list.
type Filter struct {
	Search, ContentType, Status *string
	Subject, Topic, ClassLevel  *int64
	MineOnly                    bool
}

// field is a JSON value that may be absent, null, or set, so PATCH can clear it.
type field[T any] struct {
	Set   bool
	Value *T
}

func (f *field[T]) UnmarshalJSON(b []byte) error {
	f.Set = true
	if bytes.Equal(b, []byte("null")) {
		f.Value = nil
		return nil
	}
	var v T
	if err := json.Unmarshal(b, &v); err != nil {
		return err
	}
	f.Value = &v
	return nil
}

func (f field[T]) apply(dst **T) {
	if f.Set {
		*dst = f.Value
	}
}

// Input is a create or PATCH body. Files are still uploaded through Django
// until file storage moves, so new items are links.
type Input struct {
	Title            *string      `json:"title"`
	Description      *string      `json:"description"`
	ContentType      *string      `json:"content_type"`
	ExternalURL      *string      `json:"external_url"`
	Language         *string      `json:"language"`
	VisibilityScope  *string      `json:"visibility_scope"`
	OwnerInstitution field[int64] `json:"owner_institution"`
	Subject          field[int64] `json:"subject"`
	Topic            field[int64] `json:"topic"`
	ClassLevel       field[int64] `json:"class_level"`
}

// Draft is the full set of item fields Go writes.
type Draft struct {
	Title, Description, ContentType, ExternalURL, Language, Scope string
	OwnerType, Status, Moderation, RejectionReason                string
	OwnerInstitution, Subject, Topic, ClassLevel                  *int64
}

func newDraft() Draft {
	return Draft{Language: "en", Scope: Private, ContentType: "other"}
}

func draftOf(i Item) Draft {
	return Draft{
		Title: i.Title, Description: i.Description, ContentType: i.ContentType, ExternalURL: i.ExternalURL,
		Language: i.Language, Scope: i.VisibilityScope, OwnerType: i.OwnerType, Status: i.PublicationStatus,
		Moderation: i.ModerationStatus, RejectionReason: i.RejectionReason, OwnerInstitution: i.OwnerInstitution,
		Subject: i.Subject, Topic: i.Topic, ClassLevel: i.ClassLevel,
	}
}

func (in Input) merge(d Draft) Draft {
	set := func(dst *string, v *string) {
		if v != nil {
			*dst = strings.TrimSpace(*v)
		}
	}
	set(&d.Title, in.Title)
	set(&d.Description, in.Description)
	set(&d.ContentType, in.ContentType)
	set(&d.ExternalURL, in.ExternalURL)
	set(&d.Language, in.Language)
	set(&d.Scope, in.VisibilityScope)
	in.OwnerInstitution.apply(&d.OwnerInstitution)
	in.Subject.apply(&d.Subject)
	in.Topic.apply(&d.Topic)
	in.ClassLevel.apply(&d.ClassLevel)
	return d
}

// check validates d. It returns a message for a 400.
func (d Draft) check() string {
	switch {
	case d.Title == "" || len(d.Title) > maxTitle:
		return "Give the item a title of up to 500 characters."
	case len(d.Description) > maxDescription:
		return "The description is too long."
	case !slices.Contains(contentTypes, d.ContentType):
		return "Choose a content type, such as notes, video, textbook or mock_exam."
	case !webURL(d.ExternalURL):
		return "Add a web address starting with http:// or https://. File uploads come later."
	case d.Language == "" || len(d.Language) > maxLanguage:
		return "language must be a short code such as en."
	case !slices.Contains(scopes, d.Scope):
		return "visibility_scope must be private, class, institution or global."
	case d.Scope == Institution && d.OwnerInstitution == nil:
		return "Choose the school whose library this belongs to (owner_institution)."
	}
	return ""
}

// allowed checks the viewer may publish d. It returns a message for a 403.
func (d Draft) allowed(v Viewer) string {
	if !v.canAuthor() {
		return "Only teachers, school staff and administrators add to the library."
	}
	if d.OwnerInstitution != nil && !slices.Contains(v.Staff, *d.OwnerInstitution) && !v.isAdmin() {
		return "You can only add to the library of a school you work at."
	}
	return ""
}

// settle sets who owns the item and whether it needs review. Platform-wide
// items from anyone but an administrator wait for review, including after
// an edit.
func (d Draft) settle(v Viewer) Draft {
	switch {
	case v.isAdmin():
		d.OwnerType = "platform_admin"
	case d.OwnerInstitution != nil:
		d.OwnerType = "institution"
	default:
		d.OwnerType = "teacher"
	}
	d.Status, d.Moderation, d.RejectionReason = Published, "", ""
	if d.Scope == Global {
		d.Status, d.Moderation = UnderReview, "pending"
		if v.isAdmin() {
			d.Status, d.Moderation = Published, "approved"
		}
	}
	return d
}

func webURL(s string) bool {
	u, err := url.Parse(s)
	return err == nil && (u.Scheme == "http" || u.Scheme == "https") && u.Host != "" && len(s) <= maxURL
}
