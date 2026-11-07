package main

import (
	"encoding/json"
	"fmt"
	"os"
)

// designData is .local/design-data.json, written by the app's `npm run design:export`
// (mobile/scripts/design-data/export.design.ts): the design build's sample data.
type designData struct {
	Accounts map[string]account         `json:"accounts"`
	API      map[string]json.RawMessage `json:"api"`
	School   schoolDesigns              `json:"school"`
}

type account struct {
	ID       int64  `json:"id"`
	Email    string `json:"email"`
	FullName string `json:"full_name"`
	Role     string `json:"role"`
	Portal   string `json:"portal"`
}

// list is a page from the fake API: `{ count, results }`.
type list[T any] struct {
	Results []T `json:"results"`
}

type apiClass struct {
	ID             int64  `json:"id"`
	Title          string `json:"title"`
	ClassLevel     int64  `json:"class_level"`
	ClassLevelName string `json:"class_level_name"`
	SubjectName    string `json:"subject_name"`
	Teacher        int64  `json:"teacher"`
	TeacherName    string `json:"teacher_name"`
	Institution    int64  `json:"institution"`
}

type apiRoster struct {
	Students []struct {
		Student     int64  `json:"student"`
		StudentName string `json:"student_name"`
	} `json:"students"`
}

type apiSlot struct {
	DayOfWeek   int    `json:"day_of_week"`
	StartTime   string `json:"start_time"`
	EndTime     string `json:"end_time"`
	ClassID     int64  `json:"class_id"`
	RoomName    string `json:"room_name"`
	TeacherName string `json:"teacher_name"`
}

type apiLesson struct {
	ID          int64  `json:"id"`
	Title       string `json:"title"`
	AccessMode  string `json:"access_mode"`
	ScheduledAt string `json:"scheduled_at"`
	PublishedAt string `json:"published_at"`
	ParentClass int64  `json:"parent_class"`
}

type apiLive struct {
	Title           string `json:"title"`
	ScheduledStart  string `json:"scheduled_start"`
	DurationMinutes int    `json:"duration_minutes"`
	HostClass       int64  `json:"host_class"`
	JoinURL         string `json:"join_url"`
}

type apiAssessment struct {
	ID             int64  `json:"id"`
	Title          string `json:"title"`
	Description    string `json:"description"`
	AssessmentType string `json:"assessment_type"`
	TotalMarks     int    `json:"total_marks"`
	ParentClass    int64  `json:"parent_class"`
	IsPublished    bool   `json:"is_published"`
}

type apiSubmission struct {
	ID          int64  `json:"id"`
	Assessment  int64  `json:"assessment"`
	Student     int64  `json:"student"`
	SubmittedAt string `json:"submitted_at"`
	Status      string `json:"status"`
	TextEntry   string `json:"text_Entry"`
}

type apiGradeRecord struct {
	Submission int64  `json:"submission"`
	Score      string `json:"score"`
	Feedback   string `json:"feedback"`
	GradedAt   string `json:"graded_at"`
}

type apiReport struct {
	Student            int64  `json:"student"`
	ClassID            int64  `json:"class_id"`
	OverallScore       string `json:"overall_score"`
	TeacherComment     string `json:"teacher_comment"`
	HeadteacherComment string `json:"headteacher_comment"`
	IsPublished        bool   `json:"is_published"`
}

type apiSubjectGrade struct {
	Student     int64  `json:"student"`
	SubjectName string `json:"subject_name"`
	Score       string `json:"score"`
}

type apiFeeItem struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	AmountMinor int64  `json:"amount_minor"`
	Currency    string `json:"currency"`
	ClassLevel  *int64 `json:"class_level"`
}

type apiInvoice struct {
	Student   int64  `json:"student"`
	Class     int64  `json:"class"`
	PaidMinor int64  `json:"paid_minor"`
	DueDate   string `json:"due_date"`
	Lines     []struct {
		FeeItem int64 `json:"fee_item"`
	} `json:"lines"`
}

type apiLibraryItem struct {
	Title          string `json:"title"`
	SubjectName    string `json:"subject_name"`
	ClassLevelName string `json:"class_level_name"`
	Kind           string `json:"kind"`
	URL            string `json:"url"`
}

type apiThread struct {
	ID       int64  `json:"id"`
	Subject  string `json:"subject"`
	Student  ref    `json:"student"`
	Staff    ref    `json:"staff"`
	Messages []struct {
		Author    ref    `json:"author"`
		Body      string `json:"body"`
		CreatedAt string `json:"created_at"`
	} `json:"messages"`
}

type ref struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

type apiNote struct {
	Title     string  `json:"title"`
	Body      string  `json:"body"`
	Kind      string  `json:"kind"`
	ReadAt    *string `json:"read_at"`
	CreatedAt string  `json:"created_at"`
	Link      string  `json:"link"`
}

type apiAttendance struct {
	Student int64  `json:"student"`
	Date    string `json:"date"`
	Status  string `json:"status"`
	Note    string `json:"note"`
}

type designLesson struct {
	Subject string `json:"subject"`
	Room    string `json:"room"`
	Teacher string `json:"teacher"`
}

// schoolDesigns are the school-admin designs' own rows (mock/school-admin.ts).
type schoolDesigns struct {
	Timetable struct {
		Classes []string `json:"classes"`
		Slots   []struct {
			Time    string         `json:"time"`
			Label   string         `json:"label"`
			Lessons []designLesson `json:"lessons"`
		} `json:"slots"`
	} `json:"timetable"`
	Marks []struct {
		Name  string `json:"name"`
		Cls   string `json:"cls"`
		Marks int    `json:"marks"`
	} `json:"marks"`
	Roster []struct {
		First string `json:"first"`
		Last  string `json:"last"`
		Cls   string `json:"cls"`
	} `json:"roster"`
	Fees struct {
		Structures []struct {
			Item   string `json:"item"`
			Grade  string `json:"grade"`
			Amount int64  `json:"amount"`
		} `json:"structures"`
		Payments []struct {
			Date   string `json:"date"`
			Name   string `json:"name"`
			Amount int64  `json:"amount"`
			Method string `json:"method"`
			Ref    string `json:"ref"`
		} `json:"payments"`
	} `json:"fees"`
}

func loadData(path string) (designData, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return designData{}, fmt.Errorf("read %s (run `npm run design:export` in mobile/ first): %w", path, err)
	}
	var d designData
	if err := json.Unmarshal(raw, &d); err != nil {
		return designData{}, fmt.Errorf("parse %s: %w", path, err)
	}
	if len(d.Accounts) == 0 || len(d.API) == 0 {
		return designData{}, fmt.Errorf("%s has no accounts or API samples", path)
	}
	return d, nil
}

// apiList decodes one fake-API page from the export.
func apiList[T any](d designData, path string) ([]T, error) {
	raw, ok := d.API[path]
	if !ok {
		return nil, fmt.Errorf("the export has no %s", path)
	}
	var page list[T]
	if err := json.Unmarshal(raw, &page); err != nil {
		return nil, fmt.Errorf("parse %s: %w", path, err)
	}
	return page.Results, nil
}

// apiOne decodes one fake-API object from the export.
func apiOne[T any](d designData, path string) (T, error) {
	var v T
	raw, ok := d.API[path]
	if !ok {
		return v, fmt.Errorf("the export has no %s", path)
	}
	if err := json.Unmarshal(raw, &v); err != nil {
		return v, fmt.Errorf("parse %s: %w", path, err)
	}
	return v, nil
}
