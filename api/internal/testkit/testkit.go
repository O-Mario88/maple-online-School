// Package testkit creates throwaway schools and people in a real Postgres
// database for module tests, and removes them afterwards. Tests using it are
// skipped unless MAPLE_TEST_DATABASE_URL points at a database Django has migrated.
package testkit

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/O-Mario88/maple-online-School/api/internal/identity"
	"github.com/O-Mario88/maple-online-School/api/internal/platform/postgres"
)

// World is one test's database fixtures plus a router to call.
type World struct {
	T       *testing.T
	Pool    *pgxpool.Pool
	Tokens  *identity.TokenIssuer
	Auth    *identity.Handler
	Ids     *identity.PostgresStore
	Router  http.Handler
	users   []int64
	schools []int64
}

// New opens the test database or skips the test.
func New(t *testing.T) *World {
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
	w := &World{T: t, Pool: pool, Tokens: tokens, Ids: ids, Auth: identity.NewHandler(ids, ids, ids, tokens, false)}
	t.Cleanup(w.cleanup)
	return w
}

func suffix() string {
	b := make([]byte, 4)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func (w *World) scalar(query string, args ...any) int64 {
	w.T.Helper()
	var id int64
	if err := w.Pool.QueryRow(context.Background(), query, args...).Scan(&id); err != nil {
		w.T.Fatalf("fixture: %v", err)
	}
	return id
}

// School creates a school.
func (w *World) School(name string) int64 {
	id := w.scalar(`
		INSERT INTO institutions_institution (name, primary_color, secondary_color, country_code, curriculum_track,
		  subscription_plan, is_active, created_at, grade_offerings, school_level, in_grace_period)
		VALUES ($1, '#000000', '#ffffff', 'UG', 'uganda', 'trial', true, now(), '[]', 'secondary', false)
		RETURNING id`, name+" "+suffix())
	w.schools = append(w.schools, id)
	return id
}

// Person creates a user with a platform role and an active membership in school (0 = none).
func (w *World) Person(role, schoolRole string, school int64) int64 {
	id := w.scalar(`
		INSERT INTO accounts_user (password, is_superuser, email, full_name, country_code, role,
		  whatsapp_opt_in, is_active, is_staff, date_joined, email_verified)
		VALUES ('!', false, $1, $2, 'UG', $3, false, true, false, now(), true)
		RETURNING id`, role+"."+suffix()+"@testkit.test", "Test "+role+" "+suffix(), role)
	w.users = append(w.users, id)
	if school != 0 {
		w.exec(`INSERT INTO institutions_institutionmembership (role, status, joined_at, institution_id, user_id)
			VALUES ($1, 'active', now(), $2, $3)`, schoolRole, school, id)
	}
	return id
}

// LinkParent links a parent to a student with the given consent status and
// returns the link's id.
func (w *World) LinkParent(parent, student int64, consent string) int64 {
	ctx := context.Background()
	var pp int64
	if err := w.Pool.QueryRow(ctx, `SELECT id FROM accounts_parentprofile WHERE user_id = $1`, parent).Scan(&pp); err != nil {
		pp = w.scalar(`INSERT INTO accounts_parentprofile (user_id) VALUES ($1) RETURNING id`, parent)
	}
	sp := w.scalar(`INSERT INTO accounts_studentprofile (user_id, onboarding_status) VALUES ($1, 'active') RETURNING id`, student)
	return w.scalar(`INSERT INTO parent_portal_parentstudentlink (relationship_type, consent_status, linked_at, parent_profile_id, student_profile_id)
		VALUES ('mother', $1, now(), $2, $3) RETURNING id`, consent, pp, sp)
}

// Term creates an active academic term covering today.
func (w *World) Term(school int64) int64 {
	return w.scalar(`INSERT INTO scheduling_academicterm (start_date, end_date, is_active, institution_id, name)
		VALUES (current_date - 30, current_date + 60, true, $1, 'Term 3') RETURNING id`, school)
}

// Class creates a published class in school taught by teacher.
func (w *World) Class(school, teacher int64) int64 {
	return w.scalar(`INSERT INTO classes_class (title, visibility, is_published, created_at, class_level_id, institution_id, teacher_id)
		VALUES ($1, 'private', true, now(), (SELECT id FROM curriculum_classlevel ORDER BY id LIMIT 1), $2, $3) RETURNING id`,
		"Class "+suffix(), school, teacher)
}

// Enrol puts student in class.
func (w *World) Enrol(class, student int64) {
	w.exec(`INSERT INTO classes_classenrollment (enrolled_class_id, student_id, status, enrolled_at) VALUES ($1, $2, 'active', now())`, class, student)
}

// ClassLevel returns any existing class level (Django's curriculum seed provides them).
func (w *World) ClassLevel() int64 {
	return w.scalar(`SELECT id FROM curriculum_classlevel ORDER BY id LIMIT 1`)
}

func (w *World) exec(query string, args ...any) {
	w.T.Helper()
	if _, err := w.Pool.Exec(context.Background(), query, args...); err != nil {
		w.T.Fatalf("fixture: %v", err)
	}
}

// Call sends a request as user (0 = anonymous) and decodes the JSON reply.
func (w *World) Call(user int64, method, path string, body any) (int, map[string]any) {
	w.T.Helper()
	return w.CallWithHeaders(user, method, path, body, nil)
}

// CallWithHeaders is Call with extra request headers, such as Idempotency-Key.
func (w *World) CallWithHeaders(user int64, method, path string, body any, headers map[string]string) (int, map[string]any) {
	w.T.Helper()
	var buf bytes.Buffer
	if body != nil {
		_ = json.NewEncoder(&buf).Encode(body)
	}
	req := httptest.NewRequest(method, path, &buf)
	req.Header.Set("Content-Type", "application/json")
	for k, v := range headers {
		req.Header.Set(k, v)
	}
	code, raw := w.Raw(user, req)
	var out map[string]any
	_ = json.Unmarshal([]byte(raw), &out)
	return code, out
}

// Raw sends req as user (0 for anonymous) and returns the status and body.
func (w *World) Raw(user int64, req *http.Request) (int, string) {
	w.T.Helper()
	if user != 0 {
		pair, err := w.Tokens.IssuePair(user)
		if err != nil {
			w.T.Fatal(err)
		}
		req.Header.Set("Authorization", "Bearer "+pair.Access)
	}
	rec := httptest.NewRecorder()
	w.Router.ServeHTTP(rec, req)
	return rec.Code, rec.Body.String()
}

// IDs returns the "id" of each row in a paginated response.
func IDs(page map[string]any) []int64 {
	var out []int64
	results, _ := page["results"].([]any)
	for _, r := range results {
		row, _ := r.(map[string]any)
		f, _ := row["id"].(float64)
		out = append(out, int64(f))
	}
	return out
}

// ID returns a response body's "id".
func ID(body map[string]any) int64 {
	f, _ := body["id"].(float64)
	return int64(f)
}

// Contains reports whether id is in list.
func Contains(list []int64, id int64) bool {
	for _, v := range list {
		if v == id {
			return true
		}
	}
	return false
}

func (w *World) cleanup() {
	ctx := context.Background()
	stmts := []string{
		`DELETE FROM grading_reportcard WHERE student_id = ANY($1)`,
		`DELETE FROM grading_subjectgrade WHERE student_id = ANY($1)`,
		`DELETE FROM attendance_dailyregister WHERE student_id = ANY($1) OR recorded_by_id = ANY($1)`,
		`DELETE FROM live_sessions_recoveryassignment WHERE recovery_id IN (SELECT id FROM live_sessions_missedsessionrecovery WHERE student_id = ANY($1) OR session_id IN (SELECT s.id FROM live_sessions_livesession s JOIN lessons_lesson l ON l.id = s.lesson_id JOIN classes_class c ON c.id = l.parent_class_id WHERE c.teacher_id = ANY($1)))`,
		`DELETE FROM live_sessions_missedsessionrecovery WHERE student_id = ANY($1) OR session_id IN (SELECT s.id FROM live_sessions_livesession s JOIN lessons_lesson l ON l.id = s.lesson_id JOIN classes_class c ON c.id = l.parent_class_id WHERE c.teacher_id = ANY($1))`,
		`DELETE FROM live_sessions_sessionreminder WHERE session_id IN (SELECT s.id FROM live_sessions_livesession s JOIN lessons_lesson l ON l.id = s.lesson_id JOIN classes_class c ON c.id = l.parent_class_id WHERE c.teacher_id = ANY($1))`,
		`DELETE FROM live_sessions_livesession WHERE id IN (SELECT s.id FROM live_sessions_livesession s JOIN lessons_lesson l ON l.id = s.lesson_id JOIN classes_class c ON c.id = l.parent_class_id WHERE c.teacher_id = ANY($1))`,
		`DELETE FROM lessons_lessonattendance WHERE student_id = ANY($1) OR lesson_id IN (SELECT l.id FROM lessons_lesson l JOIN classes_class c ON c.id = l.parent_class_id WHERE c.teacher_id = ANY($1))`,
		`DELETE FROM lessons_lessonnote WHERE lesson_id IN (SELECT l.id FROM lessons_lesson l JOIN classes_class c ON c.id = l.parent_class_id WHERE c.teacher_id = ANY($1))`,
		`DELETE FROM lessons_lessonrecording WHERE lesson_id IN (SELECT l.id FROM lessons_lesson l JOIN classes_class c ON c.id = l.parent_class_id WHERE c.teacher_id = ANY($1))`,
		`DELETE FROM lessons_lesson WHERE parent_class_id IN (SELECT id FROM classes_class WHERE teacher_id = ANY($1))`,
		`DELETE FROM resources_sharedresourcelink WHERE added_by_id = ANY($1) OR target_class_id IN (SELECT id FROM classes_class WHERE teacher_id = ANY($1)) OR resource_id IN (SELECT id FROM resources_resource WHERE uploaded_by_id = ANY($1))`,
		`DELETE FROM resources_resource WHERE uploaded_by_id = ANY($1)`,
		`DELETE FROM scheduling_timetableslot WHERE assigned_class_id IN (SELECT id FROM classes_class WHERE teacher_id = ANY($1))`,
		`DELETE FROM grading_subjectgrade WHERE assigned_class_id IN (SELECT id FROM classes_class WHERE teacher_id = ANY($1))`,
		`DELETE FROM classes_classenrollment WHERE student_id = ANY($1) OR enrolled_class_id IN (SELECT id FROM classes_class WHERE teacher_id = ANY($1))`,
		`DELETE FROM classes_class WHERE teacher_id = ANY($1)`,
		`DELETE FROM grading_graderecord WHERE submission_id IN (SELECT id FROM assessments_submission WHERE student_id = ANY($1))`,
		`DELETE FROM assessments_submission WHERE student_id = ANY($1)`,
		`DELETE FROM assessments_assessment WHERE created_by_id = ANY($1)`,
		`DELETE FROM family_link_decisions WHERE decided_by = ANY($1) OR link_id IN (SELECT id FROM parent_portal_parentstudentlink WHERE parent_profile_id IN (SELECT id FROM accounts_parentprofile WHERE user_id = ANY($1)))`,
		`DELETE FROM parent_portal_parentstudentlink WHERE parent_profile_id IN (SELECT id FROM accounts_parentprofile WHERE user_id = ANY($1))`,
		`DELETE FROM accounts_parentprofile WHERE user_id = ANY($1)`,
		`DELETE FROM accounts_studentprofile WHERE user_id = ANY($1)`,
		`DELETE FROM institutions_institutionmembership WHERE user_id = ANY($1)`,
		`DELETE FROM accounts_user WHERE id = ANY($1)`,
	}
	for _, s := range stmts {
		if _, err := w.Pool.Exec(ctx, s, w.users); err != nil {
			w.T.Errorf("cleanup: %v", err)
		}
	}
	for _, s := range []string{
		`DELETE FROM grading_reportcard WHERE institution_id = ANY($1)`,
		`DELETE FROM attendance_dailyregister WHERE institution_id = ANY($1)`,
		`DELETE FROM scheduling_timetableslot WHERE institution_id = ANY($1)`,
		`DELETE FROM scheduling_room WHERE institution_id = ANY($1)`,
		`DELETE FROM scheduling_academicterm WHERE institution_id = ANY($1)`,
		`DELETE FROM institutions_institution WHERE id = ANY($1)`,
	} {
		if _, err := w.Pool.Exec(ctx, s, w.schools); err != nil {
			w.T.Errorf("cleanup schools: %v", err)
		}
	}
	w.Pool.Close()
}
