-- +goose Up
-- School finance, Tier 1 (playbook section 11A): fee billing on an immutable
-- double-entry sub-ledger, payments with idempotent provider confirmation,
-- and receipts. Money is stored as whole minor units (for UGX, shillings).

-- Chart of accounts, one set per school.
CREATE TABLE fin_accounts (
    id        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    school_id bigint NOT NULL REFERENCES institutions_institution(id),
    code      text   NOT NULL,
    name      text   NOT NULL,
    kind      text   NOT NULL CHECK (kind IN ('asset', 'liability', 'equity', 'income', 'expense')),
    UNIQUE (school_id, code)
);

CREATE TABLE fin_journals (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    school_id  bigint NOT NULL REFERENCES institutions_institution(id),
    kind       text   NOT NULL CHECK (kind IN ('invoice', 'payment', 'void', 'adjustment')),
    reference  text   NOT NULL DEFAULT '',
    memo       text   NOT NULL DEFAULT '',
    created_by bigint REFERENCES accounts_user(id),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE fin_entries (
    id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    journal_id   bigint NOT NULL REFERENCES fin_journals(id),
    account_id   bigint NOT NULL REFERENCES fin_accounts(id),
    student_id   bigint REFERENCES accounts_user(id),
    currency     char(3) NOT NULL,
    debit_minor  bigint NOT NULL DEFAULT 0 CHECK (debit_minor >= 0),
    credit_minor bigint NOT NULL DEFAULT 0 CHECK (credit_minor >= 0),
    CHECK ((debit_minor = 0) <> (credit_minor = 0))
);
CREATE INDEX fin_entries_journal_idx ON fin_entries (journal_id);
CREATE INDEX fin_entries_student_idx ON fin_entries (student_id, account_id);

-- +goose StatementBegin
-- Every journal must balance, per currency, by the time its transaction commits.
CREATE FUNCTION fin_check_balanced() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
    jid bigint := COALESCE(NEW.journal_id, OLD.journal_id);
BEGIN
    IF EXISTS (
        SELECT 1 FROM fin_entries WHERE journal_id = jid
        GROUP BY currency HAVING sum(debit_minor) <> sum(credit_minor)
    ) THEN
        RAISE EXCEPTION 'journal % does not balance', jid USING ERRCODE = '23514';
    END IF;
    RETURN NULL;
END;
$$;
-- +goose StatementEnd

CREATE CONSTRAINT TRIGGER fin_entries_balanced
    AFTER INSERT ON fin_entries
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW EXECUTE FUNCTION fin_check_balanced();

-- +goose StatementBegin
-- Posted ledger rows never change; mistakes are corrected with a reversing
-- journal. Only an explicit purge (test clean-up) may delete them.
CREATE FUNCTION fin_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'DELETE' AND current_setting('maple.ledger_purge', true) = 'on' THEN
        RETURN OLD;
    END IF;
    RAISE EXCEPTION 'ledger rows are immutable; post a reversing journal instead' USING ERRCODE = '42501';
END;
$$;
-- +goose StatementEnd

CREATE TRIGGER fin_entries_immutable BEFORE UPDATE OR DELETE ON fin_entries
    FOR EACH ROW EXECUTE FUNCTION fin_immutable();
CREATE TRIGGER fin_journals_immutable BEFORE UPDATE OR DELETE ON fin_journals
    FOR EACH ROW EXECUTE FUNCTION fin_immutable();

-- What a school charges.
CREATE TABLE fin_fee_items (
    id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    school_id      bigint NOT NULL REFERENCES institutions_institution(id),
    name           text   NOT NULL,
    amount_minor   bigint NOT NULL CHECK (amount_minor > 0),
    currency       char(3) NOT NULL,
    term_id        bigint REFERENCES scheduling_academicterm(id),
    class_level_id bigint REFERENCES curriculum_classlevel(id),
    active         boolean NOT NULL DEFAULT true,
    created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE fin_invoices (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    school_id   bigint NOT NULL REFERENCES institutions_institution(id),
    student_id  bigint NOT NULL REFERENCES accounts_user(id),
    term_id     bigint REFERENCES scheduling_academicterm(id),
    class_id    bigint REFERENCES classes_class(id),
    number      text   NOT NULL,
    currency    char(3) NOT NULL,
    total_minor bigint NOT NULL CHECK (total_minor > 0),
    status      text   NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'partially_paid', 'paid', 'void')),
    due_date    date,
    journal_id  bigint NOT NULL REFERENCES fin_journals(id),
    issued_by   bigint REFERENCES accounts_user(id),
    created_at  timestamptz NOT NULL DEFAULT now(),
    voided_at   timestamptz,
    UNIQUE (school_id, number)
);
CREATE INDEX fin_invoices_student_idx ON fin_invoices (student_id, status);
-- One open invoice per student per term, so generating twice can't bill twice.
CREATE UNIQUE INDEX fin_invoices_one_per_term ON fin_invoices (school_id, student_id, term_id)
    WHERE term_id IS NOT NULL AND status <> 'void';

CREATE TABLE fin_invoice_lines (
    id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    invoice_id   bigint NOT NULL REFERENCES fin_invoices(id),
    fee_item_id  bigint REFERENCES fin_fee_items(id),
    description  text   NOT NULL,
    amount_minor bigint NOT NULL CHECK (amount_minor > 0)
);

CREATE TABLE fin_payments (
    id                 bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    school_id          bigint NOT NULL REFERENCES institutions_institution(id),
    student_id         bigint NOT NULL REFERENCES accounts_user(id),
    invoice_id         bigint REFERENCES fin_invoices(id),
    amount_minor       bigint NOT NULL CHECK (amount_minor > 0),
    currency           char(3) NOT NULL,
    method             text   NOT NULL CHECK (method IN ('mtn_momo', 'airtel_money', 'card', 'cash', 'bank')),
    status             text   NOT NULL CHECK (status IN ('pending', 'successful', 'failed')),
    payer_phone        text   NOT NULL DEFAULT '',
    provider           text   NOT NULL DEFAULT '',
    provider_reference text,
    idempotency_key    text,
    failure_reason     text   NOT NULL DEFAULT '',
    journal_id         bigint REFERENCES fin_journals(id),
    receipt_number     text,
    initiated_by       bigint REFERENCES accounts_user(id),
    created_at         timestamptz NOT NULL DEFAULT now(),
    completed_at       timestamptz,
    UNIQUE (provider, provider_reference),
    UNIQUE (school_id, idempotency_key),
    UNIQUE (school_id, receipt_number)
);
CREATE INDEX fin_payments_student_idx ON fin_payments (student_id, status);

-- +goose Down
DROP TABLE fin_payments;
DROP TABLE fin_invoice_lines;
DROP TABLE fin_invoices;
DROP TABLE fin_fee_items;
DROP TRIGGER fin_journals_immutable ON fin_journals;
DROP TRIGGER fin_entries_immutable ON fin_entries;
DROP TABLE fin_entries;
DROP TABLE fin_journals;
DROP TABLE fin_accounts;
DROP FUNCTION fin_immutable();
DROP FUNCTION fin_check_balanced();
