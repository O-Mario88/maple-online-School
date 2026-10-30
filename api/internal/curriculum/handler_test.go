package curriculum

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
)

type fakeStore struct{ treeCalls int }

func (f *fakeStore) Countries(context.Context) ([]Country, error) {
	return []Country{{ID: 1, Code: "UG", Name: "Uganda", Active: true}}, nil
}
func (f *fakeStore) ClassLevels(context.Context) ([]ClassLevel, error) { return nil, nil }
func (f *fakeStore) Subjects(context.Context) ([]SubjectDetail, error) {
	return []SubjectDetail{{ID: 7, Name: "Mathematics", Topics: []TopicRef{}}}, nil
}
func (f *fakeStore) Subject(_ context.Context, id int64) (SubjectDetail, error) {
	if id != 7 {
		return SubjectDetail{}, ErrNotFound
	}
	return SubjectDetail{ID: 7, Name: "Mathematics", Topics: []TopicRef{}}, nil
}
func (f *fakeStore) Topics(_ context.Context, subject, _ *int64) ([]TopicRef, error) {
	if subject != nil && *subject == 7 {
		return []TopicRef{{ID: 101, Name: "Sets", Subject: 7}}, nil
	}
	return []TopicRef{}, nil
}
func (f *fakeStore) Topic(context.Context, int64) (TopicRef, error)             { return TopicRef{}, ErrNotFound }
func (f *fakeStore) Competencies(context.Context, *int64) ([]Competency, error) { return nil, nil }
func (f *fakeStore) TreeRows(context.Context) ([]TreeRow, error) {
	f.treeCalls++
	return []TreeRow{{LevelID: 1, LevelName: "O-Level", ClassID: 10, ClassName: "S 1"}}, nil
}

// signedIn stands in for identity.RequireUser: requests need an Authorization header.
func signedIn(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") == "" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func setup() (*fakeStore, http.Handler) {
	store := &fakeStore{}
	r := chi.NewRouter()
	// Like the real server: anything Go doesn't handle goes to Django.
	toDjango := func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusBadGateway) }
	r.NotFound(toDjango)
	r.MethodNotAllowed(toDjango)
	NewHandler(store, signedIn).Mount(r)
	return store, r
}

func get(t *testing.T, h http.Handler, path string, auth bool) (int, map[string]any) {
	t.Helper()
	req := httptest.NewRequest(http.MethodGet, path, nil)
	if auth {
		req.Header.Set("Authorization", "Bearer x")
	}
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	var body map[string]any
	_ = json.Unmarshal(rec.Body.Bytes(), &body)
	return rec.Code, body
}

func TestTreeIsPublicAndCached(t *testing.T) {
	store, h := setup()
	for range 3 {
		if code, body := get(t, h, "/api/v1/curriculum/full-tree/", false); code != http.StatusOK || body["levels"] == nil {
			t.Fatalf("tree: %d %v", code, body)
		}
	}
	if store.treeCalls != 1 {
		t.Fatalf("the tree should be built once and cached, built %d times", store.treeCalls)
	}
}

func TestCurriculumListsNeedSignInAndUseDRFPages(t *testing.T) {
	_, h := setup()
	if code, _ := get(t, h, "/api/v1/curriculum/subjects/", false); code != http.StatusUnauthorized {
		t.Fatalf("anonymous subjects: want 401, got %d", code)
	}
	code, page := get(t, h, "/api/v1/curriculum/countries/", true)
	if code != http.StatusOK || page["count"] != float64(1) || page["results"] == nil {
		t.Fatalf("countries: %d %v", code, page)
	}
	_, topics := get(t, h, "/api/v1/curriculum/topics/?subject=7", true)
	if topics["count"] != float64(1) {
		t.Fatalf("topics filtered by subject: %v", topics)
	}
	if code, _ := get(t, h, "/api/v1/curriculum/subjects/99/", true); code != http.StatusNotFound {
		t.Fatalf("missing subject: want 404, got %d", code)
	}
}

func TestWritesAreRefusedButResourceReviewsFallThrough(t *testing.T) {
	_, h := setup()
	for _, p := range []string{"/api/v1/curriculum/topics/", "/api/v1/curriculum/subjects/7/", "/api/v1/curriculum/full-tree/"} {
		req := httptest.NewRequest(http.MethodPost, p, nil)
		req.Header.Set("Authorization", "Bearer x")
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, req)
		if rec.Code != http.StatusMethodNotAllowed {
			t.Errorf("POST %s: want 405, got %d", p, rec.Code)
		}
	}
	// Not owned by Go yet, so it still goes to Django.
	if code, _ := get(t, h, "/api/v1/curriculum/resource-reviews/", true); code != http.StatusBadGateway {
		t.Errorf("resource reviews should not be handled by Go yet, got %d", code)
	}
}
