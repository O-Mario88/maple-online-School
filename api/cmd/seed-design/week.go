package main

import (
	"fmt"
	"strconv"
	"strings"
	"time"
)

// firstMorningHour: the designs write afternoon periods as "1:00 – 1:40", so an hour before this is pm.
const firstMorningHour = 7

// clock turns "8:40" or "1:00" (pm) into "08:40" / "13:00".
func clock(t string) (string, error) {
	parts := strings.Split(strings.TrimSpace(t), ":")
	if len(parts) != 2 {
		return "", fmt.Errorf("unreadable time %q", t)
	}
	h, err := strconv.Atoi(parts[0])
	if err != nil {
		return "", fmt.Errorf("unreadable time %q", t)
	}
	if h < firstMorningHour {
		h += 12
	}
	return fmt.Sprintf("%02d:%s", h, parts[1]), nil
}

// period splits "8:00 – 8:40" into its start and end.
func period(span string) (string, string, error) {
	ends := strings.Split(span, "–")
	if len(ends) != 2 {
		return "", "", fmt.Errorf("unreadable period %q", span)
	}
	start, err := clock(ends[0])
	if err != nil {
		return "", "", err
	}
	end, err := clock(ends[1])
	return start, end, err
}

func (s *seeder) room(school int64, name string) (int64, error) {
	var id int64
	err := s.pool.QueryRow(s.ctx, `SELECT id FROM scheduling_room WHERE institution_id = $1 AND name = $2`, school, name).Scan(&id)
	if err == nil {
		return id, nil
	}
	return s.scalar(`INSERT INTO scheduling_room (name, capacity, is_active, institution_id) VALUES ($1, 40, true, $2) RETURNING id`, name, school)
}

func (s *seeder) slot(class int64, day int, start, end, roomName, teacherName string, subject int64) error {
	school := s.classSchool[class]
	room, err := s.room(school, roomName)
	if err != nil {
		return fmt.Errorf("room %s: %w", roomName, err)
	}
	teacher, err := s.user(teacherName)
	if err != nil {
		return err
	}
	var subj any
	if subject != 0 {
		subj = subject
	}
	return s.exec(`INSERT INTO scheduling_timetableslot (day_of_week, start_time, end_time, is_active, is_draft,
		  assigned_class_id, institution_id, room_id, teacher_id, term_id, subject_id)
		VALUES ($1, $2, $3, true, false, $4, $5, $6, $7, $8, $9)`,
		day, start, end, class, school, room, teacher, s.terms[school], subj)
}

// seedTimetable: the fake API's three Monday lessons, and Primary 1A's whole designed week.
func (s *seeder) seedTimetable() error {
	slots, err := apiList[apiSlot](s.data, "/api/v1/scheduling/timetable/")
	if err != nil {
		return err
	}
	for _, sl := range slots {
		if err := s.slot(s.classes[sl.ClassID], sl.DayOfWeek, sl.StartTime, sl.EndTime, sl.RoomName, sl.TeacherName, 0); err != nil {
			return err
		}
	}
	class := s.designClasses["Primary 1A"]
	for _, row := range s.data.School.Timetable.Slots {
		if row.Label != "" {
			continue // Break and Lunch
		}
		start, end, err := period(row.Time)
		if err != nil {
			return err
		}
		for i, l := range row.Lessons {
			if err := s.slot(class, i+1, start, end, l.Room, l.Teacher, s.subject(l.Subject)); err != nil {
				return err
			}
		}
	}
	return nil
}

// Primary 1A's register for the last school week: everyone present, one late arrival and one absence.
var weekExceptions = map[int]map[string]string{2: {"Peter Atim": "late"}, 4: {"John Otim": "absent"}}

func (s *seeder) seedAttendance() error {
	marks, err := apiList[apiAttendance](s.data, "/api/v1/attendance/daily/")
	if err != nil {
		return err
	}
	head, err := s.user(s.data.Accounts["institution"].FullName)
	if err != nil {
		return err
	}
	school := s.schools[1]
	for _, m := range marks {
		student, err := s.user(s.fakeStudents[m.Student])
		if err != nil {
			return err
		}
		if err := s.register(school, student, head, m.Date, m.Status, m.Note); err != nil {
			return err
		}
	}
	return s.seedDesignWeek(school)
}

func (s *seeder) seedDesignWeek(school int64) error {
	teacher, err := s.user(designClassTeachers["Primary 1A"])
	if err != nil {
		return err
	}
	rows, err := s.pool.Query(s.ctx, `SELECT u.id, u.full_name FROM classes_classenrollment e JOIN accounts_user u ON u.id = e.student_id
		WHERE e.enrolled_class_id = $1`, s.designClasses["Primary 1A"])
	if err != nil {
		return err
	}
	type learner struct {
		id   int64
		name string
	}
	var class []learner
	for rows.Next() {
		var l learner
		if err := rows.Scan(&l.id, &l.name); err != nil {
			return err
		}
		class = append(class, l)
	}
	rows.Close()
	for n, day := range lastSchoolDays(time.Now(), schoolDays) {
		for _, l := range class {
			status := "present"
			if st, ok := weekExceptions[n+1][l.name]; ok {
				status = st
			}
			if err := s.register(school, l.id, teacher, day.Format(time.DateOnly), status, ""); err != nil {
				return err
			}
		}
	}
	return nil
}

func (s *seeder) register(school, student, by int64, date, status, note string) error {
	return s.exec(`INSERT INTO attendance_dailyregister (record_date, status, notes, created_at, institution_id, recorded_by_id, student_id, term_id)
		VALUES ($1, $2, $3, now(), $4, $5, $6, $7)`, date, status, note, school, by, student, s.terms[school])
}

// lastSchoolDays are the n weekdays before today, oldest first.
func lastSchoolDays(today time.Time, n int) []time.Time {
	days := make([]time.Time, 0, n)
	for d := today.AddDate(0, 0, -1); len(days) < n; d = d.AddDate(0, 0, -1) {
		if d.Weekday() != time.Saturday && d.Weekday() != time.Sunday {
			days = append([]time.Time{d}, days...)
		}
	}
	return days
}
