// Package messages carries conversations between a school's staff and a
// learner's family, about that learner. The staff member and the learner's
// confirmed parents take part; the school's leaders can read every
// conversation for safeguarding but don't write in it.
package messages

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
	"unicode/utf8"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/O-Mario88/maple-online-School/api/internal/httpx"
	"github.com/O-Mario88/maple-online-School/api/internal/identity"
	"github.com/O-Mario88/maple-online-School/api/internal/inbox"
	"github.com/O-Mario88/maple-online-School/api/internal/platform/dbgen"
	"github.com/O-Mario88/maple-online-School/api/internal/roles"
)

const (
	prefix        = "/api/v1/messages/threads/"
	maxBody       = 4000
	maxSubject    = 200
	previewLength = 140
	noteKind      = "message"
)

var (
	ErrNotFound  = errors.New("not found")
	ErrReadOnly  = errors.New("read only")
	ErrBadTarget = errors.New("staff member can't be messaged about this learner")
)

type Person struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

type ThreadSummary struct {
	ID            int64     `json:"id"`
	Subject       string    `json:"subject"`
	Student       Person    `json:"student"`
	Staff         Person    `json:"staff"`
	LastMessageAt time.Time `json:"last_message_at"`
	LastBody      string    `json:"last_body"`
	LastAuthor    string    `json:"last_author"`
}

type Message struct {
	ID        int64     `json:"id"`
	Author    Person    `json:"author"`
	Body      string    `json:"body"`
	CreatedAt time.Time `json:"created_at"`
}

type Thread struct {
	ID       int64     `json:"id"`
	Subject  string    `json:"subject"`
	Student  Person    `json:"student"`
	Staff    Person    `json:"staff"`
	CanReply bool      `json:"can_reply"`
	Messages []Message `json:"messages"`
}

type NewThread struct {
	Student int64  `json:"student"`
	Staff   int64  `json:"staff"`
	Subject string `json:"subject"`
	Body    string `json:"body"`
}

// ---- store -------------------------------------------------------------------

type PostgresStore struct{ pool *pgxpool.Pool }

func NewPostgresStore(pool *pgxpool.Pool) *PostgresStore { return &PostgresStore{pool: pool} }

func leaderSchools(ctx context.Context, q *dbgen.Queries, viewer int64) ([]int64, error) {
	ids, err := q.StaffSchoolIDs(ctx, dbgen.StaffSchoolIDsParams{UserID: viewer, StaffRoles: roles.Leaders})
	if err != nil {
		return nil, fmt.Errorf("load schools: %w", err)
	}
	if ids == nil {
		ids = []int64{}
	}
	return ids, nil
}

// canMessage says whether a staff member may talk with a learner's family:
// they teach the learner, or lead the learner's school. It returns the school.
func canMessage(ctx context.Context, q *dbgen.Queries, staff, student int64) (int64, error) {
	school, err := q.SharedSchool(ctx, dbgen.SharedSchoolParams{Staff: staff, StaffRoles: roles.Staff, Student: student})
	if err != nil || school == 0 {
		return 0, err
	}
	teaches, err := q.TeachesStudent(ctx, dbgen.TeachesStudentParams{Staff: staff, Student: student})
	if err != nil {
		return 0, err
	}
	if teaches {
		return school, nil
	}
	leads, err := leaderSchools(ctx, q, staff)
	if err != nil {
		return 0, err
	}
	if slices.Contains(leads, school) {
		return school, nil
	}
	return 0, nil
}

func (s *PostgresStore) Start(ctx context.Context, viewer int64, viewerName string, in NewThread) (int64, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return 0, fmt.Errorf("begin: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()
	q := dbgen.New(tx)

	staff := viewer
	parent, err := q.IsApprovedParent(ctx, dbgen.IsApprovedParentParams{Parent: viewer, Student: in.Student})
	if err != nil {
		return 0, fmt.Errorf("check parent: %w", err)
	}
	if parent {
		if in.Staff == 0 {
			return 0, ErrBadTarget
		}
		staff = in.Staff
	}
	school, err := canMessage(ctx, q, staff, in.Student)
	if err != nil {
		return 0, fmt.Errorf("check staff: %w", err)
	}
	if school == 0 {
		if parent {
			return 0, ErrBadTarget
		}
		return 0, ErrNotFound
	}
	id, err := q.CreateThread(ctx, dbgen.CreateThreadParams{SchoolID: school, StudentID: in.Student, StaffID: staff, Subject: in.Subject, CreatedBy: viewer})
	if err != nil {
		return 0, fmt.Errorf("create thread: %w", err)
	}
	if err := post(ctx, q, id, viewer, viewerName, in.Body); err != nil {
		return 0, err
	}
	return id, tx.Commit(ctx)
}

// post adds a message and tells the other side.
func post(ctx context.Context, q *dbgen.Queries, threadID, author int64, authorName, body string) error {
	if _, err := q.AddMessage(ctx, dbgen.AddMessageParams{ThreadID: threadID, AuthorID: author, Body: body}); err != nil {
		return fmt.Errorf("add message: %w", err)
	}
	if err := q.TouchThread(ctx, threadID); err != nil {
		return fmt.Errorf("touch thread: %w", err)
	}
	t, err := q.GetThread(ctx, threadID)
	if err != nil {
		return fmt.Errorf("reload thread: %w", err)
	}
	note := inbox.Note{
		Kind: noteKind, Title: authorName + " wrote about " + t.StudentName + ": " + t.Subject,
		Body: preview(body), Link: "/messages/" + strconv.FormatInt(threadID, 10),
	}
	if author == t.StaffID {
		return inbox.NotifyParents(ctx, q, t.StudentID, note)
	}
	return inbox.Notify(ctx, q, t.StaffID, note)
}

func preview(body string) string {
	if utf8.RuneCountInString(body) <= previewLength {
		return body
	}
	return string([]rune(body)[:previewLength]) + "…"
}

// access is what the viewer may do with a thread.
type access int

const (
	noAccess access = iota
	readOnly
	participant
)

func accessTo(ctx context.Context, q *dbgen.Queries, viewer int64, t dbgen.GetThreadRow) (access, error) {
	if t.StaffID == viewer {
		return participant, nil
	}
	parent, err := q.IsApprovedParent(ctx, dbgen.IsApprovedParentParams{Parent: viewer, Student: t.StudentID})
	if err != nil {
		return noAccess, err
	}
	if parent {
		return participant, nil
	}
	leads, err := leaderSchools(ctx, q, viewer)
	if err != nil {
		return noAccess, err
	}
	if slices.Contains(leads, t.SchoolID) {
		return readOnly, nil
	}
	return noAccess, nil
}

func (s *PostgresStore) Thread(ctx context.Context, viewer, id int64) (Thread, error) {
	q := dbgen.New(s.pool)
	t, err := q.GetThread(ctx, id)
	if errors.Is(err, pgx.ErrNoRows) {
		return Thread{}, ErrNotFound
	}
	if err != nil {
		return Thread{}, fmt.Errorf("get thread: %w", err)
	}
	a, err := accessTo(ctx, q, viewer, t)
	if err != nil {
		return Thread{}, fmt.Errorf("check access: %w", err)
	}
	if a == noAccess {
		return Thread{}, ErrNotFound
	}
	rows, err := q.ThreadMessages(ctx, id)
	if err != nil {
		return Thread{}, fmt.Errorf("messages: %w", err)
	}
	out := Thread{
		ID: t.ID, Subject: t.Subject, Student: Person{t.StudentID, t.StudentName}, Staff: Person{t.StaffID, t.StaffName},
		CanReply: a == participant, Messages: make([]Message, 0, len(rows)),
	}
	for _, r := range rows {
		out.Messages = append(out.Messages, Message{ID: r.ID, Author: Person{r.AuthorID, r.AuthorName}, Body: r.Body, CreatedAt: r.CreatedAt.Time})
	}
	return out, nil
}

func (s *PostgresStore) Reply(ctx context.Context, viewer int64, viewerName string, id int64, body string) error {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()
	q := dbgen.New(tx)
	t, err := q.GetThread(ctx, id)
	if errors.Is(err, pgx.ErrNoRows) {
		return ErrNotFound
	}
	if err != nil {
		return fmt.Errorf("get thread: %w", err)
	}
	a, err := accessTo(ctx, q, viewer, t)
	if err != nil {
		return fmt.Errorf("check access: %w", err)
	}
	switch a {
	case noAccess:
		return ErrNotFound
	case readOnly:
		return ErrReadOnly
	}
	if err := post(ctx, q, id, viewer, viewerName, body); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func (s *PostgresStore) Threads(ctx context.Context, viewer int64, page httpx.Page) ([]ThreadSummary, int64, error) {
	q := dbgen.New(s.pool)
	leads, err := leaderSchools(ctx, q, viewer)
	if err != nil {
		return nil, 0, err
	}
	rows, err := q.ThreadsFor(ctx, dbgen.ThreadsForParams{Viewer: viewer, LeaderSchools: leads, PageLimit: page.Limit, PageOffset: page.Offset})
	if err != nil {
		return nil, 0, fmt.Errorf("list threads: %w", err)
	}
	n, err := q.CountThreadsFor(ctx, dbgen.CountThreadsForParams{Viewer: viewer, LeaderSchools: leads})
	if err != nil {
		return nil, 0, fmt.Errorf("count threads: %w", err)
	}
	out := make([]ThreadSummary, 0, len(rows))
	for _, r := range rows {
		out = append(out, ThreadSummary{
			ID: r.ID, Subject: r.Subject, Student: Person{r.StudentID, r.StudentName}, Staff: Person{r.StaffID, r.StaffName},
			LastMessageAt: r.LastMessageAt.Time, LastBody: preview(r.LastBody), LastAuthor: r.LastAuthor,
		})
	}
	return out, n, nil
}

// Contact is a staff member a family can write to.
type Contact struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
	Role string `json:"role"`
}

// Contacts lists who a confirmed parent can write to about their child.
func (s *PostgresStore) Contacts(ctx context.Context, viewer, student int64) ([]Contact, error) {
	q := dbgen.New(s.pool)
	parent, err := q.IsApprovedParent(ctx, dbgen.IsApprovedParentParams{Parent: viewer, Student: student})
	if err != nil {
		return nil, fmt.Errorf("check parent: %w", err)
	}
	if !parent {
		return nil, ErrNotFound
	}
	rows, err := q.MessageContacts(ctx, dbgen.MessageContactsParams{Student: student, LeaderRoles: roles.Leaders})
	if err != nil {
		return nil, fmt.Errorf("contacts: %w", err)
	}
	out := make([]Contact, 0, len(rows))
	for _, r := range rows {
		out = append(out, Contact{ID: r.ID, Name: r.FullName, Role: r.Role})
	}
	return out, nil
}

// ---- handler -----------------------------------------------------------------

// Store is what the handler needs from the database.
type Store interface {
	Start(ctx context.Context, viewer int64, viewerName string, in NewThread) (int64, error)
	Thread(ctx context.Context, viewer, id int64) (Thread, error)
	Reply(ctx context.Context, viewer int64, viewerName string, id int64, body string) error
	Threads(ctx context.Context, viewer int64, page httpx.Page) ([]ThreadSummary, int64, error)
	Contacts(ctx context.Context, viewer, student int64) ([]Contact, error)
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
		r.Get(prefix, h.list)
		r.Post(prefix, h.start)
		r.Get(prefix+"{id}/", h.get)
		r.Post(prefix+"{id}/messages/", h.reply)
		r.Get("/api/v1/messages/contacts/", h.contacts)
	})
	r.HandleFunc("/api/v1/messages/*", func(w http.ResponseWriter, _ *http.Request) {
		httpx.WriteError(w, http.StatusMethodNotAllowed, "method_not_allowed", "This action isn't available.")
	})
}

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	page := httpx.ParsePage(r)
	items, n, err := h.store.Threads(r.Context(), identity.UserFrom(r.Context()).ID, page)
	if err != nil {
		serverError(w, "list", err)
		return
	}
	httpx.WritePage(w, r, page, n, items)
}

func validBody(w http.ResponseWriter, body string) (string, bool) {
	body = strings.TrimSpace(body)
	if body == "" || utf8.RuneCountInString(body) > maxBody {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "Write a message of up to 4000 characters.")
		return "", false
	}
	return body, true
}

func (h *Handler) start(w http.ResponseWriter, r *http.Request) {
	var in NewThread
	if err := httpx.DecodeJSON(r, &in); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "Send student, subject and body (and staff, for parents).")
		return
	}
	in.Subject = strings.TrimSpace(in.Subject)
	if in.Subject == "" || utf8.RuneCountInString(in.Subject) > maxSubject {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "Give the conversation a subject of up to 200 characters.")
		return
	}
	body, ok := validBody(w, in.Body)
	if !ok {
		return
	}
	in.Body = body
	user := identity.UserFrom(r.Context())
	id, err := h.store.Start(r.Context(), user.ID, user.FullName, in)
	switch {
	case errors.Is(err, ErrNotFound):
		httpx.WriteError(w, http.StatusNotFound, "not_found", "Not found.")
	case errors.Is(err, ErrBadTarget):
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "Choose one of your child's teachers or the school's leaders.")
	case err != nil:
		serverError(w, "start", err)
	default:
		h.respond(w, r, id, http.StatusCreated)
	}
}

func (h *Handler) respond(w http.ResponseWriter, r *http.Request, id int64, status int) {
	t, err := h.store.Thread(r.Context(), identity.UserFrom(r.Context()).ID, id)
	switch {
	case errors.Is(err, ErrNotFound):
		httpx.WriteError(w, http.StatusNotFound, "not_found", "Not found.")
	case err != nil:
		serverError(w, "get", err)
	default:
		httpx.WriteJSON(w, status, t)
	}
}

func threadID(r *http.Request) int64 {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	return id
}

func (h *Handler) get(w http.ResponseWriter, r *http.Request) {
	h.respond(w, r, threadID(r), http.StatusOK)
}

func (h *Handler) reply(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Body string `json:"body"`
	}
	if err := httpx.DecodeJSON(r, &in); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "Send body.")
		return
	}
	body, ok := validBody(w, in.Body)
	if !ok {
		return
	}
	user := identity.UserFrom(r.Context())
	id := threadID(r)
	err := h.store.Reply(r.Context(), user.ID, user.FullName, id, body)
	switch {
	case errors.Is(err, ErrNotFound):
		httpx.WriteError(w, http.StatusNotFound, "not_found", "Not found.")
	case errors.Is(err, ErrReadOnly):
		httpx.WriteError(w, http.StatusForbidden, "permission_denied", "School leaders can read conversations but only the teacher and family write in them.")
	case err != nil:
		serverError(w, "reply", err)
	default:
		h.respond(w, r, id, http.StatusCreated)
	}
}

func (h *Handler) contacts(w http.ResponseWriter, r *http.Request) {
	student, err := strconv.ParseInt(r.URL.Query().Get("student"), 10, 64)
	if err != nil || student <= 0 {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "Choose your child.")
		return
	}
	items, err := h.store.Contacts(r.Context(), identity.UserFrom(r.Context()).ID, student)
	switch {
	case errors.Is(err, ErrNotFound):
		httpx.WriteError(w, http.StatusNotFound, "not_found", "Not found.")
	case err != nil:
		serverError(w, "contacts", err)
	default:
		httpx.WritePage(w, r, httpx.Page{Number: 1}, int64(len(items)), items)
	}
}

func serverError(w http.ResponseWriter, action string, err error) {
	slog.Error("messages: "+action, "err", err)
	httpx.WriteError(w, http.StatusInternalServerError, "server_error", "Something went wrong. Please try again.")
}
