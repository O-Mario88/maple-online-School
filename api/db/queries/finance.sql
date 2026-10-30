-- School finance (playbook 11A Tier 1). Go owns these tables (migration 00003).

-- ---- chart of accounts and posting ----------------------------------------------

-- name: EnsureSchoolAccounts :exec
-- The accounts every school needs, created on first use.
INSERT INTO fin_accounts (school_id, code, name, kind)
VALUES ($1, '1000', 'Cash at hand', 'asset'),
       ($1, '1010', 'Bank', 'asset'),
       ($1, '1020', 'Mobile money clearing', 'asset'),
       ($1, '1030', 'Card clearing', 'asset'),
       ($1, '1100', 'Student fees receivable', 'asset'),
       ($1, '4000', 'Fee income', 'income')
ON CONFLICT (school_id, code) DO NOTHING;

-- name: SchoolAccountID :one
SELECT id FROM fin_accounts WHERE school_id = $1 AND code = $2;

-- name: CreateJournal :one
INSERT INTO fin_journals (school_id, kind, reference, memo, created_by)
VALUES ($1, $2, $3, $4, $5)
RETURNING id;

-- name: AddEntry :exec
INSERT INTO fin_entries (journal_id, account_id, student_id, currency, debit_minor, credit_minor)
VALUES ($1, $2, $3, $4, $5, $6);

-- name: LockSchoolLedger :exec
-- Serialises numbering of invoices and receipts per school.
SELECT pg_advisory_xact_lock(hashtextextended('school-ledger:' || sqlc.arg(school_id)::bigint::text, 0));

-- ---- fee items --------------------------------------------------------------------

-- name: CreateFeeItem :one
INSERT INTO fin_fee_items (school_id, name, amount_minor, currency, term_id, class_level_id)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id, school_id, name, amount_minor, currency, term_id, class_level_id, active, created_at;

-- name: ListFeeItems :many
SELECT id, school_id, name, amount_minor, currency, term_id, class_level_id, active, created_at
FROM fin_fee_items WHERE school_id = ANY(sqlc.arg(school_ids)::bigint[]) AND active
ORDER BY school_id, name, id;

-- name: FeeItemsByID :many
SELECT id, school_id, name, amount_minor, currency, term_id, class_level_id, active, created_at
FROM fin_fee_items WHERE id = ANY(sqlc.arg(ids)::bigint[]) AND active;

-- ---- invoices -----------------------------------------------------------------------

-- name: FinanceClass :one
SELECT id, institution_id, title FROM classes_class WHERE id = $1;

-- name: CountSchoolInvoices :one
SELECT count(*) FROM fin_invoices WHERE school_id = $1;

-- name: OpenInvoiceForTerm :one
SELECT EXISTS (SELECT 1 FROM fin_invoices
               WHERE school_id = $1 AND student_id = $2 AND term_id = $3 AND status <> 'void');

-- name: CreateInvoice :one
INSERT INTO fin_invoices (school_id, student_id, term_id, class_id, number, currency, total_minor, due_date, journal_id, issued_by)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
RETURNING id;

-- name: AddInvoiceLine :exec
INSERT INTO fin_invoice_lines (invoice_id, fee_item_id, description, amount_minor) VALUES ($1, $2, $3, $4);

-- name: ListInvoices :many
-- Finance staff see their schools' invoices; learners see their own.
SELECT i.id, i.school_id, i.student_id, u.full_name AS student_name, i.term_id, i.class_id, i.number, i.currency,
       i.total_minor, i.status, i.due_date, i.created_at, i.voided_at,
       COALESCE((SELECT sum(p.amount_minor) FROM fin_payments p WHERE p.invoice_id = i.id AND p.status = 'successful'), 0)::bigint AS paid_minor
FROM fin_invoices i
JOIN accounts_user u ON u.id = i.student_id
WHERE (i.school_id = ANY(sqlc.arg(finance_schools)::bigint[]) OR i.student_id = ANY(sqlc.arg(learner_ids)::bigint[]))
  AND (sqlc.narg(student)::bigint IS NULL OR i.student_id = sqlc.narg(student))
  AND (sqlc.narg(status)::text IS NULL OR i.status = sqlc.narg(status))
ORDER BY i.created_at DESC, i.id DESC
LIMIT sqlc.arg(page_limit) OFFSET sqlc.arg(page_offset);

-- name: CountInvoices :one
SELECT count(*) FROM fin_invoices i
WHERE (i.school_id = ANY(sqlc.arg(finance_schools)::bigint[]) OR i.student_id = ANY(sqlc.arg(learner_ids)::bigint[]))
  AND (sqlc.narg(student)::bigint IS NULL OR i.student_id = sqlc.narg(student))
  AND (sqlc.narg(status)::text IS NULL OR i.status = sqlc.narg(status));

-- name: GetInvoice :one
SELECT i.id, i.school_id, i.student_id, u.full_name AS student_name, i.term_id, i.class_id, i.number, i.currency,
       i.total_minor, i.status, i.due_date, i.created_at, i.voided_at,
       COALESCE((SELECT sum(p.amount_minor) FROM fin_payments p WHERE p.invoice_id = i.id AND p.status = 'successful'), 0)::bigint AS paid_minor
FROM fin_invoices i
JOIN accounts_user u ON u.id = i.student_id
WHERE i.id = $1;

-- name: InvoiceLines :many
SELECT id, invoice_id, fee_item_id, description, amount_minor FROM fin_invoice_lines
WHERE invoice_id = ANY(sqlc.arg(invoice_ids)::bigint[]) ORDER BY id;

-- name: SetInvoiceStatus :exec
UPDATE fin_invoices SET status = sqlc.arg(status)::text,
    voided_at = CASE WHEN sqlc.arg(status)::text = 'void' THEN now() ELSE voided_at END
WHERE id = sqlc.arg(id);

-- ---- payments ------------------------------------------------------------------------

-- name: CreatePayment :one
INSERT INTO fin_payments (school_id, student_id, invoice_id, amount_minor, currency, method, status, payer_phone,
                          provider, provider_reference, idempotency_key, initiated_by)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
RETURNING id;

-- name: PaymentByIdempotencyKey :one
SELECT id FROM fin_payments WHERE school_id = $1 AND idempotency_key = $2;

-- name: SetPaymentProviderReference :exec
UPDATE fin_payments SET provider_reference = $2 WHERE id = $1;

-- name: LockPaymentByProviderReference :one
SELECT id, school_id, student_id, invoice_id, amount_minor, currency, method, status
FROM fin_payments WHERE provider = $1 AND provider_reference = $2
FOR UPDATE;

-- name: LockPayment :one
SELECT id, school_id, student_id, invoice_id, amount_minor, currency, method, status
FROM fin_payments WHERE id = $1
FOR UPDATE;

-- name: CountSchoolReceipts :one
SELECT count(*) FROM fin_payments WHERE school_id = $1 AND receipt_number IS NOT NULL;

-- name: CompletePayment :exec
UPDATE fin_payments SET status = 'successful', journal_id = $2, receipt_number = $3, completed_at = now()
WHERE id = $1;

-- name: FailPayment :exec
UPDATE fin_payments SET status = 'failed', failure_reason = $2, completed_at = now()
WHERE id = $1 AND status = 'pending';

-- name: GetPayment :one
SELECT p.id, p.school_id, p.student_id, u.full_name AS student_name, p.invoice_id, p.amount_minor, p.currency, p.method,
       p.status, p.payer_phone, p.provider, p.provider_reference, p.failure_reason, p.receipt_number,
       p.created_at, p.completed_at, s.name AS school_name, COALESCE(i.number, '')::text AS invoice_number
FROM fin_payments p
JOIN accounts_user u ON u.id = p.student_id
JOIN institutions_institution s ON s.id = p.school_id
LEFT JOIN fin_invoices i ON i.id = p.invoice_id
WHERE p.id = $1;

-- ---- statements and reports ------------------------------------------------------------

-- name: StudentStatement :many
-- The student's fees account at one school: charges are debits, payments credits.
SELECT j.created_at, j.kind, j.reference, j.memo, e.currency, e.debit_minor, e.credit_minor
FROM fin_entries e
JOIN fin_journals j ON j.id = e.journal_id
JOIN fin_accounts a ON a.id = e.account_id
WHERE a.school_id = $1 AND a.code = '1100' AND e.student_id = $2
ORDER BY j.created_at, j.id;

-- name: SchoolSummary :one
SELECT
  COALESCE((SELECT sum(total_minor) FROM fin_invoices WHERE school_id = $1 AND status <> 'void' AND currency = $2), 0)::bigint AS billed_minor,
  COALESCE((SELECT sum(amount_minor) FROM fin_payments WHERE school_id = $1 AND status = 'successful' AND currency = $2), 0)::bigint AS collected_minor,
  COALESCE((SELECT sum(e.debit_minor - e.credit_minor) FROM fin_entries e JOIN fin_accounts a ON a.id = e.account_id
            WHERE a.school_id = $1 AND a.code = '1100' AND e.currency = $2), 0)::bigint AS outstanding_minor,
  (SELECT count(*) FROM fin_payments WHERE school_id = $1 AND status = 'pending')::bigint AS pending_payments;

-- name: JournalExport :many
-- Every posted line for a school, for QuickBooks / Xero import.
SELECT j.id AS journal_id, j.created_at, j.kind, j.reference, j.memo, a.code AS account_code, a.name AS account_name,
       COALESCE(u.full_name, '')::text AS student_name, e.currency, e.debit_minor, e.credit_minor
FROM fin_entries e
JOIN fin_journals j ON j.id = e.journal_id
JOIN fin_accounts a ON a.id = e.account_id
LEFT JOIN accounts_user u ON u.id = e.student_id
WHERE j.school_id = $1
ORDER BY j.created_at, j.id, e.id;
