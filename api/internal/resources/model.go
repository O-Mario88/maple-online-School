// Package resources serves the resource library (notes, guides, links) and
// the resources teachers share with a class.
package resources

import (
	"bytes"
	"encoding/json"
	"errors"
	"math"
	"net/url"
	"slices"
	"strings"
	"time"
)

var (
	ErrNotFound  = errors.New("not found")
	ErrDuplicate = errors.New("already exists")
	ErrBadRef    = errors.New("unknown subject, class level or topic")
)

// Visibility values, as in Django.
const (
	Private     = "private"
	School      = "institution_only"
	Platform    = "platform_shared"
	Marketplace = "marketplace_public"
)

var visibilities = []string{Private, School, Platform, Marketplace}

const (
	maxTitle       = 255
	maxAuthor      = 255
	maxCategory    = 100
	maxDescription = 10_000
	maxURL         = 500
	maxPrice       = 999_999.99
	platformAdmin  = "admin"
)

// Resource matches Django's ResourceSerializer.
type Resource struct {
	ID               int64     `json:"id"`
	Title            string    `json:"title"`
	Description      *string   `json:"description"`
	Author           *string   `json:"author"`
	AuthorName       string    `json:"author_name"`
	Category         *string   `json:"category"`
	Price            string    `json:"price"`
	Rating           string    `json:"rating"`
	IsFeatured       bool      `json:"is_featured"`
	FilePath         *string   `json:"file_path"`
	ExternalURL      *string   `json:"external_url"`
	Visibility       string    `json:"visibility"`
	Subject          *int64    `json:"subject"`
	ClassLevel       *int64    `json:"class_level"`
	Topic            *int64    `json:"topic"`
	UploadedBy       int64     `json:"uploaded_by"`
	OwnerType        string    `json:"owner_type"`
	OwnerInstitution *int64    `json:"owner_institution"`
	CreatedAt        time.Time `json:"created_at"`
	VimeoVideoID     *string   `json:"vimeo_video_id"`

	price float64 // Price as a number, for edits
}

// Link is a resource shared with a class.
type Link struct {
	ID            int64     `json:"id"`
	AddedAt       time.Time `json:"added_at"`
	AddedBy       int64     `json:"added_by"`
	Resource      int64     `json:"resource"`
	TargetClass   int64     `json:"target_class"`
	ResourceTitle string    `json:"resource_title"`
}

// LinkOwner says who may remove a link.
type LinkOwner struct {
	AddedBy, School, Teacher int64
}

// Viewer is the signed-in person and the schools and learners they relate to.
type Viewer struct {
	UserID   int64
	Role     string
	Members  []int64 // schools with an active membership of any role
	Staff    []int64
	Leaders  []int64
	Learners []int64 // the student themself, or a parent's approved children
}

func (v Viewer) staffOf(school int64) bool  { return slices.Contains(v.Staff, school) }
func (v Viewer) leaderOf(school int64) bool { return slices.Contains(v.Leaders, school) }

// Filter narrows the resource list.
type Filter struct {
	Category, Visibility, Search *string
	Subject                      *int64
	Sort                         string
}

var sorts = []string{"created_at", "-created_at", "rating", "-rating", "price", "-price"}

// LinkFilter narrows the class-link list.
type LinkFilter struct {
	TargetClass, Resource *int64
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

// Input is a create or PATCH body. File uploads go through Django's
// resources-upload endpoint until file storage moves.
type Input struct {
	Title            *string        `json:"title"`
	Description      field[string]  `json:"description"`
	Author           field[string]  `json:"author"`
	Category         field[string]  `json:"category"`
	ExternalURL      field[string]  `json:"external_url"`
	Visibility       *string        `json:"visibility"`
	OwnerInstitution field[int64]   `json:"owner_institution"`
	Subject          field[int64]   `json:"subject"`
	ClassLevel       field[int64]   `json:"class_level"`
	Topic            field[int64]   `json:"topic"`
	Price            field[float64] `json:"price"`
}

// Draft is the full set of fields Go writes.
type Draft struct {
	Title                                   string
	Description, Author, Category, URL      *string
	Visibility, OwnerType                   string
	OwnerInstitution, Subject, Level, Topic *int64
	Price                                   float64
}

func draftOf(r Resource) Draft {
	return Draft{
		Title: r.Title, Description: r.Description, Author: r.Author, Category: r.Category, URL: r.ExternalURL,
		Visibility: r.Visibility, OwnerType: r.OwnerType, OwnerInstitution: r.OwnerInstitution,
		Subject: r.Subject, Level: r.ClassLevel, Topic: r.Topic, Price: r.price,
	}
}

// merge applies the body to d.
func (in Input) merge(d Draft) Draft {
	if in.Title != nil {
		d.Title = *in.Title
	}
	if in.Visibility != nil {
		d.Visibility = *in.Visibility
	}
	in.Description.apply(&d.Description)
	in.Author.apply(&d.Author)
	in.Category.apply(&d.Category)
	in.ExternalURL.apply(&d.URL)
	in.OwnerInstitution.apply(&d.OwnerInstitution)
	in.Subject.apply(&d.Subject)
	in.ClassLevel.apply(&d.Level)
	in.Topic.apply(&d.Topic)
	if in.Price.Set {
		d.Price = 0
		if in.Price.Value != nil {
			d.Price = *in.Price.Value
		}
	}
	return d
}

type textRule struct {
	v   **string
	max int
	msg string
}

// clean trims text and checks shapes. It returns a message for a 400.
func (d Draft) clean() (Draft, string) {
	d.Title = strings.TrimSpace(d.Title)
	if d.Title == "" || len(d.Title) > maxTitle {
		return d, "Give the resource a title of up to 255 characters."
	}
	for _, t := range []textRule{
		{&d.Description, maxDescription, "The description is too long."},
		{&d.Author, maxAuthor, "The author name is too long."},
		{&d.Category, maxCategory, "The category is too long."},
		{&d.URL, maxURL, "The link is too long."},
	} {
		if msg := trimOptional(t); msg != "" {
			return d, msg
		}
	}
	if d.URL != nil && !safeURL(*d.URL) {
		return d, "The link must be a web address starting with http:// or https://."
	}
	if !slices.Contains(visibilities, d.Visibility) {
		return d, "Visibility must be private, institution_only, platform_shared or marketplace_public."
	}
	if d.Visibility == School && d.OwnerInstitution == nil {
		return d, "Choose the school whose library this belongs to."
	}
	d.Price = math.Round(d.Price*100) / 100
	if d.Price < 0 || d.Price > maxPrice || (d.Price != 0 && d.Visibility != Marketplace) {
		return d, "Only marketplace resources have a price, between 0 and 999999.99."
	}
	return d, ""
}

func trimOptional(t textRule) string {
	if *t.v == nil {
		return ""
	}
	s := strings.TrimSpace(**t.v)
	if s == "" {
		*t.v = nil
		return ""
	}
	if len(s) > t.max {
		return t.msg
	}
	*t.v = &s
	return ""
}

// allowed checks the viewer may publish d. It returns a message for a 403.
func (d Draft) allowed(v Viewer) string {
	if (d.Visibility == Platform || d.Visibility == Marketplace) && v.Role != platformAdmin {
		return "Only Maple administrators can share resources across the platform."
	}
	if d.OwnerInstitution != nil && !v.staffOf(*d.OwnerInstitution) {
		return "You can only add resources to the library of a school you work at."
	}
	return ""
}

func (d Draft) withOwnerType(v Viewer) Draft {
	switch {
	case d.OwnerInstitution != nil:
		d.OwnerType = "institution"
	case v.Role == platformAdmin && (d.Visibility == Platform || d.Visibility == Marketplace):
		d.OwnerType = "platform"
	default:
		d.OwnerType = "teacher"
	}
	return d
}

func safeURL(s string) bool {
	u, err := url.Parse(s)
	return err == nil && (u.Scheme == "http" || u.Scheme == "https") && u.Host != ""
}

// shareableWith reports whether members of school can open r once linked.
func shareableWith(r Resource, school int64) bool {
	switch r.Visibility {
	case Platform, Marketplace:
		return true
	case School:
		return r.OwnerInstitution != nil && *r.OwnerInstitution == school
	}
	return false
}
