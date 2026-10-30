package finance

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/testkit"
)

const secret = "test-webhook-secret-of-enough-length"

type school struct {
	w                                   *testkit.World
	id, head, teacher, student, other   int64
	parent, outsiderParent, class, term int64
	router                              http.Handler
}

func newSchool(t *testing.T) school {
	w := testkit.New(t)
	s := school{w: w, id: w.School("Fees School")}
	s.head = w.Person("teacher", "headteacher", s.id)
	s.teacher = w.Person("teacher", "subject_teacher", s.id)
	s.student = w.Person("student", "student", s.id)
	s.other = w.Person("student", "student", s.id)
	s.parent = w.Person("parent", "", 0)
	s.outsiderParent = w.Person("parent", "", 0)
	s.class = w.Class(s.id, s.teacher)
	s.term = w.Term(s.id)
	w.Enrol(s.class, s.student)
	w.Enrol(s.class, s.other)
	w.LinkParent(s.parent, s.student, "approved")

	r := chi.NewRouter()
	NewHandler(NewPostgresStore(w.Pool), w.Auth.RequireUser, Payments{
		WebhookSecret: []byte(secret),
		Providers:     map[string]Provider{"mtn_momo": Sandbox{}, "airtel_money": Sandbox{}, "card": Sandbox{}},
	}).Mount(r)
	w.Router = r
	s.router = r

	// Ledger rows are immutable; tests purge them explicitly before the
	// testkit removes the school and people.
	t.Cleanup(func() {
		ctx := context.Background()
		school := strconv.FormatInt(s.id, 10)
		_ = pgx.BeginFunc(ctx, w.Pool, func(tx pgx.Tx) error {
			for _, q := range []string{
				`SET LOCAL maple.ledger_purge = 'on'`,
				`DELETE FROM fin_payments WHERE school_id = ` + school,
				`DELETE FROM fin_invoice_lines WHERE invoice_id IN (SELECT id FROM fin_invoices WHERE school_id = ` + school + `)`,
				`DELETE FROM fin_invoices WHERE school_id = ` + school,
				`DELETE FROM fin_fee_items WHERE school_id = ` + school,
				`DELETE FROM fin_entries WHERE journal_id IN (SELECT id FROM fin_journals WHERE school_id = ` + school + `)`,
				`DELETE FROM fin_journals WHERE school_id = ` + school,
				`DELETE FROM fin_accounts WHERE school_id = ` + school,
			} {
				if _, err := tx.Exec(ctx, q); err != nil {
					return err
				}
			}
			return nil
		})
	})
	return s
}

func itoa(n int64) string { return strconv.FormatInt(n, 10) }

// billed sets up two fee items and invoices the class for the term.
func (s school) billed(t *testing.T) (invoice int64) {
	t.Helper()
	var items []int64
	for _, f := range []map[string]any{
		{"name": "Tuition", "amount_minor": 500000, "currency": "UGX", "term": s.term},
		{"name": "Lunch", "amount_minor": 150000, "currency": "UGX", "term": s.term},
	} {
		f["school"] = s.id
		code, res := s.w.Call(s.head, http.MethodPost, "/api/v1/finance/fee-items/", f)
		if code != http.StatusCreated {
			t.Fatalf("fee item: %d %v", code, res)
		}
		items = append(items, testkit.ID(res))
	}
	code, res := s.w.Call(s.head, http.MethodPost, "/api/v1/finance/invoices/generate/", map[string]any{
		"class": s.class, "term": s.term, "fee_items": items, "due_date": "2026-12-01",
	})
	if code != http.StatusCreated || res["created"] != float64(2) {
		t.Fatalf("generate: %d %v", code, res)
	}
	_, page := s.w.Call(s.parent, http.MethodGet, "/api/v1/finance/invoices/", nil)
	ids := testkit.IDs(page)
	if len(ids) != 1 {
		t.Fatalf("the parent sees their child's one invoice: %v", page)
	}
	return ids[0]
}

func (s school) balance(t *testing.T, user, student int64) float64 {
	t.Helper()
	code, st := s.w.Call(user, http.MethodGet, "/api/v1/finance/students/"+itoa(student)+"/statement/?school="+itoa(s.id), nil)
	if code != http.StatusOK {
		t.Fatalf("statement: %d %v", code, st)
	}
	return st["balance_minor"].(float64)
}

func (s school) webhook(body map[string]any, sign bool) int {
	raw, _ := json.Marshal(body)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/finance/webhooks/sandbox/", bytes.NewReader(raw))
	req.Header.Set("Content-Type", "application/json")
	if sign {
		mac := hmac.New(sha256.New, []byte(secret))
		mac.Write(raw)
		req.Header.Set("X-Maple-Signature", "sha256="+hex.EncodeToString(mac.Sum(nil)))
	} else {
		req.Header.Set("X-Maple-Signature", "sha256=00")
	}
	rec := httptest.NewRecorder()
	s.router.ServeHTTP(rec, req)
	return rec.Code
}

func TestFeesInvoicesAndWhoSeesThem(t *testing.T) {
	s := newSchool(t)
	refused := []struct {
		name string
		user int64
		body map[string]any
		want int
	}{
		{"a teacher", s.teacher, map[string]any{"school": s.id, "name": "Tuition", "amount_minor": 1000, "currency": "UGX"}, http.StatusForbidden},
		{"a parent", s.parent, map[string]any{"school": s.id, "name": "Tuition", "amount_minor": 1000, "currency": "UGX"}, http.StatusForbidden},
		{"no amount", s.head, map[string]any{"school": s.id, "name": "Tuition", "amount_minor": 0, "currency": "UGX"}, http.StatusBadRequest},
		{"bad currency", s.head, map[string]any{"school": s.id, "name": "Tuition", "amount_minor": 1000, "currency": "shillings"}, http.StatusBadRequest},
	}
	for _, r := range refused {
		if code, res := s.w.Call(r.user, http.MethodPost, "/api/v1/finance/fee-items/", r.body); code != r.want {
			t.Errorf("%s: want %d, got %d %v", r.name, r.want, code, res)
		}
	}

	invoice := s.billed(t)
	_, inv := s.w.Call(s.parent, http.MethodGet, "/api/v1/finance/invoices/"+itoa(invoice)+"/", nil)
	if inv["total_minor"] != float64(650000) || inv["status"] != "issued" || len(inv["lines"].([]any)) != 2 {
		t.Errorf("invoice detail: %v", inv)
	}
	if code, _ := s.w.Call(s.outsiderParent, http.MethodGet, "/api/v1/finance/invoices/"+itoa(invoice)+"/", nil); code != http.StatusNotFound {
		t.Errorf("another family can't see the invoice: %d", code)
	}
	if code, _ := s.w.Call(s.outsiderParent, http.MethodGet, "/api/v1/finance/students/"+itoa(s.student)+"/statement/?school="+itoa(s.id), nil); code != http.StatusNotFound {
		t.Errorf("or the statement: %d", code)
	}
	if got := s.balance(t, s.student, s.student); got != 650000 {
		t.Errorf("the student owes 650000, statement says %v", got)
	}

	code, again := s.w.Call(s.head, http.MethodPost, "/api/v1/finance/invoices/generate/", map[string]any{"class": s.class, "term": s.term, "fee_items": []int64{}})
	if code != http.StatusBadRequest {
		t.Errorf("generating needs fee items: %d %v", code, again)
	}
	_, items := s.w.Call(s.head, http.MethodGet, "/api/v1/finance/fee-items/?school="+itoa(s.id), nil)
	code, again = s.w.Call(s.head, http.MethodPost, "/api/v1/finance/invoices/generate/", map[string]any{"class": s.class, "term": s.term, "fee_items": testkit.IDs(items)})
	if code != http.StatusCreated || again["created"] != float64(0) || again["skipped"] != float64(2) {
		t.Errorf("generating twice for a term doesn't bill twice: %d %v", code, again)
	}
}

func TestCashPaymentsAreIdempotent(t *testing.T) {
	s := newSchool(t)
	invoice := s.billed(t)
	pay := func(key string) (int, map[string]any) {
		return s.w.CallWithHeaders(s.head, http.MethodPost, "/api/v1/finance/payments/", map[string]any{
			"invoice": invoice, "amount_minor": 200000, "method": "cash",
		}, map[string]string{"Idempotency-Key": key})
	}
	code, first := pay("cash-001")
	if code != http.StatusCreated || first["status"] != "successful" || !strings.HasPrefix(first["receipt_number"].(string), "RCT-") {
		t.Fatalf("cash payment: %d %v", code, first)
	}
	code, again := pay("cash-001")
	if code != http.StatusOK || testkit.ID(again) != testkit.ID(first) {
		t.Errorf("the same key returns the same payment: %d %v", code, again)
	}
	if got := s.balance(t, s.head, s.student); got != 450000 {
		t.Errorf("one payment posted, balance should be 450000: %v", got)
	}
	_, inv := s.w.Call(s.head, http.MethodGet, "/api/v1/finance/invoices/"+itoa(invoice)+"/", nil)
	if inv["status"] != "partially_paid" || inv["paid_minor"] != float64(200000) {
		t.Errorf("invoice after part payment: %v", inv)
	}
	if code, _ := s.w.CallWithHeaders(s.parent, http.MethodPost, "/api/v1/finance/payments/", map[string]any{"invoice": invoice, "amount_minor": 1, "method": "cash"}, map[string]string{"Idempotency-Key": "x"}); code != http.StatusForbidden {
		t.Errorf("parents can't record cash: %d", code)
	}
	if code, _ := s.w.Call(s.head, http.MethodPost, "/api/v1/finance/payments/", map[string]any{"invoice": invoice, "amount_minor": 1, "method": "cash"}); code != http.StatusBadRequest {
		t.Errorf("recording money needs an Idempotency-Key: %d", code)
	}
}

func TestMobileMoneyCheckoutAndWebhook(t *testing.T) {
	s := newSchool(t)
	invoice := s.billed(t)
	code, pending := s.w.CallWithHeaders(s.parent, http.MethodPost, "/api/v1/finance/payments/checkout/", map[string]any{
		"invoice": invoice, "amount_minor": 650000, "method": "mtn_momo", "phone": "+256772000111",
	}, map[string]string{"Idempotency-Key": "momo-1"})
	if code != http.StatusAccepted || pending["status"] != "pending" || pending["provider_reference"] == "" {
		t.Fatalf("checkout: %d %v", code, pending)
	}
	ref := pending["provider_reference"].(string)
	if code, _ := s.w.CallWithHeaders(s.outsiderParent, http.MethodPost, "/api/v1/finance/payments/checkout/", map[string]any{"invoice": invoice, "amount_minor": 1000, "method": "mtn_momo", "phone": "+256772000999"}, map[string]string{"Idempotency-Key": "momo-x"}); code != http.StatusNotFound {
		t.Errorf("another family can't pay this invoice: %d", code)
	}

	if code := s.webhook(map[string]any{"reference": ref, "status": "successful", "amount_minor": 650000, "currency": "UGX"}, false); code != http.StatusUnauthorized {
		t.Errorf("a forged webhook is refused: %d", code)
	}
	if code := s.webhook(map[string]any{"reference": ref, "status": "successful", "amount_minor": 1, "currency": "UGX"}, true); code != http.StatusConflict {
		t.Errorf("a confirmation for the wrong amount is refused: %d", code)
	}
	if got := s.balance(t, s.parent, s.student); got != 650000 {
		t.Errorf("nothing posted yet: %v", got)
	}
	for range 2 { // providers retry; the second delivery changes nothing
		if code := s.webhook(map[string]any{"reference": ref, "status": "successful", "amount_minor": 650000, "currency": "UGX"}, true); code != http.StatusOK {
			t.Fatalf("confirm: %d", code)
		}
	}
	if got := s.balance(t, s.parent, s.student); got != 0 {
		t.Errorf("paid in full exactly once: balance %v", got)
	}
	_, done := s.w.Call(s.parent, http.MethodGet, "/api/v1/finance/payments/"+itoa(testkit.ID(pending))+"/", nil)
	if done["status"] != "successful" || done["receipt_number"] == nil {
		t.Errorf("the parent gets a receipt: %v", done)
	}
	_, inv := s.w.Call(s.parent, http.MethodGet, "/api/v1/finance/invoices/"+itoa(invoice)+"/", nil)
	if inv["status"] != "paid" {
		t.Errorf("invoice is paid: %v", inv)
	}
}

func TestLedgerGuarantees(t *testing.T) {
	s := newSchool(t)
	invoice := s.billed(t)
	ctx := context.Background()
	if _, err := s.w.Pool.Exec(ctx, `UPDATE fin_entries SET debit_minor = 1 WHERE journal_id IN (SELECT id FROM fin_journals WHERE school_id = $1)`, s.id); err == nil {
		t.Errorf("posted entries can't be edited")
	}
	err := pgx.BeginFunc(ctx, s.w.Pool, func(tx pgx.Tx) error {
		var journal, account int64
		if err := tx.QueryRow(ctx, `INSERT INTO fin_journals (school_id, kind) VALUES ($1, 'adjustment') RETURNING id`, s.id).Scan(&journal); err != nil {
			return err
		}
		if err := tx.QueryRow(ctx, `SELECT id FROM fin_accounts WHERE school_id = $1 AND code = '1000'`, s.id).Scan(&account); err != nil {
			return err
		}
		_, err := tx.Exec(ctx, `INSERT INTO fin_entries (journal_id, account_id, currency, debit_minor) VALUES ($1, $2, 'UGX', 100)`, journal, account)
		return err
	})
	if err == nil || !strings.Contains(err.Error(), "does not balance") {
		t.Errorf("an unbalanced journal fails at commit: %v", err)
	}

	if code, _ := s.w.CallWithHeaders(s.head, http.MethodPost, "/api/v1/finance/payments/", map[string]any{"invoice": invoice, "amount_minor": 1000, "method": "bank"}, map[string]string{"Idempotency-Key": "bank-1"}); code != http.StatusCreated {
		t.Fatalf("bank payment: %d", code)
	}
	if code, _ := s.w.Call(s.head, http.MethodPost, "/api/v1/finance/invoices/"+itoa(invoice)+"/void/", nil); code != http.StatusConflict {
		t.Errorf("an invoice with payments can't be voided: %d", code)
	}
	_, page := s.w.Call(s.head, http.MethodGet, "/api/v1/finance/invoices/?student="+itoa(s.other), nil)
	otherInvoice := testkit.IDs(page)[0]
	if code, res := s.w.Call(s.head, http.MethodPost, "/api/v1/finance/invoices/"+itoa(otherInvoice)+"/void/", nil); code != http.StatusOK || res["status"] != "void" {
		t.Errorf("void: %d %v", code, res)
	}
	if got := s.balance(t, s.head, s.other); got != 0 {
		t.Errorf("voiding posts a reversal, so the balance returns to 0: %v", got)
	}

	_, sum := s.w.Call(s.head, http.MethodGet, "/api/v1/finance/summary/?school="+itoa(s.id), nil)
	if sum["billed_minor"] != float64(650000) || sum["collected_minor"] != float64(1000) || sum["outstanding_minor"] != float64(649000) {
		t.Errorf("summary: %v", sum)
	}
	req := httptest.NewRequest(http.MethodGet, "/api/v1/finance/export.csv?school="+itoa(s.id), nil)
	code, body := s.w.Raw(s.head, req)
	if code != http.StatusOK || !strings.HasPrefix(body, "journal,date,kind,reference,memo,account_code,account_name,student,currency,debit,credit") || strings.Count(body, "\n") < 6 {
		t.Errorf("export: %d %q", code, body)
	}
	if code, _ := s.w.Call(s.teacher, http.MethodGet, "/api/v1/finance/summary/?school="+itoa(s.id), nil); code != http.StatusForbidden {
		t.Errorf("teachers don't see school finances: %d", code)
	}
}
