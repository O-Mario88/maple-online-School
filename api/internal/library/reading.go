package library

import (
	"errors"
	"net/http"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/httpx"
)

const maxNote = 1_000

// runsClass reports whether the viewer can manage a class's reading list:
// its teacher, or a leader of its school.
func (v Viewer) runsClass(school, teacher int64) bool {
	return slices.Contains(v.Leaders, school) || (teacher == v.UserID && slices.Contains(v.Staff, school))
}

// shareableWith reports whether the class's members may open the item once
// it is on their list.
func shareableWith(item Item, school int64, v Viewer) bool {
	switch item.VisibilityScope {
	case Global:
		return item.PublicationStatus == Published
	case Institution:
		return item.OwnerInstitution != nil && *item.OwnerInstitution == school
	case Class:
		return item.PublicationStatus == Published
	case Private:
		return item.UploadedBy == v.UserID // the owner opens it up to the class
	}
	return false
}

// classToRun loads the class named by the path or body and checks the viewer runs it.
func (h *Handler) classToRun(w http.ResponseWriter, r *http.Request, v Viewer, classID int64) (int64, bool) {
	school, teacher, err := h.store.ClassOwner(r.Context(), classID)
	if errors.Is(err, ErrNotFound) {
		badRequest(w, "That class doesn't exist.")
		return 0, false
	}
	if err != nil {
		serverError(w, "load class", err)
		return 0, false
	}
	if !v.runsClass(school, teacher) {
		forbidden(w, "Only the class's teacher or the school's leaders manage its reading list.")
		return 0, false
	}
	return school, true
}

func (h *Handler) share(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	var in struct {
		Class    int64   `json:"class"`
		DueDate  *string `json:"due_date"`
		Required *bool   `json:"required"`
		Note     string  `json:"note"`
	}
	if err := httpx.DecodeJSON(r, &in); err != nil || in.Class <= 0 || len(in.Note) > maxNote {
		badRequest(w, "Send the class, and optionally a due_date, required and a short note.")
		return
	}
	school, ok := h.classToRun(w, r, v, in.Class)
	if !ok {
		return
	}
	item, ok := h.visible(w, r, v, chi.URLParam(r, "id"))
	if !ok {
		return
	}
	if !shareableWith(item, school, v) {
		badRequest(w, "The class can't open this item. Share your own items, your school's library, or published Maple items.")
		return
	}
	sh := Share{Item: item, Class: in.Class, Required: in.Required == nil || *in.Required, Note: strings.TrimSpace(in.Note), By: v.UserID}
	if in.DueDate != nil {
		due, err := time.Parse(time.RFC3339, *in.DueDate)
		if err != nil {
			badRequest(w, "due_date must be a date and time like 2026-11-20T17:00:00+03:00.")
			return
		}
		sh.Due = &due
	}
	assigned, err := h.store.ShareWithClass(r.Context(), sh)
	if err != nil {
		serverError(w, "share", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"item": item.ID, "class": in.Class, "assigned": assigned})
}

func (h *Handler) unshare(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	classID, err := strconv.ParseInt(chi.URLParam(r, "class"), 10, 64)
	if err != nil {
		notFound(w)
		return
	}
	if _, ok := h.classToRun(w, r, v, classID); !ok {
		return
	}
	item, ok := h.visible(w, r, v, chi.URLParam(r, "id"))
	if !ok {
		return
	}
	if err := h.store.UnshareFromClass(r.Context(), item, classID, v.UserID); err != nil {
		serverError(w, "unshare", err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) readingList(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	classID, err := strconv.ParseInt(chi.URLParam(r, "class"), 10, 64)
	if err != nil {
		notFound(w)
		return
	}
	if _, ok := h.classToRun(w, r, v, classID); !ok {
		return
	}
	rows, err := h.store.ReadingList(r.Context(), classID)
	if err != nil {
		serverError(w, "reading list", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"count": len(rows), "next": nil, "previous": nil, "results": rows})
}

// assigned lists reading assigned to the student, or to a parent's children.
func (h *Handler) assigned(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	rows, err := h.store.AssignedReading(r.Context(), v.Learners)
	if err != nil {
		serverError(w, "assigned reading", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"count": len(rows), "next": nil, "previous": nil, "results": rows})
}
