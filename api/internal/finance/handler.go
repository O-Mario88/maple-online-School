package finance

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/httpx"
	"github.com/O-Mario88/maple-online-School/api/internal/identity"
	"github.com/O-Mario88/maple-online-School/api/internal/platform/dbgen"
)

const (
	prefix          = "/api/v1/finance/"
	maxWebhookBytes = 64 << 10
	maxIdemKey      = 100
	webhookLimit    = 120
	webhookWindow   = time.Minute
)

// Store is what the handler needs from the database.
type Store interface {
	Viewer(ctx context.Context, userID int64, role string) (Viewer, error)
	CreateFeeItem(ctx context.Context, f FeeItem) (FeeItem, error)
	FeeItems(ctx context.Context, schools []int64) ([]FeeItem, error)
	FeeItemsByID(ctx context.Context, ids []int64) ([]FeeItem, error)
	ClassSchool(ctx context.Context, classID int64) (int64, error)
	GenerateInvoices(ctx context.Context, g Generate) (created, skipped int, err error)
	Invoices(ctx context.Context, v Viewer, student *int64, status *string, page httpx.Page) ([]Invoice, int64, error)
	Invoice(ctx context.Context, id int64) (Invoice, error)
	VoidInvoice(ctx context.Context, inv Invoice, by int64) error
	RecordPayment(ctx context.Context, p NewPayment) (int64, bool, error)
	SetProviderReference(ctx context.Context, paymentID int64, ref string) error
	FailPayment(ctx context.Context, paymentID int64, reason string) error
	Confirm(ctx context.Context, provider, ref string, succeeded bool, amount int64, currency, reason string) error
	Payment(ctx context.Context, id int64) (Payment, error)
	Statement(ctx context.Context, school, student int64) (Statement, error)
	Summary(ctx context.Context, school int64, currency string) (Summary, error)
	Export(ctx context.Context, school int64) ([]dbgen.JournalExportRow, error)
}

// Handler serves school finance.
type Handler struct {
	store       Store
	requireUser func(http.Handler) http.Handler
	payments    Payments
}

func NewHandler(store Store, requireUser func(http.Handler) http.Handler, payments Payments) *Handler {
	return &Handler{store: store, requireUser: requireUser, payments: payments}
}

// Mount registers the routes. Provider webhooks are public but must carry a
// valid signature; everything else needs a signed-in user.
func (h *Handler) Mount(r chi.Router) {
	r.With(httpx.RateLimit(webhookLimit, webhookWindow)).Post(prefix+"webhooks/{provider}/", h.webhook)
	r.Group(func(r chi.Router) {
		r.Use(h.requireUser)
		r.Get(prefix+"fee-items/", h.listFeeItems)
		r.Post(prefix+"fee-items/", h.createFeeItem)
		r.Post(prefix+"invoices/generate/", h.generate)
		r.Get(prefix+"invoices/", h.listInvoices)
		r.Get(prefix+"invoices/{id}/", h.getInvoice)
		r.Post(prefix+"invoices/{id}/void/", h.voidInvoice)
		r.Post(prefix+"payments/", h.recordPayment)
		r.Post(prefix+"payments/checkout/", h.checkout)
		r.Get(prefix+"payments/{id}/", h.getPayment)
		r.Get(prefix+"students/{id}/statement/", h.statement)
		r.Get(prefix+"summary/", h.summary)
		r.Get(prefix+"export.csv", h.export)
	})
	r.HandleFunc(prefix+"*", func(w http.ResponseWriter, _ *http.Request) {
		httpx.WriteError(w, http.StatusMethodNotAllowed, "method_not_allowed", "This action isn't available.")
	})
}

func (h *Handler) viewer(w http.ResponseWriter, r *http.Request) (Viewer, bool) {
	user := identity.UserFrom(r.Context())
	v, err := h.store.Viewer(r.Context(), user.ID, user.Role)
	if err != nil {
		serverError(w, "load viewer", err)
		return Viewer{}, false
	}
	return v, true
}

// schoolParam reads ?school= and checks the viewer runs that school's fees.
func (h *Handler) schoolParam(w http.ResponseWriter, r *http.Request, v Viewer) (int64, bool) {
	school, err := strconv.ParseInt(r.URL.Query().Get("school"), 10, 64)
	if err != nil || school <= 0 {
		badRequest(w, "Choose a school (?school=).")
		return 0, false
	}
	if !v.runs(school) {
		forbidden(w, "Only the school's headteacher, deputy or registrar manage its fees.")
		return 0, false
	}
	return school, true
}

// visibleInvoice loads an invoice the viewer may see, writing 404 otherwise.
func (h *Handler) visibleInvoice(w http.ResponseWriter, r *http.Request, v Viewer, invoiceID int64) (Invoice, bool) {
	inv, err := h.store.Invoice(r.Context(), invoiceID)
	if err == nil && !v.sees(inv.School, inv.Student) {
		err = ErrNotFound
	}
	if errors.Is(err, ErrNotFound) {
		notFound(w)
		return Invoice{}, false
	}
	if err != nil {
		serverError(w, "get invoice", err)
		return Invoice{}, false
	}
	return inv, true
}

// ---- fee items and invoices --------------------------------------------------------------

func (h *Handler) listFeeItems(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	school, ok := h.schoolParam(w, r, v)
	if !ok {
		return
	}
	items, err := h.store.FeeItems(r.Context(), []int64{school})
	if err != nil {
		serverError(w, "list fee items", err)
		return
	}
	writeAll(w, items, len(items))
}

func (h *Handler) createFeeItem(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	var in struct {
		School      int64  `json:"school"`
		Name        string `json:"name"`
		AmountMinor int64  `json:"amount_minor"`
		Currency    string `json:"currency"`
		Term        *int64 `json:"term"`
		ClassLevel  *int64 `json:"class_level"`
	}
	if err := httpx.DecodeJSON(r, &in); err != nil {
		badRequest(w, "Send school, name, amount_minor and currency.")
		return
	}
	if !v.runs(in.School) {
		forbidden(w, "Only the school's headteacher, deputy or registrar manage its fees.")
		return
	}
	in.Name = strings.TrimSpace(in.Name)
	in.Currency = strings.ToUpper(strings.TrimSpace(in.Currency))
	if in.Currency == "" {
		in.Currency = defaultCurrency
	}
	switch {
	case in.Name == "" || len(in.Name) > maxName:
		badRequest(w, "Name the fee, for example Tuition.")
		return
	case !validAmount(in.AmountMinor):
		badRequest(w, "amount_minor must be a positive whole number (for UGX, shillings).")
		return
	case !currencyCode.MatchString(in.Currency):
		badRequest(w, "currency must be a three-letter code such as UGX.")
		return
	}
	item, err := h.store.CreateFeeItem(r.Context(), FeeItem{
		School: in.School, Name: in.Name, AmountMinor: in.AmountMinor, Currency: in.Currency, Term: in.Term, ClassLevel: in.ClassLevel,
	})
	if err != nil {
		serverError(w, "create fee item", err)
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, item)
}

func (h *Handler) generate(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	var in struct {
		Class    int64   `json:"class"`
		Term     *int64  `json:"term"`
		FeeItems []int64 `json:"fee_items"`
		DueDate  *string `json:"due_date"`
	}
	if err := httpx.DecodeJSON(r, &in); err != nil || in.Class <= 0 || len(in.FeeItems) == 0 {
		badRequest(w, "Send the class and at least one fee item.")
		return
	}
	school, err := h.store.ClassSchool(r.Context(), in.Class)
	if errors.Is(err, ErrNotFound) {
		badRequest(w, "That class doesn't exist.")
		return
	}
	if err != nil {
		serverError(w, "load class", err)
		return
	}
	if !v.runs(school) {
		forbidden(w, "Only the school's headteacher, deputy or registrar issue invoices.")
		return
	}
	items, msg := h.checkItems(r.Context(), school, in.FeeItems)
	if msg != "" {
		badRequest(w, msg)
		return
	}
	g := Generate{School: school, Class: in.Class, Term: in.Term, Items: items, By: v.UserID}
	if in.DueDate != nil {
		due, err := time.Parse(time.DateOnly, *in.DueDate)
		if err != nil {
			badRequest(w, "due_date must look like 2026-12-01.")
			return
		}
		g.Due = &due
	}
	created, skipped, err := h.store.GenerateInvoices(r.Context(), g)
	if err != nil {
		serverError(w, "generate invoices", err)
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, map[string]any{"created": created, "skipped": skipped})
}

// checkItems loads the fee items and checks they belong to the school and
// share one currency. It returns a message for a 400.
func (h *Handler) checkItems(ctx context.Context, school int64, ids []int64) ([]FeeItem, string) {
	items, err := h.store.FeeItemsByID(ctx, ids)
	if err != nil {
		return nil, "Could not load the fee items."
	}
	if len(items) != len(ids) {
		return nil, "One of those fee items doesn't exist."
	}
	for _, item := range items {
		if item.School != school {
			return nil, "Those fee items belong to another school."
		}
		if item.Currency != items[0].Currency {
			return nil, "An invoice can't mix currencies."
		}
	}
	return items, ""
}

func (h *Handler) listInvoices(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	q := r.URL.Query()
	var status *string
	if s := q.Get("status"); s != "" {
		status = &s
	}
	page := httpx.ParsePage(r)
	invoices, count, err := h.store.Invoices(r.Context(), v, queryID(q.Get("student")), status, page)
	if err != nil {
		serverError(w, "list invoices", err)
		return
	}
	httpx.WritePage(w, r, page, count, invoices)
}

func (h *Handler) getInvoice(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	if inv, ok := h.visibleInvoice(w, r, v, pathID(r)); ok {
		httpx.WriteJSON(w, http.StatusOK, inv)
	}
}

func (h *Handler) voidInvoice(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	inv, ok := h.visibleInvoice(w, r, v, pathID(r))
	if !ok {
		return
	}
	if !v.runs(inv.School) {
		forbidden(w, "Only the school's headteacher, deputy or registrar cancel invoices.")
		return
	}
	err := h.store.VoidInvoice(r.Context(), inv, v.UserID)
	if errors.Is(err, ErrHasPayments) {
		httpx.WriteError(w, http.StatusConflict, "has_payments", "This invoice has payments. Refund or adjust instead of cancelling it.")
		return
	}
	if err != nil {
		serverError(w, "void invoice", err)
		return
	}
	inv, ok = h.visibleInvoice(w, r, v, inv.ID)
	if ok {
		httpx.WriteJSON(w, http.StatusOK, inv)
	}
}

// ---- payments -------------------------------------------------------------------------------

type paymentInput struct {
	Invoice     int64  `json:"invoice"`
	AmountMinor int64  `json:"amount_minor"`
	Method      string `json:"method"`
	Phone       string `json:"phone"`
}

// idempotencyKey reads the required Idempotency-Key header (playbook section 15).
func idempotencyKey(w http.ResponseWriter, r *http.Request) (string, bool) {
	key := strings.TrimSpace(r.Header.Get("Idempotency-Key"))
	if key == "" || len(key) > maxIdemKey {
		badRequest(w, "Send an Idempotency-Key header so a retry can't take the money twice.")
		return "", false
	}
	return key, true
}

// recordPayment is finance staff recording cash or a bank deposit.
func (h *Handler) recordPayment(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	key, ok := idempotencyKey(w, r)
	if !ok {
		return
	}
	var in paymentInput
	if err := httpx.DecodeJSON(r, &in); err != nil || !validAmount(in.AmountMinor) || !slices.Contains(staffMethods, in.Method) {
		badRequest(w, "Send the invoice, amount_minor and a method of cash or bank.")
		return
	}
	inv, ok := h.visibleInvoice(w, r, v, in.Invoice)
	if !ok {
		return
	}
	if !v.runs(inv.School) {
		forbidden(w, "Only the school's headteacher, deputy or registrar record payments.")
		return
	}
	if inv.Status == "void" {
		badRequest(w, "That invoice was cancelled.")
		return
	}
	paymentID, created, err := h.store.RecordPayment(r.Context(), NewPayment{
		Invoice: inv, AmountMinor: in.AmountMinor, Method: in.Method, Status: statusSucceeded, IdempotencyKey: key, By: v.UserID,
	})
	if err != nil {
		serverError(w, "record payment", err)
		return
	}
	status := http.StatusOK
	if created {
		status = http.StatusCreated
	}
	h.respondPayment(w, r, paymentID, status)
}

// checkout starts a mobile money or card payment from a parent, student or
// finance staff. It completes when the provider's signed webhook confirms it.
func (h *Handler) checkout(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	key, ok := idempotencyKey(w, r)
	if !ok {
		return
	}
	var in paymentInput
	if err := httpx.DecodeJSON(r, &in); err != nil || !validAmount(in.AmountMinor) || !slices.Contains(providerMethods, in.Method) {
		badRequest(w, "Send the invoice, amount_minor and a method of mtn_momo, airtel_money or card.")
		return
	}
	in.Phone = strings.ReplaceAll(strings.TrimSpace(in.Phone), " ", "")
	if in.Method != "card" && !phoneNumber.MatchString(in.Phone) {
		badRequest(w, "Enter the mobile money number, for example +256772000111.")
		return
	}
	inv, ok := h.visibleInvoice(w, r, v, in.Invoice)
	if !ok {
		return
	}
	if inv.Status == "void" || inv.Status == "paid" || in.AmountMinor > inv.BalanceMinor {
		badRequest(w, "Pay up to the invoice's balance.")
		return
	}
	provider, ok := h.payments.Providers[in.Method]
	if !ok {
		httpx.WriteError(w, http.StatusServiceUnavailable, "not_configured", "This payment method isn't connected yet. Pay at the school or try another method.")
		return
	}
	paymentID, created, err := h.store.RecordPayment(r.Context(), NewPayment{
		Invoice: inv, AmountMinor: in.AmountMinor, Method: in.Method, Status: statusPending, Phone: in.Phone,
		Provider: provider.Name(), IdempotencyKey: key, By: v.UserID,
	})
	if err != nil {
		serverError(w, "start payment", err)
		return
	}
	if created {
		ref, err := provider.Charge(r.Context(), Charge{PaymentID: paymentID, AmountMinor: in.AmountMinor, Currency: inv.Currency, Phone: in.Phone, Method: in.Method})
		if err == nil {
			err = h.store.SetProviderReference(r.Context(), paymentID, ref)
		}
		if err != nil {
			slog.Error("finance: charge", "payment", paymentID, "err", err)
			_ = h.store.FailPayment(r.Context(), paymentID, "The payment provider didn't accept the request.")
		}
	}
	h.respondPayment(w, r, paymentID, http.StatusAccepted)
}

type webhookBody struct {
	Reference   string `json:"reference"`
	Status      string `json:"status"`
	AmountMinor int64  `json:"amount_minor"`
	Currency    string `json:"currency"`
	Reason      string `json:"reason"`
}

// webhook applies a provider's confirmation. The signature covers the raw body.
func (h *Handler) webhook(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(io.LimitReader(r.Body, maxWebhookBytes))
	if err != nil || !validSignature(h.payments.WebhookSecret, body, r.Header.Get(signatureHeader)) {
		httpx.WriteError(w, http.StatusUnauthorized, "bad_signature", "Signature check failed.")
		return
	}
	var in webhookBody
	if err := json.Unmarshal(body, &in); err != nil || in.Reference == "" || (in.Status != statusSucceeded && in.Status != statusFailed) {
		badRequest(w, "Send reference, status (successful or failed), amount_minor and currency.")
		return
	}
	err = h.store.Confirm(r.Context(), chi.URLParam(r, "provider"), in.Reference, in.Status == statusSucceeded, in.AmountMinor, strings.ToUpper(in.Currency), in.Reason)
	switch {
	case errors.Is(err, ErrNotFound):
		notFound(w)
	case errors.Is(err, ErrMismatch):
		slog.Warn("finance: webhook amount mismatch", "reference", in.Reference)
		httpx.WriteError(w, http.StatusConflict, "mismatch", "The amount or currency doesn't match the payment.")
	case err != nil:
		serverError(w, "confirm payment", err)
	default:
		httpx.WriteJSON(w, http.StatusOK, map[string]any{"ok": true})
	}
}

func (h *Handler) getPayment(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	p, err := h.store.Payment(r.Context(), pathID(r))
	if err == nil && !v.sees(p.School, p.Student) {
		err = ErrNotFound
	}
	switch {
	case errors.Is(err, ErrNotFound):
		notFound(w)
	case err != nil:
		serverError(w, "get payment", err)
	default:
		httpx.WriteJSON(w, http.StatusOK, p)
	}
}

func (h *Handler) respondPayment(w http.ResponseWriter, r *http.Request, paymentID int64, status int) {
	p, err := h.store.Payment(r.Context(), paymentID)
	if err != nil {
		serverError(w, "reload payment", err)
		return
	}
	httpx.WriteJSON(w, status, p)
}

// ---- statements and reports -------------------------------------------------------------------

func (h *Handler) statement(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	student := pathID(r)
	school, err := strconv.ParseInt(r.URL.Query().Get("school"), 10, 64)
	if err != nil || school <= 0 {
		badRequest(w, "Choose a school (?school=).")
		return
	}
	if !v.sees(school, student) {
		notFound(w)
		return
	}
	st, err := h.store.Statement(r.Context(), school, student)
	if err != nil {
		serverError(w, "statement", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, st)
}

func (h *Handler) summary(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	school, ok := h.schoolParam(w, r, v)
	if !ok {
		return
	}
	currency := strings.ToUpper(r.URL.Query().Get("currency"))
	if !currencyCode.MatchString(currency) {
		currency = defaultCurrency
	}
	sum, err := h.store.Summary(r.Context(), school, currency)
	if err != nil {
		serverError(w, "summary", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, sum)
}

// export writes the school's journal as CSV for QuickBooks or Xero.
func (h *Handler) export(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	school, ok := h.schoolParam(w, r, v)
	if !ok {
		return
	}
	rows, err := h.store.Export(r.Context(), school)
	if err != nil {
		serverError(w, "export", err)
		return
	}
	w.Header().Set("Content-Type", "text/csv; charset=utf-8")
	w.Header().Set("Content-Disposition", `attachment; filename="maple-ledger.csv"`)
	out := csv.NewWriter(w)
	_ = out.Write([]string{"journal", "date", "kind", "reference", "memo", "account_code", "account_name", "student", "currency", "debit", "credit"})
	for _, row := range rows {
		_ = out.Write([]string{
			strconv.FormatInt(row.JournalID, 10), row.CreatedAt.Time.Format(time.DateOnly), row.Kind, row.Reference, row.Memo,
			row.AccountCode, row.AccountName, row.StudentName, row.Currency,
			strconv.FormatInt(row.DebitMinor, 10), strconv.FormatInt(row.CreditMinor, 10),
		})
	}
	out.Flush()
}

// ---- helpers ------------------------------------------------------------------------------------

func writeAll(w http.ResponseWriter, results any, n int) {
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"count": n, "next": nil, "previous": nil, "results": results})
}

func pathID(r *http.Request) int64 {
	n, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	return n
}

func queryID(s string) *int64 {
	n, err := strconv.ParseInt(s, 10, 64)
	if err != nil || n <= 0 {
		return nil
	}
	return &n
}

func badRequest(w http.ResponseWriter, msg string) {
	httpx.WriteError(w, http.StatusBadRequest, "invalid", msg)
}

func forbidden(w http.ResponseWriter, msg string) {
	httpx.WriteError(w, http.StatusForbidden, "forbidden", msg)
}

func notFound(w http.ResponseWriter) {
	httpx.WriteError(w, http.StatusNotFound, "not_found", "Not found.")
}

func serverError(w http.ResponseWriter, action string, err error) {
	slog.Error("finance: "+action, "err", err)
	httpx.WriteError(w, http.StatusInternalServerError, "server_error", "Something went wrong. Please try again.")
}
