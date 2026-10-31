package server

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/go-chi/chi/v5"
)

type fakePinger struct{ err error }

func (f fakePinger) Ping(context.Context) error { return f.err }

func newTestRouter(t *testing.T, pinger Pinger) http.Handler {
	t.Helper()
	h, err := NewRouter(Options{
		Pinger:      pinger,
		CORSOrigins: []string{"http://localhost:8081"},
		Modules: []func(chi.Router){func(r chi.Router) {
			r.Get("/api/v1/things/", func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusOK) })
		}},
	})
	if err != nil {
		t.Fatal(err)
	}
	return h
}

func TestHealthReportsDatabaseState(t *testing.T) {
	cases := []struct {
		name   string
		pinger Pinger
		want   int
	}{
		{"database up", fakePinger{}, http.StatusOK},
		{"database down", fakePinger{err: errors.New("no route")}, http.StatusServiceUnavailable},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			rec := httptest.NewRecorder()
			newTestRouter(t, tc.pinger).ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/api/health/", nil))
			if rec.Code != tc.want {
				t.Fatalf("want %d, got %d", tc.want, rec.Code)
			}
		})
	}
}

// Go serves the whole API: unknown paths and methods get JSON errors.
func TestUnknownPathsAndMethodsGetJSONErrors(t *testing.T) {
	router := newTestRouter(t, fakePinger{})
	cases := []struct {
		method, path string
		want         int
	}{
		{http.MethodGet, "/api/v1/classes/", http.StatusNotFound},
		{http.MethodDelete, "/api/v1/things/", http.StatusMethodNotAllowed},
	}
	for _, c := range cases {
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, httptest.NewRequest(c.method, c.path, nil))
		if rec.Code != c.want || !strings.Contains(rec.Header().Get("Content-Type"), "application/json") {
			t.Errorf("%s %s: want %d JSON, got %d %q", c.method, c.path, c.want, rec.Code, rec.Header().Get("Content-Type"))
		}
	}
}

// The app sends Idempotency-Key on payments; a browser preflight must allow it.
func TestCORSAllowsTheIdempotencyKeyHeader(t *testing.T) {
	router := newTestRouter(t, fakePinger{})
	req := httptest.NewRequest(http.MethodOptions, "/api/v1/finance/payments/", nil)
	req.Header.Set("Origin", "http://localhost:8081")
	req.Header.Set("Access-Control-Request-Method", http.MethodPost)
	req.Header.Set("Access-Control-Request-Headers", "authorization,content-type,idempotency-key")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)
	allowed := strings.ToLower(rec.Header().Get("Access-Control-Allow-Headers"))
	if !strings.Contains(allowed, "idempotency-key") {
		t.Errorf("preflight must allow Idempotency-Key, got %q", allowed)
	}
}

func TestCORSAllowsConfiguredOriginOnly(t *testing.T) {
	router := newTestRouter(t, fakePinger{})
	for origin, wantAllowed := range map[string]bool{"http://localhost:8081": true, "https://evil.example": false} {
		req := httptest.NewRequest(http.MethodOptions, "/api/v1/auth/token/", nil)
		req.Header.Set("Origin", origin)
		req.Header.Set("Access-Control-Request-Method", http.MethodPost)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)
		got := rec.Header().Get("Access-Control-Allow-Origin") == origin
		if got != wantAllowed {
			t.Errorf("origin %s: allowed=%v, want %v", origin, got, wantAllowed)
		}
	}
}
