package identity

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
)

// fakeStore keeps users, memberships, children and revoked tokens in memory.
type fakeStore struct {
	mu          sync.Mutex
	users       map[int64]User
	memberships map[int64][]Membership
	children    map[int64][]Child
	revoked     map[string]bool
}

func (f *fakeStore) UserByEmail(_ context.Context, email string) (User, error) {
	for _, u := range f.users {
		if u.Email == email {
			return u, nil
		}
	}
	return User{}, ErrNotFound
}

func (f *fakeStore) UserByID(_ context.Context, id int64) (User, error) {
	u, ok := f.users[id]
	if !ok {
		return User{}, ErrNotFound
	}
	return u, nil
}

func (f *fakeStore) Memberships(_ context.Context, userID int64) ([]Membership, error) {
	return f.memberships[userID], nil
}

func (f *fakeStore) ApprovedChildren(_ context.Context, userID int64) ([]Child, error) {
	return f.children[userID], nil
}

func (f *fakeStore) Revoke(_ context.Context, jti string, _ int64, _ time.Time) (bool, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	if f.revoked[jti] {
		return false, nil
	}
	f.revoked[jti] = true
	return true, nil
}

func newTestServer(t *testing.T, requireVerified bool) (*fakeStore, http.Handler) {
	t.Helper()
	hash, err := HashPassword("PilotPass!")
	if err != nil {
		t.Fatal(err)
	}
	store := &fakeStore{
		users: map[int64]User{
			3: {ID: 3, Email: "student.a@pilot.maple", FullName: "Amina", Role: "student", CountryCode: "UG", PasswordHash: hash, IsActive: true, EmailVerified: true},
			4: {ID: 4, Email: "parent.a@pilot.maple", FullName: "Parent Apio", Role: "parent", CountryCode: "UG", PasswordHash: hash, IsActive: true, EmailVerified: true},
			5: {ID: 5, Email: "gone@pilot.maple", FullName: "Gone", Role: "student", PasswordHash: hash, IsActive: false, EmailVerified: true},
			6: {ID: 6, Email: "new@pilot.maple", FullName: "New", Role: "student", PasswordHash: hash, IsActive: true, EmailVerified: false},
		},
		memberships: map[int64][]Membership{
			3: {{InstitutionID: 1, InstitutionName: "Maple Pilot School", Role: "student", Status: "active"}},
		},
		children: map[int64][]Child{
			4: {{UserID: 3, FullName: "Amina", Relationship: "mother"}},
		},
		revoked: map[string]bool{},
	}
	issuer := &TokenIssuer{SigningKey: []byte("test-key"), AccessTTL: 15 * time.Minute, RefreshTTL: 7 * 24 * time.Hour}
	h := NewHandler(store, store, store, issuer, requireVerified)
	r := chi.NewRouter()
	h.Mount(r)
	return store, r
}

func do(t *testing.T, srv http.Handler, method, path, bearer string, body any) *httptest.ResponseRecorder {
	t.Helper()
	var buf bytes.Buffer
	if body != nil {
		if err := json.NewEncoder(&buf).Encode(body); err != nil {
			t.Fatal(err)
		}
	}
	req := httptest.NewRequest(method, path, &buf)
	req.Header.Set("Content-Type", "application/json")
	if bearer != "" {
		req.Header.Set("Authorization", "Bearer "+bearer)
	}
	rec := httptest.NewRecorder()
	srv.ServeHTTP(rec, req)
	return rec
}

func login(t *testing.T, srv http.Handler, email string) TokenPair {
	t.Helper()
	rec := do(t, srv, http.MethodPost, "/api/v1/auth/token/", "", map[string]string{"email": email, "password": "PilotPass!"})
	if rec.Code != http.StatusOK {
		t.Fatalf("login failed: %d %s", rec.Code, rec.Body.String())
	}
	var pair TokenPair
	if err := json.Unmarshal(rec.Body.Bytes(), &pair); err != nil {
		t.Fatal(err)
	}
	return pair
}

func TestLoginReturnsTokenPair(t *testing.T) {
	_, srv := newTestServer(t, false)
	pair := login(t, srv, "student.a@pilot.maple")
	if pair.Access == "" || pair.Refresh == "" {
		t.Fatalf("expected both tokens, got %+v", pair)
	}
}

func TestLoginFailures(t *testing.T) {
	cases := []struct {
		name            string
		requireVerified bool
		body            map[string]string
		wantStatus      int
	}{
		{"wrong password", false, map[string]string{"email": "student.a@pilot.maple", "password": "nope"}, http.StatusUnauthorized},
		{"unknown email", false, map[string]string{"email": "nobody@pilot.maple", "password": "PilotPass!"}, http.StatusUnauthorized},
		{"inactive account", false, map[string]string{"email": "gone@pilot.maple", "password": "PilotPass!"}, http.StatusUnauthorized},
		{"missing password", false, map[string]string{"email": "student.a@pilot.maple"}, http.StatusBadRequest},
		{"unverified when required", true, map[string]string{"email": "new@pilot.maple", "password": "PilotPass!"}, http.StatusUnauthorized},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			_, srv := newTestServer(t, tc.requireVerified)
			rec := do(t, srv, http.MethodPost, "/api/v1/auth/token/", "", tc.body)
			if rec.Code != tc.wantStatus {
				t.Fatalf("want %d, got %d: %s", tc.wantStatus, rec.Code, rec.Body.String())
			}
		})
	}
}

func TestUnverifiedLoginAllowedWhenNotRequired(t *testing.T) {
	_, srv := newTestServer(t, false)
	login(t, srv, "new@pilot.maple")
}

func TestRefreshRotatesAndRejectsReuse(t *testing.T) {
	_, srv := newTestServer(t, false)
	pair := login(t, srv, "student.a@pilot.maple")

	first := do(t, srv, http.MethodPost, "/api/v1/auth/token/refresh/", "", map[string]string{"refresh": pair.Refresh})
	if first.Code != http.StatusOK {
		t.Fatalf("refresh failed: %d %s", first.Code, first.Body.String())
	}
	var rotated TokenPair
	_ = json.Unmarshal(first.Body.Bytes(), &rotated)
	if rotated.Refresh == "" || rotated.Refresh == pair.Refresh {
		t.Fatal("expected a new refresh token")
	}

	reuse := do(t, srv, http.MethodPost, "/api/v1/auth/token/refresh/", "", map[string]string{"refresh": pair.Refresh})
	if reuse.Code != http.StatusUnauthorized {
		t.Fatalf("reusing a rotated refresh token must fail, got %d", reuse.Code)
	}
}

func TestRefreshRejectsAccessToken(t *testing.T) {
	_, srv := newTestServer(t, false)
	pair := login(t, srv, "student.a@pilot.maple")
	rec := do(t, srv, http.MethodPost, "/api/v1/auth/token/refresh/", "", map[string]string{"refresh": pair.Access})
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("want 401, got %d", rec.Code)
	}
}

func TestLogoutRevokesRefreshToken(t *testing.T) {
	_, srv := newTestServer(t, false)
	pair := login(t, srv, "student.a@pilot.maple")

	out := do(t, srv, http.MethodPost, "/api/v1/auth/logout/", "", map[string]string{"refresh": pair.Refresh})
	if out.Code != http.StatusNoContent {
		t.Fatalf("logout: want 204, got %d %s", out.Code, out.Body.String())
	}
	again := do(t, srv, http.MethodPost, "/api/v1/auth/token/refresh/", "", map[string]string{"refresh": pair.Refresh})
	if again.Code != http.StatusUnauthorized {
		t.Fatalf("refresh after logout must fail, got %d", again.Code)
	}
}

func TestMeReturnsRoleAndMemberships(t *testing.T) {
	_, srv := newTestServer(t, false)
	pair := login(t, srv, "student.a@pilot.maple")

	rec := do(t, srv, http.MethodGet, "/api/v1/auth/me/", pair.Access, nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("me: %d %s", rec.Code, rec.Body.String())
	}
	var me Me
	if err := json.Unmarshal(rec.Body.Bytes(), &me); err != nil {
		t.Fatal(err)
	}
	if me.Role != "student" || me.Email != "student.a@pilot.maple" {
		t.Fatalf("unexpected me: %+v", me)
	}
	if len(me.Memberships) != 1 || me.Memberships[0].InstitutionName != "Maple Pilot School" {
		t.Fatalf("unexpected memberships: %+v", me.Memberships)
	}
	if me.Children == nil || len(me.Children) != 0 {
		t.Fatalf("a student has an empty children list, got %+v", me.Children)
	}
}

func TestMeListsApprovedChildrenForParents(t *testing.T) {
	_, srv := newTestServer(t, false)
	pair := login(t, srv, "parent.a@pilot.maple")

	rec := do(t, srv, http.MethodGet, "/api/v1/auth/me/", pair.Access, nil)
	var me Me
	_ = json.Unmarshal(rec.Body.Bytes(), &me)
	if len(me.Children) != 1 || me.Children[0].FullName != "Amina" {
		t.Fatalf("expected the linked child, got %+v", me.Children)
	}
}

func TestMeRequiresValidAccessToken(t *testing.T) {
	_, srv := newTestServer(t, false)
	pair := login(t, srv, "student.a@pilot.maple")

	for name, bearer := range map[string]string{"missing": "", "garbage": "abc", "refresh token": pair.Refresh} {
		t.Run(name, func(t *testing.T) {
			rec := do(t, srv, http.MethodGet, "/api/v1/auth/me/", bearer, nil)
			if rec.Code != http.StatusUnauthorized {
				t.Fatalf("want 401, got %d", rec.Code)
			}
		})
	}
}
