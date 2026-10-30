package livesessions

import (
	"net/http"
	"strconv"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/testkit"
)

const (
	sessionsURL  = "/api/v1/live-sessions/live-session/"
	remindersURL = "/api/v1/live-sessions/session-reminder/"
	recoveryURL  = "/api/v1/live-sessions/missed-recovery/"
	meet         = "https://meet.google.com/abc-defg-hij"
)

func itoa(id int64) string { return strconv.FormatInt(id, 10) }

type world struct {
	w                                              *testkit.World
	school, teacher, colleague, student, classmate int64
	parent, outsider, class, lesson, draftLesson   int64
}

func newWorld(t *testing.T) world {
	tw := testkit.New(t)
	r := chi.NewRouter()
	NewHandler(NewPostgresStore(tw.Pool), tw.Auth.RequireUser).Mount(r)
	tw.Router = r
	w := world{w: tw, school: tw.School("Live School")}
	w.teacher = tw.Person("teacher", "subject_teacher", w.school)
	w.colleague = tw.Person("teacher", "subject_teacher", w.school)
	w.student = tw.Person("student", "student", w.school)
	w.classmate = tw.Person("student", "student", w.school)
	w.parent = tw.Person("parent", "", 0)
	w.outsider = tw.Person("teacher", "subject_teacher", tw.School("Other School"))
	w.class = tw.Class(w.school, w.teacher)
	tw.Enrol(w.class, w.student)
	tw.Enrol(w.class, w.classmate)
	tw.LinkParent(w.parent, w.student, "approved")
	w.lesson = w.addLesson(t, "published")
	w.draftLesson = w.addLesson(t, "draft")
	return w
}

func (w world) addLesson(t *testing.T, mode string) int64 {
	t.Helper()
	var id int64
	err := w.w.Pool.QueryRow(t.Context(), `INSERT INTO lessons_lesson (title, access_mode, scheduled_at, created_at, parent_class_id)
		VALUES ('Cells', $1, now() + interval '2 days', now(), $2) RETURNING id`, mode, w.class).Scan(&id)
	if err != nil {
		t.Fatalf("add lesson: %v", err)
	}
	return id
}

func (w world) session(t *testing.T, lesson int64) int64 {
	t.Helper()
	code, body := w.w.Call(w.teacher, http.MethodPost, sessionsURL, map[string]any{"lesson": lesson, "meeting_link": meet})
	if code != http.StatusCreated {
		t.Fatalf("create session: %d %v", code, body)
	}
	return testkit.ID(body)
}

func TestWhoSeesAndRunsLiveSessions(t *testing.T) {
	w := newWorld(t)
	id := w.session(t, w.lesson)
	hidden := w.session(t, w.draftLesson)

	for name, user := range map[string]int64{"teacher": w.teacher, "student": w.student, "parent": w.parent} {
		_, page := w.w.Call(user, http.MethodGet, sessionsURL, nil)
		if !testkit.Contains(testkit.IDs(page), id) {
			t.Errorf("%s should see the session: %v", name, page)
		}
	}
	if _, page := w.w.Call(w.student, http.MethodGet, sessionsURL, nil); testkit.Contains(testkit.IDs(page), hidden) {
		t.Errorf("a draft lesson's session stays with staff")
	}
	if code, _ := w.w.Call(w.outsider, http.MethodGet, sessionsURL+itoa(id)+"/", nil); code != http.StatusNotFound {
		t.Errorf("another school: want 404, got %d", code)
	}
	_, one := w.w.Call(w.student, http.MethodGet, sessionsURL+itoa(id)+"/", nil)
	if one["title"] != "Cells" || one["hostName"] == "" || one["scheduledStart"] == nil {
		t.Errorf("session shape: %v", one)
	}

	refused := []struct {
		name string
		user int64
		body map[string]any
		want int
	}{
		{"a second session for the lesson", w.teacher, map[string]any{"lesson": w.lesson, "meeting_link": meet}, http.StatusBadRequest},
		{"a link that isn't Google Meet", w.teacher, map[string]any{"lesson": w.addLesson(t, "published"), "meeting_link": "https://evil.example/meet"}, http.StatusBadRequest},
		{"a zoom link sent as Meet", w.teacher, map[string]any{"lesson": w.addLesson(t, "published"), "meeting_link": "https://us02web.zoom.us/j/1"}, http.StatusBadRequest},
		{"a student", w.student, map[string]any{"lesson": w.addLesson(t, "published"), "meeting_link": meet}, http.StatusForbidden},
		// Colleagues can't see another teacher's lessons, so the lesson "doesn't exist" for them.
		{"a colleague", w.colleague, map[string]any{"lesson": w.addLesson(t, "published"), "meeting_link": meet}, http.StatusBadRequest},
	}
	for _, r := range refused {
		if code, body := w.w.Call(r.user, http.MethodPost, sessionsURL, r.body); code != r.want {
			t.Errorf("%s: want %d, got %d %v", r.name, r.want, code, body)
		}
	}
	if code, _ := w.w.Call(w.teacher, http.MethodPost, sessionsURL, map[string]any{"lesson": w.addLesson(t, "published"), "meeting_link": "https://us02web.zoom.us/j/123", "provider": "zoom"}); code != http.StatusCreated {
		t.Errorf("a zoom link with the zoom provider is fine: %d", code)
	}

	code, done := w.w.Call(w.teacher, http.MethodPatch, sessionsURL+itoa(id)+"/", map[string]any{"status": "completed"})
	if code != http.StatusOK || done["artifact_sync_status"] != "pending" {
		t.Errorf("completing without a replay queues the recording sync: %d %v", code, done)
	}
	if code, _ := w.w.Call(w.student, http.MethodPatch, sessionsURL+itoa(id)+"/", map[string]any{"status": "cancelled"}); code != http.StatusForbidden {
		t.Errorf("a student changing a session: want 403, got %d", code)
	}
	if code, _ := w.w.Call(w.teacher, http.MethodPost, sessionsURL+"provision-webinar/", map[string]any{"title": "x"}); code != http.StatusServiceUnavailable {
		t.Errorf("automatic meeting links aren't set up yet: want 503, got %d", code)
	}
}

func TestRemindersAreForStaff(t *testing.T) {
	w := newWorld(t)
	id := w.session(t, w.lesson)
	soon := time.Now().Add(time.Hour).Format(time.RFC3339)

	if code, _ := w.w.Call(w.student, http.MethodPost, remindersURL, map[string]any{"session": id, "send_at": soon}); code != http.StatusForbidden {
		t.Errorf("a student adding a reminder: want 403, got %d", code)
	}
	if code, _ := w.w.Call(w.teacher, http.MethodPost, remindersURL, map[string]any{"session": id, "send_at": "2020-01-01T00:00:00Z"}); code != http.StatusBadRequest {
		t.Errorf("a reminder in the past: want 400, got %d", code)
	}
	code, rem := w.w.Call(w.teacher, http.MethodPost, remindersURL, map[string]any{"session": id, "send_at": soon})
	if code != http.StatusCreated {
		t.Fatalf("add reminder: %d %v", code, rem)
	}
	if _, page := w.w.Call(w.teacher, http.MethodGet, remindersURL+"?session="+itoa(id), nil); !testkit.Contains(testkit.IDs(page), testkit.ID(rem)) {
		t.Errorf("teacher lists reminders: %v", page)
	}
	if code, _ := w.w.Call(w.teacher, http.MethodDelete, remindersURL+itoa(testkit.ID(rem))+"/", nil); code != http.StatusNoContent {
		t.Errorf("remove reminder: %d", code)
	}
}

func TestMissedSessionRecovery(t *testing.T) {
	w := newWorld(t)
	id := w.session(t, w.lesson)

	code, rec := w.w.Call(w.teacher, http.MethodPost, recoveryURL, map[string]any{"session": id, "student": w.student, "summary": "Watch the replay and answer 3 questions."})
	if code != http.StatusCreated {
		t.Fatalf("open recovery: %d %v", code, rec)
	}
	path := recoveryURL + itoa(testkit.ID(rec)) + "/"
	if code, _ := w.w.Call(w.teacher, http.MethodPost, recoveryURL, map[string]any{"session": id, "student": w.student}); code != http.StatusBadRequest {
		t.Errorf("a second recovery for the same student: want 400, got %d", code)
	}

	_, staff := w.w.Call(w.teacher, http.MethodGet, recoveryURL+"?session="+itoa(id), nil)
	_, own := w.w.Call(w.student, http.MethodGet, recoveryURL+"?session="+itoa(id), nil)
	_, other := w.w.Call(w.classmate, http.MethodGet, recoveryURL+"?session="+itoa(id), nil)
	if len(testkit.IDs(staff)) != 1 || len(testkit.IDs(own)) != 1 || len(testkit.IDs(other)) != 0 {
		t.Errorf("only staff and the student see a recovery: staff=%v own=%v other=%v", staff, own, other)
	}

	if code, _ := w.w.Call(w.student, http.MethodPatch, path, map[string]any{"recovery_status": "verified"}); code != http.StatusForbidden {
		t.Errorf("a student verifying their own recovery: want 403, got %d", code)
	}
	if code, _ := w.w.Call(w.parent, http.MethodPatch, path, map[string]any{"recovery_status": "submitted"}); code != http.StatusForbidden {
		t.Errorf("a parent submitting for the student: want 403, got %d", code)
	}
	code, sub := w.w.Call(w.student, http.MethodPatch, path, map[string]any{"summary": "I learned how cells divide.", "recovery_status": "submitted"})
	if code != http.StatusOK || sub["submitted_at"] == nil {
		t.Errorf("student submits: %d %v", code, sub)
	}
	if code, ver := w.w.Call(w.teacher, http.MethodPatch, path, map[string]any{"recovery_status": "verified"}); code != http.StatusOK || ver["recovery_status"] != "verified" {
		t.Errorf("teacher verifies: %d %v", code, ver)
	}
}
