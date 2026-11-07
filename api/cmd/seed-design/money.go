package main

import (
	"fmt"
	"strings"

	"github.com/O-Mario88/maple-online-School/api/internal/finance"
)

const (
	currency         = "UGX"
	minorPerShilling = 100 // the API keeps money in minor units; the designs write whole shillings
	paidStatus       = "successful"
)

// designAppliesToPrimaryOne: the fee structures that apply to Primary 1 (its own and "All Grades").
func designAppliesToPrimaryOne(grade string) bool {
	return grade == "Primary 1" || grade == "All Grades"
}

// method maps the designs' payment methods to the API's.
func method(name, ref string) string {
	switch {
	case name == "Cash":
		return "cash"
	case name == "Bank Transfer":
		return "bank"
	case strings.HasPrefix(ref, "AIRTEL"):
		return "airtel_money"
	default:
		return "mtn_momo"
	}
}

// seedFinance posts fees, invoices and payments through the API's own finance code, so the
// school ledger balances exactly as it would for a real school.
func (s *seeder) seedFinance() error {
	fin := finance.NewPostgresStore(s.pool)
	head, err := s.user(s.data.Accounts["institution"].FullName)
	if err != nil {
		return err
	}
	if err := s.fakeFinance(fin, head); err != nil {
		return err
	}
	return s.designFinance(fin, head)
}

func (s *seeder) feeItem(fin *finance.PostgresStore, school int64, name string, amountMinor int64, level *int64) (finance.FeeItem, error) {
	term := s.terms[school]
	item, err := fin.CreateFeeItem(s.ctx, finance.FeeItem{School: school, Name: name, AmountMinor: amountMinor, Currency: currency, Term: &term, ClassLevel: level})
	if err != nil {
		return finance.FeeItem{}, fmt.Errorf("fee item %s: %w", name, err)
	}
	return item, nil
}

func (s *seeder) bill(fin *finance.PostgresStore, class, by int64, items []finance.FeeItem) error {
	school := s.classSchool[class]
	term := s.terms[school]
	if _, _, err := fin.GenerateInvoices(s.ctx, finance.Generate{School: school, Class: class, Term: &term, Items: items, By: by}); err != nil {
		return fmt.Errorf("bill class %d: %w", class, err)
	}
	return nil
}

func (s *seeder) pay(fin *finance.PostgresStore, studentName string, amountMinor int64, how, ref string, by int64) error {
	student, err := s.user(studentName)
	if err != nil {
		return err
	}
	invoiceID, err := s.scalar(`SELECT id FROM fin_invoices WHERE student_id = $1 AND voided_at IS NULL ORDER BY id LIMIT 1`, student)
	if err != nil {
		return fmt.Errorf("no invoice for %s to pay: %w", studentName, err)
	}
	invoice, err := fin.Invoice(s.ctx, invoiceID)
	if err != nil {
		return err
	}
	_, _, err = fin.RecordPayment(s.ctx, finance.NewPayment{
		Invoice: invoice, AmountMinor: min(amountMinor, invoice.BalanceMinor), Method: how, Status: paidStatus,
		IdempotencyKey: "design-" + ref, By: by,
	})
	if err != nil {
		return fmt.Errorf("payment by %s: %w", studentName, err)
	}
	return nil
}

func (s *seeder) fakeFinance(fin *finance.PostgresStore, head int64) error {
	items, err := apiList[apiFeeItem](s.data, "/api/v1/finance/fee-items/")
	if err != nil {
		return err
	}
	classes, err := apiList[apiClass](s.data, "/api/v1/classes/")
	if err != nil {
		return err
	}
	levelName := map[int64]string{} // the fake API's class_level ids -> their names
	for _, c := range classes {
		levelName[c.ClassLevel] = c.ClassLevelName
	}
	created := map[int64]finance.FeeItem{}
	for _, it := range items {
		var level *int64
		if it.ClassLevel != nil {
			id, err := s.level(levelName[*it.ClassLevel])
			if err != nil {
				return err
			}
			level = &id
		}
		item, err := s.feeItem(fin, s.schools[1], it.Name, it.AmountMinor, level)
		if err != nil {
			return err
		}
		created[it.ID] = item
	}
	invoices, err := apiList[apiInvoice](s.data, "/api/v1/finance/invoices/")
	if err != nil {
		return err
	}
	billed := map[int64]bool{}
	for _, inv := range invoices {
		if billed[inv.Class] {
			continue
		}
		billed[inv.Class] = true
		var lines []finance.FeeItem
		for _, l := range inv.Lines {
			lines = append(lines, created[l.FeeItem])
		}
		if err := s.bill(fin, s.classes[inv.Class], head, lines); err != nil {
			return err
		}
	}
	for i, inv := range invoices {
		if inv.PaidMinor > 0 {
			if err := s.pay(fin, s.fakeStudents[inv.Student], inv.PaidMinor, "bank", fmt.Sprintf("FAKE-%d", i+1), head); err != nil {
				return err
			}
		}
	}
	return nil
}

// designFinance: every fee structure the fees design lists, Primary 1A–1C billed for the ones that
// apply to Primary 1, and the payments it lists (their balances are the design's arrears).
func (s *seeder) designFinance(fin *finance.PostgresStore, head int64) error {
	school := s.schools[1]
	var primaryOne []finance.FeeItem
	for _, st := range s.data.School.Fees.Structures {
		var level *int64
		if strings.HasPrefix(st.Grade, "Primary") || strings.HasPrefix(st.Grade, "Secondary") {
			if id, err := s.level(strings.Replace(st.Grade, "Secondary", "Senior", 1)); err == nil {
				level = &id
			}
		}
		item, err := s.feeItem(fin, school, st.Item, st.Amount*minorPerShilling, level)
		if err != nil {
			return err
		}
		if designAppliesToPrimaryOne(st.Grade) {
			primaryOne = append(primaryOne, item)
		}
	}
	for _, title := range s.data.School.Timetable.Classes {
		if err := s.bill(fin, s.designClasses[title], head, primaryOne); err != nil {
			return err
		}
	}
	for _, p := range s.data.School.Fees.Payments {
		if err := s.pay(fin, p.Name, p.Amount*minorPerShilling, method(p.Method, p.Ref), p.Ref, head); err != nil {
			return err
		}
	}
	return nil
}
