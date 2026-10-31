package insights

import (
	"slices"
	"testing"
)

func pct(v float64) *float64 { return &v }

func TestAssess(t *testing.T) {
	cases := []struct {
		name    string
		s       Signals
		level   string
		reasons []string
	}{
		{"nothing recorded yet", Signals{}, LevelOK, nil},
		{"doing well", Signals{DaysMarked: 20, DaysAttended: 19, WorkSet: 4, WorkDone: 4, Average: pct(0.78)}, LevelOK, nil},
		{"too few days to judge attendance", Signals{DaysMarked: 2, DaysAttended: 0}, LevelOK, nil},
		{"often absent", Signals{DaysMarked: 4, DaysAttended: 1}, LevelHigh, []string{"Attended 1 of the last 4 school days"}},
		{"sometimes absent", Signals{DaysMarked: 20, DaysAttended: 17}, LevelMedium, []string{"Attended 17 of the last 20 school days"}},
		{"struggling with marks", Signals{Average: pct(0.32)}, LevelHigh, []string{"Averaging 32% on marked work"}},
		{"marks slipping", Signals{Average: pct(0.5)}, LevelMedium, []string{"Averaging 50% on marked work"}},
		{"one piece missing", Signals{WorkSet: 3, WorkDone: 2}, LevelMedium, []string{"1 assignment not handed in"}},
		{"much missing", Signals{WorkSet: 5, WorkDone: 1}, LevelHigh, []string{"4 assignments not handed in"}},
		{
			"several concerns, worst wins",
			Signals{DaysMarked: 10, DaysAttended: 8, WorkSet: 2, WorkDone: 1, Average: pct(0.3)},
			LevelHigh,
			[]string{"Attended 8 of the last 10 school days", "Averaging 30% on marked work", "1 assignment not handed in"},
		},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			level, reasons := Assess(c.s)
			if level != c.level || !slices.Equal(reasons, c.reasons) {
				t.Errorf("got %s %q, want %s %q", level, reasons, c.level, c.reasons)
			}
		})
	}
}

func TestLevelsSortMostUrgentFirst(t *testing.T) {
	if !(rank(LevelHigh) < rank(LevelMedium) && rank(LevelMedium) < rank(LevelOK)) {
		t.Error("high, then medium, then ok")
	}
}
