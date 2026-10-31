// Package livesessions serves live (online) sessions for lessons, staff
// reminders for them, and catch-up work for students who missed one.
package livesessions

import (
	"errors"
	"net/url"
	"slices"
	"strings"
	"time"
)

var (
	ErrNotFound  = errors.New("not found")
	ErrDuplicate = errors.New("already exists")
	ErrClash     = errors.New("time already taken")
)

const (
	maxURL         = 500
	maxSummary     = 5_000
	minDuration    = 5
	maxDuration    = 480
	maxCapacity    = 10_000
	defaultMinutes = 60
	defaultSeats   = 100
	googleMeet     = "google_meet"
	zoom           = "zoom"
)

var (
	sessionStatuses  = []string{"scheduled", "completed", "cancelled"}
	recoveryStatuses = []string{"pending", "submitted", "verified"}
)

// Session matches Django's LiveSessionSerializer, including its camelCase
// extras that the apps read.
type Session struct {
	ID                 int64      `json:"id"`
	MeetingLink        string     `json:"meeting_link"`
	ReplayURL          *string    `json:"replay_url"`
	Provider           string     `json:"provider"`
	ProviderEventID    *string    `json:"provider_event_id"`
	ScheduledStart     *time.Time `json:"scheduled_start"`
	DurationMinutes    int32      `json:"duration_minutes"`
	Capacity           int32      `json:"capacity"`
	EnrolledCount      int32      `json:"enrolled_count"`
	Status             string     `json:"status"`
	ArtifactSyncStatus string     `json:"artifact_sync_status"`
	Lesson             int64      `json:"lesson"`
	Title              string     `json:"title"`
	Description        *string    `json:"description"`
	HostName           string     `json:"hostName"`
	Subject            string     `json:"subject"`
	ScheduledStartAlt  *time.Time `json:"scheduledStart"`
	DurationAlt        int32      `json:"durationMinutes"`
	EnrolledAlt        int32      `json:"enrolledCount"`

	school, teacher, class int64 // who runs it, and the class it is for
}

type Reminder struct {
	ID      int64     `json:"id"`
	SendAt  time.Time `json:"send_at"`
	Status  string    `json:"status"`
	Session int64     `json:"session"`
}

type RecoveryTask struct {
	ID       int64   `json:"id"`
	Title    string  `json:"title"`
	FileType string  `json:"file_type"`
	FileURL  *string `json:"file_url"`
}

// Recovery matches Django's MissedSessionRecoverySerializer.
type Recovery struct {
	ID             int64          `json:"id"`
	Session        int64          `json:"session"`
	Student        int64          `json:"student"`
	StudentName    string         `json:"student_name"`
	Subject        string         `json:"subject"`
	Topic          string         `json:"topic"`
	HostName       string         `json:"host_name"`
	SessionDate    *time.Time     `json:"session_date"`
	Summary        string         `json:"summary"`
	RecordingURL   *string        `json:"recording_url"`
	RecoveryStatus string         `json:"recovery_status"`
	SubmittedAt    *time.Time     `json:"submitted_at"`
	CreatedAt      time.Time      `json:"created_at"`
	Assignments    []RecoveryTask `json:"assignments"`
}

// Viewer is the signed-in person and the schools and learners they relate to.
type Viewer struct {
	UserID   int64
	Leaders  []int64
	Teachers []int64
	Learners []int64
}

// runs reports whether the viewer runs sessions for a class: its teacher, or
// a leader of its school.
func (v Viewer) runs(school, teacher int64) bool {
	return slices.Contains(v.Leaders, school) || (teacher == v.UserID && slices.Contains(v.Teachers, school))
}

// SessionInput is a create or PATCH body.
type SessionInput struct {
	Lesson          int64   `json:"lesson"`
	MeetingLink     *string `json:"meeting_link"`
	ReplayURL       *string `json:"replay_url"`
	Provider        *string `json:"provider"`
	ScheduledStart  *string `json:"scheduled_start"`
	DurationMinutes *int32  `json:"duration_minutes"`
	Capacity        *int32  `json:"capacity"`
	Status          *string `json:"status"`
}

// Draft is the full set of session fields Go writes.
type Draft struct {
	MeetingLink, Provider, Status, SyncStatus string
	ReplayURL                                 *string
	ScheduledStart                            *time.Time
	DurationMinutes, Capacity                 int32
}

func newDraft(lessonStart time.Time) Draft {
	start := lessonStart
	return Draft{Provider: googleMeet, Status: "scheduled", SyncStatus: "none", ScheduledStart: &start,
		DurationMinutes: defaultMinutes, Capacity: defaultSeats}
}

func draftOf(s Session) Draft {
	return Draft{MeetingLink: s.MeetingLink, Provider: s.Provider, Status: s.Status, SyncStatus: s.ArtifactSyncStatus,
		ReplayURL: s.ReplayURL, ScheduledStart: s.ScheduledStart, DurationMinutes: s.DurationMinutes, Capacity: s.Capacity}
}

// merge applies the body to d and checks it. It returns a message for a 400.
func (in SessionInput) merge(d Draft) (Draft, string) {
	if in.MeetingLink != nil {
		d.MeetingLink = strings.TrimSpace(*in.MeetingLink)
	}
	if in.Provider != nil {
		d.Provider = *in.Provider
	}
	if in.ReplayURL != nil {
		replay := strings.TrimSpace(*in.ReplayURL)
		d.ReplayURL = &replay
		if replay == "" {
			d.ReplayURL = nil
		}
	}
	if in.ScheduledStart != nil {
		t, err := time.Parse(time.RFC3339, *in.ScheduledStart)
		if err != nil {
			return d, "scheduled_start must be a date and time like 2026-11-02T09:00:00+03:00."
		}
		d.ScheduledStart = &t
	}
	if in.DurationMinutes != nil {
		d.DurationMinutes = *in.DurationMinutes
	}
	if in.Capacity != nil {
		d.Capacity = *in.Capacity
	}
	if in.Status != nil {
		d.Status = *in.Status
	}
	return d.check()
}

func (d Draft) check() (Draft, string) {
	switch {
	case d.Provider != googleMeet && d.Provider != zoom:
		return d, "provider must be google_meet or zoom."
	case !meetingLinkFor(d.Provider, d.MeetingLink):
		return d, "Use a Google Meet (https://meet.google.com/...) or Zoom (https://...zoom.us/...) link that matches the provider."
	case d.ReplayURL != nil && !webURL(*d.ReplayURL):
		return d, "The replay link must start with https://."
	case d.DurationMinutes < minDuration || d.DurationMinutes > maxDuration:
		return d, "A session lasts between 5 and 480 minutes."
	case d.Capacity < 1 || d.Capacity > maxCapacity:
		return d, "Capacity must be between 1 and 10000."
	case !slices.Contains(sessionStatuses, d.Status):
		return d, "status must be scheduled, completed or cancelled."
	}
	// A finished session without a replay waits for the recording sync job.
	if d.Status == "completed" && d.SyncStatus == "none" {
		d.SyncStatus = "pending"
	}
	if d.ReplayURL != nil {
		d.SyncStatus = "completed"
	}
	return d, ""
}

// meetingLinkFor keeps students on the real meeting service for the provider.
func meetingLinkFor(provider, link string) bool {
	u, err := url.Parse(link)
	if err != nil || u.Scheme != "https" || len(link) > maxURL {
		return false
	}
	host := strings.ToLower(u.Hostname())
	switch provider {
	case googleMeet:
		return host == "meet.google.com"
	case zoom:
		return host == "zoom.us" || strings.HasSuffix(host, ".zoom.us")
	}
	return false
}

func webURL(s string) bool {
	u, err := url.Parse(s)
	return err == nil && u.Scheme == "https" && u.Host != "" && len(s) <= maxURL
}
