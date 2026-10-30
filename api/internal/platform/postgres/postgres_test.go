package postgres

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"net/url"
	"os"
	"testing"
)

// A brand-new database must come up complete from Go alone: the tables first
// made by Django, then every Go migration. Running it again changes nothing.
func TestMigrateBuildsAFreshDatabaseFromNothing(t *testing.T) {
	admin := os.Getenv("MAPLE_TEST_DATABASE_URL")
	if admin == "" {
		t.Skip("MAPLE_TEST_DATABASE_URL not set")
	}
	ctx := context.Background()
	adminPool, err := Open(ctx, admin)
	if err != nil {
		t.Fatal(err)
	}

	b := make([]byte, 4)
	_, _ = rand.Read(b)
	name := "maple_baseline_" + hex.EncodeToString(b)
	if _, err := adminPool.Exec(ctx, "CREATE DATABASE "+name); err != nil {
		adminPool.Close()
		t.Skipf("can't create a scratch database: %v", err)
	}
	// Runs after the test's own pool has closed, so the drop can succeed.
	t.Cleanup(func() {
		if _, err := adminPool.Exec(context.Background(), "DROP DATABASE IF EXISTS "+name+" WITH (FORCE)"); err != nil {
			t.Errorf("drop scratch database: %v", err)
		}
		adminPool.Close()
	})

	u, err := url.Parse(admin)
	if err != nil {
		t.Fatal(err)
	}
	u.Path = "/" + name
	pool, err := Open(ctx, u.String())
	if err != nil {
		t.Fatal(err)
	}
	defer pool.Close()

	for run := 1; run <= 2; run++ {
		if err := Migrate(ctx, pool); err != nil {
			t.Fatalf("migrate run %d: %v", run, err)
		}
	}
	for _, table := range []string{"accounts_user", "classes_class", "curriculum_subject", "fin_invoices", "inbox_notifications", "msg_threads"} {
		var found bool
		if err := pool.QueryRow(ctx, "SELECT to_regclass('public.'||$1) IS NOT NULL", table).Scan(&found); err != nil || !found {
			t.Errorf("table %s missing (err %v)", table, err)
		}
	}
	var subjects int
	if err := pool.QueryRow(ctx, "SELECT count(*) FROM curriculum_subject").Scan(&subjects); err != nil || subjects < 40 {
		t.Errorf("the Uganda curriculum should be seeded on a fresh database: %d %v", subjects, err)
	}
	var id int64
	err = pool.QueryRow(ctx, `INSERT INTO accounts_user (password, is_superuser, email, full_name, country_code, role,
		whatsapp_opt_in, is_active, is_staff, date_joined, email_verified)
		VALUES ('!', false, 'fresh@test.test', 'Fresh', 'UG', 'student', false, true, false, now(), true) RETURNING id`).Scan(&id)
	if err != nil || id == 0 {
		t.Errorf("a fresh database takes new users: %v", err)
	}
}
