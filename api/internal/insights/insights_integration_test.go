package insights

import (
	"context"
	"net/http"
	"strconv"
	"testing"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/testkit"
)

type classroom struct {
	w                                    *testkit.World
	school, class, term                  int64
	teacher, head, otherTeacher, student int64
	strong, parent                       int64
}

func newClassroom(t *testing.T) classroom {
	w := testkit.New(t)
	r := chi.NewRouter()
	NewHandler(NewPostgresStore(w.Pool), w.Auth.RequireUser).Mount(r)
	w.Router = r
	c := classroom{w: w, school: w.School("Insight School")}
	c.teacher = w.Person("teacher", "class_teacher", c.school)
	c.head = w.Person("teacher", "headteacher", c.school)
	c.otherTeacher = w.Person("teacher", "subject_teacher", c.school)
	c.student = w.Person("student", "student", c.school)
	c.strong = w.Person("student", "student", c.school)
	c.parent = w.Person("parent", "", 0)
	w.LinkParent(c.parent, c.student, "approved")
	c.class = w.Class(c.school, c.teacher)
	c.term = w.Term(c.school)
	w.Enrol(c.class, c.student)
	w.Enrol(c.class, c.strong)

	ctx := context.Background()
	mark := func(student int64, daysAgo int, status string) {
		_, err := w.Pool.Exec(ctx, `INSERT INTO attendance_dailyregister (institution_id, term_id, student_id, record_date, status, recorded_by_id, created_at)
			VALUES ($1, $2, $3, current_date - $4::int, $5, $6, now())`, c.school, c.term, student, daysAgo, status, c.teacher)
		if err != nil {
			t.Fatal(err)
		}
	}
	for day := 1; day <= 4; day++ {
		mark(c.strong, day, "present")
		status := "unauthorized_absent"
		if day == 1 {
			status = "present"
		}
		mark(c.student, day, status)
	}
	// One published assignment: the strong learner handed it in and scored 18/20.
	var assessment, submission int64
	if err := w.Pool.QueryRow(ctx, `INSERT INTO assessments_assessment (title, instructions, type, source, max_score, is_published, created_by_id, created_at)
		VALUES ('Fractions', '', 'homework', 'teacher', 20, true, $1, now()) RETURNING id`, c.teacher).Scan(&assessment); err != nil {
		t.Fatal(err)
	}
	if err := w.Pool.QueryRow(ctx, `INSERT INTO assessments_submission (assessment_id, student_id, status, submitted_at, answers_data)
		VALUES ($1, $2, 'graded', now(), '{}') RETURNING id`, assessment, c.strong).Scan(&submission); err != nil {
		t.Fatal(err)
	}
	if _, err := w.Pool.Exec(ctx, `INSERT INTO grading_graderecord (submission_id, score, graded_at) VALUES ($1, 18, now())`, submission); err != nil {
		t.Fatal(err)
	}
	return c
}

func (c classroom) learnersURL() string {
	return "/api/v1/insights/classes/" + strconv.FormatInt(c.class, 10) + "/learners/"
}

func TestTeachersSeeWhoNeedsThemMostUrgentFirst(t *testing.T) {
	c := newClassroom(t)

	code, body := c.w.Call(c.teacher, http.MethodGet, c.learnersURL(), nil)
	if code != http.StatusOK {
		t.Fatalf("class teacher: %d %v", code, body)
	}
	learners := body["learners"].([]any)
	if len(learners) != 2 {
		t.Fatalf("two learners, got %v", learners)
	}
	first := learners[0].(map[string]any)
	if first["student"].(map[string]any)["id"] != float64(c.student) || first["level"] != LevelHigh {
		t.Errorf("the absent learner who hasn't handed in comes first, as high: %v", first)
	}
	if reasons := first["reasons"].([]any); len(reasons) != 2 {
		t.Errorf("attendance and missing work: %v", reasons)
	}
	second := learners[1].(map[string]any)
	if second["level"] != LevelOK || second["average_pct"] != float64(90) {
		t.Errorf("the strong learner is fine at 90%%: %v", second)
	}

	if code, _ := c.w.Call(c.head, http.MethodGet, c.learnersURL(), nil); code != http.StatusOK {
		t.Errorf("the head sees every class: %d", code)
	}
	for name, user := range map[string]int64{"another teacher": c.otherTeacher, "a learner": c.student, "a parent": c.parent} {
		if code, _ := c.w.Call(user, http.MethodGet, c.learnersURL(), nil); code != http.StatusNotFound {
			t.Errorf("%s: want 404, got %d", name, code)
		}
	}
}

func TestInterventionsReachTheFamilyAndAreRecorded(t *testing.T) {
	c := newClassroom(t)
	act := func(user int64, body map[string]any) (int, map[string]any) {
		return c.w.Call(user, http.MethodPost, "/api/v1/insights/interventions/", body)
	}

	if code, res := act(c.teacher, map[string]any{"class": c.class, "student": c.student, "kind": "parent_message", "note": ""}); code != http.StatusBadRequest {
		t.Errorf("a message needs words: %d %v", code, res)
	}
	code, res := act(c.teacher, map[string]any{"class": c.class, "student": c.student, "kind": "parent_message",
		"note": "Brian has missed three days this week. Is everything all right?"})
	if code != http.StatusCreated || res["kind"] != "parent_message" {
		t.Fatalf("send: %d %v", code, res)
	}
	if n := c.w.Notes(c.parent, "teacher_message"); n != 1 {
		t.Errorf("the parent gets the message: %d", n)
	}
	if n := c.w.Notes(c.student, "teacher_message"); n != 0 {
		t.Errorf("a message to parents doesn't go to the learner: %d", n)
	}
	if code, _ := act(c.teacher, map[string]any{"class": c.class, "student": c.student, "kind": "meeting", "note": "Called home"}); code != http.StatusCreated {
		t.Errorf("record a meeting: %d", code)
	}

	refused := map[string]struct {
		user int64
		body map[string]any
		want int
	}{
		"another teacher":      {c.otherTeacher, map[string]any{"class": c.class, "student": c.student, "kind": "note", "note": "x"}, http.StatusNotFound},
		"learner not in class": {c.teacher, map[string]any{"class": c.class, "student": c.parent, "kind": "note", "note": "x"}, http.StatusBadRequest},
		"unknown kind":         {c.teacher, map[string]any{"class": c.class, "student": c.student, "kind": "detention", "note": "x"}, http.StatusBadRequest},
	}
	for name, r := range refused {
		if code, res := act(r.user, r.body); code != r.want {
			t.Errorf("%s: want %d, got %d %v", name, r.want, code, res)
		}
	}

	_, page := c.w.Call(c.head, http.MethodGet, "/api/v1/insights/interventions/?student="+strconv.FormatInt(c.student, 10), nil)
	if len(testkit.IDs(page)) != 2 {
		t.Errorf("the head sees both interventions: %v", page)
	}
	if _, page := c.w.Call(c.otherTeacher, http.MethodGet, "/api/v1/insights/interventions/?student="+strconv.FormatInt(c.student, 10), nil); len(testkit.IDs(page)) != 0 {
		t.Errorf("a teacher who doesn't teach the learner sees none: %v", page)
	}
	_, learners := c.w.Call(c.teacher, http.MethodGet, c.learnersURL(), nil)
	if first := learners["learners"].([]any)[0].(map[string]any); first["last_intervention_at"] == nil {
		t.Errorf("the class view shows when someone last acted: %v", first)
	}
}

// A teacher who no longer works at the school can't see their old class.
func TestSuspendedTeachersLoseTheClassView(t *testing.T) {
	c := newClassroom(t)
	if _, err := c.w.Pool.Exec(context.Background(), `UPDATE institutions_institutionmembership SET status = 'suspended' WHERE user_id = $1`, c.teacher); err != nil {
		t.Fatal(err)
	}
	if code, _ := c.w.Call(c.teacher, http.MethodGet, c.learnersURL(), nil); code != http.StatusNotFound {
		t.Errorf("suspended teacher: want 404, got %d", code)
	}
}
