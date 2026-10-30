// Package config reads settings from environment variables.
package config

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

// Config is everything the service needs to start.
type Config struct {
	Addr              string
	DatabaseURL       string
	JWTSigningKey     []byte
	AccessTTL         time.Duration
	RefreshTTL        time.Duration
	RequireVerified   bool
	LegacyAPIURL      string
	CORSOrigins       []string
	TrustProxyHeaders bool
	AppURL            string // where emailed links open (the app)
	SMTP              SMTP
}

// SMTP is the mail server for sign-up and password emails. With no host,
// emails are written to the log (development only).
type SMTP struct {
	Host, Port, Username, Password, From string
}

// minKeyLength guards against short, guessable signing keys.
const minKeyLength = 32

// Load reads and validates the environment.
func Load() (Config, error) {
	cfg := Config{
		Addr:              env("MAPLE_ADDR", ":8080"),
		DatabaseURL:       os.Getenv("DATABASE_URL"),
		JWTSigningKey:     []byte(os.Getenv("JWT_SIGNING_KEY")),
		RequireVerified:   envBool("REQUIRE_EMAIL_VERIFICATION"),
		LegacyAPIURL:      os.Getenv("LEGACY_API_URL"),
		CORSOrigins:       envList("CORS_ORIGINS"),
		TrustProxyHeaders: envBool("TRUST_PROXY_HEADERS"),
		AppURL:            env("APP_URL", "http://localhost:8081"),
		SMTP: SMTP{
			Host: os.Getenv("SMTP_HOST"), Port: env("SMTP_PORT", "587"), Username: os.Getenv("SMTP_USERNAME"),
			Password: os.Getenv("SMTP_PASSWORD"), From: env("MAIL_FROM", "no-reply@maple.school"),
		},
	}
	var err error
	if cfg.AccessTTL, err = envDuration("ACCESS_TOKEN_TTL", 15*time.Minute); err != nil {
		return Config{}, err
	}
	if cfg.RefreshTTL, err = envDuration("REFRESH_TOKEN_TTL", 7*24*time.Hour); err != nil {
		return Config{}, err
	}

	var problems []error
	if cfg.DatabaseURL == "" {
		problems = append(problems, errors.New("DATABASE_URL is required"))
	}
	if len(cfg.JWTSigningKey) < minKeyLength {
		problems = append(problems, fmt.Errorf("JWT_SIGNING_KEY must be at least %d characters (use the Django SECRET_KEY while both backends run)", minKeyLength))
	}
	if err := errors.Join(problems...); err != nil {
		return Config{}, err
	}
	return cfg, nil
}

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func envBool(key string) bool {
	v, _ := strconv.ParseBool(os.Getenv(key))
	return v
}

func envList(key string) []string {
	var out []string
	for _, part := range strings.Split(os.Getenv(key), ",") {
		if p := strings.TrimSpace(part); p != "" {
			out = append(out, p)
		}
	}
	return out
}

func envDuration(key string, fallback time.Duration) (time.Duration, error) {
	v := os.Getenv(key)
	if v == "" {
		return fallback, nil
	}
	d, err := time.ParseDuration(v)
	if err != nil || d <= 0 {
		return 0, fmt.Errorf("%s must be a positive duration like 15m or 168h", key)
	}
	return d, nil
}
