package reports

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"math"
	"net/http"
	"slices"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/httpx"
	"github.com/O-Mario88/maple-online-School/api/internal/identity"
	"github.com/O-Mario88/maple-online-School/api/internal/roles"
)

const (
	maxFormative = 20
	maxSummative = 80
	maxEntries   = 200
	maxRemarks   = 2_000
)

// Store is what the handler needs from the database.
type Store interface {
	SchoolsWithRoles(ctx context.Context, userID int64, rs []string) ([]int64, error)
	Class(ctx context.Context, id int64) (ClassInfo, error)
	Term(ctx context.Context, school int64, requested *int64) (int64, error)
	SaveMarks(ctx context.Context, c ClassInfo, term int64, entries []MarkEntry, by int64) error
	Generate(ctx context.Context, c ClassInfo, term int64) (int, int, error)
	ListMarks(ctx context.Context, staff, learners []int64, f Filter, page httpx.Page) ([]SubjectMark, int64, error)
	ListReports(ctx context.Context, staff, learners []int64, f Filter, page httpx.Page) ([]Report, int64, error)
	GetReport(ctx context.Context, staff, learners []int64, id int64) (Report, error)
	UpdateReport(ctx context.Context, id int64, c ReportChange) error
}

// Handler serves /api/v1/grading/subjects/ and /api/v1/grading/reports/.
type Handler struct {
	store       Store
	family      identity.ProfileReader
	requireUser func(http.Handler) http.Handler
}

// NewHandler wires the routes. requireUser authenticates each request.
func NewHandler(store Store, family identity.ProfileReader, requireUser func(http.Handler) http.Handler) *Handler {
	return &Handler{store: store, family: family, requireUser: requireUser}
}

// Mount registers the routes; anything else on these paths gets 405.
func (h *Handler) Mount(r chi.Router) {
	r.Group(func(r chi.Router) {
		r.Use(h.requireUser)
		r.Get("/api/v1/grading/subjects/", h.listMarks)
		r.Post("/api/v1/grading/subjects/", h.saveMarks)
		r.Post("/api/v1/grading/reports/generate/", h.generate)
		r.Get("/api/v1/grading/reports/", h.listReports)
		r.Get("/api/v1/grading/reports/{id}/", h.getReport)
		r.Patch("/api/v1/grading/reports/{id}/", h.updateReport)
	})
	for _, prefix := range []string{"/api/v1/grading/subjects/", "/api/v1/grading/reports/"} {
		r.HandleFunc(prefix+"*", func(w http.ResponseWriter, _ *http.Request) {
			httpx.WriteError(w, http.StatusMethodNotAllowed, "method_not_allowed", "This action isn't available.")
		})
	}
}

type viewer struct {
	id            int64
	leader, staff []int64
	learners      []int64
}

func (h *Handler) viewer(w http.ResponseWriter, r *http.Request) (viewer, bool) {
	user := identity.UserFrom(r.Context())
	v := viewer{id: user.ID, learners: []int64{}}
	var err error
	if v.leader, err = h.store.SchoolsWithRoles(r.Context(), user.ID, roles.Leaders); err == nil {
		v.staff, err = h.store.SchoolsWithRoles(r.Context(), user.ID, roles.Staff)
	}
	if err == nil && user.Role == "student" {
		v.learners = []int64{user.ID}
	}
	if err == nil && user.Role == "parent" {
		var kids []identity.Child
		if kids, err = h.family.ApprovedChildren(r.Context(), user.ID); err == nil {
			for _, k := range kids {
				v.learners = append(v.learners, k.UserID)
			}
		}
	}
	if err != nil {
		serverError(w, "load viewer", err)
		return viewer{}, false
	}
	return v, true
}

// runnableClass loads a class the viewer teaches or leads, else writes 404.
func (h *Handler) runnableClass(w http.ResponseWriter, r *http.Request, v viewer, id int64) (ClassInfo, bool) {
	c, err := h.store.Class(r.Context(), id)
	if errors.Is(err, ErrNotFound) || (err == nil && c.Teacher != v.id && !slices.Contains(v.leader, c.Institution)) {
		httpx.WriteError(w, http.StatusNotFound, "not_found", "Not found.")
		return ClassInfo{}, false
	}
	if err != nil {
		serverError(w, "load class", err)
		return ClassInfo{}, false
	}
	return c, true
}

func (h *Handler) term(w http.ResponseWriter, r *http.Request, school int64, requested *int64) (int64, bool) {
	term, err := h.store.Term(r.Context(), school, requested)
	if errors.Is(err, ErrNoTerm) {
		httpx.WriteError(w, http.StatusConflict, "no_term", "No school term covers this. Ask a school leader to set up the term first.")
		return 0, false
	}
	if err != nil {
		serverError(w, "find term", err)
		return 0, false
	}
	return term, true
}

// ---- subject marks -------------------------------------------------------------

func (h *Handler) listMarks(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	page := httpx.ParsePage(r)
	list, count, err := h.store.ListMarks(r.Context(), v.staff, v.learners, filterFrom(r), page)
	if err != nil {
		serverError(w, "list marks", err)
		return
	}
	httpx.WritePage(w, r, page, count, list)
}

type marksRequest struct {
	Class   int64  `json:"class"`
	Term    *int64 `json:"term"`
	Entries []struct {
		Student        int64           `json:"student"`
		FormativeScore json.RawMessage `json:"formative_score"`
		SummativeScore json.RawMessage `json:"summative_score"`
		TeacherRemarks *string         `json:"teacher_remarks"`
	} `json:"entries"`
}

func (h *Handler) saveMarks(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	var req marksRequest
	if err := httpx.DecodeJSON(r, &req); err != nil || req.Class <= 0 {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "Send the class and each student's scores.")
		return
	}
	c, ok := h.runnableClass(w, r, v, req.Class)
	if !ok {
		return
	}
	entries, problem := validateMarks(req)
	if problem != "" {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", problem)
		return
	}
	term, ok := h.term(w, r, c.Institution, req.Term)
	if !ok {
		return
	}
	err := h.store.SaveMarks(r.Context(), c, term, entries, v.id)
	switch {
	case errors.Is(err, ErrNotEnrolled):
		httpx.WriteError(w, http.StatusBadRequest, "not_enrolled", "One of the students isn't enrolled in this class.")
	case errors.Is(err, ErrReportPublished):
		httpx.WriteError(w, http.StatusConflict, "report_published", "A report card for this term is already published, so its marks are locked.")
	case err != nil:
		serverError(w, "save marks", err)
	default:
		httpx.WriteJSON(w, http.StatusOK, map[string]any{"saved": len(entries), "class": c.ID, "term": term})
	}
}

func validateMarks(req marksRequest) ([]MarkEntry, string) {
	if len(req.Entries) == 0 || len(req.Entries) > maxEntries {
		return nil, "Send between 1 and 200 students' scores."
	}
	seen := map[int64]bool{}
	out := make([]MarkEntry, 0, len(req.Entries))
	for _, e := range req.Entries {
		formative, okF := score(e.FormativeScore, maxFormative)
		summative, okS := score(e.SummativeScore, maxSummative)
		switch {
		case e.Student <= 0 || seen[e.Student]:
			return nil, "Each student can appear once."
		case !okF:
			return nil, "Formative scores must be from 0 to 20."
		case !okS:
			return nil, "Summative scores must be from 0 to 80."
		case e.TeacherRemarks != nil && len(*e.TeacherRemarks) > maxRemarks:
			return nil, "Remarks can be up to 2,000 characters."
		}
		seen[e.Student] = true
		out = append(out, MarkEntry{Student: e.Student, Formative: formative, Summative: summative, Remarks: e.TeacherRemarks})
	}
	return out, ""
}

// score reads "17", "17.5" or 17 and checks it is between 0 and max.
func score(raw json.RawMessage, max float64) (float64, bool) {
	f, err := strconv.ParseFloat(strings.Trim(strings.TrimSpace(string(raw)), `"`), 64)
	if err != nil || math.IsNaN(f) || f < 0 || f > max {
		return 0, false
	}
	return math.Round(f*100) / 100, true
}

// ---- report cards ---------------------------------------------------------------

type generateRequest struct {
	Class int64  `json:"class"`
	Term  *int64 `json:"term"`
}

func (h *Handler) generate(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	var req generateRequest
	if err := httpx.DecodeJSON(r, &req); err != nil || req.Class <= 0 {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "Choose the class to prepare report cards for.")
		return
	}
	c, ok := h.runnableClass(w, r, v, req.Class)
	if !ok {
		return
	}
	term, ok := h.term(w, r, c.Institution, req.Term)
	if !ok {
		return
	}
	written, skipped, err := h.store.Generate(r.Context(), c, term)
	if err != nil {
		serverError(w, "generate", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"generated": written, "already_published": skipped, "term": term})
}

func (h *Handler) listReports(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	page := httpx.ParsePage(r)
	list, count, err := h.store.ListReports(r.Context(), v.staff, v.learners, filterFrom(r), page)
	if err != nil {
		serverError(w, "list reports", err)
		return
	}
	httpx.WritePage(w, r, page, count, list)
}

func (h *Handler) getReport(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	report, err := h.store.GetReport(r.Context(), v.staff, v.learners, pathID(r))
	if errors.Is(err, ErrNotFound) {
		httpx.WriteError(w, http.StatusNotFound, "not_found", "Not found.")
		return
	}
	if err != nil {
		serverError(w, "get report", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, report)
}

type reportPatch struct {
	ClassTeacherRemarks *string `json:"class_teacher_remarks"`
	HeadteacherRemarks  *string `json:"headteacher_remarks"`
	PromotionStatus     *string `json:"promotion_status"`
	IsPublished         *bool   `json:"is_published"`
}

func (h *Handler) updateReport(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	id := pathID(r)
	report, err := h.store.GetReport(r.Context(), v.staff, nil, id) // staff only
	if errors.Is(err, ErrNotFound) {
		httpx.WriteError(w, http.StatusNotFound, "not_found", "Not found.")
		return
	}
	if err != nil {
		serverError(w, "get report", err)
		return
	}
	var req reportPatch
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", err.Error())
		return
	}
	leaderOnly := req.HeadteacherRemarks != nil || req.PromotionStatus != nil || req.IsPublished != nil
	if leaderOnly && !slices.Contains(v.leader, report.Institution) {
		httpx.WriteError(w, http.StatusForbidden, "permission_denied", "Only school leaders can add the head's remarks or publish report cards.")
		return
	}
	for _, s := range []*string{req.ClassTeacherRemarks, req.HeadteacherRemarks, req.PromotionStatus} {
		if s != nil && len(*s) > maxRemarks {
			httpx.WriteError(w, http.StatusBadRequest, "invalid", "Remarks can be up to 2,000 characters.")
			return
		}
	}
	if err := h.store.UpdateReport(r.Context(), id, ReportChange(req)); err != nil {
		serverError(w, "update report", err)
		return
	}
	updated, err := h.store.GetReport(r.Context(), v.staff, nil, id)
	if err != nil {
		serverError(w, "reload report", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, updated)
}

// ---- helpers ---------------------------------------------------------------------

func filterFrom(r *http.Request) Filter {
	q := r.URL.Query()
	return Filter{Class: queryID(q.Get("class")), Term: queryID(q.Get("term")), Student: queryID(q.Get("student"))}
}

func queryID(s string) *int64 {
	id, err := strconv.ParseInt(s, 10, 64)
	if err != nil || id <= 0 {
		return nil
	}
	return &id
}

func pathID(r *http.Request) int64 {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	return id
}

func serverError(w http.ResponseWriter, action string, err error) {
	slog.Error("reports: "+action, "err", err)
	httpx.WriteError(w, http.StatusInternalServerError, "server_error", "Something went wrong. Please try again.")
}
