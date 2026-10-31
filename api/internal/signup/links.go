// Package signup creates accounts, verifies email addresses and resets
// passwords. Links sent by email are signed by this service.
package signup

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"
)

// Purpose says what a signed link may be used for.
type Purpose string

const (
	Activate Purpose = "activate"
	Reset    Purpose = "reset"
	// Invite lets someone a school invited choose their first password.
	Invite Purpose = "invite"

	activateTTL = 7 * 24 * time.Hour
	resetTTL    = 2 * time.Hour
	inviteTTL   = 7 * 24 * time.Hour
)

var ttl = map[Purpose]time.Duration{Activate: activateTTL, Reset: resetTTL, Invite: inviteTTL}

var ErrBadLink = errors.New("invalid or expired link")

// Account is what a link is bound to. Changing the password or verifying
// the email changes the fingerprint, so a link works once.
type Account struct {
	ID            int64
	Email         string
	FullName      string
	Password      string
	EmailVerified bool
	IsActive      bool
}

func (a Account) fingerprint() string {
	return a.Password + "|" + strconv.FormatBool(a.EmailVerified)
}

// Signer makes and checks links with an HMAC key.
type Signer struct {
	Key []byte
}

// Make returns a token for acct that expires after the purpose's lifetime.
// The token reads "<purpose>.<id>.<expiry>.<signature>".
func (s Signer) Make(p Purpose, acct Account, now time.Time) string {
	body := fmt.Sprintf("%s.%d.%d", p, acct.ID, now.Add(ttl[p]).Unix())
	return body + "." + s.sign(body, acct)
}

// Read returns the account id in a token without checking it, so the caller
// can load the account and then Check.
func (s Signer) Read(token string, p Purpose) (int64, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 4 || Purpose(parts[0]) != p {
		return 0, ErrBadLink
	}
	id, err := strconv.ParseInt(parts[1], 10, 64)
	if err != nil || id <= 0 {
		return 0, ErrBadLink
	}
	return id, nil
}

// Check verifies the token's purpose, account, expiry and signature.
func (s Signer) Check(token string, p Purpose, acct Account, now time.Time) error {
	id, err := s.Read(token, p)
	if err != nil || id != acct.ID {
		return ErrBadLink
	}
	parts := strings.Split(token, ".")
	expiry, err := strconv.ParseInt(parts[2], 10, 64)
	if err != nil || now.Unix() > expiry {
		return ErrBadLink
	}
	body := strings.Join(parts[:3], ".")
	if !hmac.Equal([]byte(parts[3]), []byte(s.sign(body, acct))) {
		return ErrBadLink
	}
	return nil
}

func (s Signer) sign(body string, acct Account) string {
	mac := hmac.New(sha256.New, s.Key)
	mac.Write([]byte("maple-signup|" + body + "|" + acct.fingerprint()))
	return base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}
