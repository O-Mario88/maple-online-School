package resources

import (
	"net/http"
	"strconv"
	"testing"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/testkit"
)

const (
	listURL  = "/api/v1/resources/"
	linksURL = "/api/v1/resources/shared-resource-link/"
)

func newWorld(t *testing.T) *testkit.World {
	w := testkit.New(t)
	r := chi.NewRouter()
	NewHandler(NewPostgresStore(w.Pool), w.Auth.RequireUser).Mount(r)
	w.Router = r
	return w
}

func create(t *testing.T, w *testkit.World, user int64, body map[string]any) int64 {
	t.Helper()
	code, res := w.Call(user, http.MethodPost, listURL, body)
	if code != http.StatusCreated {
		t.Fatalf("create %v: %d %v", body, code, res)
	}
	return testkit.ID(res)
}

func TestWhoSeesWhichResource(t *testing.T) {
	w := newWorld(t)
	school, other := w.School("Resource School"), w.School("Other School")
	teacher := w.Person("teacher", "subject_teacher", school)
	student := w.Person("student", "student", school)
	outsider := w.Person("teacher", "subject_teacher", other)
	admin := w.Person("admin", "", 0)

	private := create(t, w, teacher, map[string]any{"title": "My algebra notes", "external_url": "https://example.com/a"})
	shared := create(t, w, teacher, map[string]any{"title": "School algebra guide", "visibility": "institution_only", "owner_institution": school})
	public := create(t, w, admin, map[string]any{"title": "National geometry pack", "visibility": "platform_shared"})

	cases := []struct {
		name  string
		user  int64
		sees  []int64
		hides []int64
	}{
		{"uploader", teacher, []int64{private, shared, public}, nil},
		{"member of the school", student, []int64{shared, public}, []int64{private}},
		{"another school", outsider, []int64{public}, []int64{private, shared}},
	}
	for _, c := range cases {
		_, page := w.Call(c.user, http.MethodGet, listURL, nil)
		ids := testkit.IDs(page)
		for _, id := range c.sees {
			if !testkit.Contains(ids, id) {
				t.Errorf("%s should see %d: %v", c.name, id, ids)
			}
		}
		for _, id := range c.hides {
			if testkit.Contains(ids, id) {
				t.Errorf("%s should not see %d", c.name, id)
			}
			if code, _ := w.Call(c.user, http.MethodGet, listURL+itoa(id)+"/", nil); code != http.StatusNotFound {
				t.Errorf("%s fetching %d: want 404, got %d", c.name, id, code)
			}
		}
	}

	_, found := w.Call(student, http.MethodGet, listURL+"?search=algebra", nil)
	if ids := testkit.IDs(found); !testkit.Contains(ids, shared) || testkit.Contains(ids, public) {
		t.Errorf("search should match titles: %v", ids)
	}
	_, one := w.Call(teacher, http.MethodGet, listURL+itoa(shared)+"/", nil)
	if one["author_name"] == "" || one["price"] != "0.00" || one["owner_type"] != "institution" {
		t.Errorf("detail shape: %v", one)
	}
}

func TestResourceRulesForWriting(t *testing.T) {
	w := newWorld(t)
	school, other := w.School("Resource School"), w.School("Other School")
	teacher := w.Person("teacher", "subject_teacher", school)
	colleague := w.Person("teacher", "subject_teacher", school)
	head := w.Person("teacher", "headteacher", school)
	student := w.Person("student", "student", school)

	refused := []struct {
		name string
		user int64
		body map[string]any
		want int
	}{
		{"no title", teacher, map[string]any{"title": " "}, http.StatusBadRequest},
		{"unsafe link", teacher, map[string]any{"title": "x", "external_url": "javascript:alert(1)"}, http.StatusBadRequest},
		{"unknown visibility", teacher, map[string]any{"title": "x", "visibility": "everyone"}, http.StatusBadRequest},
		{"platform sharing by a teacher", teacher, map[string]any{"title": "x", "visibility": "platform_shared"}, http.StatusForbidden},
		{"another school's library", teacher, map[string]any{"title": "x", "visibility": "institution_only", "owner_institution": other}, http.StatusForbidden},
		{"school library by a student", student, map[string]any{"title": "x", "visibility": "institution_only", "owner_institution": school}, http.StatusForbidden},
		{"school library without a school", teacher, map[string]any{"title": "x", "visibility": "institution_only"}, http.StatusBadRequest},
	}
	for _, c := range refused {
		if code, body := w.Call(c.user, http.MethodPost, listURL, c.body); code != c.want {
			t.Errorf("%s: want %d, got %d %v", c.name, c.want, code, body)
		}
	}

	id := create(t, w, teacher, map[string]any{"title": "Fractions", "visibility": "institution_only", "owner_institution": school})
	path := listURL + itoa(id) + "/"
	if code, _ := w.Call(colleague, http.MethodPatch, path, map[string]any{"title": "Mine now"}); code != http.StatusForbidden {
		t.Errorf("a colleague editing: want 403, got %d", code)
	}
	if code, body := w.Call(teacher, http.MethodPatch, path, map[string]any{"title": "Fractions, part 1"}); code != http.StatusOK || body["title"] != "Fractions, part 1" {
		t.Errorf("uploader editing: %d %v", code, body)
	}
	if code, _ := w.Call(colleague, http.MethodDelete, path, nil); code != http.StatusForbidden {
		t.Errorf("a colleague deleting: want 403, got %d", code)
	}
	if code, _ := w.Call(head, http.MethodDelete, path, nil); code != http.StatusNoContent {
		t.Errorf("the school's leader can remove school resources: got %d", code)
	}
	if code, _ := w.Call(teacher, http.MethodGet, path, nil); code != http.StatusNotFound {
		t.Errorf("deleted resource: want 404, got %d", code)
	}
}

func TestSharingResourcesWithAClass(t *testing.T) {
	w := newWorld(t)
	school, other := w.School("Resource School"), w.School("Other School")
	teacher := w.Person("teacher", "subject_teacher", school)
	student := w.Person("student", "student", school)
	classmate := w.Person("student", "student", school)
	outsider := w.Person("teacher", "subject_teacher", other)
	class := w.Class(school, teacher)
	w.Enrol(class, student)

	res := create(t, w, teacher, map[string]any{"title": "Cells worksheet", "visibility": "institution_only", "owner_institution": school})
	mine := create(t, w, outsider, map[string]any{"title": "Outsider notes"})

	code, link := w.Call(teacher, http.MethodPost, linksURL, map[string]any{"resource": res, "target_class": class})
	if code != http.StatusCreated {
		t.Fatalf("link: %d %v", code, link)
	}
	if code, _ := w.Call(teacher, http.MethodPost, linksURL, map[string]any{"resource": res, "target_class": class}); code != http.StatusBadRequest {
		t.Errorf("duplicate link: want 400, got %d", code)
	}
	if code, _ := w.Call(outsider, http.MethodPost, linksURL, map[string]any{"resource": mine, "target_class": class}); code != http.StatusForbidden {
		t.Errorf("another school's teacher linking: want 403, got %d", code)
	}
	if code, _ := w.Call(student, http.MethodPost, linksURL, map[string]any{"resource": res, "target_class": class}); code != http.StatusForbidden {
		t.Errorf("student linking: want 403, got %d", code)
	}

	_, page := w.Call(student, http.MethodGet, linksURL+"?target_class="+itoa(class), nil)
	if !testkit.Contains(testkit.IDs(page), testkit.ID(link)) {
		t.Errorf("an enrolled student sees the class's resources: %v", page)
	}
	if _, page := w.Call(outsider, http.MethodGet, linksURL, nil); testkit.Contains(testkit.IDs(page), testkit.ID(link)) {
		t.Errorf("another school's teacher should not see the link")
	}
	if code, _ := w.Call(classmate, http.MethodDelete, linksURL+itoa(testkit.ID(link))+"/", nil); code != http.StatusForbidden {
		t.Errorf("a student removing a link: want 403, got %d", code)
	}

	if code, _ := w.Call(teacher, http.MethodDelete, listURL+itoa(res)+"/", nil); code != http.StatusNoContent {
		t.Fatalf("delete linked resource: %d", code)
	}
	if _, page := w.Call(student, http.MethodGet, linksURL, nil); len(testkit.IDs(page)) != 0 {
		t.Errorf("deleting a resource removes its class links: %v", page)
	}
}

func itoa(id int64) string { return strconv.FormatInt(id, 10) }
