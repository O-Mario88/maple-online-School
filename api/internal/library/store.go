package library

import (
	"context"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/O-Mario88/maple-online-School/api/internal/httpx"
	"github.com/O-Mario88/maple-online-School/api/internal/platform/dbgen"
	"github.com/O-Mario88/maple-online-School/api/internal/roles"
)

const (
	foreignKeyViolation = "23503"
	mediaPrefix         = "/media/" // uploads are still stored by Django
)

// ProgressInput is one progress report from a learner.
type ProgressInput struct {
	Item          pgtype.UUID
	Completion    float64
	Position      int32
	ActiveSeconds int32
	NewVisit      bool
}

// PostgresStore implements Store.
type PostgresStore struct {
	pool *pgxpool.Pool
	q    *dbgen.Queries
}

func NewPostgresStore(pool *pgxpool.Pool) *PostgresStore {
	return &PostgresStore{pool: pool, q: dbgen.New(pool)}
}

func (s *PostgresStore) Viewer(ctx context.Context, userID int64, role string) (Viewer, error) {
	v := Viewer{UserID: userID, Role: role, Learners: []int64{}}
	var err error
	if v.Members, err = s.q.MemberSchoolIDs(ctx, userID); err != nil {
		return v, fmt.Errorf("load schools: %w", err)
	}
	if v.Staff, err = s.q.StaffSchoolIDs(ctx, dbgen.StaffSchoolIDsParams{UserID: userID, StaffRoles: roles.Staff}); err != nil {
		return v, fmt.Errorf("load staff schools: %w", err)
	}
	if v.Leaders, err = s.q.StaffSchoolIDs(ctx, dbgen.StaffSchoolIDsParams{UserID: userID, StaffRoles: roles.Leaders}); err != nil {
		return v, fmt.Errorf("load led schools: %w", err)
	}
	switch role {
	case "student":
		v.Learners = []int64{userID}
	case "parent":
		kids, err := s.q.ApprovedChildren(ctx, userID)
		if err != nil {
			return v, fmt.Errorf("load children: %w", err)
		}
		for _, k := range kids {
			v.Learners = append(v.Learners, k.UserID)
		}
	}
	v.Classes, err = s.q.ViewerClassIDs(ctx, dbgen.ViewerClassIDsParams{ViewerID: userID, LeaderSchools: v.Leaders, LearnerIds: v.Learners})
	if err != nil {
		return v, fmt.Errorf("load classes: %w", err)
	}
	return v, nil
}

// ---- items --------------------------------------------------------------------

func (s *PostgresStore) List(ctx context.Context, v Viewer, f Filter, page httpx.Page) ([]Item, int64, error) {
	search := pgtype.Text{}
	if f.Search != nil {
		search = pgtype.Text{String: "%" + likeEscape(*f.Search) + "%", Valid: true}
	}
	count, err := s.q.CountLibraryItems(ctx, dbgen.CountLibraryItemsParams{
		ViewerID: v.UserID, LeaderSchools: v.Leaders, IsAdmin: v.isAdmin(), MemberSchools: v.Members, ClassIds: v.Classes,
		Search: search, ContentType: text(f.ContentType), SubjectID: id(f.Subject), TopicID: id(f.Topic),
		ClassLevelID: id(f.ClassLevel), Status: text(f.Status), MineOnly: f.MineOnly,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("count items: %w", err)
	}
	rows, err := s.q.ListLibraryItems(ctx, dbgen.ListLibraryItemsParams{
		ViewerID: v.UserID, LeaderSchools: v.Leaders, IsAdmin: v.isAdmin(), MemberSchools: v.Members, ClassIds: v.Classes,
		Search: search, ContentType: text(f.ContentType), SubjectID: id(f.Subject), TopicID: id(f.Topic),
		ClassLevelID: id(f.ClassLevel), Status: text(f.Status), MineOnly: f.MineOnly,
		PageLimit: page.Limit, PageOffset: page.Offset,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("list items: %w", err)
	}
	out := make([]Item, 0, len(rows))
	for _, r := range rows {
		out = append(out, toItem(dbgen.GetLibraryItemRow(r)))
	}
	return out, count, nil
}

func (s *PostgresStore) Get(ctx context.Context, v Viewer, itemID pgtype.UUID) (Item, error) {
	r, err := s.q.GetLibraryItem(ctx, dbgen.GetLibraryItemParams{
		ID: itemID, ViewerID: v.UserID, LeaderSchools: v.Leaders, IsAdmin: v.isAdmin(), MemberSchools: v.Members, ClassIds: v.Classes,
	})
	if errors.Is(err, pgx.ErrNoRows) {
		return Item{}, ErrNotFound
	}
	if err != nil {
		return Item{}, fmt.Errorf("get item: %w", err)
	}
	return toItem(r), nil
}

func (s *PostgresStore) Create(ctx context.Context, by int64, d Draft) (pgtype.UUID, error) {
	var newID pgtype.UUID
	err := pgx.BeginFunc(ctx, s.pool, func(tx pgx.Tx) error {
		q := s.q.WithTx(tx)
		var err error
		newID, err = q.CreateLibraryItem(ctx, dbgen.CreateLibraryItemParams{
			Title: d.Title, Description: d.Description, ContentType: d.ContentType, OwnerType: d.OwnerType,
			VisibilityScope: d.Scope, PublicationStatus: d.Status, ModerationStatus: d.Moderation,
			ExternalUrl: d.ExternalURL, Language: d.Language, ClassLevelID: id(d.ClassLevel),
			OwnerInstitutionID: id(d.OwnerInstitution), SubjectID: id(d.Subject), TopicID: id(d.Topic), UploadedByID: by,
		})
		if err != nil {
			return writeErr(err, "create item")
		}
		return logChange(ctx, q, newID, by, "created", nil, d, "")
	})
	return newID, err
}

// Update saves d over before and records what changed.
func (s *PostgresStore) Update(ctx context.Context, by int64, before Item, d Draft, action, notes string) error {
	itemID, err := parseID(before.ID)
	if err != nil {
		return err
	}
	return pgx.BeginFunc(ctx, s.pool, func(tx pgx.Tx) error {
		q := s.q.WithTx(tx)
		err := q.UpdateLibraryItem(ctx, dbgen.UpdateLibraryItemParams{
			ID: itemID, Title: d.Title, Description: d.Description, ContentType: d.ContentType, OwnerType: d.OwnerType,
			VisibilityScope: d.Scope, PublicationStatus: d.Status, ModerationStatus: d.Moderation,
			RejectionReason: d.RejectionReason, ExternalUrl: d.ExternalURL, Language: d.Language,
			ClassLevelID: id(d.ClassLevel), OwnerInstitutionID: id(d.OwnerInstitution), SubjectID: id(d.Subject), TopicID: id(d.Topic),
		})
		if err != nil {
			return writeErr(err, "update item")
		}
		old := draftOf(before)
		return logChange(ctx, q, itemID, by, action, &old, d, notes)
	})
}

func (s *PostgresStore) Archive(ctx context.Context, by int64, item Item) error {
	itemID, err := parseID(item.ID)
	if err != nil {
		return err
	}
	return pgx.BeginFunc(ctx, s.pool, func(tx pgx.Tx) error {
		q := s.q.WithTx(tx)
		if err := q.ArchiveLibraryItem(ctx, itemID); err != nil {
			return fmt.Errorf("archive item: %w", err)
		}
		return q.LogLibraryChange(ctx, dbgen.LogLibraryChangeParams{
			Action: "archived", Notes: "", ContentItemID: itemID, PerformedByID: pgtype.Int8{Int64: by, Valid: true},
		})
	})
}

func logChange(ctx context.Context, q *dbgen.Queries, itemID pgtype.UUID, by int64, action string, before *Draft, after Draft, notes string) error {
	newValue, err := json.Marshal(after)
	if err != nil {
		return fmt.Errorf("encode change: %w", err)
	}
	var oldValue []byte
	if before != nil {
		if oldValue, err = json.Marshal(before); err != nil {
			return fmt.Errorf("encode change: %w", err)
		}
	}
	err = q.LogLibraryChange(ctx, dbgen.LogLibraryChangeParams{
		Action: action, OldValue: oldValue, NewValue: newValue, Notes: notes,
		ContentItemID: itemID, PerformedByID: pgtype.Int8{Int64: by, Valid: true},
	})
	if err != nil {
		return fmt.Errorf("record change: %w", err)
	}
	return nil
}

// ---- progress -------------------------------------------------------------------

func (s *PostgresStore) SaveProgress(ctx context.Context, studentID int64, p ProgressInput) (Progress, error) {
	completion, err := numeric(p.Completion)
	if err != nil {
		return Progress{}, err
	}
	r, err := s.q.SaveProgress(ctx, dbgen.SaveProgressParams{
		ActiveSeconds: p.ActiveSeconds, Completion: completion, Position: p.Position,
		ItemID: p.Item, StudentID: studentID, NewVisit: p.NewVisit,
	})
	if err != nil {
		return Progress{}, fmt.Errorf("save progress: %w", err)
	}
	return Progress{
		ViewCount: r.ViewCount, ActiveTimeSeconds: r.ActiveTimeSeconds, CompletionPercentage: decimal(r.CompletionPercentage),
		LastPosition: r.LastPosition, IsCompleted: r.IsCompleted, Status: r.Status, FirstAccessed: optTime(r.FirstAccessed),
		LastAccessed: optTime(r.LastAccessed), CompletedAt: optTime(r.CompletedAt),
	}, nil
}

func (s *PostgresStore) Continue(ctx context.Context, studentID int64) ([]Continue, error) {
	rows, err := s.q.ContinueLearning(ctx, studentID)
	if err != nil {
		return nil, fmt.Errorf("continue list: %w", err)
	}
	out := make([]Continue, 0, len(rows))
	for _, r := range rows {
		out = append(out, Continue{
			Item: uuidString(r.ContentItemID), Title: r.Title, ContentType: r.ContentType, ExternalURL: r.ExternalUrl,
			FileURL: fileURL(r.File), DurationSeconds: optInt(r.DurationSeconds), CompletionPercentage: decimal(r.CompletionPercentage),
			LastPosition: r.LastPosition, LastAccessed: optTime(r.LastAccessed),
		})
	}
	return out, nil
}

// ---- conversions ------------------------------------------------------------------

func toItem(r dbgen.GetLibraryItemRow) Item {
	return Item{
		ID: uuidString(r.ID), Title: r.Title, Description: r.Description, ContentType: r.ContentType, OwnerType: r.OwnerType,
		VisibilityScope: r.VisibilityScope, PublicationStatus: r.PublicationStatus, ModerationStatus: r.ModerationStatus,
		RejectionReason: r.RejectionReason, FileURL: fileURL(r.File), ExternalURL: r.ExternalUrl,
		DurationSeconds: optInt(r.DurationSeconds), Language: r.Language, IsFeatured: r.IsFeatured,
		CreatedAt: r.CreatedAt.Time, UpdatedAt: r.UpdatedAt.Time, PublishedAt: optTime(r.PublishedAt),
		ClassLevel: optID(r.ClassLevelID), OwnerInstitution: optID(r.OwnerInstitutionID), Subject: optID(r.SubjectID),
		Topic: optID(r.TopicID), UploadedBy: r.UploadedByID, UploaderName: r.UploaderName,
		SubjectName: r.SubjectName, TopicName: r.TopicName,
	}
}

// parseID reads a UUID from the URL or a request body.
func parseID(s string) (pgtype.UUID, error) {
	var u pgtype.UUID
	if err := u.Scan(strings.TrimSpace(s)); err != nil || !u.Valid {
		return u, ErrNotFound
	}
	return u, nil
}

func uuidString(u pgtype.UUID) string {
	if !u.Valid {
		return ""
	}
	h := hex.EncodeToString(u.Bytes[:])
	return h[0:8] + "-" + h[8:12] + "-" + h[12:16] + "-" + h[16:20] + "-" + h[20:32]
}

func writeErr(err error, action string) error {
	var pgErr interface{ SQLState() string }
	if errors.As(err, &pgErr) && pgErr.SQLState() == foreignKeyViolation {
		return ErrBadRef
	}
	return fmt.Errorf("%s: %w", action, err)
}

func likeEscape(s string) string {
	return strings.NewReplacer(`\`, `\\`, `%`, `\%`, `_`, `\_`).Replace(s)
}

func numeric(f float64) (pgtype.Numeric, error) {
	var n pgtype.Numeric
	if err := n.Scan(strconv.FormatFloat(f, 'f', 2, 64)); err != nil {
		return n, fmt.Errorf("convert number: %w", err)
	}
	return n, nil
}

func decimal(n pgtype.Numeric) string {
	f, err := n.Float64Value()
	if err != nil || !f.Valid {
		return "0.00"
	}
	return strconv.FormatFloat(f.Float64, 'f', 2, 64)
}

func fileURL(t pgtype.Text) *string {
	if !t.Valid || t.String == "" {
		return nil
	}
	u := mediaPrefix + t.String
	return &u
}

func text(s *string) pgtype.Text {
	if s == nil {
		return pgtype.Text{}
	}
	return pgtype.Text{String: *s, Valid: true}
}

func id(v *int64) pgtype.Int8 {
	if v == nil {
		return pgtype.Int8{}
	}
	return pgtype.Int8{Int64: *v, Valid: true}
}

func optID(v pgtype.Int8) *int64 {
	if !v.Valid {
		return nil
	}
	return &v.Int64
}

func optInt(v pgtype.Int4) *int32 {
	if !v.Valid {
		return nil
	}
	return &v.Int32
}

func optTime(t pgtype.Timestamptz) *time.Time {
	if !t.Valid {
		return nil
	}
	return &t.Time
}
