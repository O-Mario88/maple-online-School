// Package network serves the School Network: verified Maple schools that
// independent learners and teachers can find, save and apply to, and the
// totals-only figures a school's own leaders see about that interest.
//
// Privacy is enforced here and in db/queries/network.sql, not in the app.
// The only thing this package gives a school about the people who looked at
// it is Totals: five counts, each hidden below MinCohort. Saves and
// applications are only ever read back by the user who made them.
package network

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"slices"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/O-Mario88/maple-online-School/api/internal/platform/dbgen"
	"github.com/O-Mario88/maple-online-School/api/internal/roles"
)

// MinCohort is the fewest people a figure about a school's visitors may
// describe. Anything smaller is hidden, so no one can be singled out.
const MinCohort = 5

// TopPassRate is where the "Top performing" category starts (the app's TOP_PASS_RATE).
const TopPassRate = 95

const dateLayout = "2006-01-02"

var (
	ErrNotFound  = errors.New("not found")
	ErrSubmitted = errors.New("application already submitted")
)

type PassRate struct {
	Rate   int16  `json:"rate"`
	Board  string `json:"board"`
	Exam   string `json:"exam"`
	Year   int16  `json:"year"`
	Source string `json:"source"`
}

type Admissions struct {
	// Opens is null when admissions are open all year.
	Opens *string `json:"opens"`
	// Deadline is null when admissions are rolling.
	Deadline     *string  `json:"deadline"`
	FeeMinUGX    *int64   `json:"fee_min_ugx"`
	FeeMaxUGX    *int64   `json:"fee_max_ugx"`
	Requirements []string `json:"requirements"`
}

type ExamCentre struct {
	Boards     []string `json:"boards"`
	Exams      []string `json:"exams"`
	External   bool     `json:"external"`
	RegisterBy *string  `json:"register_by"`
	FeeUGX     *int64   `json:"fee_ugx"`
}

type Vacancy struct {
	ID       int64    `json:"id"`
	Title    string   `json:"title"`
	Kind     string   `json:"kind"`
	ClosesOn string   `json:"closes_on"`
	Subjects []string `json:"subjects"`
}

// Profile is a listed school as learners and teachers see it.
type Profile struct {
	ID           int64       `json:"id"`
	Slug         string      `json:"slug"`
	Name         string      `json:"name"`
	Town         string      `json:"town"`
	District     string      `json:"district"`
	Curricula    []string    `json:"curricula"`
	Levels       []string    `json:"levels"`
	Stay         string      `json:"stay"`
	Mode         string      `json:"mode"`
	Programs     []string    `json:"programs"`
	Facilities   []string    `json:"facilities"`
	Blurb        string      `json:"blurb"`
	PassRate     *PassRate   `json:"pass_rate"`
	Learners     int32       `json:"learners"`
	Established  *int16      `json:"established"`
	Scholarships bool        `json:"scholarships"`
	Admissions   Admissions  `json:"admissions"`
	ExamCentre   *ExamCentre `json:"exam_centre"`
	Vacancies    []Vacancy   `json:"vacancies"`
	// Views is the total profile views, or null below MinCohort.
	Views    *int64    `json:"views"`
	ListedAt time.Time `json:"listed_at"`
}

// Filters narrow the directory. Empty fields don't filter.
type Filters struct {
	Query, District, Curriculum, Level string
	// Category is "", "top", "online", "boarding" or "scholarships".
	Category string
}

type Save struct {
	School  int64     `json:"school"`
	SavedAt time.Time `json:"saved_at"`
}

// Shared is exactly what an applicant chose to send a school.
type Shared struct {
	ApplicantName   string `json:"applicant_name"`
	Level           string `json:"level"`
	Contact         string `json:"contact"`
	GuardianName    string `json:"guardian_name,omitempty"`
	GuardianContact string `json:"guardian_contact,omitempty"`
	Message         string `json:"message,omitempty"`
}

// Application is the user's own application, shown only to them.
type Application struct {
	ID          int64      `json:"id"`
	School      int64      `json:"school"`
	SchoolName  string     `json:"school_name"`
	Status      string     `json:"status"`
	Shared      *Shared    `json:"shared"`
	StartedAt   time.Time  `json:"started_at"`
	SubmittedAt *time.Time `json:"submitted_at"`
}

// Totals is everything a school learns about the people who looked at it.
// A nil figure means fewer than MinCohort people are behind it.
type Totals struct {
	ProfileViews           *int64 `json:"profile_views"`
	Saves                  *int64 `json:"saves"`
	ApplicationStarts      *int64 `json:"application_starts"`
	ApplicationSubmissions *int64 `json:"application_submissions"`
	Enrolments             *int64 `json:"enrolments"`
}

type PostgresStore struct {
	q *dbgen.Queries
}

func NewPostgresStore(pool *pgxpool.Pool) *PostgresStore {
	return &PostgresStore{q: dbgen.New(pool)}
}

// List returns one page of listed schools and how many match in all.
func (s *PostgresStore) List(ctx context.Context, f Filters, limit, offset int32) ([]Profile, int64, error) {
	rows, err := s.q.ListProfiles(ctx, dbgen.ListProfilesParams{
		MinCohort: MinCohort, District: f.District, Curriculum: f.Curriculum, Level: f.Level,
		Category: f.Category, TopPassRate: TopPassRate, Query: f.Query, PageLimit: limit, PageOffset: offset,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("list schools: %w", err)
	}
	var total int64
	if len(rows) > 0 {
		total = rows[0].TotalCount
	}
	out, err := s.withDetails(ctx, rows)
	return out, total, err
}

// Profile returns a listed school, or ErrNotFound.
func (s *PostgresStore) Profile(ctx context.Context, school int64) (Profile, error) {
	row, err := s.q.GetProfile(ctx, dbgen.GetProfileParams{MinCohort: MinCohort, SchoolID: school})
	if errors.Is(err, pgx.ErrNoRows) {
		return Profile{}, ErrNotFound
	}
	if err != nil {
		return Profile{}, fmt.Errorf("load school: %w", err)
	}
	out, err := s.withDetails(ctx, []dbgen.ListProfilesRow{dbgen.ListProfilesRow(row)})
	if err != nil {
		return Profile{}, err
	}
	return out[0], nil
}

// withDetails adds each school's verified exam centre and open vacancies.
func (s *PostgresStore) withDetails(ctx context.Context, rows []dbgen.ListProfilesRow) ([]Profile, error) {
	ids := make([]int64, 0, len(rows))
	for _, r := range rows {
		ids = append(ids, r.SchoolID)
	}
	centres, err := s.q.ExamCentres(ctx, ids)
	if err != nil {
		return nil, fmt.Errorf("load exam centres: %w", err)
	}
	vacancies, err := s.q.SchoolVacancies(ctx, ids)
	if err != nil {
		return nil, fmt.Errorf("load vacancies: %w", err)
	}
	byCentre := map[int64]*ExamCentre{}
	for _, c := range centres {
		byCentre[c.SchoolID] = &ExamCentre{Boards: c.Boards, Exams: c.Exams, External: c.External, RegisterBy: date(c.RegisterBy), FeeUGX: int8p(c.FeeUgx)}
	}
	byVacancy := map[int64][]Vacancy{}
	for _, v := range vacancies {
		byVacancy[v.SchoolID] = append(byVacancy[v.SchoolID], Vacancy{ID: v.ID, Title: v.Title, Kind: v.Kind, ClosesOn: v.ClosesOn.Time.Format(dateLayout), Subjects: v.Subjects})
	}
	out := make([]Profile, 0, len(rows))
	for _, r := range rows {
		p := toProfile(r)
		p.ExamCentre = byCentre[r.SchoolID]
		if v := byVacancy[r.SchoolID]; v != nil {
			p.Vacancies = v
		}
		out = append(out, p)
	}
	return out, nil
}

func toProfile(r dbgen.ListProfilesRow) Profile {
	p := Profile{
		ID: r.SchoolID, Slug: r.Slug, Name: r.Name, Town: r.Town, District: r.District,
		Curricula: r.Curricula, Levels: r.Levels, Stay: r.Stay, Mode: r.Mode, Programs: r.Programs, Facilities: r.Facilities,
		Blurb: r.Blurb, Learners: r.Learners, Scholarships: r.Scholarships, Vacancies: []Vacancy{},
		Admissions: Admissions{
			Opens: date(r.AdmissionsOpens), Deadline: date(r.AdmissionsDeadline),
			FeeMinUGX: int8p(r.FeeMinUgx), FeeMaxUGX: int8p(r.FeeMaxUgx), Requirements: r.Requirements,
		},
		Views: int8p(r.Views), ListedAt: r.ListedAt.Time,
	}
	if r.Established.Valid {
		p.Established = &r.Established.Int16
	}
	if r.PassRate.Valid {
		p.PassRate = &PassRate{Rate: r.PassRate.Int16, Board: r.PassBoard.String, Exam: r.PassExam.String, Year: r.PassYear.Int16, Source: r.PassSource.String}
	}
	return p
}

// IsListed reports whether learners can see, save and apply to a school.
func (s *PostgresStore) IsListed(ctx context.Context, school int64) (bool, error) {
	ok, err := s.q.IsListed(ctx, school)
	if err != nil {
		return false, fmt.Errorf("check school: %w", err)
	}
	return ok, nil
}

// RecordView adds one to the school's view count for today. Who viewed is
// not stored; the school's own people aren't counted.
func (s *PostgresStore) RecordView(ctx context.Context, school, viewer int64) error {
	if err := s.q.RecordView(ctx, dbgen.RecordViewParams{SchoolID: school, Viewer: viewer}); err != nil {
		return fmt.Errorf("record view: %w", err)
	}
	return nil
}

func (s *PostgresStore) Saves(ctx context.Context, user int64) ([]Save, error) {
	rows, err := s.q.MySaves(ctx, user)
	if err != nil {
		return nil, fmt.Errorf("list saves: %w", err)
	}
	out := make([]Save, 0, len(rows))
	for _, r := range rows {
		out = append(out, Save{School: r.SchoolID, SavedAt: r.CreatedAt.Time})
	}
	return out, nil
}

func (s *PostgresStore) SetSaved(ctx context.Context, user, school int64, on bool) error {
	var err error
	if on {
		err = s.q.SaveSchool(ctx, dbgen.SaveSchoolParams{UserID: user, SchoolID: school})
	} else {
		err = s.q.UnsaveSchool(ctx, dbgen.UnsaveSchoolParams{UserID: user, SchoolID: school})
	}
	if err != nil {
		return fmt.Errorf("save school: %w", err)
	}
	return nil
}

func (s *PostgresStore) Applications(ctx context.Context, user int64) ([]Application, error) {
	rows, err := s.q.MyApplications(ctx, user)
	if err != nil {
		return nil, fmt.Errorf("list applications: %w", err)
	}
	out := make([]Application, 0, len(rows))
	for _, r := range rows {
		a, err := toApplication(dbgen.MyApplicationRow(r))
		if err != nil {
			return nil, err
		}
		out = append(out, a)
	}
	return out, nil
}

// Start begins the user's application to a school, or returns the one they
// already have. created is false when it already existed.
func (s *PostgresStore) Start(ctx context.Context, user, school int64) (Application, bool, error) {
	created := true
	id, err := s.q.InsertApplication(ctx, dbgen.InsertApplicationParams{SchoolID: school, UserID: user})
	if errors.Is(err, pgx.ErrNoRows) {
		created = false
		id, err = s.q.ApplicationFor(ctx, dbgen.ApplicationForParams{SchoolID: school, UserID: user})
	}
	if err != nil {
		return Application{}, false, fmt.Errorf("start application: %w", err)
	}
	a, err := s.application(ctx, user, id)
	return a, created, err
}

// Submit sends the user's started application with exactly what they chose
// to share, recording what they consented to. It returns ErrNotFound for
// someone else's application and ErrSubmitted if it was already sent.
func (s *PostgresStore) Submit(ctx context.Context, user, id int64, shared Shared, consent func(school string) string) (Application, error) {
	current, err := s.application(ctx, user, id)
	if err != nil {
		return Application{}, err
	}
	if current.Status != "started" {
		return Application{}, ErrSubmitted
	}
	body, err := json.Marshal(shared)
	if err != nil {
		return Application{}, fmt.Errorf("encode application: %w", err)
	}
	n, err := s.q.SubmitApplication(ctx, dbgen.SubmitApplicationParams{
		ID: id, UserID: user, Shared: body, ConsentText: pgtype.Text{String: consent(current.SchoolName), Valid: true},
	})
	if err != nil {
		return Application{}, fmt.Errorf("submit application: %w", err)
	}
	if n == 0 {
		return Application{}, ErrSubmitted
	}
	return s.application(ctx, user, id)
}

func (s *PostgresStore) application(ctx context.Context, user, id int64) (Application, error) {
	row, err := s.q.MyApplication(ctx, dbgen.MyApplicationParams{ID: id, UserID: user})
	if errors.Is(err, pgx.ErrNoRows) {
		return Application{}, ErrNotFound
	}
	if err != nil {
		return Application{}, fmt.Errorf("load application: %w", err)
	}
	return toApplication(row)
}

func toApplication(r dbgen.MyApplicationRow) (Application, error) {
	a := Application{ID: r.ID, School: r.SchoolID, SchoolName: r.SchoolName, Status: r.Status, StartedAt: r.StartedAt.Time}
	if r.SubmittedAt.Valid {
		a.SubmittedAt = &r.SubmittedAt.Time
	}
	if len(r.Shared) > 0 {
		var sh Shared
		if err := json.Unmarshal(r.Shared, &sh); err != nil {
			return Application{}, fmt.Errorf("read application: %w", err)
		}
		a.Shared = &sh
	}
	return a, nil
}

// LeadsSchool reports whether the user is an active leader or registrar there.
func (s *PostgresStore) LeadsSchool(ctx context.Context, user, school int64) (bool, error) {
	ids, err := s.q.StaffSchoolIDs(ctx, dbgen.StaffSchoolIDsParams{UserID: user, StaffRoles: roles.Admissions})
	if err != nil {
		return false, fmt.Errorf("load schools: %w", err)
	}
	return slices.Contains(ids, school), nil
}

// HasProfile reports whether the school has a network profile at all.
func (s *PostgresStore) HasProfile(ctx context.Context, school int64) (bool, error) {
	ok, err := s.q.HasProfile(ctx, school)
	if err != nil {
		return false, fmt.Errorf("check profile: %w", err)
	}
	return ok, nil
}

// Totals is the only view a school gets of interest in it: counts, with any
// figure under MinCohort hidden by the query itself.
func (s *PostgresStore) Totals(ctx context.Context, school int64) (Totals, error) {
	r, err := s.q.SchoolTotals(ctx, dbgen.SchoolTotalsParams{MinCohort: MinCohort, SchoolID: school})
	if err != nil {
		return Totals{}, fmt.Errorf("load totals: %w", err)
	}
	return Totals{
		ProfileViews: int8p(r.ProfileViews), Saves: int8p(r.Saves), ApplicationStarts: int8p(r.ApplicationStarts),
		ApplicationSubmissions: int8p(r.ApplicationSubmissions), Enrolments: int8p(r.Enrolments),
	}, nil
}

func date(d pgtype.Date) *string {
	if !d.Valid {
		return nil
	}
	s := d.Time.Format(dateLayout)
	return &s
}

func int8p(n pgtype.Int8) *int64 {
	if !n.Valid {
		return nil
	}
	v := n.Int64
	return &v
}
