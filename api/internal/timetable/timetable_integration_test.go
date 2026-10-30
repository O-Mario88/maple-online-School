package timetable

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/testkit"
)

const (
	termsURL = "/api/v1/scheduling/terms/"
	roomsURL = "/api/v1/scheduling/rooms/"
	slotsURL = "/api/v1/scheduling/timetable/"
)

func newWorld(t *testing.T) *testkit.World {
	w := testkit.New(t)
	r := chi.NewRouter()
	NewHandler(NewPostgresStore(w.Pool), w.Ids, w.Auth.RequireUser).Mount(r)
	w.Router = r
	return w
}

func TestLeaderBuildsATimetableWithoutClashes(t *testing.T) {
	w := newWorld(t)
	school := w.School("Timetable School")
	head := w.Person("institution", "headteacher", school)
	teacher := w.Person("teacher", "class_teacher", school)
	other := w.Person("teacher", "subject_teacher", school)
	student := w.Person("student", "student", school)
	classA, classB := w.Class(school, teacher), w.Class(school, other)
	w.Enrol(classA, student)

	code, term := w.Call(head, http.MethodPost, termsURL, map[string]any{"name": "Term 1 2027", "start_date": "2027-02-01", "end_date": "2027-05-01", "is_active": true})
	if code != http.StatusCreated {
		t.Fatalf("create term: %d %v", code, term)
	}
	code, room := w.Call(head, http.MethodPost, roomsURL, map[string]any{"name": "Lab 1", "capacity": 40})
	if code != http.StatusCreated {
		t.Fatalf("create room: %d %v", code, room)
	}
	slot := func(class int64, day int, start, end string, extra map[string]any) (int, map[string]any) {
		body := map[string]any{"class": class, "term": testkit.ID(term), "day_of_week": day, "start_time": start, "end_time": end}
		for k, v := range extra {
			body[k] = v
		}
		return w.Call(head, http.MethodPost, slotsURL, body)
	}

	code, first := slot(classA, 0, "08:00", "09:00", map[string]any{"room": testkit.ID(room)})
	if code != http.StatusCreated || first["teacher"] != float64(teacher) {
		t.Fatalf("first slot (teacher defaults to the class teacher): %d %v", code, first)
	}
	clashes := []struct {
		name  string
		class int64
		start string
		extra map[string]any
	}{
		{"same class overlapping", classA, "08:30", nil},
		{"same room overlapping", classB, "08:30", map[string]any{"room": testkit.ID(room)}},
		{"same teacher overlapping", classB, "08:15", map[string]any{"teacher": teacher}},
	}
	for _, c := range clashes {
		if code, body := slot(c.class, 0, c.start, "09:30", c.extra); code != http.StatusConflict || body["code"] != "clash" {
			t.Errorf("%s: want 409 clash, got %d %v", c.name, code, body)
		}
	}
	if code, _ := slot(classB, 0, "09:00", "10:00", map[string]any{"room": testkit.ID(room)}); code != http.StatusCreated {
		t.Errorf("back-to-back in the same room should be fine, got %d", code)
	}
	if code, _ := slot(classA, 0, "10:00", "09:00", nil); code != http.StatusBadRequest {
		t.Errorf("end before start: want 400, got %d", code)
	}

	// Who sees what.
	_, mine := w.Call(student, http.MethodGet, slotsURL, nil)
	if !testkit.Contains(testkit.IDs(mine), testkit.ID(first)) || len(testkit.IDs(mine)) != 1 {
		t.Errorf("student should see only their class's slot, got %v", mine)
	}
	_, theirs := w.Call(other, http.MethodGet, slotsURL, nil)
	if testkit.Contains(testkit.IDs(theirs), testkit.ID(first)) {
		t.Errorf("another teacher should not see this slot")
	}
	_, all := w.Call(head, http.MethodGet, fmt.Sprintf("%s?day=0", slotsURL), nil)
	if len(testkit.IDs(all)) != 2 {
		t.Errorf("leader should see both Monday slots, got %v", all)
	}

	// Removing a slot frees the time.
	if code, _ := w.Call(head, http.MethodDelete, fmt.Sprintf("%s%d/", slotsURL, testkit.ID(first)), nil); code != http.StatusNoContent {
		t.Fatalf("remove slot: %d", code)
	}
	if code, _ := slot(classA, 0, "08:30", "09:00", nil); code != http.StatusCreated {
		t.Errorf("time should be free after removal, got %d", code)
	}
}

func TestOnlyLeadersChangeTheTimetable(t *testing.T) {
	w := newWorld(t)
	school := w.School("Rules School")
	w.Term(school)
	teacher := w.Person("teacher", "class_teacher", school)
	class := w.Class(school, teacher)
	for name, body := range map[string]map[string]any{
		termsURL: {"name": "T", "start_date": "2027-01-01", "end_date": "2027-02-01"},
		roomsURL: {"name": "R", "capacity": 10},
		slotsURL: {"class": class, "day_of_week": 1, "start_time": "08:00", "end_time": "09:00"},
	} {
		if code, _ := w.Call(teacher, http.MethodPost, name, body); code != http.StatusForbidden {
			t.Errorf("teacher posting to %s: want 403, got %d", name, code)
		}
	}
}

func TestOnlyOneActiveTerm(t *testing.T) {
	w := newWorld(t)
	school := w.School("Terms School")
	head := w.Person("institution", "headteacher", school)
	w.Call(head, http.MethodPost, termsURL, map[string]any{"name": "Term 1", "start_date": "2027-02-01", "end_date": "2027-05-01", "is_active": true})
	w.Call(head, http.MethodPost, termsURL, map[string]any{"name": "Term 2", "start_date": "2027-05-20", "end_date": "2027-08-20", "is_active": true})
	_, list := w.Call(head, http.MethodGet, termsURL, nil)
	active := 0
	results, _ := list["results"].([]any)
	for _, r := range results {
		if r.(map[string]any)["is_active"] == true {
			active++
		}
	}
	if active != 1 {
		t.Fatalf("exactly one term should be active, got %d (%v)", active, list)
	}
}
