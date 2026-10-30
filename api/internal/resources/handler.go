package resources

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"slices"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/httpx"
	"github.com/O-Mario88/maple-online-School/api/internal/identity"
)

const (
	resourcesPrefix = "/api/v1/resources/"
	linksPrefix     = "/api/v1/resources/shared-resource-link/"
	maxSearch       = 100
)

// Store is what the handler needs from the database.
type Store interface {
	Viewer(ctx context.Context, userID int64, role string) (Viewer, error)
	List(ctx context.Context, v Viewer, f Filter, page httpx.Page) ([]Resource, int64, error)
	Get(ctx context.Context, v Viewer, id int64) (Resource, error)
	Create(ctx context.Context, uploader int64, d Draft) (int64, error)
	Update(ctx context.Context, id int64, d Draft) error
	Delete(ctx context.Context, id int64) error
	ListLinks(ctx context.Context, v Viewer, f LinkFilter, page httpx.Page) ([]Link, int64, error)
	ClassOwner(ctx context.Context, classID int64) (school, teacher int64, err error)
	CreateLink(ctx context.Context, by int64, r Resource, classID int64) (Link, error)
	LinkOwner(ctx context.Context, id int64) (LinkOwner, error)
	DeleteLink(ctx context.Context, id int64) error
}

// Handler serves the resource library and class resource links.
type Handler struct {
	store       Store
	requireUser func(http.Handler) http.Handler
}

func NewHandler(store Store, requireUser func(http.Handler) http.Handler) *Handler {
	return &Handler{store: store, requireUser: requireUser}
}

// Mount registers the routes. Other methods on these paths get 405 rather
// than falling through to Django. Uploads stay at /api/v1/resources-upload/.
func (h *Handler) Mount(r chi.Router) {
	r.Group(func(r chi.Router) {
		r.Use(h.requireUser)
		r.Get(linksPrefix, h.listLinks)
		r.Post(linksPrefix, h.createLink)
		r.Delete(linksPrefix+"{id}/", h.deleteLink)
		r.Get(resourcesPrefix, h.list)
		r.Post(resourcesPrefix, h.create)
		r.Get(resourcesPrefix+"{id}/", h.get)
		r.Patch(resourcesPrefix+"{id}/", h.update)
		r.Delete(resourcesPrefix+"{id}/", h.delete)
	})
	r.HandleFunc(resourcesPrefix+"*", func(w http.ResponseWriter, _ *http.Request) {
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

// ---- resources ----------------------------------------------------------------

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	q := r.URL.Query()
	f := Filter{Category: param(q.Get("category")), Visibility: param(q.Get("visibility")), Subject: queryID(q.Get("subject")), Sort: "-created_at"}
	if s := strings.TrimSpace(q.Get("search")); s != "" {
		if len(s) > maxSearch {
			s = s[:maxSearch]
		}
		f.Search = &s
	}
	if o := q.Get("ordering"); slices.Contains(sorts, o) {
		f.Sort = o
	}
	page := httpx.ParsePage(r)
	items, count, err := h.store.List(r.Context(), v, f, page)
	if err != nil {
		serverError(w, "list resources", err)
		return
	}
	httpx.WritePage(w, r, page, count, items)
}

func (h *Handler) get(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	if res, ok := h.visible(w, r, v, pathID(r)); ok {
		httpx.WriteJSON(w, http.StatusOK, res)
	}
}

func (h *Handler) create(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	var in Input
	if err := httpx.DecodeJSON(r, &in); err != nil {
		badRequest(w, "Send the resource as JSON. To upload a file, use /api/v1/resources-upload/upload/.")
		return
	}
	d, ok := checkDraft(w, v, in.merge(Draft{Visibility: Private}))
	if !ok {
		return
	}
	newID, err := h.store.Create(r.Context(), v.UserID, d)
	if !writeFailed(w, err, "create resource") {
		h.respond(w, r, v, newID, http.StatusCreated)
	}
}

func (h *Handler) update(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	res, ok := h.visible(w, r, v, pathID(r))
	if !ok {
		return
	}
	if res.UploadedBy != v.UserID {
		forbidden(w, "Only the person who added a resource can change it.")
		return
	}
	var in Input
	if err := httpx.DecodeJSON(r, &in); err != nil {
		badRequest(w, "The request body must be JSON.")
		return
	}
	d, ok := checkDraft(w, v, in.merge(draftOf(res)))
	if !ok {
		return
	}
	if !writeFailed(w, h.store.Update(r.Context(), res.ID, d), "update resource") {
		h.respond(w, r, v, res.ID, http.StatusOK)
	}
}

func (h *Handler) delete(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	res, ok := h.visible(w, r, v, pathID(r))
	if !ok {
		return
	}
	schoolLeader := res.OwnerInstitution != nil && v.leaderOf(*res.OwnerInstitution)
	if res.UploadedBy != v.UserID && !schoolLeader {
		forbidden(w, "Only the person who added a resource, or their school's leaders, can remove it.")
		return
	}
	if err := h.store.Delete(r.Context(), res.ID); err != nil {
		serverError(w, "delete resource", err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// checkDraft validates and authorises a draft, writing 400 or 403 on failure.
func checkDraft(w http.ResponseWriter, v Viewer, d Draft) (Draft, bool) {
	d, msg := d.clean()
	if msg != "" {
		badRequest(w, msg)
		return d, false
	}
	if msg := d.allowed(v); msg != "" {
		forbidden(w, msg)
		return d, false
	}
	return d.withOwnerType(v), true
}

func (h *Handler) respond(w http.ResponseWriter, r *http.Request, v Viewer, resourceID int64, status int) {
	res, err := h.store.Get(r.Context(), v, resourceID)
	if err != nil {
		serverError(w, "reload resource", err)
		return
	}
	httpx.WriteJSON(w, status, res)
}

func (h *Handler) visible(w http.ResponseWriter, r *http.Request, v Viewer, resourceID int64) (Resource, bool) {
	res, err := h.store.Get(r.Context(), v, resourceID)
	if errors.Is(err, ErrNotFound) {
		notFound(w)
		return Resource{}, false
	}
	if err != nil {
		serverError(w, "get resource", err)
		return Resource{}, false
	}
	return res, true
}

// ---- class links --------------------------------------------------------------

func (h *Handler) listLinks(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	q := r.URL.Query()
	page := httpx.ParsePage(r)
	links, count, err := h.store.ListLinks(r.Context(), v, LinkFilter{TargetClass: queryID(q.Get("target_class")), Resource: queryID(q.Get("resource"))}, page)
	if err != nil {
		serverError(w, "list links", err)
		return
	}
	httpx.WritePage(w, r, page, count, links)
}

func (h *Handler) createLink(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	var in struct {
		Resource    int64 `json:"resource"`
		TargetClass int64 `json:"target_class"`
	}
	if err := httpx.DecodeJSON(r, &in); err != nil || in.Resource <= 0 || in.TargetClass <= 0 {
		badRequest(w, "Send the resource and target_class ids.")
		return
	}
	school, teacher, err := h.store.ClassOwner(r.Context(), in.TargetClass)
	if errors.Is(err, ErrNotFound) {
		badRequest(w, "That class doesn't exist.")
		return
	}
	if err != nil {
		serverError(w, "load class", err)
		return
	}
	if teacher != v.UserID && !v.leaderOf(school) {
		forbidden(w, "Only the class's teacher or the school's leaders can share resources with it.")
		return
	}
	res, err := h.store.Get(r.Context(), v, in.Resource)
	if errors.Is(err, ErrNotFound) {
		badRequest(w, "That resource doesn't exist.")
		return
	}
	if err != nil {
		serverError(w, "get resource", err)
		return
	}
	if !shareableWith(res, school) {
		badRequest(w, "Add the resource to your school's library before sharing it with a class.")
		return
	}
	link, err := h.store.CreateLink(r.Context(), v.UserID, res, in.TargetClass)
	if errors.Is(err, ErrDuplicate) {
		badRequest(w, "This resource is already shared with that class.")
		return
	}
	if err != nil {
		serverError(w, "create link", err)
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, link)
}

func (h *Handler) deleteLink(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	owner, err := h.store.LinkOwner(r.Context(), pathID(r))
	if errors.Is(err, ErrNotFound) {
		notFound(w)
		return
	}
	if err != nil {
		serverError(w, "load link", err)
		return
	}
	if owner.AddedBy != v.UserID && owner.Teacher != v.UserID && !v.leaderOf(owner.School) {
		forbidden(w, "Only the class's teacher or the school's leaders can remove shared resources.")
		return
	}
	if err := h.store.DeleteLink(r.Context(), pathID(r)); err != nil {
		serverError(w, "delete link", err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ---- helpers ------------------------------------------------------------------

func writeFailed(w http.ResponseWriter, err error, action string) bool {
	switch {
	case err == nil:
		return false
	case errors.Is(err, ErrBadRef):
		badRequest(w, "Unknown school, subject, class level or topic.")
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
	slog.Error("resources: "+action, "err", err)
	httpx.WriteError(w, http.StatusInternalServerError, "server_error", "Something went wrong. Please try again.")
}
