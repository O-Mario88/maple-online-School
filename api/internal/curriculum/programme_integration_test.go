package curriculum

import (
	"net/http"
	"slices"
	"testing"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/testkit"
)

// The Uganda curriculum is seeded by migration 00004, so every database has it.
func TestUgandaCurriculumIsRegisteredByDefault(t *testing.T) {
	w := testkit.New(t)
	r := chi.NewRouter()
	NewHandler(NewPostgresStore(w.Pool), w.Auth.RequireUser).Mount(r)
	w.Router = r

	code, body := w.Call(0, http.MethodGet, "/api/v1/curriculum/programmes/UG/", nil)
	if code != http.StatusOK {
		t.Fatalf("programme should be public: %d %v", code, body)
	}
	tracks := body["tracks"].([]any)
	if len(tracks) != 1 {
		t.Fatalf("want one NCDC track, got %d", len(tracks))
	}
	track := tracks[0].(map[string]any)

	var levels []string
	classes := map[string]map[string]any{}
	for _, l := range track["levels"].([]any) {
		level := l.(map[string]any)
		levels = append(levels, level["name"].(string))
		for _, c := range level["classes"].([]any) {
			class := c.(map[string]any)
			classes[class["name"].(string)] = class
		}
	}
	if want := []string{"Nursery", "Primary", "Lower Secondary", "Advanced Secondary"}; !slices.Equal(levels, want) {
		t.Fatalf("levels in grade order: want %v, got %v", want, levels)
	}
	for _, name := range []string{"Baby Class", "Middle Class", "Top Class", "P1", "P7", "S1", "S4", "S5", "S6"} {
		if classes[name] == nil {
			t.Errorf("class %s missing", name)
		}
	}

	cases := []struct {
		class          string
		offered, core  int
		mustBeCore     []string
		mustBeElective []string
	}{
		{"P1", 8, 8, []string{"Literacy I", "News"}, nil},
		{"P4", 7, 7, []string{"Integrated Science", "Creative Arts and Physical Education"}, nil},
		{"S1", 26, 11, []string{"Kiswahili", "Entrepreneurship", "Physics"}, []string{"French", "General Science", "Technology and Design"}},
		{"S3", 26, 7, []string{"History and Political Education"}, []string{"Kiswahili", "Information and Communication Technology"}},
		{"S5", 29, 1, []string{"General Paper"}, []string{"Principal Mathematics", "Subsidiary ICT"}},
	}
	for _, tc := range cases {
		subjects := classes[tc.class]["subjects"].([]any)
		core := map[string]bool{}
		for _, s := range subjects {
			sub := s.(map[string]any)
			core[sub["name"].(string)] = sub["compulsory"].(bool)
		}
		n := 0
		for _, c := range core {
			if c {
				n++
			}
		}
		if len(subjects) != tc.offered || n != tc.core {
			t.Errorf("%s: want %d offered / %d compulsory, got %d / %d", tc.class, tc.offered, tc.core, len(subjects), n)
		}
		for _, name := range tc.mustBeCore {
			if !core[name] {
				t.Errorf("%s: %s should be compulsory", tc.class, name)
			}
		}
		for _, name := range tc.mustBeElective {
			if c, ok := core[name]; !ok || c {
				t.Errorf("%s: %s should be offered as an elective", tc.class, name)
			}
		}
	}

	rules := map[string]map[string]any{}
	for _, r := range track["rules"].([]any) {
		rule := r.(map[string]any)
		rules[rule["key"].(string)] = rule
	}
	if rules["electives-s3-s4"]["max_electives"] != float64(2) {
		t.Errorf("S3-S4 elective limit missing: %v", rules["electives-s3-s4"])
	}
	if ple := rules["exam-ple"]; ple == nil || len(ple["subjects"].([]any)) != 4 {
		t.Errorf("PLE rule missing: %v", ple)
	}
	if combos := rules["a-level-combinations"]; combos == nil || len(combos["combinations"].([]any)) != 11 {
		t.Errorf("A-Level combinations missing: %v", combos)
	}

	if code, _ := w.Call(0, http.MethodGet, "/api/v1/curriculum/programmes/ZZ/", nil); code != http.StatusNotFound {
		t.Errorf("unknown country: want 404, got %d", code)
	}
}
