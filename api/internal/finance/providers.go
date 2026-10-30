package finance

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"
)

// Charge asks a provider to collect money, for example a mobile money
// prompt on the payer's phone.
type Charge struct {
	PaymentID   int64
	AmountMinor int64
	Currency    string
	Phone       string
	Method      string
}

// Provider collects money and later confirms it through a signed webhook.
type Provider interface {
	// Name identifies the provider in webhook paths and payment records.
	Name() string
	// Charge starts a collection and returns the provider's reference.
	Charge(ctx context.Context, c Charge) (string, error)
}

// Payments configures money collection. Providers maps a payment method
// (mtn_momo, airtel_money, card) to whoever collects it; a method with no
// provider is refused rather than faked.
type Payments struct {
	WebhookSecret []byte
	Providers     map[string]Provider
}

// Sandbox is a provider for development and tests: it never moves money,
// and payments only complete when a correctly signed webhook confirms them.
type Sandbox struct{}

func (Sandbox) Name() string { return "sandbox" }

func (Sandbox) Charge(_ context.Context, _ Charge) (string, error) {
	b := make([]byte, 12)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("sandbox reference: %w", err)
	}
	return "sbx_" + hex.EncodeToString(b), nil
}

// signatureHeader carries "sha256=<hex HMAC of the raw body>".
const signatureHeader = "X-Maple-Signature"

// validSignature checks a webhook body against its signature in constant time.
func validSignature(secret, body []byte, header string) bool {
	if len(secret) == 0 {
		return false
	}
	got, ok := strings.CutPrefix(header, "sha256=")
	if !ok {
		return false
	}
	mac := hmac.New(sha256.New, secret)
	mac.Write(body)
	return hmac.Equal([]byte(got), []byte(hex.EncodeToString(mac.Sum(nil))))
}
