package identity

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/O-Mario88/maple-online-School/api/internal/platform/dbgen"
)

// PostgresStore implements UserReader, ProfileReader and Revoker on Postgres.
// It reads the Django-owned account tables and writes only identity_revoked_tokens.
type PostgresStore struct {
	q *dbgen.Queries
}

// NewPostgresStore wraps generated queries.
func NewPostgresStore(db dbgen.DBTX) *PostgresStore {
	return &PostgresStore{q: dbgen.New(db)}
}

func (s *PostgresStore) UserByEmail(ctx context.Context, email string) (User, error) {
	row, err := s.q.UserByEmail(ctx, email)
	return toUser(dbgen.UserByIDRow(row), err)
}

func (s *PostgresStore) UserByID(ctx context.Context, id int64) (User, error) {
	row, err := s.q.UserByID(ctx, id)
	return toUser(row, err)
}

func (s *PostgresStore) Memberships(ctx context.Context, userID int64) ([]Membership, error) {
	rows, err := s.q.Memberships(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("query memberships: %w", err)
	}
	out := make([]Membership, 0, len(rows))
	for _, r := range rows {
		out = append(out, Membership{InstitutionID: r.InstitutionID, InstitutionName: r.InstitutionName, Role: r.Role, Status: r.Status})
	}
	return out, nil
}

func (s *PostgresStore) ApprovedChildren(ctx context.Context, parentUserID int64) ([]Child, error) {
	rows, err := s.q.ApprovedChildren(ctx, parentUserID)
	if err != nil {
		return nil, fmt.Errorf("query approved children: %w", err)
	}
	out := make([]Child, 0, len(rows))
	for _, r := range rows {
		out = append(out, Child{UserID: r.UserID, FullName: r.FullName, Relationship: r.RelationshipType})
	}
	return out, nil
}

func (s *PostgresStore) Revoke(ctx context.Context, tokenID string, userID int64, expiresAt time.Time) (bool, error) {
	n, err := s.q.RevokeToken(ctx, dbgen.RevokeTokenParams{
		TokenID:   tokenID,
		UserID:    userID,
		ExpiresAt: pgtype.Timestamptz{Time: expiresAt, Valid: true},
	})
	if err != nil {
		return false, fmt.Errorf("revoke token: %w", err)
	}
	return n == 1, nil
}

func toUser(row dbgen.UserByIDRow, err error) (User, error) {
	if errors.Is(err, pgx.ErrNoRows) {
		return User{}, ErrNotFound
	}
	if err != nil {
		return User{}, fmt.Errorf("query user: %w", err)
	}
	return User{
		ID:            row.ID,
		Email:         row.Email,
		FullName:      row.FullName,
		Role:          row.Role,
		CountryCode:   row.CountryCode,
		PasswordHash:  row.Password,
		IsActive:      row.IsActive,
		EmailVerified: row.EmailVerified,
	}, nil
}
