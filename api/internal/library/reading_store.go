package library

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/O-Mario88/maple-online-School/api/internal/platform/dbgen"
)

// Share is a request to put an item on a class's reading list.
type Share struct {
	Item     Item
	Class    int64
	Due      *time.Time
	Required bool
	Note     string
	By       int64
}

// ReadingRow is one item on a class's reading list, with completion.
type ReadingRow struct {
	Item        string     `json:"item"`
	Title       string     `json:"title"`
	ContentType string     `json:"content_type"`
	ExternalURL string     `json:"external_url"`
	FileURL     *string    `json:"file_url"`
	DueDate     *time.Time `json:"due_date"`
	Required    bool       `json:"required"`
	Assigned    int64      `json:"assigned"`
	Completed   int64      `json:"completed"`
}

// Assigned is reading assigned to one learner, with their progress.
type Assigned struct {
	ID                   string     `json:"id"`
	Student              int64      `json:"student"`
	Item                 string     `json:"item"`
	Title                string     `json:"title"`
	ContentType          string     `json:"content_type"`
	ExternalURL          string     `json:"external_url"`
	FileURL              *string    `json:"file_url"`
	Required             bool       `json:"required"`
	Note                 string     `json:"note"`
	DueDate              *time.Time `json:"due_date"`
	Class                *int64     `json:"class"`
	CompletionPercentage string     `json:"completion_percentage"`
	IsCompleted          bool       `json:"is_completed"`
}

func (s *PostgresStore) ClassOwner(ctx context.Context, classID int64) (school, teacher int64, err error) {
	row, err := s.q.LibraryClassOwner(ctx, classID)
	if errors.Is(err, pgx.ErrNoRows) {
		return 0, 0, ErrNotFound
	}
	if err != nil {
		return 0, 0, fmt.Errorf("load class: %w", err)
	}
	return row.InstitutionID, row.TeacherID, nil
}

// ShareWithClass adds the item to the class's reading list and assigns it to
// every student enrolled now. It returns how many students were assigned.
func (s *PostgresStore) ShareWithClass(ctx context.Context, sh Share) (int64, error) {
	itemID, err := parseID(sh.Item.ID)
	if err != nil {
		return 0, err
	}
	kind := "recommended"
	if sh.Required {
		kind = "required"
	}
	class := pgtype.Int8{Int64: sh.Class, Valid: true}
	var assigned int64
	err = pgx.BeginFunc(ctx, s.pool, func(tx pgx.Tx) error {
		q := s.q.WithTx(tx)
		if err := q.ShareItemWithClass(ctx, dbgen.ShareItemWithClassParams{ItemID: itemID, ClassID: class}); err != nil {
			return fmt.Errorf("share: %w", err)
		}
		if err := q.PromoteItemToClass(ctx, itemID); err != nil {
			return fmt.Errorf("share: %w", err)
		}
		due := pgtype.Timestamptz{}
		if sh.Due != nil {
			due = pgtype.Timestamptz{Time: *sh.Due, Valid: true}
		}
		assigned, err = q.AssignItemToClass(ctx, dbgen.AssignItemToClassParams{
			AssignmentType: kind, Note: sh.Note, DueDate: due, AssignedBy: pgtype.Int8{Int64: sh.By, Valid: true},
			ItemID: itemID, ClassID: class,
		})
		if err != nil {
			return fmt.Errorf("assign: %w", err)
		}
		return q.LogLibraryChange(ctx, dbgen.LogLibraryChangeParams{
			Action: "visibility_changed", Notes: fmt.Sprintf("shared with class %d", sh.Class),
			ContentItemID: itemID, PerformedByID: pgtype.Int8{Int64: sh.By, Valid: true},
		})
	})
	return assigned, err
}

// UnshareFromClass removes the item from the class's list and its students'
// assigned reading. Their progress is kept.
func (s *PostgresStore) UnshareFromClass(ctx context.Context, item Item, classID, by int64) error {
	itemID, err := parseID(item.ID)
	if err != nil {
		return err
	}
	class := pgtype.Int8{Int64: classID, Valid: true}
	return pgx.BeginFunc(ctx, s.pool, func(tx pgx.Tx) error {
		q := s.q.WithTx(tx)
		if err := q.UnshareItemFromClass(ctx, dbgen.UnshareItemFromClassParams{ItemID: itemID, ClassID: class}); err != nil {
			return fmt.Errorf("unshare: %w", err)
		}
		if err := q.DeactivateClassAssignments(ctx, dbgen.DeactivateClassAssignmentsParams{ItemID: itemID, ClassID: class}); err != nil {
			return fmt.Errorf("unassign: %w", err)
		}
		return q.LogLibraryChange(ctx, dbgen.LogLibraryChangeParams{
			Action: "visibility_changed", Notes: fmt.Sprintf("removed from class %d", classID),
			ContentItemID: itemID, PerformedByID: pgtype.Int8{Int64: by, Valid: true},
		})
	})
}

func (s *PostgresStore) ReadingList(ctx context.Context, classID int64) ([]ReadingRow, error) {
	rows, err := s.q.ClassReadingList(ctx, pgtype.Int8{Int64: classID, Valid: true})
	if err != nil {
		return nil, fmt.Errorf("reading list: %w", err)
	}
	out := make([]ReadingRow, 0, len(rows))
	for _, r := range rows {
		out = append(out, ReadingRow{
			Item: uuidString(r.ID), Title: r.Title, ContentType: r.ContentType, ExternalURL: r.ExternalUrl,
			FileURL: fileURL(r.File), DueDate: optTime(r.DueDate), Required: r.Required, Assigned: r.Assigned, Completed: r.Completed,
		})
	}
	return out, nil
}

func (s *PostgresStore) AssignedReading(ctx context.Context, learners []int64) ([]Assigned, error) {
	rows, err := s.q.AssignedReading(ctx, learners)
	if err != nil {
		return nil, fmt.Errorf("assigned reading: %w", err)
	}
	out := make([]Assigned, 0, len(rows))
	for _, r := range rows {
		out = append(out, Assigned{
			ID: uuidString(r.ID), Student: r.StudentID, Item: uuidString(r.ItemID), Title: r.Title, ContentType: r.ContentType,
			ExternalURL: r.ExternalUrl, FileURL: fileURL(r.File), Required: r.AssignmentType == "required", Note: r.Note,
			DueDate: optTime(r.DueDate), Class: optID(r.TargetClassID), CompletionPercentage: decimal(r.Completion),
			IsCompleted: r.IsCompleted,
		})
	}
	return out, nil
}
