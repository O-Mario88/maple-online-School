// Package postgres opens the connection pool and applies migrations.
package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5/stdlib"
	"github.com/pressly/goose/v3"

	"github.com/O-Mario88/maple-online-School/api/db"
)

// Go keeps its own migration history so it never touches Django's.
const gooseTable = "go_schema_migrations"

// migrateLock is the advisory lock key that lets only one caller migrate at a
// time (API instances starting together, or test packages run in parallel).
const migrateLock = 7_461_013_201

// Open connects to Postgres and checks the connection.
func Open(ctx context.Context, url string) (*pgxpool.Pool, error) {
	pool, err := pgxpool.New(ctx, url)
	if err != nil {
		return nil, fmt.Errorf("open postgres pool: %w", err)
	}
	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	if err := pool.Ping(pingCtx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("ping postgres: %w", err)
	}
	return pool, nil
}

// Migrate brings the database up to date. An empty database first gets the
// tables Maple originally made with Django; then any pending Go migrations run.
func Migrate(ctx context.Context, pool *pgxpool.Pool) error {
	// The lock belongs to this connection, so it is held until we unlock or the connection ends.
	conn, err := pool.Acquire(ctx)
	if err != nil {
		return fmt.Errorf("acquire migration connection: %w", err)
	}
	defer conn.Release()
	if _, err := conn.Exec(ctx, "SELECT pg_advisory_lock($1)", migrateLock); err != nil {
		return fmt.Errorf("take migration lock: %w", err)
	}
	defer func() {
		_, _ = conn.Exec(context.Background(), "SELECT pg_advisory_unlock($1)", migrateLock)
	}()

	if err := applyLegacySchema(ctx, pool); err != nil {
		return err
	}
	sqlDB := stdlib.OpenDBFromPool(pool)
	defer sqlDB.Close()

	goose.SetBaseFS(db.Migrations)
	goose.SetTableName(gooseTable)
	if err := goose.SetDialect("postgres"); err != nil {
		return fmt.Errorf("set goose dialect: %w", err)
	}
	if err := goose.UpContext(ctx, sqlDB, "migrations"); err != nil {
		return fmt.Errorf("apply migrations: %w", err)
	}
	return nil
}

// applyLegacySchema creates the Django-era tables on a database that has none.
// A database that already has them (made by Django, or by an earlier run) is
// left alone.
func applyLegacySchema(ctx context.Context, pool *pgxpool.Pool) error {
	var present bool
	if err := pool.QueryRow(ctx, "SELECT to_regclass('public.accounts_user') IS NOT NULL").Scan(&present); err != nil {
		return fmt.Errorf("check for existing schema: %w", err)
	}
	if present {
		return nil
	}
	tx, err := pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin legacy schema: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()
	if _, err := tx.Exec(ctx, db.LegacySchema); err != nil {
		return fmt.Errorf("create legacy schema: %w", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit legacy schema: %w", err)
	}
	return nil
}
