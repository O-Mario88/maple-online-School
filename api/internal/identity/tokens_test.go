package identity

import (
	"errors"
	"testing"
	"time"
)

func testIssuer(now time.Time) *TokenIssuer {
	return &TokenIssuer{
		SigningKey: []byte("test-signing-key"),
		AccessTTL:  24 * time.Hour,
		RefreshTTL: 7 * 24 * time.Hour,
		Now:        func() time.Time { return now },
		NewTokenID: func() string { return "fixed-jti" },
	}
}

func TestIssuePairMatchesSimpleJWTClaims(t *testing.T) {
	now := time.Unix(1_800_000_000, 0)
	issuer := testIssuer(now)

	pair, err := issuer.IssuePair(42)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	access, err := issuer.Parse(pair.Access, TokenTypeAccess)
	if err != nil {
		t.Fatalf("access token did not parse: %v", err)
	}
	if access.UserID != "42" {
		t.Errorf("user_id must be a string like SimpleJWT's, got %q", access.UserID)
	}
	if !access.ExpiresAt.Equal(now.Add(24 * time.Hour)) {
		t.Errorf("unexpected access expiry %v", access.ExpiresAt)
	}

	refresh, err := issuer.Parse(pair.Refresh, TokenTypeRefresh)
	if err != nil {
		t.Fatalf("refresh token did not parse: %v", err)
	}
	if refresh.TokenID != "fixed-jti" {
		t.Errorf("unexpected jti %q", refresh.TokenID)
	}
}

func TestParseRejectsWrongTokenType(t *testing.T) {
	issuer := testIssuer(time.Unix(1_800_000_000, 0))
	pair, _ := issuer.IssuePair(1)

	if _, err := issuer.Parse(pair.Refresh, TokenTypeAccess); !errors.Is(err, ErrInvalidToken) {
		t.Fatalf("a refresh token must not work as an access token, got %v", err)
	}
}

func TestParseRejectsExpiredToken(t *testing.T) {
	issued := time.Unix(1_800_000_000, 0)
	issuer := testIssuer(issued)
	pair, _ := issuer.IssuePair(1)

	later := testIssuer(issued.Add(25 * time.Hour))
	if _, err := later.Parse(pair.Access, TokenTypeAccess); !errors.Is(err, ErrInvalidToken) {
		t.Fatalf("expected expired token to be rejected, got %v", err)
	}
}

func TestParseRejectsTokenSignedWithAnotherKey(t *testing.T) {
	now := time.Unix(1_800_000_000, 0)
	pair, _ := testIssuer(now).IssuePair(1)

	other := testIssuer(now)
	other.SigningKey = []byte("a-different-key")
	if _, err := other.Parse(pair.Access, TokenTypeAccess); !errors.Is(err, ErrInvalidToken) {
		t.Fatalf("expected bad signature to be rejected, got %v", err)
	}
}
