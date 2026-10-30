package library

import (
	"context"
	"errors"
	"log/slog"
	"math"
	"net/http"
	"slices"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/O-Mario88/maple-online-School/api/internal/httpx"
	"github.com/O-Mario88/maple-online-School/api/internal/identity"
)

const (
	prefix      = "/api/v1/library/"
	itemsPrefix = prefix + "items/"
	maxSearch   = 100
)

// Store is what the handler needs from the database.
type Store interface {
	Viewer(ctx context.Context, userID int64, role string) (Viewer, error)
	List(ctx context.Context, v Viewer, f Filter, page httpx.Page) ([]Item, int64, error)
	Get(ctx context.Context, v Viewer, id pgtype.UUID) (Item, error)
	Create(ctx context.Context, by int64, d Draft) (pgtype.UUID, error)
	Update(ctx context.Context, by int64, before Item, d Draft, action, notes string) error
	Archive(ctx context.Context, by int64, item Item) error
	SaveProgress(ctx context.Context, studentID int64, p ProgressInput) (Progress, error)
	Continue(ctx context.Context, studentID int64) ([]Continue, error)
}

// Handler serves the library.
type Handler struct {
	store       Store
	requireUser func(http.Handler) http.Handler
}

func NewHandler(store Store, requireUser func(http.Handler) http.Handler) *Handler {
	return &Handler{store: store, requireUser: requireUser}
}

// Mount registers the routes. Everything under /api/v1/library/ is Go's.
func (h *Handler) Mount(r chi.Router) {
	r.Group(func(r chi.Router) {
		r.Use(h.requireUser)
		r.Get(itemsPrefix, h.list)
		r.Post(itemsPrefix, h.create)
		r.Get(itemsPrefix+"{id}/", h.get)
		r.Patch(itemsPrefix+"{id}/", h.update)
		r.Delete(itemsPrefix+"{id}/", h.archive)
		r.Post(itemsPrefix+"{id}/moderate/", h.moderate)
		r.Post(prefix+"progress/", h.progress)
		r.Get(prefix+"continue/", h.continueList)
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

// visible loads an item the viewer can see, writing 404 otherwise.
func (h *Handler) visible(w http.ResponseWriter, r *http.Request, v Viewer, raw string) (Item, bool) {
	itemID, err := parseID(raw)
	if err == nil {
		var item Item
		if item, err = h.store.Get(r.Context(), v, itemID); err == nil {
			return item, true
		}
	}
	if errors.Is(err, ErrNotFound) {
		notFound(w)
	} else {
		serverError(w, "get item", err)
	}
	return Item{}, false
}

// ---- items --------------------------------------------------------------------

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	q := r.URL.Query()
	f := Filter{
		ContentType: param(q.Get("content_type")), Status: param(q.Get("status")),
		Subject: queryID(q.Get("subject")), Topic: queryID(q.Get("topic")), ClassLevel: queryID(q.Get("class_level")),
		MineOnly: q.Get("mine") == "1" || q.Get("mine") == "true",
	}
	if s := strings.TrimSpace(q.Get("q")); s != "" {
		if len(s) > maxSearch {
			s = s[:maxSearch]
		}
		f.Search = &s
	}
	page := httpx.ParsePage(r)
	items, count, err := h.store.List(r.Context(), v, f, page)
	if err != nil {
		serverError(w, "list items", err)
		return
	}
	httpx.WritePage(w, r, page, count, items)
}

func (h *Handler) get(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	if item, ok := h.visible(w, r, v, chi.URLParam(r, "id")); ok {
		httpx.WriteJSON(w, http.StatusOK, item)
	}
}

func (h *Handler) create(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	var in Input
	if err := httpx.DecodeJSON(r, &in); err != nil {
		badRequest(w, "The request body must be JSON.")
		return
	}
	d, ok := checkDraft(w, v, in.merge(newDraft()))
	if !ok {
		return
	}
	newID, err := h.store.Create(r.Context(), v.UserID, d)
	if writeFailed(w, err, "create item") {
		return
	}
	h.respond(w, r, v, newID, http.StatusCreated)
}

func (h *Handler) update(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	item, ok := h.visible(w, r, v, chi.URLParam(r, "id"))
	if !ok {
		return
	}
	if item.UploadedBy != v.UserID {
		forbidden(w, "Only the person who added an item can change it.")
		return
	}
	var in Input
	if err := httpx.DecodeJSON(r, &in); err != nil {
		badRequest(w, "The request body must be JSON.")
		return
	}
	d, ok := checkDraft(w, v, in.merge(draftOf(item)))
	if !ok {
		return
	}
	if writeFailed(w, h.store.Update(r.Context(), v.UserID, item, d, "updated", ""), "update item") {
		return
	}
	itemID, _ := parseID(item.ID)
	h.respond(w, r, v, itemID, http.StatusOK)
}

func (h *Handler) archive(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	item, ok := h.visible(w, r, v, chi.URLParam(r, "id"))
	if !ok {
		return
	}
	schoolLeader := item.OwnerInstitution != nil && slices.Contains(v.Leaders, *item.OwnerInstitution)
	if item.UploadedBy != v.UserID && !schoolLeader && !v.isAdmin() {
		forbidden(w, "Only the person who added an item, their school's leaders or an administrator can remove it.")
		return
	}
	if err := h.store.Archive(r.Context(), v.UserID, item); err != nil {
		serverError(w, "archive item", err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// moderate lets an administrator approve or reject a platform-wide item.
func (h *Handler) moderate(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	if !v.isAdmin() {
		forbidden(w, "Only Maple administrators review platform-wide items.")
		return
	}
	item, ok := h.visible(w, r, v, chi.URLParam(r, "id"))
	if !ok {
		return
	}
	var in struct {
		Decision string `json:"decision"`
		Reason   string `json:"reason"`
	}
	if err := httpx.DecodeJSON(r, &in); err != nil {
		badRequest(w, "Send a decision of approve or reject.")
		return
	}
	in.Reason = strings.TrimSpace(in.Reason)
	d := draftOf(item)
	switch {
	case item.VisibilityScope != Global:
		badRequest(w, "Only platform-wide items are reviewed.")
		return
	case in.Decision == "approve":
		d.Status, d.Moderation, d.RejectionReason = Published, "approved", ""
	case in.Decision == "reject" && in.Reason != "" && len(in.Reason) <= maxReason:
		d.Status, d.Moderation, d.RejectionReason = Rejected, "rejected", in.Reason
	default:
		badRequest(w, "Approve, or reject with a reason the author will see.")
		return
	}
	if writeFailed(w, h.store.Update(r.Context(), v.UserID, item, d, "moderated", in.Reason), "moderate item") {
		return
	}
	itemID, _ := parseID(item.ID)
	h.respond(w, r, v, itemID, http.StatusOK)
}

// ---- progress -------------------------------------------------------------------

func (h *Handler) progress(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	if v.Role != "student" {
		forbidden(w, "Progress is recorded for learners.")
		return
	}
	var in struct {
		Item          string  `json:"item"`
		Completion    float64 `json:"completion"`
		Position      int32   `json:"position"`
		ActiveSeconds int32   `json:"active_seconds"`
		NewVisit      bool    `json:"new_visit"`
	}
	if err := httpx.DecodeJSON(r, &in); err != nil || math.IsNaN(in.Completion) || in.Completion < 0 || in.Completion > 100 ||
		in.Position < 0 || in.ActiveSeconds < 0 || in.ActiveSeconds > maxActive {
		badRequest(w, "Send the item, completion from 0 to 100, and the position and active seconds.")
		return
	}
	item, ok := h.visible(w, r, v, in.Item)
	if !ok {
		return
	}
	itemID, _ := parseID(item.ID)
	saved, err := h.store.SaveProgress(r.Context(), v.UserID, ProgressInput{
		Item: itemID, Completion: in.Completion, Position: in.Position, ActiveSeconds: in.ActiveSeconds, NewVisit: in.NewVisit,
	})
	if err != nil {
		serverError(w, "save progress", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, saved)
}

func (h *Handler) continueList(w http.ResponseWriter, r *http.Request) {
	user := identity.UserFrom(r.Context())
	rows, err := h.store.Continue(r.Context(), user.ID)
	if err != nil {
		serverError(w, "continue list", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"count": len(rows), "next": nil, "previous": nil, "results": rows})
}

// ---- helpers ------------------------------------------------------------------

// checkDraft validates, authorises and settles a draft, writing 400 or 403 on failure.
func checkDraft(w http.ResponseWriter, v Viewer, d Draft) (Draft, bool) {
	if msg := d.check(); msg != "" {
		badRequest(w, msg)
		return d, false
	}
	if msg := d.allowed(v); msg != "" {
		forbidden(w, msg)
		return d, false
	}
	return d.settle(v), true
}

func (h *Handler) respond(w http.ResponseWriter, r *http.Request, v Viewer, itemID pgtype.UUID, status int) {
	item, err := h.store.Get(r.Context(), v, itemID)
	if err != nil {
		serverError(w, "reload item", err)
		return
	}
	httpx.WriteJSON(w, status, item)
}

func writeFailed(w http.ResponseWriter, err error, action string) bool {
	switch {
	case err == nil:
		return false
	case errors.Is(err, ErrBadRef):
		badRequest(w, "Unknown school, subject, topic or class level.")
	default:
		serverError(w, action, err)
	}
	return true
}

func queryID(s string) *int64 {
	n, err := strconv.ParseInt(s, 10, 64)
	if err != nil || n <= 0 {
		return nil
	}
	return &n
}

func param(s string) *string {
	s = strings.TrimSpace(s)
	if s == "" {
		return nil
	}
	return &s
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
	slog.Error("library: "+action, "err", err)
	httpx.WriteError(w, http.StatusInternalServerError, "server_error", "Something went wrong. Please try again.")
}
