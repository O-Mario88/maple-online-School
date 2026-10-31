package finance

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/O-Mario88/maple-online-School/api/internal/httpx"
	"github.com/O-Mario88/maple-online-School/api/internal/inbox"
	"github.com/O-Mario88/maple-online-School/api/internal/platform/dbgen"
	"github.com/O-Mario88/maple-online-School/api/internal/roles"
)

// Generate is a request to invoice a class for a term.
type Generate struct {
	School, Class int64
	Term          *int64
	Items         []FeeItem
	Due           *time.Time
	By            int64
}

// NewPayment is money to record or collect.
type NewPayment struct {
	Invoice        Invoice
	AmountMinor    int64
	Method         string
	Status         string
	Phone          string
	Provider       string
	IdempotencyKey string
	By             int64
}

// PostgresStore implements Store.
type PostgresStore struct {
	pool *pgxpool.Pool
	q    *dbgen.Queries
}

func NewPostgresStore(pool *pgxpool.Pool) *PostgresStore {
	return &PostgresStore{pool: pool, q: dbgen.New(pool)}
}

func (s *PostgresStore) Viewer(ctx context.Context, userID int64, role string) (Viewer, error) {
	v := Viewer{UserID: userID, Learners: []int64{}}
	var err error
	if v.Finance, err = s.q.StaffSchoolIDs(ctx, dbgen.StaffSchoolIDsParams{UserID: userID, StaffRoles: roles.Finance}); err != nil {
		return v, fmt.Errorf("load finance schools: %w", err)
	}
	switch role {
	case "student":
		v.Learners = []int64{userID}
	case "parent":
		kids, err := s.q.ApprovedChildren(ctx, userID)
		if err != nil {
			return v, fmt.Errorf("load children: %w", err)
		}
		for _, k := range kids {
			v.Learners = append(v.Learners, k.UserID)
		}
	}
	return v, nil
}

// ---- fee items ----------------------------------------------------------------------

func (s *PostgresStore) CreateFeeItem(ctx context.Context, f FeeItem) (FeeItem, error) {
	r, err := s.q.CreateFeeItem(ctx, dbgen.CreateFeeItemParams{
		SchoolID: f.School, Name: f.Name, AmountMinor: f.AmountMinor, Currency: f.Currency,
		TermID: id(f.Term), ClassLevelID: id(f.ClassLevel),
	})
	if err != nil {
		return FeeItem{}, fmt.Errorf("create fee item: %w", err)
	}
	return toFeeItem(r), nil
}

func (s *PostgresStore) FeeItems(ctx context.Context, schools []int64) ([]FeeItem, error) {
	rows, err := s.q.ListFeeItems(ctx, schools)
	if err != nil {
		return nil, fmt.Errorf("list fee items: %w", err)
	}
	return mapItems(rows), nil
}

func (s *PostgresStore) FeeItemsByID(ctx context.Context, ids []int64) ([]FeeItem, error) {
	rows, err := s.q.FeeItemsByID(ctx, ids)
	if err != nil {
		return nil, fmt.Errorf("load fee items: %w", err)
	}
	return mapItems(rows), nil
}

func (s *PostgresStore) ClassSchool(ctx context.Context, classID int64) (int64, error) {
	r, err := s.q.FinanceClass(ctx, classID)
	if errors.Is(err, pgx.ErrNoRows) {
		return 0, ErrNotFound
	}
	if err != nil {
		return 0, fmt.Errorf("load class: %w", err)
	}
	return r.InstitutionID, nil
}

// ---- invoices -------------------------------------------------------------------------

// GenerateInvoices bills every student enrolled in the class now. Students
// who already have an open invoice for the term are skipped, so running it
// twice can't bill anyone twice.
func (s *PostgresStore) GenerateInvoices(ctx context.Context, g Generate) (created, skipped int, err error) {
	err = pgx.BeginFunc(ctx, s.pool, func(tx pgx.Tx) error {
		q := s.q.WithTx(tx)
		accts, err := ledgerAccounts(ctx, q, g.School)
		if err != nil {
			return err
		}
		students, err := q.ActiveRosterIDs(ctx, g.Class)
		if err != nil {
			return fmt.Errorf("load class list: %w", err)
		}
		var total int64
		for _, item := range g.Items {
			total += item.AmountMinor
		}
		for _, student := range students {
			if g.Term != nil {
				open, err := q.OpenInvoiceForTerm(ctx, dbgen.OpenInvoiceForTermParams{SchoolID: g.School, StudentID: student, TermID: id(g.Term)})
				if err != nil {
					return fmt.Errorf("check existing invoice: %w", err)
				}
				if open {
					skipped++
					continue
				}
			}
			if err := invoiceOne(ctx, q, accts, g, student, total); err != nil {
				return err
			}
			created++
		}
		return nil
	})
	return created, skipped, err
}

func invoiceOne(ctx context.Context, q *dbgen.Queries, accts map[string]int64, g Generate, student, total int64) error {
	count, err := q.CountSchoolInvoices(ctx, g.School)
	if err != nil {
		return fmt.Errorf("number invoice: %w", err)
	}
	number := fmt.Sprintf("INV-%06d", count+1)
	currency := g.Items[0].Currency
	journal, err := q.CreateJournal(ctx, dbgen.CreateJournalParams{
		SchoolID: g.School, Kind: "invoice", Reference: number, Memo: "School fees", CreatedBy: person(g.By),
	})
	if err != nil {
		return fmt.Errorf("open journal: %w", err)
	}
	if err := post(ctx, q, journal, accts[acctReceivable], student, currency, total, 0); err != nil {
		return err
	}
	for _, item := range g.Items {
		if err := post(ctx, q, journal, accts[acctFeeIncome], student, currency, 0, item.AmountMinor); err != nil {
			return err
		}
	}
	due := pgtype.Date{}
	if g.Due != nil {
		due = pgtype.Date{Time: *g.Due, Valid: true}
	}
	invoice, err := q.CreateInvoice(ctx, dbgen.CreateInvoiceParams{
		SchoolID: g.School, StudentID: student, TermID: id(g.Term), ClassID: pgtype.Int8{Int64: g.Class, Valid: true},
		Number: number, Currency: currency, TotalMinor: total, DueDate: due, JournalID: journal, IssuedBy: person(g.By),
	})
	if err != nil {
		return fmt.Errorf("create invoice: %w", err)
	}
	for _, item := range g.Items {
		fee := item.ID
		err := q.AddInvoiceLine(ctx, dbgen.AddInvoiceLineParams{
			InvoiceID: invoice, FeeItemID: id(&fee), Description: item.Name, AmountMinor: item.AmountMinor,
		})
		if err != nil {
			return fmt.Errorf("add invoice line: %w", err)
		}
	}
	body := money(total, currency) + " for school fees."
	if g.Due != nil {
		body += " Due " + g.Due.Format("2 January 2006") + "."
	}
	return inbox.NotifyFamily(ctx, q, student, inbox.Note{Kind: "invoice", Title: "New invoice " + number, Body: body, Link: "/fees"})
}

func (s *PostgresStore) Invoices(ctx context.Context, v Viewer, student *int64, status *string, page httpx.Page) ([]Invoice, int64, error) {
	count, err := s.q.CountInvoices(ctx, dbgen.CountInvoicesParams{
		FinanceSchools: v.Finance, LearnerIds: v.Learners, Student: id(student), Status: text(status),
	})
	if err != nil {
		return nil, 0, fmt.Errorf("count invoices: %w", err)
	}
	rows, err := s.q.ListInvoices(ctx, dbgen.ListInvoicesParams{
		FinanceSchools: v.Finance, LearnerIds: v.Learners, Student: id(student), Status: text(status),
		PageLimit: page.Limit, PageOffset: page.Offset,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("list invoices: %w", err)
	}
	out := make([]Invoice, 0, len(rows))
	ids := make([]int64, 0, len(rows))
	for _, r := range rows {
		out = append(out, toInvoice(dbgen.GetInvoiceRow(r)))
		ids = append(ids, r.ID)
	}
	return s.withLines(ctx, out, ids, count)
}

func (s *PostgresStore) withLines(ctx context.Context, invoices []Invoice, ids []int64, count int64) ([]Invoice, int64, error) {
	lines, err := s.q.InvoiceLines(ctx, ids)
	if err != nil {
		return nil, 0, fmt.Errorf("load invoice lines: %w", err)
	}
	byInvoice := map[int64][]Line{}
	for _, l := range lines {
		byInvoice[l.InvoiceID] = append(byInvoice[l.InvoiceID], Line{ID: l.ID, FeeItem: optID(l.FeeItemID), Description: l.Description, AmountMinor: l.AmountMinor})
	}
	for i := range invoices {
		invoices[i].Lines = byInvoice[invoices[i].ID]
		if invoices[i].Lines == nil {
			invoices[i].Lines = []Line{}
		}
	}
	return invoices, count, nil
}

func (s *PostgresStore) Invoice(ctx context.Context, invoiceID int64) (Invoice, error) {
	r, err := s.q.GetInvoice(ctx, invoiceID)
	if errors.Is(err, pgx.ErrNoRows) {
		return Invoice{}, ErrNotFound
	}
	if err != nil {
		return Invoice{}, fmt.Errorf("get invoice: %w", err)
	}
	out, _, err := s.withLines(ctx, []Invoice{toInvoice(r)}, []int64{r.ID}, 1)
	if err != nil {
		return Invoice{}, err
	}
	return out[0], nil
}

// VoidInvoice cancels an unpaid invoice with a reversing journal.
func (s *PostgresStore) VoidInvoice(ctx context.Context, inv Invoice, by int64) error {
	return pgx.BeginFunc(ctx, s.pool, func(tx pgx.Tx) error {
		q := s.q.WithTx(tx)
		accts, err := ledgerAccounts(ctx, q, inv.School)
		if err != nil {
			return err
		}
		current, err := q.GetInvoice(ctx, inv.ID)
		if err != nil {
			return fmt.Errorf("reload invoice: %w", err)
		}
		if current.PaidMinor > 0 {
			return ErrHasPayments
		}
		if current.Status == "void" {
			return nil
		}
		journal, err := q.CreateJournal(ctx, dbgen.CreateJournalParams{
			SchoolID: inv.School, Kind: "void", Reference: inv.Number, Memo: "Invoice cancelled", CreatedBy: person(by),
		})
		if err != nil {
			return fmt.Errorf("open journal: %w", err)
		}
		if err := post(ctx, q, journal, accts[acctFeeIncome], inv.Student, inv.Currency, inv.TotalMinor, 0); err != nil {
			return err
		}
		if err := post(ctx, q, journal, accts[acctReceivable], inv.Student, inv.Currency, 0, inv.TotalMinor); err != nil {
			return err
		}
		return q.SetInvoiceStatus(ctx, dbgen.SetInvoiceStatusParams{ID: inv.ID, Status: "void"})
	})
}

// ---- payments --------------------------------------------------------------------------

// RecordPayment stores a payment. A successful one (cash, bank) is posted at
// once; a pending one waits for its provider. The same idempotency key
// returns the first payment instead of recording money twice.
func (s *PostgresStore) RecordPayment(ctx context.Context, p NewPayment) (int64, bool, error) {
	var paymentID int64
	created := false
	err := pgx.BeginFunc(ctx, s.pool, func(tx pgx.Tx) error {
		q := s.q.WithTx(tx)
		if err := q.LockSchoolLedger(ctx, p.Invoice.School); err != nil {
			return fmt.Errorf("lock ledger: %w", err)
		}
		existing, err := q.PaymentByIdempotencyKey(ctx, dbgen.PaymentByIdempotencyKeyParams{
			SchoolID: p.Invoice.School, IdempotencyKey: pgtype.Text{String: p.IdempotencyKey, Valid: true},
		})
		if err == nil {
			paymentID = existing
			return nil
		}
		if !errors.Is(err, pgx.ErrNoRows) {
			return fmt.Errorf("check idempotency key: %w", err)
		}
		invoice := p.Invoice.ID
		paymentID, err = q.CreatePayment(ctx, dbgen.CreatePaymentParams{
			SchoolID: p.Invoice.School, StudentID: p.Invoice.Student, InvoiceID: id(&invoice), AmountMinor: p.AmountMinor,
			Currency: p.Invoice.Currency, Method: p.Method, Status: statusPending, PayerPhone: p.Phone, Provider: p.Provider,
			IdempotencyKey: pgtype.Text{String: p.IdempotencyKey, Valid: true}, InitiatedBy: person(p.By),
		})
		if err != nil {
			return fmt.Errorf("record payment: %w", err)
		}
		created = true
		if p.Status != statusSucceeded {
			return nil
		}
		return settle(ctx, q, paymentID, p.By)
	})
	return paymentID, created, err
}

func (s *PostgresStore) SetProviderReference(ctx context.Context, paymentID int64, ref string) error {
	err := s.q.SetPaymentProviderReference(ctx, dbgen.SetPaymentProviderReferenceParams{ID: paymentID, ProviderReference: pgtype.Text{String: ref, Valid: true}})
	if err != nil {
		return fmt.Errorf("save provider reference: %w", err)
	}
	return nil
}

func (s *PostgresStore) FailPayment(ctx context.Context, paymentID int64, reason string) error {
	if err := s.q.FailPayment(ctx, dbgen.FailPaymentParams{ID: paymentID, FailureReason: reason}); err != nil {
		return fmt.Errorf("fail payment: %w", err)
	}
	return nil
}

// Confirm applies a provider's verdict on a payment, once. A repeat delivery
// changes nothing; an amount or currency that doesn't match is refused.
func (s *PostgresStore) Confirm(ctx context.Context, provider, ref string, succeeded bool, amount int64, currency, reason string) error {
	return pgx.BeginFunc(ctx, s.pool, func(tx pgx.Tx) error {
		q := s.q.WithTx(tx)
		p, err := q.LockPaymentByProviderReference(ctx, dbgen.LockPaymentByProviderReferenceParams{
			Provider: provider, ProviderReference: pgtype.Text{String: ref, Valid: true},
		})
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrNotFound
		}
		if err != nil {
			return fmt.Errorf("find payment: %w", err)
		}
		if p.Status != statusPending {
			return nil // already settled or failed
		}
		if !succeeded {
			return q.FailPayment(ctx, dbgen.FailPaymentParams{ID: p.ID, FailureReason: reason})
		}
		if p.AmountMinor != amount || p.Currency != currency {
			return ErrMismatch
		}
		return settle(ctx, q, p.ID, 0)
	})
}

// settle posts a pending payment to the ledger, numbers its receipt and
// updates its invoice.
func settle(ctx context.Context, q *dbgen.Queries, paymentID, by int64) error {
	p, err := q.LockPayment(ctx, paymentID)
	if err != nil {
		return fmt.Errorf("lock payment: %w", err)
	}
	if err := q.LockSchoolLedger(ctx, p.SchoolID); err != nil {
		return fmt.Errorf("lock ledger: %w", err)
	}
	accts, err := ledgerAccounts(ctx, q, p.SchoolID)
	if err != nil {
		return err
	}
	count, err := q.CountSchoolReceipts(ctx, p.SchoolID)
	if err != nil {
		return fmt.Errorf("number receipt: %w", err)
	}
	receipt := fmt.Sprintf("RCT-%06d", count+1)
	journal, err := q.CreateJournal(ctx, dbgen.CreateJournalParams{
		SchoolID: p.SchoolID, Kind: "payment", Reference: receipt, Memo: "Fee payment (" + p.Method + ")", CreatedBy: person(by),
	})
	if err != nil {
		return fmt.Errorf("open journal: %w", err)
	}
	if err := post(ctx, q, journal, accts[accountFor(p.Method)], p.StudentID, p.Currency, p.AmountMinor, 0); err != nil {
		return err
	}
	if err := post(ctx, q, journal, accts[acctReceivable], p.StudentID, p.Currency, 0, p.AmountMinor); err != nil {
		return err
	}
	err = q.CompletePayment(ctx, dbgen.CompletePaymentParams{
		ID: p.ID, JournalID: pgtype.Int8{Int64: journal, Valid: true}, ReceiptNumber: pgtype.Text{String: receipt, Valid: true},
	})
	if err != nil {
		return fmt.Errorf("complete payment: %w", err)
	}
	if err := inbox.NotifyFamily(ctx, q, p.StudentID, inbox.Note{
		Kind: "payment", Title: "Payment received · " + receipt,
		Body: money(p.AmountMinor, p.Currency) + " by " + methodName(p.Method) + ". Thank you.", Link: "/fees",
	}); err != nil {
		return err
	}
	if !p.InvoiceID.Valid {
		return nil
	}
	inv, err := q.GetInvoice(ctx, p.InvoiceID.Int64)
	if err != nil {
		return fmt.Errorf("reload invoice: %w", err)
	}
	status := "partially_paid"
	if inv.PaidMinor >= inv.TotalMinor {
		status = "paid"
	}
	return q.SetInvoiceStatus(ctx, dbgen.SetInvoiceStatusParams{ID: inv.ID, Status: status})
}

func (s *PostgresStore) Payment(ctx context.Context, paymentID int64) (Payment, error) {
	r, err := s.q.GetPayment(ctx, paymentID)
	if errors.Is(err, pgx.ErrNoRows) {
		return Payment{}, ErrNotFound
	}
	if err != nil {
		return Payment{}, fmt.Errorf("get payment: %w", err)
	}
	return Payment{
		ID: r.ID, School: r.SchoolID, SchoolName: r.SchoolName, Student: r.StudentID, StudentName: r.StudentName,
		Invoice: optID(r.InvoiceID), InvoiceNumber: r.InvoiceNumber, AmountMinor: r.AmountMinor, Currency: r.Currency,
		Method: r.Method, Status: r.Status, PayerPhone: r.PayerPhone, Provider: r.Provider,
		ProviderReference: r.ProviderReference.String, FailureReason: r.FailureReason, ReceiptNumber: optText(r.ReceiptNumber),
		CreatedAt: r.CreatedAt.Time, CompletedAt: optTime(r.CompletedAt),
	}, nil
}

// ---- statements and reports --------------------------------------------------------------

func (s *PostgresStore) Statement(ctx context.Context, school, student int64) (Statement, error) {
	rows, err := s.q.StudentStatement(ctx, dbgen.StudentStatementParams{SchoolID: school, StudentID: pgtype.Int8{Int64: student, Valid: true}})
	if err != nil {
		return Statement{}, fmt.Errorf("statement: %w", err)
	}
	st := Statement{School: school, Student: student, Lines: make([]StatementLine, 0, len(rows))}
	for _, r := range rows {
		st.BalanceMinor += r.DebitMinor - r.CreditMinor
		st.Lines = append(st.Lines, StatementLine{
			Date: r.CreatedAt.Time, Kind: r.Kind, Reference: r.Reference, Memo: r.Memo, Currency: r.Currency,
			DebitMinor: r.DebitMinor, CreditMinor: r.CreditMinor, BalanceMinor: st.BalanceMinor,
		})
	}
	return st, nil
}

func (s *PostgresStore) Summary(ctx context.Context, school int64, currency string) (Summary, error) {
	r, err := s.q.SchoolSummary(ctx, dbgen.SchoolSummaryParams{SchoolID: school, Currency: currency})
	if err != nil {
		return Summary{}, fmt.Errorf("summary: %w", err)
	}
	return Summary{School: school, Currency: currency, BilledMinor: r.BilledMinor, CollectedMinor: r.CollectedMinor,
		OutstandingMinor: r.OutstandingMinor, PendingPayments: r.PendingPayments}, nil
}

func (s *PostgresStore) Export(ctx context.Context, school int64) ([]dbgen.JournalExportRow, error) {
	rows, err := s.q.JournalExport(ctx, school)
	if err != nil {
		return nil, fmt.Errorf("export: %w", err)
	}
	return rows, nil
}

// ---- helpers ------------------------------------------------------------------------------

// ledgerAccounts makes sure the school has its accounts and returns their ids by code.
func ledgerAccounts(ctx context.Context, q *dbgen.Queries, school int64) (map[string]int64, error) {
	if err := q.EnsureSchoolAccounts(ctx, school); err != nil {
		return nil, fmt.Errorf("set up accounts: %w", err)
	}
	out := map[string]int64{}
	for _, code := range []string{acctCash, acctBank, acctMobile, acctCard, acctReceivable, acctFeeIncome} {
		accountID, err := q.SchoolAccountID(ctx, dbgen.SchoolAccountIDParams{SchoolID: school, Code: code})
		if err != nil {
			return nil, fmt.Errorf("find account %s: %w", code, err)
		}
		out[code] = accountID
	}
	return out, nil
}

func post(ctx context.Context, q *dbgen.Queries, journal, account, student int64, currency string, debit, credit int64) error {
	err := q.AddEntry(ctx, dbgen.AddEntryParams{
		JournalID: journal, AccountID: account, StudentID: pgtype.Int8{Int64: student, Valid: true},
		Currency: currency, DebitMinor: debit, CreditMinor: credit,
	})
	if err != nil {
		return fmt.Errorf("post entry: %w", err)
	}
	return nil
}

func toFeeItem(r dbgen.FinFeeItem) FeeItem {
	return FeeItem{ID: r.ID, School: r.SchoolID, Name: r.Name, AmountMinor: r.AmountMinor, Currency: r.Currency,
		Term: optID(r.TermID), ClassLevel: optID(r.ClassLevelID), CreatedAt: r.CreatedAt.Time}
}

func mapItems(rows []dbgen.FinFeeItem) []FeeItem {
	out := make([]FeeItem, 0, len(rows))
	for _, r := range rows {
		out = append(out, toFeeItem(r))
	}
	return out
}

func toInvoice(r dbgen.GetInvoiceRow) Invoice {
	inv := Invoice{
		ID: r.ID, School: r.SchoolID, Student: r.StudentID, StudentName: r.StudentName, Term: optID(r.TermID),
		Class: optID(r.ClassID), Number: r.Number, Currency: r.Currency, TotalMinor: r.TotalMinor, PaidMinor: r.PaidMinor,
		BalanceMinor: r.TotalMinor - r.PaidMinor, Status: r.Status, CreatedAt: r.CreatedAt.Time, VoidedAt: optTime(r.VoidedAt),
	}
	if inv.Status == "void" {
		inv.BalanceMinor = 0
	}
	if r.DueDate.Valid {
		d := r.DueDate.Time.Format(time.DateOnly)
		inv.DueDate = &d
	}
	return inv
}

func person(userID int64) pgtype.Int8 {
	return pgtype.Int8{Int64: userID, Valid: userID != 0}
}

func id(v *int64) pgtype.Int8 {
	if v == nil {
		return pgtype.Int8{}
	}
	return pgtype.Int8{Int64: *v, Valid: true}
}

func text(s *string) pgtype.Text {
	if s == nil {
		return pgtype.Text{}
	}
	return pgtype.Text{String: *s, Valid: true}
}

func optID(v pgtype.Int8) *int64 {
	if !v.Valid {
		return nil
	}
	return &v.Int64
}

func optText(t pgtype.Text) *string {
	if !t.Valid {
		return nil
	}
	return &t.String
}

func optTime(t pgtype.Timestamptz) *time.Time {
	if !t.Valid {
		return nil
	}
	return &t.Time
}
