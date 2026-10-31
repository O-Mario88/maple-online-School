// Package curriculum serves the curriculum (countries, levels, subjects,
// topics, competencies) and the course-catalog tree.
package curriculum

import (
	"fmt"
	"strconv"
	"strings"
)

// TreeRow is one class level and (optionally) one of its topics.
type TreeRow struct {
	LevelID                int64
	LevelName              string
	ClassID                int64
	ClassName              string
	TopicID, SubjectID     int64 // 0 when the class has no topics yet
	TopicName, SubjectName string
}

// The tree keeps the exact JSON shape of Django's CurriculumTreeView (the
// course catalog the apps already render).

type Tree struct {
	Version   string  `json:"version"`
	UpdatedAt string  `json:"updatedAt"`
	Levels    []Level `json:"levels"`
}

type Level struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Classes     []Class `json:"classes"`
}

type Class struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Level       string  `json:"level"`
	Description string  `json:"description"`
	IsExamYear  bool    `json:"isExamYear"`
	ExamType    *string `json:"examType"`
	Terms       []Term  `json:"terms"`
}

type Term struct {
	ID       string    `json:"id"`
	Name     string    `json:"name"`
	Subjects []Subject `json:"subjects"`
}

type Subject struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	TeacherID   string  `json:"teacherId,omitempty"`
	Description string  `json:"description"`
	Topics      []Topic `json:"topics"`
}

type Topic struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Subtopics   []Subtopic `json:"subtopics"`
}

type Subtopic struct {
	ID      string   `json:"id"`
	Name    string   `json:"name"`
	Lessons []Lesson `json:"lessons"`
}

type Lesson struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Type      string `json:"type"`
	Duration  string `json:"duration"`
	Completed bool   `json:"completed"`
}

const termsPerYear = 3

var phases = []string{"Introduction & Overview", "Core Concepts", "Worked Examples", "Advanced Application"}

// BuildTree turns ordered rows into the catalog tree. Each subject's topics
// are spread over three terms (rounded up for the earlier terms), and every
// topic gets the same four phases, as Django did.
func BuildTree(rows []TreeRow) Tree {
	tree := Tree{Version: "3.0-NCDC (DB Seeded)", UpdatedAt: "2026-04-05", Levels: []Level{}}
	type classAcc struct {
		class    Class
		level    int64
		subjects []Subject // in first-seen order
	}
	levelIdx := map[int64]int{}
	classes := map[int64]*classAcc{}
	var order []int64
	for _, r := range rows {
		if _, ok := levelIdx[r.LevelID]; !ok {
			levelIdx[r.LevelID] = len(tree.Levels)
			tree.Levels = append(tree.Levels, Level{ID: strconv.FormatInt(r.LevelID, 10), Name: r.LevelName, Classes: []Class{}})
		}
		acc, ok := classes[r.ClassID]
		if !ok {
			acc = &classAcc{class: Class{ID: slug(r.ClassName), Name: r.ClassName, Level: r.LevelName, Terms: []Term{}}, level: r.LevelID}
			classes[r.ClassID] = acc
			order = append(order, r.ClassID)
		}
		if r.TopicID == 0 {
			continue
		}
		i := subjectIndex(&acc.subjects, r.SubjectID, r.SubjectName)
		acc.subjects[i].Topics = append(acc.subjects[i].Topics, topic(r.TopicID, r.TopicName))
	}
	for _, id := range order {
		acc := classes[id]
		acc.class.Terms = splitTerms(acc.subjects)
		li := levelIdx[acc.level]
		tree.Levels[li].Classes = append(tree.Levels[li].Classes, acc.class)
	}
	return tree
}

func subjectIndex(list *[]Subject, id int64, name string) int {
	key := strconv.FormatInt(id, 10)
	for i, s := range *list {
		if s.ID == key {
			return i
		}
	}
	*list = append(*list, Subject{ID: key, Name: name, TeacherID: "sys-auto", Topics: []Topic{}})
	return len(*list) - 1
}

func splitTerms(subjects []Subject) []Term {
	terms := make([]Term, 0, termsPerYear)
	for t := 1; t <= termsPerYear; t++ {
		term := Term{ID: fmt.Sprintf("term-%d", t), Name: fmt.Sprintf("Term %d", t), Subjects: []Subject{}}
		for _, s := range subjects {
			total := len(s.Topics)
			chunk := (total + termsPerYear - 1) / termsPerYear
			start := min(chunk*(t-1), total)
			end := total
			if t < termsPerYear {
				end = min(chunk*t, total)
			}
			if start < end {
				part := s
				part.Topics = s.Topics[start:end]
				term.Subjects = append(term.Subjects, part)
			}
		}
		terms = append(terms, term)
	}
	return terms
}

func topic(id int64, name string) Topic {
	t := Topic{ID: strconv.FormatInt(id, 10), Name: name, Subtopics: make([]Subtopic, 0, len(phases))}
	for i, phase := range phases {
		pid := fmt.Sprintf("dynamic-sub-%d-%d", id, i)
		t.Subtopics = append(t.Subtopics, Subtopic{ID: pid, Name: phase, Lessons: []Lesson{
			{ID: "vid-" + pid, Title: fmt.Sprintf("%s: %s – Video Lesson", name, phase), Type: "video", Duration: "35 MIN"},
			{ID: "not-" + pid, Title: fmt.Sprintf("%s: %s – Study Notes", name, phase), Type: "notes", Duration: "20 MIN"},
			{ID: "exe-" + pid, Title: fmt.Sprintf("%s: %s – Practice Set", name, phase), Type: "exercise", Duration: "25 MIN"},
		}})
	}
	return t
}

// slug matches Django's str(name).lower().replace(' ', '-').
func slug(name string) string {
	return strings.ReplaceAll(strings.ToLower(name), " ", "-")
}
