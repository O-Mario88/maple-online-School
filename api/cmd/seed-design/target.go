package main

import (
	"context"
	"errors"
	"fmt"
	"net/url"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

// designSuffix is the end every design database's name must have: the seeder drops and
// rebuilds the database it is given, so it refuses any name that could be someone's real data.
const designSuffix = "_design"

// checkTarget allows only a design database on this machine, and never in production. It
// returns the database's name.
func checkTarget(dbURL, appEnv string) (string, error) {
	if appEnv == "production" {
		return "", errors.New("APP_ENV is production: the design seed never runs there")
	}
	u, err := url.Parse(dbURL)
	if err != nil || (u.Scheme != "postgres" && u.Scheme != "postgresql") {
		return "", fmt.Errorf("%q is not a postgres:// address", redact(dbURL))
	}
	cfg, err := pgconn.ParseConfig(dbURL)
	if err != nil {
		return "", fmt.Errorf("read the database address: %w", err)
	}
	if !isLocal(cfg.Host) {
		return "", fmt.Errorf("the database is on %q: the design seed only runs on this machine", cfg.Host)
	}
	if !strings.HasSuffix(cfg.Database, designSuffix) {
		return "", fmt.Errorf("the database %q doesn't end in %q, so it may hold real data; use e.g. maple%s", cfg.Database, designSuffix, designSuffix)
	}
	return cfg.Database, nil
}

// isLocal is true for loopback addresses and Unix sockets (a host that is a directory path).
func isLocal(host string) bool {
	switch host {
	case "localhost", "127.0.0.1", "::1":
		return true
	}
	return strings.HasPrefix(host, "/")
}

func redact(dbURL string) string {
	u, err := url.Parse(dbURL)
	if err != nil {
		return "<unreadable address>"
	}
	return u.Redacted()
}

// recreate drops the design database and creates it empty, so every run gives the same data.
// It connects to the server's `postgres` database to do so.
func recreate(ctx context.Context, dbURL, name string) error {
	cfg, err := pgx.ParseConfig(dbURL)
	if err != nil {
		return fmt.Errorf("read the database address: %w", err)
	}
	cfg.Database = "postgres"
	conn, err := pgx.ConnectConfig(ctx, cfg)
	if err != nil {
		return fmt.Errorf("connect to the local Postgres server: %w", err)
	}
	defer func() { _ = conn.Close(ctx) }()
	ident := pgx.Identifier{name}.Sanitize()
	if _, err := conn.Exec(ctx, "DROP DATABASE IF EXISTS "+ident+" WITH (FORCE)"); err != nil {
		return fmt.Errorf("drop %s: %w", name, err)
	}
	if _, err := conn.Exec(ctx, "CREATE DATABASE "+ident); err != nil {
		return fmt.Errorf("create %s: %w", name, err)
	}
	return nil
}
