package signup

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/O-Mario88/maple-online-School/api/internal/platform/dbgen"
)

var (
	ErrNotFound   = errors.New("not found")
	ErrEmailTaken = errors.New("email already registered")
)

// NewAccount is a person signing up.
type NewAccount struct {
	Email, FullName, CountryCode, Role, PasswordHash string
}

// ParentInput is the parent named during student onboarding.
type ParentInput struct {
	Email, FullName, Relationship string
}

// Onboarded is what student onboarding created.
type Onboarded struct {
	Student   Account
	NewParent *Account // set when a parent account was created
}

// PostgresStore implements Store.
type PostgresStore struct {
	pool *pgxpool.Pool
	q    *dbgen.Queries
}

func NewPostgresStore(pool *pgxpool.Pool) *PostgresStore {
	return &PostgresStore{pool: pool, q: dbgen.New(pool)}
}

// CreateAccount adds a person and the profile for their role.
func (s *PostgresStore) CreateAccount(ctx context.Context, a NewAccount) (Account, error) {
	var out Account
	err := pgx.BeginFunc(ctx, s.pool, func(tx pgx.Tx) error {
		var err error
		out, _, err = createIn(ctx, s.q.WithTx(tx), a)
		return err
	})
	return out, err
}

// createIn adds the account and its profile; it returns the student profile
// id for students.
func createIn(ctx context.Context, q *dbgen.Queries, a NewAccount) (Account, int64, error) {
	taken, err := q.EmailTaken(ctx, a.Email)
	if err != nil {
		return Account{}, 0, fmt.Errorf("check email: %w", err)
	}
	if taken {
		return Account{}, 0, ErrEmailTaken
	}
	id, err := q.CreateAccount(ctx, dbgen.CreateAccountParams{
		Password: a.PasswordHash, Email: a.Email, FullName: a.FullName, CountryCode: a.CountryCode, Role: a.Role,
	})
	if err != nil {
		return Account{}, 0, fmt.Errorf("create account: %w", err)
	}
	var profile int64
	switch a.Role {
	case "student":
		profile, err = q.CreateStudentProfile(ctx, id)
	case "teacher":
		err = q.CreateTeacherProfile(ctx, id)
	case "institution":
		err = q.CreateInstitutionAdminProfile(ctx, id)
	case "parent":
		profile, err = q.CreateParentProfile(ctx, id)
	}
	if err != nil {
		return Account{}, 0, fmt.Errorf("create %s profile: %w", a.Role, err)
	}
	acct := Account{ID: id, Email: a.Email, FullName: a.FullName, Password: a.PasswordHash, IsActive: true}
	return acct, profile, nil
}

// OnboardStudent adds a student and links a parent. A parent created here is
// linked at once; an existing parent account has to approve the link.
func (s *PostgresStore) OnboardStudent(ctx context.Context, student NewAccount, parent ParentInput) (Onboarded, error) {
	var out Onboarded
	err := pgx.BeginFunc(ctx, s.pool, func(tx pgx.Tx) error {
		q := s.q.WithTx(tx)
		acct, studentProfile, err := createIn(ctx, q, student)
		if err != nil {
			return err
		}
		out.Student = acct
		parentProfile, consent, err := s.parentFor(ctx, q, parent, student.CountryCode, &out)
		if err != nil {
			return err
		}
		return q.LinkParent(ctx, dbgen.LinkParentParams{
			RelationshipType: parent.Relationship, ConsentStatus: consent,
			ParentProfileID: parentProfile, StudentProfileID: studentProfile,
		})
	})
	return out, err
}

func (s *PostgresStore) parentFor(ctx context.Context, q *dbgen.Queries, p ParentInput, country string, out *Onboarded) (int64, string, error) {
	existing, err := q.ParentProfileByEmail(ctx, p.Email)
	if err == nil {
		return existing.ID, "pending", nil
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		return 0, "", fmt.Errorf("find parent: %w", err)
	}
	// '!' is Django's unusable password: the parent sets one from the emailed link.
	acct, profile, err := createIn(ctx, q, NewAccount{Email: p.Email, FullName: p.FullName, CountryCode: country, Role: "parent", PasswordHash: "!"})
	if err != nil {
		return 0, "", err
	}
	out.NewParent = &acct
	return profile, "approved", nil
}

func (s *PostgresStore) Account(ctx context.Context, id int64) (Account, error) {
	r, err := s.q.AccountForLink(ctx, id)
	if errors.Is(err, pgx.ErrNoRows) {
		return Account{}, ErrNotFound
	}
	if err != nil {
		return Account{}, fmt.Errorf("load account: %w", err)
	}
	return Account(r), nil
}

func (s *PostgresStore) AccountByEmail(ctx context.Context, email string) (Account, error) {
	r, err := s.q.AccountByEmailForLink(ctx, email)
	if errors.Is(err, pgx.ErrNoRows) {
		return Account{}, ErrNotFound
	}
	if err != nil {
		return Account{}, fmt.Errorf("load account: %w", err)
	}
	return Account(r), nil
}

func (s *PostgresStore) MarkVerified(ctx context.Context, id int64) error {
	if err := s.q.MarkEmailVerified(ctx, id); err != nil {
		return fmt.Errorf("mark verified: %w", err)
	}
	return nil
}

func (s *PostgresStore) SetPassword(ctx context.Context, id int64, hash string) error {
	if err := s.q.SetAccountPassword(ctx, dbgen.SetAccountPasswordParams{ID: id, Password: hash}); err != nil {
		return fmt.Errorf("set password: %w", err)
	}
	return nil
}
