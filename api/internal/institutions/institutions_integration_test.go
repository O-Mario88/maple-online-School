package institutions

import (
	"context"
	"fmt"
	"net/http"
	"testing"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/testkit"
)

const (
	schoolsURL     = "/api/v1/institutions/"
	membershipsURL = "/api/v1/institution-memberships/"
)

// sentInvites records invitations instead of emailing them.
type sentInvites struct{ got []Invitee }

func (s *sentInvites) SendInvite(_ context.Context, who Invitee, school, role string) {
	s.got = append(s.got, who)
}

var invites *sentInvites

func newWorld(t *testing.T) *testkit.World {
	w := testkit.New(t)
	invites = &sentInvites{}
	r := chi.NewRouter()
	NewHandler(NewPostgresStore(w.Pool), w.Auth.RequireUser, invites).Mount(r)
	w.Router = r
	return w
}

// track makes sure rows this test created through the API are cleaned up.
func track(t *testing.T, w *testkit.World, school int64, emails ...string) {
	t.Cleanup(func() {
		ctx := context.Background()
		for _, e := range emails {
			_, _ = w.Pool.Exec(ctx, `DELETE FROM institutions_institutionmembership WHERE user_id IN (SELECT id FROM accounts_user WHERE email = $1)`, e)
			_, _ = w.Pool.Exec(ctx, `DELETE FROM accounts_user WHERE email = $1`, e)
		}
		_, _ = w.Pool.Exec(ctx, `DELETE FROM institutions_institutionmembership WHERE institution_id = $1`, school)
		_, _ = w.Pool.Exec(ctx, `DELETE FROM institutions_institution WHERE id = $1`, school)
	})
}

func results(page map[string]any) []any {
	r, _ := page["results"].([]any)
	return r
}

func TestSchoolSetupAndInvitations(t *testing.T) {
	w := newWorld(t)
	founder := w.Person("institution", "", 0)
	existing := w.Person("student", "", 0)

	code, school := w.Call(founder, http.MethodPost, schoolsURL, map[string]any{"name": "Kampala Hill School", "country_code": "UG", "school_level": "secondary"})
	if code != http.StatusCreated {
		t.Fatalf("create school: %d %v", code, school)
	}
	id := testkit.ID(school)
	newEmail := fmt.Sprintf("new.teacher.%d@invite.test", id)
	track(t, w, id, newEmail)

	if _, mine := w.Call(founder, http.MethodGet, schoolsURL, nil); !testkit.Contains(testkit.IDs(mine), id) {
		t.Fatalf("founder should see their school: %v", mine)
	}

	var existingEmail string
	_ = w.Pool.QueryRow(context.Background(), `SELECT email FROM accounts_user WHERE id = $1`, existing).Scan(&existingEmail)
	code, invited := w.Call(founder, http.MethodPost, fmt.Sprintf("%s%d/bulk_invite/", schoolsURL, id), map[string]any{
		"emails": []string{newEmail, existingEmail}, "role": "class_teacher",
	})
	if code != http.StatusOK || invited["invited"] != float64(2) || invited["detail"] != "Invited 2 people as class teachers." {
		t.Fatalf("bulk invite: %d %v", code, invited)
	}
	if len(invites.got) != 2 {
		t.Fatalf("each person gets an invitation email: %v", invites.got)
	}
	for _, who := range invites.got {
		if who.New != (who.Email == newEmail) {
			t.Errorf("only the new address needs a password: %+v", who)
		}
	}

	// The existing person sees a pending invitation and accepts it.
	_, list := w.Call(existing, http.MethodGet, membershipsURL, nil)
	rows := results(list)
	if len(rows) != 1 || rows[0].(map[string]any)["status"] != "pending" {
		t.Fatalf("invitee should see one pending invitation: %v", list)
	}
	mid := int64(rows[0].(map[string]any)["id"].(float64))
	if code, _ := w.Call(existing, http.MethodPost, fmt.Sprintf("%s%d/accept/", membershipsURL, mid), nil); code != http.StatusOK {
		t.Fatalf("accept: %d", code)
	}
	if _, mine := w.Call(existing, http.MethodGet, schoolsURL, nil); !testkit.Contains(testkit.IDs(mine), id) {
		t.Fatalf("after accepting, the school should be listed: %v", mine)
	}

	// A teacher can't invite or see the rest of the staff list.
	if code, _ := w.Call(existing, http.MethodPost, fmt.Sprintf("%s%d/bulk_invite/", schoolsURL, id), map[string]any{"emails": []string{"x@y.z"}, "role": "student"}); code != http.StatusForbidden {
		t.Errorf("teacher inviting: want 403, got %d", code)
	}
	if _, staff := w.Call(existing, http.MethodGet, membershipsURL, nil); len(results(staff)) != 1 {
		t.Errorf("teacher should only see their own membership, got %v", staff)
	}
	_, all := w.Call(founder, http.MethodGet, membershipsURL, nil)
	if len(results(all)) != 3 {
		t.Errorf("the head should see all 3 memberships, got %v", all)
	}

	// The head suspends the teacher; the last leader can't be removed.
	if code, _ := w.Call(founder, http.MethodPatch, fmt.Sprintf("%s%d/", membershipsURL, mid), map[string]any{"status": "suspended"}); code != http.StatusOK {
		t.Errorf("suspend: %d", code)
	}
	var headMembership int64
	for _, r := range results(all) {
		row := r.(map[string]any)
		if row["role"] == "headteacher" {
			headMembership = int64(row["id"].(float64))
		}
	}
	if code, body := w.Call(founder, http.MethodPatch, fmt.Sprintf("%s%d/", membershipsURL, headMembership), map[string]any{"status": "suspended"}); code != http.StatusConflict {
		t.Errorf("suspending the last leader: want 409, got %d %v", code, body)
	}
}

func TestStudentsCannotCreateSchools(t *testing.T) {
	w := newWorld(t)
	student := w.Person("student", "", 0)
	if code, _ := w.Call(student, http.MethodPost, schoolsURL, map[string]any{"name": "Mine", "country_code": "UG"}); code != http.StatusForbidden {
		t.Fatalf("want 403, got %d", code)
	}
}
