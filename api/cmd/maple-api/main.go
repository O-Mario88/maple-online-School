// Command maple-api runs the Maple Go API.
package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/config"
	"github.com/O-Mario88/maple-online-School/api/internal/curriculum"
	"github.com/O-Mario88/maple-online-School/api/internal/identity"
	"github.com/O-Mario88/maple-online-School/api/internal/institutions"
	"github.com/O-Mario88/maple-online-School/api/internal/learning"
	"github.com/O-Mario88/maple-online-School/api/internal/lessons"
	"github.com/O-Mario88/maple-online-School/api/internal/livesessions"
	"github.com/O-Mario88/maple-online-School/api/internal/platform/postgres"
	"github.com/O-Mario88/maple-online-School/api/internal/reports"
	"github.com/O-Mario88/maple-online-School/api/internal/resources"
	"github.com/O-Mario88/maple-online-School/api/internal/school"
	"github.com/O-Mario88/maple-online-School/api/internal/server"
	"github.com/O-Mario88/maple-online-School/api/internal/signup"
	"github.com/O-Mario88/maple-online-School/api/internal/timetable"
)

const shutdownGrace = 15 * time.Second

func main() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
	if err := run(); err != nil {
		slog.Error("maple-api stopped", "err", err)
		os.Exit(1)
	}
}

func run() error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	pool, err := postgres.Open(ctx, cfg.DatabaseURL)
	if err != nil {
		return err
	}
	defer pool.Close()
	if err := postgres.Migrate(ctx, pool); err != nil {
		return err
	}

	store := identity.NewPostgresStore(pool)
	tokens := &identity.TokenIssuer{SigningKey: cfg.JWTSigningKey, AccessTTL: cfg.AccessTTL, RefreshTTL: cfg.RefreshTTL}
	auth := identity.NewHandler(store, store, store, tokens, cfg.RequireVerified)
	work := learning.NewHandler(learning.NewPostgresStore(pool), store, auth.RequireUser)
	classes := school.NewHandler(school.NewPostgresStore(pool), store, auth.RequireUser)
	cards := reports.NewHandler(reports.NewPostgresStore(pool), store, auth.RequireUser)
	week := timetable.NewHandler(timetable.NewPostgresStore(pool), store, auth.RequireUser)
	schools := institutions.NewHandler(institutions.NewPostgresStore(pool), auth.RequireUser)
	catalog := curriculum.NewHandler(curriculum.NewPostgresStore(pool), auth.RequireUser)
	library := resources.NewHandler(resources.NewPostgresStore(pool), auth.RequireUser)
	plans := lessons.NewHandler(lessons.NewPostgresStore(pool), auth.RequireUser)
	live := livesessions.NewHandler(livesessions.NewPostgresStore(pool), auth.RequireUser)
	join := signup.NewHandler(signup.NewPostgresStore(pool), signup.Signer{Key: cfg.JWTSigningKey}, mailer(cfg.SMTP), cfg.AppURL)

	handler, err := server.NewRouter(server.Options{
		Pinger:            pool,
		LegacyAPI:         cfg.LegacyAPIURL,
		CORSOrigins:       cfg.CORSOrigins,
		TrustProxyHeaders: cfg.TrustProxyHeaders,
		Modules:           []func(chi.Router){auth.Mount, work.Mount, classes.Mount, cards.Mount, week.Mount, schools.Mount, catalog.Mount, library.Mount, plans.Mount, live.Mount, join.Mount},
	})
	if err != nil {
		return err
	}

	srv := &http.Server{
		Addr:              cfg.Addr,
		Handler:           handler,
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       30 * time.Second,
		WriteTimeout:      60 * time.Second,
		IdleTimeout:       120 * time.Second,
	}
	errCh := make(chan error, 1)
	go func() {
		slog.Info("maple-api listening", "addr", cfg.Addr, "legacy_api", cfg.LegacyAPIURL != "")
		errCh <- srv.ListenAndServe()
	}()

	select {
	case err := <-errCh:
		if !errors.Is(err, http.ErrServerClosed) {
			return err
		}
		return nil
	case <-ctx.Done():
	}
	shutdownCtx, cancel := context.WithTimeout(context.Background(), shutdownGrace)
	defer cancel()
	return srv.Shutdown(shutdownCtx)
}

// mailer sends sign-up and password emails through SMTP, or logs them when
// no SMTP host is configured (development).
func mailer(c config.SMTP) signup.Mailer {
	if c.Host == "" {
		slog.Warn("SMTP_HOST not set: sign-up and password emails are written to the log, not sent")
		return signup.LogMailer{}
	}
	return signup.SMTPMailer{Host: c.Host, Port: c.Port, Username: c.Username, Password: c.Password, From: c.From}
}
