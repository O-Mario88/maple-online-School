package family

import (
	"context"
	"net/http"
	"slices"
	"strconv"
	"testing"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/testkit"
)

const linksURL = "/api/v1/family/links/"

type families struct {
	w                                     *testkit.World
	school, other                         int64
	registrar, head, teacher, otherHead   int64
	parent, student, outsiderParent, kid2 int64
	link, otherLink                       int64
}

func newFamilies(t *testing.T) families {
	w := testkit.New(t)
	r := chi.NewRouter()
	NewHandler(NewPostgresStore(w.Pool), w.Auth.RequireUser).Mount(r)
	w.Router = r
	f := families{w: w, school: w.School("Family School"), other: w.School("Other Family School")}
	f.registrar = w.Person("teacher", "registrar", f.school)
	f.head = w.Person("teacher", "headteacher", f.school)
	f.teacher = w.Person("teacher", "subject_teacher", f.school)
	f.otherHead = w.Person("teacher", "headteacher", f.other)
	f.student = w.Person("student", "student", f.school)
	f.kid2 = w.Person("student", "student", f.other)
	f.parent = w.Person("parent", "", 0)
	f.outsiderParent = w.Person("parent", "", 0)
	f.link = w.LinkParent(f.parent, f.student, "pending")
	f.otherLink = w.LinkParent(f.outsiderParent, f.kid2, "pending")
	return f
}

func (f families) decide(user, link int64, action string) (int, map[string]any) {
	return f.w.Call(user, http.MethodPost, linksURL+strconv.FormatInt(link, 10)+"/"+action+"/", nil)
}

func TestSchoolStaffSeeOnlyTheirSchoolsLinks(t *testing.T) {
	f := newFamilies(t)

	code, page := f.w.Call(f.registrar, http.MethodGet, linksURL+"?status=pending", nil)
	if code != http.StatusOK {
		t.Fatalf("list: %d %v", code, page)
	}
	ids := testkit.IDs(page)
	if !testkit.Contains(ids, f.link) || testkit.Contains(ids, f.otherLink) {
		t.Errorf("registrar should see only their school's link, got %v", ids)
	}
	row := page["results"].([]any)[0].(map[string]any)
	if row["status"] != "pending" || row["parent"].(map[string]any)["email"] == "" {
		t.Errorf("row should carry status and the parent's contact: %v", row)
	}

	if _, page := f.w.Call(f.teacher, http.MethodGet, linksURL, nil); len(testkit.IDs(page)) != 0 {
		t.Errorf("a subject teacher doesn't handle admissions: %v", testkit.IDs(page))
	}
	if _, page := f.w.Call(f.parent, http.MethodGet, linksURL, nil); !slices.Equal(testkit.IDs(page), []int64{f.link}) {
		t.Errorf("a parent sees only their own links: %v", testkit.IDs(page))
	}
}

func TestRegistrarApprovesAndTheParentGetsAccess(t *testing.T) {
	f := newFamilies(t)

	code, body := f.decide(f.registrar, f.link, "approve")
	if code != http.StatusOK || body["status"] != "approved" {
		t.Fatalf("approve: %d %v", code, body)
	}
	if n := f.approvedChildren(t); n != 1 {
		t.Errorf("parent should now have one approved child, got %d", n)
	}
	if n := f.decisions(t, f.link); n != 1 {
		t.Errorf("the decision should be recorded once, got %d", n)
	}
	if n := f.w.Notes(f.parent, "family_link"); n != 1 {
		t.Errorf("the parent should be told once, got %d", n)
	}

	// Approving again changes nothing and records nothing.
	if code, _ := f.decide(f.head, f.link, "approve"); code != http.StatusOK {
		t.Errorf("repeat approve: %d", code)
	}
	if n := f.decisions(t, f.link); n != 1 {
		t.Errorf("a repeat should not add a decision, got %d", n)
	}

	// Declining an approved link takes access away again.
	if code, body := f.decide(f.head, f.link, "decline"); code != http.StatusOK || body["status"] != "declined" {
		t.Fatalf("decline: %d %v", code, body)
	}
	if n := f.approvedChildren(t); n != 0 {
		t.Errorf("a declined link must not grant access, got %d", n)
	}
	if n := f.w.Notes(f.parent, "family_link"); n != 2 {
		t.Errorf("the parent should be told about the change too, got %d", n)
	}
}

func TestOnlyAdmissionsStaffAtTheChildsSchoolDecide(t *testing.T) {
	f := newFamilies(t)

	if code, _ := f.decide(f.teacher, f.link, "approve"); code != http.StatusForbidden {
		t.Errorf("subject teacher: want 403, got %d", code)
	}
	if code, _ := f.decide(f.otherHead, f.link, "approve"); code != http.StatusNotFound {
		t.Errorf("another school's head: want 404, got %d", code)
	}
	if code, _ := f.decide(f.parent, f.link, "approve"); code != http.StatusForbidden {
		t.Errorf("the parent: want 403, got %d", code)
	}
	if code, _ := f.decide(f.registrar, f.link, "delete"); code != http.StatusMethodNotAllowed {
		t.Errorf("unknown action: want 405, got %d", code)
	}
	if n := f.approvedChildren(t); n != 0 {
		t.Errorf("nothing should have been approved, got %d", n)
	}
}

func (f families) approvedChildren(t *testing.T) int {
	t.Helper()
	var n int
	err := f.w.Pool.QueryRow(context.Background(), `
		SELECT count(*) FROM parent_portal_parentstudentlink l
		JOIN accounts_parentprofile pp ON pp.id = l.parent_profile_id
		WHERE pp.user_id = $1 AND l.consent_status = 'approved'`, f.parent).Scan(&n)
	if err != nil {
		t.Fatal(err)
	}
	return n
}

func (f families) decisions(t *testing.T, link int64) int {
	t.Helper()
	var n int
	if err := f.w.Pool.QueryRow(context.Background(), `SELECT count(*) FROM family_link_decisions WHERE link_id = $1`, link).Scan(&n); err != nil {
		t.Fatal(err)
	}
	return n
}
