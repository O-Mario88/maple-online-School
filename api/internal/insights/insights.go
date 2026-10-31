package insights

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/O-Mario88/maple-online-School/api/internal/httpx"
	"github.com/O-Mario88/maple-online-School/api/internal/identity"
	"github.com/O-Mario88/maple-online-School/api/internal/inbox"
	"github.com/O-Mario88/maple-online-School/api/internal/platform/dbgen"
	"github.com/O-Mario88/maple-online-School/api/internal/roles"
)

const (
	prefix         = "/api/v1/insights/"
	lookbackDays   = 30
	maxNoteLength  = 2000
	kindParentNote = "parent_message"
	// Writes per minute from one network; schools share one, so it's generous.
	writeLimit = 60
)

var (
	ErrNotFound   = errors.New("not found")
	ErrNotEnroled = errors.New("learner not in class")
	kinds         = []string{kindParentNote, "remedial_work", "meeting", "note"}
)

type Person struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

type Learner struct {
	Student            Person     `json:"student"`
	Level              string     `json:"level"`
	Reasons            []string   `json:"reasons"`
	DaysMarked         int        `json:"days_marked"`
	DaysAttended       int        `json:"days_attended"`
	WorkSet            int        `json:"work_set"`
	WorkDone           int        `json:"work_done"`
	AveragePct         *float64   `json:"average_pct"`
	LastInterventionAt *time.Time `json:"last_intervention_at"`
}

type ClassInsight struct {
	Class    Person    `json:"class"`
	Learners []Learner `json:"learners"`
}

type Intervention struct {
	ID         int64     `json:"id"`
	ClassID    int64     `json:"class_id"`
	ClassTitle string    `json:"class_title"`
	StudentID  int64     `json:"student_id"`
	Staff      Person    `json:"staff"`
	Kind       string    `json:"kind"`
	Note       string    `json:"note"`
	CreatedAt  time.Time `json:"created_at"`
}

type NewIntervention struct {
	Class   int64  `json:"class"`
	Student int64  `json:"student"`
	Kind    string `json:"kind"`
	Note    string `json:"note"`
}

// ---- store -------------------------------------------------------------------

type PostgresStore struct{ pool *pgxpool.Pool }

func NewPostgresStore(pool *pgxpool.Pool) *PostgresStore { return &PostgresStore{pool: pool} }

// managedClass loads a class the viewer teaches or leads the school of.
func managedClass(ctx context.Context, q *dbgen.Queries, viewer, classID int64) (dbgen.InsightClassRow, error) {
	c, err := q.InsightClass(ctx, classID)
	if errors.Is(err, pgx.ErrNoRows) {
		return c, ErrNotFound
	}
	if err != nil {
		return c, fmt.Errorf("load class: %w", err)
	}
	// The class teacher, while they still work at the school, or its leaders.
	role := roles.Leaders
	if c.TeacherID == viewer {
		role = roles.Staff
	}
	schools, err := q.StaffSchoolIDs(ctx, dbgen.StaffSchoolIDsParams{UserID: viewer, StaffRoles: role})
	if err != nil {
		return c, fmt.Errorf("load schools: %w", err)
	}
	if slices.Contains(schools, c.InstitutionID) {
		return c, nil
	}
	return c, ErrNotFound
}

func (s *PostgresStore) Class(ctx context.Context, viewer, classID int64, now time.Time) (ClassInsight, error) {
	q := dbgen.New(s.pool)
	c, err := managedClass(ctx, q, viewer, classID)
	if err != nil {
		return ClassInsight{}, err
	}
	rows, err := q.ClassLearnerSignals(ctx, dbgen.ClassLearnerSignalsParams{
		SchoolID: c.InstitutionID, TeacherID: c.TeacherID, ClassID: c.ID,
		Since: pgtype.Date{Time: now.AddDate(0, 0, -lookbackDays), Valid: true},
	})
	if err != nil {
		return ClassInsight{}, fmt.Errorf("learner signals: %w", err)
	}
	out := ClassInsight{Class: Person{ID: c.ID, Name: c.Title}, Learners: make([]Learner, 0, len(rows))}
	for _, r := range rows {
		out.Learners = append(out.Learners, toLearner(r))
	}
	slices.SortStableFunc(out.Learners, func(a, b Learner) int { return rank(a.Level) - rank(b.Level) })
	return out, nil
}

func toLearner(r dbgen.ClassLearnerSignalsRow) Learner {
	sig := Signals{DaysMarked: int(r.DaysMarked), DaysAttended: int(r.DaysAttended), WorkSet: int(r.WorkSet), WorkDone: int(r.WorkDone)}
	l := Learner{
		Student: Person{ID: r.StudentID, Name: r.FullName}, DaysMarked: sig.DaysMarked, DaysAttended: sig.DaysAttended,
		WorkSet: sig.WorkSet, WorkDone: sig.WorkDone,
	}
	if r.Average >= 0 {
		avg := r.Average
		sig.Average = &avg
		pct := float64(int(avg*100 + 0.5))
		l.AveragePct = &pct
	}
	l.Level, l.Reasons = Assess(sig)
	if l.Reasons == nil {
		l.Reasons = []string{}
	}
	if r.LastInterventionAt.Valid {
		t := r.LastInterventionAt.Time
		l.LastInterventionAt = &t
	}
	return l
}

func (s *PostgresStore) Intervene(ctx context.Context, viewer int64, viewerName string, in NewIntervention) (Intervention, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return Intervention{}, fmt.Errorf("begin: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()
	q := dbgen.New(tx)
	c, err := managedClass(ctx, q, viewer, in.Class)
	if err != nil {
		return Intervention{}, err
	}
	enrolled, err := q.EnrolledInClass(ctx, dbgen.EnrolledInClassParams{EnrolledClassID: c.ID, StudentID: in.Student})
	if err != nil {
		return Intervention{}, fmt.Errorf("check enrolment: %w", err)
	}
	if !enrolled {
		return Intervention{}, ErrNotEnroled
	}
	row, err := q.CreateIntervention(ctx, dbgen.CreateInterventionParams{
		SchoolID: c.InstitutionID, ClassID: c.ID, StudentID: in.Student, StaffID: viewer, Kind: in.Kind, Note: in.Note,
	})
	if err != nil {
		return Intervention{}, fmt.Errorf("record intervention: %w", err)
	}
	if in.Kind == kindParentNote {
		note := inbox.Note{Kind: "teacher_message", Title: "A message from " + viewerName + " (" + c.Title + ")", Body: in.Note, Link: "/"}
		if err := inbox.NotifyParents(ctx, q, in.Student, note); err != nil {
			return Intervention{}, err
		}
	}
	if err := tx.Commit(ctx); err != nil {
		return Intervention{}, fmt.Errorf("commit: %w", err)
	}
	return Intervention{
		ID: row.ID, ClassID: c.ID, ClassTitle: c.Title, StudentID: in.Student, Staff: Person{ID: viewer, Name: viewerName},
		Kind: in.Kind, Note: in.Note, CreatedAt: row.CreatedAt.Time,
	}, nil
}

func (s *PostgresStore) Interventions(ctx context.Context, viewer, student int64) ([]Intervention, error) {
	q := dbgen.New(s.pool)
	leads, err := q.StaffSchoolIDs(ctx, dbgen.StaffSchoolIDsParams{UserID: viewer, StaffRoles: roles.Leaders})
	if err != nil {
		return nil, fmt.Errorf("load schools: %w", err)
	}
	if leads == nil {
		leads = []int64{}
	}
	rows, err := q.ListInterventions(ctx, dbgen.ListInterventionsParams{StudentID: student, LeaderSchools: leads, ViewerID: viewer})
	if err != nil {
		return nil, fmt.Errorf("list interventions: %w", err)
	}
	out := make([]Intervention, 0, len(rows))
	for _, r := range rows {
		out = append(out, Intervention{
			ID: r.ID, ClassID: r.ClassID, ClassTitle: r.ClassTitle, StudentID: r.StudentID,
			Staff: Person{ID: r.StaffID, Name: r.StaffName}, Kind: r.Kind, Note: r.Note, CreatedAt: r.CreatedAt.Time,
		})
	}
	return out, nil
}

// ---- handler -----------------------------------------------------------------

// Store is what the handler needs from the database.
type Store interface {
	Class(ctx context.Context, viewer, classID int64, now time.Time) (ClassInsight, error)
	Intervene(ctx context.Context, viewer int64, viewerName string, in NewIntervention) (Intervention, error)
	Interventions(ctx context.Context, viewer, student int64) ([]Intervention, error)
}

type Handler struct {
	store       Store
	requireUser func(http.Handler) http.Handler
}

func NewHandler(store Store, requireUser func(http.Handler) http.Handler) *Handler {
	return &Handler{store: store, requireUser: requireUser}
}

func (h *Handler) Mount(r chi.Router) {
	r.Group(func(r chi.Router) {
		r.Use(h.requireUser)
		r.Get(prefix+"classes/{id}/learners/", h.class)
		r.Get(prefix+"interventions/", h.list)
		r.With(httpx.RateLimit(writeLimit, time.Minute)).Post(prefix+"interventions/", h.create)
	})
	r.HandleFunc(prefix+"*", func(w http.ResponseWriter, _ *http.Request) {
		httpx.WriteError(w, http.StatusMethodNotAllowed, "method_not_allowed", "This action isn't available.")
	})
}

func (h *Handler) class(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	out, err := h.store.Class(r.Context(), identity.UserFrom(r.Context()).ID, id, time.Now())
	if errors.Is(err, ErrNotFound) {
		httpx.WriteError(w, http.StatusNotFound, "not_found", "Not found.")
		return
	}
	if err != nil {
		serverError(w, "class insight", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, out)
}

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	student, err := strconv.ParseInt(r.URL.Query().Get("student"), 10, 64)
	if err != nil || student <= 0 {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "Choose a learner.")
		return
	}
	items, err := h.store.Interventions(r.Context(), identity.UserFrom(r.Context()).ID, student)
	if err != nil {
		serverError(w, "list interventions", err)
		return
	}
	page := httpx.Page{Number: 1}
	httpx.WritePage(w, r, page, int64(len(items)), items)
}

func (h *Handler) create(w http.ResponseWriter, r *http.Request) {
	var in NewIntervention
	if err := httpx.DecodeJSON(r, &in); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "Send class, student, kind and note.")
		return
	}
	in.Note = strings.TrimSpace(in.Note)
	switch {
	case !slices.Contains(kinds, in.Kind):
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "Kind must be parent_message, remedial_work, meeting or note.")
		return
	case in.Kind == kindParentNote && in.Note == "":
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "Write the message to the family.")
		return
	case len(in.Note) > maxNoteLength:
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "Keep the note under 2000 characters.")
		return
	}
	user := identity.UserFrom(r.Context())
	out, err := h.store.Intervene(r.Context(), user.ID, user.FullName, in)
	switch {
	case errors.Is(err, ErrNotFound):
		httpx.WriteError(w, http.StatusNotFound, "not_found", "Not found.")
	case errors.Is(err, ErrNotEnroled):
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "That learner isn't in this class.")
	case err != nil:
		serverError(w, "intervene", err)
	default:
		httpx.WriteJSON(w, http.StatusCreated, out)
	}
}

func serverError(w http.ResponseWriter, action string, err error) {
	slog.Error("insights: "+action, "err", err)
	httpx.WriteError(w, http.StatusInternalServerError, "server_error", "Something went wrong. Please try again.")
}
