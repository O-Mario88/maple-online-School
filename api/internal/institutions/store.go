// Package institutions serves schools and their memberships (staff, students,
// parents), including inviting people by email.
package institutions

import (
	"context"
	"errors"
	"fmt"
	"slices"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/O-Mario88/maple-online-School/api/internal/platform/dbgen"
	"github.com/O-Mario88/maple-online-School/api/internal/roles"
)

var (
	ErrNotFound   = errors.New("not found")
	ErrLastLeader = errors.New("a school needs at least one active leader")
)

type School struct {
	ID               int64     `json:"id"`
	Name             string    `json:"name"`
	CountryCode      string    `json:"country_code"`
	SchoolLevel      string    `json:"school_level"`
	CurriculumTrack  string    `json:"curriculum_track"`
	PrimaryColor     string    `json:"primary_color"`
	SecondaryColor   string    `json:"secondary_color"`
	SubscriptionPlan string    `json:"subscription_plan"`
	IsActive         bool      `json:"is_active"`
	CreatedAt        time.Time `json:"created_at"`
}

type Membership struct {
	ID              int64     `json:"id"`
	User            int64     `json:"user"`
	FullName        string    `json:"full_name"`
	Email           string    `json:"email"`
	Institution     int64     `json:"institution"`
	InstitutionName string    `json:"institution_name"`
	Role            string    `json:"role"`
	Status          string    `json:"status"`
	JoinedAt        time.Time `json:"joined_at"`
}

// MembershipRef is enough of a membership to decide who may change it.
type MembershipRef struct {
	ID, User, Institution int64
	Role, Status          string
}

type PostgresStore struct {
	pool *pgxpool.Pool
	q    *dbgen.Queries
}

func NewPostgresStore(pool *pgxpool.Pool) *PostgresStore {
	return &PostgresStore{pool: pool, q: dbgen.New(pool)}
}

func (s *PostgresStore) LeaderSchools(ctx context.Context, userID int64) ([]int64, error) {
	ids, err := s.q.StaffSchoolIDs(ctx, dbgen.StaffSchoolIDsParams{UserID: userID, StaffRoles: roles.Leaders})
	if err != nil {
		return nil, fmt.Errorf("load schools: %w", err)
	}
	return ids, nil
}

func (s *PostgresStore) MySchools(ctx context.Context, userID int64) ([]School, error) {
	rows, err := s.q.MySchools(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("list schools: %w", err)
	}
	out := make([]School, 0, len(rows))
	for _, r := range rows {
		out = append(out, School{
			ID: r.ID, Name: r.Name, CountryCode: r.CountryCode, SchoolLevel: r.SchoolLevel, CurriculumTrack: r.CurriculumTrack,
			PrimaryColor: r.PrimaryColor, SecondaryColor: r.SecondaryColor, SubscriptionPlan: r.SubscriptionPlan,
			IsActive: r.IsActive, CreatedAt: r.CreatedAt.Time,
		})
	}
	return out, nil
}

// CreateSchool adds a school with its founder as the active head teacher.
func (s *PostgresStore) CreateSchool(ctx context.Context, founder int64, name, country, level string) (int64, error) {
	var id int64
	err := pgx.BeginFunc(ctx, s.pool, func(tx pgx.Tx) error {
		q := s.q.WithTx(tx)
		var err error
		id, err = q.CreateSchool(ctx, dbgen.CreateSchoolParams{Name: name, CountryCode: country, CurriculumTrack: curriculumFor(country), SchoolLevel: level})
		if err != nil {
			return fmt.Errorf("create school: %w", err)
		}
		if _, err := q.AddMembership(ctx, dbgen.AddMembershipParams{UserID: founder, InstitutionID: id, Role: "headteacher", Status: "active"}); err != nil {
			return fmt.Errorf("add founder: %w", err)
		}
		return nil
	})
	return id, err
}

func (s *PostgresStore) UpdateSchool(ctx context.Context, id int64, name, color *string) error {
	if err := s.q.UpdateSchool(ctx, dbgen.UpdateSchoolParams{ID: id, Name: text(name), PrimaryColor: text(color)}); err != nil {
		return fmt.Errorf("update school: %w", err)
	}
	return nil
}

// Invite gives each email a pending membership, creating an account (with no
// password yet) for anyone new. It returns how many invitations were made.
func (s *PostgresStore) Invite(ctx context.Context, school int64, emails []string, role string) (int, error) {
	count := 0
	err := pgx.BeginFunc(ctx, s.pool, func(tx pgx.Tx) error {
		q := s.q.WithTx(tx)
		country, err := q.SchoolCountry(ctx, school)
		if err != nil {
			return fmt.Errorf("load school: %w", err)
		}
		for _, email := range emails {
			user, err := q.UserIDByEmail(ctx, email)
			if errors.Is(err, pgx.ErrNoRows) {
				user, err = q.CreateInvitedUser(ctx, dbgen.CreateInvitedUserParams{
					Email: email, FullName: strings.SplitN(email, "@", 2)[0], CountryCode: country, Role: platformRole(role),
				})
			}
			if err != nil {
				return fmt.Errorf("find or create invitee: %w", err)
			}
			if _, err := q.AddMembership(ctx, dbgen.AddMembershipParams{UserID: user, InstitutionID: school, Role: role, Status: "pending"}); err != nil {
				return fmt.Errorf("invite: %w", err)
			}
			count++
		}
		return nil
	})
	return count, err
}

func (s *PostgresStore) Memberships(ctx context.Context, leader []int64, viewer int64, school *int64) ([]Membership, error) {
	params := dbgen.ListMembershipsParams{LeaderSchools: leader, ViewerID: viewer}
	if school != nil {
		params.SchoolID = pgtype.Int8{Int64: *school, Valid: true}
	}
	rows, err := s.q.ListMemberships(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("list memberships: %w", err)
	}
	out := make([]Membership, 0, len(rows))
	for _, r := range rows {
		out = append(out, Membership{
			ID: r.ID, User: r.UserID, FullName: r.FullName, Email: r.Email, Institution: r.InstitutionID,
			InstitutionName: r.InstitutionName, Role: r.Role, Status: r.Status, JoinedAt: r.JoinedAt.Time,
		})
	}
	return out, nil
}

func (s *PostgresStore) Membership(ctx context.Context, id int64) (MembershipRef, error) {
	r, err := s.q.GetMembership(ctx, id)
	if errors.Is(err, pgx.ErrNoRows) {
		return MembershipRef{}, ErrNotFound
	}
	if err != nil {
		return MembershipRef{}, fmt.Errorf("load membership: %w", err)
	}
	return MembershipRef{ID: r.ID, User: r.UserID, Institution: r.InstitutionID, Role: r.Role, Status: r.Status}, nil
}

// UpdateMembership changes the role or status, refusing to leave a school
// without an active leader.
func (s *PostgresStore) UpdateMembership(ctx context.Context, m MembershipRef, role, status *string) error {
	return pgx.BeginFunc(ctx, s.pool, func(tx pgx.Tx) error {
		q := s.q.WithTx(tx)
		if err := q.LockStudentAssessment(ctx, fmt.Sprintf("memberships:%d", m.Institution)); err != nil {
			return fmt.Errorf("lock school: %w", err)
		}
		wasLeader := m.Status == "active" && slices.Contains(roles.Leaders, m.Role)
		staysLeader := (status == nil || *status == "active") && slices.Contains(roles.Leaders, deref(role, m.Role))
		if wasLeader && !staysLeader {
			n, err := q.CountActiveLeaders(ctx, dbgen.CountActiveLeadersParams{InstitutionID: m.Institution, LeaderRoles: roles.Leaders})
			if err != nil {
				return fmt.Errorf("count leaders: %w", err)
			}
			if n <= 1 {
				return ErrLastLeader
			}
		}
		if err := q.UpdateMembership(ctx, dbgen.UpdateMembershipParams{ID: m.ID, Role: text(role), Status: text(status)}); err != nil {
			return fmt.Errorf("update membership: %w", err)
		}
		return nil
	})
}

// platformRole is the account role for someone invited with a school role.
func platformRole(schoolRole string) string {
	switch {
	case schoolRole == "student" || schoolRole == "parent":
		return schoolRole
	case slices.Contains(roles.Leaders, schoolRole):
		return "institution"
	default:
		return "teacher"
	}
}

func curriculumFor(country string) string {
	switch country {
	case "KE":
		return "kenya"
	case "RW":
		return "rwanda"
	default:
		return "uganda"
	}
}

func text(s *string) pgtype.Text {
	if s == nil {
		return pgtype.Text{}
	}
	return pgtype.Text{String: *s, Valid: true}
}

func deref(s *string, fallback string) string {
	if s == nil {
		return fallback
	}
	return *s
}
