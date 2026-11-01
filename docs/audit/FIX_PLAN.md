# FIX_PLAN.md — Sequential fix plan to deploy

> Based on findings in `docs/audit/AUDIT.md`. Ordered by **severity × blast radius**, not by effort. Every item has: what, where, why it matters, rough effort.

## Sequencing principle

1. **Stop-the-bleed fixes** land first — anything users actively hit today.
2. **Security holes** next — anything a random internet user could exploit.
3. **Blockers for deploy** after that — things that prevent real-host usage.
4. **Polish + perf** last — things that affect quality but not correctness.

Each phase should ship as its own PR. Test matrix (Django + Vitest + Playwright) must be green at the end of each.

---

## Phase 1 — Stop the bleed (critical user-visible bugs)

These are broken today. Any pilot user will hit them.

### 1.1 Fix the `resources/` endpoint 500
- **File:** `maple_backend/apps/resources/serializers.py:21`
- **Change:** `obj.uploaded_by.get_full_name()` → `obj.uploaded_by.full_name`
- **Effort:** 5 min (including a Django test that `GET /api/v1/resources/` returns 200 for a teacher)

### 1.2 Remove hardcoded `http://localhost:8000` URLs from 6 pages
- **Files:** `HomePage.tsx:51`, `PublicProfile.tsx:28`, `PeerTutoringHub.tsx:23`, `PrimaryParentDashboard.tsx:44`, `PrimaryStudentDashboard.tsx:41`, `ResourceDiscoveryPage.tsx:122`
- **Change:** each `fetch('http://localhost:8000/<path>')` → `apiClient.get('/<path>')` or similar. For `ResourceDiscoveryPage.tsx` where a file asset URL is built, import `API_BASE_URL` from `src/lib/apiClient.ts`.
- **Effort:** 30 min (6 files, mechanical change, no logic change)
- **Why this matters:** 5 pages non-functional in Docker or prod until this is fixed.

### 1.3 Guard `PaymentPage` against undefined pricing data
- **File:** `src/pages/PaymentPage.tsx:117, 122, 127`
- **Change:** add optional chaining + `??` defaults so the page renders a "Loading pricing…" state instead of crashing.
- **Effort:** 15 min

### 1.4 Guard `MarketplacePage` against null response
- **File:** `src/pages/MarketplacePage.tsx:33`
- **Change:** `(res.data ?? []).map(...)`
- **Effort:** 5 min

### 1.5 Empty-catch / prefer-const ESLint errors
- **Files:** `PaymentPage.tsx:175`, `EditorialTabs.tsx:49`, `TopicDetailPage.tsx:65`
- **Change:** add a comment explaining intentional swallow, or log; make `found` a `const`.
- **Effort:** 5 min

**Phase 1 exit gate:** Playwright audit-crawl shows 0 routes with 5xx / console errors that point to any of the above. Ship as one PR.

---

## Phase 2 — Security (close auth holes)

### 2.1 Gate the three AllowAny tutoring / recovery viewsets
- **Files:**
  - `maple_backend/apps/tutoring/views.py:24, 30, 50` — `TutorProfileViewSet`, `TutoringBountyViewSet`, `PeerTutoringDashboardView`
  - `maple_backend/apps/live_sessions/views.py:107` — `MissedSessionRecoveryViewSet`
- **Change:** `[AllowAny]` → `[IsAuthenticated]` (keep `PeerTutoringDashboardView` as `IsAuthenticated` — a user's reputation isn't public).
- **Add tests:** one per viewset asserting anonymous = 401.
- **Effort:** 30 min

### 2.2 Expose token-blacklist on logout
- **File:** `maple_backend/maple_core/urls.py`
- **Change:** add `path('api/v1/auth/token/blacklist/', TokenBlacklistView.as_view())` from `rest_framework_simplejwt.views`; update `src/lib/apiClient.ts::logoutUser` to POST the stored refresh token to it before clearing localStorage.
- **Effort:** 30 min (incl. one test)

### 2.3 Per-viewset tenant test (sampling)
For the 14 viewsets with open `.objects.all()` querysets, write one test each that asserts user A cannot see user B's rows. Don't rewrite the views yet; just codify the current behavior so we know which are bugs and which are intentional "marketplace is public" cases.
- **Effort:** 2–3 hours (14 tests)
- **Outcome:** a list of "actual leaks to fix" as a follow-up.

**Phase 2 exit gate:** `manage.py check --deploy` clean; the 3 known AllowAny holes returning 401 anonymous.

---

## Phase 3 — Stub removal (UI honesty)

Either implement or delete.

### 3.1 Kill "coming soon" toasts that aren't coming soon
Four buttons toast `coming soon` and do nothing:

| Button | File |
|---|---|
| Lesson Studio "New Lesson" | `TeacherLessonStudio.tsx:106` |
| Lesson Studio Quiz creator | `TeacherLessonStudio.tsx:216` |
| P7 readiness CSV upload | `P7ReadinessDashboard.tsx:429` |
| WhatsApp paperclip | `WhatsAppCommunicationHub.tsx:164` |

**Decision per button:**
- "New Lesson" — we don't have a lesson creation UI, but we have `TeacherQuickAssignment` that does the core job. Either wire this button to open that component, or hide the button.
- Quiz creator — no quiz-specific UI exists. Hide the button until someone needs it.
- P7 CSV upload — there's a real `OfflineResultUpload` page; point the button there.
- WhatsApp paperclip — hide until file attachments are real.

**Effort:** 1 hour across the four.

### 3.2 Replace `window.alert` in `PremiumGate.tsx`
- **File:** `src/components/ui/PremiumGate.tsx:62`
- **Change:** `toast.error('Your institution has not unlocked this feature. Please contact your administrator.')`.
- **Effort:** 5 min

### 3.3 Decide on stub pages (ExercisePage, LearningPathPage, ProjectsPage)
Three pages render entirely mock content. Either:
- Build the real backend they'd consume (not in scope — separate feature roadmap), **or**
- Hide their routes from the navbar until they're real, and mark them "coming soon" on the page body instead of pretending with fake data.

**Effort:** 30 min to hide + label.

**Phase 3 exit gate:** no button in the app toasts "coming soon" unprompted.

---

## Phase 4 — Deploy blockers

### 4.1 Docker stack end-to-end smoke
- **Goal:** confirm `docker compose up --build` on a clean machine brings the whole stack to a working state.
- **Do:** run `docker compose up` locally; register, log in, publish a note, submit an assignment via the Dockerized stack. Fix anything that breaks.
- **Effort:** 1 hour (assuming nothing breaks; add hours as needed)

### 4.2 Secrets + env checklist for the chosen host
- `DJANGO_SECRET_KEY` generated
- `DJANGO_ALLOWED_HOSTS` set to real domain
- `DJANGO_CORS_ORIGINS` set to real domain
- `DATABASE_URL` (Postgres)
- `REQUIRE_EMAIL_VERIFICATION=true` once SMTP is ready
- SMTP env vars (`DJANGO_EMAIL_*`) from chosen provider (Postmark / SendGrid / Resend)
- `FRONTEND_BASE_URL` matches prod URL
- **Effort:** 30 min — mostly paperwork

### 4.3 Choose and configure a host
Options (in order of friction):
- **Fly.io** — great Django support, $5/mo baseline, easy Postgres add-on
- **Railway** — simpler onboarding, $5/mo, Postgres included
- **Render** — very similar to Railway, solid docs
- **DigitalOcean App Platform** — more work, more control

Any of the four would work. Pick based on where your money currently lives and how much config vs convenience you want. **Effort:** 2 hours including first deploy.

### 4.4 Error tracking (Sentry or equivalent)
- Free tier fine for pilot. Add `sentry-sdk` to backend, `@sentry/react` to frontend.
- **Effort:** 30 min

### 4.5 Real SMTP provider
- Postmark is the simplest for transactional email; free tier is generous.
- Verify the activation email actually arrives at a real inbox.
- **Effort:** 30 min

### 4.6 Backup job on the DB
- Hosts usually offer this as a one-click. Do it.
- **Effort:** 15 min

**Phase 4 exit gate:** a teammate or friend can open the URL you give them, register, and use the platform without you being online.

---

## Phase 5 — Perf + polish

Once Phases 1–4 are done, these compound small wins.

### 5.1 Dynamic-import the `ugandaPrimaryContent` blob (80 KB)
- **Change:** the hardcoded curriculum tree in `src/data/mockCurriculum.ts` should load via `import()` only when a primary page mounts.
- **Effort:** 30 min

### 5.2 Split the UI chunk
- **Change:** `build.rollupOptions.output.manualChunks` in `vite.config.ts` to group Radix primitives differently so not every page loads all of `ui-*.js`.
- **Effort:** 1 hour

### 5.3 Pagination / infinite scroll on content list
- **Concern:** when `ContentItem` table grows past a few thousand, `GET /api/v1/content/items/` will be slow. Current default is 20 per page (from `PAGE_SIZE`); frontend paginates correctly already. Just verify under seeded load.
- **Effort:** observation only for now.

### 5.4 `any` sweep (KNOWN_ISSUES #1)
- Work through the concentric-ring pass: `src/lib/*.ts` types first, then hooks, then pages. One PR per module.
- **Effort:** 3–6 hours total, spread across many small PRs during normal feature work.

### 5.5 Rename to Maple
- Repo rename + npm package name + any remaining user-facing "Maple" strings.
- **Effort:** 30 min
- **Do when:** there's an actual user who's been told the product is called Maple.

---

## Fast-path (do-right-now) checklist

If you want to actually ship a pilot this week, here's the minimum:

```
Phase 1.1    fix /resources/ 500                        5 min
Phase 1.2    remove hardcoded localhost URLs           30 min
Phase 1.3    guard PaymentPage                         15 min
Phase 1.4    guard MarketplacePage                      5 min
Phase 2.1    close 3 AllowAny holes                    30 min
Phase 3.2    swap window.alert for toast                5 min
Phase 4.1    docker compose smoke                     1 hour
Phase 4.2-4  deploy + Sentry + SMTP                   3 hours
───────────────────────────────────────────────────────
                                         ~5.5 hours focused work
```

After that: run `seed_pilot`, send the 5 invitations, watch the feedback log.
