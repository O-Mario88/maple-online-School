// Command seed-network adds the sample School Network schools to a local
// database so the learner School Network page has something to show:
//
//	cd api && set -a && . ../.local/api.env && set +a && go run ./cmd/seed-network
//
// It runs the migrations first and refuses to run when APP_ENV is production.
package main

import (
	"context"
	_ "embed"
	"errors"
	"fmt"
	"log/slog"
	"os"

	"github.com/jackc/pgx/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/platform/postgres"
)

//go:embed sample.sql
var sample string

func main() {
	if err := run(context.Background()); err != nil {
		slog.Error("seed-network", "err", err)
		os.Exit(1)
	}
	slog.Info("seed-network: sample schools are listed")
}

func run(ctx context.Context) error {
	if os.Getenv("APP_ENV") == "production" {
		return errors.New("refusing to add sample schools in production")
	}
	url := os.Getenv("DATABASE_URL")
	if url == "" {
		return errors.New("DATABASE_URL is required")
	}
	pool, err := postgres.Open(ctx, url)
	if err != nil {
		return err
	}
	defer pool.Close()
	if err := postgres.Migrate(ctx, pool); err != nil {
		return err
	}
	return pgx.BeginFunc(ctx, pool, func(tx pgx.Tx) error {
		if _, err := tx.Exec(ctx, sample); err != nil {
			return fmt.Errorf("add sample schools: %w", err)
		}
		return nil
	})
}
