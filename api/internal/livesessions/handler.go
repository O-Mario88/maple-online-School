package livesessions

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"slices"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/httpx"
	"github.com/O-Mario88/maple-online-School/api/internal/identity"
)

const (
	prefix          = "/api/v1/live-sessions/"
	sessionsPrefix  = prefix + "live-session/"
	remindersPrefix = prefix + "session-reminder/"
	recoveryPrefix  = prefix + "missed-recovery/"
)

// Store is what the handler needs from the database.
type Store interface {
	Viewer(ctx context.Context, userID int64, role string) (Viewer, error)
	ListSessions(ctx context.Context, v Viewer, status *string, page httpx.Page) ([]Session, int64, error)
	Session(ctx context.Context, v Viewer, id int64) (Session, error)
	Lesson(ctx context.Context, v Viewer, lessonID int64) (LessonRef, error)
	CreateSession(ctx context.Context, lessonID int64, d Draft) (int64, error)
	UpdateSession(ctx context.Context, id int64, d Draft) error
	Reminders(ctx context.Context, sessionID int64) ([]Reminder, error)
	CreateReminder(ctx context.Context, sessionID int64, at time.Time) (Reminder, error)
	Reminder(ctx context.Context, id int64) (Reminder, error)
	DeleteReminder(ctx context.Context, id int64) error
	Recoveries(ctx context.Context, sess Session, everyone bool, learners []int64) ([]Recovery, error)
	Recovery(ctx context.Context, id int64) (Recovery, error)
	Enrolled(ctx context.Context, classID, studentID int64) (bool, error)
	CreateRecovery(ctx context.Context, sess Session, studentID int64, summary string, recording *string) (Recovery, error)
	UpdateRecovery(ctx context.Context, rec Recovery, sess Session) (Recovery, error)
}

// Handler serves live sessions, reminders and missed-session recovery.
type Handler struct {
	store       Store
	requireUser func(http.Handler) http.Handler
}

func NewHandler(store Store, requireUser func(http.Handler) http.Handler) *Handler {
	return &Handler{store: store, requireUser: requireUser}
}

// Mount registers the routes. Everything under /api/v1/live-sessions/ is
// Go's; other methods get 405 rather than falling through to Django.
func (h *Handler) Mount(r chi.Router) {
	r.Group(func(r chi.Router) {
		r.Use(h.requireUser)
		r.Get(sessionsPrefix, h.listSessions)
		r.Post(sessionsPrefix, h.createSession)
		r.Post(sessionsPrefix+"provision-webinar/", h.provisionWebinar)
		r.Post(prefix+"provision-webinar/", h.provisionWebinar)
		r.Get(sessionsPrefix+"{id}/", h.getSession)
		r.Patch(sessionsPrefix+"{id}/", h.updateSession)
		r.Get(remindersPrefix, h.listReminders)
		r.Post(remindersPrefix, h.createReminder)
		r.Delete(remindersPrefix+"{id}/", h.deleteReminder)
		r.Get(recoveryPrefix, h.listRecoveries)
		r.Post(recoveryPrefix, h.createRecovery)
		r.Patch(recoveryPrefix+"{id}/", h.updateRecovery)
	})
	r.HandleFunc(prefix+"*", func(w http.ResponseWriter, _ *http.Request) {
		httpx.WriteError(w, http.StatusMethodNotAllowed, "method_not_allowed", "This action isn't available.")
	})
}

func (h *Handler) viewer(w http.ResponseWriter, r *http.Request) (Viewer, bool) {
	user := identity.UserFrom(r.Context())
	v, err := h.store.Viewer(r.Context(), user.ID, user.Role)
	if err != nil {
		serverError(w, "load viewer", err)
		return Viewer{}, false
	}
	return v, true
}

// visibleSession loads a session the viewer can see, writing 404 otherwise.
func (h *Handler) visibleSession(w http.ResponseWriter, r *http.Request, v Viewer, sessionID int64) (Session, bool) {
	s, err := h.store.Session(r.Context(), v, sessionID)
	if errors.Is(err, ErrNotFound) {
		notFound(w)
		return Session{}, false
	}
	if err != nil {
		serverError(w, "get session", err)
		return Session{}, false
	}
	return s, true
}

// runSession loads a session the viewer runs, writing 404 or 403 otherwise.
func (h *Handler) runSession(w http.ResponseWriter, r *http.Request, v Viewer, sessionID int64) (Session, bool) {
	s, ok := h.visibleSession(w, r, v, sessionID)
	if ok && !v.runs(s.school, s.teacher) {
		forbidden(w, "Only the class's teacher or the school's leaders can do this.")
		return Session{}, false
	}
	return s, ok
}

// ---- sessions -----------------------------------------------------------------

func (h *Handler) listSessions(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	var status *string
	if s := r.URL.Query().Get("status"); slices.Contains(sessionStatuses, s) {
		status = &s
	}
	page := httpx.ParsePage(r)
	items, count, err := h.store.ListSessions(r.Context(), v, status, page)
	if err != nil {
		serverError(w, "list sessions", err)
		return
	}
	httpx.WritePage(w, r, page, count, items)
}

func (h *Handler) getSession(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	if s, ok := h.visibleSession(w, r, v, pathID(r)); ok {
		httpx.WriteJSON(w, http.StatusOK, s)
	}
}

func (h *Handler) createSession(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	var in SessionInput
	if err := httpx.DecodeJSON(r, &in); err != nil {
		badRequest(w, "The request body must be JSON.")
		return
	}
	lesson, err := h.store.Lesson(r.Context(), v, in.Lesson)
	if errors.Is(err, ErrNotFound) {
		badRequest(w, "That lesson doesn't exist.")
		return
	}
	if err != nil {
		serverError(w, "get lesson", err)
		return
	}
	if !v.runs(lesson.School, lesson.Teacher) {
		forbidden(w, "Only the class's teacher or the school's leaders can run its live sessions.")
		return
	}
	d, msg := in.merge(newDraft(lesson.ScheduledAt))
	if msg != "" {
		badRequest(w, msg)
		return
	}
	newID, err := h.store.CreateSession(r.Context(), lesson.ID, d)
	if errors.Is(err, ErrDuplicate) {
		badRequest(w, "This lesson already has a live session. Change that one instead.")
		return
	}
	if err != nil {
		serverError(w, "create session", err)
		return
	}
	h.respondSession(w, r, v, newID, http.StatusCreated)
}

func (h *Handler) updateSession(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	s, ok := h.runSession(w, r, v, pathID(r))
	if !ok {
		return
	}
	var in SessionInput
	if err := httpx.DecodeJSON(r, &in); err != nil {
		badRequest(w, "The request body must be JSON.")
		return
	}
	d, msg := in.merge(draftOf(s))
	if msg != "" {
		badRequest(w, msg)
		return
	}
	if err := h.store.UpdateSession(r.Context(), s.ID, d); err != nil {
		serverError(w, "update session", err)
		return
	}
	h.respondSession(w, r, v, s.ID, http.StatusOK)
}

// provisionWebinar used to hand out made-up Meet links. Until Google
// Workspace is connected, teachers paste their own link instead.
func (h *Handler) provisionWebinar(w http.ResponseWriter, _ *http.Request) {
	httpx.WriteError(w, http.StatusServiceUnavailable, "not_configured",
		"Automatic meeting links aren't set up yet. Create a Google Meet or Zoom meeting and paste its link.")
}

func (h *Handler) respondSession(w http.ResponseWriter, r *http.Request, v Viewer, sessionID int64, status int) {
	s, err := h.store.Session(r.Context(), v, sessionID)
	if err != nil {
		serverError(w, "reload session", err)
		return
	}
	httpx.WriteJSON(w, status, s)
}

// ---- helpers ------------------------------------------------------------------

// writeAll writes a short, complete list in DRF's page envelope.
func writeAll(w http.ResponseWriter, results any, n int) {
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"count": n, "next": nil, "previous": nil, "results": results})
}

func pathID(r *http.Request) int64 {
	n, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	return n
}

func queryID(s string) *int64 {
	n, err := strconv.ParseInt(s, 10, 64)
	if err != nil || n <= 0 {
		return nil
	}
	return &n
}

func badRequest(w http.ResponseWriter, msg string) {
	httpx.WriteError(w, http.StatusBadRequest, "invalid", msg)
}

func forbidden(w http.ResponseWriter, msg string) {
	httpx.WriteError(w, http.StatusForbidden, "forbidden", msg)
}

func notFound(w http.ResponseWriter) {
	httpx.WriteError(w, http.StatusNotFound, "not_found", "Not found.")
}

func serverError(w http.ResponseWriter, action string, err error) {
	slog.Error("livesessions: "+action, "err", err)
	httpx.WriteError(w, http.StatusInternalServerError, "server_error", "Something went wrong. Please try again.")
}
