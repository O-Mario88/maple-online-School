// Package inbox keeps each person's in-app notifications: what happened,
// where to act on it, and whether they have read it. Other modules add
// notifications inside their own transactions with Notify and NotifyFamily.
package inbox

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/O-Mario88/maple-online-School/api/internal/httpx"
	"github.com/O-Mario88/maple-online-School/api/internal/identity"
	"github.com/O-Mario88/maple-online-School/api/internal/platform/dbgen"
)

const prefix = "/api/v1/inbox/"

// Note is one notification to add. Link is an app path such as "/fees".
type Note struct {
	Kind  string
	Title string
	Body  string
	Link  string
}

func linkOr(link string) string {
	if link == "" {
		return "/"
	}
	return link
}

// Notify adds a note for one person.
func Notify(ctx context.Context, q *dbgen.Queries, userID int64, n Note) error {
	err := q.AddNotification(ctx, dbgen.AddNotificationParams{UserID: userID, Kind: n.Kind, Title: n.Title, Body: n.Body, Link: linkOr(n.Link)})
	if err != nil {
		return fmt.Errorf("notify: %w", err)
	}
	return nil
}

// NotifyFamily adds a note for a learner and every parent the school has
// confirmed for them.
func NotifyFamily(ctx context.Context, q *dbgen.Queries, studentID int64, n Note) error {
	err := q.AddFamilyNotification(ctx, dbgen.AddFamilyNotificationParams{
		Student: studentID, Kind: n.Kind, Title: n.Title, Body: n.Body, Link: linkOr(n.Link),
	})
	if err != nil {
		return fmt.Errorf("notify family: %w", err)
	}
	return nil
}

// NotifyParents adds a note for every parent the school has confirmed for a
// learner, but not the learner.
func NotifyParents(ctx context.Context, q *dbgen.Queries, studentID int64, n Note) error {
	err := q.AddParentsNotification(ctx, dbgen.AddParentsNotificationParams{
		Student: studentID, Kind: n.Kind, Title: n.Title, Body: n.Body, Link: linkOr(n.Link),
	})
	if err != nil {
		return fmt.Errorf("notify parents: %w", err)
	}
	return nil
}

type Notification struct {
	ID        int64      `json:"id"`
	Kind      string     `json:"kind"`
	Title     string     `json:"title"`
	Body      string     `json:"body"`
	Link      string     `json:"link"`
	CreatedAt time.Time  `json:"created_at"`
	ReadAt    *time.Time `json:"read_at"`
}

// Store is what the handler needs from the database.
type Store interface {
	List(ctx context.Context, userID int64, unreadOnly bool, page httpx.Page) ([]Notification, int64, error)
	Unread(ctx context.Context, userID int64) (int64, error)
	MarkRead(ctx context.Context, userID, id int64) (bool, error)
	MarkAllRead(ctx context.Context, userID int64) error
}

type PostgresStore struct{ q *dbgen.Queries }

func NewPostgresStore(pool *pgxpool.Pool) *PostgresStore { return &PostgresStore{q: dbgen.New(pool)} }

func (s *PostgresStore) List(ctx context.Context, userID int64, unreadOnly bool, page httpx.Page) ([]Notification, int64, error) {
	rows, err := s.q.ListNotifications(ctx, dbgen.ListNotificationsParams{
		UserID: userID, UnreadOnly: unreadOnly, PageLimit: page.Limit, PageOffset: page.Offset,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("list notifications: %w", err)
	}
	n, err := s.q.CountNotifications(ctx, dbgen.CountNotificationsParams{UserID: userID, UnreadOnly: unreadOnly})
	if err != nil {
		return nil, 0, fmt.Errorf("count notifications: %w", err)
	}
	out := make([]Notification, 0, len(rows))
	for _, r := range rows {
		item := Notification{ID: r.ID, Kind: r.Kind, Title: r.Title, Body: r.Body, Link: r.Link, CreatedAt: r.CreatedAt.Time}
		if r.ReadAt.Valid {
			t := r.ReadAt.Time
			item.ReadAt = &t
		}
		out = append(out, item)
	}
	return out, n, nil
}

func (s *PostgresStore) Unread(ctx context.Context, userID int64) (int64, error) {
	return s.q.UnreadNotifications(ctx, userID)
}

func (s *PostgresStore) MarkRead(ctx context.Context, userID, id int64) (bool, error) {
	n, err := s.q.MarkNotificationRead(ctx, dbgen.MarkNotificationReadParams{ID: id, UserID: userID})
	return n > 0, err
}

func (s *PostgresStore) MarkAllRead(ctx context.Context, userID int64) error {
	return s.q.MarkAllNotificationsRead(ctx, userID)
}

type Handler struct {
	store       Store
	requireUser func(http.Handler) http.Handler
}

func NewHandler(store Store, requireUser func(http.Handler) http.Handler) *Handler {
	return &Handler{store: store, requireUser: requireUser}
}

func (h *Handler) Mount(r chi.Router) {
	r.Group(func(r chi.Router) {
		r.Use(h.requireUser)
		r.Get(prefix, h.list)
		r.Get(prefix+"summary/", h.summary)
		r.Post(prefix+"read-all/", h.readAll)
		r.Post(prefix+"{id}/read/", h.read)
	})
	r.HandleFunc(prefix+"*", func(w http.ResponseWriter, _ *http.Request) {
		httpx.WriteError(w, http.StatusMethodNotAllowed, "method_not_allowed", "This action isn't available.")
	})
}

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	user := identity.UserFrom(r.Context()).ID
	page := httpx.ParsePage(r)
	items, n, err := h.store.List(r.Context(), user, r.URL.Query().Get("unread") == "1", page)
	if err != nil {
		serverError(w, "list", err)
		return
	}
	httpx.WritePage(w, r, page, n, items)
}

func (h *Handler) summary(w http.ResponseWriter, r *http.Request) {
	n, err := h.store.Unread(r.Context(), identity.UserFrom(r.Context()).ID)
	if err != nil {
		serverError(w, "summary", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]int64{"unread": n})
}

func (h *Handler) read(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil || id <= 0 {
		httpx.WriteError(w, http.StatusNotFound, "not_found", "Not found.")
		return
	}
	found, err := h.store.MarkRead(r.Context(), identity.UserFrom(r.Context()).ID, id)
	switch {
	case err != nil:
		serverError(w, "mark read", err)
	case !found:
		httpx.WriteError(w, http.StatusNotFound, "not_found", "Not found.")
	default:
		w.WriteHeader(http.StatusNoContent)
	}
}

func (h *Handler) readAll(w http.ResponseWriter, r *http.Request) {
	if err := h.store.MarkAllRead(r.Context(), identity.UserFrom(r.Context()).ID); err != nil {
		serverError(w, "mark all read", err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func serverError(w http.ResponseWriter, action string, err error) {
	slog.Error("inbox: "+action, "err", err)
	httpx.WriteError(w, http.StatusInternalServerError, "server_error", "Something went wrong. Please try again.")
}
