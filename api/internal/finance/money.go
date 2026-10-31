package finance

import (
	"strconv"
	"strings"
)

// money writes whole minor units the way the app shows them: "UGX 650,000".
func money(minor int64, currency string) string {
	digits := strconv.FormatInt(minor, 10)
	sign := ""
	if strings.HasPrefix(digits, "-") {
		sign, digits = "-", digits[1:]
	}
	var b strings.Builder
	for i, d := range digits {
		if i > 0 && (len(digits)-i)%3 == 0 {
			b.WriteByte(',')
		}
		b.WriteRune(d)
	}
	return currency + " " + sign + b.String()
}

// methodName is how a payment method reads in a sentence.
func methodName(method string) string {
	switch method {
	case "mtn_momo":
		return "MTN Mobile Money"
	case "airtel_money":
		return "Airtel Money"
	case "bank":
		return "bank transfer"
	default:
		return method
	}
}
