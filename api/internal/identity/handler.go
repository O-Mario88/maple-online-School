package identity

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/httpx"
)

const (
	loginLimit  = 10
	loginWindow = time.Minute
)

// Handler serves sign-in, token refresh, logout and the current user.
type Handler struct {
	users           UserReader
	profiles        ProfileReader
	revoker         Revoker
	tokens          *TokenIssuer
	requireVerified bool
}

// NewHandler wires the identity endpoints to their stores.
func NewHandler(users UserReader, profiles ProfileReader, revoker Revoker, tokens *TokenIssuer, requireVerified bool) *Handler {
	return &Handler{users: users, profiles: profiles, revoker: revoker, tokens: tokens, requireVerified: requireVerified}
}

// Mount registers the routes on r.
func (h *Handler) Mount(r chi.Router) {
	r.With(httpx.RateLimit(loginLimit, loginWindow)).Post("/api/v1/auth/token/", h.login)
	r.Post("/api/v1/auth/token/refresh/", h.refresh)
	r.Post("/api/v1/auth/logout/", h.logout)
	r.With(h.RequireUser).Get("/api/v1/auth/me/", h.me)
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type refreshRequest struct {
	Refresh string `json:"refresh"`
}

func (h *Handler) login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", err.Error())
		return
	}
	email := strings.TrimSpace(req.Email)
	if email == "" || req.Password == "" {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "Email and password are required.")
		return
	}

	user, err := h.users.UserByEmail(r.Context(), email)
	if err != nil && !errors.Is(err, ErrNotFound) {
		h.serverError(w, "look up user", err)
		return
	}
	hash := user.PasswordHash
	if err != nil {
		hash = dummyHash()
	}
	ok, checkErr := CheckPassword(req.Password, hash)
	if err != nil || checkErr != nil || !ok || !user.IsActive {
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_credentials", "No active account found with the given credentials")
		return
	}
	if h.requireVerified && !user.EmailVerified {
		httpx.WriteError(w, http.StatusUnauthorized, "email_not_verified", "Please verify your email before signing in.")
		return
	}
	h.issue(w, user.ID)
}

func (h *Handler) refresh(w http.ResponseWriter, r *http.Request) {
	userID, ok := h.consumeRefresh(w, r)
	if !ok {
		return
	}
	user, err := h.users.UserByID(r.Context(), userID)
	if errors.Is(err, ErrNotFound) || (err == nil && !user.IsActive) {
		writeInvalidToken(w)
		return
	}
	if err != nil {
		h.serverError(w, "look up user", err)
		return
	}
	h.issue(w, userID)
}

func (h *Handler) logout(w http.ResponseWriter, r *http.Request) {
	if _, ok := h.consumeRefresh(w, r); !ok {
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// consumeRefresh verifies the refresh token in the body and revokes it, so
// each refresh token works exactly once. It writes the error response itself
// and returns the token's user ID.
func (h *Handler) consumeRefresh(w http.ResponseWriter, r *http.Request) (int64, bool) {
	var req refreshRequest
	if err := httpx.DecodeJSON(r, &req); err != nil || req.Refresh == "" {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "A refresh token is required.")
		return 0, false
	}
	claims, err := h.tokens.Parse(req.Refresh, TokenTypeRefresh)
	if err != nil {
		writeInvalidToken(w)
		return 0, false
	}
	userID, err := strconv.ParseInt(claims.UserID, 10, 64)
	if err != nil {
		writeInvalidToken(w)
		return 0, false
	}
	fresh, err := h.revoker.Revoke(r.Context(), claims.TokenID, userID, claims.ExpiresAt)
	if err != nil {
		h.serverError(w, "revoke refresh token", err)
		return 0, false
	}
	if !fresh {
		writeInvalidToken(w)
		return 0, false
	}
	return userID, true
}

func (h *Handler) me(w http.ResponseWriter, r *http.Request) {
	user := UserFrom(r.Context())
	memberships, err := h.profiles.Memberships(r.Context(), user.ID)
	if err != nil {
		h.serverError(w, "load memberships", err)
		return
	}
	children, err := h.profiles.ApprovedChildren(r.Context(), user.ID)
	if err != nil {
		h.serverError(w, "load children", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, Me{
		ID:          user.ID,
		Email:       user.Email,
		FullName:    user.FullName,
		Role:        user.Role,
		CountryCode: user.CountryCode,
		Memberships: nonNil(memberships),
		Children:    nonNil(children),
	})
}

func (h *Handler) issue(w http.ResponseWriter, userID int64) {
	pair, err := h.tokens.IssuePair(userID)
	if err != nil {
		h.serverError(w, "issue tokens", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, pair)
}

func (h *Handler) serverError(w http.ResponseWriter, action string, err error) {
	slog.Error("identity: "+action, "err", err)
	httpx.WriteError(w, http.StatusInternalServerError, "server_error", "Something went wrong. Please try again.")
}

func writeInvalidToken(w http.ResponseWriter) {
	httpx.WriteError(w, http.StatusUnauthorized, "token_not_valid", "Token is invalid or expired")
}

type userKey struct{}

// RequireUser checks the bearer access token and loads the active user.
func (h *Handler) RequireUser(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		raw, found := strings.CutPrefix(r.Header.Get("Authorization"), "Bearer ")
		if !found || raw == "" {
			httpx.WriteError(w, http.StatusUnauthorized, "not_authenticated", "Authentication credentials were not provided.")
			return
		}
		claims, err := h.tokens.Parse(raw, TokenTypeAccess)
		if err != nil {
			writeInvalidToken(w)
			return
		}
		id, err := strconv.ParseInt(claims.UserID, 10, 64)
		if err != nil {
			writeInvalidToken(w)
			return
		}
		user, err := h.users.UserByID(r.Context(), id)
		if errors.Is(err, ErrNotFound) || (err == nil && !user.IsActive) {
			writeInvalidToken(w)
			return
		}
		if err != nil {
			h.serverError(w, "look up user", err)
			return
		}
		next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), userKey{}, user)))
	})
}

// UserFrom returns the user RequireUser stored on the request context.
func UserFrom(ctx context.Context) User {
	u, _ := ctx.Value(userKey{}).(User)
	return u
}

func nonNil[T any](s []T) []T {
	if s == nil {
		return []T{}
	}
	return s
}
