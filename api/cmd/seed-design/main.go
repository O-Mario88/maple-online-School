// Command seed-design builds a local Postgres database holding the design build's sample data
// (the same school, people, classes, timetable, marks, fees, library, messages and notices the
// designs show), so the live app (real sign-in, real API) can be run against it on this machine.
//
// It is for this machine only: it refuses APP_ENV=production, any database that isn't local, and
// any database whose name doesn't end in _design (it drops and rebuilds the one it is given). A
// deployment never runs it, and deployed app builds carry no sample data (npm run check:no-mock).
//
// Usage (from api/; `npm run db:design` in mobile/ runs the export and this together):
//
//	DESIGN_PASSWORD=... go run ./cmd/seed-design [-data ../.local/design-data.json] [-db postgres://localhost/maple_design]
package main

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/O-Mario88/maple-online-School/api/internal/identity"
	"github.com/O-Mario88/maple-online-School/api/internal/platform/postgres"
)

const (
	defaultDB   = "postgres://localhost/maple_design"
	seedTimeout = 2 * time.Minute
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, "seed-design:", err)
		os.Exit(1)
	}
}

func run() error {
	dataPath := flag.String("data", filepath.Join("..", ".local", "design-data.json"), "the export from `npm run design:export`")
	dbURL := flag.String("db", envOr("DESIGN_DATABASE_URL", defaultDB), "the local design database (its name must end in _design)")
	accountsOut := flag.String("accounts", filepath.Join("..", ".local", "design-accounts.env"), "where to write the sign-in emails")
	flag.Parse()

	name, err := checkTarget(*dbURL, os.Getenv("APP_ENV"))
	if err != nil {
		return err
	}
	data, err := loadData(*dataPath)
	if err != nil {
		return err
	}
	password, generated, err := designPassword()
	if err != nil {
		return err
	}
	hash, err := identity.HashPassword(password)
	if err != nil {
		return fmt.Errorf("hash the design password: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), seedTimeout)
	defer cancel()
	if err := recreate(ctx, *dbURL, name); err != nil {
		return err
	}
	pool, err := postgres.Open(ctx, *dbURL)
	if err != nil {
		return err
	}
	defer pool.Close()
	if err := postgres.Migrate(ctx, pool); err != nil {
		return fmt.Errorf("migrate %s: %w", name, err)
	}

	s := newSeeder(ctx, pool, data, hash)
	for _, step := range s.steps() {
		if err := step.run(); err != nil {
			return fmt.Errorf("%s: %w", step.name, err)
		}
	}
	if err := writeAccounts(*accountsOut, s, password, generated); err != nil {
		return err
	}
	fmt.Printf("Seeded %s: %d people, %d classes. Sign-in emails are in %s.\n", name, len(s.users), len(s.classes)+len(s.designClasses), *accountsOut)
	return nil
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// designPassword is DESIGN_PASSWORD, or a new random one when it isn't set.
func designPassword() (string, bool, error) {
	if p := os.Getenv("DESIGN_PASSWORD"); p != "" {
		return p, false, nil
	}
	b := make([]byte, 9)
	if _, err := rand.Read(b); err != nil {
		return "", false, fmt.Errorf("make a design password: %w", err)
	}
	return "design-" + hex.EncodeToString(b), true, nil
}

// writeAccounts records who can sign in. The password goes in only when this run made it up
// (a DESIGN_PASSWORD from the environment is already known to whoever set it).
func writeAccounts(path string, s *seeder, password string, generated bool) error {
	var b strings.Builder
	b.WriteString("# Sign-ins for the local design database (git-ignored). Every account shares one password.\n")
	if generated {
		fmt.Fprintf(&b, "DESIGN_PASSWORD=%s\n", password)
	} else {
		b.WriteString("# The password is the DESIGN_PASSWORD you seeded with.\n")
	}
	emails := make([]string, 0, len(s.accountEmails))
	for key, email := range s.accountEmails {
		emails = append(emails, fmt.Sprintf("DESIGN_%s_EMAIL=%s", strings.ToUpper(key), email))
	}
	sort.Strings(emails)
	b.WriteString(strings.Join(emails, "\n") + "\n")
	if err := os.MkdirAll(filepath.Dir(path), 0o700); err != nil {
		return fmt.Errorf("create %s: %w", filepath.Dir(path), err)
	}
	if err := os.WriteFile(path, []byte(b.String()), 0o600); err != nil {
		return fmt.Errorf("write %s: %w", path, err)
	}
	return nil
}
