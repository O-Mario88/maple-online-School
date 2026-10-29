package identity

import (
	"os"
	"testing"
)

// TestMain lowers the hashing work factor so the suite runs in seconds.
// TestHashPasswordUsesDjangoDefaultWorkFactor covers the production value.
func TestMain(m *testing.M) {
	hashIterations = minIterations
	os.Exit(m.Run())
}

func TestHashPasswordUsesDjangoDefaultWorkFactor(t *testing.T) {
	if defaultIterations != 600_000 {
		t.Fatalf("new hashes must match Django 4.2's 600000 iterations, got %d", defaultIterations)
	}
}

// Hash produced by Django's PBKDF2PasswordHasher for "correct horse battery"
// with salt "fixedsalt123" and 1000 iterations.
const djangoHash = "pbkdf2_sha256$1000$fixedsalt123$YbusbZu8NpGqRFJAQDmlZLfWEDrLPIZul0i4KoCxvqk="

func TestCheckPasswordAcceptsDjangoHash(t *testing.T) {
	ok, err := CheckPassword("correct horse battery", djangoHash)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !ok {
		t.Fatal("expected the Django hash to match the right password")
	}
}

func TestCheckPasswordRejectsWrongPassword(t *testing.T) {
	ok, err := CheckPassword("wrong password", djangoHash)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if ok {
		t.Fatal("expected a wrong password to be rejected")
	}
}

func TestCheckPasswordRejectsMalformedHashes(t *testing.T) {
	cases := map[string]string{
		"empty":             "",
		"unusable password": "!",
		"unsupported algo":  "md5$salt$abc",
		"bad iterations":    "pbkdf2_sha256$x$salt$h",
		"too few rounds":    "pbkdf2_sha256$0$salt$h",
		"bad base64":        "pbkdf2_sha256$1000$salt$not-base64!!",
	}
	for name, encoded := range cases {
		t.Run(name, func(t *testing.T) {
			ok, err := CheckPassword("anything", encoded)
			if ok {
				t.Errorf("expected no match")
			}
			if err == nil {
				t.Errorf("expected an error")
			}
		})
	}
}

func TestHashPasswordRoundTripsInDjangoFormat(t *testing.T) {
	encoded, err := HashPassword("PilotPass!")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	ok, err := CheckPassword("PilotPass!", encoded)
	if err != nil || !ok {
		t.Fatalf("expected round trip to match, got ok=%v err=%v", ok, err)
	}
	if encoded[:14] != "pbkdf2_sha256$" {
		t.Fatalf("expected Django-compatible format, got %q", encoded)
	}
}
