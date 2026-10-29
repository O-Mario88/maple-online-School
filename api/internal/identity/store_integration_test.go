package identity

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"os"
	"testing"
	"time"

	"github.com/O-Mario88/maple-online-School/api/internal/platform/postgres"
)

// These tests run against a Postgres database migrated by Django and seeded
// with `manage.py seed_pilot`. Set MAPLE_TEST_DATABASE_URL to run them.
func openTestStore(t *testing.T) *PostgresStore {
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
	return NewPostgresStore(pool)
}

func TestStoreFindsSeededUserCaseInsensitively(t *testing.T) {
	store := openTestStore(t)
	user, err := store.UserByEmail(context.Background(), "Student.A@Pilot.Maple")
	if err != nil {
		t.Fatal(err)
	}
	ok, err := CheckPassword("PilotPass!", user.PasswordHash)
	if err != nil || !ok {
		t.Fatalf("seeded Django password should verify in Go: ok=%v err=%v", ok, err)
	}
	if _, err := store.UserByEmail(context.Background(), "nobody@pilot.maple"); !errors.Is(err, ErrNotFound) {
		t.Fatalf("want ErrNotFound, got %v", err)
	}
}

func TestStoreLoadsMembershipsAndApprovedChildren(t *testing.T) {
	store := openTestStore(t)
	ctx := context.Background()

	student, err := store.UserByEmail(ctx, "student.a@pilot.maple")
	if err != nil {
		t.Fatal(err)
	}
	ms, err := store.Memberships(ctx, student.ID)
	if err != nil || len(ms) == 0 || ms[0].InstitutionName != "Maple Pilot School" {
		t.Fatalf("unexpected memberships %+v err=%v", ms, err)
	}

	parent, err := store.UserByEmail(ctx, "parent.a@pilot.maple")
	if err != nil {
		t.Fatal(err)
	}
	kids, err := store.ApprovedChildren(ctx, parent.ID)
	if err != nil || len(kids) != 1 || kids[0].UserID != student.ID {
		t.Fatalf("expected Amina as the only child, got %+v err=%v", kids, err)
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
