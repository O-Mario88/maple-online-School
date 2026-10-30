package learning

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/httpx"
	"github.com/O-Mario88/maple-online-School/api/internal/identity"
)

// Paging is one page of a list.
type Paging = httpx.Page

const (
	maxTitle        = 255
	maxInstructions = 20_000
	maxFeedback     = 5_000
)

// Store is what the handler needs from the database.
type Store interface {
	Scope(ctx context.Context, userID int64) (Scope, error)
	ListAssessments(ctx context.Context, sc Scope, publishedOnly, withAnswers bool, page Paging) ([]Assessment, int64, error)
	GetAssessment(ctx context.Context, sc Scope, id int64, publishedOnly, withAnswers bool) (Assessment, error)
	CreateAssessment(ctx context.Context, in NewAssessment) (Assessment, error)
	ListStudentSubmissions(ctx context.Context, studentID int64, page Paging) ([]Submission, int64, error)
	ListStaffSubmissions(ctx context.Context, schools []int64, page Paging) ([]Submission, int64, error)
	Submit(ctx context.Context, a Assessment, studentID int64, answers map[string]json.RawMessage) (Submission, error)
	ListStudentGrades(ctx context.Context, students []int64, page Paging) ([]Grade, int64, error)
	ListStaffGrades(ctx context.Context, schools []int64, page Paging) ([]Grade, int64, error)
	Grade(ctx context.Context, staffSchools []int64, submissionID int64, score float64, feedback *string) (Grade, bool, error)
}

// Handler serves /api/v1/assessments/{assessment,submission}/ and /api/v1/grading/records/.
type Handler struct {
	store       Store
	family      identity.ProfileReader
	requireUser func(http.Handler) http.Handler
}

// NewHandler wires the routes. requireUser authenticates each request.
func NewHandler(store Store, family identity.ProfileReader, requireUser func(http.Handler) http.Handler) *Handler {
	return &Handler{store: store, family: family, requireUser: requireUser}
}

// Mount registers the routes. Methods Go doesn't support on these paths get
// 405 here rather than falling through to Django, so Go stays the only writer.
func (h *Handler) Mount(r chi.Router) {
	r.Group(func(r chi.Router) {
		r.Use(h.requireUser)
		r.Get("/api/v1/assessments/assessment/", h.listAssessments)
		r.Post("/api/v1/assessments/assessment/", h.createAssessment)
		r.Get("/api/v1/assessments/assessment/{id}/", h.getAssessment)
		r.Get("/api/v1/assessments/submission/", h.listSubmissions)
		r.Post("/api/v1/assessments/submission/", h.submit)
		r.Get("/api/v1/grading/records/", h.listGrades)
		r.Post("/api/v1/grading/records/", h.grade)
	})
	for _, prefix := range []string{"/api/v1/assessments/assessment/", "/api/v1/assessments/submission/", "/api/v1/grading/records/"} {
		r.HandleFunc(prefix+"*", notAllowed)
	}
}

func notAllowed(w http.ResponseWriter, _ *http.Request) {
	httpx.WriteError(w, http.StatusMethodNotAllowed, "method_not_allowed", "This action isn't available.")
}

// scope loads the signed-in person and the schools they can act in.
func (h *Handler) scope(w http.ResponseWriter, r *http.Request) (identity.User, Scope, bool) {
	user := identity.UserFrom(r.Context())
	sc, err := h.store.Scope(r.Context(), user.ID)
	if err != nil {
		serverError(w, "load scope", err)
		return user, Scope{}, false
	}
	return user, sc, true
}

// ---- assignments --------------------------------------------------------------

func (h *Handler) listAssessments(w http.ResponseWriter, r *http.Request) {
	_, sc, ok := h.scope(w, r)
	if !ok {
		return
	}
	page := httpx.ParsePage(r)
	list, count, err := h.store.ListAssessments(r.Context(), sc, !sc.IsStaff(), sc.IsStaff(), page)
	if err != nil {
		serverError(w, "list assignments", err)
		return
	}
	httpx.WritePage(w, r, page, count, list)
}

func (h *Handler) getAssessment(w http.ResponseWriter, r *http.Request) {
	_, sc, ok := h.scope(w, r)
	if !ok {
		return
	}
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		writeNotFound(w)
		return
	}
	a, err := h.store.GetAssessment(r.Context(), sc, id, !sc.IsStaff(), sc.IsStaff())
	if errors.Is(err, ErrNotFound) {
		writeNotFound(w)
		return
	}
	if err != nil {
		serverError(w, "get assignment", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, a)
}

type createAssessmentRequest struct {
	Title        string          `json:"title"`
	Instructions string          `json:"instructions"`
	Type         string          `json:"type"`
	MaxScore     json.RawMessage `json:"max_score"`
	IsPublished  bool            `json:"is_published"`
	// Accepted for compatibility with the Django API and ignored.
	Source json.RawMessage `json:"source"`
}

var assessmentTypes = map[string]bool{"assignment": true, "quiz": true, "test": true, "exam": true, "exercise": true}

func (h *Handler) createAssessment(w http.ResponseWriter, r *http.Request) {
	user, sc, ok := h.scope(w, r)
	if !ok {
		return
	}
	if !sc.IsStaff() {
		httpx.WriteError(w, http.StatusForbidden, "permission_denied", "Only teachers can create assignments.")
		return
	}
	var req createAssessmentRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", err.Error())
		return
	}
	in, problem := validateAssessment(req, user.ID)
	if problem != "" {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", problem)
		return
	}
	a, err := h.store.CreateAssessment(r.Context(), in)
	if err != nil {
		serverError(w, "create assignment", err)
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, a)
}

func validateAssessment(req createAssessmentRequest, author int64) (NewAssessment, string) {
	title := strings.TrimSpace(req.Title)
	instructions := strings.TrimSpace(req.Instructions)
	kind := strings.TrimSpace(req.Type)
	if kind == "" {
		kind = "assignment"
	}
	switch {
	case title == "" || len(title) > maxTitle:
		return NewAssessment{}, "A title of up to 255 characters is required."
	case instructions == "" || len(instructions) > maxInstructions:
		return NewAssessment{}, "Instructions are required (up to 20,000 characters)."
	case !assessmentTypes[kind]:
		return NewAssessment{}, "Type must be assignment, quiz, test, exam or exercise."
	}
	maxScore := 100.0
	if len(req.MaxScore) > 0 {
		v, err := parseScore(req.MaxScore)
		if err != nil || v <= 0 {
			return NewAssessment{}, "Maximum score must be a number above 0."
		}
		maxScore = v
	}
	return NewAssessment{Title: title, Instructions: instructions, Type: kind, MaxScore: maxScore, IsPublished: req.IsPublished, CreatedBy: author}, ""
}

// ---- submissions --------------------------------------------------------------

func (h *Handler) listSubmissions(w http.ResponseWriter, r *http.Request) {
	user, sc, ok := h.scope(w, r)
	if !ok {
		return
	}
	page := httpx.ParsePage(r)
	var (
		list  []Submission
		count int64
		err   error
	)
	switch {
	case sc.IsStaff():
		list, count, err = h.store.ListStaffSubmissions(r.Context(), sc.StaffSchool, page)
	default:
		list, count, err = h.store.ListStudentSubmissions(r.Context(), user.ID, page)
	}
	if err != nil {
		serverError(w, "list submissions", err)
		return
	}
	httpx.WritePage(w, r, page, count, list)
}

type submitRequest struct {
	Assessment  int64                      `json:"assessment"`
	AnswersData map[string]json.RawMessage `json:"answers_data"`
}

func (h *Handler) submit(w http.ResponseWriter, r *http.Request) {
	user, sc, ok := h.scope(w, r)
	if !ok {
		return
	}
	if user.Role != "student" {
		httpx.WriteError(w, http.StatusForbidden, "permission_denied", "Only students can submit work.")
		return
	}
	var req submitRequest
	if err := httpx.DecodeJSON(r, &req); err != nil || req.Assessment <= 0 {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "Choose the assignment you're submitting.")
		return
	}
	if req.AnswersData == nil {
		req.AnswersData = map[string]json.RawMessage{}
	}
	a, err := h.store.GetAssessment(r.Context(), sc, req.Assessment, true, false)
	if errors.Is(err, ErrNotFound) {
		writeNotFound(w)
		return
	}
	if err != nil {
		serverError(w, "load assignment", err)
		return
	}
	sub, err := h.store.Submit(r.Context(), a, user.ID, req.AnswersData)
	switch {
	case errors.Is(err, ErrAlreadySubmitted):
		httpx.WriteError(w, http.StatusConflict, "already_submitted", "You have already submitted this assignment.")
	case err != nil:
		serverError(w, "submit", err)
	default:
		httpx.WriteJSON(w, http.StatusCreated, sub)
	}
}

// ---- grades -------------------------------------------------------------------

func (h *Handler) listGrades(w http.ResponseWriter, r *http.Request) {
	user, sc, ok := h.scope(w, r)
	if !ok {
		return
	}
	page := httpx.ParsePage(r)
	var (
		list  []Grade
		count int64
		err   error
	)
	switch {
	case sc.IsStaff():
		list, count, err = h.store.ListStaffGrades(r.Context(), sc.StaffSchool, page)
	case user.Role == "parent":
		students, allowed := h.childrenFor(w, r, user.ID)
		if !allowed {
			return
		}
		list, count, err = h.store.ListStudentGrades(r.Context(), students, page)
	default:
		list, count, err = h.store.ListStudentGrades(r.Context(), []int64{user.ID}, page)
	}
	if err != nil {
		serverError(w, "list grades", err)
		return
	}
	httpx.WritePage(w, r, page, count, list)
}

// childrenFor returns the parent's approved children, narrowed to ?student=
// when given. It writes the error response itself.
func (h *Handler) childrenFor(w http.ResponseWriter, r *http.Request, parentID int64) ([]int64, bool) {
	kids, err := h.family.ApprovedChildren(r.Context(), parentID)
	if err != nil {
		serverError(w, "load children", err)
		return nil, false
	}
	ids := make([]int64, 0, len(kids))
	for _, k := range kids {
		ids = append(ids, k.UserID)
	}
	want := r.URL.Query().Get("student")
	if want == "" {
		return ids, true
	}
	id, err := strconv.ParseInt(want, 10, 64)
	if err == nil {
		for _, k := range ids {
			if k == id {
				return []int64{id}, true
			}
		}
	}
	httpx.WriteError(w, http.StatusForbidden, "permission_denied", "You can only see grades for your linked children.")
	return nil, false
}

type gradeRequest struct {
	Submission      int64           `json:"submission"`
	Score           json.RawMessage `json:"score"`
	TeacherFeedback *string         `json:"teacher_feedback"`
}

func (h *Handler) grade(w http.ResponseWriter, r *http.Request) {
	_, sc, ok := h.scope(w, r)
	if !ok {
		return
	}
	if !sc.IsStaff() {
		httpx.WriteError(w, http.StatusForbidden, "permission_denied", "Only teachers can record grades.")
		return
	}
	var req gradeRequest
	if err := httpx.DecodeJSON(r, &req); err != nil || req.Submission <= 0 || len(req.Score) == 0 {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "A submission and a score are required.")
		return
	}
	score, err := parseScore(req.Score)
	if err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "Score "+err.Error()+".")
		return
	}
	if req.TeacherFeedback != nil && len(*req.TeacherFeedback) > maxFeedback {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "Feedback can be up to 5,000 characters.")
		return
	}
	g, created, err := h.store.Grade(r.Context(), sc.StaffSchool, req.Submission, score, req.TeacherFeedback)
	switch {
	case errors.Is(err, ErrNotFound):
		writeNotFound(w)
	case errors.Is(err, ErrScoreTooHigh):
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "Score is above the assignment's maximum.")
	case err != nil:
		serverError(w, "grade", err)
	case created:
		httpx.WriteJSON(w, http.StatusCreated, g)
	default:
		httpx.WriteJSON(w, http.StatusOK, g)
	}
}

func writeNotFound(w http.ResponseWriter) {
	httpx.WriteError(w, http.StatusNotFound, "not_found", "Not found.")
}

func serverError(w http.ResponseWriter, action string, err error) {
	slog.Error("learning: "+action, "err", err)
	httpx.WriteError(w, http.StatusInternalServerError, "server_error", "Something went wrong. Please try again.")
}
