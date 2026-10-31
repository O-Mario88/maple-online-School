// Package insights shows teachers which learners need them, and records what
// they did about it (a message to the family, remedial work, a meeting).
package insights

import "fmt"

const (
	LevelHigh   = "high"
	LevelMedium = "medium"
	LevelOK     = "ok"
)

// Thresholds a teacher would recognise. Attendance needs a few marked days
// before it says anything.
const (
	minDaysForAttendance = 3
	attendanceHigh       = 0.75
	attendanceMedium     = 0.9
	averageHigh          = 0.4
	averageMedium        = 0.55
	missingHigh          = 3
)

// Signals are what we know about one learner in one class.
type Signals struct {
	DaysMarked   int
	DaysAttended int
	WorkSet      int
	WorkDone     int
	// Average is the share of marks earned on marked work, or nil if none.
	Average *float64
}

// Assess rates a learner and says why, most important reason first.
func Assess(s Signals) (string, []string) {
	level := LevelOK
	var reasons []string
	raise := func(to, reason string) {
		if rank(to) < rank(level) {
			level = to
		}
		reasons = append(reasons, reason)
	}

	if s.DaysMarked >= minDaysForAttendance {
		rate := float64(s.DaysAttended) / float64(s.DaysMarked)
		reason := fmt.Sprintf("Attended %d of the last %d school days", s.DaysAttended, s.DaysMarked)
		switch {
		case rate < attendanceHigh:
			raise(LevelHigh, reason)
		case rate < attendanceMedium:
			raise(LevelMedium, reason)
		}
	}
	if s.Average != nil {
		reason := fmt.Sprintf("Averaging %.0f%% on marked work", *s.Average*100)
		switch {
		case *s.Average < averageHigh:
			raise(LevelHigh, reason)
		case *s.Average < averageMedium:
			raise(LevelMedium, reason)
		}
	}
	if missing := s.WorkSet - s.WorkDone; missing > 0 {
		noun := "assignments"
		if missing == 1 {
			noun = "assignment"
		}
		reason := fmt.Sprintf("%d %s not handed in", missing, noun)
		if missing >= missingHigh {
			raise(LevelHigh, reason)
		} else {
			raise(LevelMedium, reason)
		}
	}
	return level, reasons
}

// rank orders levels most urgent first.
func rank(level string) int {
	switch level {
	case LevelHigh:
		return 0
	case LevelMedium:
		return 1
	default:
		return 2
	}
}
