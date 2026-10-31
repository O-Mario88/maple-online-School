package signup

import (
	"context"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/identity"
	"github.com/O-Mario88/maple-online-School/api/internal/testkit"
)

const strong = "Kampala-Rains-2026"

// inbox records emails instead of sending them.
type inbox struct {
	mu   sync.Mutex
	sent []Message
}

func (b *inbox) Send(_ context.Context, m Message) error {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.sent = append(b.sent, m)
	return nil
}

func (b *inbox) to(addr string) []Message {
	b.mu.Lock()
	defer b.mu.Unlock()
	var out []Message
	for _, m := range b.sent {
		if strings.EqualFold(m.To, addr) {
			out = append(out, m)
		}
	}
	return out
}

var tokenInLink = regexp.MustCompile(`token=([A-Za-z0-9._\-]+)`)

func tokenFrom(t *testing.T, m Message) string {
	t.Helper()
	match := tokenInLink.FindStringSubmatch(m.Body)
	if match == nil {
		t.Fatalf("no link in email: %s", m.Body)
	}
	return match[1]
}

type env struct {
	w    *testkit.World
	mail *inbox
}

func newEnv(t *testing.T) env {
	w := testkit.New(t)
	mail := &inbox{}
	r := chi.NewRouter()
	NewHandler(NewPostgresStore(w.Pool), Signer{Key: []byte(strings.Repeat("s", 32))}, mail, "https://app.maple.test").Mount(r)
	w.Router = r
	return env{w: w, mail: mail}
}

// email makes a unique address and removes whatever the API created for it.
func (e env) email(t *testing.T, name string) string {
	addr := fmt.Sprintf("%s.%d@signup.test", name, time.Now().UnixNano())
	t.Cleanup(func() {
		ctx := context.Background()
		users := `(SELECT id FROM accounts_user WHERE lower(email) = lower($1))`
		for _, q := range []string{
			`DELETE FROM parent_portal_parentstudentlink WHERE student_profile_id IN (SELECT id FROM accounts_studentprofile WHERE user_id IN ` + users + `) OR parent_profile_id IN (SELECT id FROM accounts_parentprofile WHERE user_id IN ` + users + `)`,
			`DELETE FROM accounts_studentprofile WHERE user_id IN ` + users,
			`DELETE FROM accounts_teacherprofile WHERE user_id IN ` + users,
			`DELETE FROM accounts_parentprofile WHERE user_id IN ` + users,
			`DELETE FROM accounts_institutionadminprofile WHERE user_id IN ` + users,
			`DELETE FROM accounts_user WHERE lower(email) = lower($1)`,
		} {
			_, _ = e.w.Pool.Exec(ctx, q, addr)
		}
	})
	return addr
}

func (e env) post(path string, body any) (int, map[string]any) {
	return e.w.Call(0, http.MethodPost, path, body)
}

func (e env) passwordOf(t *testing.T, email string) (string, bool) {
	t.Helper()
	var hash string
	var verified bool
	if err := e.w.Pool.QueryRow(t.Context(), `SELECT password, email_verified FROM accounts_user WHERE lower(email) = lower($1)`, email).Scan(&hash, &verified); err != nil {
		t.Fatalf("load account: %v", err)
	}
	return hash, verified
}

func TestRegisterAndActivate(t *testing.T) {
	e := newEnv(t)
	addr := e.email(t, "new.student")
	body := map[string]any{"email": addr, "full_name": "New Student", "country_code": "UG", "password": strong, "role": "student"}

	code, created := e.post("/api/v1/auth/register/", body)
	if code != http.StatusCreated || created["email_verified"] != false || created["role"] != "student" {
		t.Fatalf("register: %d %v", code, created)
	}
	var profiles int
	_ = e.w.Pool.QueryRow(t.Context(), `SELECT count(*) FROM accounts_studentprofile WHERE user_id = $1`, testkit.ID(created)).Scan(&profiles)
	if profiles != 1 {
		t.Errorf("a student gets a student profile, got %d", profiles)
	}

	refused := []map[string]any{
		{"email": strings.ToUpper(addr), "full_name": "Again", "country_code": "UG", "password": strong, "role": "student"},
		{"email": e.email(t, "admin"), "full_name": "Admin", "country_code": "UG", "password": strong, "role": "admin"},
		{"email": e.email(t, "parent"), "full_name": "Parent", "country_code": "UG", "password": strong, "role": "parent"},
		{"email": e.email(t, "weak"), "full_name": "Weak", "country_code": "UG", "password": "12345678", "role": "teacher"},
		{"email": "not-an-email", "full_name": "Bad", "country_code": "UG", "password": strong, "role": "teacher"},
	}
	for _, b := range refused {
		if code, res := e.post("/api/v1/auth/register/", b); code != http.StatusBadRequest {
			t.Errorf("%v: want 400, got %d %v", b, code, res)
		}
	}

	mails := e.mail.to(addr)
	if len(mails) != 1 || !strings.Contains(mails[0].Body, "https://app.maple.test/activate?token=") {
		t.Fatalf("one activation email with an app link: %+v", mails)
	}
	token := tokenFrom(t, mails[0])
	if code, res := e.post("/api/v1/auth/activate/", map[string]any{"token": token}); code != http.StatusOK {
		t.Fatalf("activate: %d %v", code, res)
	}
	if _, verified := e.passwordOf(t, addr); !verified {
		t.Errorf("the email is verified after activation")
	}
	if code, _ := e.post("/api/v1/auth/activate/", map[string]any{"token": token}); code != http.StatusBadRequest {
		t.Errorf("an activation link works once: %d", code)
	}
}

func TestForgotAndResetPassword(t *testing.T) {
	e := newEnv(t)
	addr := e.email(t, "forgetful")
	e.post("/api/v1/auth/register/", map[string]any{"email": addr, "full_name": "Forgetful", "country_code": "UG", "password": strong, "role": "teacher"})
	before, _ := e.passwordOf(t, addr)

	unknown, _ := e.post("/api/v1/auth/forgot-password/", map[string]any{"email": "nobody.here@signup.test"})
	known, _ := e.post("/api/v1/auth/forgot-password/", map[string]any{"email": strings.ToUpper(addr)})
	if unknown != http.StatusOK || known != http.StatusOK {
		t.Fatalf("the reply never reveals whether an account exists: %d %d", unknown, known)
	}
	if len(e.mail.to("nobody.here@signup.test")) != 0 {
		t.Errorf("no email for an unknown address")
	}
	var reset Message
	for _, m := range e.mail.to(addr) {
		if strings.Contains(m.Body, "/reset-password?token=") {
			reset = m
		}
	}
	token := tokenFrom(t, reset)

	if code, _ := e.post("/api/v1/auth/reset-password/", map[string]any{"token": token, "password": "password123"}); code != http.StatusBadRequest {
		t.Errorf("a weak new password is refused: %d", code)
	}
	if code, res := e.post("/api/v1/auth/reset-password/", map[string]any{"token": token, "password": "New-Harvest-Moon-77"}); code != http.StatusOK {
		t.Fatalf("reset: %d %v", code, res)
	}
	after, verified := e.passwordOf(t, addr)
	if ok, _ := identity.CheckPassword("New-Harvest-Moon-77", after); !ok || after == before || !verified {
		t.Errorf("the new password works and the email counts as verified")
	}
	if code, _ := e.post("/api/v1/auth/reset-password/", map[string]any{"token": token, "password": "Another-Moon-88"}); code != http.StatusBadRequest {
		t.Errorf("a reset link works once: %d", code)
	}
}

func TestStudentOnboardingWithAParent(t *testing.T) {
	e := newEnv(t)
	student, parent := e.email(t, "kid"), e.email(t, "mum")
	body := map[string]any{
		"student": map[string]any{"email": student, "full_name": "Kid Okello", "country_code": "UG", "password": strong},
		"parent":  map[string]any{"email": parent, "full_name": "Mum Okello", "phone": "+256700000001", "relationship": "mother"},
	}
	if code, res := e.post("/api/v1/auth/onboard-student/", body); code != http.StatusCreated {
		t.Fatalf("onboard: %d %v", code, res)
	}
	consent := func(studentEmail string) string {
		var c string
		_ = e.w.Pool.QueryRow(t.Context(), `SELECT l.consent_status FROM parent_portal_parentstudentlink l
			JOIN accounts_studentprofile s ON s.id = l.student_profile_id JOIN accounts_user u ON u.id = s.user_id
			WHERE lower(u.email) = lower($1)`, studentEmail).Scan(&c)
		return c
	}
	if consent(student) != "approved" {
		t.Errorf("a parent created together with the student is linked at once")
	}
	if len(e.mail.to(parent)) != 1 || !strings.Contains(e.mail.to(parent)[0].Body, "/reset-password?token=") {
		t.Errorf("the new parent gets a link to set their password: %+v", e.mail.to(parent))
	}

	sibling := e.email(t, "sibling")
	body["student"] = map[string]any{"email": sibling, "full_name": "Sibling Okello", "country_code": "UG", "password": strong}
	body["parent"] = map[string]any{"email": strings.ToUpper(parent), "full_name": "Someone Else", "relationship": "mother"}
	if code, res := e.post("/api/v1/auth/onboard-student/", body); code != http.StatusCreated {
		t.Fatalf("onboard sibling: %d %v", code, res)
	}
	if consent(sibling) != "pending" {
		t.Errorf("linking to an existing parent waits for that parent to approve, got %q", consent(sibling))
	}

	body["student"] = map[string]any{"email": e.email(t, "orphan"), "full_name": "No Parent Email", "country_code": "UG", "password": strong}
	body["parent"] = map[string]any{"full_name": "Phone Only", "phone": "+256700000002"}
	if code, _ := e.post("/api/v1/auth/onboard-student/", body); code != http.StatusBadRequest {
		t.Errorf("a parent needs an email address to sign in: %d", code)
	}
}

// An invited member of staff has no password; the invitation's link sets one
// and confirms their email.
func TestInvitationSetsAPasswordAndVerifiesTheEmail(t *testing.T) {
	e := newEnv(t)
	var id int64
	email := "invited." + strings.ToLower(t.Name()) + "@invite.test"
	if err := e.w.Pool.QueryRow(context.Background(), `INSERT INTO accounts_user (password, is_superuser, email, full_name, country_code, role,
		whatsapp_opt_in, is_active, is_staff, date_joined, email_verified)
		VALUES ('!', false, $1, 'Invited Teacher', 'UG', 'teacher', false, true, false, now(), false) RETURNING id`, email).Scan(&id); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _, _ = e.w.Pool.Exec(context.Background(), `DELETE FROM accounts_user WHERE id = $1`, id) })

	inviter := Inviter{Links: Signer{Key: []byte(strings.Repeat("s", 32))}, Mail: e.mail, AppURL: "https://app.maple.test"}
	inviter.SendInvite(context.Background(), Account{ID: id, Email: email, FullName: "Invited Teacher", Password: "!", IsActive: true}, "Invite School", "class teacher", true)
	msgs := e.mail.to(email)
	if len(msgs) != 1 || !strings.Contains(msgs[0].Body, "Invite School") || !strings.Contains(msgs[0].Body, "/reset-password?token=") {
		t.Fatalf("one invitation with a set-password link: %v", msgs)
	}
	code, res := e.w.Call(0, http.MethodPost, "/api/v1/auth/reset-password/", map[string]any{"token": tokenFrom(t, msgs[0]), "password": strong})
	if code != http.StatusOK {
		t.Fatalf("set password from invitation: %d %v", code, res)
	}
	var verified bool
	_ = e.w.Pool.QueryRow(context.Background(), `SELECT email_verified FROM accounts_user WHERE id = $1`, id).Scan(&verified)
	if !verified {
		t.Error("opening the invitation proves the email address")
	}

	// Someone who already has an account is told to open Maple and accept.
	inviter.SendInvite(context.Background(), Account{ID: id, Email: email, FullName: "Invited Teacher", Password: "x", IsActive: true}, "Invite School", "class teacher", false)
	if msgs := e.mail.to(email); len(msgs) != 2 || strings.Contains(msgs[1].Body, "token=") {
		t.Errorf("existing accounts get an accept message, not a link: %v", msgs)
	}
}
