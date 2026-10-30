package messages

import (
	"net/http"
	"strconv"
	"testing"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/testkit"
)

const threadsURL = "/api/v1/messages/threads/"

type school struct {
	w                                           *testkit.World
	id                                          int64
	teacher, otherTeacher, head, student, other int64
	parent, pendingParent, outsiderParent       int64
}

func newSchool(t *testing.T) school {
	w := testkit.New(t)
	r := chi.NewRouter()
	NewHandler(NewPostgresStore(w.Pool), w.Auth.RequireUser).Mount(r)
	w.Router = r
	s := school{w: w, id: w.School("Messages School")}
	s.teacher = w.Person("teacher", "class_teacher", s.id)
	s.otherTeacher = w.Person("teacher", "subject_teacher", s.id)
	s.head = w.Person("teacher", "headteacher", s.id)
	s.student = w.Person("student", "student", s.id)
	s.other = w.Person("student", "student", s.id)
	s.parent = w.Person("parent", "", 0)
	s.pendingParent = w.Person("parent", "", 0)
	s.outsiderParent = w.Person("parent", "", 0)
	w.LinkParent(s.parent, s.student, "approved")
	w.LinkParent(s.pendingParent, s.student, "pending")
	w.LinkParent(s.outsiderParent, s.other, "approved")
	class := w.Class(s.id, s.teacher)
	w.Enrol(class, s.student)
	return s
}

func (s school) thread(id int64) string { return threadsURL + strconv.FormatInt(id, 10) + "/" }

func TestTeacherAndFamilyTalkAboutALearner(t *testing.T) {
	s := newSchool(t)

	code, th := s.w.Call(s.teacher, http.MethodPost, threadsURL, map[string]any{
		"student": s.student, "subject": "Missed days", "body": "Brian has missed three days. Is all well?",
	})
	if code != http.StatusCreated {
		t.Fatalf("teacher starts: %d %v", code, th)
	}
	id := testkit.ID(th)
	if n := s.w.Notes(s.parent, "message"); n != 1 {
		t.Errorf("the confirmed parent is told: %d", n)
	}
	if n := s.w.Notes(s.pendingParent, "message"); n != 0 {
		t.Errorf("an unconfirmed parent is not: %d", n)
	}

	_, list := s.w.Call(s.parent, http.MethodGet, threadsURL, nil)
	if ids := testkit.IDs(list); len(ids) != 1 || ids[0] != id {
		t.Fatalf("the parent sees the conversation: %v", list)
	}
	if code, res := s.w.Call(s.parent, http.MethodPost, s.thread(id)+"messages/", map[string]any{"body": "Sorry, he was ill. Back Monday."}); code != http.StatusCreated {
		t.Fatalf("parent replies: %d %v", code, res)
	}
	if n := s.w.Notes(s.teacher, "message"); n != 1 {
		t.Errorf("the teacher is told about the reply: %d", n)
	}

	_, full := s.w.Call(s.teacher, http.MethodGet, s.thread(id), nil)
	msgs := full["messages"].([]any)
	if len(msgs) != 2 || msgs[1].(map[string]any)["body"] != "Sorry, he was ill. Back Monday." {
		t.Errorf("both messages, oldest first: %v", msgs)
	}
	if full["can_reply"] != true {
		t.Errorf("the teacher can reply: %v", full["can_reply"])
	}

	// The head can read for safeguarding but not write.
	code, asHead := s.w.Call(s.head, http.MethodGet, s.thread(id), nil)
	if code != http.StatusOK || asHead["can_reply"] != false {
		t.Errorf("head reads, can't reply: %d %v", code, asHead["can_reply"])
	}
	if code, _ := s.w.Call(s.head, http.MethodPost, s.thread(id)+"messages/", map[string]any{"body": "hi"}); code != http.StatusForbidden {
		t.Errorf("head posting: want 403, got %d", code)
	}
	for name, user := range map[string]int64{"another teacher": s.otherTeacher, "unconfirmed parent": s.pendingParent, "another family": s.outsiderParent, "the learner": s.student} {
		if code, _ := s.w.Call(user, http.MethodGet, s.thread(id), nil); code != http.StatusNotFound {
			t.Errorf("%s: want 404, got %d", name, code)
		}
	}
	if code, _ := s.w.Call(s.parent, http.MethodPost, s.thread(id)+"messages/", map[string]any{"body": "   "}); code != http.StatusBadRequest {
		t.Errorf("empty message: %d", code)
	}
}

func TestWhoCanStartAConversation(t *testing.T) {
	s := newSchool(t)
	start := func(user int64, body map[string]any) int {
		code, _ := s.w.Call(user, http.MethodPost, threadsURL, body)
		return code
	}
	cases := []struct {
		name string
		user int64
		body map[string]any
		want int
	}{
		{"parent to their child's teacher", s.parent, map[string]any{"student": s.student, "staff": s.teacher, "subject": "Homework", "body": "Question"}, http.StatusCreated},
		{"parent to the head", s.parent, map[string]any{"student": s.student, "staff": s.head, "subject": "Fees", "body": "Question"}, http.StatusCreated},
		{"parent to a teacher who doesn't teach their child", s.parent, map[string]any{"student": s.student, "staff": s.otherTeacher, "subject": "x", "body": "y"}, http.StatusBadRequest},
		{"parent without naming staff", s.parent, map[string]any{"student": s.student, "subject": "x", "body": "y"}, http.StatusBadRequest},
		{"unconfirmed parent", s.pendingParent, map[string]any{"student": s.student, "staff": s.teacher, "subject": "x", "body": "y"}, http.StatusNotFound},
		{"teacher who doesn't teach the learner", s.otherTeacher, map[string]any{"student": s.student, "subject": "x", "body": "y"}, http.StatusNotFound},
		{"the head about any learner at the school", s.head, map[string]any{"student": s.other, "subject": "Welcome", "body": "Hello"}, http.StatusCreated},
		{"no subject", s.teacher, map[string]any{"student": s.student, "subject": " ", "body": "y"}, http.StatusBadRequest},
	}
	for _, c := range cases {
		if got := start(c.user, c.body); got != c.want {
			t.Errorf("%s: want %d, got %d", c.name, c.want, got)
		}
	}
}

func TestParentsSeeWhoTheyCanWriteTo(t *testing.T) {
	s := newSchool(t)
	url := "/api/v1/messages/contacts/?student=" + strconv.FormatInt(s.student, 10)
	code, body := s.w.Call(s.parent, http.MethodGet, url, nil)
	if code != http.StatusOK {
		t.Fatalf("contacts: %d %v", code, body)
	}
	var ids []int64
	for _, c := range body["results"].([]any) {
		ids = append(ids, int64(c.(map[string]any)["id"].(float64)))
	}
	if len(ids) != 2 || !testkit.Contains(ids, s.teacher) || !testkit.Contains(ids, s.head) || testkit.Contains(ids, s.otherTeacher) {
		t.Errorf("the class teacher and the head, not other staff: %v", ids)
	}
	if code, _ := s.w.Call(s.pendingParent, http.MethodGet, url, nil); code != http.StatusNotFound {
		t.Errorf("unconfirmed parent: want 404, got %d", code)
	}
}
