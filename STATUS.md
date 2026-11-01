# STATUS.md — Single source of truth

> This file is the **only** authoritative inventory of what exists in the Maple Online School platform.
> It supersedes every `PHASE_*.md`, `*_AUDIT*.md`, `*_TESTING_*.md`, and other report file that used to live at the repo root.
> Those files are stale marketing; this file is reality.
>
> **Last verified:** 2026-04-22 (Phase 0.1 inventory).
> **How to maintain:** when you ship a slice, flip the row. When a feature is cut, delete the row. Do not add a row for a feature that doesn't have running code.

## Legend

**Frontend**
- `live` — page is routed, calls a real backend API, and renders data from the response.
- `stub` — page is routed (or imported by a routed page) but renders hardcoded/mock data.
- `dead` — file exists but is not referenced by any router or parent; unreachable.

**Backend**
- `live` — app is in `INSTALLED_APPS`, has models + views + serializers, URLs are wired into `maple_core/urls.py`, and migrations exist.
- `skeleton` — models only; views missing, stubbed, or not reachable over HTTP.
- `empty` — scaffolding only, no substantive code.
- `—` — no backend exists for this feature.

**End-to-end (E2E)**
- `verified` — a human has driven this flow in a browser against a freshly-seeded DB, start to finish, and it worked. No mocks in the path.
- `api-verified` — the backend path is covered by an automated test (`manage.py test`). Frontend-to-backend in a browser is still untested.
- `unverified` — frontend and backend both exist but nobody has proven the wire between them. **Default state for everything.**
- `broken` — has been tried and does not work. Needs fixing.
- `n/a` — one side is missing; E2E not possible.

---

## Feature matrix

| Feature | Frontend | Backend | E2E | Notes |
|---|---|---|---|---|
| **Auth — Login** | live ([LoginPage.tsx](src/pages/LoginPage.tsx)) | live (`accounts`) | **api-verified** | JWT roundtrip covered by `accounts.tests.StudentSliceTests`; browser path still unverified |
| **Auth — Register** | live ([RegisterPage.tsx](src/pages/RegisterPage.tsx)) | live (`accounts`) | **api-verified** | Student path covered by `StudentSliceTests`. Still `AllowAny` — see [KNOWN_ISSUES #5](docs/KNOWN_ISSUES.md) |
| **Auth — Forgot password** | live ([ForgotPasswordPage.tsx](src/pages/ForgotPasswordPage.tsx)) | live (`accounts`) | unverified | Verify email delivery is actually configured |
| **Student onboarding** | live (via Register flow) | live (`accounts` — `StudentOnboardingAPIView`) | unverified | `AllowAny` endpoint; validate phone/email guard rails |
| **Independent teacher onboarding** | live ([IndependentTeacherWizard.tsx](src/pages/IndependentTeacherWizard.tsx)) | live (`accounts`) | unverified | |
| **Institution onboarding** | live ([InstitutionWizard.tsx](src/pages/InstitutionWizard.tsx)) | live (`institutions`) | unverified | Recent work per git log |
| **Homepage / landing** | live ([HomePage.tsx](src/pages/HomePage.tsx)) | live (`curriculum` stats) | unverified | |
| **About page** | stub ([AboutUsPage.tsx](src/pages/AboutUsPage.tsx)) | — | n/a | Static marketing — fine as stub |
| **Student dashboard** | live ([StudentDashboard.tsx](src/pages/StudentDashboard.tsx)) | live (`analytics`, `classes`) | unverified | |
| **Teacher dashboard** | live ([TeacherDashboard.tsx](src/pages/TeacherDashboard.tsx)) | live (`lessons`, `classes`) | unverified | |
| **Parent dashboard** | live ([ParentDashboard.tsx](src/pages/ParentDashboard.tsx)) | live (`parent_portal`) | unverified | |
| **Admin dashboard** | live ([AdminDashboard.tsx](src/pages/AdminDashboard.tsx)) | live (`analytics`, `intelligence`) | unverified | |
| **Primary — class landing** | stub ([PrimaryClassLanding.tsx](src/pages/primary/PrimaryClassLanding.tsx)) | live (`curriculum`) | unverified | `DEFAULT_STATS` hardcoded |
| **Primary — class detail** | stub ([PrimaryClassDetail.tsx](src/pages/primary/PrimaryClassDetail.tsx)) | live (`curriculum`) | unverified | Uses local curriculum helpers, no API |
| **Primary — student dashboard** | live ([PrimaryStudentDashboard.tsx](src/pages/primary/PrimaryStudentDashboard.tsx)) | live (`analytics`) | unverified | |
| **Primary — teacher dashboard** | live ([PrimaryTeacherDashboard.tsx](src/pages/primary/PrimaryTeacherDashboard.tsx)) | live (`lessons`) | unverified | |
| **Primary — parent dashboard** | live ([PrimaryParentDashboard.tsx](src/pages/primary/PrimaryParentDashboard.tsx)) | live (`parent_portal`) | unverified | |
| **Primary — P7 readiness** | stub ([P7ReadinessDashboard.tsx](src/pages/primary/P7ReadinessDashboard.tsx)) | live (`analytics`) | unverified | `mockReadinessProfiles` hardcoded |
| **Course catalog** | live ([CourseCatalog.tsx](src/pages/CourseCatalog.tsx)) | live (`classes`, `curriculum`) | unverified | |
| **Course detail** | live ([CourseDetail.tsx](src/pages/CourseDetail.tsx)) | live (`classes`, `curriculum`) | unverified | |
| **Class syllabus** | live ([ClassSyllabusPage.tsx](src/pages/ClassSyllabusPage.tsx)) | live (`curriculum`) | unverified | |
| **Subject topics** | live ([SubjectTopicsPage.tsx](src/pages/SubjectTopicsPage.tsx)) | live (`curriculum`) | unverified | Uses cached `getCurriculumTree` |
| **Topic detail** | live ([TopicDetailPage.tsx](src/pages/TopicDetailPage.tsx)) | live (`resources`) | unverified | |
| **Academic library** | live ([AcademicLibraryPage.tsx](src/pages/AcademicLibraryPage.tsx)) | live (`resources`) | **verified** | Covered by Django `StudentSliceTests` + `TeacherCreatesContentStudentEngagesTests` + Playwright `teacher-creates-content.spec.ts` |
| **Resource discovery** | live ([ResourceDiscoveryPage.tsx](src/pages/ResourceDiscoveryPage.tsx)) | live (`resources`) | unverified | |
| **Dashboard library** | stub ([DashboardLibraryPage.tsx](src/pages/dashboard/DashboardLibraryPage.tsx)) | live (`resources`) | unverified | Hardcoded cards |
| **Library (legacy)** | stub ([LibraryPage.tsx](src/pages/LibraryPage.tsx)) | live (`resources`) | n/a | Placeholder — delete, superseded by AcademicLibrary |
| **Exercise runner** | stub ([ExercisePage.tsx](src/pages/ExercisePage.tsx)) | live (`assessments`) | unverified | `setTimeout` mock + `mockResource` |
| **Exam registration** | stub ([ExamRegistrationPage.tsx](src/pages/ExamRegistrationPage.tsx)) | live (`exams`) | unverified | Mock `setTimeout` data |
| **Teacher marks upload** | live ([TeacherMarksUpload.tsx](src/pages/TeacherMarksUpload.tsx)) | live (`grading`) | unverified | |
| **Attendance register** | live ([AttendanceRegisterPage.tsx](src/pages/AttendanceRegisterPage.tsx)) | live (`attendance`) | unverified | |
| **Live sessions** | live ([LiveSessionsPage.tsx](src/pages/LiveSessionsPage.tsx)) | live (`live_sessions`) | unverified | |
| **Missed session recovery** | live ([MissedSessionRecoveryPage.tsx](src/pages/MissedSessionRecoveryPage.tsx)) | live (`live_sessions`) | unverified | |
| **Marketplace — home** | live ([MarketplacePage.tsx](src/pages/MarketplacePage.tsx)) | live (`marketplace`) | unverified | |
| **Marketplace — subject** | live ([MarketplaceSubjectPage.tsx](src/pages/MarketplaceSubjectPage.tsx)) | live (`marketplace`) | unverified | |
| **Marketplace — topic** | live ([MarketplaceTopicPage.tsx](src/pages/MarketplaceTopicPage.tsx)) | live (`marketplace`) | unverified | |
| **Teacher storefront** | stub ([TeacherStorefront.tsx](src/pages/TeacherStorefront.tsx)) | live (`marketplace`) | unverified | Hardcoded profile |
| **Public profile** | live ([PublicProfile.tsx](src/pages/PublicProfile.tsx)) | live (`accounts`) | unverified | |
| **Peer tutoring hub** | live ([PeerTutoringHub.tsx](src/pages/PeerTutoringHub.tsx)) | live (`tutoring`) | unverified | Uses raw `fetch` — align with `apiClient` |
| **Peer tutoring (legacy page)** | dead ([PeerTutoringPage.tsx](src/pages/PeerTutoringPage.tsx)) | live (`tutoring`) | n/a | **DELETE** — not routed |
| **Forum** | live ([ForumPage.tsx](src/pages/ForumPage.tsx)) | live (`discussions`) | unverified | |
| **AI teaching assistant** | live ([AITeachingAssistant.tsx](src/pages/AITeachingAssistant.tsx)) | live (`ai_services`) | unverified | Confirm LLM credentials path |
| **Platform command center** | live ([PlatformCommandCenter.tsx](src/pages/analytics/PlatformCommandCenter.tsx)) | live (`analytics`) | unverified | |
| **Institution intelligence** | live ([InstitutionIntelligence.tsx](src/pages/analytics/InstitutionIntelligence.tsx)) | live (`intelligence`) | unverified | |
| **Institution risk monitor** | live ([InstitutionRiskMonitor.tsx](src/pages/admin/intelligence/InstitutionRiskMonitor.tsx)) | live (`intelligence`) | unverified | |
| **Maple intelligence hub** | stub ([MapleIntelligenceHub.tsx](src/pages/admin/intelligence/MapleIntelligenceHub.tsx)) | live (`intelligence`) | unverified | State-only component |
| **Analytics layout** | stub ([AnalyticsLayout.tsx](src/pages/analytics/AnalyticsLayout.tsx)) | — | n/a | Layout shell, fine as-is |
| **Analytics (legacy page)** | stub ([AnalyticsPage.tsx](src/pages/AnalyticsPage.tsx)) | live (`analytics`) | n/a | Placeholder — delete, superseded |
| **Platform analytics views** | dead ([PlatformAnalyticsViews.tsx](src/pages/analytics/PlatformAnalyticsViews.tsx)) | live (`analytics`) | n/a | **DELETE** — not routed |
| **Interventions hub** | live ([InterventionsHub.tsx](src/pages/dashboard/InterventionsHub.tsx)) | live (`interventions`) | unverified | |
| **Interventions (legacy)** | stub ([InterventionsPage.tsx](src/pages/InterventionsPage.tsx)) | live (`interventions`) | n/a | Placeholder — delete, superseded |
| **Institution management** | live ([InstitutionManagementPage.tsx](src/pages/InstitutionManagementPage.tsx)) | live (`institutions`) | unverified | |
| **Institution timetable studio** | live ([InstitutionTimetableStudio.tsx](src/pages/InstitutionTimetableStudio.tsx)) | live (`scheduling`) | unverified | |
| **Institution health view** | live ([InstitutionHealthView.tsx](src/pages/institution/dashboard/InstitutionHealthView.tsx)) | live (`institutions`) | unverified | |
| **Offline result upload** | live ([OfflineResultUpload.tsx](src/pages/institution/academics/OfflineResultUpload.tsx)) | live (`grading`) | unverified | |
| **Teacher lesson studio** | live ([TeacherLessonStudio.tsx](src/pages/TeacherLessonStudio.tsx)) | live (`lessons`) | unverified | |
| **Assignment targeting studio** | live ([AssignmentTargetingStudio.tsx](src/pages/AssignmentTargetingStudio.tsx)) | live (`assessments`) | unverified | |
| **Teacher earnings** | live ([TeacherEarningsPage.tsx](src/pages/dashboard/TeacherEarningsPage.tsx)) | live (`marketplace` — wallet/payouts) | unverified | |
| **Earnings (legacy page)** | stub ([EarningsPage.tsx](src/pages/EarningsPage.tsx)) | live (`marketplace`) | n/a | Placeholder — delete, superseded |
| **Payment** | live ([PaymentPage.tsx](src/pages/PaymentPage.tsx)) | live (`marketplace` — checkout) | unverified | Confirm a real payment provider is wired (none visible) |
| **Learning path** | stub ([LearningPathPage.tsx](src/pages/LearningPathPage.tsx)) | live (`intelligence` — StudyPlan) | unverified | Hardcoded subjects array |
| **Projects list** | stub ([ProjectsPage.tsx](src/pages/ProjectsPage.tsx)) | — | n/a | No `projects` backend app. Cut or build. |
| **Project workspace** | stub ([ProjectWorkspace.tsx](src/pages/ProjectWorkspace.tsx)) | — | n/a | Same as above |
| **Feedback** | stub ([FeedbackPage.tsx](src/pages/FeedbackPage.tsx)) | — | n/a | TODO in file; no `feedback` backend |

---

## Tallies

**Frontend pages (65 total, including nested):**
- live: 45
- stub: 16
- dead: 4

**Backend apps (21 total):** all live by structural criteria (installed, wired, migrated). This does **not** mean end-to-end tested.

**End-to-end status:**
- `verified` (HTTP-level e2e via Playwright + backend unit-level coverage): **2** — Academic library content loop; Grading loop (teacher assigns → student submits → teacher grades → student reads grade).
- `api-verified` (backend path locked by a test, no browser coverage yet): **2** — Auth-Login, Auth-Register. Covered by [accounts.tests.StudentSliceTests](maple_backend/apps/accounts/tests.py).
- `unverified`: all the rest.

Run everything:

```sh
cd maple_backend && ./venv/bin/python manage.py test accounts.tests lessons.tests resources.tests maple_core.test_health
npm test
npm run test:e2e
```

All three suites are green as of the last commit on `phase-4-teacher-creates-content`.

**Known non-blocking issues:** see [docs/KNOWN_ISSUES.md](docs/KNOWN_ISSUES.md) — 6 items, including `/lessons/lesson/` filter regression and 79 baseline TS errors.

---

## Phase 3 deletions (done)

Deleted in the Phase 3 prune pass:

- ~~src/pages/PeerTutoringPage.tsx~~ — had zero imports
- ~~src/pages/LibraryPage.tsx~~ — route rewired to `DashboardLibraryPage`
- ~~src/pages/AnalyticsPage.tsx~~ — route rewired to `AnalyticsLayout`
- ~~src/pages/InterventionsPage.tsx~~ — orphan import, no JSX use
- ~~src/pages/EarningsPage.tsx~~ — route rewired to `TeacherEarningsPage`

Not deleted after all:
- `src/pages/analytics/PlatformAnalyticsViews.tsx` — STATUS.md originally flagged as "not routed" but it exports four sub-views (`LearningAnalytics`, `ExamsAnalytics`, `MarketplaceAnalytics`, `SystemHealthAnalytics`) that ARE routed under `/dashboard/analytics/*`. Kept.

Bundle delta: 2,179,661 → 2,172,688 bytes total JS; 99 → 95 files.

## Orphaned frontend (no backend) — decide in Phase 5

- **Finance** — **removed from scope** (institution finance / ERP module). The two orphan pages, the `finance_factory` seeder, and the `docs/archive/FINANCE_*.md` marketing packet were deleted in the finance-removal PR.
- **Projects** (2 pages): `ProjectsPage`, `ProjectWorkspace`. No `projects` Django app. Cut unless the product needs it.
- **Feedback** (1 page): `FeedbackPage`. No backend. Trivial to build (a form → email) or cut.

## Orphaned backend (no frontend consumer)

None obvious — most apps have at least one page consuming them. `notifications` and `scheduling` may have thin coverage; audit during Phase 4.

---

## What this tells us about Phase 1

The scaffold is more complete than the initial assessment suggested. **45 of 65 frontend pages** appear to call real APIs, and **all 21 backend apps** are wired up. The actual risk is not "is the code there" — it's **"has anything been proven to work end-to-end."** Zero E2E verifications today.

Phase 1's job is to flip **one** row — recommended: **Auth — Login + Register → Course catalog → Subject topics → Topic detail → Exercise runner** (the student learning journey) — from `unverified` to `verified`, and fix whatever breaks along the way.
