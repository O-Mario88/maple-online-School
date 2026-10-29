package identity

import (
	"crypto/pbkdf2"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"sync"
)

// Passwords use Django's "pbkdf2_sha256$<iterations>$<salt>$<hash>" format so
// that accounts created by Django keep working, and so Django can still check
// passwords Go writes while both backends run side by side.

const (
	djangoAlgorithm = "pbkdf2_sha256"
	// Matches Django 4.2's default work factor.
	defaultIterations = 600_000
	minIterations     = 1_000
	saltLength        = 16
	saltAlphabet      = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
)

var errMalformedHash = errors.New("malformed password hash")

// hashIterations is the work factor for new hashes. Tests lower it to stay fast.
var hashIterations = defaultIterations

var (
	dummyOnce sync.Once
	dummy     string
)

// dummyHash is checked when an email is unknown, so a wrong email takes as
// long as a wrong password and doesn't reveal which accounts exist.
func dummyHash() string {
	dummyOnce.Do(func() {
		h, err := HashPassword("maple-unknown-account")
		if err != nil {
			h = djangoAlgorithm + "$1000$x$AAAA" // still fails closed in CheckPassword
		}
		dummy = h
	})
	return dummy
}

// CheckPassword reports whether password matches a Django-format hash.
func CheckPassword(password, encoded string) (bool, error) {
	parts := strings.Split(encoded, "$")
	if len(parts) != 4 || parts[0] != djangoAlgorithm {
		return false, errMalformedHash
	}
	iterations, err := strconv.Atoi(parts[1])
	if err != nil || iterations < minIterations {
		return false, errMalformedHash
	}
	want, err := base64.StdEncoding.DecodeString(parts[3])
	if err != nil || len(want) == 0 {
		return false, errMalformedHash
	}
	got, err := derive(password, parts[2], iterations, len(want))
	if err != nil {
		return false, err
	}
	return subtle.ConstantTimeCompare(got, want) == 1, nil
}

// HashPassword returns a new Django-format hash for password.
func HashPassword(password string) (string, error) {
	salt, err := randomSalt()
	if err != nil {
		return "", err
	}
	key, err := derive(password, salt, hashIterations, sha256.Size)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%s$%d$%s$%s", djangoAlgorithm, hashIterations, salt,
		base64.StdEncoding.EncodeToString(key)), nil
}

func derive(password, salt string, iterations, keyLen int) ([]byte, error) {
	key, err := pbkdf2.Key(sha256.New, password, []byte(salt), iterations, keyLen)
	if err != nil {
		return nil, fmt.Errorf("derive password key: %w", err)
	}
	return key, nil
}

func randomSalt() (string, error) {
	raw := make([]byte, saltLength)
	if _, err := rand.Read(raw); err != nil {
		return "", fmt.Errorf("generate salt: %w", err)
	}
	out := make([]byte, saltLength)
	for i, b := range raw {
		out[i] = saltAlphabet[int(b)%len(saltAlphabet)]
	}
	return string(out), nil
}
