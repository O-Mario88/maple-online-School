package main

import (
	"testing"
	"time"
)

func TestPeriodReadsTheDesignsTimes(t *testing.T) {
	cases := []struct{ span, start, end string }{
		{"8:00 – 8:40", "08:00", "08:40"},
		{"12:20 – 1:00", "12:20", "13:00"},
		{"1:40 – 2:20", "13:40", "14:20"},
	}
	for _, c := range cases {
		start, end, err := period(c.span)
		if err != nil || start != c.start || end != c.end {
			t.Errorf("period(%q) = %s, %s, %v; want %s, %s", c.span, start, end, err, c.start, c.end)
		}
	}
	if _, _, err := period("Break"); err == nil {
		t.Error("a row with no times should be an error")
	}
}

func TestLastSchoolDaysSkipTheWeekend(t *testing.T) {
	monday := time.Date(2026, 11, 9, 9, 0, 0, 0, time.UTC)
	days := lastSchoolDays(monday, 5)
	want := []string{"2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06"}
	for i, d := range days {
		if d.Format(time.DateOnly) != want[i] {
			t.Fatalf("day %d = %s, want %s", i, d.Format(time.DateOnly), want[i])
		}
	}
}

func TestSplitUsesTheNCDCScale(t *testing.T) {
	f, s := split(86)
	if f != 17 || s != 69 {
		t.Fatalf("split(86) = %v + %v, want 17 + 69", f, s)
	}
}

func TestMethodMapsTheDesignsPayments(t *testing.T) {
	cases := map[[2]string]string{
		{"Cash", "RCPT-00452"}:     "cash",
		{"Bank Transfer", "UTB1"}:  "bank",
		{"Mobile Money", "MTN1"}:   "mtn_momo",
		{"Mobile Money", "AIRTEL"}: "airtel_money",
	}
	for in, want := range cases {
		if got := method(in[0], in[1]); got != want {
			t.Errorf("method(%q, %q) = %q, want %q", in[0], in[1], got, want)
		}
	}
}

func TestUpcomingMovesTheEarliestDateToTomorrowAndKeepsTheSpacing(t *testing.T) {
	when, err := upcoming([]string{"2026-11-03T09:00:00Z", "2026-11-02T12:00:00Z"})
	if err != nil {
		t.Fatal(err)
	}
	first, _ := when("2026-11-02T12:00:00Z")
	second, _ := when("2026-11-03T09:00:00Z")
	tomorrow := time.Now().Truncate(24*time.Hour).AddDate(0, 0, 1)
	if !first.Truncate(24 * time.Hour).Equal(tomorrow) {
		t.Errorf("first lesson on %s, want tomorrow %s", first, tomorrow)
	}
	if second.Sub(first) != 21*time.Hour {
		t.Errorf("lessons %s apart, want 21h", second.Sub(first))
	}
}

func TestEmailForMakesADesignAddress(t *testing.T) {
	if got := emailFor("Mrs. A. Namaganda"); got != "mrs.a.namaganda@design.maple.test" {
		t.Fatalf("got %q", got)
	}
}
