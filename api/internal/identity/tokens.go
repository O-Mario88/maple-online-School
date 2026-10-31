package identity

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Tokens keep SimpleJWT's claims (token_type, exp, iat, jti, user_id as a
// string) and HS256 signing, so sessions started before the move to Go keep
// working.

const (
	TokenTypeAccess  = "access"
	TokenTypeRefresh = "refresh"
)

var ErrInvalidToken = errors.New("token is invalid or expired")

// TokenPair is the body returned by the token and refresh endpoints.
type TokenPair struct {
	Access  string `json:"access"`
	Refresh string `json:"refresh"`
}

// TokenClaims is what a verified token tells us.
type TokenClaims struct {
	UserID    string
	TokenID   string
	ExpiresAt time.Time
}

type claims struct {
	TokenType string `json:"token_type"`
	UserID    string `json:"user_id"`
	jwt.RegisteredClaims
}

// TokenIssuer signs and verifies tokens. Now and NewTokenID can be replaced in tests.
type TokenIssuer struct {
	SigningKey []byte
	AccessTTL  time.Duration
	RefreshTTL time.Duration
	Now        func() time.Time
	NewTokenID func() string
}

func (ti *TokenIssuer) now() time.Time {
	if ti.Now != nil {
		return ti.Now()
	}
	return time.Now()
}

func (ti *TokenIssuer) tokenID() string {
	if ti.NewTokenID != nil {
		return ti.NewTokenID()
	}
	b := make([]byte, 16)
	_, _ = rand.Read(b) // crypto/rand never returns an error on supported platforms
	return hex.EncodeToString(b)
}

// IssuePair creates a fresh access and refresh token for a user.
func (ti *TokenIssuer) IssuePair(userID int64) (TokenPair, error) {
	access, err := ti.sign(userID, TokenTypeAccess, ti.AccessTTL)
	if err != nil {
		return TokenPair{}, err
	}
	refresh, err := ti.sign(userID, TokenTypeRefresh, ti.RefreshTTL)
	if err != nil {
		return TokenPair{}, err
	}
	return TokenPair{Access: access, Refresh: refresh}, nil
}

func (ti *TokenIssuer) sign(userID int64, tokenType string, ttl time.Duration) (string, error) {
	now := ti.now()
	c := claims{
		TokenType: tokenType,
		UserID:    strconv.FormatInt(userID, 10),
		RegisteredClaims: jwt.RegisteredClaims{
			ID:        ti.tokenID(),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(ttl)),
		},
	}
	signed, err := jwt.NewWithClaims(jwt.SigningMethodHS256, c).SignedString(ti.SigningKey)
	if err != nil {
		return "", fmt.Errorf("sign %s token: %w", tokenType, err)
	}
	return signed, nil
}

// Parse verifies a token's signature, expiry and type.
func (ti *TokenIssuer) Parse(raw, wantType string) (TokenClaims, error) {
	var c claims
	_, err := jwt.ParseWithClaims(raw, &c, func(*jwt.Token) (any, error) { return ti.SigningKey, nil },
		jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}),
		jwt.WithTimeFunc(ti.now),
		jwt.WithExpirationRequired(),
	)
	if err != nil || c.TokenType != wantType || c.UserID == "" || c.ID == "" {
		return TokenClaims{}, ErrInvalidToken
	}
	return TokenClaims{UserID: c.UserID, TokenID: c.ID, ExpiresAt: c.ExpiresAt.Time}, nil
}
