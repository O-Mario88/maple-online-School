package lessons

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"slices"
	"strconv"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/httpx"
	"github.com/O-Mario88/maple-online-School/api/internal/identity"
)

const (
	lessonsPrefix    = "/api/v1/lessons/lesson/"
	notesPrefix      = "/api/v1/lessons/lesson-note/"
	recordingsPrefix = "/api/v1/lessons/lesson-recording/"
	attendancePrefix = "/api/v1/lessons/lesson-attendance/"
)

// Store is what the handler needs from the database.
type Store interface {
	Viewer(ctx context.Context, userID int64, role string) (Viewer, error)
	ListLessons(ctx context.Context, v Viewer, f LessonFilter, page httpx.Page) ([]Lesson, int64, error)
	Lesson(ctx context.Context, v Viewer, id int64) (Lesson, error)
	ClassOwner(ctx context.Context, classID int64) (school, teacher int64, err error)
	CreateLesson(ctx context.Context, classID int64, d Draft) (int64, error)
	UpdateLesson(ctx context.Context, id int64, d Draft) error
	DeleteLesson(ctx context.Context, id int64) error
	Notes(ctx context.Context, lessonID int64) ([]Note, error)
	Note(ctx context.Context, id int64) (Note, error)
	CreateNote(ctx context.Context, lessonID int64, blocks []byte) (Note, error)
	UpdateNote(ctx context.Context, id int64, blocks []byte) (Note, error)
	DeleteNote(ctx context.Context, id int64) error
	Recordings(ctx context.Context, lessonID int64) ([]Recording, error)
	Recording(ctx context.Context, id int64) (Recording, error)
	CreateRecording(ctx context.Context, lessonID int64, link string, seconds int32) (Recording, error)
	DeleteRecording(ctx context.Context, id int64) error
	Attendance(ctx context.Context, lessonID int64, everyone bool, learners []int64) ([]Attendance, error)
	Enrolled(ctx context.Context, classID, studentID int64) (bool, error)
	RecordAttendance(ctx context.Context, a Attendance) (Attendance, bool, error)
}

// Handler serves lessons, notes, recordings and lesson attendance.
type Handler struct {
	store       Store
	requireUser func(http.Handler) http.Handler
}

func NewHandler(store Store, requireUser func(http.Handler) http.Handler) *Handler {
	return &Handler{store: store, requireUser: requireUser}
}

// Mount registers the routes. Other methods on these paths get 405 rather
// than falling through to Django.
func (h *Handler) Mount(r chi.Router) {
	r.Group(func(r chi.Router) {
		r.Use(h.requireUser)
		r.Get(lessonsPrefix, h.listLessons)
		r.Post(lessonsPrefix, h.createLesson)
		r.Get(lessonsPrefix+"{id}/", h.getLesson)
		r.Patch(lessonsPrefix+"{id}/", h.updateLesson)
		r.Delete(lessonsPrefix+"{id}/", h.deleteLesson)
		r.Get(notesPrefix, h.listNotes)
		r.Post(notesPrefix, h.createNote)
		r.Patch(notesPrefix+"{id}/", h.updateNote)
		r.Delete(notesPrefix+"{id}/", h.deleteNote)
		r.Get(recordingsPrefix, h.listRecordings)
		r.Post(recordingsPrefix, h.createRecording)
		r.Delete(recordingsPrefix+"{id}/", h.deleteRecording)
		r.Get(attendancePrefix, h.listAttendance)
		r.Post(attendancePrefix, h.recordAttendance)
	})
	for _, p := range []string{lessonsPrefix, notesPrefix, recordingsPrefix, attendancePrefix} {
		r.HandleFunc(p+"*", func(w http.ResponseWriter, _ *http.Request) {
			httpx.WriteError(w, http.StatusMethodNotAllowed, "method_not_allowed", "This action isn't available.")
		})
	}
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

// visibleLesson loads a lesson the viewer can see, writing 404 otherwise.
func (h *Handler) visibleLesson(w http.ResponseWriter, r *http.Request, v Viewer, lessonID int64) (Lesson, bool) {
	l, err := h.store.Lesson(r.Context(), v, lessonID)
	if errors.Is(err, ErrNotFound) {
		notFound(w)
		return Lesson{}, false
	}
	if err != nil {
		serverError(w, "get lesson", err)
		return Lesson{}, false
	}
	return l, true
}

// managedLesson loads a lesson the viewer plans, writing 404 or 403 otherwise.
func (h *Handler) managedLesson(w http.ResponseWriter, r *http.Request, v Viewer, lessonID int64) (Lesson, bool) {
	l, ok := h.visibleLesson(w, r, v, lessonID)
	if !ok {
		return Lesson{}, false
	}
	if !v.manages(l.school, l.teacher) {
		forbidden(w, "Only the class's teacher or the school's leaders can change its lessons.")
		return Lesson{}, false
	}
	return l, true
}

// ---- lessons ------------------------------------------------------------------

func (h *Handler) listLessons(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	q := r.URL.Query()
	f := LessonFilter{ParentClass: queryID(q.Get("parent_class")), Topic: queryID(q.Get("topic"))}
	if m := q.Get("access_mode"); m != "" {
		f.AccessMode = &m
	}
	page := httpx.ParsePage(r)
	items, count, err := h.store.ListLessons(r.Context(), v, f, page)
	if err != nil {
		serverError(w, "list lessons", err)
		return
	}
	httpx.WritePage(w, r, page, count, items)
}

func (h *Handler) getLesson(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	if l, ok := h.visibleLesson(w, r, v, pathID(r)); ok {
		httpx.WriteJSON(w, http.StatusOK, l)
	}
}

func (h *Handler) createLesson(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	var in LessonInput
	if err := httpx.DecodeJSON(r, &in); err != nil {
		badRequest(w, "The request body must be JSON.")
		return
	}
	school, teacher, err := h.store.ClassOwner(r.Context(), in.ParentClass)
	if errors.Is(err, ErrNotFound) {
		badRequest(w, "That class doesn't exist.")
		return
	}
	if err != nil {
		serverError(w, "load class", err)
		return
	}
	if !v.manages(school, teacher) {
		forbidden(w, "Only the class's teacher or the school's leaders can plan its lessons.")
		return
	}
	d, msg := in.merge(Draft{AccessMode: draft})
	if msg != "" {
		badRequest(w, msg)
		return
	}
	newID, err := h.store.CreateLesson(r.Context(), in.ParentClass, d)
	if !writeFailed(w, err, "create lesson") {
		h.respondLesson(w, r, v, newID, http.StatusCreated)
	}
}

func (h *Handler) updateLesson(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	l, ok := h.managedLesson(w, r, v, pathID(r))
	if !ok {
		return
	}
	var in LessonInput
	if err := httpx.DecodeJSON(r, &in); err != nil {
		badRequest(w, "The request body must be JSON.")
		return
	}
	if in.ParentClass != 0 && in.ParentClass != l.ParentClass {
		badRequest(w, "A lesson can't move to another class.")
		return
	}
	d, msg := in.merge(draftOf(l))
	if msg != "" {
		badRequest(w, msg)
		return
	}
	if !writeFailed(w, h.store.UpdateLesson(r.Context(), l.ID, d), "update lesson") {
		h.respondLesson(w, r, v, l.ID, http.StatusOK)
	}
}

func (h *Handler) deleteLesson(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	l, ok := h.managedLesson(w, r, v, pathID(r))
	if !ok {
		return
	}
	err := h.store.DeleteLesson(r.Context(), l.ID)
	switch {
	case errors.Is(err, ErrInUse):
		httpx.WriteError(w, http.StatusConflict, "in_use",
			"This lesson has attendance, a live session or other history. Set it to draft to hide it instead.")
	case err != nil:
		serverError(w, "delete lesson", err)
	default:
		w.WriteHeader(http.StatusNoContent)
	}
}

func (h *Handler) respondLesson(w http.ResponseWriter, r *http.Request, v Viewer, lessonID int64, status int) {
	l, err := h.store.Lesson(r.Context(), v, lessonID)
	if err != nil {
		serverError(w, "reload lesson", err)
		return
	}
	httpx.WriteJSON(w, status, l)
}

// ---- notes --------------------------------------------------------------------

func (h *Handler) listNotes(w http.ResponseWriter, r *http.Request) {
	h.listForLesson(w, r, func(ctx context.Context, lessonID int64) (any, int, error) {
		notes, err := h.store.Notes(ctx, lessonID)
		return notes, len(notes), err
	})
}

func (h *Handler) createNote(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	var in struct {
		Lesson        int64           `json:"lesson"`
		ContentBlocks json.RawMessage `json:"content_blocks"`
	}
	if err := httpx.DecodeJSON(r, &in); err != nil || !validBlocks(in.ContentBlocks) {
		badRequest(w, "Send the lesson id and content_blocks as a JSON object or list.")
		return
	}
	l, ok := h.managedLesson(w, r, v, in.Lesson)
	if !ok {
		return
	}
	note, err := h.store.CreateNote(r.Context(), l.ID, in.ContentBlocks)
	if err != nil {
		serverError(w, "create note", err)
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, note)
}

func (h *Handler) updateNote(w http.ResponseWriter, r *http.Request) {
	note, ok := h.managedNote(w, r)
	if !ok {
		return
	}
	var in struct {
		ContentBlocks json.RawMessage `json:"content_blocks"`
	}
	if err := httpx.DecodeJSON(r, &in); err != nil || !validBlocks(in.ContentBlocks) {
		badRequest(w, "Send content_blocks as a JSON object or list.")
		return
	}
	updated, err := h.store.UpdateNote(r.Context(), note.ID, in.ContentBlocks)
	if err != nil {
		serverError(w, "update note", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, updated)
}

func (h *Handler) deleteNote(w http.ResponseWriter, r *http.Request) {
	note, ok := h.managedNote(w, r)
	if !ok {
		return
	}
	if err := h.store.DeleteNote(r.Context(), note.ID); err != nil {
		serverError(w, "delete note", err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// managedNote loads the note named by {id} if the viewer plans its lesson.
func (h *Handler) managedNote(w http.ResponseWriter, r *http.Request) (Note, bool) {
	v, ok := h.viewer(w, r)
	if !ok {
		return Note{}, false
	}
	note, err := h.store.Note(r.Context(), pathID(r))
	if errors.Is(err, ErrNotFound) {
		notFound(w)
		return Note{}, false
	}
	if err != nil {
		serverError(w, "get note", err)
		return Note{}, false
	}
	_, ok = h.managedLesson(w, r, v, note.Lesson)
	return note, ok
}

// ---- recordings -----------------------------------------------------------------

func (h *Handler) listRecordings(w http.ResponseWriter, r *http.Request) {
	h.listForLesson(w, r, func(ctx context.Context, lessonID int64) (any, int, error) {
		recs, err := h.store.Recordings(ctx, lessonID)
		return recs, len(recs), err
	})
}

func (h *Handler) createRecording(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	var in struct {
		Lesson   int64  `json:"lesson"`
		URL      string `json:"url"`
		Duration int32  `json:"duration"`
	}
	if err := httpx.DecodeJSON(r, &in); err != nil || !safeURL(in.URL) || in.Duration < 0 || in.Duration > maxRecordingSec {
		badRequest(w, "Send the lesson id, a web address starting with http:// or https://, and the length in seconds.")
		return
	}
	l, ok := h.managedLesson(w, r, v, in.Lesson)
	if !ok {
		return
	}
	rec, err := h.store.CreateRecording(r.Context(), l.ID, in.URL, in.Duration)
	if err != nil {
		serverError(w, "create recording", err)
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, rec)
}

func (h *Handler) deleteRecording(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	rec, err := h.store.Recording(r.Context(), pathID(r))
	if errors.Is(err, ErrNotFound) {
		notFound(w)
		return
	}
	if err != nil {
		serverError(w, "get recording", err)
		return
	}
	if _, ok := h.managedLesson(w, r, v, rec.Lesson); !ok {
		return
	}
	if err := h.store.DeleteRecording(r.Context(), rec.ID); err != nil {
		serverError(w, "delete recording", err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ---- attendance -------------------------------------------------------------------

func (h *Handler) listAttendance(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	lessonID := queryID(r.URL.Query().Get("lesson"))
	if lessonID == nil {
		badRequest(w, "Choose a lesson (?lesson=).")
		return
	}
	l, ok := h.visibleLesson(w, r, v, *lessonID)
	if !ok {
		return
	}
	rows, err := h.store.Attendance(r.Context(), l.ID, v.manages(l.school, l.teacher), v.Learners)
	if err != nil {
		serverError(w, "list attendance", err)
		return
	}
	writeAll(w, rows, len(rows))
}

func (h *Handler) recordAttendance(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	var in struct {
		Lesson          int64  `json:"lesson"`
		Student         int64  `json:"student"`
		Status          string `json:"status"`
		DurationMinutes int32  `json:"duration_minutes"`
	}
	if err := httpx.DecodeJSON(r, &in); err != nil || !slices.Contains(attendanceStatuses, in.Status) ||
		in.DurationMinutes < 0 || in.DurationMinutes > maxLessonMins {
		badRequest(w, "Send the lesson, the student, a status of present, absent or late, and minutes attended (0–600).")
		return
	}
	l, ok := h.managedLesson(w, r, v, in.Lesson)
	if !ok {
		return
	}
	enrolled, err := h.store.Enrolled(r.Context(), l.ParentClass, in.Student)
	if err != nil {
		serverError(w, "check enrolment", err)
		return
	}
	if !enrolled {
		badRequest(w, "That student isn't enrolled in this class.")
		return
	}
	saved, created, err := h.store.RecordAttendance(r.Context(), Attendance{
		Lesson: l.ID, Student: in.Student, Status: in.Status, DurationMinutes: in.DurationMinutes,
	})
	if err != nil {
		serverError(w, "record attendance", err)
		return
	}
	status := http.StatusOK
	if created {
		status = http.StatusCreated
	}
	httpx.WriteJSON(w, status, saved)
}

// ---- helpers ------------------------------------------------------------------

// listForLesson serves a ?lesson= list of rows that are visible with their lesson.
func (h *Handler) listForLesson(w http.ResponseWriter, r *http.Request, load func(context.Context, int64) (any, int, error)) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	lessonID := queryID(r.URL.Query().Get("lesson"))
	if lessonID == nil {
		badRequest(w, "Choose a lesson (?lesson=).")
		return
	}
	if _, ok := h.visibleLesson(w, r, v, *lessonID); !ok {
		return
	}
	rows, n, err := load(r.Context(), *lessonID)
	if err != nil {
		serverError(w, "list lesson items", err)
		return
	}
	writeAll(w, rows, n)
}

// writeAll writes a short, complete list in DRF's page envelope.
func writeAll(w http.ResponseWriter, results any, n int) {
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"count": n, "next": nil, "previous": nil, "results": results})
}

func writeFailed(w http.ResponseWriter, err error, action string) bool {
	switch {
	case err == nil:
		return false
	case errors.Is(err, ErrBadRef):
		badRequest(w, "That topic doesn't exist.")
	default:
		serverError(w, action, err)
	}
	return true
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
	slog.Error("lessons: "+action, "err", err)
	httpx.WriteError(w, http.StatusInternalServerError, "server_error", "Something went wrong. Please try again.")
}
