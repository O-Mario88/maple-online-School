package institutions

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"net/mail"
	"regexp"
	"slices"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/httpx"
	"github.com/O-Mario88/maple-online-School/api/internal/identity"
)

const (
	maxName    = 255
	maxInvites = 100
)

// SchoolRoles are the roles a membership can have (Django's choices).
var SchoolRoles = []string{
	"headteacher", "deputy", "registrar", "dos", "class_teacher", "subject_teacher",
	"librarian", "counselor", "exam_officer", "ict_admin", "parent", "student",
}

var (
	countries = []string{"UG", "KE", "RW"}
	levels    = []string{"primary", "secondary"}
	hexColor  = regexp.MustCompile(`^#[0-9A-Fa-f]{6}$`)
)

// Store is what the handler needs from the database.
type Store interface {
	LeaderSchools(ctx context.Context, userID int64) ([]int64, error)
	MySchools(ctx context.Context, userID int64) ([]School, error)
	CreateSchool(ctx context.Context, founder int64, name, country, level string) (int64, error)
	UpdateSchool(ctx context.Context, id int64, name, color *string) error
	Invite(ctx context.Context, school int64, emails []string, role string) (int, error)
	Memberships(ctx context.Context, leader []int64, viewer int64, school *int64) ([]Membership, error)
	Membership(ctx context.Context, id int64) (MembershipRef, error)
	UpdateMembership(ctx context.Context, m MembershipRef, role, status *string) error
}

type Handler struct {
	store       Store
	requireUser func(http.Handler) http.Handler
}

func NewHandler(store Store, requireUser func(http.Handler) http.Handler) *Handler {
	return &Handler{store: store, requireUser: requireUser}
}

// Mount registers the routes. Other /api/v1/institutions/... paths (learner
// registration, onboarding) are still served by Django through the forwarder.
func (h *Handler) Mount(r chi.Router) {
	r.Group(func(r chi.Router) {
		r.Use(h.requireUser)
		r.Get("/api/v1/institutions/", h.listSchools)
		r.Post("/api/v1/institutions/", h.createSchool)
		r.Patch("/api/v1/institutions/{id}/", h.updateSchool)
		r.Post("/api/v1/institutions/{id}/bulk_invite/", h.invite)
		r.Get("/api/v1/institution-memberships/", h.listMemberships)
		r.Patch("/api/v1/institution-memberships/{id}/", h.updateMembership)
		r.Post("/api/v1/institution-memberships/{id}/accept/", h.accept)
	})
	r.HandleFunc("/api/v1/institution-memberships/*", func(w http.ResponseWriter, _ *http.Request) {
		httpx.WriteError(w, http.StatusMethodNotAllowed, "method_not_allowed", "This action isn't available.")
	})
}

func (h *Handler) listSchools(w http.ResponseWriter, r *http.Request) {
	user := identity.UserFrom(r.Context())
	schools, err := h.store.MySchools(r.Context(), user.ID)
	if err != nil {
		serverError(w, "list schools", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"count": len(schools), "results": schools})
}

type schoolRequest struct {
	Name         *string `json:"name"`
	CountryCode  string  `json:"country_code"`
	SchoolLevel  string  `json:"school_level"`
	PrimaryColor *string `json:"primary_color"`
}

func (h *Handler) createSchool(w http.ResponseWriter, r *http.Request) {
	user := identity.UserFrom(r.Context())
	if user.Role != "institution" && user.Role != "admin" {
		httpx.WriteError(w, http.StatusForbidden, "permission_denied", "Only school or Maple administrator accounts can create a school.")
		return
	}
	var req schoolRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", err.Error())
		return
	}
	name := ""
	if req.Name != nil {
		name = strings.TrimSpace(*req.Name)
	}
	level := req.SchoolLevel
	if level == "" {
		level = "secondary"
	}
	if name == "" || len(name) > maxName || !slices.Contains(countries, req.CountryCode) || !slices.Contains(levels, level) {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "A school name, a country (UG, KE or RW) and a level (primary or secondary) are required.")
		return
	}
	id, err := h.store.CreateSchool(r.Context(), user.ID, name, req.CountryCode, level)
	if err != nil {
		serverError(w, "create school", err)
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, map[string]any{"id": id, "name": name, "country_code": req.CountryCode, "school_level": level})
}

func (h *Handler) updateSchool(w http.ResponseWriter, r *http.Request) {
	id, ok := h.ledSchool(w, r)
	if !ok {
		return
	}
	var req schoolRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", err.Error())
		return
	}
	if req.Name != nil {
		trimmed := strings.TrimSpace(*req.Name)
		if trimmed == "" || len(trimmed) > maxName {
			httpx.WriteError(w, http.StatusBadRequest, "invalid", "A school name of up to 255 characters is required.")
			return
		}
		req.Name = &trimmed
	}
	if req.PrimaryColor != nil && !hexColor.MatchString(*req.PrimaryColor) {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "Colours look like #B4402A.")
		return
	}
	if err := h.store.UpdateSchool(r.Context(), id, req.Name, req.PrimaryColor); err != nil {
		serverError(w, "update school", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"id": id})
}

type inviteRequest struct {
	Emails []string `json:"emails"`
	Role   string   `json:"role"`
}

func (h *Handler) invite(w http.ResponseWriter, r *http.Request) {
	id, ok := h.ledSchool(w, r)
	if !ok {
		return
	}
	var req inviteRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", err.Error())
		return
	}
	if !slices.Contains(SchoolRoles, req.Role) || len(req.Emails) == 0 || len(req.Emails) > maxInvites {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "Send 1 to 100 email addresses and a school role.")
		return
	}
	emails := make([]string, 0, len(req.Emails))
	for _, e := range req.Emails {
		addr, err := mail.ParseAddress(strings.TrimSpace(e))
		if err != nil || addr.Name != "" {
			httpx.WriteError(w, http.StatusBadRequest, "invalid", "This isn't a valid email address: "+e)
			return
		}
		if lower := strings.ToLower(addr.Address); !slices.Contains(emails, lower) {
			emails = append(emails, lower)
		}
	}
	n, err := h.store.Invite(r.Context(), id, emails, req.Role)
	if err != nil {
		serverError(w, "invite", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"invited": n, "role": req.Role, "detail": "Invited " + strconv.Itoa(n) + " people as " + req.Role + "."})
}

func (h *Handler) listMemberships(w http.ResponseWriter, r *http.Request) {
	user := identity.UserFrom(r.Context())
	leader, err := h.store.LeaderSchools(r.Context(), user.ID)
	if err != nil {
		serverError(w, "load schools", err)
		return
	}
	var school *int64
	if id, err := strconv.ParseInt(r.URL.Query().Get("institution"), 10, 64); err == nil {
		school = &id
	}
	list, err := h.store.Memberships(r.Context(), leader, user.ID, school)
	if err != nil {
		serverError(w, "list memberships", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"count": len(list), "results": list})
}

type membershipPatch struct {
	Role   *string `json:"role"`
	Status *string `json:"status"`
}

func (h *Handler) updateMembership(w http.ResponseWriter, r *http.Request) {
	user := identity.UserFrom(r.Context())
	m, ok := h.membership(w, r)
	if !ok {
		return
	}
	leader, err := h.store.LeaderSchools(r.Context(), user.ID)
	if err != nil {
		serverError(w, "load schools", err)
		return
	}
	if !slices.Contains(leader, m.Institution) {
		httpx.WriteError(w, http.StatusNotFound, "not_found", "Not found.")
		return
	}
	var req membershipPatch
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", err.Error())
		return
	}
	if (req.Role != nil && !slices.Contains(SchoolRoles, *req.Role)) || (req.Status != nil && *req.Status != "active" && *req.Status != "suspended") {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "Role must be a school role and status active or suspended.")
		return
	}
	h.saveMembership(w, r, m, req.Role, req.Status)
}

func (h *Handler) accept(w http.ResponseWriter, r *http.Request) {
	user := identity.UserFrom(r.Context())
	m, ok := h.membership(w, r)
	if !ok {
		return
	}
	if m.User != user.ID || m.Status != "pending" {
		httpx.WriteError(w, http.StatusNotFound, "not_found", "There's no pending invitation for you here.")
		return
	}
	active := "active"
	h.saveMembership(w, r, m, nil, &active)
}

func (h *Handler) saveMembership(w http.ResponseWriter, r *http.Request, m MembershipRef, role, status *string) {
	err := h.store.UpdateMembership(r.Context(), m, role, status)
	if errors.Is(err, ErrLastLeader) {
		httpx.WriteError(w, http.StatusConflict, "last_leader", "A school needs at least one active leader. Add another leader first.")
		return
	}
	if err != nil {
		serverError(w, "update membership", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"id": m.ID})
}

// ledSchool reads {id} and checks the user leads that school.
func (h *Handler) ledSchool(w http.ResponseWriter, r *http.Request) (int64, bool) {
	user := identity.UserFrom(r.Context())
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	leader, err := h.store.LeaderSchools(r.Context(), user.ID)
	if err != nil {
		serverError(w, "load schools", err)
		return 0, false
	}
	if !slices.Contains(leader, id) {
		httpx.WriteError(w, http.StatusForbidden, "permission_denied", "Only this school's leaders can do that.")
		return 0, false
	}
	return id, true
}

func (h *Handler) membership(w http.ResponseWriter, r *http.Request) (MembershipRef, bool) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	m, err := h.store.Membership(r.Context(), id)
	if errors.Is(err, ErrNotFound) {
		httpx.WriteError(w, http.StatusNotFound, "not_found", "Not found.")
		return MembershipRef{}, false
	}
	if err != nil {
		serverError(w, "load membership", err)
		return MembershipRef{}, false
	}
	return m, true
}

func serverError(w http.ResponseWriter, action string, err error) {
	slog.Error("institutions: "+action, "err", err)
	httpx.WriteError(w, http.StatusInternalServerError, "server_error", "Something went wrong. Please try again.")
}
