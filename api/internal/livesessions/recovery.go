package livesessions

import (
	"errors"
	"net/http"
	"slices"
	"strings"
	"time"

	"github.com/O-Mario88/maple-online-School/api/internal/httpx"
	"github.com/O-Mario88/maple-online-School/api/internal/identity"
)

// ---- reminders (staff only) ---------------------------------------------------------

func (h *Handler) listReminders(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	sessionID := queryID(r.URL.Query().Get("session"))
	if sessionID == nil {
		badRequest(w, "Choose a session (?session=).")
		return
	}
	s, ok := h.runSession(w, r, v, *sessionID)
	if !ok {
		return
	}
	rows, err := h.store.Reminders(r.Context(), s.ID)
	if err != nil {
		serverError(w, "list reminders", err)
		return
	}
	writeAll(w, rows, len(rows))
}

func (h *Handler) createReminder(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	var in struct {
		Session int64  `json:"session"`
		SendAt  string `json:"send_at"`
	}
	if err := httpx.DecodeJSON(r, &in); err != nil {
		badRequest(w, "Send the session id and send_at.")
		return
	}
	s, ok := h.runSession(w, r, v, in.Session)
	if !ok {
		return
	}
	at, err := time.Parse(time.RFC3339, in.SendAt)
	if err != nil || !at.After(time.Now()) || (s.ScheduledStart != nil && at.After(*s.ScheduledStart)) {
		badRequest(w, "A reminder goes out between now and the start of the session.")
		return
	}
	rem, err := h.store.CreateReminder(r.Context(), s.ID, at)
	if err != nil {
		serverError(w, "create reminder", err)
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, rem)
}

func (h *Handler) deleteReminder(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	rem, err := h.store.Reminder(r.Context(), pathID(r))
	if errors.Is(err, ErrNotFound) {
		notFound(w)
		return
	}
	if err != nil {
		serverError(w, "get reminder", err)
		return
	}
	if _, ok := h.runSession(w, r, v, rem.Session); !ok {
		return
	}
	if err := h.store.DeleteReminder(r.Context(), rem.ID); err != nil {
		serverError(w, "delete reminder", err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ---- missed-session recovery --------------------------------------------------------
//
// Staff open a recovery for an enrolled student who missed the session; the
// student writes a summary and submits it; staff verify it. Parents can read
// their child's but not act for them.

func (h *Handler) listRecoveries(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	sessionID := queryID(r.URL.Query().Get("session"))
	if sessionID == nil {
		badRequest(w, "Choose a session (?session=).")
		return
	}
	s, ok := h.visibleSession(w, r, v, *sessionID)
	if !ok {
		return
	}
	rows, err := h.store.Recoveries(r.Context(), s, v.runs(s.school, s.teacher), v.Learners)
	if err != nil {
		serverError(w, "list recoveries", err)
		return
	}
	writeAll(w, rows, len(rows))
}

func (h *Handler) createRecovery(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	var in struct {
		Session      int64   `json:"session"`
		Student      int64   `json:"student"`
		Summary      string  `json:"summary"`
		RecordingURL *string `json:"recording_url"`
	}
	if err := httpx.DecodeJSON(r, &in); err != nil || len(in.Summary) > maxSummary {
		badRequest(w, "Send the session, the student and an optional summary (up to 5000 characters).")
		return
	}
	s, ok := h.runSession(w, r, v, in.Session)
	if !ok {
		return
	}
	recording := in.RecordingURL
	if recording == nil {
		recording = s.ReplayURL
	}
	if recording != nil && !webURL(*recording) {
		badRequest(w, "The recording link must start with https://.")
		return
	}
	enrolled, err := h.store.Enrolled(r.Context(), s.class, in.Student)
	if err != nil {
		serverError(w, "check enrolment", err)
		return
	}
	if !enrolled {
		badRequest(w, "That student isn't enrolled in this class.")
		return
	}
	rec, err := h.store.CreateRecovery(r.Context(), s, in.Student, strings.TrimSpace(in.Summary), recording)
	if errors.Is(err, ErrDuplicate) {
		badRequest(w, "This student already has catch-up work for this session.")
		return
	}
	if err != nil {
		serverError(w, "create recovery", err)
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, rec)
}

type recoveryInput struct {
	Summary        *string `json:"summary"`
	RecoveryStatus *string `json:"recovery_status"`
	RecordingURL   *string `json:"recording_url"`
}

func (h *Handler) updateRecovery(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	rec, err := h.store.Recovery(r.Context(), pathID(r))
	if errors.Is(err, ErrNotFound) {
		notFound(w)
		return
	}
	if err != nil {
		serverError(w, "get recovery", err)
		return
	}
	s, ok := h.visibleSession(w, r, v, rec.Session)
	if !ok {
		return
	}
	var in recoveryInput
	if err := httpx.DecodeJSON(r, &in); err != nil {
		badRequest(w, "The request body must be JSON.")
		return
	}
	staff := v.runs(s.school, s.teacher)
	self := rec.Student == identity.UserFrom(r.Context()).ID
	next, status, msg := applyRecovery(rec, in, staff, self)
	if msg != "" {
		if status == http.StatusForbidden {
			forbidden(w, msg)
		} else {
			badRequest(w, msg)
		}
		return
	}
	saved, err := h.store.UpdateRecovery(r.Context(), next, s)
	if err != nil {
		serverError(w, "update recovery", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, saved)
}

// applyRecovery checks who may change what. The student writes and submits;
// staff can also set the recording link and verify.
func applyRecovery(rec Recovery, in recoveryInput, staff, self bool) (Recovery, int, string) {
	if !staff && !self {
		return rec, http.StatusForbidden, "Only the student or their teacher can update this catch-up work."
	}
	if in.Summary != nil {
		if len(*in.Summary) > maxSummary {
			return rec, http.StatusBadRequest, "The summary can be up to 5000 characters."
		}
		rec.Summary = strings.TrimSpace(*in.Summary)
	}
	if in.RecordingURL != nil {
		if !staff {
			return rec, http.StatusForbidden, "Only the teacher can change the recording link."
		}
		if !webURL(*in.RecordingURL) {
			return rec, http.StatusBadRequest, "The recording link must start with https://."
		}
		rec.RecordingURL = in.RecordingURL
	}
	if in.RecoveryStatus != nil {
		next := *in.RecoveryStatus
		switch {
		case !slices.Contains(recoveryStatuses, next):
			return rec, http.StatusBadRequest, "recovery_status must be pending, submitted or verified."
		case !staff && next != "submitted":
			return rec, http.StatusForbidden, "Students submit their catch-up work; the teacher verifies it."
		}
		rec.RecoveryStatus = next
	}
	return rec, 0, ""
}
