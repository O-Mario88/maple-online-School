package postgres

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"net/url"
	"os"
	"sync"
	"testing"

	"github.com/jackc/pgx/v5/pgxpool"
)

// scratchURL makes an empty throwaway database for one test and drops it afterwards.
func scratchURL(t *testing.T, prefix string) string {
	t.Helper()
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
	name := prefix + hex.EncodeToString(b)
	if _, err := adminPool.Exec(ctx, "CREATE DATABASE "+name); err != nil {
		adminPool.Close()
		t.Skipf("can't create a scratch database: %v", err)
	}
	// Runs after the test's own pools have closed, so the drop can succeed.
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
	return u.String()
}

// Test packages (and API instances starting together) migrate the same database
// at the same moment; only one may build it, and every caller must succeed.
func TestMigrateIsSafeWhenSeveralCallersRunAtOnce(t *testing.T) {
	dsn := scratchURL(t, "maple_concurrent_")
	ctx := context.Background()
	const callers = 4
	pools := make([]*pgxpool.Pool, callers)
	for i := range pools {
		p, err := Open(ctx, dsn)
		if err != nil {
			t.Fatal(err)
		}
		defer p.Close()
		pools[i] = p
	}
	var wg sync.WaitGroup
	errs := make([]error, callers)
	for i, p := range pools {
		wg.Add(1)
		go func(i int, p *pgxpool.Pool) {
			defer wg.Done()
			errs[i] = Migrate(ctx, p)
		}(i, p)
	}
	wg.Wait()
	for i, err := range errs {
		if err != nil {
			t.Errorf("caller %d: %v", i, err)
		}
	}
}

// A brand-new database must come up complete from Go alone: the tables first
// made by Django, then every Go migration. Running it again changes nothing.
func TestMigrateBuildsAFreshDatabaseFromNothing(t *testing.T) {
	ctx := context.Background()
	pool, err := Open(ctx, scratchURL(t, "maple_baseline_"))
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
