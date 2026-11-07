package main

import (
	"fmt"
	"strings"
	"time"
)

// The fake API's two schools, by the names the designs give them.
var schoolNames = map[int64]string{1: "Kampala Hill School", 2: "Lakeview International School"}

// The school-admin designs' classes have no class teacher; these are taken from the teachers
// on their timetable so each class has one.
var designClassTeachers = map[string]string{"Primary 1A": "Mrs. A. Namaganda", "Primary 1B": "Mr. J. Ochieng", "Primary 1C": "Mrs. L. Atim"}

// designSubjects maps the designs' short subject labels to Uganda's curriculum names.
var designSubjects = map[string]string{
	"Science": "Integrated Science", "C.R.E.": "Christian Religious Education", "ICT": "Information and Communication Technology",
	"Literacy": "Literacy I", "Art": "Art and Design", "P.E.": "Physical Education",
}

const (
	termDaysBefore = 60
	termDaysAfter  = 30
	schoolDays     = 5
)

func (s *seeder) seedSchools() error {
	now := time.Now()
	for fakeID, name := range schoolNames {
		id, err := s.scalar(`
			INSERT INTO institutions_institution (name, primary_color, secondary_color, country_code, curriculum_track,
			  subscription_plan, is_active, created_at, grade_offerings, school_level, in_grace_period)
			VALUES ($1, '#2D4A6E', '#FFFFFF', 'UG', 'uganda', 'growth', true, now(), '[]', 'mixed', false)
			RETURNING id`, name)
		if err != nil {
			return fmt.Errorf("create %s: %w", name, err)
		}
		s.schools[fakeID] = id
		term, err := s.scalar(`INSERT INTO scheduling_academicterm (name, start_date, end_date, is_active, institution_id)
			VALUES ($1, $2, $3, true, $4) RETURNING id`,
			fmt.Sprintf("Term 3 %d", now.Year()), now.AddDate(0, 0, -termDaysBefore), now.AddDate(0, 0, termDaysAfter), id)
		if err != nil {
			return fmt.Errorf("term for %s: %w", name, err)
		}
		s.terms[id] = term
	}
	return nil
}

func (s *seeder) loadCurriculum() error {
	rows, err := s.pool.Query(s.ctx, `SELECT id, name FROM curriculum_classlevel`)
	if err != nil {
		return err
	}
	for rows.Next() {
		var id int64
		var name string
		if err := rows.Scan(&id, &name); err != nil {
			return err
		}
		s.levels[name] = id
	}
	rows.Close()
	rows, err = s.pool.Query(s.ctx, `SELECT DISTINCT ON (name) id, name FROM curriculum_subject ORDER BY name, id`)
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var id int64
		var name string
		if err := rows.Scan(&id, &name); err != nil {
			return err
		}
		s.subjects[name] = id
	}
	return rows.Err()
}

// level is the curriculum class level for a design name such as "Primary 6" or "Senior 2".
func (s *seeder) level(name string) (int64, error) {
	short := strings.NewReplacer("Primary ", "P", "Senior ", "S").Replace(name)
	if len(short) > 2 {
		short = short[:2] // "P1A" -> "P1"
	}
	id, ok := s.levels[short]
	if !ok {
		return 0, fmt.Errorf("no class level %q (from %q)", short, name)
	}
	return id, nil
}

// subject is the curriculum subject for a design label, or 0 for one the curriculum lacks (Library, Guidance).
func (s *seeder) subject(label string) int64 {
	if name, ok := designSubjects[label]; ok {
		label = name
	}
	return s.subjects[label]
}

func (s *seeder) newClass(title string, school, level, teacher int64) (int64, error) {
	id, err := s.scalar(`INSERT INTO classes_class (title, visibility, is_published, created_at, class_level_id, institution_id, teacher_id)
		VALUES ($1, 'private', true, now(), $2, $3, $4) RETURNING id`, title, level, school, teacher)
	if err != nil {
		return 0, fmt.Errorf("class %s: %w", title, err)
	}
	s.classSchool[id] = school
	return id, nil
}

func (s *seeder) enrol(class int64, name string) error {
	student, err := s.user(name)
	if err != nil {
		return err
	}
	return s.exec(`INSERT INTO classes_classenrollment (enrolled_class_id, student_id, status, enrolled_at)
		VALUES ($1, $2, 'active', now()) ON CONFLICT DO NOTHING`, class, student)
}

func (s *seeder) seedClasses() error {
	classes, err := apiList[apiClass](s.data, "/api/v1/classes/")
	if err != nil {
		return err
	}
	for _, c := range classes {
		level, err := s.level(c.ClassLevelName)
		if err != nil {
			return err
		}
		teacher, err := s.user(c.TeacherName)
		if err != nil {
			return err
		}
		id, err := s.newClass(c.Title, s.schools[c.Institution], level, teacher)
		if err != nil {
			return err
		}
		s.classes[c.ID] = id
		roster, err := apiOne[apiRoster](s.data, fmt.Sprintf("/api/v1/classes/%d/roster/", c.ID))
		if err != nil {
			return err
		}
		for _, st := range roster.Students {
			if err := s.enrol(id, st.StudentName); err != nil {
				return err
			}
		}
	}
	return s.seedDesignClasses()
}

// seedDesignClasses makes Primary 1A, 1B and 1C and puts each design learner in one of them (the
// samples sometimes list a learner in two classes; the first one named wins).
func (s *seeder) seedDesignClasses() error {
	school := s.schools[1]
	level, err := s.level("Primary 1")
	if err != nil {
		return err
	}
	for _, title := range s.data.School.Timetable.Classes {
		teacher, err := s.user(designClassTeachers[title])
		if err != nil {
			return err
		}
		id, err := s.newClass(title, school, level, teacher)
		if err != nil {
			return err
		}
		s.designClasses[title] = id
	}
	placed := map[string]bool{}
	place := func(name, cls string) error {
		name = canonical(name)
		class, ok := s.designClasses["Primary "+strings.TrimPrefix(cls, "P")]
		if placed[name] || !ok {
			return nil
		}
		placed[name] = true
		return s.enrol(class, name)
	}
	for _, m := range s.data.School.Marks {
		if err := place(m.Name, m.Cls); err != nil {
			return err
		}
	}
	for _, r := range s.data.School.Roster {
		if err := place(r.First+" "+r.Last, r.Cls); err != nil {
			return err
		}
	}
	return nil
}

// seedMemberships gives everyone a place in the schools their classes are in: staff by what they
// do there, learners as students, the parent through their children.
func (s *seeder) seedMemberships() error {
	head, err := s.user(s.data.Accounts["institution"].FullName)
	if err != nil {
		return err
	}
	for _, school := range s.schools {
		if err := s.member(head, school, "headteacher"); err != nil {
			return err
		}
	}
	rows, err := s.pool.Query(s.ctx, `
		SELECT c.institution_id, c.teacher_id, 'class_teacher' FROM classes_class c
		UNION SELECT c.institution_id, e.student_id, 'student' FROM classes_classenrollment e JOIN classes_class c ON c.id = e.enrolled_class_id`)
	if err != nil {
		return err
	}
	type m struct {
		school, user int64
		role         string
	}
	var all []m
	for rows.Next() {
		var x m
		if err := rows.Scan(&x.school, &x.user, &x.role); err != nil {
			return err
		}
		all = append(all, x)
	}
	rows.Close()
	for _, x := range all {
		if err := s.member(x.user, x.school, x.role); err != nil {
			return err
		}
	}
	// Teachers who only appear on the timetable or in messages teach subjects at the first school.
	for name, role := range s.roles {
		if role == "teacher" {
			if err := s.member(s.users[name], s.schools[1], "subject_teacher"); err != nil {
				return err
			}
		}
	}
	return nil
}

func (s *seeder) member(user, school int64, role string) error {
	return s.exec(`INSERT INTO institutions_institutionmembership (role, status, joined_at, institution_id, user_id)
		SELECT $1, 'active', now(), $2, $3
		WHERE NOT EXISTS (SELECT 1 FROM institutions_institutionmembership WHERE institution_id = $2 AND user_id = $3)`, role, school, user)
}

// seedFamilies links the demo parent to the four children the fake API gives her, approved.
func (s *seeder) seedFamilies() error {
	parent, err := s.user(s.data.Accounts["parent"].FullName)
	if err != nil {
		return err
	}
	for _, child := range s.fakeStudents {
		student, err := s.user(child)
		if err != nil {
			return err
		}
		err = s.exec(`INSERT INTO parent_portal_parentstudentlink (relationship_type, consent_status, linked_at, parent_profile_id, student_profile_id)
			SELECT 'mother', 'approved', now(), pp.id, sp.id FROM accounts_parentprofile pp, accounts_studentprofile sp
			WHERE pp.user_id = $1 AND sp.user_id = $2`, parent, student)
		if err != nil {
			return fmt.Errorf("link %s: %w", child, err)
		}
		var school int64
		if err := s.pool.QueryRow(s.ctx, `SELECT c.institution_id FROM classes_classenrollment e JOIN classes_class c ON c.id = e.enrolled_class_id
			WHERE e.student_id = $1 ORDER BY c.id LIMIT 1`, student).Scan(&school); err == nil {
			if err := s.member(parent, school, "parent"); err != nil {
				return err
			}
		}
	}
	return nil
}
