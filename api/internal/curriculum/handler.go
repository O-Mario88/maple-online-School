package curriculum

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/httpx"
)

// ErrNotFound is returned when a subject or topic doesn't exist.
var ErrNotFound = errors.New("not found")

const treeTTL = 10 * time.Minute

type Country struct {
	ID     int64  `json:"id"`
	Code   string `json:"code"`
	Name   string `json:"name"`
	Active bool   `json:"active"`
}

type ClassLevel struct {
	ID                     int64  `json:"id"`
	Name                   string `json:"name"`
	Level                  int64  `json:"level"`
	InternalCanonicalGrade int32  `json:"internal_canonical_grade"`
}

// TopicRef matches Django's TopicSerializer, plus the ids apps filter by.
type TopicRef struct {
	ID             int64  `json:"id"`
	Name           string `json:"name"`
	Order          int32  `json:"order"`
	ClassLevelName string `json:"class_level_name"`
	Subject        int64  `json:"subject"`
	ClassLevel     int64  `json:"class_level"`
}

// SubjectDetail matches Django's SubjectSerializer.
type SubjectDetail struct {
	ID       int64      `json:"id"`
	Name     string     `json:"name"`
	Code     *string    `json:"code"`
	Category *string    `json:"category"`
	Topics   []TopicRef `json:"topics"`
}

type Competency struct {
	ID                int64   `json:"id"`
	Description       string  `json:"description"`
	Code              *string `json:"code"`
	CurriculumVersion int64   `json:"curriculum_version"`
	Topic             int64   `json:"topic"`
}

// Store is what the handler needs from the database.
type Store interface {
	Countries(ctx context.Context) ([]Country, error)
	ClassLevels(ctx context.Context) ([]ClassLevel, error)
	Subjects(ctx context.Context) ([]SubjectDetail, error)
	Subject(ctx context.Context, id int64) (SubjectDetail, error)
	Topics(ctx context.Context, subject, classLevel *int64) ([]TopicRef, error)
	Topic(ctx context.Context, id int64) (TopicRef, error)
	Competencies(ctx context.Context, topic *int64) ([]Competency, error)
	TreeRows(ctx context.Context) ([]TreeRow, error)
}

// Handler serves /api/v1/curriculum/... . The catalog tree is public; the
// rest needs a signed-in user, as in Django.
type Handler struct {
	store       Store
	requireUser func(http.Handler) http.Handler

	mu       sync.Mutex
	tree     *Tree
	treeTime time.Time
}

func NewHandler(store Store, requireUser func(http.Handler) http.Handler) *Handler {
	return &Handler{store: store, requireUser: requireUser}
}

// ownedPaths are read-only in Go; other methods on them get 405 rather than
// falling through to Django. Resource quality reviews stay on Django until
// the resources module moves.
var ownedPaths = []string{"full-tree", "countries", "class-levels", "subjects", "topics", "topic-competencies"}

// Mount registers the routes.
func (h *Handler) Mount(r chi.Router) {
	for _, p := range ownedPaths {
		r.HandleFunc("/api/v1/curriculum/"+p+"/*", func(w http.ResponseWriter, _ *http.Request) {
			httpx.WriteError(w, http.StatusMethodNotAllowed, "method_not_allowed", "This action isn't available.")
		})
	}
	r.Get("/api/v1/curriculum/full-tree/", h.fullTree)
	r.Group(func(r chi.Router) {
		r.Use(h.requireUser)
		r.Get("/api/v1/curriculum/countries/", list(h, func(ctx context.Context, _ *http.Request) (any, int, error) {
			v, err := h.store.Countries(ctx)
			return v, len(v), err
		}))
		r.Get("/api/v1/curriculum/class-levels/", list(h, func(ctx context.Context, _ *http.Request) (any, int, error) {
			v, err := h.store.ClassLevels(ctx)
			return v, len(v), err
		}))
		r.Get("/api/v1/curriculum/subjects/", list(h, func(ctx context.Context, _ *http.Request) (any, int, error) {
			v, err := h.store.Subjects(ctx)
			return v, len(v), err
		}))
		r.Get("/api/v1/curriculum/topics/", list(h, func(ctx context.Context, r *http.Request) (any, int, error) {
			v, err := h.store.Topics(ctx, queryID(r, "subject"), queryID(r, "class_level"))
			return v, len(v), err
		}))
		r.Get("/api/v1/curriculum/topic-competencies/", list(h, func(ctx context.Context, r *http.Request) (any, int, error) {
			v, err := h.store.Competencies(ctx, queryID(r, "topic"))
			return v, len(v), err
		}))
		r.Get("/api/v1/curriculum/subjects/{id}/", h.subject)
		r.Get("/api/v1/curriculum/topics/{id}/", h.topic)
	})
}

// list writes a whole list in DRF's page envelope (one page).
func list(h *Handler, load func(context.Context, *http.Request) (any, int, error)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		results, n, err := load(r.Context(), r)
		if err != nil {
			serverError(w, "list curriculum", err)
			return
		}
		if n == 0 {
			results = []any{}
		}
		httpx.WriteJSON(w, http.StatusOK, map[string]any{"count": n, "next": nil, "previous": nil, "results": results})
	}
}

func (h *Handler) subject(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	s, err := h.store.Subject(r.Context(), id)
	writeOne(w, s, err)
}

func (h *Handler) topic(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	t, err := h.store.Topic(r.Context(), id)
	writeOne(w, t, err)
}

func writeOne(w http.ResponseWriter, v any, err error) {
	switch {
	case errors.Is(err, ErrNotFound):
		httpx.WriteError(w, http.StatusNotFound, "not_found", "Not found.")
	case err != nil:
		serverError(w, "get curriculum item", err)
	default:
		httpx.WriteJSON(w, http.StatusOK, v)
	}
}

// fullTree serves the catalog, rebuilt at most every ten minutes.
func (h *Handler) fullTree(w http.ResponseWriter, r *http.Request) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.tree == nil || time.Since(h.treeTime) > treeTTL {
		rows, err := h.store.TreeRows(r.Context())
		if err != nil {
			serverError(w, "build tree", err)
			return
		}
		tree := BuildTree(rows)
		h.tree, h.treeTime = &tree, time.Now()
	}
	w.Header().Set("Cache-Control", "public, max-age=600")
	httpx.WriteJSON(w, http.StatusOK, h.tree)
}

func queryID(r *http.Request, key string) *int64 {
	id, err := strconv.ParseInt(r.URL.Query().Get(key), 10, 64)
	if err != nil || id <= 0 {
		return nil
	}
	return &id
}

func serverError(w http.ResponseWriter, action string, err error) {
	slog.Error("curriculum: "+action, "err", err)
	httpx.WriteError(w, http.StatusInternalServerError, "server_error", "Something went wrong. Please try again.")
}
