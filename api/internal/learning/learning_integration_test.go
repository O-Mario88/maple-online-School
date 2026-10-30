package learning

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strconv"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/O-Mario88/maple-online-School/api/internal/identity"
	"github.com/O-Mario88/maple-online-School/api/internal/platform/postgres"
)

// These tests need a Postgres database migrated by Django. They create their
// own schools and people and delete them afterwards.

type world struct {
	t       *testing.T
	pool    *pgxpool.Pool
	router  http.Handler
	tokens  *identity.TokenIssuer
	created struct{ users, schools []int64 }
}

func newWorld(t *testing.T) *world {
	t.Helper()
	url := os.Getenv("MAPLE_TEST_DATABASE_URL")
	if url == "" {
		t.Skip("MAPLE_TEST_DATABASE_URL not set")
	}
	ctx := context.Background()
	pool, err := postgres.Open(ctx, url)
	if err != nil {
		t.Fatal(err)
	}
	if err := postgres.Migrate(ctx, pool); err != nil {
		t.Fatal(err)
	}
	ids := identity.NewPostgresStore(pool)
	tokens := &identity.TokenIssuer{SigningKey: []byte("test-key-test-key-test-key-test-key"), AccessTTL: time.Hour, RefreshTTL: time.Hour}
	auth := identity.NewHandler(ids, ids, ids, tokens, false)

	r := chi.NewRouter()
	NewHandler(NewPostgresStore(pool), ids, auth.RequireUser).Mount(r)

	w := &world{t: t, pool: pool, router: r, tokens: tokens}
	t.Cleanup(w.cleanup)
	return w
}

func suffix() string {
	b := make([]byte, 4)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func (w *world) school(name string) int64 {
	w.t.Helper()
	var id int64
	err := w.pool.QueryRow(context.Background(), `
		INSERT INTO institutions_institution (name, primary_color, secondary_color, country_code, curriculum_track,
		  subscription_plan, is_active, created_at, grade_offerings, school_level, in_grace_period)
		VALUES ($1, '#000000', '#ffffff', 'UG', 'uganda', 'trial', true, now(), '[]', 'secondary', false)
		RETURNING id`, name+" "+suffix()).Scan(&id)
	if err != nil {
		w.t.Fatal(err)
	}
	w.created.schools = append(w.created.schools, id)
	return id
}

// person creates a user with a platform role and an active membership in school.
func (w *world) person(role, schoolRole string, school int64) int64 {
	w.t.Helper()
	ctx := context.Background()
	var id int64
	err := w.pool.QueryRow(ctx, `
		INSERT INTO accounts_user (password, is_superuser, email, full_name, country_code, role,
		  whatsapp_opt_in, is_active, is_staff, date_joined, email_verified)
		VALUES ('!', false, $1, $2, 'UG', $3, false, true, false, now(), true)
		RETURNING id`, role+"."+suffix()+"@learning.test", "Test "+role, role).Scan(&id)
	if err != nil {
		w.t.Fatal(err)
	}
	w.created.users = append(w.created.users, id)
	if school != 0 {
		_, err = w.pool.Exec(ctx, `
			INSERT INTO institutions_institutionmembership (role, status, joined_at, institution_id, user_id)
			VALUES ($1, 'active', now(), $2, $3)`, schoolRole, school, id)
		if err != nil {
			w.t.Fatal(err)
		}
	}
	return id
}

// linkParent creates profiles and a guardian link with the given consent status.
func (w *world) linkParent(parent, student int64, consent string) {
	w.t.Helper()
	ctx := context.Background()
	var pp, sp int64
	err := w.pool.QueryRow(ctx, `SELECT id FROM accounts_parentprofile WHERE user_id = $1`, parent).Scan(&pp)
	if err != nil {
		if err := w.pool.QueryRow(ctx, `INSERT INTO accounts_parentprofile (user_id) VALUES ($1) RETURNING id`, parent).Scan(&pp); err != nil {
			w.t.Fatal(err)
		}
	}
	if err := w.pool.QueryRow(ctx, `INSERT INTO accounts_studentprofile (user_id, onboarding_status) VALUES ($1, 'active') RETURNING id`, student).Scan(&sp); err != nil {
		w.t.Fatal(err)
	}
	if _, err := w.pool.Exec(ctx, `
		INSERT INTO parent_portal_parentstudentlink (relationship_type, consent_status, linked_at, parent_profile_id, student_profile_id)
		VALUES ('mother', $1, now(), $2, $3)`, consent, pp, sp); err != nil {
		w.t.Fatal(err)
	}
}

func (w *world) cleanup() {
	ctx := context.Background()
	stmts := []string{
		`DELETE FROM grading_graderecord WHERE submission_id IN (SELECT id FROM assessments_submission WHERE student_id = ANY($1))`,
		`DELETE FROM assessments_submission WHERE student_id = ANY($1)`,
		`DELETE FROM assessments_assessment WHERE created_by_id = ANY($1)`,
		`DELETE FROM parent_portal_parentstudentlink WHERE parent_profile_id IN (SELECT id FROM accounts_parentprofile WHERE user_id = ANY($1))`,
		`DELETE FROM accounts_parentprofile WHERE user_id = ANY($1)`,
		`DELETE FROM accounts_studentprofile WHERE user_id = ANY($1)`,
		`DELETE FROM institutions_institutionmembership WHERE user_id = ANY($1)`,
		`DELETE FROM accounts_user WHERE id = ANY($1)`,
	}
	for _, s := range stmts {
		if _, err := w.pool.Exec(ctx, s, w.created.users); err != nil {
			w.t.Errorf("cleanup: %v", err)
		}
	}
	if _, err := w.pool.Exec(ctx, `DELETE FROM institutions_institution WHERE id = ANY($1)`, w.created.schools); err != nil {
		w.t.Errorf("cleanup schools: %v", err)
	}
	w.pool.Close()
}

func (w *world) call(user int64, method, path string, body any) (int, map[string]any) {
	w.t.Helper()
	pair, err := w.tokens.IssuePair(user)
	if err != nil {
		w.t.Fatal(err)
	}
	var buf bytes.Buffer
	if body != nil {
		_ = json.NewEncoder(&buf).Encode(body)
	}
	req := httptest.NewRequest(method, path, &buf)
	req.Header.Set("Authorization", "Bearer "+pair.Access)
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	w.router.ServeHTTP(rec, req)
	var out map[string]any
	_ = json.Unmarshal(rec.Body.Bytes(), &out)
	return rec.Code, out
}

func ids(page map[string]any) []int64 {
	var out []int64
	results, _ := page["results"].([]any)
	for _, r := range results {
		row, _ := r.(map[string]any)
		f, _ := row["id"].(float64)
		out = append(out, int64(f))
	}
	return out
}

func idOf(body map[string]any) int64 {
	f, _ := body["id"].(float64)
	return int64(f)
}

const (
	assessmentsURL = "/api/v1/assessments/assessment/"
	submissionsURL = "/api/v1/assessments/submission/"
	gradesURL      = "/api/v1/grading/records/"
)

func TestAssignmentLoopEndToEnd(t *testing.T) {
	w := newWorld(t)
	school := w.school("Loop School")
	teacher := w.person("teacher", "subject_teacher", school)
	student := w.person("student", "student", school)
	classmate := w.person("student", "student", school)

	// Teacher publishes an assignment.
	code, created := w.call(teacher, http.MethodPost, assessmentsURL, map[string]any{
		"title": "Essay 1", "instructions": "Two paragraphs on squares.", "type": "assignment",
		"max_score": "100", "is_published": true,
	})
	if code != http.StatusCreated {
		t.Fatalf("create: %d %v", code, created)
	}
	assessment := idOf(created)
	if created["max_score"] != "100.00" {
		t.Errorf("max_score should keep DRF's decimal string format, got %v", created["max_score"])
	}

	// Student sees it.
	code, page := w.call(student, http.MethodGet, assessmentsURL, nil)
	if code != http.StatusOK || !contains(ids(page), assessment) {
		t.Fatalf("student list: %d %v", code, page)
	}

	// Student submits, once.
	code, sub := w.call(student, http.MethodPost, submissionsURL, map[string]any{
		"assessment": assessment, "answers_data": map[string]any{"essay": "My answer."},
	})
	if code != http.StatusCreated || sub["status"] != "submitted" {
		t.Fatalf("submit: %d %v", code, sub)
	}
	submission := idOf(sub)
	code, _ = w.call(student, http.MethodPost, submissionsURL, map[string]any{
		"assessment": assessment, "answers_data": map[string]any{"essay": "Again."},
	})
	if code != http.StatusConflict {
		t.Fatalf("second submission: want 409, got %d", code)
	}

	// Teacher sees the submission and grades it.
	code, subs := w.call(teacher, http.MethodGet, submissionsURL, nil)
	if code != http.StatusOK || !contains(ids(subs), submission) {
		t.Fatalf("teacher submissions: %d %v", code, subs)
	}
	code, grade := w.call(teacher, http.MethodPost, gradesURL, map[string]any{
		"submission": submission, "score": "85", "teacher_feedback": "Clear argument.",
	})
	if code != http.StatusCreated || grade["score"] != "85.00" {
		t.Fatalf("grade: %d %v", code, grade)
	}

	// Student reads their grade; the classmate sees nothing.
	code, mine := w.call(student, http.MethodGet, gradesURL, nil)
	if code != http.StatusOK || !contains(ids(mine), idOf(grade)) {
		t.Fatalf("student grades: %d %v", code, mine)
	}
	_, theirs := w.call(classmate, http.MethodGet, gradesURL, nil)
	if len(ids(theirs)) != 0 {
		t.Fatalf("classmate must not see another student's grade: %v", theirs)
	}

	// The submission is now marked graded.
	_, subs = w.call(student, http.MethodGet, submissionsURL, nil)
	results, _ := subs["results"].([]any)
	if len(results) != 1 || results[0].(map[string]any)["status"] != "graded" {
		t.Fatalf("submission should be graded: %v", subs)
	}
}

func TestDraftsAreHiddenFromStudents(t *testing.T) {
	w := newWorld(t)
	school := w.school("Draft School")
	teacher := w.person("teacher", "subject_teacher", school)
	student := w.person("student", "student", school)

	_, draft := w.call(teacher, http.MethodPost, assessmentsURL, map[string]any{
		"title": "Draft", "instructions": "Not yet.", "max_score": "10", "is_published": false,
	})
	_, page := w.call(student, http.MethodGet, assessmentsURL, nil)
	if contains(ids(page), idOf(draft)) {
		t.Fatal("students must not see drafts")
	}
	if code, _ := w.call(student, http.MethodGet, fmt.Sprintf("%s%d/", assessmentsURL, idOf(draft)), nil); code != http.StatusNotFound {
		t.Fatalf("draft detail for student: want 404, got %d", code)
	}
	if code, _ := w.call(student, http.MethodPost, submissionsURL, map[string]any{"assessment": idOf(draft), "answers_data": map[string]any{}}); code != http.StatusNotFound {
		t.Fatalf("submitting to a draft: want 404, got %d", code)
	}
}

func TestStudentsCannotCreateOrGrade(t *testing.T) {
	w := newWorld(t)
	school := w.school("Rules School")
	teacher := w.person("teacher", "subject_teacher", school)
	student := w.person("student", "student", school)

	if code, _ := w.call(student, http.MethodPost, assessmentsURL, map[string]any{"title": "Mine", "instructions": "x", "max_score": "10"}); code != http.StatusForbidden {
		t.Fatalf("student create: want 403, got %d", code)
	}
	_, a := w.call(teacher, http.MethodPost, assessmentsURL, map[string]any{"title": "A", "instructions": "x", "max_score": "10", "is_published": true})
	_, s := w.call(student, http.MethodPost, submissionsURL, map[string]any{"assessment": idOf(a), "answers_data": map[string]any{}})
	if code, _ := w.call(student, http.MethodPost, gradesURL, map[string]any{"submission": idOf(s), "score": "10"}); code != http.StatusForbidden {
		t.Fatalf("student grading: want 403, got %d", code)
	}
}

func TestGradeMustFitTheAssignment(t *testing.T) {
	w := newWorld(t)
	school := w.school("Score School")
	teacher := w.person("teacher", "subject_teacher", school)
	student := w.person("student", "student", school)

	_, a := w.call(teacher, http.MethodPost, assessmentsURL, map[string]any{"title": "Quiz", "instructions": "x", "max_score": "20", "is_published": true})
	_, s := w.call(student, http.MethodPost, submissionsURL, map[string]any{"assessment": idOf(a), "answers_data": map[string]any{}})
	for _, score := range []string{"21", "-1", "abc"} {
		if code, _ := w.call(teacher, http.MethodPost, gradesURL, map[string]any{"submission": idOf(s), "score": score}); code != http.StatusBadRequest {
			t.Errorf("score %s: want 400, got %d", score, code)
		}
	}
}

func TestOtherSchoolsSeeNothing(t *testing.T) {
	w := newWorld(t)
	home := w.school("Home School")
	away := w.school("Away School")
	teacher := w.person("teacher", "subject_teacher", home)
	student := w.person("student", "student", home)
	outsider := w.person("teacher", "subject_teacher", away)
	outsideStudent := w.person("student", "student", away)

	_, a := w.call(teacher, http.MethodPost, assessmentsURL, map[string]any{"title": "Private", "instructions": "x", "max_score": "10", "is_published": true})
	_, s := w.call(student, http.MethodPost, submissionsURL, map[string]any{"assessment": idOf(a), "answers_data": map[string]any{}})
	_, g := w.call(teacher, http.MethodPost, gradesURL, map[string]any{"submission": idOf(s), "score": "7"})

	if _, page := w.call(outsider, http.MethodGet, assessmentsURL, nil); contains(ids(page), idOf(a)) {
		t.Error("another school's teacher can see the assignment")
	}
	if _, page := w.call(outsider, http.MethodGet, submissionsURL, nil); contains(ids(page), idOf(s)) {
		t.Error("another school's teacher can see the submission")
	}
	if _, page := w.call(outsider, http.MethodGet, gradesURL, nil); contains(ids(page), idOf(g)) {
		t.Error("another school's teacher can see the grade")
	}
	if code, _ := w.call(outsider, http.MethodPost, gradesURL, map[string]any{"submission": idOf(s), "score": "1"}); code != http.StatusNotFound {
		t.Errorf("another school's teacher grading: want 404, got %d", code)
	}
	if code, _ := w.call(outsideStudent, http.MethodPost, submissionsURL, map[string]any{"assessment": idOf(a), "answers_data": map[string]any{}}); code != http.StatusNotFound {
		t.Errorf("another school's student submitting: want 404, got %d", code)
	}
}

func TestParentsSeeOnlyApprovedChildrensGrades(t *testing.T) {
	w := newWorld(t)
	school := w.school("Family School")
	teacher := w.person("teacher", "subject_teacher", school)
	child := w.person("student", "student", school)
	pendingChild := w.person("student", "student", school)
	parent := w.person("parent", "parent", school)
	w.linkParent(parent, child, "approved")
	w.linkParent(parent, pendingChild, "pending")

	_, a := w.call(teacher, http.MethodPost, assessmentsURL, map[string]any{"title": "Homework", "instructions": "x", "max_score": "10", "is_published": true})
	_, s1 := w.call(child, http.MethodPost, submissionsURL, map[string]any{"assessment": idOf(a), "answers_data": map[string]any{}})
	_, s2 := w.call(pendingChild, http.MethodPost, submissionsURL, map[string]any{"assessment": idOf(a), "answers_data": map[string]any{}})
	_, g1 := w.call(teacher, http.MethodPost, gradesURL, map[string]any{"submission": idOf(s1), "score": "9"})
	_, g2 := w.call(teacher, http.MethodPost, gradesURL, map[string]any{"submission": idOf(s2), "score": "4"})

	_, page := w.call(parent, http.MethodGet, gradesURL, nil)
	got := ids(page)
	if !contains(got, idOf(g1)) || contains(got, idOf(g2)) {
		t.Fatalf("parent should see only the approved child's grade, got %v", got)
	}
	if code, _ := w.call(parent, http.MethodGet, gradesURL+"?student="+strconv.FormatInt(pendingChild, 10), nil); code != http.StatusForbidden {
		t.Fatalf("asking for an unapproved child's grades: want 403, got %d", code)
	}
}

func TestUnsupportedMethodsAreNotForwardedToDjango(t *testing.T) {
	w := newWorld(t)
	school := w.school("Method School")
	teacher := w.person("teacher", "subject_teacher", school)
	if code, _ := w.call(teacher, http.MethodDelete, assessmentsURL+"1/", nil); code != http.StatusMethodNotAllowed {
		t.Fatalf("DELETE on an owned path: want 405, got %d", code)
	}
}

func contains(list []int64, id int64) bool {
	for _, v := range list {
		if v == id {
			return true
		}
	}
	return false
}
