package timetable

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/O-Mario88/maple-online-School/api/internal/httpx"
	"github.com/O-Mario88/maple-online-School/api/internal/identity"
	"github.com/O-Mario88/maple-online-School/api/internal/roles"
)

const (
	maxName     = 100
	maxCapacity = 5_000
	maxTermDays = 400
)

// Store is what the handler needs from the database.
type Store interface {
	SchoolsWithRoles(ctx context.Context, userID int64, rs []string) ([]int64, error)
	ClassSchool(ctx context.Context, classID int64) (int64, int64, error)
	Terms(ctx context.Context, schools []int64) ([]Term, error)
	CreateTerm(ctx context.Context, school int64, name string, start, end time.Time, active bool) (Term, error)
	Rooms(ctx context.Context, schools []int64) ([]Room, error)
	CreateRoom(ctx context.Context, school int64, name string, capacity int32) (Room, error)
	Slots(ctx context.Context, leader []int64, viewer int64, learners []int64, f SlotFilter) ([]Slot, error)
	AddSlot(ctx context.Context, in NewSlot) (int64, []Clash, error)
	SlotSchool(ctx context.Context, id int64) (int64, error)
	RemoveSlot(ctx context.Context, id int64) error
}

// Handler serves /api/v1/scheduling/{terms,rooms,timetable}/.
type Handler struct {
	store       Store
	family      identity.ProfileReader
	requireUser func(http.Handler) http.Handler
}

func NewHandler(store Store, family identity.ProfileReader, requireUser func(http.Handler) http.Handler) *Handler {
	return &Handler{store: store, family: family, requireUser: requireUser}
}

// Mount registers the routes; other methods on these paths get 405.
func (h *Handler) Mount(r chi.Router) {
	r.Group(func(r chi.Router) {
		r.Use(h.requireUser)
		r.Get("/api/v1/scheduling/terms/", h.listTerms)
		r.Post("/api/v1/scheduling/terms/", h.createTerm)
		r.Get("/api/v1/scheduling/rooms/", h.listRooms)
		r.Post("/api/v1/scheduling/rooms/", h.createRoom)
		r.Get("/api/v1/scheduling/timetable/", h.listSlots)
		r.Post("/api/v1/scheduling/timetable/", h.addSlot)
		r.Delete("/api/v1/scheduling/timetable/{id}/", h.removeSlot)
	})
	for _, p := range []string{"/api/v1/scheduling/terms/", "/api/v1/scheduling/rooms/", "/api/v1/scheduling/timetable/"} {
		r.HandleFunc(p+"*", func(w http.ResponseWriter, _ *http.Request) {
			httpx.WriteError(w, http.StatusMethodNotAllowed, "method_not_allowed", "This action isn't available.")
		})
	}
}

type viewer struct {
	id                       int64
	leader, staff, community []int64
	learners                 []int64
}

func (h *Handler) viewer(w http.ResponseWriter, r *http.Request) (viewer, bool) {
	user := identity.UserFrom(r.Context())
	v := viewer{id: user.ID, learners: []int64{}}
	var err error
	if v.leader, err = h.store.SchoolsWithRoles(r.Context(), user.ID, roles.Leaders); err == nil {
		if v.staff, err = h.store.SchoolsWithRoles(r.Context(), user.ID, roles.Staff); err == nil {
			v.community, err = h.store.SchoolsWithRoles(r.Context(), user.ID, append(append([]string{}, roles.Staff...), "student", "parent"))
		}
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

// leaderSchool picks the school a leader is acting for: the one named, or
// their only school. It writes 403/400 itself.
func leaderSchool(w http.ResponseWriter, v viewer, requested int64) (int64, bool) {
	switch {
	case len(v.leader) == 0 || (requested != 0 && !slices.Contains(v.leader, requested)):
		httpx.WriteError(w, http.StatusForbidden, "permission_denied", "Only school leaders can change the timetable.")
		return 0, false
	case requested != 0:
		return requested, true
	case len(v.leader) == 1:
		return v.leader[0], true
	default:
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "Say which school (institution) this is for.")
		return 0, false
	}
}

// ---- terms and rooms -------------------------------------------------------------

func (h *Handler) listTerms(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	terms, err := h.store.Terms(r.Context(), v.community)
	if err != nil {
		serverError(w, "list terms", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"count": len(terms), "results": terms})
}

type termRequest struct {
	Institution int64  `json:"institution"`
	Name        string `json:"name"`
	StartDate   string `json:"start_date"`
	EndDate     string `json:"end_date"`
	IsActive    bool   `json:"is_active"`
}

func (h *Handler) createTerm(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	var req termRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", err.Error())
		return
	}
	school, ok := leaderSchool(w, v, req.Institution)
	if !ok {
		return
	}
	name := strings.TrimSpace(req.Name)
	start, errS := time.Parse(time.DateOnly, req.StartDate)
	end, errE := time.Parse(time.DateOnly, req.EndDate)
	switch {
	case name == "" || len(name) > maxName:
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "A term name of up to 100 characters is required.")
		return
	case errS != nil || errE != nil || !end.After(start) || end.Sub(start) > maxTermDays*24*time.Hour:
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "Dates must look like 2027-02-01, and the term must end after it starts.")
		return
	}
	term, err := h.store.CreateTerm(r.Context(), school, name, start, end, req.IsActive)
	if errors.Is(err, ErrDuplicate) {
		httpx.WriteError(w, http.StatusConflict, "duplicate", "This school already has a term with that name.")
		return
	}
	if err != nil {
		serverError(w, "create term", err)
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, term)
}

func (h *Handler) listRooms(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	rooms, err := h.store.Rooms(r.Context(), v.staff)
	if err != nil {
		serverError(w, "list rooms", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"count": len(rooms), "results": rooms})
}

type roomRequest struct {
	Institution int64  `json:"institution"`
	Name        string `json:"name"`
	Capacity    int32  `json:"capacity"`
}

func (h *Handler) createRoom(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	var req roomRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", err.Error())
		return
	}
	school, ok := leaderSchool(w, v, req.Institution)
	if !ok {
		return
	}
	name := strings.TrimSpace(req.Name)
	if name == "" || len(name) > maxName || req.Capacity < 1 || req.Capacity > maxCapacity {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "A room name and a capacity from 1 to 5,000 are required.")
		return
	}
	room, err := h.store.CreateRoom(r.Context(), school, name, req.Capacity)
	if errors.Is(err, ErrDuplicate) {
		httpx.WriteError(w, http.StatusConflict, "duplicate", "This school already has a room with that name.")
		return
	}
	if err != nil {
		serverError(w, "create room", err)
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, room)
}

// ---- slots -------------------------------------------------------------------------

func (h *Handler) listSlots(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	q := r.URL.Query()
	f := SlotFilter{Term: queryID(q.Get("term")), Class: queryID(q.Get("class"))}
	if d, err := strconv.Atoi(q.Get("day")); err == nil && d >= 0 && d <= 6 {
		day := int32(d)
		f.Day = &day
	}
	slots, err := h.store.Slots(r.Context(), v.leader, v.id, v.learners, f)
	if err != nil {
		serverError(w, "list slots", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]any{"count": len(slots), "results": slots})
}

type slotRequest struct {
	Class     int64  `json:"class"`
	Term      int64  `json:"term"`
	DayOfWeek *int32 `json:"day_of_week"`
	StartTime string `json:"start_time"`
	EndTime   string `json:"end_time"`
	Room      *int64 `json:"room"`
	Teacher   *int64 `json:"teacher"`
}

func (h *Handler) addSlot(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	var req slotRequest
	if err := httpx.DecodeJSON(r, &req); err != nil || req.Class <= 0 {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "Choose a class, a day and the start and end times.")
		return
	}
	school, classTeacher, err := h.store.ClassSchool(r.Context(), req.Class)
	if errors.Is(err, ErrNotFound) || (err == nil && !slices.Contains(v.leader, school)) {
		httpx.WriteError(w, http.StatusForbidden, "permission_denied", "Only school leaders can change the timetable.")
		return
	}
	if err != nil {
		serverError(w, "load class", err)
		return
	}
	start, okS := parseClock(req.StartTime)
	end, okE := parseClock(req.EndTime)
	if req.DayOfWeek == nil || *req.DayOfWeek < 0 || *req.DayOfWeek > 6 || !okS || !okE || end <= start || req.Term <= 0 {
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "Choose a term, a day (0 = Monday) and times like 08:00, ending after they start.")
		return
	}
	teacher := req.Teacher
	if teacher == nil {
		teacher = &classTeacher
	}
	id, clashes, err := h.store.AddSlot(r.Context(), NewSlot{
		School: school, Term: req.Term, Class: req.Class, Day: *req.DayOfWeek, Start: start, End: end, Room: req.Room, Teacher: teacher,
	})
	switch {
	case errors.Is(err, ErrBadTerm), errors.Is(err, ErrBadRoom), errors.Is(err, ErrBadTeacher):
		httpx.WriteError(w, http.StatusBadRequest, "invalid", "The term, room and teacher must all belong to this school.")
	case err != nil:
		serverError(w, "add slot", err)
	case len(clashes) > 0:
		httpx.WriteJSON(w, http.StatusConflict, map[string]any{
			"code": "clash", "detail": "This lesson clashes with the timetable: " + clashes[0].Reason + ".", "clashes": clashes,
		})
	default:
		slots, err := h.store.Slots(r.Context(), v.leader, v.id, nil, SlotFilter{Class: &req.Class})
		if err != nil {
			serverError(w, "reload slot", err)
			return
		}
		for _, s := range slots {
			if s.ID == id {
				httpx.WriteJSON(w, http.StatusCreated, s)
				return
			}
		}
		httpx.WriteJSON(w, http.StatusCreated, map[string]any{"id": id})
	}
}

func (h *Handler) removeSlot(w http.ResponseWriter, r *http.Request) {
	v, ok := h.viewer(w, r)
	if !ok {
		return
	}
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	school, err := h.store.SlotSchool(r.Context(), id)
	if errors.Is(err, ErrNotFound) || (err == nil && !slices.Contains(v.leader, school)) {
		httpx.WriteError(w, http.StatusNotFound, "not_found", "Not found.")
		return
	}
	if err != nil {
		serverError(w, "load slot", err)
		return
	}
	if err := h.store.RemoveSlot(r.Context(), id); err != nil {
		serverError(w, "remove slot", err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// parseClock reads "HH:MM" into minutes since midnight.
func parseClock(s string) (int, bool) {
	t, err := time.Parse("15:04", strings.TrimSpace(s))
	if err != nil {
		return 0, false
	}
	return t.Hour()*60 + t.Minute(), true
}

func queryID(s string) *int64 {
	id, err := strconv.ParseInt(s, 10, 64)
	if err != nil || id <= 0 {
		return nil
	}
	return &id
}

func serverError(w http.ResponseWriter, action string, err error) {
	slog.Error("timetable: "+action, "err", err)
	httpx.WriteError(w, http.StatusInternalServerError, "server_error", "Something went wrong. Please try again.")
}
