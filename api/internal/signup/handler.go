package signup

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"net/mail"
	"slices"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/httpx"
	"github.com/O-Mario88/maple-online-School/api/internal/identity"
)

const (
	maxEmail     = 254
	maxName      = 255
	signupLimit  = 10
	linkLimit    = 20
	limitWindow  = 10 * time.Minute
	resetMessage = "If an account with that email exists, we have sent a link to reset the password."
)

// Roles people may pick for themselves. Administrators are made by hand;
// parents are added through student onboarding.
var selfServiceRoles = []string{"student", "teacher", "institution"}

var relationships = []string{"mother", "father", "guardian", "other"}

// Store is what the handler needs from the database.
type Store interface {
	CreateAccount(ctx context.Context, a NewAccount) (Account, error)
	OnboardStudent(ctx context.Context, student NewAccount, parent ParentInput) (Onboarded, error)
	Account(ctx context.Context, id int64) (Account, error)
	AccountByEmail(ctx context.Context, email string) (Account, error)
	MarkVerified(ctx context.Context, id int64) error
	SetPassword(ctx context.Context, id int64, hash string) error
}

// Handler serves sign-up, email verification and password reset.
type Handler struct {
	store  Store
	links  Signer
	mail   Mailer
	appURL string
	now    func() time.Time
}

// NewHandler wires the routes. appURL is where emailed links point (the app).
func NewHandler(store Store, links Signer, mailer Mailer, appURL string) *Handler {
	return &Handler{store: store, links: links, mail: mailer, appURL: strings.TrimRight(appURL, "/"), now: time.Now}
}

// Mount registers the routes. These are open to anyone, so each is rate limited.
func (h *Handler) Mount(r chi.Router) {
	r.With(httpx.RateLimit(signupLimit, limitWindow)).Post("/api/v1/auth/register/", h.register)
	r.With(httpx.RateLimit(signupLimit, limitWindow)).Post("/api/v1/auth/onboard-student/", h.onboardStudent)
	r.With(httpx.RateLimit(signupLimit, limitWindow)).Post("/api/v1/auth/forgot-password/", h.forgotPassword)
	r.With(httpx.RateLimit(signupLimit, limitWindow)).Post("/api/v1/auth/resend-activation/", h.resendActivation)
	r.With(httpx.RateLimit(linkLimit, limitWindow)).Post("/api/v1/auth/activate/", h.activate)
	r.With(httpx.RateLimit(linkLimit, limitWindow)).Post("/api/v1/auth/reset-password/", h.resetPassword)
}

// ---- sign-up --------------------------------------------------------------------

type signupInput struct {
	Email       string `json:"email"`
	FullName    string `json:"full_name"`
	CountryCode string `json:"country_code"`
	Password    string `json:"password"`
	Role        string `json:"role"`
}

// account checks the fields and hashes the password. It returns a message for a 400.
func (in signupInput) account(role string) (NewAccount, string) {
	email := strings.TrimSpace(in.Email)
	name := strings.TrimSpace(in.FullName)
	country := strings.ToUpper(strings.TrimSpace(in.CountryCode))
	switch {
	case !validEmail(email):
		return NewAccount{}, "Enter a valid email address."
	case name == "" || len(name) > maxName:
		return NewAccount{}, "Enter your full name."
	case len(country) < 2 || len(country) > 10:
		return NewAccount{}, "Choose your country."
	}
	if msg := passwordProblem(in.Password, email); msg != "" {
		return NewAccount{}, msg
	}
	hash, err := identity.HashPassword(in.Password)
	if err != nil {
		return NewAccount{}, "Something went wrong. Please try again."
	}
	return NewAccount{Email: strings.ToLower(email), FullName: name, CountryCode: country, Role: role, PasswordHash: hash}, ""
}

func (h *Handler) register(w http.ResponseWriter, r *http.Request) {
	var in signupInput
	if err := httpx.DecodeJSON(r, &in); err != nil {
		badRequest(w, "Send email, full_name, country_code, password and role.")
		return
	}
	if !slices.Contains(selfServiceRoles, in.Role) {
		badRequest(w, "Choose student, teacher or institution.")
		return
	}
	a, msg := in.account(in.Role)
	if msg != "" {
		badRequest(w, msg)
		return
	}
	acct, err := h.store.CreateAccount(r.Context(), a)
	if errors.Is(err, ErrEmailTaken) {
		badRequest(w, "An account with this email already exists. Sign in or reset your password.")
		return
	}
	if err != nil {
		serverError(w, "create account", err)
		return
	}
	h.sendActivation(r.Context(), acct)
	httpx.WriteJSON(w, http.StatusCreated, map[string]any{
		"id": acct.ID, "email": acct.Email, "full_name": acct.FullName, "role": a.Role,
		"country_code": a.CountryCode, "email_verified": false,
	})
}

func (h *Handler) onboardStudent(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Student signupInput `json:"student"`
		Parent  struct {
			Email        string `json:"email"`
			FullName     string `json:"full_name"`
			Phone        string `json:"phone"`
			Relationship string `json:"relationship"`
		} `json:"parent"`
	}
	if err := httpx.DecodeJSON(r, &in); err != nil {
		badRequest(w, "Send the student's and the parent's details.")
		return
	}
	student, msg := in.Student.account("student")
	if msg != "" {
		badRequest(w, msg)
		return
	}
	parent := ParentInput{
		Email: strings.ToLower(strings.TrimSpace(in.Parent.Email)), FullName: strings.TrimSpace(in.Parent.FullName),
		Relationship: strings.ToLower(strings.TrimSpace(in.Parent.Relationship)),
	}
	if parent.Relationship == "" {
		parent.Relationship = "guardian"
	}
	switch {
	case !validEmail(parent.Email):
		badRequest(w, "Enter the parent's email address so they can sign in.")
		return
	case parent.Email == student.Email:
		badRequest(w, "The parent needs a different email address from the student.")
		return
	case parent.FullName == "" || len(parent.FullName) > maxName:
		badRequest(w, "Enter the parent's full name.")
		return
	case !slices.Contains(relationships, parent.Relationship):
		badRequest(w, "Relationship must be mother, father, guardian or other.")
		return
	}
	done, err := h.store.OnboardStudent(r.Context(), student, parent)
	if errors.Is(err, ErrEmailTaken) {
		badRequest(w, "One of these email addresses already has an account that isn't a parent account.")
		return
	}
	if err != nil {
		serverError(w, "onboard student", err)
		return
	}
	h.sendActivation(r.Context(), done.Student)
	if done.NewParent != nil {
		h.sendParentWelcome(r.Context(), *done.NewParent, done.Student.FullName)
	}
	link := "pending" // an existing parent approves the link from their account
	if done.NewParent != nil {
		link = "approved"
	}
	httpx.WriteJSON(w, http.StatusCreated, map[string]any{
		"message":     "Account created. Check your email to activate it.",
		"student":     map[string]any{"id": done.Student.ID, "email": done.Student.Email},
		"parent_link": link,
	})
}

// ---- links ----------------------------------------------------------------------

func (h *Handler) activate(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Token string `json:"token"`
	}
	if err := httpx.DecodeJSON(r, &in); err != nil {
		badRequest(w, "Send the token from the email.")
		return
	}
	acct, ok := h.checkLink(w, r, in.Token, Activate)
	if !ok {
		return
	}
	if err := h.store.MarkVerified(r.Context(), acct.ID); err != nil {
		serverError(w, "verify email", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"message": "Email verified. You can now sign in.", "email": acct.Email})
}

func (h *Handler) resendActivation(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Email string `json:"email"`
	}
	_ = httpx.DecodeJSON(r, &in)
	acct, err := h.store.AccountByEmail(r.Context(), strings.TrimSpace(in.Email))
	if err == nil && acct.IsActive && !acct.EmailVerified {
		h.sendActivation(r.Context(), acct)
	} else if err != nil && !errors.Is(err, ErrNotFound) {
		slog.Error("signup: resend activation", "err", err)
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"message": "If that account still needs activating, we have sent a new link."})
}

// forgotPassword always gives the same answer, so it can't be used to find
// out who has an account.
func (h *Handler) forgotPassword(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Email string `json:"email"`
	}
	_ = httpx.DecodeJSON(r, &in)
	acct, err := h.store.AccountByEmail(r.Context(), strings.TrimSpace(in.Email))
	switch {
	case err == nil && acct.IsActive:
		link := fmt.Sprintf("%s/reset-password?token=%s", h.appURL, h.links.Make(Reset, acct, h.now()))
		h.send(r.Context(), Message{To: acct.Email, Subject: "Reset your Maple Online School password", Body: fmt.Sprintf(
			"Hi %s,\n\nSomeone asked to reset the password for your Maple Online School account. "+
				"To choose a new password, open this link within 2 hours:\n\n%s\n\nIf it wasn't you, ignore this email.\n",
			acct.FullName, link)})
	case err != nil && !errors.Is(err, ErrNotFound):
		slog.Error("signup: forgot password", "err", err)
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"message": resetMessage})
}

func (h *Handler) resetPassword(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Token    string `json:"token"`
		Password string `json:"password"`
	}
	if err := httpx.DecodeJSON(r, &in); err != nil {
		badRequest(w, "Send the token from the email and the new password.")
		return
	}
	acct, ok := h.checkLink(w, r, in.Token, Reset)
	if !ok {
		return
	}
	if msg := passwordProblem(in.Password, acct.Email); msg != "" {
		badRequest(w, msg)
		return
	}
	hash, err := identity.HashPassword(in.Password)
	if err != nil {
		serverError(w, "hash password", err)
		return
	}
	if err := h.store.SetPassword(r.Context(), acct.ID, hash); err != nil {
		serverError(w, "set password", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"message": "Password changed. You can now sign in.", "email": acct.Email})
}

// checkLink loads the account a token names and checks the token, writing
// 400 for any bad link without saying why.
func (h *Handler) checkLink(w http.ResponseWriter, r *http.Request, token string, p Purpose) (Account, bool) {
	id, err := h.links.Read(token, p)
	if err != nil {
		badRequest(w, "This link is invalid or has expired. Ask for a new one.")
		return Account{}, false
	}
	acct, err := h.store.Account(r.Context(), id)
	if err != nil && !errors.Is(err, ErrNotFound) {
		serverError(w, "load account", err)
		return Account{}, false
	}
	if err != nil || !acct.IsActive || h.links.Check(token, p, acct, h.now()) != nil {
		badRequest(w, "This link is invalid or has expired. Ask for a new one.")
		return Account{}, false
	}
	return acct, true
}

// ---- email ----------------------------------------------------------------------

func (h *Handler) sendActivation(ctx context.Context, acct Account) {
	link := fmt.Sprintf("%s/activate?token=%s", h.appURL, h.links.Make(Activate, acct, h.now()))
	h.send(ctx, Message{To: acct.Email, Subject: "Activate your Maple Online School account", Body: fmt.Sprintf(
		"Hi %s,\n\nWelcome to Maple Online School. Activate your account by opening this link within 7 days:\n\n%s\n\n"+
			"If you didn't sign up, ignore this email.\n", acct.FullName, link)})
}

func (h *Handler) sendParentWelcome(ctx context.Context, parent Account, studentName string) {
	link := fmt.Sprintf("%s/reset-password?token=%s", h.appURL, h.links.Make(Reset, parent, h.now()))
	h.send(ctx, Message{To: parent.Email, Subject: "Your Maple Online School parent account", Body: fmt.Sprintf(
		"Hi %s,\n\n%s has joined Maple Online School and named you as their parent or guardian. "+
			"Choose a password to follow their progress (this link works for 2 hours; after that use \"Forgot password\"):\n\n%s\n\n"+
			"If you don't know this student, ignore this email.\n", parent.FullName, studentName, link)})
}

// send delivers an email; a failure is logged, not shown, because the person
// can always ask for the link again.
func (h *Handler) send(ctx context.Context, m Message) {
	if err := h.mail.Send(ctx, m); err != nil {
		slog.Error("signup: send email", "subject", m.Subject, "err", err)
	}
}

// ---- helpers ------------------------------------------------------------------

func validEmail(s string) bool {
	if s == "" || len(s) > maxEmail {
		return false
	}
	addr, err := mail.ParseAddress(s)
	return err == nil && addr.Address == s && addr.Name == ""
}

func badRequest(w http.ResponseWriter, msg string) {
	httpx.WriteError(w, http.StatusBadRequest, "invalid", msg)
}

func serverError(w http.ResponseWriter, action string, err error) {
	slog.Error("signup: "+action, "err", err)
	httpx.WriteError(w, http.StatusInternalServerError, "server_error", "Something went wrong. Please try again.")
}
