// Package timetable serves school terms, rooms and the weekly timetable.
package timetable

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/O-Mario88/maple-online-School/api/internal/platform/dbgen"
	"github.com/O-Mario88/maple-online-School/api/internal/roles"
)

var (
	ErrNotFound   = errors.New("not found")
	ErrBadTerm    = errors.New("term not in this school")
	ErrBadRoom    = errors.New("room not in this school")
	ErrBadTeacher = errors.New("teacher not at this school")
	ErrDuplicate  = errors.New("name already used")
)

type Term struct {
	ID          int64  `json:"id"`
	Institution int64  `json:"institution"`
	Name        string `json:"name"`
	StartDate   string `json:"start_date"`
	EndDate     string `json:"end_date"`
	IsActive    bool   `json:"is_active"`
}

type Room struct {
	ID          int64  `json:"id"`
	Institution int64  `json:"institution"`
	Name        string `json:"name"`
	Capacity    int32  `json:"capacity"`
}

type Slot struct {
	ID          int64  `json:"id"`
	Institution int64  `json:"institution"`
	Term        int64  `json:"term"`
	Class       int64  `json:"assigned_class"`
	ClassTitle  string `json:"class_title"`
	DayOfWeek   int32  `json:"day_of_week"`
	StartTime   string `json:"start_time"`
	EndTime     string `json:"end_time"`
	Room        *int64 `json:"room"`
	RoomName    string `json:"room_name"`
	Teacher     *int64 `json:"teacher"`
	TeacherName string `json:"teacher_name"`
	IsDraft     bool   `json:"is_draft"`
}

// Clash describes an existing slot a new one would overlap.
type Clash struct {
	Slot       int64  `json:"slot"`
	ClassTitle string `json:"class_title"`
	Reason     string `json:"reason"`
}

// NewSlot is a slot to add; times are minutes since midnight.
type NewSlot struct {
	School, Term, Class int64
	Day                 int32
	Start, End          int
	Room, Teacher       *int64
}

// SlotFilter narrows a timetable listing.
type SlotFilter struct {
	Term, Class *int64
	Day         *int32
}

// PostgresStore implements Store.
type PostgresStore struct {
	pool *pgxpool.Pool
	q    *dbgen.Queries
}

func NewPostgresStore(pool *pgxpool.Pool) *PostgresStore {
	return &PostgresStore{pool: pool, q: dbgen.New(pool)}
}

func (s *PostgresStore) SchoolsWithRoles(ctx context.Context, userID int64, rs []string) ([]int64, error) {
	ids, err := s.q.StaffSchoolIDs(ctx, dbgen.StaffSchoolIDsParams{UserID: userID, StaffRoles: rs})
	if err != nil {
		return nil, fmt.Errorf("load schools: %w", err)
	}
	return ids, nil
}

// ClassSchool returns the class's school and teacher.
func (s *PostgresStore) ClassSchool(ctx context.Context, classID int64) (int64, int64, error) {
	row, err := s.q.ClassBasics(ctx, classID)
	if errors.Is(err, pgx.ErrNoRows) {
		return 0, 0, ErrNotFound
	}
	if err != nil {
		return 0, 0, fmt.Errorf("load class: %w", err)
	}
	return row.InstitutionID, row.TeacherID, nil
}

func (s *PostgresStore) Terms(ctx context.Context, schools []int64) ([]Term, error) {
	rows, err := s.q.ListTerms(ctx, schools)
	if err != nil {
		return nil, fmt.Errorf("list terms: %w", err)
	}
	out := make([]Term, 0, len(rows))
	for _, r := range rows {
		out = append(out, Term{ID: r.ID, Institution: r.InstitutionID, Name: r.Name, StartDate: day(r.StartDate), EndDate: day(r.EndDate), IsActive: r.IsActive})
	}
	return out, nil
}

// CreateTerm adds a term; making it active turns the school's other terms off.
func (s *PostgresStore) CreateTerm(ctx context.Context, school int64, name string, start, end time.Time, active bool) (Term, error) {
	var out Term
	err := pgx.BeginFunc(ctx, s.pool, func(tx pgx.Tx) error {
		q := s.q.WithTx(tx)
		row, err := q.CreateTerm(ctx, dbgen.CreateTermParams{
			InstitutionID: school, Name: name, StartDate: pgtype.Date{Time: start, Valid: true},
			EndDate: pgtype.Date{Time: end, Valid: true}, IsActive: active,
		})
		if err != nil {
			return duplicate(err, "create term")
		}
		if active {
			if err := q.DeactivateOtherTerms(ctx, dbgen.DeactivateOtherTermsParams{InstitutionID: school, ID: row.ID}); err != nil {
				return fmt.Errorf("deactivate terms: %w", err)
			}
		}
		out = Term{ID: row.ID, Institution: row.InstitutionID, Name: row.Name, StartDate: day(row.StartDate), EndDate: day(row.EndDate), IsActive: row.IsActive}
		return nil
	})
	return out, err
}

func (s *PostgresStore) Rooms(ctx context.Context, schools []int64) ([]Room, error) {
	rows, err := s.q.ListRooms(ctx, schools)
	if err != nil {
		return nil, fmt.Errorf("list rooms: %w", err)
	}
	out := make([]Room, 0, len(rows))
	for _, r := range rows {
		out = append(out, Room{ID: r.ID, Institution: r.InstitutionID, Name: r.Name, Capacity: r.Capacity})
	}
	return out, nil
}

func (s *PostgresStore) CreateRoom(ctx context.Context, school int64, name string, capacity int32) (Room, error) {
	row, err := s.q.CreateRoom(ctx, dbgen.CreateRoomParams{InstitutionID: school, Name: name, Capacity: capacity})
	if err != nil {
		return Room{}, duplicate(err, "create room")
	}
	return Room{ID: row.ID, Institution: row.InstitutionID, Name: row.Name, Capacity: row.Capacity}, nil
}

func (s *PostgresStore) Slots(ctx context.Context, leader []int64, viewer int64, learners []int64, f SlotFilter) ([]Slot, error) {
	params := dbgen.ListSlotsParams{
		LeaderSchools: leader, ViewerID: pgtype.Int8{Int64: viewer, Valid: true}, LearnerIds: learners,
		TermID: opt(f.Term), ClassID: opt(f.Class),
	}
	if f.Day != nil {
		params.Day = pgtype.Int4{Int32: *f.Day, Valid: true}
	}
	rows, err := s.q.ListSlots(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("list slots: %w", err)
	}
	out := make([]Slot, 0, len(rows))
	for _, r := range rows {
		out = append(out, Slot{
			ID: r.ID, Institution: r.InstitutionID, Term: r.TermID, Class: r.AssignedClassID, ClassTitle: r.ClassTitle,
			DayOfWeek: r.DayOfWeek, StartTime: clock(r.StartTime), EndTime: clock(r.EndTime), Room: optID(r.RoomID),
			RoomName: r.RoomName, Teacher: optID(r.TeacherID), TeacherName: r.TeacherName, IsDraft: r.IsDraft,
		})
	}
	return out, nil
}

// AddSlot checks the term, room and teacher belong to the school and that
// nothing clashes, then adds the slot. Clashes are returned, not errors.
func (s *PostgresStore) AddSlot(ctx context.Context, in NewSlot) (int64, []Clash, error) {
	var (
		id      int64
		clashes []Clash
	)
	err := pgx.BeginFunc(ctx, s.pool, func(tx pgx.Tx) error {
		q := s.q.WithTx(tx)
		// One change per school at a time, so two leaders can't book the same room at once.
		if err := q.LockStudentAssessment(ctx, fmt.Sprintf("timetable:%d", in.School)); err != nil {
			return fmt.Errorf("lock timetable: %w", err)
		}
		if ok, err := q.TermInSchool(ctx, dbgen.TermInSchoolParams{ID: in.Term, InstitutionID: in.School}); err != nil || !ok {
			return errOr(err, ErrBadTerm)
		}
		if in.Room != nil {
			if ok, err := q.RoomInSchool(ctx, dbgen.RoomInSchoolParams{ID: *in.Room, InstitutionID: in.School}); err != nil || !ok {
				return errOr(err, ErrBadRoom)
			}
		}
		if in.Teacher != nil {
			ok, err := q.IsActiveMember(ctx, dbgen.IsActiveMemberParams{UserID: *in.Teacher, InstitutionID: in.School, MemberRoles: roles.Staff})
			if err != nil || !ok {
				return errOr(err, ErrBadTeacher)
			}
		}
		start, end := minutes(in.Start), minutes(in.End)
		rows, err := q.SlotClashes(ctx, dbgen.SlotClashesParams{
			ClassID: in.Class, TeacherID: opt(in.Teacher), RoomID: opt(in.Room), TermID: in.Term, Day: in.Day,
			StartTime: start, EndTime: end,
		})
		if err != nil {
			return fmt.Errorf("check clashes: %w", err)
		}
		for _, r := range rows {
			reason := "the class already has a lesson then"
			switch {
			case r.SameTeacher:
				reason = "the teacher is already teaching then"
			case r.SameRoom:
				reason = "the room is already booked then"
			}
			clashes = append(clashes, Clash{Slot: r.ID, ClassTitle: r.ClassTitle, Reason: reason})
		}
		if len(clashes) > 0 {
			return nil
		}
		id, err = q.CreateSlot(ctx, dbgen.CreateSlotParams{
			InstitutionID: in.School, TermID: in.Term, AssignedClassID: in.Class, DayOfWeek: in.Day,
			StartTime: start, EndTime: end, RoomID: opt(in.Room), TeacherID: opt(in.Teacher),
		})
		if err != nil {
			return fmt.Errorf("create slot: %w", err)
		}
		return nil
	})
	return id, clashes, err
}

func (s *PostgresStore) SlotSchool(ctx context.Context, id int64) (int64, error) {
	school, err := s.q.SlotSchool(ctx, id)
	if errors.Is(err, pgx.ErrNoRows) {
		return 0, ErrNotFound
	}
	if err != nil {
		return 0, fmt.Errorf("load slot: %w", err)
	}
	return school, nil
}

func (s *PostgresStore) RemoveSlot(ctx context.Context, id int64) error {
	if err := s.q.RemoveSlot(ctx, id); err != nil {
		return fmt.Errorf("remove slot: %w", err)
	}
	return nil
}

// ---- helpers ---------------------------------------------------------------------

func errOr(err, fallback error) error {
	if err != nil {
		return fmt.Errorf("check: %w", err)
	}
	return fallback
}

const uniqueViolation = "23505"

func duplicate(err error, action string) error {
	var pgErr interface{ SQLState() string }
	if errors.As(err, &pgErr) && pgErr.SQLState() == uniqueViolation {
		return ErrDuplicate
	}
	return fmt.Errorf("%s: %w", action, err)
}

func minutes(m int) pgtype.Time {
	return pgtype.Time{Microseconds: int64(m) * 60_000_000, Valid: true}
}

func clock(t pgtype.Time) string {
	m := t.Microseconds / 60_000_000
	return fmt.Sprintf("%02d:%02d", m/60, m%60)
}

func day(d pgtype.Date) string { return d.Time.Format(time.DateOnly) }

func opt(v *int64) pgtype.Int8 {
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
