package curriculum

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/O-Mario88/maple-online-School/api/internal/platform/dbgen"
)

// Programme is a country's national curriculum: its levels, the subjects each
// class offers (and which are compulsory), and the rules for choosing them.
// Schools start from it when they set up.
type Programme struct {
	Country string           `json:"country"`
	Tracks  []ProgrammeTrack `json:"tracks"`
}

type ProgrammeTrack struct {
	ID     int64             `json:"id"`
	Name   string            `json:"name"`
	Levels []ProgrammeLevel  `json:"levels"`
	Rules  []json.RawMessage `json:"rules"`
}

type ProgrammeLevel struct {
	ID      int64            `json:"id"`
	Name    string           `json:"name"`
	Classes []ProgrammeClass `json:"classes"`
}

type ProgrammeClass struct {
	ID       int64            `json:"id"`
	Name     string           `json:"name"`
	Grade    int32            `json:"grade"`
	Subjects []OfferedSubject `json:"subjects"`
}

type OfferedSubject struct {
	ID         int64  `json:"id"`
	Code       string `json:"code"`
	Name       string `json:"name"`
	Compulsory bool   `json:"compulsory"`
}

func (s *PostgresStore) Programme(ctx context.Context, country string) (Programme, error) {
	rows, err := s.q.ProgrammeRows(ctx, country)
	if err != nil {
		return Programme{}, fmt.Errorf("programme rows: %w", err)
	}
	if len(rows) == 0 {
		return Programme{}, ErrNotFound
	}
	rules, err := s.q.ProgrammeRules(ctx, country)
	if err != nil {
		return Programme{}, fmt.Errorf("programme rules: %w", err)
	}
	return buildProgramme(country, rows, rules), nil
}

// buildProgramme groups rows (ordered by track, then grade) into tracks,
// levels and classes. Levels appear in the order of their youngest class.
func buildProgramme(country string, rows []dbgen.ProgrammeRowsRow, rules []dbgen.ProgrammeRulesRow) Programme {
	p := Programme{Country: country, Tracks: []ProgrammeTrack{}}
	trackIdx := map[int64]int{}
	levelIdx := map[int64]int{}
	classIdx := map[int64]int{}
	for _, r := range rows {
		ti, ok := trackIdx[r.TrackID]
		if !ok {
			ti = len(p.Tracks)
			trackIdx[r.TrackID] = ti
			p.Tracks = append(p.Tracks, ProgrammeTrack{ID: r.TrackID, Name: r.TrackName, Levels: []ProgrammeLevel{}, Rules: []json.RawMessage{}})
		}
		track := &p.Tracks[ti]
		li, ok := levelIdx[r.LevelID]
		if !ok {
			li = len(track.Levels)
			levelIdx[r.LevelID] = li
			track.Levels = append(track.Levels, ProgrammeLevel{ID: r.LevelID, Name: r.LevelName, Classes: []ProgrammeClass{}})
		}
		level := &track.Levels[li]
		ci, ok := classIdx[r.ClassID]
		if !ok {
			ci = len(level.Classes)
			classIdx[r.ClassID] = ci
			level.Classes = append(level.Classes, ProgrammeClass{ID: r.ClassID, Name: r.ClassName, Grade: r.Grade, Subjects: []OfferedSubject{}})
		}
		if r.SubjectID == 0 {
			continue
		}
		class := &level.Classes[ci]
		class.Subjects = append(class.Subjects, OfferedSubject{ID: r.SubjectID, Code: r.SubjectCode, Name: r.SubjectName, Compulsory: r.Compulsory})
	}
	for _, r := range rules {
		if ti, ok := trackIdx[r.TrackID]; ok {
			p.Tracks[ti].Rules = append(p.Tracks[ti].Rules, json.RawMessage(r.RulePayload))
		}
	}
	return p
}
