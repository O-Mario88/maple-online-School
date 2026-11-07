package main

import (
	"encoding/json"
	"fmt"
	"math"
	"strconv"
	"time"

	"github.com/O-Mario88/maple-online-School/api/internal/reports"
)

const (
	liveCapacity     = 40
	liveProvider     = "google_meet"
	formativeShare   = 0.2 // NCDC: formative out of 20, summative out of 80
	assessmentKind   = "assignment"
	assessmentSource = "manual_school_test" // what the API's own CreateAssessment writes
)

// The design dates sit in early November 2026. Upcoming lessons and live classes move with today,
// so on any day the earliest is tomorrow and the rest keep their spacing.
func upcoming(dates []string) (func(string) (time.Time, error), error) {
	var first time.Time
	for _, d := range dates {
		t, err := time.Parse(time.RFC3339, d)
		if err != nil {
			return nil, fmt.Errorf("unreadable date %q", d)
		}
		if first.IsZero() || t.Before(first) {
			first = t
		}
	}
	tomorrow := time.Now().Truncate(24*time.Hour).AddDate(0, 0, 1)
	shift := tomorrow.Sub(first.Truncate(24 * time.Hour))
	return func(d string) (time.Time, error) {
		t, err := time.Parse(time.RFC3339, d)
		if err != nil {
			return time.Time{}, fmt.Errorf("unreadable date %q", d)
		}
		return t.Add(shift), nil
	}, nil
}

func (s *seeder) seedLessons() error {
	lessons, err := apiList[apiLesson](s.data, "/api/v1/lessons/lesson/")
	if err != nil {
		return err
	}
	live, err := apiList[apiLive](s.data, "/api/v1/live-sessions/live-session/")
	if err != nil {
		return err
	}
	var dates []string
	for _, l := range lessons {
		dates = append(dates, l.ScheduledAt)
	}
	for _, l := range live {
		dates = append(dates, l.ScheduledStart)
	}
	when, err := upcoming(dates)
	if err != nil {
		return err
	}
	byClass := map[int64]int64{} // class -> its first lesson, which a live class hangs off
	for _, l := range lessons {
		at, err := when(l.ScheduledAt)
		if err != nil {
			return err
		}
		id, err := s.scalar(`INSERT INTO lessons_lesson (title, access_mode, scheduled_at, published_at, created_at, parent_class_id)
			VALUES ($1, $2, $3, now(), now(), $4) RETURNING id`, l.Title, l.AccessMode, at, s.classes[l.ParentClass])
		if err != nil {
			return fmt.Errorf("lesson %s: %w", l.Title, err)
		}
		s.lessons[l.ID] = id
		if _, ok := byClass[l.ParentClass]; !ok {
			byClass[l.ParentClass] = id
		}
	}
	for _, l := range live {
		start, err := when(l.ScheduledStart)
		if err != nil {
			return err
		}
		lesson, ok := byClass[l.HostClass]
		if !ok {
			return fmt.Errorf("live class %s has no lesson in its class", l.Title)
		}
		err = s.exec(`INSERT INTO live_sessions_livesession (meeting_link, provider, scheduled_start, duration_minutes, capacity,
			  enrolled_count, status, artifact_sync_status, lesson_id)
			VALUES ($1, $2, $3, $4, $5, 0, 'scheduled', 'none', $6)`, l.JoinURL, liveProvider, start, l.DurationMinutes, liveCapacity, lesson)
		if err != nil {
			return fmt.Errorf("live class %s: %w", l.Title, err)
		}
	}
	return nil
}

func (s *seeder) classTeacher(class int64) (int64, error) {
	return s.scalar(`SELECT teacher_id FROM classes_class WHERE id = $1`, class)
}

func (s *seeder) seedAssessments() error {
	items, err := apiList[apiAssessment](s.data, "/api/v1/assessments/assessment/")
	if err != nil {
		return err
	}
	for _, a := range items {
		class := s.classes[a.ParentClass]
		teacher, err := s.classTeacher(class)
		if err != nil {
			return fmt.Errorf("teacher of %s: %w", a.Title, err)
		}
		id, err := s.scalar(`INSERT INTO assessments_assessment (title, instructions, type, source, max_score, is_published,
			  created_by_id, created_at, term_id)
			VALUES ($1, $2, $3, $4, $5, $6, $7, now(), $8) RETURNING id`,
			a.Title, a.Description, assessmentKind, assessmentSource, a.TotalMarks, a.IsPublished, teacher, s.terms[s.classSchool[class]])
		if err != nil {
			return fmt.Errorf("assignment %s: %w", a.Title, err)
		}
		s.assessments[a.ID] = id
	}
	subs, err := apiList[apiSubmission](s.data, "/api/v1/assessments/submission/")
	if err != nil {
		return err
	}
	for _, sub := range subs {
		student, err := s.user(s.fakeStudents[sub.Student])
		if err != nil {
			return err
		}
		answers, err := json.Marshal(map[string]string{"text": sub.TextEntry})
		if err != nil {
			return err
		}
		id, err := s.scalar(`INSERT INTO assessments_submission (assessment_id, student_id, status, submitted_at, answers_data)
			VALUES ($1, $2, $3, $4, $5) RETURNING id`, s.assessments[sub.Assessment], student, sub.Status, sub.SubmittedAt, answers)
		if err != nil {
			return fmt.Errorf("submission %d: %w", sub.ID, err)
		}
		s.submissions[sub.ID] = id
	}
	grades, err := apiList[apiGradeRecord](s.data, "/api/v1/grading/records/")
	if err != nil {
		return err
	}
	for _, g := range grades {
		err := s.exec(`INSERT INTO grading_graderecord (submission_id, score, teacher_feedback, graded_at) VALUES ($1, $2, $3, $4)`,
			s.submissions[g.Submission], g.Score, g.Feedback, g.GradedAt)
		if err != nil {
			return fmt.Errorf("grade for submission %d: %w", g.Submission, err)
		}
	}
	return nil
}

// split turns a total out of 100 into NCDC formative (of 20) and summative (of 80) marks.
func split(total float64) (float64, float64) {
	formative := math.Round(total * formativeShare)
	return formative, total - formative
}

func (s *seeder) subjectGrade(student, class, by int64, total float64) error {
	formative, summative := split(total)
	band := reports.Band(total)
	return s.exec(`INSERT INTO grading_subjectgrade (student_id, assigned_class_id, term_id, formative_score, summative_score,
		  total_score, grade_letter, descriptor, finalized_by_id, finalized_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())
		ON CONFLICT (student_id, assigned_class_id, term_id) DO NOTHING`,
		student, class, s.terms[s.classSchool[class]], formative, summative, band.Total, band.Grade, band.Descriptor, by)
}

// seedMarks: the fake API's subject marks and published report cards, and the Primary 1A marks
// from the report-cards design.
func (s *seeder) seedMarks() error {
	cards, err := apiList[apiReport](s.data, "/api/v1/grading/reports/")
	if err != nil {
		return err
	}
	classOf := map[int64]int64{} // fake learner -> the class their report card is for
	for _, c := range cards {
		classOf[c.Student] = s.classes[c.ClassID]
	}
	subjects, err := apiList[apiSubjectGrade](s.data, "/api/v1/grading/subjects/")
	if err != nil {
		return err
	}
	for _, g := range subjects {
		if err := s.fakeMark(g.Student, classOf[g.Student], g.Score); err != nil {
			return err
		}
	}
	for _, c := range cards {
		if err := s.reportCard(c, classOf[c.Student]); err != nil {
			return err
		}
	}
	return s.designMarks()
}

func (s *seeder) fakeMark(fakeStudent, class int64, score string) error {
	student, err := s.user(s.fakeStudents[fakeStudent])
	if err != nil {
		return err
	}
	teacher, err := s.classTeacher(class)
	if err != nil {
		return err
	}
	total, err := strconv.ParseFloat(score, 64)
	if err != nil {
		return fmt.Errorf("unreadable mark %q", score)
	}
	return s.subjectGrade(student, class, teacher, total)
}

func (s *seeder) reportCard(c apiReport, class int64) error {
	student, err := s.user(s.fakeStudents[c.Student])
	if err != nil {
		return err
	}
	total, err := strconv.ParseFloat(c.OverallScore, 64)
	if err != nil {
		return fmt.Errorf("unreadable overall score %q", c.OverallScore)
	}
	school := s.classSchool[class]
	return s.exec(`INSERT INTO grading_reportcard (overall_score, overall_grade_letter, class_teacher_remarks, headteacher_remarks,
		  is_published, published_at, generated_at, institution_id, student_id, term_id)
		VALUES ($1, $2, $3, $4, $5, CASE WHEN $5 THEN now() END, now(), $6, $7, $8)`,
		total, reports.Band(total).Grade, c.TeacherComment, c.HeadteacherComment, c.IsPublished, school, student, s.terms[school])
}

func (s *seeder) designMarks() error {
	class := s.designClasses["Primary 1A"]
	teacher, err := s.classTeacher(class)
	if err != nil {
		return err
	}
	for _, m := range s.data.School.Marks {
		student, err := s.user(m.Name)
		if err != nil {
			return err
		}
		if err := s.subjectGrade(student, class, teacher, float64(m.Marks)); err != nil {
			return fmt.Errorf("mark for %s: %w", m.Name, err)
		}
	}
	return nil
}
