// Package finance is school finance, Tier 1 (playbook section 11A): fee
// items, invoices, payments (cash, bank, mobile money, card) and receipts,
// all posted to an immutable double-entry ledger.
package finance

import (
	"errors"
	"regexp"
	"slices"
	"time"
)

var (
	ErrNotFound    = errors.New("not found")
	ErrHasPayments = errors.New("invoice has payments")
	ErrMismatch    = errors.New("confirmation doesn't match the payment")
)

// Ledger account codes (see EnsureSchoolAccounts).
const (
	acctCash       = "1000"
	acctBank       = "1010"
	acctMobile     = "1020"
	acctCard       = "1030"
	acctReceivable = "1100"
	acctFeeIncome  = "4000"
)

const (
	defaultCurrency = "UGX"
	maxName         = 200
	maxAmountMinor  = 1_000_000_000_000 // a trillion minor units is far beyond any school fee
	statusPending   = "pending"
	statusSucceeded = "successful"
	statusFailed    = "failed"
)

var (
	staffMethods    = []string{"cash", "bank"}
	providerMethods = []string{"mtn_momo", "airtel_money", "card"}
	currencyCode    = regexp.MustCompile(`^[A-Z]{3}$`)
	phoneNumber     = regexp.MustCompile(`^\+?[0-9]{9,15}$`)
)

// accountFor is where money received by a method lands.
func accountFor(method string) string {
	switch method {
	case "cash":
		return acctCash
	case "bank":
		return acctBank
	case "card":
		return acctCard
	}
	return acctMobile
}

type FeeItem struct {
	ID          int64     `json:"id"`
	School      int64     `json:"school"`
	Name        string    `json:"name"`
	AmountMinor int64     `json:"amount_minor"`
	Currency    string    `json:"currency"`
	Term        *int64    `json:"term"`
	ClassLevel  *int64    `json:"class_level"`
	CreatedAt   time.Time `json:"created_at"`
}

type Line struct {
	ID          int64  `json:"id"`
	FeeItem     *int64 `json:"fee_item"`
	Description string `json:"description"`
	AmountMinor int64  `json:"amount_minor"`
}

type Invoice struct {
	ID           int64      `json:"id"`
	School       int64      `json:"school"`
	Student      int64      `json:"student"`
	StudentName  string     `json:"student_name"`
	Term         *int64     `json:"term"`
	Class        *int64     `json:"class"`
	Number       string     `json:"number"`
	Currency     string     `json:"currency"`
	TotalMinor   int64      `json:"total_minor"`
	PaidMinor    int64      `json:"paid_minor"`
	BalanceMinor int64      `json:"balance_minor"`
	Status       string     `json:"status"`
	DueDate      *string    `json:"due_date"`
	CreatedAt    time.Time  `json:"created_at"`
	VoidedAt     *time.Time `json:"voided_at"`
	Lines        []Line     `json:"lines"`
}

type Payment struct {
	ID                int64      `json:"id"`
	School            int64      `json:"school"`
	SchoolName        string     `json:"school_name"`
	Student           int64      `json:"student"`
	StudentName       string     `json:"student_name"`
	Invoice           *int64     `json:"invoice"`
	InvoiceNumber     string     `json:"invoice_number"`
	AmountMinor       int64      `json:"amount_minor"`
	Currency          string     `json:"currency"`
	Method            string     `json:"method"`
	Status            string     `json:"status"`
	PayerPhone        string     `json:"payer_phone"`
	Provider          string     `json:"provider"`
	ProviderReference string     `json:"provider_reference"`
	FailureReason     string     `json:"failure_reason"`
	ReceiptNumber     *string    `json:"receipt_number"`
	CreatedAt         time.Time  `json:"created_at"`
	CompletedAt       *time.Time `json:"completed_at"`
}

type StatementLine struct {
	Date         time.Time `json:"date"`
	Kind         string    `json:"kind"`
	Reference    string    `json:"reference"`
	Memo         string    `json:"memo"`
	Currency     string    `json:"currency"`
	DebitMinor   int64     `json:"debit_minor"`
	CreditMinor  int64     `json:"credit_minor"`
	BalanceMinor int64     `json:"balance_minor"`
}

type Statement struct {
	School       int64           `json:"school"`
	Student      int64           `json:"student"`
	BalanceMinor int64           `json:"balance_minor"`
	Lines        []StatementLine `json:"lines"`
}

type Summary struct {
	School           int64  `json:"school"`
	Currency         string `json:"currency"`
	BilledMinor      int64  `json:"billed_minor"`
	CollectedMinor   int64  `json:"collected_minor"`
	OutstandingMinor int64  `json:"outstanding_minor"`
	PendingPayments  int64  `json:"pending_payments"`
}

// Viewer is the signed-in person: the schools whose fees they run, and the
// learners whose fees they may see (themselves, or a parent's children).
type Viewer struct {
	UserID   int64
	Finance  []int64
	Learners []int64
}

func (v Viewer) runs(school int64) bool { return slices.Contains(v.Finance, school) }

// sees reports whether the viewer may see a student's fees at a school.
func (v Viewer) sees(school, student int64) bool {
	return v.runs(school) || slices.Contains(v.Learners, student)
}

func validAmount(n int64) bool { return n > 0 && n <= maxAmountMinor }
