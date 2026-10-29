package identity

import (
	"context"
	"errors"
	"time"
)

// ErrNotFound is returned by stores when a record does not exist.
var ErrNotFound = errors.New("not found")

// User is an account as the identity module sees it.
type User struct {
	ID            int64
	Email         string
	FullName      string
	Role          string
	CountryCode   string
	PasswordHash  string
	IsActive      bool
	EmailVerified bool
}

// Membership is a user's role inside one school.
type Membership struct {
	InstitutionID   int64  `json:"institution_id"`
	InstitutionName string `json:"institution_name"`
	Role            string `json:"role"`
	Status          string `json:"status"`
}

// Child is a student a parent may see, through an approved guardian link.
type Child struct {
	UserID       int64  `json:"user_id"`
	FullName     string `json:"full_name"`
	Relationship string `json:"relationship"`
}

// Me is the body of GET /api/v1/auth/me/.
type Me struct {
	ID          int64        `json:"id"`
	Email       string       `json:"email"`
	FullName    string       `json:"full_name"`
	Role        string       `json:"role"`
	CountryCode string       `json:"country_code"`
	Memberships []Membership `json:"memberships"`
	Children    []Child      `json:"children"`
}

// UserReader looks up accounts.
type UserReader interface {
	UserByEmail(ctx context.Context, email string) (User, error)
	UserByID(ctx context.Context, id int64) (User, error)
}

// ProfileReader loads what a signed-in user belongs to.
type ProfileReader interface {
	Memberships(ctx context.Context, userID int64) ([]Membership, error)
	ApprovedChildren(ctx context.Context, parentUserID int64) ([]Child, error)
}

// Revoker records refresh tokens that may no longer be used.
type Revoker interface {
	// Revoke marks a token as used. It returns false if it was already revoked.
	Revoke(ctx context.Context, tokenID string, userID int64, expiresAt time.Time) (bool, error)
}
