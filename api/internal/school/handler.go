package school

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/httpx"
	"github.com/O-Mario88/maple-online-School/api/internal/identity"
	"github.com/O-Mario88/maple-online-School/api/internal/roles"
)

const (
	maxTitle      = 255
	maxEntries    = 200
	maxNotes      = 1_000
	futureLimit   = 24 * time.Hour
	classesPrefix = "/api/v1/classes/"
)

// Store is what the handler needs from the database.
type Store interface {
	SchoolsWithRoles(ctx context.Context, userID int64, rs []string) ([]int64, error)
	ListClasses(ctx context.Context, v Viewer, page httpx.Page) ([]Class, int64, error)
	GetClass(ctx context.Context, v Viewer, id int64) (Class, error)
	CreateClass(ctx context.Context, in NewClass) (int64, error)
	UpdateClass(ctx context.Context, c Class, title *string, teacher *int64, published *bool) error
	Roster(ctx context.Context, classID int64) ([]RosterEntry, error)
	Enrol(ctx context.Context, c Class, studentID int64) (Enrollment, error)
	EnrollmentSchool(ctx context.Context, id int64) (int64, error)
	Unenrol(ctx context.Context, id int64) error
	ListEnrollments(ctx context.Context, learners []int64, page httpx.Page) ([]Enrollment, int64, error)
	SaveRegister(ctx context.Context, c Class, on time.Time, entries []Entry, recorder int64) (int, error)
	ListMarks(ctx context.Context, staffSchools, learners []int64, f MarkFilter, page httpx.Page) ([]Mark, int64, error)
}

// Handler serves classes, enrolment and the daily register.
type Handler struct {
	store       Store
	family      identity.ProfileReader
	requireUser func(http.Handler) http.Handler
}

// NewHandler wires the routes. requireUser authenticates each request.
func NewHandler(store Store, family identity.ProfileReader, requireUser func(http.Handler) http.Handler) *Handler {
	return &Handler{store: store, family: family, requireUser: requireUser}
}

// Mount registers the routes. Other methods on these paths get 405.
func (h *Handler) Mount(r chi.Router) {
	r.Group(func(r chi.Router) {
		r.Use(h.requireUser)
		r.Get(classesPrefix, h.listClasses)
		r.Post(classesPrefix, h.createClass)
		r.Get(classesPrefix+"{id}/", h.getClass)
		r.Patch(classesPrefix+"{id}/", h.updateClass)
		r.Get(classesPrefix+"{id}/roster/", h.roster)
		r.Get("/api/v1/class-enrollments/", h.listEnrollments)
		r.Post("/api/v1/class-enrollments/", h.enrol)
		r.Delete("/api/v1/class-enrollments/{id}/", h.unenrol)
		r.Get("/api/v1/attendance/daily/", h.listMarks)
		r.Post("/api/v1/attendance/daily/", h.saveRegister)
	})
	for _, prefix := range []string{classesPrefix, "/api/v1/class-enrollments/", "/api/v1/attendance/daily/"} {
		r.HandleFunc(prefix+"*", func(w http.ResponseWriter, _ *http.Request) {
			httpx.WriteError(w, http.StatusMethodNotAllowed, "method_not_allowed", "This action isn't available.")
		})
	}
}

// viewer loads the person's schools by role and the learners they may see.
func (h *Handler) viewer(w http.ResponseWriter, r *http.Request) (Viewer, bool) {
	user := identity.UserFrom(r.Context())
	v := Viewer{UserID: user.ID, Learners: []int64{}}
	var err error
	if v.Leader, err = h.store.SchoolsWithRoles(r.Context(), user.ID, roles.Leaders); err == nil {
		if v.Teacher, err = h.store.SchoolsWithRoles(r.Context(), user.ID, roles.Teachers); err == nil {
			v.Staff, err = h.store.SchoolsWithRoles(r.Context(), user.ID, roles.Staff)
		}
	}
	if err != nil {
		serverError(w, "load viewer", err)
		return Viewer{}, false
	}
	switch user.Role {
	case "student":
		v.Learners = []int64{user.ID}
	case "parent":
		kids, err := h.family.ApprovedChildren(r.Context(), user.ID)
		if err != nil {
			serverError(w, "load children", err)
			return Viewer{}, false
		}
		for _, k := range kids {
			v.Learners = append(v.Learners, k.UserID)
		}
	}
	return v, true
}

// visibleClass loads the class named by {id} or param, writing 404 if unseen.
func (h *Handler) visibleClass(w http.ResponseWriter, r *http.Request, v Viewer, id int64) (Class, bool) {
	c, err := h.store.GetClass(r.Context(), v, id)
	if errors.Is(err, ErrNotFound) {
		writeNotFound(w)
		return Class{}, false
	}
	if err != nil {
		serverError(w, "get class", err)
		return Class{}, false
	}
	return c, true
}

// ---- classes ------------------------------------------------------------------

func (h *Handler) listClasses(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	page := httpx.ParsePage(r)
	list, count, err := h.store.ListClasses(r.Context(), v, page)
	if err != nil {
		serverError(w, "list classes", err)
		return
	}
	httpx.WritePage(w, r, page, count, list)
}

func (h *Handler) getClass(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	if c, ok := h.visibleClass(w, r, v, pathID(r)); ok {
		httpx.WriteJSON(w, http.StatusOK, c)
	}
}

type classRequest struct {
	Title       *string `json:"title"`
	Institution int64   `json:"institution"`
	ClassLevel  int64   `json:"class_level"`
	Teacher     *int64  `json:"teacher"`
	IsPublished *bool   `json:"is_published"`
}

func (h *Handler) createClass(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	var req classRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", err.Error())
		return
	}
	if !v.Leads(req.Institution) {
		httpx.WriteError(w, http.StatusForbidden, "permission_denied", "Only school leaders can create classes.")
		return
	}
	title := trimmed(req.Title)
	if title == "" || len(title) > maxTitle || req.ClassLevel <= 0 || req.Teacher == nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "A title, class level and teacher are required.")
		return
	}
	id, err := h.store.CreateClass(r.Context(), NewClass{
		Title: title, Institution: req.Institution, ClassLevel: req.ClassLevel, Teacher: *req.Teacher,
		IsPublished: req.IsPublished != nil && *req.IsPublished,
	})
	if h.badRequest(w, err) {
		return
	}
	if err != nil {
		serverError(w, "create class", err)
		return
	}
	if c, ok := h.visibleClass(w, r, v, id); ok {
		httpx.WriteJSON(w, http.StatusCreated, c)
	}
}

func (h *Handler) updateClass(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	c, ok := h.visibleClass(w, r, v, pathID(r))
	if !ok {
		return
	}
	if !v.Leads(c.Institution) {
		httpx.WriteError(w, http.StatusForbidden, "permission_denied", "Only school leaders can change classes.")
		return
	}
	var req classRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", err.Error())
		return
	}
	var title *string
	if req.Title != nil {
		t := trimmed(req.Title)
		if t == "" || len(t) > maxTitle {
			httpx.WriteError(w, http.StatusBadRequest, "invalid", "A title of up to 255 characters is required.")
			return
		}
		title = &t
	}
	err := h.store.UpdateClass(r.Context(), c, title, req.Teacher, req.IsPublished)
	if h.badRequest(w, err) {
		return
	}
	if err != nil {
		serverError(w, "update class", err)
		return
	}
	if c, ok := h.visibleClass(w, r, v, c.ID); ok {
		httpx.WriteJSON(w, http.StatusOK, c)
	}
}

func (h *Handler) roster(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	c, ok := h.visibleClass(w, r, v, pathID(r))
	if !ok {
		return
	}
	if !v.CanRun(c) {
		httpx.WriteError(w, http.StatusForbidden, "permission_denied", "Only the class teacher and school leaders can see the class list.")
		return
	}
	students, err := h.store.Roster(r.Context(), c.ID)
	if err != nil {
		serverError(w, "roster", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"class": c, "students": students})
}

// ---- enrolment ----------------------------------------------------------------

func (h *Handler) listEnrollments(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	page := httpx.ParsePage(r)
	list, count, err := h.store.ListEnrollments(r.Context(), v.Learners, page)
	if err != nil {
		serverError(w, "list enrolments", err)
		return
	}
	httpx.WritePage(w, r, page, count, list)
}

type enrolRequest struct {
	EnrolledClass int64 `json:"enrolled_class"`
	Student       int64 `json:"student"`
}

func (h *Handler) enrol(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	var req enrolRequest
	if err := httpx.DecodeJSON(r, &req); err != nil || req.EnrolledClass <= 0 || req.Student <= 0 {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "A class and a student are required.")
		return
	}
	if len(v.Leader) == 0 {
		httpx.WriteError(w, http.StatusForbidden, "permission_denied", "Only school leaders can enrol students.")
		return
	}
	c, ok := h.visibleClass(w, r, v, req.EnrolledClass)
	if !ok {
		return
	}
	if !v.Leads(c.Institution) {
		httpx.WriteError(w, http.StatusForbidden, "permission_denied", "Only school leaders can enrol students.")
		return
	}
	e, err := h.store.Enrol(r.Context(), c, req.Student)
	if h.badRequest(w, err) {
		return
	}
	if err != nil {
		serverError(w, "enrol", err)
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, e)
}

func (h *Handler) unenrol(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	id := pathID(r)
	school, err := h.store.EnrollmentSchool(r.Context(), id)
	if errors.Is(err, ErrNotFound) || (err == nil && !v.Leads(school)) {
		writeNotFound(w)
		return
	}
	if err != nil {
		serverError(w, "find enrolment", err)
		return
	}
	if err := h.store.Unenrol(r.Context(), id); err != nil {
		serverError(w, "unenrol", err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ---- register -----------------------------------------------------------------

func (h *Handler) listMarks(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	q := r.URL.Query()
	f := MarkFilter{Student: queryID(q.Get("student")), Class: queryID(q.Get("class"))}
	if d := q.Get("record_date"); d != "" {
		day, err := time.Parse(time.DateOnly, d)
		if err != nil {
			httpx.WriteError(w, http.StatusBadRequest, "invalid", "record_date must look like 2026-10-30.")
			return
		}
		f.Date = &day
	}
	page := httpx.ParsePage(r)
	list, count, err := h.store.ListMarks(r.Context(), v.Staff, v.Learners, f, page)
	if err != nil {
		serverError(w, "list marks", err)
		return
	}
	httpx.WritePage(w, r, page, count, list)
}

type registerRequest struct {
	Class      int64  `json:"class"`
	RecordDate string `json:"record_date"`
	Entries    []struct {
		Student int64   `json:"student"`
		Status  string  `json:"status"`
		Notes   *string `json:"notes"`
	} `json:"entries"`
}

func (h *Handler) saveRegister(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	var req registerRequest
	if err := httpx.DecodeJSON(r, &req); err != nil || req.Class <= 0 {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "Send the class, the date and each student's mark.")
		return
	}
	c, err := h.store.GetClass(r.Context(), v, req.Class)
	if errors.Is(err, ErrNotFound) || (err == nil && !v.CanRun(c)) {
		writeNotFound(w) // only the class teacher and school leaders take a register
		return
	}
	if err != nil {
		serverError(w, "get class", err)
		return
	}
	day, entries, problem := validateRegister(req)
	if problem != "" {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", problem)
		return
	}
	saved, err := h.store.SaveRegister(r.Context(), c, day, entries, v.UserID)
	switch {
	case errors.Is(err, ErrNoTerm):
		httpx.WriteError(w, http.StatusConflict, "no_term", "No school term covers this date. Ask a school leader to set up the term first.")
	case errors.Is(err, ErrNotEnrolled):
		httpx.WriteError(w, http.StatusBadRequest, "not_enrolled", "One of the students isn't enrolled in this class.")
	case err != nil:
		serverError(w, "save register", err)
	default:
		httpx.WriteJSON(w, http.StatusOK, map[string]any{"saved": saved, "class": c.ID, "record_date": day.Format(time.DateOnly)})
	}
}

func validateRegister(req registerRequest) (time.Time, []Entry, string) {
	day, err := time.Parse(time.DateOnly, req.RecordDate)
	if err != nil {
		return time.Time{}, nil, "record_date must look like 2026-10-30."
	}
	if day.After(time.Now().Add(futureLimit)) {
		return time.Time{}, nil, "You can't take a register for a future date."
	}
	if len(req.Entries) == 0 || len(req.Entries) > maxEntries {
		return time.Time{}, nil, "Send between 1 and 200 marks."
	}
	seen := make(map[int64]bool, len(req.Entries))
	entries := make([]Entry, 0, len(req.Entries))
	for _, e := range req.Entries {
		switch {
		case e.Student <= 0 || seen[e.Student]:
			return time.Time{}, nil, "Each student can appear once."
		case !slices.Contains(Statuses, e.Status):
			return time.Time{}, nil, "Status must be present, late, authorized_absent or unauthorized_absent."
		case e.Notes != nil && len(*e.Notes) > maxNotes:
			return time.Time{}, nil, "Notes can be up to 1,000 characters."
		}
		seen[e.Student] = true
		entries = append(entries, Entry{Student: e.Student, Status: e.Status, Notes: e.Notes})
	}
	return day, entries, ""
}

// ---- helpers ------------------------------------------------------------------

// badRequest writes a 400 for validation errors from the store.
func (h *Handler) badRequest(w http.ResponseWriter, err error) bool {
	switch {
	case errors.Is(err, ErrInvalidMember):
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "That person isn't an active member of this school.")
	case errors.Is(err, ErrInvalidLevel):
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "That class level doesn't exist.")
	default:
		return false
	}
	return true
}

func pathID(r *http.Request) int64 {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	return id
}

func queryID(s string) *int64 {
	id, err := strconv.ParseInt(s, 10, 64)
	if err != nil || id <= 0 {
		return nil
	}
	return &id
}

func trimmed(s *string) string {
	if s == nil {
		return ""
	}
	return strings.TrimSpace(*s)
}

func writeNotFound(w http.ResponseWriter) {
	httpx.WriteError(w, http.StatusNotFound, "not_found", "Not found.")
}

func serverError(w http.ResponseWriter, action string, err error) {
	slog.Error("school: "+action, "err", err)
	httpx.WriteError(w, http.StatusInternalServerError, "server_error", "Something went wrong. Please try again.")
}
