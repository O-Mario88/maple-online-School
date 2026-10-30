package reports

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/testkit"
)

const (
	marksURL    = "/api/v1/grading/subjects/"
	reportsURL  = "/api/v1/grading/reports/"
	generateURL = "/api/v1/grading/reports/generate/"
)

type termSetup struct {
	school, term, head, teacher, student, classmate, parent, class int64
}

func newWorld(t *testing.T) (*testkit.World, termSetup) {
	w := testkit.New(t)
	r := chi.NewRouter()
	NewHandler(NewPostgresStore(w.Pool), w.Ids, w.Auth.RequireUser).Mount(r)
	w.Router = r

	s := termSetup{school: w.School("Report School")}
	s.term = w.Term(s.school)
	s.head = w.Person("institution", "headteacher", s.school)
	s.teacher = w.Person("teacher", "class_teacher", s.school)
	s.student = w.Person("student", "student", s.school)
	s.classmate = w.Person("student", "student", s.school)
	s.parent = w.Person("parent", "parent", s.school)
	w.LinkParent(s.parent, s.student, "approved")
	s.class = w.Class(s.school, s.teacher)
	w.Enrol(s.class, s.student)
	w.Enrol(s.class, s.classmate)
	return w, s
}

func enterMarks(w *testkit.World, who int64, s termSetup, entries ...map[string]any) (int, map[string]any) {
	return w.Call(who, http.MethodPost, marksURL, map[string]any{"class": s.class, "term": s.term, "entries": entries})
}

func TestTermReportFromMarksToParents(t *testing.T) {
	w, s := newWorld(t)

	code, body := enterMarks(w, s.teacher, s,
		map[string]any{"student": s.student, "formative_score": "17", "summative_score": "68", "teacher_remarks": "Steady work"},
		map[string]any{"student": s.classmate, "formative_score": "9", "summative_score": "40"},
	)
	if code != http.StatusOK || body["saved"] != float64(2) {
		t.Fatalf("enter marks: %d %v", code, body)
	}

	_, page := w.Call(s.teacher, http.MethodGet, fmt.Sprintf("%s?class=%d", marksURL, s.class), nil)
	results, _ := page["results"].([]any)
	if len(results) != 2 {
		t.Fatalf("teacher should see 2 subject marks, got %v", page)
	}
	first := results[0].(map[string]any)
	if first["grade_letter"] == nil || first["total_score"] == nil {
		t.Fatalf("totals and grades should be worked out, got %v", first)
	}

	// Nothing is visible to the family before the report is published.
	if _, mine := w.Call(s.student, http.MethodGet, marksURL, nil); mine["count"] != float64(0) {
		t.Fatalf("student must not see marks before publication, got %v", mine)
	}

	code, gen := w.Call(s.teacher, http.MethodPost, generateURL, map[string]any{"class": s.class, "term": s.term})
	if code != http.StatusOK || gen["generated"] != float64(2) {
		t.Fatalf("generate: %d %v", code, gen)
	}
	_, drafts := w.Call(s.head, http.MethodGet, reportsURL, nil)
	var report int64
	for _, r := range drafts["results"].([]any) {
		row := r.(map[string]any)
		if row["student"] == float64(s.student) {
			report = int64(row["id"].(float64))
			if row["overall_score"] != "85.00" || row["overall_grade_letter"] != "A" {
				t.Fatalf("overall should be 85 (A), got %v", row)
			}
		}
	}
	if _, fam := w.Call(s.parent, http.MethodGet, reportsURL, nil); fam["count"] != float64(0) {
		t.Fatalf("parent must not see a draft report, got %v", fam)
	}

	// A teacher can add remarks but not publish.
	if code, _ := w.Call(s.teacher, http.MethodPatch, fmt.Sprintf("%s%d/", reportsURL, report), map[string]any{"class_teacher_remarks": "A good term."}); code != http.StatusOK {
		t.Fatalf("teacher remarks: %d", code)
	}
	if code, _ := w.Call(s.teacher, http.MethodPatch, fmt.Sprintf("%s%d/", reportsURL, report), map[string]any{"is_published": true}); code != http.StatusForbidden {
		t.Fatalf("teacher publishing: want 403, got %d", code)
	}
	if code, body := w.Call(s.head, http.MethodPatch, fmt.Sprintf("%s%d/", reportsURL, report), map[string]any{"headteacher_remarks": "Well done.", "is_published": true}); code != http.StatusOK || body["published_at"] == nil {
		t.Fatalf("head publishing: %d %v", code, body)
	}

	// Now the family sees the report, with its subjects, and only theirs.
	code, card := w.Call(s.parent, http.MethodGet, fmt.Sprintf("%s%d/", reportsURL, report), nil)
	subjects, _ := card["subjects"].([]any)
	if code != http.StatusOK || card["class_teacher_remarks"] != "A good term." || len(subjects) != 1 {
		t.Fatalf("parent report: %d %v", code, card)
	}
	if _, mine := w.Call(s.student, http.MethodGet, reportsURL, nil); mine["count"] != float64(1) {
		t.Fatalf("student should see their published report, got %v", mine)
	}
	if _, theirs := w.Call(s.classmate, http.MethodGet, reportsURL, nil); theirs["count"] != float64(0) {
		t.Fatalf("classmate's report is unpublished, got %v", theirs)
	}

	// Published marks are locked.
	if code, body := enterMarks(w, s.teacher, s, map[string]any{"student": s.student, "formative_score": "20", "summative_score": "80"}); code != http.StatusConflict {
		t.Fatalf("changing marks after publication: want 409, got %d %v", code, body)
	}
}

func TestMarkRules(t *testing.T) {
	w, s := newWorld(t)
	stranger := w.Person("student", "student", s.school)
	outsider := w.Person("teacher", "class_teacher", w.School("Elsewhere"))

	cases := []struct {
		name  string
		who   int64
		entry map[string]any
		want  int
	}{
		{"formative above 20", s.teacher, map[string]any{"student": s.student, "formative_score": "21", "summative_score": "50"}, http.StatusBadRequest},
		{"summative above 80", s.teacher, map[string]any{"student": s.student, "formative_score": "10", "summative_score": "81"}, http.StatusBadRequest},
		{"student not in class", s.teacher, map[string]any{"student": stranger, "formative_score": "10", "summative_score": "50"}, http.StatusBadRequest},
		{"another school's teacher", outsider, map[string]any{"student": s.student, "formative_score": "10", "summative_score": "50"}, http.StatusNotFound},
		{"a student", s.student, map[string]any{"student": s.student, "formative_score": "20", "summative_score": "80"}, http.StatusNotFound},
		{"school leader", s.head, map[string]any{"student": s.student, "formative_score": "10", "summative_score": "50"}, http.StatusOK},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if code, body := enterMarks(w, tc.who, s, tc.entry); code != tc.want {
				t.Fatalf("want %d, got %d %v", tc.want, code, body)
			}
		})
	}
}
