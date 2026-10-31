package school

import (
	"fmt"
	"net/http"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/testkit"
)

const (
	classesURL     = "/api/v1/classes/"
	enrollmentsURL = "/api/v1/class-enrollments/"
	registerURL    = "/api/v1/attendance/daily/"
)

func newWorld(t *testing.T) *testkit.World {
	w := testkit.New(t)
	r := chi.NewRouter()
	NewHandler(NewPostgresStore(w.Pool), w.Ids, w.Auth.RequireUser).Mount(r)
	w.Router = r
	return w
}

type school struct {
	id, head, teacher, otherTeacher, student, classmate int64
	class                                               int64
}

// setUp makes a school with a term, a leader, two teachers, two students and
// one class taught by the first teacher with both students enrolled.
func setUp(w *testkit.World) school {
	s := school{id: w.School("Register School")}
	w.Term(s.id)
	s.head = w.Person("institution", "headteacher", s.id)
	s.teacher = w.Person("teacher", "class_teacher", s.id)
	s.otherTeacher = w.Person("teacher", "subject_teacher", s.id)
	s.student = w.Person("student", "student", s.id)
	s.classmate = w.Person("student", "student", s.id)

	code, body := w.Call(s.head, http.MethodPost, classesURL, map[string]any{
		"title": "S3 West", "institution": s.id, "class_level": w.ClassLevel(), "teacher": s.teacher, "is_published": true,
	})
	if code != http.StatusCreated {
		w.T.Fatalf("create class: %d %v", code, body)
	}
	s.class = testkit.ID(body)
	for _, st := range []int64{s.student, s.classmate} {
		if code, body := w.Call(s.head, http.MethodPost, enrollmentsURL, map[string]any{"enrolled_class": s.class, "student": st}); code != http.StatusCreated {
			w.T.Fatalf("enrol: %d %v", code, body)
		}
	}
	return s
}

func today() string { return time.Now().Format("2006-01-02") }

func TestClassesAreVisibleToTheRightPeople(t *testing.T) {
	w := newWorld(t)
	s := setUp(w)
	outsider := w.Person("teacher", "class_teacher", w.School("Elsewhere"))

	for name, who := range map[string]int64{"leader": s.head, "class teacher": s.teacher, "enrolled student": s.student} {
		if _, page := w.Call(who, http.MethodGet, classesURL, nil); !testkit.Contains(testkit.IDs(page), s.class) {
			t.Errorf("%s should see the class", name)
		}
	}
	for name, who := range map[string]int64{"another teacher": s.otherTeacher, "another school": outsider} {
		if _, page := w.Call(who, http.MethodGet, classesURL, nil); testkit.Contains(testkit.IDs(page), s.class) {
			t.Errorf("%s must not see the class", name)
		}
	}

	code, roster := w.Call(s.teacher, http.MethodGet, fmt.Sprintf("%s%d/roster/", classesURL, s.class), nil)
	students, _ := roster["students"].([]any)
	if code != http.StatusOK || len(students) != 2 {
		t.Fatalf("roster: %d %v", code, roster)
	}
	if code, _ := w.Call(s.student, http.MethodGet, fmt.Sprintf("%s%d/roster/", classesURL, s.class), nil); code != http.StatusForbidden {
		t.Errorf("students must not read the roster, got %d", code)
	}
}

func TestOnlyLeadersManageClassesAndEnrolment(t *testing.T) {
	w := newWorld(t)
	s := setUp(w)
	if code, _ := w.Call(s.teacher, http.MethodPost, classesURL, map[string]any{
		"title": "Mine", "institution": s.id, "class_level": w.ClassLevel(), "teacher": s.teacher,
	}); code != http.StatusForbidden {
		t.Errorf("teacher creating a class: want 403, got %d", code)
	}
	if code, _ := w.Call(s.student, http.MethodPost, enrollmentsURL, map[string]any{"enrolled_class": s.class, "student": s.student}); code != http.StatusForbidden {
		t.Errorf("student enrolling: want 403, got %d", code)
	}
	outsideStudent := w.Person("student", "student", w.School("Other"))
	if code, _ := w.Call(s.head, http.MethodPost, enrollmentsURL, map[string]any{"enrolled_class": s.class, "student": outsideStudent}); code != http.StatusBadRequest {
		t.Errorf("enrolling a student from another school: want 400, got %d", code)
	}
}

func TestTeacherTakesTheRegister(t *testing.T) {
	w := newWorld(t)
	s := setUp(w)
	parent := w.Person("parent", "parent", s.id)
	w.LinkParent(parent, s.student, "approved")

	take := func(status string) {
		code, body := w.Call(s.teacher, http.MethodPost, registerURL, map[string]any{
			"class": s.class, "record_date": today(),
			"entries": []map[string]any{
				{"student": s.student, "status": status},
				{"student": s.classmate, "status": "late", "notes": "Bus was late"},
			},
		})
		if code != http.StatusOK || body["saved"] != float64(2) {
			t.Fatalf("take register: %d %v", code, body)
		}
	}
	take("present")
	take("unauthorized_absent") // saving again updates instead of duplicating

	_, page := w.Call(s.teacher, http.MethodGet, fmt.Sprintf("%s?class=%d&record_date=%s", registerURL, s.class, today()), nil)
	if page["count"] != float64(2) {
		t.Fatalf("teacher should see 2 marks for today, got %v", page)
	}
	_, mine := w.Call(s.student, http.MethodGet, registerURL, nil)
	results, _ := mine["results"].([]any)
	if len(results) != 1 || results[0].(map[string]any)["status"] != "unauthorized_absent" {
		t.Fatalf("student should see only their own updated mark, got %v", mine)
	}
	if _, kids := w.Call(parent, http.MethodGet, registerURL, nil); kids["count"] != float64(1) {
		t.Fatalf("parent should see their child's mark, got %v", kids)
	}
}

func TestRegisterRules(t *testing.T) {
	w := newWorld(t)
	s := setUp(w)
	stranger := w.Person("student", "student", s.id) // in the school, not in the class

	cases := []struct {
		name  string
		who   int64
		entry map[string]any
		want  int
	}{
		{"student not in the class", s.teacher, map[string]any{"student": stranger, "status": "present"}, http.StatusBadRequest},
		{"unknown status", s.teacher, map[string]any{"student": s.student, "status": "asleep"}, http.StatusBadRequest},
		{"teacher of another class", s.otherTeacher, map[string]any{"student": s.student, "status": "present"}, http.StatusNotFound},
		{"a student", s.student, map[string]any{"student": s.student, "status": "present"}, http.StatusNotFound},
		{"school leader", s.head, map[string]any{"student": s.student, "status": "present"}, http.StatusOK},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			code, body := w.Call(tc.who, http.MethodPost, registerURL, map[string]any{
				"class": s.class, "record_date": today(), "entries": []map[string]any{tc.entry},
			})
			if code != tc.want {
				t.Fatalf("want %d, got %d %v", tc.want, code, body)
			}
		})
	}
}

func TestRegisterNeedsATerm(t *testing.T) {
	w := newWorld(t)
	noTerm := w.School("No Term School")
	head := w.Person("institution", "headteacher", noTerm)
	teacher := w.Person("teacher", "class_teacher", noTerm)
	student := w.Person("student", "student", noTerm)
	_, class := w.Call(head, http.MethodPost, classesURL, map[string]any{
		"title": "P7", "institution": noTerm, "class_level": w.ClassLevel(), "teacher": teacher,
	})
	w.Call(head, http.MethodPost, enrollmentsURL, map[string]any{"enrolled_class": testkit.ID(class), "student": student})

	code, body := w.Call(teacher, http.MethodPost, registerURL, map[string]any{
		"class": testkit.ID(class), "record_date": today(), "entries": []map[string]any{{"student": student, "status": "present"}},
	})
	if code != http.StatusConflict || body["code"] != "no_term" {
		t.Fatalf("want 409 no_term, got %d %v", code, body)
	}
}
