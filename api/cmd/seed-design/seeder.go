package main

import (
	"context"
	"fmt"
	"regexp"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

// designEmailDomain is for every sample person who isn't one of the five demo accounts. .test
// is reserved, so no message can ever reach a real inbox.
const designEmailDomain = "design.maple.test"

// aliases are the sample data's other names for one person: the fake API calls the learner
// account "Daniel O." in rosters and the teacher "Ms. Sarah N." in messages.
var aliases = map[string]string{
	"Daniel O.":    "Daniel Okello",
	"Ms. Sarah N.": "Sarah N.",
}

type seeder struct {
	ctx      context.Context
	pool     *pgxpool.Pool
	data     designData
	password string

	users         map[string]int64 // by canonical name
	roles         map[string]string
	accountEmails map[string]string // demo account key -> email
	schools       map[int64]int64   // fake API school id -> id
	terms         map[int64]int64   // school id -> its current term
	classes       map[int64]int64   // fake API class id -> id
	classSchool   map[int64]int64   // class id -> school id
	designClasses map[string]int64  // "Primary 1A" -> id
	levels        map[string]int64  // "P1" -> curriculum class level id
	subjects      map[string]int64  // subject name -> curriculum subject id
	fakeStudents  map[int64]string  // fake API learner id -> canonical name
	lessons       map[int64]int64   // fake API lesson id -> id
	assessments   map[int64]int64
	submissions   map[int64]int64
}

type step struct {
	name string
	run  func() error
}

func newSeeder(ctx context.Context, pool *pgxpool.Pool, data designData, passwordHash string) *seeder {
	return &seeder{
		ctx: ctx, pool: pool, data: data, password: passwordHash,
		users: map[string]int64{}, roles: map[string]string{}, accountEmails: map[string]string{},
		schools: map[int64]int64{}, terms: map[int64]int64{}, classes: map[int64]int64{}, classSchool: map[int64]int64{},
		designClasses: map[string]int64{}, levels: map[string]int64{}, subjects: map[string]int64{},
		fakeStudents: map[int64]string{}, lessons: map[int64]int64{}, assessments: map[int64]int64{}, submissions: map[int64]int64{},
	}
}

// steps run in order: each uses what the ones before it made.
func (s *seeder) steps() []step {
	return []step{
		{"people", s.seedPeople},
		{"schools and terms", s.seedSchools},
		{"curriculum lookups", s.loadCurriculum},
		{"classes and enrolment", s.seedClasses},
		{"memberships", s.seedMemberships},
		{"families", s.seedFamilies},
		{"timetable", s.seedTimetable},
		{"attendance", s.seedAttendance},
		{"lessons and live classes", s.seedLessons},
		{"assignments and grades", s.seedAssessments},
		{"marks and report cards", s.seedMarks},
		{"fees, invoices and payments", s.seedFinance},
		{"library", s.seedLibrary},
		{"messages", s.seedMessages},
		{"notifications", s.seedNotices},
	}
}

func (s *seeder) scalar(query string, args ...any) (int64, error) {
	var id int64
	if err := s.pool.QueryRow(s.ctx, query, args...).Scan(&id); err != nil {
		return 0, err
	}
	return id, nil
}

func (s *seeder) exec(query string, args ...any) error {
	_, err := s.pool.Exec(s.ctx, query, args...)
	return err
}

func canonical(name string) string {
	name = strings.TrimSpace(name)
	if a, ok := aliases[name]; ok {
		return a
	}
	return name
}

var nonWord = regexp.MustCompile(`[^a-z0-9]+`)

// emailFor is a sample person's sign-in address, made from their name.
func emailFor(name string) string {
	slug := strings.Trim(nonWord.ReplaceAllString(strings.ToLower(name), "."), ".")
	return slug + "@" + designEmailDomain
}

// person returns the user for a name, creating them with role the first time.
func (s *seeder) person(name, role, email string) (int64, error) {
	name = canonical(name)
	if id, ok := s.users[name]; ok {
		return id, nil
	}
	if email == "" {
		email = emailFor(name)
	}
	id, err := s.scalar(`
		INSERT INTO accounts_user (password, is_superuser, email, full_name, country_code, role,
		  whatsapp_opt_in, is_active, is_staff, date_joined, email_verified)
		VALUES ($1, false, $2, $3, 'UG', $4, false, true, $5, now(), true)
		RETURNING id`, s.password, email, name, role, role == "admin")
	if err != nil {
		return 0, fmt.Errorf("create %s: %w", name, err)
	}
	s.users[name] = id
	s.roles[name] = role
	if role == "student" {
		if err := s.exec(`INSERT INTO accounts_studentprofile (user_id, onboarding_status) VALUES ($1, 'active')`, id); err != nil {
			return 0, fmt.Errorf("learner profile for %s: %w", name, err)
		}
	}
	if role == "parent" {
		if err := s.exec(`INSERT INTO accounts_parentprofile (user_id) VALUES ($1)`, id); err != nil {
			return 0, fmt.Errorf("parent profile for %s: %w", name, err)
		}
	}
	return id, nil
}

// user is a person seeded earlier, by any of their names.
func (s *seeder) user(name string) (int64, error) {
	id, ok := s.users[canonical(name)]
	if !ok {
		return 0, fmt.Errorf("no one called %q was seeded", name)
	}
	return id, nil
}

// seedPeople creates the five demo accounts (their real demo emails, so the design's sign-in
// screen works) and everyone else the samples name: learners, teachers and staff.
func (s *seeder) seedPeople() error {
	for key, a := range s.data.Accounts {
		if _, err := s.person(a.FullName, a.Role, a.Email); err != nil {
			return err
		}
		s.accountEmails[key] = a.Email
	}
	if err := s.seedFakeAPIPeople(); err != nil {
		return err
	}
	return s.seedDesignPeople()
}

func (s *seeder) seedFakeAPIPeople() error {
	classes, err := apiList[apiClass](s.data, "/api/v1/classes/")
	if err != nil {
		return err
	}
	for _, c := range classes {
		if _, err := s.person(c.TeacherName, "teacher", ""); err != nil {
			return err
		}
		roster, err := apiOne[apiRoster](s.data, fmt.Sprintf("/api/v1/classes/%d/roster/", c.ID))
		if err != nil {
			return err
		}
		for _, st := range roster.Students {
			if _, err := s.person(st.StudentName, "student", ""); err != nil {
				return err
			}
			s.fakeStudents[st.Student] = canonical(st.StudentName)
		}
	}
	slots, err := apiList[apiSlot](s.data, "/api/v1/scheduling/timetable/")
	if err != nil {
		return err
	}
	for _, sl := range slots {
		if _, err := s.person(sl.TeacherName, "teacher", ""); err != nil {
			return err
		}
	}
	threads, err := apiList[apiThread](s.data, "/api/v1/messages/threads/")
	if err != nil {
		return err
	}
	for _, t := range threads {
		if _, err := s.person(t.Staff.Name, "teacher", ""); err != nil {
			return err
		}
	}
	return nil
}

func (s *seeder) seedDesignPeople() error {
	sd := s.data.School
	for _, slot := range sd.Timetable.Slots {
		for _, l := range slot.Lessons {
			if _, err := s.person(l.Teacher, "teacher", ""); err != nil {
				return err
			}
		}
	}
	for _, r := range sd.Roster {
		if _, err := s.person(r.First+" "+r.Last, "student", ""); err != nil {
			return err
		}
	}
	for _, m := range sd.Marks {
		if _, err := s.person(m.Name, "student", ""); err != nil {
			return err
		}
	}
	for _, p := range sd.Fees.Payments {
		if _, err := s.person(p.Name, "student", ""); err != nil {
			return err
		}
	}
	return nil
}
