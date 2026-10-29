package server

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
)

type fakePinger struct{ err error }

func (f fakePinger) Ping(context.Context) error { return f.err }

func newTestRouter(t *testing.T, pinger Pinger, legacyURL string) http.Handler {
	t.Helper()
	h, err := NewRouter(Options{
		Pinger:      pinger,
		LegacyAPI:   legacyURL,
		CORSOrigins: []string{"http://localhost:8081"},
		Modules:     []func(chi.Router){},
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
			newTestRouter(t, tc.pinger, "").ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/api/health/", nil))
			if rec.Code != tc.want {
				t.Fatalf("want %d, got %d", tc.want, rec.Code)
			}
		})
	}
}

func TestUnknownAPIPathsGoToDjango(t *testing.T) {
	django := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/v1/classes/" || r.Header.Get("Authorization") != "Bearer abc" {
			t.Errorf("unexpected forwarded request %s auth=%q", r.URL.Path, r.Header.Get("Authorization"))
		}
		w.WriteHeader(http.StatusTeapot)
	}))
	defer django.Close()

	req := httptest.NewRequest(http.MethodGet, "/api/v1/classes/", nil)
	req.Header.Set("Authorization", "Bearer abc")
	rec := httptest.NewRecorder()
	newTestRouter(t, fakePinger{}, django.URL).ServeHTTP(rec, req)
	if rec.Code != http.StatusTeapot {
		t.Fatalf("expected Django's response, got %d", rec.Code)
	}
}

func TestUnknownPathsWithoutDjangoAre404(t *testing.T) {
	rec := httptest.NewRecorder()
	newTestRouter(t, fakePinger{}, "").ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/api/v1/classes/", nil))
	if rec.Code != http.StatusNotFound {
		t.Fatalf("want 404, got %d", rec.Code)
	}
}

func TestCORSAllowsConfiguredOriginOnly(t *testing.T) {
	router := newTestRouter(t, fakePinger{}, "")
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
