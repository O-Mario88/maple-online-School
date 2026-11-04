package network

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"slices"
	"strings"
	"testing"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/testkit"
)

const (
	schoolsURL      = "/api/v1/network/schools/"
	savesURL        = "/api/v1/network/saves/"
	applicationsURL = "/api/v1/network/applications/"
)

func newWorld(t *testing.T) *testkit.World {
	w := testkit.New(t)
	r := chi.NewRouter()
	NewHandler(NewPostgresStore(w.Pool), w.Auth.RequireUser).Mount(r)
	w.Router = r
	return w
}

func token() string {
	b := make([]byte, 4)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

// profile is a school's network profile for a test. The zero value is a
// listed day school in the test's own district.
type profile struct {
	district     string
	curricula    []string
	levels       []string
	stay, mode   string
	programs     []string
	passRate     int
	scholarships bool
	unverified   bool
	unpublished  bool
	inactive     bool
}

// listed creates a school with a network profile and returns its id.
func listed(w *testkit.World, name string, p profile) int64 {
	w.T.Helper()
	ctx := context.Background()
	id := w.School(name)
	if p.stay == "" {
		p.stay = "Day"
	}
	if p.mode == "" {
		p.mode = "Physical"
	}
	if p.curricula == nil {
		p.curricula = []string{"UNEB"}
	}
	if p.levels == nil {
		p.levels = []string{"O-Level"}
	}
	if p.programs == nil {
		p.programs = []string{}
	}
	var passRate *int
	if p.passRate > 0 {
		passRate = &p.passRate
	}
	_, err := w.Pool.Exec(ctx, `
		INSERT INTO network_profiles (school_id, slug, town, district, curricula, levels, stay, mode, programs, facilities, blurb,
		  pass_rate, pass_board, pass_exam, pass_year, pass_source, learners, established, scholarships,
		  admissions_opens, admissions_deadline, fee_min_ugx, fee_max_ugx, requirements, verified_at, published_at)
		VALUES ($1, $2, 'Town', $3, $4, $5, $6, $7, $8, '{Library}', 'A test school.',
		  $9::smallint, CASE WHEN $9::smallint IS NULL THEN NULL ELSE 'UNEB' END, CASE WHEN $9::smallint IS NULL THEN NULL ELSE 'UCE' END,
		  CASE WHEN $9::smallint IS NULL THEN NULL ELSE 2025 END, CASE WHEN $9::smallint IS NULL THEN NULL ELSE 'school-published, verified by Maple' END,
		  500, 2001, $10, current_date - 1, current_date + 60, 1000000, 1500000, '{Latest report card}',
		  CASE WHEN $11 THEN NULL ELSE now() END, CASE WHEN $12 THEN NULL ELSE now() END)`,
		id, fmt.Sprintf("test-%d", id), p.district, p.curricula, p.levels, p.stay, p.mode, p.programs,
		passRate, p.scholarships, p.unverified, p.unpublished)
	if err != nil {
		w.T.Fatalf("profile: %v", err)
	}
	if p.inactive {
		if _, err := w.Pool.Exec(ctx, `UPDATE institutions_institution SET is_active = false WHERE id = $1`, id); err != nil {
			w.T.Fatalf("deactivate: %v", err)
		}
	}
	return id
}

func listPath(params map[string]string) string {
	q := url.Values{}
	for k, v := range params {
		q.Set(k, v)
	}
	return schoolsURL + "?" + q.Encode()
}

func schoolPath(id int64, rest string) string { return fmt.Sprintf("%s%d/%s", schoolsURL, id, rest) }

func sorted(ids []int64) []int64 {
	out := slices.Clone(ids)
	slices.Sort(out)
	return out
}

func TestOnlyActiveVerifiedPublishedSchoolsAreListed(t *testing.T) {
	w := newWorld(t)
	learner := w.Person("student", "", 0)
	district := "Listing " + token()
	shown := listed(w, "Shown", profile{district: district})
	unverified := listed(w, "Unverified", profile{district: district, unverified: true})
	unpublished := listed(w, "Unpublished", profile{district: district, unpublished: true})
	inactive := listed(w, "Inactive", profile{district: district, inactive: true})

	code, page := w.Call(learner, http.MethodGet, listPath(map[string]string{"district": district}), nil)
	if code != http.StatusOK || !slices.Equal(testkit.IDs(page), []int64{shown}) || page["count"] != float64(1) {
		t.Fatalf("only the active, verified, published school is listed: %d %v", code, page)
	}
	for _, hidden := range []int64{unverified, unpublished, inactive} {
		if code, _ := w.Call(learner, http.MethodGet, schoolPath(hidden, ""), nil); code != http.StatusNotFound {
			t.Errorf("unlisted school %d: want 404, got %d", hidden, code)
		}
		if code, _ := w.Call(learner, http.MethodPut, schoolPath(hidden, "save/"), nil); code != http.StatusNotFound {
			t.Errorf("saving unlisted school %d: want 404, got %d", hidden, code)
		}
		if code, _ := w.Call(learner, http.MethodPost, schoolPath(hidden, "applications/"), nil); code != http.StatusNotFound {
			t.Errorf("applying to unlisted school %d: want 404, got %d", hidden, code)
		}
	}
	if code, _ := w.Call(0, http.MethodGet, schoolsURL, nil); code != http.StatusUnauthorized {
		t.Errorf("signed out: want 401, got %d", code)
	}
}

func TestSearchAndFilters(t *testing.T) {
	w := newWorld(t)
	learner := w.Person("teacher", "", 0)
	district := "Search " + token()
	other := "Search other " + token()
	lake := listed(w, "Lakeshore College", profile{district: district, levels: []string{"O-Level", "A-Level"}, stay: "Day & Boarding", passRate: 98})
	river := listed(w, "Rivermouth High", profile{district: district, programs: []string{"STEM"}, mode: "Hybrid", passRate: 90, scholarships: true})
	hill := listed(w, "Hilltop Academy", profile{district: district, curricula: []string{"UNEB", "Cambridge"}, mode: "Online"})
	away := listed(w, "Lakeshore Annex", profile{district: other})

	cases := []struct {
		name   string
		params map[string]string
		want   []int64
	}{
		{"district", map[string]string{}, []int64{lake, river, hill}},
		{"name, any case", map[string]string{"q": "rIVER"}, []int64{river}},
		{"program", map[string]string{"q": "stem"}, []int64{river}},
		{"curriculum word", map[string]string{"q": "cambridge"}, []int64{hill}},
		{"curriculum", map[string]string{"curriculum": "Cambridge"}, []int64{hill}},
		{"level", map[string]string{"level": "A-Level"}, []int64{lake}},
		{"top performing", map[string]string{"category": "top"}, []int64{lake}},
		{"online or hybrid", map[string]string{"category": "online"}, []int64{river, hill}},
		{"boarding", map[string]string{"category": "boarding"}, []int64{lake}},
		{"scholarships", map[string]string{"category": "scholarships"}, []int64{river}},
		{"all", map[string]string{"category": "all"}, []int64{lake, river, hill}},
		{"no match", map[string]string{"q": "zzzz"}, nil},
	}
	for _, c := range cases {
		c.params["district"] = district
		code, page := w.Call(learner, http.MethodGet, listPath(c.params), nil)
		if code != http.StatusOK || !slices.Equal(sorted(testkit.IDs(page)), sorted(c.want)) {
			t.Errorf("%s: got %d %v, want %v", c.name, code, testkit.IDs(page), c.want)
		}
	}
	if _, page := w.Call(learner, http.MethodGet, listPath(map[string]string{"q": "lakeshore", "district": other}), nil); !slices.Equal(testkit.IDs(page), []int64{away}) {
		t.Errorf("search and district together: %v", testkit.IDs(page))
	}
	for _, bad := range []string{"near", "cheapest"} {
		if code, _ := w.Call(learner, http.MethodGet, listPath(map[string]string{"category": bad}), nil); code != http.StatusBadRequest {
			t.Errorf("category %q: want 400, got %d", bad, code)
		}
	}
}

func TestProfileShowsResultsAdmissionsVerifiedExamCentreAndOpenVacancies(t *testing.T) {
	w := newWorld(t)
	learner := w.Person("student", "", 0)
	district := "Profile " + token()
	centre := listed(w, "Centre School", profile{district: district, passRate: 96})
	plain := listed(w, "Plain School", profile{district: district})
	mustExec(t, w, `INSERT INTO network_exam_centres (school_id, boards, exams, external, register_by, fee_ugx, verified_at)
		VALUES ($1, '{UNEB}', '{UCE,UACE}', true, '2027-02-28', 220000, now())`, centre)
	// An exam centre Maple hasn't verified stays hidden.
	mustExec(t, w, `INSERT INTO network_exam_centres (school_id, boards, exams, external) VALUES ($1, '{UNEB}', '{UCE}', false)`, plain)
	mustExec(t, w, `INSERT INTO network_vacancies (school_id, title, kind, closes_on, subjects) VALUES
		($1, 'Physics Teacher', 'Full-time', current_date + 20, '{Physics}'),
		($1, 'Closed Post', 'Part-time', current_date - 1, '{}')`, centre)

	code, body := w.Call(learner, http.MethodGet, schoolPath(centre, ""), nil)
	if code != http.StatusOK {
		t.Fatalf("profile: %d %v", code, body)
	}
	pass, _ := body["pass_rate"].(map[string]any)
	if pass["rate"] != float64(96) || pass["exam"] != "UCE" || pass["year"] != float64(2025) || pass["source"] == "" {
		t.Errorf("pass rate with its source and year: %v", body["pass_rate"])
	}
	adm, _ := body["admissions"].(map[string]any)
	reqs, _ := adm["requirements"].([]any)
	if adm["fee_min_ugx"] != float64(1000000) || adm["deadline"] == nil || len(reqs) != 1 {
		t.Errorf("admissions: %v", adm)
	}
	exam, _ := body["exam_centre"].(map[string]any)
	if exam["external"] != true || exam["register_by"] != "2027-02-28" || exam["fee_ugx"] != float64(220000) {
		t.Errorf("verified exam centre: %v", body["exam_centre"])
	}
	vacancies, _ := body["vacancies"].([]any)
	if len(vacancies) != 1 || vacancies[0].(map[string]any)["title"] != "Physics Teacher" {
		t.Errorf("only open vacancies: %v", body["vacancies"])
	}
	if body["views"] != nil {
		t.Errorf("one view is under the minimum cohort and must be hidden: %v", body["views"])
	}

	_, other := w.Call(learner, http.MethodGet, schoolPath(plain, ""), nil)
	if other["exam_centre"] != nil || other["pass_rate"] != nil {
		t.Errorf("an unverified centre and an unpublished pass rate are not shown: %v %v", other["exam_centre"], other["pass_rate"])
	}
}

func TestSavesArePrivateToTheUser(t *testing.T) {
	w := newWorld(t)
	learner := w.Person("student", "", 0)
	someone := w.Person("teacher", "", 0)
	school := listed(w, "Saved School", profile{district: "Saves " + token()})

	if code, body := w.Call(learner, http.MethodPut, schoolPath(school, "save/"), nil); code != http.StatusOK || body["saved"] != true {
		t.Fatalf("save: %d %v", code, body)
	}
	if code, _ := w.Call(learner, http.MethodPut, schoolPath(school, "save/"), nil); code != http.StatusOK {
		t.Errorf("saving twice is fine: %d", code)
	}
	_, mine := w.Call(learner, http.MethodGet, savesURL, nil)
	if rows := results(mine); len(rows) != 1 || rows[0]["school"] != float64(school) {
		t.Errorf("learner sees their save: %v", mine)
	}
	if _, theirs := w.Call(someone, http.MethodGet, savesURL, nil); len(results(theirs)) != 0 {
		t.Errorf("someone else sees none of it: %v", theirs)
	}
	if code, body := w.Call(learner, http.MethodDelete, schoolPath(school, "save/"), nil); code != http.StatusOK || body["saved"] != false {
		t.Errorf("unsave: %d %v", code, body)
	}
	if _, mine := w.Call(learner, http.MethodGet, savesURL, nil); len(results(mine)) != 0 {
		t.Errorf("after unsaving: %v", mine)
	}
}

func submission(over map[string]any) map[string]any {
	body := map[string]any{"consent": true, "applicant_name": "Amara Test", "level": "S5", "contact": "+256700000001"}
	for k, v := range over {
		body[k] = v
	}
	return body
}

func TestApplicationsShareOnlyWhatTheUserSubmitsWithConsent(t *testing.T) {
	w := newWorld(t)
	learner := w.Person("student", "", 0)
	someone := w.Person("student", "", 0)
	school := listed(w, "Apply School", profile{district: "Apply " + token()})

	code, app := w.Call(learner, http.MethodPost, schoolPath(school, "applications/"), nil)
	if code != http.StatusCreated || app["status"] != "started" || app["shared"] != nil {
		t.Fatalf("start: %d %v", code, app)
	}
	id := testkit.ID(app)
	if code, again := w.Call(learner, http.MethodPost, schoolPath(school, "applications/"), nil); code != http.StatusOK || testkit.ID(again) != id {
		t.Errorf("starting again returns the same application: %d %v", code, again)
	}
	submit := fmt.Sprintf("%s%d/submit/", applicationsURL, id)

	for name, body := range map[string]map[string]any{
		"no consent":    submission(map[string]any{"consent": false}),
		"no name":       submission(map[string]any{"applicant_name": "  "}),
		"no contact":    submission(map[string]any{"contact": ""}),
		"long message":  submission(map[string]any{"message": strings.Repeat("x", 2001)}),
		"unknown field": submission(map[string]any{"date_of_birth": "2010-01-01"}),
	} {
		if code, _ := w.Call(learner, http.MethodPost, submit, body); code != http.StatusBadRequest {
			t.Errorf("%s: want 400, got %d", name, code)
		}
	}
	if code, _ := w.Call(someone, http.MethodPost, submit, submission(nil)); code != http.StatusNotFound {
		t.Errorf("submitting someone else's application: want 404, got %d", code)
	}

	code, done := w.Call(learner, http.MethodPost, submit, submission(map[string]any{"message": "I love chemistry."}))
	if code != http.StatusOK || done["status"] != "submitted" {
		t.Fatalf("submit: %d %v", code, done)
	}
	shared, _ := done["shared"].(map[string]any)
	keys := make([]string, 0, len(shared))
	for k := range shared {
		keys = append(keys, k)
	}
	slices.Sort(keys)
	if !slices.Equal(keys, []string{"applicant_name", "contact", "level", "message"}) {
		t.Errorf("only the fields the learner filled in are shared: %v", shared)
	}
	var consent string
	var consented bool
	_ = w.Pool.QueryRow(context.Background(), `SELECT consent_text, consented_at IS NOT NULL FROM network_applications WHERE id = $1`, id).Scan(&consent, &consented)
	if !consented || !strings.Contains(consent, "Apply School") {
		t.Errorf("consent is recorded with what was agreed to: %q %v", consent, consented)
	}
	if code, _ := w.Call(learner, http.MethodPost, submit, submission(nil)); code != http.StatusConflict {
		t.Errorf("submitting twice: want 409, got %d", code)
	}
	if _, mine := w.Call(learner, http.MethodGet, applicationsURL, nil); len(results(mine)) != 1 {
		t.Errorf("learner sees their application: %v", mine)
	}
	if _, theirs := w.Call(someone, http.MethodGet, applicationsURL, nil); len(results(theirs)) != 0 {
		t.Errorf("someone else sees none: %v", theirs)
	}
}

func TestInsightsAreSuppressedTotalsForTheSchoolsOwnLeaders(t *testing.T) {
	w := newWorld(t)
	school := listed(w, "Insight School", profile{district: "Insights " + token()})
	other := w.School("Another")
	head := w.Person("institution", "headteacher", school)
	teacher := w.Person("teacher", "class_teacher", school)
	otherHead := w.Person("institution", "headteacher", other)
	insights := schoolPath(school, "insights/")

	for who, id := range map[string]int64{"teacher": teacher, "another school's head": otherHead, "learner": w.Person("student", "", 0)} {
		if code, _ := w.Call(id, http.MethodGet, insights, nil); code != http.StatusForbidden {
			t.Errorf("%s: want 403, got %d", who, code)
		}
	}

	// Fewer than the minimum cohort look, save, start and submit: every figure stays hidden.
	var learners []int64
	act := func() {
		l := w.Person("student", "", 0)
		learners = append(learners, l)
		w.Call(l, http.MethodGet, schoolPath(school, ""), nil)
		w.Call(l, http.MethodPut, schoolPath(school, "save/"), nil)
		_, app := w.Call(l, http.MethodPost, schoolPath(school, "applications/"), nil)
		w.Call(l, http.MethodPost, fmt.Sprintf("%s%d/submit/", applicationsURL, testkit.ID(app)), submission(nil))
	}
	for range MinCohort - 1 {
		act()
	}
	// The school's own staff looking at the profile doesn't count.
	w.Call(teacher, http.MethodGet, schoolPath(school, ""), nil)
	code, body := w.Call(head, http.MethodGet, insights, nil)
	if code != http.StatusOK || body["min_cohort"] != float64(MinCohort) {
		t.Fatalf("insights: %d %v", code, body)
	}
	totals, _ := body["totals"].(map[string]any)
	for k, v := range totals {
		if v != nil {
			t.Errorf("%s under the minimum cohort must be hidden, got %v", k, v)
		}
	}

	act()
	// The applicants then join the school as students.
	for _, l := range learners {
		mustExec(t, w, `INSERT INTO institutions_institutionmembership (role, status, joined_at, institution_id, user_id) VALUES ('student', 'active', now(), $1, $2)`, school, l)
	}
	_, body = w.Call(head, http.MethodGet, insights, nil)
	want := map[string]any{"profile_views": float64(MinCohort), "saves": float64(MinCohort), "application_starts": float64(MinCohort), "application_submissions": float64(MinCohort), "enrolments": float64(MinCohort)}
	totals, _ = body["totals"].(map[string]any)
	for k, v := range want {
		if totals[k] != v {
			t.Errorf("%s: got %v, want %v", k, totals[k], v)
		}
	}
	if len(totals) != len(want) {
		t.Errorf("totals hold only the five figures: %v", totals)
	}
}

// identityKeys are field names that would carry who someone is.
var identityKeys = []string{"user", "user_id", "users", "email", "full_name", "applicant_name", "contact", "guardian_name", "guardian_contact", "viewer", "viewers", "visitors", "savers", "applicants", "ip"}

// leaks returns the identity keys found anywhere in a JSON value.
func leaks(v any) []string {
	var found []string
	switch x := v.(type) {
	case map[string]any:
		for k, child := range x {
			if slices.Contains(identityKeys, k) {
				found = append(found, k)
			}
			found = append(found, leaks(child)...)
		}
	case []any:
		for _, child := range x {
			found = append(found, leaks(child)...)
		}
	}
	return found
}

func TestSchoolAdminCannotLearnWhoLookedSavedOrApplied(t *testing.T) {
	w := newWorld(t)
	school := listed(w, "Private School", profile{district: "Privacy " + token(), passRate: 97})
	head := w.Person("institution", "headteacher", school)
	learner := w.Person("student", "", 0)
	ctx := context.Background()
	var email, name string
	_ = w.Pool.QueryRow(ctx, `SELECT email, full_name FROM accounts_user WHERE id = $1`, learner).Scan(&email, &name)
	typedName := "Zawadi Privacy " + token()
	typedContact := "+2567" + token()

	// The learner looks, saves, starts and submits an application.
	w.Call(learner, http.MethodGet, schoolPath(school, ""), nil)
	w.Call(learner, http.MethodPut, schoolPath(school, "save/"), nil)
	_, app := w.Call(learner, http.MethodPost, schoolPath(school, "applications/"), nil)
	appID := testkit.ID(app)
	w.Call(learner, http.MethodPost, fmt.Sprintf("%s%d/submit/", applicationsURL, appID), submission(map[string]any{"applicant_name": typedName, "contact": typedContact}))

	secrets := []string{email, name, typedName, typedContact}
	calls := []struct{ method, path string }{
		{http.MethodGet, schoolsURL},
		{http.MethodGet, listPath(map[string]string{"q": "Private"})},
		{http.MethodGet, schoolPath(school, "")},
		{http.MethodGet, schoolPath(school, "insights/")},
		{http.MethodGet, schoolPath(school, "insights/?export=csv")},
		{http.MethodGet, savesURL},
		{http.MethodGet, applicationsURL},
		{http.MethodGet, fmt.Sprintf("%s%d/", applicationsURL, appID)},
		{http.MethodPost, fmt.Sprintf("%s%d/submit/", applicationsURL, appID)},
		{http.MethodGet, schoolPath(school, "visitors/")},
		{http.MethodGet, schoolPath(school, "saves/")},
		{http.MethodGet, schoolPath(school, "applications/")},
	}
	for _, c := range calls {
		req := httptest.NewRequest(c.method, c.path, strings.NewReader(`{}`))
		req.Header.Set("Content-Type", "application/json")
		code, raw := w.Raw(head, req)
		for _, s := range secrets {
			if strings.Contains(raw, s) {
				t.Errorf("%s %s (%d) reveals %q: %s", c.method, c.path, code, s, raw)
			}
		}
		if strings.Contains(raw, fmt.Sprintf(`:%d,`, learner)) || strings.Contains(raw, fmt.Sprintf(`:%d}`, learner)) {
			t.Errorf("%s %s (%d) may reveal the learner's id %d: %s", c.method, c.path, code, learner, raw)
		}
		var body any
		_ = json.Unmarshal([]byte(raw), &body)
		if found := leaks(body); len(found) > 0 {
			t.Errorf("%s %s (%d) has identity fields %v: %s", c.method, c.path, code, found, raw)
		}
	}

	// The head's own lists hold nothing of the learner's.
	if _, saves := w.Call(head, http.MethodGet, savesURL, nil); len(results(saves)) != 0 {
		t.Errorf("head sees only their own saves: %v", saves)
	}
	if _, apps := w.Call(head, http.MethodGet, applicationsURL, nil); len(results(apps)) != 0 {
		t.Errorf("head sees only their own applications: %v", apps)
	}
	// Profile views are stored without anyone's identity.
	var extra int
	_ = w.Pool.QueryRow(ctx, `SELECT count(*) FROM information_schema.columns WHERE table_name = 'network_profile_views' AND column_name NOT IN ('school_id', 'day', 'views')`).Scan(&extra)
	if extra != 0 {
		t.Errorf("network_profile_views must hold only the school, day and count")
	}
}

func results(page map[string]any) []map[string]any {
	raw, _ := page["results"].([]any)
	out := make([]map[string]any, 0, len(raw))
	for _, r := range raw {
		row, _ := r.(map[string]any)
		out = append(out, row)
	}
	return out
}

func mustExec(t *testing.T, w *testkit.World, query string, args ...any) {
	t.Helper()
	if _, err := w.Pool.Exec(context.Background(), query, args...); err != nil {
		t.Fatalf("fixture: %v", err)
	}
}
