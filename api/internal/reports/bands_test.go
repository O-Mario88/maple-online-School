package reports

import "testing"

func TestBandMatchesTheNCDCScale(t *testing.T) {
	cases := []struct {
		formative, summative float64
		total                float64
		grade, descriptor    string
	}{
		{20, 80, 100, "A*", "Outstanding"},
		{18, 72, 90, "A*", "Outstanding"},
		{17, 72.9, 89.9, "A", "Excellent"},
		{15, 55, 70, "B", "Very Good"},
		{12, 48, 60, "C", "Good"},
		{10, 40, 50, "D", "Moderate"},
		{8, 32, 40, "E", "Basic"},
		{6, 24, 30, "F", "Below Average"},
		{5, 10, 15, "G", "Ungraded"},
		{0, 0, 0, "G", "Ungraded"},
	}
	for _, tc := range cases {
		b := Band(tc.formative + tc.summative)
		if b.Total != tc.total || b.Grade != tc.grade || b.Descriptor != tc.descriptor {
			t.Errorf("%v+%v: got %+v, want %v %s %s", tc.formative, tc.summative, b, tc.total, tc.grade, tc.descriptor)
		}
	}
}

func TestBandRoundsToOneDecimalLikeDjango(t *testing.T) {
	if b := Band(89.96); b.Total != 90 || b.Grade != "A*" {
		t.Fatalf("89.96 should round to 90.0 and be A*, got %+v", b)
	}
}
