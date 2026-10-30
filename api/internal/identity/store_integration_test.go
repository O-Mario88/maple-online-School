package identity

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/O-Mario88/maple-online-School/api/internal/platform/postgres"
)

// These tests run against Postgres (MAPLE_TEST_DATABASE_URL); Migrate builds
// the schema, and each test creates the people it needs.
func openTestStore(t *testing.T) *PostgresStore {
	t.Helper()
	store, _ := openTestDB(t)
	return store
}

func openTestDB(t *testing.T) (*PostgresStore, *pgxpool.Pool) {
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
	t.Cleanup(pool.Close)
	if err := postgres.Migrate(ctx, pool); err != nil {
		t.Fatal(err)
	}
	return NewPostgresStore(pool), pool
}

type family struct {
	school, student, parent int64
	studentEmail            string
}

// newFamily makes a school, a learner in it and a parent the school approved.
func newFamily(t *testing.T, pool *pgxpool.Pool) family {
	t.Helper()
	ctx := context.Background()
	b := make([]byte, 4)
	_, _ = rand.Read(b)
	tag := hex.EncodeToString(b)
	f := family{studentEmail: "Learner." + tag + "@Identity.Test"}
	one := func(query string, args ...any) int64 {
		var id int64
		if err := pool.QueryRow(ctx, query, args...).Scan(&id); err != nil {
			t.Fatalf("fixture: %v", err)
		}
		return id
	}
	user := func(email, role, hash string) int64 {
		return one(`INSERT INTO accounts_user (password, is_superuser, email, full_name, country_code, role,
			whatsapp_opt_in, is_active, is_staff, date_joined, email_verified)
			VALUES ($1, false, $2, $3, 'UG', $4, false, true, false, now(), true) RETURNING id`, hash, email, role+" "+tag, role)
	}
	f.school = one(`INSERT INTO institutions_institution (name, primary_color, secondary_color, country_code, curriculum_track,
		subscription_plan, is_active, created_at, grade_offerings, school_level, in_grace_period)
		VALUES ($1, '#000000', '#ffffff', 'UG', 'uganda', 'trial', true, now(), '[]', 'secondary', false) RETURNING id`, "Identity School "+tag)
	f.student = user(f.studentEmail, "student", djangoHash)
	f.parent = user("parent."+tag+"@identity.test", "parent", "!")
	one(`INSERT INTO institutions_institutionmembership (role, status, joined_at, institution_id, user_id)
		VALUES ('student', 'active', now(), $1, $2) RETURNING id`, f.school, f.student)
	pp := one(`INSERT INTO accounts_parentprofile (user_id) VALUES ($1) RETURNING id`, f.parent)
	sp := one(`INSERT INTO accounts_studentprofile (user_id, onboarding_status) VALUES ($1, 'active') RETURNING id`, f.student)
	one(`INSERT INTO parent_portal_parentstudentlink (relationship_type, consent_status, linked_at, parent_profile_id, student_profile_id)
		VALUES ('mother', 'approved', now(), $1, $2) RETURNING id`, pp, sp)
	t.Cleanup(func() {
		ctx := context.Background()
		people := []int64{f.student, f.parent}
		for _, q := range []string{
			`DELETE FROM parent_portal_parentstudentlink WHERE parent_profile_id IN (SELECT id FROM accounts_parentprofile WHERE user_id = ANY($1))`,
			`DELETE FROM accounts_parentprofile WHERE user_id = ANY($1)`,
			`DELETE FROM accounts_studentprofile WHERE user_id = ANY($1)`,
			`DELETE FROM institutions_institutionmembership WHERE user_id = ANY($1)`,
			`DELETE FROM accounts_user WHERE id = ANY($1)`,
		} {
			_, _ = pool.Exec(ctx, q, people)
		}
		_, _ = pool.Exec(ctx, `DELETE FROM institutions_institution WHERE id = $1`, f.school)
	})
	return f
}

func TestStoreFindsUsersCaseInsensitivelyAndAcceptsDjangoPasswords(t *testing.T) {
	store, pool := openTestDB(t)
	f := newFamily(t, pool)
	user, err := store.UserByEmail(context.Background(), strings.ToUpper(f.studentEmail))
	if err != nil {
		t.Fatal(err)
	}
	ok, err := CheckPassword("correct horse battery", user.PasswordHash)
	if err != nil || !ok {
		t.Fatalf("a Django password should verify in Go: ok=%v err=%v", ok, err)
	}
	if _, err := store.UserByEmail(context.Background(), "nobody@identity.test"); !errors.Is(err, ErrNotFound) {
		t.Fatalf("want ErrNotFound, got %v", err)
	}
}

func TestStoreLoadsMembershipsAndApprovedChildren(t *testing.T) {
	store, pool := openTestDB(t)
	ctx := context.Background()
	f := newFamily(t, pool)

	ms, err := store.Memberships(ctx, f.student)
	if err != nil || len(ms) != 1 || ms[0].InstitutionID != f.school || ms[0].Role != "student" {
		t.Fatalf("unexpected memberships %+v err=%v", ms, err)
	}
	kids, err := store.ApprovedChildren(ctx, f.parent)
	if err != nil || len(kids) != 1 || kids[0].UserID != f.student {
		t.Fatalf("expected the learner as the only child, got %+v err=%v", kids, err)
	}
}

func TestStoreRevokesATokenOnce(t *testing.T) {
	store := openTestStore(t)
	b := make([]byte, 8)
	_, _ = rand.Read(b)
	jti := "test-" + hex.EncodeToString(b)
	expires := time.Now().Add(time.Hour)

	first, err := store.Revoke(context.Background(), jti, 1, expires)
	if err != nil || !first {
		t.Fatalf("first revoke should succeed: %v %v", first, err)
	}
	second, err := store.Revoke(context.Background(), jti, 1, expires)
	if err != nil || second {
		t.Fatalf("second revoke should report already revoked: %v %v", second, err)
	}
}
