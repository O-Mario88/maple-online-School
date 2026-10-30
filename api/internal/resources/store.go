package resources

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/O-Mario88/maple-online-School/api/internal/httpx"
	"github.com/O-Mario88/maple-online-School/api/internal/platform/dbgen"
	"github.com/O-Mario88/maple-online-School/api/internal/roles"
)

const (
	uniqueViolation     = "23505"
	foreignKeyViolation = "23503"
	mediaPrefix         = "/media/" // Django's MEDIA_URL; uploads are still stored by Django
)

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
	return v, nil
}

// ---- resources ----------------------------------------------------------------

func (s *PostgresStore) List(ctx context.Context, v Viewer, f Filter, page httpx.Page) ([]Resource, int64, error) {
	search := text(nil)
	if f.Search != nil {
		search = text(ptr("%" + likeEscape(*f.Search) + "%"))
	}
	count, err := s.q.CountVisibleResources(ctx, dbgen.CountVisibleResourcesParams{
		MemberSchools: v.Members, ViewerID: v.UserID, Category: text(f.Category),
		SubjectID: id(f.Subject), Visibility: text(f.Visibility), Search: search,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("count resources: %w", err)
	}
	rows, err := s.q.ListVisibleResources(ctx, dbgen.ListVisibleResourcesParams{
		MemberSchools: v.Members, ViewerID: v.UserID, Category: text(f.Category),
		SubjectID: id(f.Subject), Visibility: text(f.Visibility), Search: search,
		Sort: f.Sort, PageLimit: page.Limit, PageOffset: page.Offset,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("list resources: %w", err)
	}
	out := make([]Resource, 0, len(rows))
	for _, r := range rows {
		out = append(out, toResource(dbgen.GetVisibleResourceRow(r)))
	}
	return out, count, nil
}

func (s *PostgresStore) Get(ctx context.Context, v Viewer, resourceID int64) (Resource, error) {
	r, err := s.q.GetVisibleResource(ctx, dbgen.GetVisibleResourceParams{ID: resourceID, MemberSchools: v.Members, ViewerID: v.UserID})
	if errors.Is(err, pgx.ErrNoRows) {
		return Resource{}, ErrNotFound
	}
	if err != nil {
		return Resource{}, fmt.Errorf("get resource: %w", err)
	}
	return toResource(r), nil
}

func (s *PostgresStore) Create(ctx context.Context, uploader int64, d Draft) (int64, error) {
	price, err := numeric(d.Price)
	if err != nil {
		return 0, err
	}
	newID, err := s.q.CreateResource(ctx, dbgen.CreateResourceParams{
		OwnerType: d.OwnerType, Title: d.Title, ExternalUrl: text(d.URL), Visibility: d.Visibility,
		ClassLevelID: id(d.Level), OwnerInstitutionID: id(d.OwnerInstitution), SubjectID: id(d.Subject),
		TopicID: id(d.Topic), UploadedByID: uploader, Description: text(d.Description),
		Author: text(d.Author), Category: text(d.Category), Price: price,
	})
	return newID, writeErr(err, "create resource")
}

func (s *PostgresStore) Update(ctx context.Context, resourceID int64, d Draft) error {
	price, err := numeric(d.Price)
	if err != nil {
		return err
	}
	err = s.q.UpdateResource(ctx, dbgen.UpdateResourceParams{
		ID: resourceID, OwnerType: d.OwnerType, Title: d.Title, ExternalUrl: text(d.URL), Visibility: d.Visibility,
		ClassLevelID: id(d.Level), OwnerInstitutionID: id(d.OwnerInstitution), SubjectID: id(d.Subject),
		TopicID: id(d.Topic), Description: text(d.Description), Author: text(d.Author),
		Category: text(d.Category), Price: price,
	})
	return writeErr(err, "update resource")
}

// Delete removes a resource and what pointed at it, as Django's ORM did:
// class links, lesson links and engagement go; study tasks keep their row.
func (s *PostgresStore) Delete(ctx context.Context, resourceID int64) error {
	return pgx.BeginFunc(ctx, s.pool, func(tx pgx.Tx) error {
		q := s.q.WithTx(tx)
		steps := []struct {
			name string
			run  func(context.Context, int64) error
		}{
			{"unlink study tasks", func(ctx context.Context, rid int64) error { return q.UnlinkResourceStudyTasks(ctx, id(&rid)) }},
			{"delete lesson links", q.DeleteResourceLessonLinks},
			{"delete engagement", q.DeleteResourceEngagement},
			{"delete class links", q.DeleteResourceClassLinks},
			{"delete resource", q.DeleteResource},
		}
		for _, step := range steps {
			if err := step.run(ctx, resourceID); err != nil {
				return fmt.Errorf("%s: %w", step.name, err)
			}
		}
		return nil
	})
}

// ---- class links --------------------------------------------------------------

func (s *PostgresStore) ListLinks(ctx context.Context, v Viewer, f LinkFilter, page httpx.Page) ([]Link, int64, error) {
	count, err := s.q.CountVisibleClassLinks(ctx, dbgen.CountVisibleClassLinksParams{
		StaffSchools: v.Staff, LearnerIds: v.Learners, TargetClass: id(f.TargetClass), Resource: id(f.Resource),
	})
	if err != nil {
		return nil, 0, fmt.Errorf("count links: %w", err)
	}
	rows, err := s.q.ListVisibleClassLinks(ctx, dbgen.ListVisibleClassLinksParams{
		StaffSchools: v.Staff, LearnerIds: v.Learners, TargetClass: id(f.TargetClass), Resource: id(f.Resource),
		PageLimit: page.Limit, PageOffset: page.Offset,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("list links: %w", err)
	}
	out := make([]Link, 0, len(rows))
	for _, r := range rows {
		out = append(out, Link{ID: r.ID, AddedAt: r.AddedAt.Time, AddedBy: r.AddedByID, Resource: r.ResourceID,
			TargetClass: r.TargetClassID, ResourceTitle: r.ResourceTitle})
	}
	return out, count, nil
}

func (s *PostgresStore) ClassOwner(ctx context.Context, classID int64) (school, teacher int64, err error) {
	row, err := s.q.ClassOwner(ctx, classID)
	if errors.Is(err, pgx.ErrNoRows) {
		return 0, 0, ErrNotFound
	}
	if err != nil {
		return 0, 0, fmt.Errorf("load class: %w", err)
	}
	return row.InstitutionID, row.TeacherID, nil
}

func (s *PostgresStore) CreateLink(ctx context.Context, by int64, r Resource, classID int64) (Link, error) {
	row, err := s.q.CreateClassLink(ctx, dbgen.CreateClassLinkParams{AddedByID: by, ResourceID: r.ID, TargetClassID: classID})
	if errors.Is(err, pgx.ErrNoRows) {
		return Link{}, ErrDuplicate
	}
	if err != nil {
		return Link{}, fmt.Errorf("create link: %w", err)
	}
	return Link{ID: row.ID, AddedAt: row.AddedAt.Time, AddedBy: by, Resource: r.ID, TargetClass: classID, ResourceTitle: r.Title}, nil
}

func (s *PostgresStore) LinkOwner(ctx context.Context, linkID int64) (LinkOwner, error) {
	row, err := s.q.GetClassLink(ctx, linkID)
	if errors.Is(err, pgx.ErrNoRows) {
		return LinkOwner{}, ErrNotFound
	}
	if err != nil {
		return LinkOwner{}, fmt.Errorf("load link: %w", err)
	}
	return LinkOwner{AddedBy: row.AddedByID, School: row.InstitutionID, Teacher: row.TeacherID}, nil
}

func (s *PostgresStore) DeleteLink(ctx context.Context, linkID int64) error {
	if err := s.q.DeleteClassLink(ctx, linkID); err != nil {
		return fmt.Errorf("delete link: %w", err)
	}
	return nil
}

// ---- conversions --------------------------------------------------------------

func toResource(r dbgen.GetVisibleResourceRow) Resource {
	price := float(r.Price)
	out := Resource{
		ID: r.ID, Title: r.Title, Description: str(r.Description), Author: str(r.Author), AuthorName: r.AuthorName,
		Category: str(r.Category), Price: strconv.FormatFloat(price, 'f', 2, 64),
		Rating: strconv.FormatFloat(float(r.Rating), 'f', 2, 64), IsFeatured: r.IsFeatured,
		ExternalURL: str(r.ExternalUrl), Visibility: r.Visibility, Subject: optID(r.SubjectID),
		ClassLevel: optID(r.ClassLevelID), Topic: optID(r.TopicID), UploadedBy: r.UploadedByID,
		OwnerType: r.OwnerType, OwnerInstitution: optID(r.OwnerInstitutionID), CreatedAt: r.CreatedAt.Time,
		VimeoVideoID: str(r.VimeoVideoID), price: price,
	}
	if r.FilePath.Valid && r.FilePath.String != "" {
		out.FilePath = ptr(mediaPrefix + r.FilePath.String)
	}
	return out
}

func writeErr(err error, action string) error {
	if err == nil {
		return nil
	}
	var pgErr interface{ SQLState() string }
	if errors.As(err, &pgErr) && pgErr.SQLState() == foreignKeyViolation {
		return ErrBadRef
	}
	if errors.As(err, &pgErr) && pgErr.SQLState() == uniqueViolation {
		return ErrDuplicate
	}
	return fmt.Errorf("%s: %w", action, err)
}

// likeEscape makes user text match literally inside ILIKE.
func likeEscape(s string) string {
	return strings.NewReplacer(`\`, `\\`, `%`, `\%`, `_`, `\_`).Replace(s)
}

func numeric(f float64) (pgtype.Numeric, error) {
	var n pgtype.Numeric
	if err := n.Scan(strconv.FormatFloat(f, 'f', 2, 64)); err != nil {
		return n, fmt.Errorf("convert price: %w", err)
	}
	return n, nil
}

func float(n pgtype.Numeric) float64 {
	f, err := n.Float64Value()
	if err != nil || !f.Valid {
		return 0
	}
	return f.Float64
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

func str(t pgtype.Text) *string {
	if !t.Valid {
		return nil
	}
	return &t.String
}

func optID(v pgtype.Int8) *int64 {
	if !v.Valid {
		return nil
	}
	return &v.Int64
}

func ptr[T any](v T) *T { return &v }
