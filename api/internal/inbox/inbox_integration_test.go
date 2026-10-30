package inbox

import (
	"context"
	"net/http"
	"slices"
	"strconv"
	"testing"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/platform/dbgen"
	"github.com/O-Mario88/maple-online-School/api/internal/testkit"
)

func setup(t *testing.T) *testkit.World {
	w := testkit.New(t)
	r := chi.NewRouter()
	NewHandler(NewPostgresStore(w.Pool), w.Auth.RequireUser).Mount(r)
	w.Router = r
	return w
}

func titles(page map[string]any) []string {
	var out []string
	for _, r := range page["results"].([]any) {
		out = append(out, r.(map[string]any)["title"].(string))
	}
	return out
}

func itoa(n int64) string { return strconv.FormatInt(n, 10) }

func TestPeopleSeeAndClearOnlyTheirOwnNotifications(t *testing.T) {
	w := setup(t)
	ctx := context.Background()
	q := dbgen.New(w.Pool)
	alice := w.Person("teacher", "", 0)
	bob := w.Person("teacher", "", 0)
	for _, title := range []string{"First", "Second"} {
		if err := Notify(ctx, q, alice, Note{Kind: "test", Title: title, Body: "body", Link: "/"}); err != nil {
			t.Fatal(err)
		}
	}
	if err := Notify(ctx, q, bob, Note{Kind: "test", Title: "Bob's", Link: "/"}); err != nil {
		t.Fatal(err)
	}

	code, page := w.Call(alice, http.MethodGet, "/api/v1/inbox/", nil)
	if code != http.StatusOK || !slices.Equal(titles(page), []string{"Second", "First"}) {
		t.Fatalf("newest first, only Alice's: %d %v", code, titles(page))
	}
	if _, s := w.Call(alice, http.MethodGet, "/api/v1/inbox/summary/", nil); s["unread"] != float64(2) {
		t.Errorf("two unread: %v", s)
	}

	newest := testkit.IDs(page)[0]
	if code, _ := w.Call(bob, http.MethodPost, "/api/v1/inbox/"+itoa(newest)+"/read/", nil); code != http.StatusNotFound {
		t.Errorf("Bob can't touch Alice's notification: %d", code)
	}
	if code, _ := w.Call(alice, http.MethodPost, "/api/v1/inbox/"+itoa(newest)+"/read/", nil); code != http.StatusNoContent {
		t.Errorf("mark read: %d", code)
	}
	if _, s := w.Call(alice, http.MethodGet, "/api/v1/inbox/summary/", nil); s["unread"] != float64(1) {
		t.Errorf("one unread after reading one: %v", s)
	}
	if _, page := w.Call(alice, http.MethodGet, "/api/v1/inbox/?unread=1", nil); !slices.Equal(titles(page), []string{"First"}) {
		t.Errorf("unread filter: %v", titles(page))
	}
	if code, _ := w.Call(alice, http.MethodPost, "/api/v1/inbox/read-all/", nil); code != http.StatusNoContent {
		t.Errorf("read all: %d", code)
	}
	if _, s := w.Call(alice, http.MethodGet, "/api/v1/inbox/summary/", nil); s["unread"] != float64(0) {
		t.Errorf("nothing unread: %v", s)
	}
	if _, s := w.Call(bob, http.MethodGet, "/api/v1/inbox/summary/", nil); s["unread"] != float64(1) {
		t.Errorf("Alice clearing hers leaves Bob's alone: %v", s)
	}
	if code, _ := w.Call(0, http.MethodGet, "/api/v1/inbox/", nil); code != http.StatusUnauthorized {
		t.Errorf("signed out: %d", code)
	}
}

func TestNotifyFamilyReachesTheLearnerAndApprovedParentsOnly(t *testing.T) {
	w := setup(t)
	school := w.School("Inbox School")
	student := w.Person("student", "student", school)
	mum := w.Person("parent", "", 0)
	stranger := w.Person("parent", "", 0)
	w.LinkParent(mum, student, "approved")
	w.LinkParent(stranger, student, "pending")

	if err := NotifyFamily(context.Background(), dbgen.New(w.Pool), student, Note{Kind: "invoice", Title: "New invoice", Link: "/fees"}); err != nil {
		t.Fatal(err)
	}
	for user, want := range map[int64]float64{student: 1, mum: 1, stranger: 0} {
		if _, s := w.Call(user, http.MethodGet, "/api/v1/inbox/summary/", nil); s["unread"] != want {
			t.Errorf("user %d: want %v unread, got %v", user, want, s)
		}
	}
}
