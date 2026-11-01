# Feature Audit — Maple Online School

> **Run date:** 2026-04-23.
> **Branch under test:** `main` @ commit after PR #11 (pilot kit merged).
> **Scope:** all 82 registered backend endpoints, all 35 routed frontend pages, every API call site in `src/`, every permission gate, production build bundle.
> **Method:** static scanners (`scripts/audit.py`) + dynamic probes (`scripts/audit_backend_probe.py`, Playwright `audit-crawl.spec.ts`) against a local Django + Vite stack with a freshly-registered teacher's JWT.
> **Artefacts:** `docs/audit/static.json`, `docs/audit/backend_probe.json`, `docs/audit/frontend_probe.json`.
>
> **This doc is an audit, not a fix list.** The fixes live in `docs/audit/FIX_PLAN.md`.

---

## 1. Topline counts

| Dimension | Number | Notes |
|---|---|---|
| Frontend routes | 35 crawled, 65 declared | 30 are nested or conditional; crawler hit the 35 top-level ones |
| Frontend API call sites | 116 | across 74 distinct endpoints |
| Backend DRF router endpoints | 82 | `/api/v1/<resource>/` |
| Backend `path('api/…')` endpoints | 29 | dashboards, custom views, auth |
| AllowAny views | 11 | see §4 |
| Open `.objects.all()` querysets under `IsAuthenticated` | 14 | see §4 |
| "Coming soon" toast buttons | 4 | see §3 |
| `window.alert` in prod | 1 | `PremiumGate.tsx:62` (non-admin soft landing) |
| Pages with hardcoded mock data | 3 | see §3 |
| Pages with hardcoded `http://localhost:8000` (bypass `apiClient`) | 6 | **critical** — see §3 |
| Backend endpoints returning 5xx to an authed teacher | 1 | `/api/v1/resources/` — see §2.1 |
| Backend endpoints 200 anonymous (leak) | 3 | see §2.2 |

## 2. Broken / buggy

### 2.1 500 Server Error — `/api/v1/resources/`

**Severity:** critical
**Where:** `maple_backend/apps/resources/serializers.py:21`
**Cause:** `get_author_name` calls `obj.uploaded_by.get_full_name()`, but the custom `accounts.User` model has no `get_full_name` method — it has a `full_name` field.
**Impact:** every time the frontend calls `GET /api/v1/resources/` it crashes. Any page that hits this endpoint shows a broken state to the user.
**Repro:** `curl -H 'Authorization: Bearer $TOKEN' http://127.0.0.1:8000/api/v1/resources/` → 500.
**Fix:** change line 21 to `return obj.uploaded_by.full_name or obj.uploaded_by.email`. One-line.

### 2.2 Anonymous access holes (data / action leak)

Three viewsets permit anonymous users to list, create, update, and delete rows:

| Endpoint | ViewSet | File:line |
|---|---|---|
| `/api/v1/tutoring/tutor-profiles/` | `TutorProfileViewSet` | `apps/tutoring/views.py:24–27` |
| `/api/v1/tutoring/bounties/` | `TutoringBountyViewSet` | `apps/tutoring/views.py:30–32` |
| `/api/v1/live-sessions/missed-recovery/` | `MissedSessionRecoveryViewSet` | `apps/live_sessions/views.py:107–110` |

**Severity:** critical for the session-recovery and tutoring-bounty writes (unauthenticated POST/PUT/DELETE is possible); medium for the read side (tutor profiles are listed publicly, so it might be intentional marketplace discovery).
**Impact:** anyone on the internet can create, edit, or delete tutoring bounties and missed-session recovery records without logging in.
**Fix:** replace `[AllowAny]` with `[IsAuthenticated]` on all three. If public browse is desired for tutor profiles, use a granular `IsAuthenticatedOrReadOnly`.

### 2.3 Frontend hardcoded backend URLs (ignores env config)

Six pages bypass `apiClient` and hit `http://localhost:8000/...` directly. In production these pages will always call a URL that doesn't exist.

| File:line | Endpoint hit |
|---|---|
| `src/pages/HomePage.tsx:51` | `/api/v1/curriculum/full-tree/` |
| `src/pages/PublicProfile.tsx:28` | `/api/v1/users/profile/{username}/` |
| `src/pages/PeerTutoringHub.tsx:23` | `/api/v1/tutoring/dashboard/` |
| `src/pages/primary/PrimaryParentDashboard.tsx:44` | `/api/v1/analytics/primary-parent-dashboard/` |
| `src/pages/primary/PrimaryStudentDashboard.tsx:41` | `/api/v1/analytics/primary-student-dashboard/` |
| `src/pages/ResourceDiscoveryPage.tsx:122` | `/{resource.file_path}` (asset URL) |

**Severity:** critical.
**Impact:** 5 pages entirely non-functional whenever the backend isn't at `localhost:8000` (Docker, prod, any remote host).
**Fix:** replace each `fetch('http://localhost:8000/...')` with `apiClient.get('/...')` (relative path — `apiClient` prefixes `VITE_API_BASE_URL`). For the asset URL in `ResourceDiscoveryPage.tsx`, build it with `API_BASE_URL` from `apiClient` module.

### 2.4 PaymentPage render crash

**Severity:** high
**Where:** `src/pages/PaymentPage.tsx:117` — `pricingData.studentPricing.byLevel.find(...)`
**Cause:** `pricingData.studentPricing` is `undefined` when the pricing API hasn't loaded yet or returns an unexpected shape. No null guard.
**Impact:** `ErrorBoundary` catches this; user sees "Something went wrong" instead of the payment page.
**Fix:** guard the `.find()` calls with optional chaining (`pricingData?.studentPricing?.byLevel?.find(...)`) and return a sensible default when data isn't ready.

### 2.5 MarketplacePage render crash on cold backend

**Severity:** medium
**Where:** `src/pages/MarketplacePage.tsx:33` — `(res.data as any).map(...)`
**Cause:** when the backend returns an error, `res.data` is `null`. The cast-to-any hides the possibility.
**Impact:** marketplace page crashes entirely when subjects endpoint fails.
**Fix:** `(res.data ?? []).map(...)` and show an empty state.

### 2.6 Backend logout not implemented

**Observation:** the frontend's `logoutUser()` clears localStorage but the backend has no token-blacklist endpoint wired (SimpleJWT's built-in blacklist exists but isn't exposed). Result: a stolen refresh token stays valid for 7 days.
**Severity:** medium — not a leak today because the blacklist machinery IS enabled in settings (`BLACKLIST_AFTER_ROTATION=True`), just not triggered on logout.
**Fix:** expose `TokenBlacklistView` at `/api/v1/auth/token/blacklist/`, have the frontend POST to it on logout.

## 3. Stub, mock, and "coming soon" UI

### 3.1 Dead buttons that just show a toast

| File:line | Button | Current behavior |
|---|---|---|
| `src/pages/TeacherLessonStudio.tsx:106` | "New Lesson" | `toast.info('Lesson creation wizard coming soon…')` |
| `src/pages/TeacherLessonStudio.tsx:216` | Quiz creator CTA | `toast.info('Quiz creator coming soon…')` |
| `src/pages/primary/P7ReadinessDashboard.tsx:429` | CSV/XLSX upload | `toast.info('File picker coming soon…')` |
| `src/components/dashboard/WhatsAppCommunicationHub.tsx:164` | Paperclip attachment | `toast.info('File attachments coming soon.')` |

These are honest about being unimplemented, which is better than hiding it — but they should either be hidden until shipped or labelled "preview" in the UI.

### 3.2 Pages rendering fake data even when hooked to a backend

| Page | File | Mock arrays | Fake setTimeout loaders |
|---|---|---|---|
| `ExercisePage` | `src/pages/ExercisePage.tsx` | in-file `mockResource` | 2 |
| `LearningPathPage` | `src/pages/LearningPathPage.tsx` | 3 | 1 |
| `ProjectsPage` | `src/pages/ProjectsPage.tsx` | 3 | 1 |

These are routed pages that show hardcoded content regardless of what the backend returns.

### 3.3 Routes with no real content

From the Playwright crawl, these routes render but show only scaffolding / mock content:

- `/exam-registration` — mock setTimeout data (in `ExamRegistrationPage.tsx`)
- `/learning-path` — 3 hardcoded `mock*` arrays
- `/projects`, `/projects/:id` — no backend `projects` app exists
- `/t/:username` — `TeacherStorefront` renders a hardcoded profile
- `/primary` landing, `/primary/class/:classId` — `DEFAULT_STATS` / local curriculum helpers

### 3.4 `window.alert` in `PremiumGate.tsx`

**Where:** `src/components/ui/PremiumGate.tsx:62`
**Issue:** `window.alert` is the wrong UX for a modern SPA — blocking, can't be styled, feels like a crash. Should be a `toast` or an inline message.
**Severity:** low.

## 4. Auth model — intentional vs questionable `AllowAny`

| Endpoint | ViewSet | Verdict |
|---|---|---|
| `POST /api/v1/auth/register/` | `UserRegistrationView` | **intentional** (pre-auth flow, 20/hr throttle) |
| `POST /api/v1/auth/onboard-student/` | `StudentOnboardingAPIView` | **intentional** (pre-auth flow, 20/hr throttle) |
| `POST /api/v1/auth/forgot-password/` | `ForgotPasswordView` | **intentional** |
| `POST /api/v1/auth/activate/` | `AccountActivationView` | **intentional** |
| `GET /api/v1/users/profile/<username>/` | `PublicProfileView` | **intentional** (public profile by design) |
| `GET /api/health/` | `HealthView` | **intentional** (monitoring) |
| `POST /api/v1/institutions/onboarding/` | `InstitutionOnboardingAPIView` | **intentional** (pre-auth wizard) |
| `POST /api/v1/marketplace/teacher-onboarding/` | `IndependentTeacherOnboardingView` | **intentional** (pre-auth wizard) |
| `/api/v1/tutoring/tutor-profiles/` | `TutorProfileViewSet` | **HOLE** — full CRUD open |
| `/api/v1/tutoring/bounties/` | `TutoringBountyViewSet` | **HOLE** — full CRUD open |
| `/api/v1/tutoring/dashboard/` | `PeerTutoringDashboardView` | ambiguous — reads only, but exposes user reputation |
| `/api/v1/live-sessions/missed-recovery/` | `MissedSessionRecoveryViewSet` | **HOLE** — full CRUD open |

## 5. Permission scope on IsAuthenticated viewsets

14 viewsets have `get_queryset()` returning `.objects.all()` (no tenant / ownership filtering). Means any authenticated user can see everyone else's data on those endpoints.

Notable ones (from a sampling of the 14):
- `intelligence` app — many "my next best actions" type views; if they return all users' records, that's a leak.
- `resources/content_views.py` — several of these are correctly scoped further down in the class; the match is on a literal `return Model.objects.all()` line but the method may have branches above it. Needs case-by-case review.
- `analytics/views.py` — dashboards; some are role-aware, some not.
- `marketplace/views.py` — list-all listings is probably fine; list-all payout profiles is not.

Not all 14 are bugs. But each one is a candidate — none has a test that asserts "user A cannot see user B's rows". That's a **systemic gap** worth fixing with one test per viewset.

## 6. Performance

### 6.1 Production bundle

| Chunk | Uncompressed | Gzipped |
|---|---|---|
| `ui-Ji1UVGOn.js` (Radix UI) | 510 KB | 129 KB |
| `index-c2XDKYbH.js` (app root) | 355 KB | 108 KB |
| `vendor-CCy5THMl.js` (React + router + recharts + framer) | 166 KB | 54 KB |
| `InstitutionManagementPage-*.js` | 87 KB | 21 KB |
| `ugandaPrimaryContent-*.js` (hardcoded curriculum tree) | 80 KB | 13 KB |
| `TeacherMonetizationDashboard-*.js` | 78 KB | 19 KB |
| total JS | 2.19 MB | — |
| total dist | 17 MB | — |

- **Vite warns** at the 500 KB chunk threshold; two chunks exceed (ui + index-root).
- **ugandaPrimaryContent 80 KB** is hardcoded curriculum data baked into the bundle. Move to a dynamic `import()` so it only ships when the primary dashboards mount.
- The `ui` chunk bundles every Radix primitive used anywhere. Granular imports won't shrink it much (they're already tree-shakeable); the real win is splitting pages into separate chunks so an admin doesn't download the teacher monetization view.

### 6.2 Backend latency (authed teacher, cold sqlite)

Median response times on a dev laptop with the seeded DB:

| Endpoint | p50 | Notes |
|---|---|---|
| `GET /api/v1/content/items/` | 44 ms | returns 16 items |
| `GET /api/v1/curriculum/subjects/` | 18 ms | |
| `GET /api/v1/live-sessions/live-session/` | 18 ms | |
| `GET /api/v1/marketplace/listings/` | 15 ms | |
| most other endpoints | <10 ms | |

All within acceptable ranges for dev. Real perf worries will show up on production data volume (many thousands of content items, tens of thousands of engagement rows), not this audit.

### 6.3 Frontend load times (dev, fresh Vite, no cache)

From the Playwright crawl:

| Route | Load (networkidle) |
|---|---|
| `/t/teacher1` | **6.9 s** — 404ing page keeps retrying |
| `/` | 3.2 s |
| most dashboards | 1.4–1.5 s |
| auth pages | <1 s |

Most pages settle in ~1.5 s once the backend is reachable. The outliers are pages that keep trying failed requests; fix #3 and those drop to normal.

## 7. Typecheck / lint / tests

- `tsc --noEmit -p tsconfig.app.json` → **0 errors**.
- `npm run lint` → **81 problems (32 errors, 49 warnings)**. Of the 32 errors, **29 are overly-strict ES-version rules** (`es/no-object-defineproperty` etc. — benign) from the default ESLint config. **3 are real**: 2 `no-empty` blocks (swallowed exceptions in `PaymentPage.tsx:175`, `EditorialTabs.tsx:49`), 1 `prefer-const` (`TopicDetailPage.tsx:65`).
- `npm test` (Vitest) → 13/13 passing.
- `npx playwright test` (API-layer e2e) → 6/6 passing.
- `manage.py test` → 26/26 passing.

## 8. What this audit did NOT cover

- **Semantic correctness.** Does the AI copilot give useful answers? Are grade calculations mathematically right? Out of scope for an automated audit.
- **Third-party integrations.** PesaPal, Vimeo, SMTP delivery — no credentials, no probe.
- **Mobile responsiveness.** Playwright was desktop Chrome only.
- **Accessibility.** One `aria` check was done; full WCAG audit needs axe-core.
- **Security beyond auth gates.** No SQLi / XSS / CSRF deep dive. Django + DRF defaults are reasonable but should be pen-tested before a real deploy.
- **Load testing at production scale.** `ab`/`wrk` against a single-process sqlite instance is meaningless. Do this after deploy on Postgres.
- **Every dropdown option in every modal.** 116 API call sites × N UI states = not auditable without a human clicking.
