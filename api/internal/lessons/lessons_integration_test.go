package lessons

import (
	"net/http"
	"strconv"
	"testing"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/testkit"
)

const (
	lessonsURL    = "/api/v1/lessons/lesson/"
	notesURL      = "/api/v1/lessons/lesson-note/"
	recordingsURL = "/api/v1/lessons/lesson-recording/"
	attendanceURL = "/api/v1/lessons/lesson-attendance/"
	when          = "2026-11-02T09:00:00+03:00"
)

func newWorld(t *testing.T) *testkit.World {
	w := testkit.New(t)
	r := chi.NewRouter()
	NewHandler(NewPostgresStore(w.Pool), w.Auth.RequireUser).Mount(r)
	w.Router = r
	return w
}

func itoa(id int64) string { return strconv.FormatInt(id, 10) }

type classroom struct {
	w                                  *testkit.World
	school, teacher, student, outsider int64
	colleague, head, classmate, class  int64
	parent                             int64
}

func newClassroom(t *testing.T) classroom {
	w := newWorld(t)
	c := classroom{w: w, school: w.School("Lesson School")}
	other := w.School("Other School")
	c.teacher = w.Person("teacher", "subject_teacher", c.school)
	c.colleague = w.Person("teacher", "subject_teacher", c.school)
	c.head = w.Person("teacher", "headteacher", c.school)
	c.student = w.Person("student", "student", c.school)
	c.classmate = w.Person("student", "student", c.school)
	c.parent = w.Person("parent", "", 0)
	c.outsider = w.Person("teacher", "subject_teacher", other)
	c.class = w.Class(c.school, c.teacher)
	w.Enrol(c.class, c.student)
	w.Enrol(c.class, c.classmate)
	w.LinkParent(c.parent, c.student, "approved")
	return c
}

func (c classroom) lesson(t *testing.T, mode string) int64 {
	t.Helper()
	code, body := c.w.Call(c.teacher, http.MethodPost, lessonsURL, map[string]any{
		"parent_class": c.class, "title": "Photosynthesis", "access_mode": mode, "scheduled_at": when,
	})
	if code != http.StatusCreated {
		t.Fatalf("create lesson: %d %v", code, body)
	}
	return testkit.ID(body)
}

func TestDraftsStayWithStaffUntilPublished(t *testing.T) {
	c := newClassroom(t)
	id := c.lesson(t, "draft")
	path := lessonsURL + itoa(id) + "/"

	for name, user := range map[string]int64{"teacher": c.teacher, "head": c.head} {
		if code, _ := c.w.Call(user, http.MethodGet, path, nil); code != http.StatusOK {
			t.Errorf("%s should see the draft: %d", name, code)
		}
	}
	for name, user := range map[string]int64{"student": c.student, "parent": c.parent, "outsider": c.outsider, "colleague": c.colleague} {
		if code, _ := c.w.Call(user, http.MethodGet, path, nil); code != http.StatusNotFound {
			t.Errorf("%s should not see the draft: %d", name, code)
		}
	}

	code, body := c.w.Call(c.teacher, http.MethodPatch, path, map[string]any{"access_mode": "published"})
	if code != http.StatusOK || body["published_at"] == nil {
		t.Fatalf("publish: %d %v", code, body)
	}
	for name, user := range map[string]int64{"student": c.student, "parent": c.parent} {
		_, page := c.w.Call(user, http.MethodGet, lessonsURL+"?parent_class="+itoa(c.class), nil)
		if !testkit.Contains(testkit.IDs(page), id) {
			t.Errorf("%s should see the published lesson: %v", name, page)
		}
	}
	if _, page := c.w.Call(c.outsider, http.MethodGet, lessonsURL, nil); testkit.Contains(testkit.IDs(page), id) {
		t.Errorf("another school's teacher should not see the lesson")
	}
}

func TestOnlyTheClassTeacherOrLeadersPlanLessons(t *testing.T) {
	c := newClassroom(t)
	refused := []struct {
		name string
		user int64
		body map[string]any
		want int
	}{
		{"a student", c.student, map[string]any{"parent_class": c.class, "title": "x", "scheduled_at": when}, http.StatusForbidden},
		{"a colleague who doesn't teach the class", c.colleague, map[string]any{"parent_class": c.class, "title": "x", "scheduled_at": when}, http.StatusForbidden},
		{"another school", c.outsider, map[string]any{"parent_class": c.class, "title": "x", "scheduled_at": when}, http.StatusForbidden},
		{"no title", c.teacher, map[string]any{"parent_class": c.class, "title": " ", "scheduled_at": when}, http.StatusBadRequest},
		{"no time", c.teacher, map[string]any{"parent_class": c.class, "title": "x"}, http.StatusBadRequest},
		{"unknown mode", c.teacher, map[string]any{"parent_class": c.class, "title": "x", "scheduled_at": when, "access_mode": "secret"}, http.StatusBadRequest},
		{"unknown class", c.teacher, map[string]any{"parent_class": 999999999, "title": "x", "scheduled_at": when}, http.StatusBadRequest},
	}
	for _, r := range refused {
		if code, body := c.w.Call(r.user, http.MethodPost, lessonsURL, r.body); code != r.want {
			t.Errorf("%s: want %d, got %d %v", r.name, r.want, code, body)
		}
	}
	if code, _ := c.w.Call(c.head, http.MethodPost, lessonsURL, map[string]any{"parent_class": c.class, "title": "Assembly", "scheduled_at": when}); code != http.StatusCreated {
		t.Errorf("a school leader can plan lessons for any class: %d", code)
	}
	id := c.lesson(t, "published")
	if code, _ := c.w.Call(c.student, http.MethodPatch, lessonsURL+itoa(id)+"/", map[string]any{"title": "Hacked"}); code != http.StatusForbidden {
		t.Errorf("a student editing a lesson: want 403, got %d", code)
	}
}

func TestNotesAndRecordings(t *testing.T) {
	c := newClassroom(t)
	id := c.lesson(t, "published")

	code, note := c.w.Call(c.teacher, http.MethodPost, notesURL, map[string]any{"lesson": id, "content_blocks": map[string]any{"blocks": []any{"Plants make food from light."}}})
	if code != http.StatusCreated {
		t.Fatalf("add note: %d %v", code, note)
	}
	if code, _ := c.w.Call(c.teacher, http.MethodPost, notesURL, map[string]any{"lesson": id, "content_blocks": "just text"}); code != http.StatusBadRequest {
		t.Errorf("notes must be a JSON object or list: %d", code)
	}
	if code, _ := c.w.Call(c.student, http.MethodPost, notesURL, map[string]any{"lesson": id, "content_blocks": map[string]any{}}); code != http.StatusForbidden {
		t.Errorf("a student adding notes: %d", code)
	}
	if _, page := c.w.Call(c.student, http.MethodGet, notesURL+"?lesson="+itoa(id), nil); !testkit.Contains(testkit.IDs(page), testkit.ID(note)) {
		t.Errorf("the student reads the lesson's notes: %v", page)
	}
	if code, _ := c.w.Call(c.outsider, http.MethodGet, notesURL+"?lesson="+itoa(id), nil); code != http.StatusNotFound {
		t.Errorf("another school reading notes: want 404, got %d", code)
	}

	if code, _ := c.w.Call(c.teacher, http.MethodPost, recordingsURL, map[string]any{"lesson": id, "url": "javascript:alert(1)", "duration": 60}); code != http.StatusBadRequest {
		t.Errorf("unsafe recording link: %d", code)
	}
	if code, body := c.w.Call(c.teacher, http.MethodPost, recordingsURL, map[string]any{"lesson": id, "url": "https://video.example/1", "duration": 1800}); code != http.StatusCreated {
		t.Errorf("add recording: %d %v", code, body)
	}
}

func TestLessonAttendance(t *testing.T) {
	c := newClassroom(t)
	id := c.lesson(t, "published")
	stranger := c.w.Person("student", "student", c.school)

	code, first := c.w.Call(c.teacher, http.MethodPost, attendanceURL, map[string]any{"lesson": id, "student": c.student, "status": "late", "duration_minutes": 30})
	if code != http.StatusCreated {
		t.Fatalf("record attendance: %d %v", code, first)
	}
	code, again := c.w.Call(c.teacher, http.MethodPost, attendanceURL, map[string]any{"lesson": id, "student": c.student, "status": "present", "duration_minutes": 40})
	if code != http.StatusOK || testkit.ID(again) != testkit.ID(first) || again["status"] != "present" {
		t.Errorf("recording again updates the same row: %d %v", code, again)
	}
	if code, _ := c.w.Call(c.teacher, http.MethodPost, attendanceURL, map[string]any{"lesson": id, "student": stranger, "status": "present"}); code != http.StatusBadRequest {
		t.Errorf("a student not in the class: want 400, got %d", code)
	}
	if code, _ := c.w.Call(c.student, http.MethodPost, attendanceURL, map[string]any{"lesson": id, "student": c.student, "status": "present"}); code != http.StatusForbidden {
		t.Errorf("students can't mark themselves present: %d", code)
	}
	c.w.Call(c.teacher, http.MethodPost, attendanceURL, map[string]any{"lesson": id, "student": c.classmate, "status": "absent"})

	_, staff := c.w.Call(c.teacher, http.MethodGet, attendanceURL+"?lesson="+itoa(id), nil)
	_, own := c.w.Call(c.student, http.MethodGet, attendanceURL+"?lesson="+itoa(id), nil)
	_, child := c.w.Call(c.parent, http.MethodGet, attendanceURL+"?lesson="+itoa(id), nil)
	if len(testkit.IDs(staff)) != 2 || len(testkit.IDs(own)) != 1 || len(testkit.IDs(child)) != 1 {
		t.Errorf("staff see everyone, learners only themselves: staff=%v own=%v child=%v", staff, own, child)
	}

	if code, _ := c.w.Call(c.teacher, http.MethodDelete, lessonsURL+itoa(id)+"/", nil); code != http.StatusConflict {
		t.Errorf("a lesson with attendance is kept: want 409, got %d", code)
	}
	empty := c.lesson(t, "draft")
	c.w.Call(c.teacher, http.MethodPost, notesURL, map[string]any{"lesson": empty, "content_blocks": map[string]any{}})
	if code, _ := c.w.Call(c.teacher, http.MethodDelete, lessonsURL+itoa(empty)+"/", nil); code != http.StatusNoContent {
		t.Errorf("an unused lesson can be deleted with its notes: %d", code)
	}
}
