package curriculum

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/O-Mario88/maple-online-School/api/internal/platform/dbgen"
)

// PostgresStore implements Store with read-only queries.
type PostgresStore struct{ q *dbgen.Queries }

func NewPostgresStore(db dbgen.DBTX) *PostgresStore { return &PostgresStore{q: dbgen.New(db)} }

func (s *PostgresStore) Countries(ctx context.Context) ([]Country, error) {
	rows, err := s.q.ListCountries(ctx)
	if err != nil {
		return nil, fmt.Errorf("list countries: %w", err)
	}
	out := make([]Country, 0, len(rows))
	for _, r := range rows {
		out = append(out, Country{ID: r.ID, Code: r.Code, Name: r.Name, Active: r.Active})
	}
	return out, nil
}

func (s *PostgresStore) ClassLevels(ctx context.Context) ([]ClassLevel, error) {
	rows, err := s.q.ListClassLevels(ctx)
	if err != nil {
		return nil, fmt.Errorf("list class levels: %w", err)
	}
	out := make([]ClassLevel, 0, len(rows))
	for _, r := range rows {
		out = append(out, ClassLevel{ID: r.ID, Name: r.Name, Level: r.LevelID, InternalCanonicalGrade: r.InternalCanonicalGrade})
	}
	return out, nil
}

func (s *PostgresStore) Subjects(ctx context.Context) ([]SubjectDetail, error) {
	rows, err := s.q.ListSubjects(ctx)
	if err != nil {
		return nil, fmt.Errorf("list subjects: %w", err)
	}
	topics, err := s.Topics(ctx, nil, nil)
	if err != nil {
		return nil, err
	}
	bySubject := map[int64][]TopicRef{}
	for _, t := range topics {
		bySubject[t.Subject] = append(bySubject[t.Subject], t)
	}
	out := make([]SubjectDetail, 0, len(rows))
	for _, r := range rows {
		out = append(out, SubjectDetail{ID: r.ID, Name: r.Name, Code: text(r.Code), Topics: nonNil(bySubject[r.ID])})
	}
	return out, nil
}

func (s *PostgresStore) Subject(ctx context.Context, id int64) (SubjectDetail, error) {
	r, err := s.q.GetSubject(ctx, id)
	if errors.Is(err, pgx.ErrNoRows) {
		return SubjectDetail{}, ErrNotFound
	}
	if err != nil {
		return SubjectDetail{}, fmt.Errorf("get subject: %w", err)
	}
	topics, err := s.Topics(ctx, &id, nil)
	if err != nil {
		return SubjectDetail{}, err
	}
	return SubjectDetail{ID: r.ID, Name: r.Name, Code: text(r.Code), Topics: topics}, nil
}

func (s *PostgresStore) Topics(ctx context.Context, subject, classLevel *int64) ([]TopicRef, error) {
	rows, err := s.q.ListTopics(ctx, dbgen.ListTopicsParams{SubjectID: opt(subject), ClassLevelID: opt(classLevel)})
	if err != nil {
		return nil, fmt.Errorf("list topics: %w", err)
	}
	out := make([]TopicRef, 0, len(rows))
	for _, r := range rows {
		out = append(out, TopicRef{ID: r.ID, Name: r.Name, Order: r.Order, ClassLevelName: r.ClassLevelName, Subject: r.SubjectID, ClassLevel: r.ClassLevelID})
	}
	return out, nil
}

func (s *PostgresStore) Topic(ctx context.Context, id int64) (TopicRef, error) {
	r, err := s.q.GetTopic(ctx, id)
	if errors.Is(err, pgx.ErrNoRows) {
		return TopicRef{}, ErrNotFound
	}
	if err != nil {
		return TopicRef{}, fmt.Errorf("get topic: %w", err)
	}
	return TopicRef{ID: r.ID, Name: r.Name, Order: r.Order, ClassLevelName: r.ClassLevelName, Subject: r.SubjectID, ClassLevel: r.ClassLevelID}, nil
}

func (s *PostgresStore) Competencies(ctx context.Context, topic *int64) ([]Competency, error) {
	rows, err := s.q.ListCompetencies(ctx, opt(topic))
	if err != nil {
		return nil, fmt.Errorf("list competencies: %w", err)
	}
	out := make([]Competency, 0, len(rows))
	for _, r := range rows {
		out = append(out, Competency{ID: r.ID, Description: r.Description, Code: text(r.Code), CurriculumVersion: r.CurriculumVersionID, Topic: r.TopicID})
	}
	return out, nil
}

func (s *PostgresStore) TreeRows(ctx context.Context) ([]TreeRow, error) {
	rows, err := s.q.TreeRows(ctx)
	if err != nil {
		return nil, fmt.Errorf("load tree: %w", err)
	}
	out := make([]TreeRow, 0, len(rows))
	for _, r := range rows {
		out = append(out, TreeRow{
			LevelID: r.LevelID, LevelName: r.LevelName, ClassID: r.ClassID, ClassName: r.ClassName,
			TopicID: r.TopicID.Int64, TopicName: r.TopicName.String, SubjectID: r.SubjectID.Int64, SubjectName: r.SubjectName.String,
		})
	}
	return out, nil
}

func text(t pgtype.Text) *string {
	if !t.Valid {
		return nil
	}
	return &t.String
}

func opt(v *int64) pgtype.Int8 {
	if v == nil {
		return pgtype.Int8{}
	}
	return pgtype.Int8{Int64: *v, Valid: true}
}

func nonNil(t []TopicRef) []TopicRef {
	if t == nil {
		return []TopicRef{}
	}
	return t
}
