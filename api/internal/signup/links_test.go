package signup

import (
	"strings"
	"testing"
	"time"
)

func TestSignedLinks(t *testing.T) {
	s := Signer{Key: []byte(strings.Repeat("k", 32))}
	now := time.Date(2026, 11, 2, 9, 0, 0, 0, time.UTC)
	acct := Account{ID: 42, Password: "pbkdf2_sha256$1$salt$hash", EmailVerified: false}
	token := s.Make(Activate, acct, now)

	if id, err := s.Read(token, Activate); err != nil || id != 42 {
		t.Fatalf("read: %d %v", id, err)
	}
	if err := s.Check(token, Activate, acct, now.Add(time.Hour)); err != nil {
		t.Errorf("a fresh link works: %v", err)
	}
	cases := []struct {
		name  string
		token string
		use   Purpose
		acct  Account
		at    time.Time
	}{
		{"expired", token, Activate, acct, now.Add(activateTTL + time.Minute)},
		{"used for something else", token, Reset, acct, now},
		{"already used (email now verified)", token, Activate, Account{ID: 42, Password: acct.Password, EmailVerified: true}, now},
		{"password changed since", token, Activate, Account{ID: 42, Password: "other", EmailVerified: false}, now},
		{"tampered", strings.Replace(token, "4", "5", 1), Activate, acct, now},
		{"garbage", "not-a-token", Activate, acct, now},
	}
	for _, c := range cases {
		if err := s.Check(c.token, c.use, c.acct, c.at); err == nil {
			t.Errorf("%s: should be refused", c.name)
		}
	}
	other := Signer{Key: []byte(strings.Repeat("x", 32))}
	if err := other.Check(token, Activate, acct, now); err == nil {
		t.Errorf("a link signed with another key is refused")
	}
}

func TestPasswordRules(t *testing.T) {
	cases := []struct {
		password, email string
		ok              bool
	}{
		{"short1!", "a@b.test", false},
		{"12345678901", "a@b.test", false},
		{"password123", "a@b.test", false},
		{"amina.okello", "amina.okello@school.test", false},
		{"Kampala-Rains-2026", "amina@school.test", true},
	}
	for _, c := range cases {
		if got := passwordProblem(c.password, c.email) == ""; got != c.ok {
			t.Errorf("%q for %s: ok=%v, want %v (%s)", c.password, c.email, got, c.ok, passwordProblem(c.password, c.email))
		}
	}
}
