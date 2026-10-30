package finance

import "testing"

func TestMoneyMatchesTheApp(t *testing.T) {
	cases := []struct {
		minor    int64
		currency string
		want     string
	}{
		{650000, "UGX", "UGX 650,000"},
		{1000, "UGX", "UGX 1,000"},
		{999, "UGX", "UGX 999"},
		{0, "KES", "KES 0"},
		{1234567890, "UGX", "UGX 1,234,567,890"},
		{-2500, "UGX", "UGX -2,500"},
	}
	for _, c := range cases {
		if got := money(c.minor, c.currency); got != c.want {
			t.Errorf("money(%d, %s) = %q, want %q", c.minor, c.currency, got, c.want)
		}
	}
}

func TestMethodNames(t *testing.T) {
	for method, want := range map[string]string{"mtn_momo": "MTN Mobile Money", "airtel_money": "Airtel Money", "card": "card", "cash": "cash", "bank": "bank transfer"} {
		if got := methodName(method); got != want {
			t.Errorf("methodName(%s) = %q, want %q", method, got, want)
		}
	}
}
