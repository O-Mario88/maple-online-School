// Package server assembles the HTTP router: shared middleware, health check,
// each module's routes, and the fallback to the Django API.
package server

import (
	"context"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/O-Mario88/maple-online-School/api/internal/httpx"
	"github.com/O-Mario88/maple-online-School/api/internal/legacy"
)

const (
	requestTimeout = 30 * time.Second
	healthTimeout  = 2 * time.Second
)

// Pinger checks that the database answers.
type Pinger interface {
	Ping(ctx context.Context) error
}

// Options configures the router.
type Options struct {
	Pinger            Pinger
	LegacyAPI         string // Django base URL; empty means no fallback
	CORSOrigins       []string
	TrustProxyHeaders bool
	Modules           []func(chi.Router)
}

// NewRouter builds the service's HTTP handler.
func NewRouter(opts Options) (http.Handler, error) {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	if opts.TrustProxyHeaders {
		r.Use(middleware.RealIP)
	}
	r.Use(middleware.Logger, middleware.Recoverer, middleware.Timeout(requestTimeout))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: opts.CORSOrigins,
		AllowedMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodPatch, http.MethodDelete, http.MethodOptions},
		AllowedHeaders: []string{"Authorization", "Content-Type", "Idempotency-Key"},
		MaxAge:         300,
	}))

	r.Get("/api/health/", health(opts.Pinger))
	for _, mount := range opts.Modules {
		mount(r)
	}

	if opts.LegacyAPI == "" {
		r.NotFound(func(w http.ResponseWriter, _ *http.Request) {
			httpx.WriteError(w, http.StatusNotFound, "not_found", "Not found.")
		})
		return r, nil
	}
	proxy, err := legacy.NewProxy(opts.LegacyAPI)
	if err != nil {
		return nil, err
	}
	// Anything no Go module handles still works through Django.
	r.NotFound(proxy.ServeHTTP)
	r.MethodNotAllowed(proxy.ServeHTTP)
	return r, nil
}

func health(p Pinger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), healthTimeout)
		defer cancel()
		if err := p.Ping(ctx); err != nil {
			httpx.WriteJSON(w, http.StatusServiceUnavailable, map[string]string{"status": "degraded", "database": "unreachable"})
			return
		}
		httpx.WriteJSON(w, http.StatusOK, map[string]string{"status": "ok", "database": "ok"})
	}
}
