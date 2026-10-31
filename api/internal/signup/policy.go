package signup

import (
	"slices"
	"strings"
	"unicode"
)

const (
	minPassword = 8
	maxPassword = 128
)

// common is a short list of passwords people pick most; Django checks a
// longer one. The rule that matters most is length.
var common = []string{
	"password", "password1", "password123", "12345678", "123456789", "1234567890", "qwerty123",
	"iloveyou", "admin123", "welcome1", "letmein1", "abc12345", "uganda123", "kampala123", "maple123",
}

// passwordProblem returns why a password won't do, or "" if it's fine.
func passwordProblem(password, email string) string {
	switch {
	case len(password) < minPassword:
		return "Use at least 8 characters."
	case len(password) > maxPassword:
		return "Use at most 128 characters."
	case strings.IndexFunc(password, func(r rune) bool { return !unicode.IsDigit(r) }) < 0:
		return "Don't use only numbers."
	case slices.Contains(common, strings.ToLower(password)):
		return "That password is too common."
	}
	local, _, _ := strings.Cut(strings.ToLower(email), "@")
	if local != "" && strings.Contains(strings.ToLower(password), local) {
		return "Don't use your email address in your password."
	}
	return ""
}
