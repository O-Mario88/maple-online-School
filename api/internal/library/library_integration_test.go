package library

import (
	"context"
	"net/http"
	"slices"
	"strconv"
	"testing"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/testkit"
)

const (
	itemsURL    = "/api/v1/library/items/"
	progressURL = "/api/v1/library/progress/"
	continueURL = "/api/v1/library/continue/"
)

type shelf struct {
	w                                         *testkit.World
	school, teacher, colleague, head, student int64
	outsider, admin                           int64
}

func newShelf(t *testing.T) shelf {
	w := testkit.New(t)
	r := chi.NewRouter()
	NewHandler(NewPostgresStore(w.Pool), w.Auth.RequireUser).Mount(r)
	w.Router = r
	s := shelf{w: w, school: w.School("Library School")}
	s.teacher = w.Person("teacher", "subject_teacher", s.school)
	s.colleague = w.Person("teacher", "subject_teacher", s.school)
	s.head = w.Person("teacher", "headteacher", s.school)
	s.student = w.Person("student", "student", s.school)
	s.outsider = w.Person("teacher", "subject_teacher", w.School("Other School"))
	s.admin = w.Person("admin", "", 0)
	t.Cleanup(func() {
		ctx := context.Background()
		people := []int64{s.teacher, s.colleague, s.head, s.student, s.outsider, s.admin}
		items := `(SELECT id FROM resources_contentitem WHERE uploaded_by_id = ANY($1))`
		for _, q := range []string{
			`DELETE FROM resources_contentassignment WHERE student_id = ANY($1) OR content_item_id IN ` + items,
			`DELETE FROM resources_contentengagement WHERE student_id = ANY($1) OR content_item_id IN ` + items,
			`DELETE FROM resources_contentauditlog WHERE content_item_id IN ` + items,
			`DELETE FROM resources_contentvisibilityrule WHERE content_item_id IN ` + items,
			`DELETE FROM resources_contentitem WHERE uploaded_by_id = ANY($1)`,
		} {
			_, _ = w.Pool.Exec(ctx, q, people)
		}
	})
	return s
}

func (s shelf) add(t *testing.T, user int64, body map[string]any) map[string]any {
	t.Helper()
	code, res := s.w.Call(user, http.MethodPost, itemsURL, body)
	if code != http.StatusCreated {
		t.Fatalf("add %v: %d %v", body, code, res)
	}
	return res
}

func ids(page map[string]any) []string {
	var out []string
	results, _ := page["results"].([]any)
	for _, r := range results {
		if m, ok := r.(map[string]any); ok {
			out = append(out, m["id"].(string))
		}
	}
	return out
}

func idOf(m map[string]any) string { s, _ := m["id"].(string); return s }

func TestWhoSeesWhichLibraryItem(t *testing.T) {
	s := newShelf(t)
	link := "https://example.org/notes"
	private := idOf(s.add(t, s.teacher, map[string]any{"title": "My draft notes", "content_type": "notes", "external_url": link}))
	school := idOf(s.add(t, s.teacher, map[string]any{"title": "Algebra notes", "content_type": "notes", "external_url": link, "visibility_scope": "institution", "owner_institution": s.school}))
	pending := s.add(t, s.teacher, map[string]any{"title": "Algebra for everyone", "content_type": "video", "external_url": link, "visibility_scope": "global"})
	global := idOf(pending)
	if pending["publication_status"] != "under_review" {
		t.Errorf("a teacher's platform-wide item waits for review: %v", pending)
	}
	official := idOf(s.add(t, s.admin, map[string]any{"title": "Maple past paper 2025", "content_type": "mock_exam", "external_url": link, "visibility_scope": "global"}))

	sees := func(user int64) []string { _, page := s.w.Call(user, http.MethodGet, itemsURL, nil); return ids(page) }
	check := func(name string, user int64, want, hide []string) {
		got := sees(user)
		for _, id := range want {
			if !slices.Contains(got, id) {
				t.Errorf("%s should see %s", name, id)
			}
		}
		for _, id := range hide {
			if slices.Contains(got, id) {
				t.Errorf("%s should not see %s", name, id)
			}
		}
	}
	check("uploader", s.teacher, []string{private, school, global, official}, nil)
	check("student of the school", s.student, []string{school, official}, []string{private, global})
	check("another school", s.outsider, []string{official}, []string{private, school, global})
	check("administrator", s.admin, []string{global, official}, []string{private, school})

	if code, _ := s.w.Call(s.teacher, http.MethodPost, itemsURL+global+"/moderate/", map[string]any{"decision": "approve"}); code != http.StatusForbidden {
		t.Errorf("only administrators moderate: %d", code)
	}
	if code, res := s.w.Call(s.admin, http.MethodPost, itemsURL+global+"/moderate/", map[string]any{"decision": "approve"}); code != http.StatusOK || res["publication_status"] != "published" {
		t.Fatalf("approve: %d %v", code, res)
	}
	check("another school after approval", s.outsider, []string{global}, nil)

	_, found := s.w.Call(s.student, http.MethodGet, itemsURL+"?q=algebra", nil)
	if got := ids(found); !slices.Contains(got, school) || slices.Contains(got, official) {
		t.Errorf("search matches titles: %v", got)
	}
	_, papers := s.w.Call(s.student, http.MethodGet, itemsURL+"?content_type=mock_exam", nil)
	if got := ids(papers); len(got) == 0 || !slices.Contains(got, official) || slices.Contains(got, school) {
		t.Errorf("filter by type: %v", got)
	}
}

func TestLibraryWriteRules(t *testing.T) {
	s := newShelf(t)
	refused := []struct {
		name string
		user int64
		body map[string]any
		want int
	}{
		{"a student adding", s.student, map[string]any{"title": "x", "content_type": "notes", "external_url": "https://a.org"}, http.StatusForbidden},
		{"no title", s.teacher, map[string]any{"title": " ", "content_type": "notes", "external_url": "https://a.org"}, http.StatusBadRequest},
		{"unknown type", s.teacher, map[string]any{"title": "x", "content_type": "meme", "external_url": "https://a.org"}, http.StatusBadRequest},
		{"unsafe link", s.teacher, map[string]any{"title": "x", "content_type": "notes", "external_url": "javascript:alert(1)"}, http.StatusBadRequest},
		{"no link", s.teacher, map[string]any{"title": "x", "content_type": "notes"}, http.StatusBadRequest},
		{"another school's library", s.outsider, map[string]any{"title": "x", "content_type": "notes", "external_url": "https://a.org", "visibility_scope": "institution", "owner_institution": s.school}, http.StatusForbidden},
	}
	for _, r := range refused {
		if code, res := s.w.Call(r.user, http.MethodPost, itemsURL, r.body); code != r.want {
			t.Errorf("%s: want %d, got %d %v", r.name, r.want, code, res)
		}
	}

	id := idOf(s.add(t, s.teacher, map[string]any{"title": "Cells", "content_type": "notes", "external_url": "https://a.org", "visibility_scope": "institution", "owner_institution": s.school}))
	path := itemsURL + id + "/"
	if code, _ := s.w.Call(s.colleague, http.MethodPatch, path, map[string]any{"title": "Mine"}); code != http.StatusForbidden {
		t.Errorf("a colleague editing: %d", code)
	}
	if code, res := s.w.Call(s.teacher, http.MethodPatch, path, map[string]any{"title": "Cells and tissues"}); code != http.StatusOK || res["title"] != "Cells and tissues" {
		t.Errorf("uploader edits: %d %v", code, res)
	}
	if code, _ := s.w.Call(s.colleague, http.MethodDelete, path, nil); code != http.StatusForbidden {
		t.Errorf("a colleague archiving: %d", code)
	}
	if code, _ := s.w.Call(s.head, http.MethodDelete, path, nil); code != http.StatusNoContent {
		t.Errorf("the school's leader archives: %d", code)
	}
	if code, _ := s.w.Call(s.student, http.MethodGet, path, nil); code != http.StatusNotFound {
		t.Errorf("an archived item is gone: %d", code)
	}
}

func TestProgressAndContinue(t *testing.T) {
	s := newShelf(t)
	item := idOf(s.add(t, s.teacher, map[string]any{"title": "Photosynthesis video", "content_type": "video", "external_url": "https://v.org/1", "visibility_scope": "institution", "owner_institution": s.school}))
	hidden := idOf(s.add(t, s.outsider, map[string]any{"title": "Elsewhere", "content_type": "notes", "external_url": "https://v.org/2"}))

	save := func(body map[string]any) (int, map[string]any) {
		return s.w.Call(s.student, http.MethodPost, progressURL, body)
	}
	if code, res := save(map[string]any{"item": item, "completion": 40, "position": 120, "active_seconds": 60, "new_visit": true}); code != http.StatusOK || res["status"] != "in_progress" {
		t.Fatalf("first progress: %d %v", code, res)
	}
	code, res := save(map[string]any{"item": item, "completion": 30, "position": 90, "active_seconds": 30})
	if code != http.StatusOK || res["completion_percentage"] != "40.00" || res["view_count"] != float64(1) || res["active_time_seconds"] != float64(90) {
		t.Errorf("progress never goes backwards and time adds up: %d %v", code, res)
	}
	_, cont := s.w.Call(s.student, http.MethodGet, continueURL, nil)
	if results, _ := cont["results"].([]any); len(results) != 1 {
		t.Errorf("continue lists the unfinished item: %v", cont)
	}
	if _, res := save(map[string]any{"item": item, "completion": 96, "position": 600}); res["status"] != "completed" || res["completed_at"] == nil {
		t.Errorf("95%% or more counts as finished: %v", res)
	}
	_, cont = s.w.Call(s.student, http.MethodGet, continueURL, nil)
	if results, _ := cont["results"].([]any); len(results) != 0 {
		t.Errorf("finished items leave the continue list: %v", cont)
	}
	if code, _ := save(map[string]any{"item": hidden, "completion": 10}); code != http.StatusNotFound {
		t.Errorf("progress on an item you can't see: %d", code)
	}
	if code, _ := save(map[string]any{"item": item, "completion": 140}); code != http.StatusBadRequest {
		t.Errorf("completion is a percentage: %d", code)
	}
}

func TestClassReadingLists(t *testing.T) {
	s := newShelf(t)
	class := s.w.Class(s.school, s.teacher)
	classmate := s.w.Person("student", "student", s.school)
	parent := s.w.Person("parent", "", 0)
	s.w.Enrol(class, s.student)
	s.w.Enrol(class, classmate)
	s.w.LinkParent(parent, s.student, "approved")

	item := idOf(s.add(t, s.teacher, map[string]any{"title": "Cell division reading", "content_type": "notes", "external_url": "https://r.org/1"}))
	elsewhere := idOf(s.add(t, s.outsider, map[string]any{"title": "Other school notes", "content_type": "notes", "external_url": "https://r.org/2"}))
	share := itemsURL + item + "/share/"
	due := "2026-11-20T17:00:00+03:00"

	refused := []struct {
		name string
		user int64
		path string
		want int
	}{
		{"a student", s.student, share, http.StatusForbidden},
		{"a colleague who doesn't teach the class", s.colleague, share, http.StatusForbidden},
		{"another school's teacher with their own item", s.outsider, itemsURL + elsewhere + "/share/", http.StatusForbidden},
	}
	for _, r := range refused {
		if code, res := s.w.Call(r.user, http.MethodPost, r.path, map[string]any{"class": class, "due_date": due}); code != r.want {
			t.Errorf("%s: want %d, got %d %v", r.name, r.want, code, res)
		}
	}
	code, res := s.w.Call(s.teacher, http.MethodPost, share, map[string]any{"class": class, "due_date": due, "note": "Read before Friday"})
	if code != http.StatusOK || res["assigned"] != float64(2) {
		t.Fatalf("share: %d %v", code, res)
	}

	if code, _ := s.w.Call(s.student, http.MethodGet, itemsURL+item+"/", nil); code != http.StatusOK {
		t.Errorf("a shared item is visible to the class: %d", code)
	}
	for name, user := range map[string]int64{"student": s.student, "parent": parent} {
		_, page := s.w.Call(user, http.MethodGet, "/api/v1/library/assigned/", nil)
		results, _ := page["results"].([]any)
		if len(results) != 1 || results[0].(map[string]any)["due_date"] == nil {
			t.Errorf("%s sees the assigned reading with its due date: %v", name, page)
		}
	}

	s.w.Call(s.student, http.MethodPost, progressURL, map[string]any{"item": item, "completion": 100, "new_visit": true})
	_, list := s.w.Call(s.teacher, http.MethodGet, "/api/v1/library/classes/"+itoa(class)+"/reading-list/", nil)
	rows, _ := list["results"].([]any)
	if len(rows) != 1 || rows[0].(map[string]any)["completed"] != float64(1) || rows[0].(map[string]any)["assigned"] != float64(2) {
		t.Errorf("the teacher sees 1 of 2 finished: %v", list)
	}
	if code, _ := s.w.Call(s.student, http.MethodGet, "/api/v1/library/classes/"+itoa(class)+"/reading-list/", nil); code != http.StatusForbidden {
		t.Errorf("class completion is for staff: %d", code)
	}

	if code, _ := s.w.Call(s.teacher, http.MethodDelete, share+itoa(class)+"/", nil); code != http.StatusNoContent {
		t.Fatalf("unshare: %d", code)
	}
	if code, _ := s.w.Call(classmate, http.MethodGet, itemsURL+item+"/", nil); code != http.StatusNotFound {
		t.Errorf("after unsharing the class no longer sees it: %d", code)
	}
	_, page := s.w.Call(classmate, http.MethodGet, "/api/v1/library/assigned/", nil)
	if results, _ := page["results"].([]any); len(results) != 0 {
		t.Errorf("and it leaves their assigned reading: %v", page)
	}
}

func itoa(n int64) string { return strconv.FormatInt(n, 10) }
