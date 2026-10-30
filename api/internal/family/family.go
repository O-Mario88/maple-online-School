// Package family lets a school confirm which adults belong to a learner.
// A parent's link to a child grants access to the child's records, so only
// admissions staff (leaders and the registrar) at the child's school may
// approve or decline it, and every decision is recorded.
package family

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"slices"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/O-Mario88/maple-online-School/api/internal/httpx"
	"github.com/O-Mario88/maple-online-School/api/internal/identity"
	"github.com/O-Mario88/maple-online-School/api/internal/platform/dbgen"
	"github.com/O-Mario88/maple-online-School/api/internal/roles"
)

const linksPrefix = "/api/v1/family/links/"

var (
	ErrNotFound  = errors.New("link not found")
	ErrForbidden = errors.New("not allowed to decide")
)

type Person struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email,omitempty"`
}

type Link struct {
	ID           int64     `json:"id"`
	Relationship string    `json:"relationship"`
	Status       string    `json:"status"`
	LinkedAt     time.Time `json:"linked_at"`
	Parent       Person    `json:"parent"`
	Student      Person    `json:"student"`
	SchoolID     *int64    `json:"school_id"`
	SchoolName   string    `json:"school_name"`
}

// Viewer is who is asking: their admissions and staff schools.
type Viewer struct {
	UserID     int64
	Admissions []int64
	Staff      []int64
}

// Store is what the handler needs from the database.
type Store interface {
	Viewer(ctx context.Context, userID int64) (Viewer, error)
	Links(ctx context.Context, v Viewer, status *string, page httpx.Page) ([]Link, int64, error)
	Decide(ctx context.Context, v Viewer, linkID int64, decision string) (Link, error)
}

// ---- store -------------------------------------------------------------------

type PostgresStore struct{ pool *pgxpool.Pool }

func NewPostgresStore(pool *pgxpool.Pool) *PostgresStore { return &PostgresStore{pool: pool} }

func (s *PostgresStore) Viewer(ctx context.Context, userID int64) (Viewer, error) {
	q := dbgen.New(s.pool)
	v := Viewer{UserID: userID}
	var err error
	if v.Admissions, err = q.StaffSchoolIDs(ctx, dbgen.StaffSchoolIDsParams{UserID: userID, StaffRoles: roles.Admissions}); err != nil {
		return v, fmt.Errorf("load admissions schools: %w", err)
	}
	if v.Staff, err = q.StaffSchoolIDs(ctx, dbgen.StaffSchoolIDsParams{UserID: userID, StaffRoles: roles.Staff}); err != nil {
		return v, fmt.Errorf("load staff schools: %w", err)
	}
	return v, nil
}

func (s *PostgresStore) Links(ctx context.Context, v Viewer, status *string, page httpx.Page) ([]Link, int64, error) {
	q := dbgen.New(s.pool)
	st := text(status)
	rows, err := q.FamilyLinks(ctx, dbgen.FamilyLinksParams{
		Schools: nonNil(v.Admissions), Parent: v.UserID, Status: st, PageLimit: page.Limit, PageOffset: page.Offset,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("list links: %w", err)
	}
	n, err := q.CountFamilyLinks(ctx, dbgen.CountFamilyLinksParams{Schools: nonNil(v.Admissions), Parent: v.UserID, Status: st})
	if err != nil {
		return nil, 0, fmt.Errorf("count links: %w", err)
	}
	out := make([]Link, 0, len(rows))
	for _, r := range rows {
		out = append(out, toLink(r))
	}
	return out, n, nil
}

// Decide approves or declines a link. Repeating the current decision changes
// nothing and records nothing.
func (s *PostgresStore) Decide(ctx context.Context, v Viewer, linkID int64, decision string) (Link, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return Link{}, fmt.Errorf("begin: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()
	q := dbgen.New(tx)

	link, err := q.LockFamilyLink(ctx, linkID)
	if errors.Is(err, pgx.ErrNoRows) {
		return Link{}, ErrNotFound
	}
	if err != nil {
		return Link{}, fmt.Errorf("lock link: %w", err)
	}
	staffAt, err := q.StudentSchoolsAmong(ctx, dbgen.StudentSchoolsAmongParams{UserID: link.StudentID, Schools: nonNil(v.Staff)})
	if err != nil {
		return Link{}, fmt.Errorf("student schools: %w", err)
	}
	// Someone with no tie to the link must not learn it exists.
	if len(staffAt) == 0 && link.ParentID != v.UserID {
		return Link{}, ErrNotFound
	}
	decidingSchool := firstShared(staffAt, v.Admissions)
	if decidingSchool == 0 {
		return Link{}, ErrForbidden
	}
	if link.ConsentStatus != decision {
		if err := q.SetFamilyLinkStatus(ctx, dbgen.SetFamilyLinkStatusParams{ID: linkID, ConsentStatus: decision}); err != nil {
			return Link{}, fmt.Errorf("set status: %w", err)
		}
		if err := q.RecordFamilyLinkDecision(ctx, dbgen.RecordFamilyLinkDecisionParams{
			LinkID: linkID, SchoolID: decidingSchool, DecidedBy: v.UserID, Decision: decision,
		}); err != nil {
			return Link{}, fmt.Errorf("record decision: %w", err)
		}
	}
	rows, err := q.FamilyLinks(ctx, dbgen.FamilyLinksParams{
		Schools: []int64{decidingSchool}, Parent: v.UserID, Link: pgtype.Int8{Int64: linkID, Valid: true}, PageLimit: 1,
	})
	if err != nil {
		return Link{}, fmt.Errorf("reload link: %w", err)
	}
	if len(rows) == 0 {
		return Link{}, ErrNotFound
	}
	if err := tx.Commit(ctx); err != nil {
		return Link{}, fmt.Errorf("commit: %w", err)
	}
	return toLink(rows[0]), nil
}

func firstShared(a, b []int64) int64 {
	for _, x := range a {
		if slices.Contains(b, x) {
			return x
		}
	}
	return 0
}

func toLink(r dbgen.FamilyLinksRow) Link {
	l := Link{
		ID: r.ID, Relationship: r.RelationshipType, Status: r.ConsentStatus, LinkedAt: r.LinkedAt.Time,
		Parent:  Person{ID: r.ParentID, Name: r.ParentName, Email: r.ParentEmail},
		Student: Person{ID: r.StudentID, Name: r.StudentName}, SchoolName: r.SchoolName,
	}
	if r.SchoolID != 0 {
		id := r.SchoolID
		l.SchoolID = &id
	}
	return l
}

func text(s *string) pgtype.Text {
	if s == nil {
		return pgtype.Text{}
	}
	return pgtype.Text{String: *s, Valid: true}
}

func nonNil(ids []int64) []int64 {
	if ids == nil {
		return []int64{}
	}
	return ids
}

// ---- handler -----------------------------------------------------------------

type Handler struct {
	store       Store
	requireUser func(http.Handler) http.Handler
}

func NewHandler(store Store, requireUser func(http.Handler) http.Handler) *Handler {
	return &Handler{store: store, requireUser: requireUser}
}

var statuses = []string{"pending", "approved", "declined"}

func (h *Handler) Mount(r chi.Router) {
	r.Group(func(r chi.Router) {
		r.Use(h.requireUser)
		r.Get(linksPrefix, h.list)
		r.Post(linksPrefix+"{id}/approve/", h.decide("approved"))
		r.Post(linksPrefix+"{id}/decline/", h.decide("declined"))
	})
	r.HandleFunc("/api/v1/family/*", func(w http.ResponseWriter, _ *http.Request) {
		httpx.WriteError(w, http.StatusMethodNotAllowed, "method_not_allowed", "This action isn't available.")
	})
}

func (h *Handler) viewer(w http.ResponseWriter, r *http.Request) (Viewer, bool) {
	v, err := h.store.Viewer(r.Context(), identity.UserFrom(r.Context()).ID)
	if err != nil {
		serverError(w, "load viewer", err)
		return Viewer{}, false
	}
	return v, true
}

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	var status *string
	if s := r.URL.Query().Get("status"); s != "" {
		if !slices.Contains(statuses, s) {
			httpx.WriteError(w, http.StatusBadRequest, "invalid", "Status must be pending, approved or declined.")
			return
		}
		status = &s
	}
	page := httpx.ParsePage(r)
	links, n, err := h.store.Links(r.Context(), v, status, page)
	if err != nil {
		serverError(w, "list links", err)
		return
	}
	httpx.WritePage(w, r, page, n, links)
}

func (h *Handler) decide(decision string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
		if err != nil || id <= 0 {
			httpx.WriteError(w, http.StatusNotFound, "not_found", "Not found.")
			return
		}
		v, ok := h.viewer(w, r)
		if !ok {
			return
		}
		link, err := h.store.Decide(r.Context(), v, id, decision)
		switch {
		case errors.Is(err, ErrNotFound):
			httpx.WriteError(w, http.StatusNotFound, "not_found", "Not found.")
		case errors.Is(err, ErrForbidden):
			httpx.WriteError(w, http.StatusForbidden, "permission_denied", "Only the school's leaders or registrar can confirm who belongs to a learner.")
		case err != nil:
			serverError(w, "decide link", err)
		default:
			httpx.WriteJSON(w, http.StatusOK, link)
		}
	}
}

func serverError(w http.ResponseWriter, action string, err error) {
	slog.Error("family: "+action, "err", err)
	httpx.WriteError(w, http.StatusInternalServerError, "server_error", "Something went wrong. Please try again.")
}
