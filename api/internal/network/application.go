package network

import (
	"fmt"
	"net/mail"
	"regexp"
	"slices"
	"strings"
	"time"
	"unicode/utf8"
)

// An application holds only what the person filled in on the school's form.
// Empty optional fields are left out, and nothing comes from their account.

type Applicant struct {
	First       string `json:"first"`
	Middle      string `json:"middle,omitempty"`
	Last        string `json:"last"`
	DOB         string `json:"dob"`
	Gender      string `json:"gender"`
	Nationality string `json:"nationality"`
}

type Guardian struct {
	Name         string `json:"name"`
	Relationship string `json:"relationship"`
	// Phone is stored as +256 and nine digits.
	Phone      string `json:"phone"`
	Email      string `json:"email,omitempty"`
	Occupation string `json:"occupation,omitempty"`
	Address    string `json:"address"`
}

type CurrentSchool struct {
	School string `json:"school,omitempty"`
	Grade  string `json:"grade,omitempty"`
	Year   string `json:"year,omitempty"`
}

type Academic struct {
	Stream       string   `json:"stream"`
	Subjects     []string `json:"subjects,omitempty"`
	PLEAggregate int      `json:"ple_aggregate"`
	PLEIndex     string   `json:"ple_index"`
	PLEYear      int      `json:"ple_year"`
	Boarding     string   `json:"boarding,omitempty"`
	Needs        string   `json:"needs,omitempty"`
}

// AttachedDocument names a file the applicant attached for a required document.
// Only the name is kept until Maple stores files.
type AttachedDocument struct {
	ID   string `json:"id"`
	File string `json:"file"`
}

// Shared is exactly what an applicant chose to send a school.
type Shared struct {
	ApplyingFor string             `json:"applying_for"`
	Applicant   Applicant          `json:"applicant"`
	Guardian    Guardian           `json:"guardian"`
	Current     *CurrentSchool     `json:"current,omitempty"`
	Academic    Academic           `json:"academic"`
	Documents   []AttachedDocument `json:"documents"`
}

// RequiredDocument is a document a school's form asks for.
type RequiredDocument struct {
	ID    string `json:"id"`
	Label string `json:"label"`
}

// ApplyForm is what a school's application form offers and needs.
type ApplyForm struct {
	Intake    *string            `json:"intake"`
	FeeUGX    *int64             `json:"fee_ugx"`
	Programs  []string           `json:"programs"`
	Documents []RequiredDocument `json:"documents"`
}

// submitRequest is the form as the app sends it.
type submitRequest struct {
	Consent     bool               `json:"consent"`
	ApplyingFor string             `json:"applying_for"`
	Applicant   Applicant          `json:"applicant"`
	Guardian    Guardian           `json:"guardian"`
	Current     CurrentSchool      `json:"current"`
	Academic    Academic           `json:"academic"`
	Documents   []AttachedDocument `json:"documents"`
}

const (
	minAge       = 5
	maxAge       = 25
	pleBest      = 4
	pleWorst     = 36
	firstPLEYear = 2000
	ugDigits     = 9
	maxShort     = 60
	maxText      = 120
	maxAddress   = 200
	maxNeeds     = 1000
	maxSubjects  = 15
)

var (
	stays    = []string{"", "Day", "Boarding", "Day & Boarding"}
	yearForm = regexp.MustCompile(`^\d{4}$`)
	digits   = regexp.MustCompile(`\D`)
)

// ugandaPhone returns +256 and the nine digits, accepting a leading 0 or 256, or "" if it isn't one.
func ugandaPhone(phone string) string {
	d := digits.ReplaceAllString(phone, "")
	switch {
	case strings.HasPrefix(d, "256"):
		d = d[3:]
	case strings.HasPrefix(d, "0"):
		d = d[1:]
	}
	if len(d) != ugDigits {
		return ""
	}
	return "+256" + d
}

// age is whole years from dob to today.
func age(dob, today time.Time) int {
	years := today.Year() - dob.Year()
	if today.Month() < dob.Month() || (today.Month() == dob.Month() && today.Day() < dob.Day()) {
		years--
	}
	return years
}

type check struct {
	bad     bool
	problem string
}

func tooLong(s string, n int) bool { return utf8.RuneCountInString(s) > n }

func tooLongAny(n int, values ...string) bool {
	return slices.ContainsFunc(values, func(v string) bool { return tooLong(v, n) })
}

func trim(fields ...*string) {
	for _, f := range fields {
		*f = strings.TrimSpace(*f)
	}
}

// shared checks a submission against the school's form and returns what to
// store, or the first thing to fix.
func (req submitRequest) shared(form ApplyForm, today time.Time) (Shared, string) {
	a, g, c, ac := req.Applicant, req.Guardian, req.Current, req.Academic
	trim(&req.ApplyingFor, &a.First, &a.Middle, &a.Last, &a.DOB, &a.Gender, &a.Nationality,
		&g.Name, &g.Relationship, &g.Phone, &g.Email, &g.Occupation, &g.Address,
		&c.School, &c.Grade, &c.Year, &ac.Stream, &ac.PLEIndex, &ac.Boarding, &ac.Needs)
	dob, dobErr := time.Parse(dateLayout, a.DOB)
	years := age(dob, today)
	phone := ugandaPhone(g.Phone)

	checks := []check{
		{!req.Consent, "Confirm the details are true and agree to share them with this school."},
		{req.ApplyingFor == "" || (len(form.Programs) > 0 && !slices.Contains(form.Programs, req.ApplyingFor)), "Choose what you're applying for from the school's list."},
		{a.First == "" || a.Last == "", "Enter the learner's first and last name."},
		{dobErr != nil, "Enter the date of birth as YYYY-MM-DD."},
		{!dob.Before(today), "Enter a date of birth in the past."},
		{years < minAge || years > maxAge, fmt.Sprintf("Learners must be %d to %d years old.", minAge, maxAge)},
		{a.Gender == "" || a.Nationality == "", "Choose the learner's gender and nationality."},
		{g.Name == "" || g.Relationship == "", "Enter the parent or guardian's name and relationship."},
		{phone == "", "Enter the guardian's phone number: the 9 digits after +256."},
		{g.Email != "" && !validEmail(g.Email), "Enter an email like name@example.com."},
		{g.Address == "", "Enter the home address."},
		{c.Year != "" && !yearForm.MatchString(c.Year), "Enter the current school year as four digits."},
		{ac.Stream == "", "Choose a stream."},
		{ac.PLEAggregate < pleBest || ac.PLEAggregate > pleWorst, fmt.Sprintf("PLE aggregates run from %d to %d.", pleBest, pleWorst)},
		{ac.PLEIndex == "", "Enter the PLE index number."},
		{ac.PLEYear < firstPLEYear || ac.PLEYear > today.Year(), "Enter the year of the PLE sitting."},
		{!slices.Contains(stays, ac.Boarding), "Boarding must be Day, Boarding or Day & Boarding."},
		{tooLongAny(maxShort, a.First, a.Middle, a.Last, a.Gender, a.Nationality, g.Relationship, c.Grade, ac.Stream, ac.PLEIndex), "Names and choices can be up to 60 characters."},
		{tooLongAny(maxText, req.ApplyingFor, g.Name, g.Email, g.Occupation, c.School), "Names, emails and schools can be up to 120 characters."},
		{tooLong(g.Address, maxAddress), "The address can be up to 200 characters."},
		{tooLong(ac.Needs, maxNeeds), "Notes about the learner's needs can be up to 1,000 characters."},
	}
	for _, ch := range checks {
		if ch.bad {
			return Shared{}, ch.problem
		}
	}
	subjects, problem := cleanSubjects(ac.Subjects)
	if problem != "" {
		return Shared{}, problem
	}
	docs, problem := checkDocuments(req.Documents, form.Documents)
	if problem != "" {
		return Shared{}, problem
	}
	g.Phone = phone
	ac.Subjects = subjects
	out := Shared{ApplyingFor: req.ApplyingFor, Applicant: a, Guardian: g, Academic: ac, Documents: docs}
	if c != (CurrentSchool{}) {
		out.Current = &c
	}
	return out, ""
}

func validEmail(s string) bool {
	addr, err := mail.ParseAddress(s)
	if err != nil || addr.Name != "" || addr.Address != s {
		return false
	}
	return strings.Contains(s[strings.LastIndex(s, "@"):], ".")
}

func cleanSubjects(in []string) ([]string, string) {
	if len(in) > maxSubjects {
		return nil, fmt.Sprintf("Choose up to %d subjects.", maxSubjects)
	}
	out := make([]string, 0, len(in))
	for _, s := range in {
		s = strings.TrimSpace(s)
		if s == "" || tooLong(s, maxShort) {
			return nil, "Each subject needs a name of up to 60 characters."
		}
		if !slices.Contains(out, s) {
			out = append(out, s)
		}
	}
	return out, ""
}

// checkDocuments needs one attached file for each document the school asks for, and nothing else.
func checkDocuments(got []AttachedDocument, need []RequiredDocument) ([]AttachedDocument, string) {
	out := make([]AttachedDocument, 0, len(got))
	for _, d := range got {
		d.ID, d.File = strings.TrimSpace(d.ID), strings.TrimSpace(d.File)
		asked := slices.ContainsFunc(need, func(r RequiredDocument) bool { return r.ID == d.ID })
		if !asked || slices.ContainsFunc(out, func(o AttachedDocument) bool { return o.ID == d.ID }) {
			return nil, "Attach only the documents this school asks for, once each."
		}
		if d.File == "" || tooLong(d.File, maxAddress) {
			return nil, "Each attached document needs a file name of up to 200 characters."
		}
		out = append(out, d)
	}
	for _, r := range need {
		if !slices.ContainsFunc(out, func(o AttachedDocument) bool { return o.ID == r.ID }) {
			return nil, "Attach the " + r.Label + "."
		}
	}
	return out, ""
}
