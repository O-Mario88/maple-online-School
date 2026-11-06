package careers

import (
	"context"
	"net/http"
	"strconv"
	"strings"
	"testing"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/testkit"
)

func setup(t *testing.T) *testkit.World {
	w := testkit.New(t)
	r := chi.NewRouter()
	NewHandler(NewPostgresStore(w.Pool), w.Auth.RequireUser).Mount(r)
	w.Router = r
	return w
}

func staff(t *testing.T, w *testkit.World, id int64) {
	t.Helper()
	if _, err := w.Pool.Exec(context.Background(), "UPDATE accounts_user SET is_staff = true WHERE id = $1", id); err != nil {
		t.Fatal(err)
	}
}

func bodies(page map[string]any) []string {
	var out []string
	for _, r := range page["results"].([]any) {
		out = append(out, r.(map[string]any)["body"].(string))
	}
	return out
}

func TestLearnersSendRequestsAndSeeOnlyTheirOwn(t *testing.T) {
	w := setup(t)
	amina := w.Person("student", "", 0)
	brian := w.Person("student", "", 0)

	code, made := w.Call(amina, http.MethodPost, "/api/v1/career-requests/", map[string]any{"kind": "event", "body": "  A talk on careers in aviation  "})
	if code != http.StatusCreated || made["body"] != "A talk on careers in aviation" || made["status"] != "received" || made["kind"] != "event" {
		t.Fatalf("created, trimmed, received: %d %v", code, made)
	}
	if code, _ := w.Call(amina, http.MethodPost, "/api/v1/career-requests/", map[string]any{"kind": "community", "body": "Future Pilots"}); code != http.StatusCreated {
		t.Fatalf("community request: %d", code)
	}
	if code, _ := w.Call(brian, http.MethodPost, "/api/v1/career-requests/", map[string]any{"kind": "event", "body": "Brian's idea"}); code != http.StatusCreated {
		t.Fatalf("brian: %d", code)
	}

	code, page := w.Call(amina, http.MethodGet, "/api/v1/career-requests/", nil)
	if got := bodies(page); code != http.StatusOK || len(got) != 2 || got[0] != "Future Pilots" {
		t.Fatalf("newest first, only Amina's: %d %v", code, got)
	}
}

func TestRequestsAreChecked(t *testing.T) {
	w := setup(t)
	amina := w.Person("student", "", 0)
	for _, bad := range []map[string]any{
		{"kind": "advert", "body": "Buy now"},
		{"kind": "event", "body": "  "},
		{"kind": "event", "body": strings.Repeat("x", 501)},
	} {
		if code, _ := w.Call(amina, http.MethodPost, "/api/v1/career-requests/", bad); code != http.StatusBadRequest {
			t.Errorf("%v should be refused: %d", bad, code)
		}
	}
	if code, _ := w.Call(0, http.MethodPost, "/api/v1/career-requests/", map[string]any{"kind": "event", "body": "Anonymous"}); code != http.StatusUnauthorized {
		t.Errorf("signed-out people can't send requests: %d", code)
	}
}

func TestMapleStaffReadAllRequestsAndAnswerThem(t *testing.T) {
	w := setup(t)
	amina := w.Person("student", "", 0)
	team := w.Person("teacher", "", 0)
	_, made := w.Call(amina, http.MethodPost, "/api/v1/career-requests/", map[string]any{"kind": "community", "body": "Future Pilots"})
	id := strconv.FormatInt(int64(made["id"].(float64)), 10)

	if code, _ := w.Call(amina, http.MethodGet, "/api/v1/career-requests/all/", nil); code != http.StatusForbidden {
		t.Errorf("learners can't read everyone's: %d", code)
	}
	if code, _ := w.Call(amina, http.MethodPost, "/api/v1/career-requests/"+id+"/status/", map[string]any{"status": "planned"}); code != http.StatusForbidden {
		t.Errorf("learners can't answer: %d", code)
	}

	staff(t, w, team)
	code, all := w.Call(team, http.MethodGet, "/api/v1/career-requests/all/?status=received", nil)
	if code != http.StatusOK || len(bodies(all)) != 1 {
		t.Fatalf("staff see the request: %d %v", code, all)
	}
	first := all["results"].([]any)[0].(map[string]any)
	if _, leaked := first["email"]; leaked {
		t.Error("staff list shows no email address")
	}
	if code, _ := w.Call(team, http.MethodPost, "/api/v1/career-requests/"+id+"/status/", map[string]any{"status": "maybe"}); code != http.StatusBadRequest {
		t.Errorf("unknown status refused: %d", code)
	}
	if code, _ := w.Call(team, http.MethodPost, "/api/v1/career-requests/"+id+"/status/", map[string]any{"status": "planned"}); code != http.StatusOK {
		t.Fatalf("staff answer: %d", code)
	}
	_, mine := w.Call(amina, http.MethodGet, "/api/v1/career-requests/", nil)
	if mine["results"].([]any)[0].(map[string]any)["status"] != "planned" {
		t.Errorf("the learner sees the answer: %v", mine)
	}
	if code, _ := w.Call(team, http.MethodPost, "/api/v1/career-requests/999999/status/", map[string]any{"status": "planned"}); code != http.StatusNotFound {
		t.Errorf("missing request: %d", code)
	}
}
