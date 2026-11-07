// Package careers holds learners' Career Compass requests to Maple's career
// team: an event they'd like, or a community to start. Learners see their own
// requests and the team's answer; Maple staff read them all, by first name.
package careers

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/O-Mario88/maple-online-School/api/internal/httpx"
	"github.com/O-Mario88/maple-online-School/api/internal/identity"
	"github.com/O-Mario88/maple-online-School/api/internal/platform/dbgen"
)

const (
	prefix = "/api/v1/career-requests/"
	// Requests a learner can send in an hour.
	sendLimit = 10
	minBody   = 3
	maxBody   = 500
)

var (
	kinds    = map[string]bool{"event": true, "community": true}
	statuses = map[string]bool{"received": true, "planned": true, "declined": true}
)

type Request struct {
	ID        int64     `json:"id"`
	Kind      string    `json:"kind"`
	Body      string    `json:"body"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	// Only in the staff list: who asked, by first name.
	FirstName string `json:"first_name,omitempty"`
}

// Store is what the handler needs from the database.
type Store interface {
	Add(ctx context.Context, userID int64, kind, body string) (Request, error)
	Mine(ctx context.Context, userID int64, page httpx.Page) ([]Request, int64, error)
	All(ctx context.Context, status string, page httpx.Page) ([]Request, int64, error)
	SetStatus(ctx context.Context, id int64, status string) (bool, error)
	IsStaff(ctx context.Context, userID int64) (bool, error)
}

type PostgresStore struct{ q *dbgen.Queries }

func NewPostgresStore(pool *pgxpool.Pool) *PostgresStore { return &PostgresStore{q: dbgen.New(pool)} }

func (s *PostgresStore) Add(ctx context.Context, userID int64, kind, body string) (Request, error) {
	r, err := s.q.AddCareerRequest(ctx, dbgen.AddCareerRequestParams{UserID: userID, Kind: kind, Body: body})
	if err != nil {
		return Request{}, fmt.Errorf("add career request: %w", err)
	}
	return Request{ID: r.ID, Kind: r.Kind, Body: r.Body, Status: r.Status, CreatedAt: r.CreatedAt.Time}, nil
}

func (s *PostgresStore) Mine(ctx context.Context, userID int64, page httpx.Page) ([]Request, int64, error) {
	rows, err := s.q.MyCareerRequests(ctx, dbgen.MyCareerRequestsParams{UserID: userID, PageLimit: page.Limit, PageOffset: page.Offset})
	if err != nil {
		return nil, 0, fmt.Errorf("my career requests: %w", err)
	}
	n, err := s.q.CountMyCareerRequests(ctx, userID)
	if err != nil {
		return nil, 0, fmt.Errorf("count my career requests: %w", err)
	}
	out := make([]Request, 0, len(rows))
	for _, r := range rows {
		out = append(out, Request{ID: r.ID, Kind: r.Kind, Body: r.Body, Status: r.Status, CreatedAt: r.CreatedAt.Time})
	}
	return out, n, nil
}

func (s *PostgresStore) All(ctx context.Context, status string, page httpx.Page) ([]Request, int64, error) {
	rows, err := s.q.AllCareerRequests(ctx, dbgen.AllCareerRequestsParams{Status: status, PageLimit: page.Limit, PageOffset: page.Offset})
	if err != nil {
		return nil, 0, fmt.Errorf("all career requests: %w", err)
	}
	n, err := s.q.CountAllCareerRequests(ctx, status)
	if err != nil {
		return nil, 0, fmt.Errorf("count career requests: %w", err)
	}
	out := make([]Request, 0, len(rows))
	for _, r := range rows {
		out = append(out, Request{ID: r.ID, Kind: r.Kind, Body: r.Body, Status: r.Status, CreatedAt: r.CreatedAt.Time, FirstName: r.FirstName})
	}
	return out, n, nil
}

func (s *PostgresStore) SetStatus(ctx context.Context, id int64, status string) (bool, error) {
	n, err := s.q.SetCareerRequestStatus(ctx, dbgen.SetCareerRequestStatusParams{ID: id, Status: status})
	return n > 0, err
}

func (s *PostgresStore) IsStaff(ctx context.Context, userID int64) (bool, error) {
	staff, err := s.q.IsMapleStaff(ctx, userID)
	if errors.Is(err, pgx.ErrNoRows) {
		return false, nil
	}
	return staff, err
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
		r.Get(prefix, h.mine)
		r.With(httpx.RateLimit(sendLimit, time.Hour)).Post(prefix, h.add)
		r.Get(prefix+"all/", h.all)
		r.Post(prefix+"{id}/status/", h.setStatus)
	})
	r.HandleFunc(prefix+"*", func(w http.ResponseWriter, _ *http.Request) {
		httpx.WriteError(w, http.StatusMethodNotAllowed, "method_not_allowed", "This action isn't available.")
	})
}

func (h *Handler) add(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Kind string `json:"kind"`
		Body string `json:"body"`
	}
	if err := httpx.DecodeJSON(r, &in); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_body", "Send a kind and a message.")
		return
	}
	body := strings.TrimSpace(in.Body)
	if !kinds[in.Kind] {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_kind", "A request is for an event or a community.")
		return
	}
	if n := utf8.RuneCountInString(body); n < minBody || n > maxBody {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_body", fmt.Sprintf("Write between %d and %d characters.", minBody, maxBody))
		return
	}
	req, err := h.store.Add(r.Context(), identity.UserFrom(r.Context()).ID, in.Kind, body)
	if err != nil {
		serverError(w, "add", err)
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, req)
}

func (h *Handler) mine(w http.ResponseWriter, r *http.Request) {
	page := httpx.ParsePage(r)
	items, n, err := h.store.Mine(r.Context(), identity.UserFrom(r.Context()).ID, page)
	if err != nil {
		serverError(w, "mine", err)
		return
	}
	httpx.WritePage(w, r, page, n, items)
}

// staffOnly answers false (having written the response) unless the caller is Maple staff.
func (h *Handler) staffOnly(w http.ResponseWriter, r *http.Request) bool {
	ok, err := h.store.IsStaff(r.Context(), identity.UserFrom(r.Context()).ID)
	if err != nil {
		serverError(w, "staff check", err)
		return false
	}
	if !ok {
		httpx.WriteError(w, http.StatusForbidden, "forbidden", "Only Maple's career team can do this.")
	}
	return ok
}

func (h *Handler) all(w http.ResponseWriter, r *http.Request) {
	if !h.staffOnly(w, r) {
		return
	}
	status := r.URL.Query().Get("status")
	if status != "" && !statuses[status] {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_status", "Unknown status.")
		return
	}
	page := httpx.ParsePage(r)
	items, n, err := h.store.All(r.Context(), status, page)
	if err != nil {
		serverError(w, "all", err)
		return
	}
	httpx.WritePage(w, r, page, n, items)
}

func (h *Handler) setStatus(w http.ResponseWriter, r *http.Request) {
	if !h.staffOnly(w, r) {
		return
	}
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil || id <= 0 {
		httpx.WriteError(w, http.StatusNotFound, "not_found", "Not found.")
		return
	}
	var in struct {
		Status string `json:"status"`
	}
	if err := httpx.DecodeJSON(r, &in); err != nil || !statuses[in.Status] {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_status", "Use received, planned or declined.")
		return
	}
	found, err := h.store.SetStatus(r.Context(), id, in.Status)
	switch {
	case err != nil:
		serverError(w, "set status", err)
	case !found:
		httpx.WriteError(w, http.StatusNotFound, "not_found", "Not found.")
	default:
		httpx.WriteJSON(w, http.StatusOK, map[string]string{"status": in.Status})
	}
}

func serverError(w http.ResponseWriter, action string, err error) {
	slog.Error("careers: "+action, "err", err)
	httpx.WriteError(w, http.StatusInternalServerError, "server_error", "Something went wrong. Please try again.")
}
