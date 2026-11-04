package network

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"slices"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/httpx"
	"github.com/O-Mario88/maple-online-School/api/internal/identity"
)

const (
	maxFilter  = 120
	maxName    = 120
	maxLevel   = 40
	maxContact = 120
	maxMessage = 2000
	// writeLimit caps saves and applications per client per minute.
	writeLimit = 60
)

// categories the directory can filter by on the server. "Near me" needs the
// learner's location, which Maple doesn't collect.
var categories = []string{"top", "online", "boarding", "scholarships"}

// Store is what the handler needs from the database.
type Store interface {
	List(ctx context.Context, f Filters, limit, offset int32) ([]Profile, int64, error)
	Profile(ctx context.Context, school int64) (Profile, error)
	IsListed(ctx context.Context, school int64) (bool, error)
	RecordView(ctx context.Context, school, viewer int64) error
	Saves(ctx context.Context, user int64) ([]Save, error)
	SetSaved(ctx context.Context, user, school int64, on bool) error
	Applications(ctx context.Context, user int64) ([]Application, error)
	Start(ctx context.Context, user, school int64) (Application, bool, error)
	Submit(ctx context.Context, user, id int64, shared Shared, consent func(school string) string) (Application, error)
	LeadsSchool(ctx context.Context, user, school int64) (bool, error)
	HasProfile(ctx context.Context, school int64) (bool, error)
	Totals(ctx context.Context, school int64) (Totals, error)
}

type Handler struct {
	store       Store
	requireUser func(http.Handler) http.Handler
}

func NewHandler(store Store, requireUser func(http.Handler) http.Handler) *Handler {
	return &Handler{store: store, requireUser: requireUser}
}

// Mount registers the routes. Everything needs a signed-in user.
func (h *Handler) Mount(r chi.Router) {
	r.Group(func(r chi.Router) {
		r.Use(h.requireUser)
		r.Get("/api/v1/network/schools/", h.list)
		r.Get("/api/v1/network/schools/{id}/", h.profile)
		r.Get("/api/v1/network/schools/{id}/insights/", h.insights)
		r.Get("/api/v1/network/saves/", h.saves)
		r.Get("/api/v1/network/applications/", h.applications)
		r.Group(func(r chi.Router) {
			r.Use(httpx.RateLimit(writeLimit, time.Minute))
			r.Put("/api/v1/network/schools/{id}/save/", h.save(true))
			r.Delete("/api/v1/network/schools/{id}/save/", h.save(false))
			r.Post("/api/v1/network/schools/{id}/applications/", h.start)
			r.Post("/api/v1/network/applications/{id}/submit/", h.submit)
		})
	})
}

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	f := Filters{
		Query: strings.TrimSpace(q.Get("q")), District: q.Get("district"), Curriculum: q.Get("curriculum"),
		Level: q.Get("level"), Category: q.Get("category"),
	}
	if f.Category == "all" {
		f.Category = ""
	}
	if f.Category != "" && !slices.Contains(categories, f.Category) {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "Category must be all, top, online, boarding or scholarships.")
		return
	}
	for _, v := range []string{f.Query, f.District, f.Curriculum, f.Level} {
		if utf8.RuneCountInString(v) > maxFilter {
			httpx.WriteError(w, http.StatusBadRequest, "invalid", "Search words and filters can be up to 120 characters.")
			return
		}
	}
	page := httpx.ParsePage(r)
	schools, total, err := h.store.List(r.Context(), f, page.Limit, page.Offset)
	if err != nil {
		serverError(w, "list schools", err)
		return
	}
	httpx.WritePage(w, r, page, total, schools)
}

func (h *Handler) profile(w http.ResponseWriter, r *http.Request) {
	user := identity.UserFrom(r.Context())
	id := pathID(r)
	p, err := h.store.Profile(r.Context(), id)
	if errors.Is(err, ErrNotFound) {
		notFound(w)
		return
	}
	if err != nil {
		serverError(w, "load school", err)
		return
	}
	// Counting the view must not fail the page.
	if err := h.store.RecordView(r.Context(), id, user.ID); err != nil {
		slog.Warn("network: record view", "err", err)
	}
	httpx.WriteJSON(w, http.StatusOK, p)
}

func (h *Handler) saves(w http.ResponseWriter, r *http.Request) {
	list, err := h.store.Saves(r.Context(), identity.UserFrom(r.Context()).ID)
	if err != nil {
		serverError(w, "list saves", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"count": len(list), "results": list})
}

func (h *Handler) save(on bool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, ok := h.listedSchool(w, r)
		if !ok {
			return
		}
		if err := h.store.SetSaved(r.Context(), identity.UserFrom(r.Context()).ID, id, on); err != nil {
			serverError(w, "save school", err)
			return
		}
		httpx.WriteJSON(w, http.StatusOK, map[string]any{"school": id, "saved": on})
	}
}

func (h *Handler) applications(w http.ResponseWriter, r *http.Request) {
	list, err := h.store.Applications(r.Context(), identity.UserFrom(r.Context()).ID)
	if err != nil {
		serverError(w, "list applications", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"count": len(list), "results": list})
}

func (h *Handler) start(w http.ResponseWriter, r *http.Request) {
	id, ok := h.listedSchool(w, r)
	if !ok {
		return
	}
	app, created, err := h.store.Start(r.Context(), identity.UserFrom(r.Context()).ID, id)
	if err != nil {
		serverError(w, "start application", err)
		return
	}
	code := http.StatusOK
	if created {
		code = http.StatusCreated
	}
	httpx.WriteJSON(w, code, app)
}

type submitRequest struct {
	Consent         bool   `json:"consent"`
	ApplicantName   string `json:"applicant_name"`
	Level           string `json:"level"`
	Contact         string `json:"contact"`
	GuardianName    string `json:"guardian_name"`
	GuardianContact string `json:"guardian_contact"`
	Message         string `json:"message"`
}

// shared checks a submission and keeps only what the user filled in.
func (req submitRequest) shared() (Shared, string) {
	s := Shared{
		ApplicantName: strings.TrimSpace(req.ApplicantName), Level: strings.TrimSpace(req.Level), Contact: strings.TrimSpace(req.Contact),
		GuardianName: strings.TrimSpace(req.GuardianName), GuardianContact: strings.TrimSpace(req.GuardianContact), Message: strings.TrimSpace(req.Message),
	}
	switch {
	case !req.Consent:
		return s, "Tick the box to agree to share these details with the school."
	case s.ApplicantName == "" || s.Level == "" || s.Contact == "":
		return s, "Your name, level and a phone number or email are needed."
	case tooLong(s.ApplicantName, maxName) || tooLong(s.GuardianName, maxName) || tooLong(s.Level, maxLevel) ||
		tooLong(s.Contact, maxContact) || tooLong(s.GuardianContact, maxContact):
		return s, "Names and contacts can be up to 120 characters, the level up to 40."
	case tooLong(s.Message, maxMessage):
		return s, "The message can be up to 2,000 characters."
	}
	return s, ""
}

func tooLong(s string, n int) bool { return utf8.RuneCountInString(s) > n }

// consentText is what the applicant agrees to, stored with the application.
func consentText(school string) string {
	return "I agree to share the details in this application with " + school + " so they can consider it. Nothing else from my Maple account is shared."
}

func (h *Handler) submit(w http.ResponseWriter, r *http.Request) {
	var req submitRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", err.Error())
		return
	}
	shared, problem := req.shared()
	if problem != "" {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", problem)
		return
	}
	app, err := h.store.Submit(r.Context(), identity.UserFrom(r.Context()).ID, pathID(r), shared, consentText)
	switch {
	case errors.Is(err, ErrNotFound):
		notFound(w)
	case errors.Is(err, ErrSubmitted):
		httpx.WriteError(w, http.StatusConflict, "submitted", "This application has already been sent.")
	case err != nil:
		serverError(w, "submit application", err)
	default:
		httpx.WriteJSON(w, http.StatusOK, app)
	}
}

// insights gives a school's own leaders totals only, each hidden below MinCohort.
func (h *Handler) insights(w http.ResponseWriter, r *http.Request) {
	id := pathID(r)
	leads, err := h.store.LeadsSchool(r.Context(), identity.UserFrom(r.Context()).ID, id)
	if err != nil {
		serverError(w, "load schools", err)
		return
	}
	if !leads {
		httpx.WriteError(w, http.StatusForbidden, "permission_denied", "Only this school's leaders can see its School Network figures.")
		return
	}
	has, err := h.store.HasProfile(r.Context(), id)
	if err != nil {
		serverError(w, "check profile", err)
		return
	}
	if !has {
		notFound(w)
		return
	}
	totals, err := h.store.Totals(r.Context(), id)
	if err != nil {
		serverError(w, "load totals", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"school": id, "min_cohort": MinCohort, "totals": totals})
}

// listedSchool reads {id} and checks learners can act on that school.
func (h *Handler) listedSchool(w http.ResponseWriter, r *http.Request) (int64, bool) {
	id := pathID(r)
	ok, err := h.store.IsListed(r.Context(), id)
	if err != nil {
		serverError(w, "check school", err)
		return 0, false
	}
	if !ok {
		notFound(w)
		return 0, false
	}
	return id, true
}

func pathID(r *http.Request) int64 {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	return id
}

func notFound(w http.ResponseWriter) {
	httpx.WriteError(w, http.StatusNotFound, "not_found", "Not found.")
}

func serverError(w http.ResponseWriter, action string, err error) {
	slog.Error("network: "+action, "err", err)
	httpx.WriteError(w, http.StatusInternalServerError, "server_error", "Something went wrong. Please try again.")
}
