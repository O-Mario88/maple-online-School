# Maple Online School — Comprehensive Page & Routing Audit

## Table of Contents
1. [Global Architecture Summary](#global-architecture-summary)
2. [Routing Structure (App.tsx)](#routing-structure)
3. [Page-by-Page Audit](#page-by-page-audit)
4. [Security Findings](#security-findings)
5. [Orphaned Pages](#orphaned-pages)
6. [Dead Buttons & Non-functional Links](#dead-buttons--non-functional-links)
7. [API Integration Status](#api-integration-status)

---

## Global Architecture Summary

| Aspect | Detail |
|---|---|
| Frontend Framework | React 18 + TypeScript |
| Bundler | Vite |
| Router | React Router v6 (BrowserRouter) |
| Styling | Tailwind CSS + shadcn/ui + Custom Editorial components |
| Charts | Recharts |
| Auth | Custom AuthContext with JWT (cookie/header based) |
| API Client | `apiClient` from `@/lib/apiClient` (primary), `apiClient` from `@/lib/api` (legacy) |
| Backend | Django at `localhost:8000`, API prefix `/api/v1/` |
| State Management | Local component state, React Context (Auth) |
| Total Page Files | 45 |
| Total Routes in App.tsx | ~35 unique routes |
| Roles | `universal_student`, `institution_student`, `student`, `parent`, `institution_teacher`, `universal_teacher`, `independent_teacher`, `teacher`, `institution_admin`, `platform_admin` |

### Layout Wrappers
- **`<Layout>`** — Main app shell with navbar. Wraps most public and authenticated routes.
- **`<GlassDashboardLayout>`** — Dark-themed glass-morphism dashboard wrapper. Wraps all `/dashboard/*` routes.
- **No wrapper** — Login, Register, InstitutionWizard, IndependentTeacherWizard render standalone.

### Auth Guards
- **`<ProtectedRoute allowedRoles={[...]}>` ** — Role-based route protection component.
- **`<PermissionGuard require={Permission.XXX}>`** — Granular permission guard used in analytics layout.

---

## Routing Structure

### Public Routes (No Layout)
| Path | Component | Auth | Notes |
|---|---|---|---|
| `/login` | LoginPage | None | |
| `/register` | RegisterPage | None | |
| `/institution-onboarding` | InstitutionWizard | None | |
| `/independent-teacher-onboarding` | IndependentTeacherWizard | None | |

### Routes Inside `<Layout>`
| Path | Component | Auth Guard | Allowed Roles |
|---|---|---|---|
| `/` | HomePage | None | — |
| `/classes` | CourseCatalog | None | — |
| `/classes/:classId` | ClassSyllabusPage | None | — |
| `/classes/:gradeId/:termId/:subjectId` | CourseDetail | None | — |
| `/classes/:classId/subject/:subjectId` | SubjectTopicsPage | None | — |
| `/classes/:classId/:termId/:subjectId/topic/:topicId` | TopicDetailPage | None | — |
| `/forum/*` | ForumPage | None | — |
| `/live-sessions` | LiveSessionsPage | None | — |
| `/library` | AcademicLibraryPage | ProtectedRoute | All authenticated roles |
| `/resources` | ResourceDiscoveryPage | ProtectedRoute | All authenticated roles |
| `/payment` | PaymentPage | None | — |
| `/p/:username` | PublicProfile | None | — |
| `/t/:username` | TeacherStorefront | None | — |
| `/marketplace` | MarketplacePage | None | — |
| `/marketplace/:country/:subjectId` | MarketplaceSubjectPage | None | — |
| `/marketplace/:country/:subjectId/:classId/:topicId` | MarketplaceTopicPage | None | — |
| `/exam-registration` | ExamRegistrationPage | ProtectedRoute | `universal_student` |
| `/institution-management` | InstitutionManagementPage | ProtectedRoute | `institution_admin` |
| `/learning-path` | LearningPathPage | ProtectedRoute | `universal_student` |
| `/projects` | ProjectsPage | None | — |
| `/peer-tutoring` | PeerTutoringHub | None | — |
| `/ai-assistant` | AITeachingAssistant | ProtectedRoute | `independent_teacher`, `institution_admin` |

### Routes Inside `<GlassDashboardLayout>` at `/dashboard`
| Path | Component | Auth Guard | Allowed Roles |
|---|---|---|---|
| `/dashboard` (index) | DashboardRouter | None (redirects by role) | — |
| `/dashboard/student` | StudentDashboard | ProtectedRoute | `universal_student`, `institution_student`, `student` |
| `/dashboard/sessions/recover/:sessionId` | MissedSessionRecoveryPage | ProtectedRoute | student/parent/teacher/admin roles |
| `/dashboard/teacher` | TeacherDashboard | ProtectedRoute | All teacher roles |
| `/dashboard/teacher/class/:classId` | TeacherLessonStudio | ProtectedRoute | All teacher roles |
| `/dashboard/teacher/attendance` | AttendanceRegisterPage | ProtectedRoute | All teacher roles |
| `/dashboard/teacher/marks-upload` | TeacherMarksUpload | ProtectedRoute | All teacher roles |
| `/dashboard/teacher/targeting` | AssignmentTargetingStudio | ProtectedRoute | All teacher roles |
| `/dashboard/admin` | AdminDashboard | ProtectedRoute | `platform_admin` |
| `/dashboard/admin/intelligence` | MapleIntelligenceHub | **⚠️ NO ProtectedRoute** | — |
| `/dashboard/admin/intelligence/risk` | InstitutionRiskMonitor | **⚠️ NO ProtectedRoute** | — |
| `/dashboard/parent` | ParentDashboard | ProtectedRoute | `parent` |
| `/dashboard/institution` | InstitutionManagementPage | ProtectedRoute | `institution_admin` |
| `/dashboard/institution/health` | InstitutionHealthView | **⚠️ NO ProtectedRoute** | — |
| `/dashboard/institution/health/upload` | OfflineResultUpload | **⚠️ NO ProtectedRoute** | — |
| `/dashboard/institution/timetable` | InstitutionTimetableStudio | ProtectedRoute | `institution_admin` |

---

## Page-by-Page Audit

---

### 1. HomePage.tsx
- **Route**: `/`
- **Auth**: None
- **API Calls**: `fetch('http://localhost:8000/api/v1/curriculum/full-tree/')` with 5s timeout
- **Mock Fallback**: Yes — `DEFAULT_CLASSES` array (4 hardcoded class cards)
- **Layout**: Hero → Benefits Strip → About section → Popular Classes grid (tab-filtered) → Bottom CTA
- **Tabs**: O-Level, A-Level, Sciences, Arts, Revision (filter on classes)
- **Links**: `/register` (Begin Your Journey), `/classes` (Explore Classes)
- **Dead Buttons**: "View All Classes" (no href), "Learn More About Us" (no href)
- **States**: Loading spinner, normal view
- **Implementation**: ~80% — Real API with mock fallback. Two CTA buttons non-functional.

---

### 2. LoginPage.tsx
- **Route**: `/login`
- **Auth**: None required
- **API Calls**: Delegates to `useAuth().login()`
- **Form Fields**: email, password
- **Demo Accounts**: grace.nakato@email.com (Student), sarah.nakamya@maplesch.com (Teacher), christine.namaganda@maplesch.com (Admin), admin@institution.com (Institution Admin). All: `demo123`
- **Links**: `/register`
- **Dead Buttons**: "Forgot?" label (no forgot-password logic)
- **States**: Loading, error (inline)
- **Implementation**: 90% — Working login. No forgot-password flow.

---

### 3. RegisterPage.tsx
- **Route**: `/register`
- **Auth**: None required
- **API Calls**: `useAuth().onboardStudent()`, `useAuth().register()`
- **Flow**: Mode selector → Learner wizard (3 steps), Teacher path, Institution path
- **Learner Form**: full_name, email, country_code, password → parent details → payment method (MTN MoMo / Airtel Money)
- **Teacher Flow**: Two paths — "Independent" → `/independent-teacher-onboarding`, "School Staff" → invite code input
- **Institution Flow**: Redirects to `/institution-onboarding`
- **Dead Buttons**: "Verify Code" for teacher invite (no verification logic)
- **States**: Loading, error
- **Implementation**: 75% — Learner registration works. Teacher invite code verification not connected. Payment step is cosmetic.

---

### 4. CourseCatalog.tsx
- **Route**: `/classes`
- **Auth**: None
- **API Calls**: `apiClient.get('/curriculum/full-tree/')` + `/data/users.json`
- **Layout**: Filter tabs (ALL, O'LEVEL, A'LEVEL, SCIENCES, ARTS) → Grid of class cards
- **Links**: Each card → `/classes/${class.id}`
- **Mock Data**: Random student counts, hardcoded ratings (4.9)
- **States**: Loading, normal
- **Implementation**: 85% — Real API with cosmetic mock augmentation.

---

### 5. CourseDetail.tsx
- **Route**: `/classes/:gradeId/:termId/:subjectId`
- **Auth**: None
- **API Calls**: `apiClient.get('/curriculum/full-tree/')` + `/data/users.json`
- **Tabs**: Syllabus, Educator, Alumni Insight, Archives
- **Features**: Topic+lesson listing, teacher info, reviews (2 hardcoded), resources (4 hardcoded), enrollment button (simulated 2s delay), offline download via `OfflineSyncEngine.queueJob()`
- **Dead Buttons**: "Preview Material", "Analytics Suite"
- **States**: Loading, not found, normal
- **Implementation**: 70% — Enrollment is simulated. Reviews/resources hardcoded.

---

### 6. ClassSyllabusPage.tsx
- **Route**: `/classes/:classId`
- **Auth**: None
- **API Calls**: Direct `fetch('http://localhost:8000/api/v1/curriculum/full-tree/')`
- **Layout**: Class overview → Term navigator tabs → Subject cards with topic lists
- **Links**: Topic → `/classes/${classId}/${termId}/${subjectId}/topic/${topicId}`, "See all" → `/classes/${classId}/subject/${subjectId}`
- **States**: Loading, not found, empty term
- **Implementation**: 90% — Real API, functional navigation.

---

### 7. StudentDashboard.tsx
- **Route**: `/dashboard/student`
- **Auth**: ProtectedRoute — `universal_student`, `institution_student`, `student`
- **API Calls**: `apiClient.get('/analytics/student-dashboard/')`
- **Mock Fallback**: Yes — comprehensive mock data object
- **Sections**: Intelligence Cards (4) → Resource Engagement → Action Center → Current Priorities (Live Session, At-Risk, Activity Trend) → Resource Recommendations (3 cards) → Motivation Engine → Career Guidance → Subject Performance Grid (10 subjects) → Assessment Snapshot → Platform Launchpad
- **Sub-components**: IntelligenceCard, StudentResourceEngagementPanel, StudentActionCenter, StudentPlatformLaunchpad, StudentMotivationEngine, CareerGuidanceWidget, DashboardSkeleton, DashboardGrid
- **Dead Buttons**: "View Schedule", "Resume Learning", "Join Meeting", "Review Overdue Tasks", all resource action buttons
- **States**: Loading skeleton, normal
- **Implementation**: 60% — Data is mostly mock. All action buttons are dead.

---

### 8. TeacherDashboard.tsx
- **Route**: `/dashboard/teacher`
- **Auth**: ProtectedRoute — All teacher roles
- **API Calls**: `apiClient.get('/analytics/teacher-dashboard/')`, `apiClient.get('/classes/')`, `apiClient.get('/curriculum/subjects/')`
- **Sections**: Header → Earnings (TeacherPayoutStatusCard, IndependentEarningsIntelligence) → Intelligence Strip (6 cards) → Planning & Resource Impact → Support Operations → Professional Growth Hub → Leaderboard → Student Spotlight → Red Alerts → Resource Engagement → Competition Engine → AI Teaching Assistant links → Content Tabs (Overview, My Classes, Content, Live Sessions, Earnings)
- **Working Links**: "Upload Target Grades" → `/dashboard/teacher/marks-upload`
- **Dead Buttons**: "My Calendar"
- **States**: Loading, normal
- **Implementation**: 65% — Heavy mock data. Many sub-components.

---

### 9. AdminDashboard.tsx
- **Route**: `/dashboard/admin`
- **Auth**: ProtectedRoute — `platform_admin`
- **API Calls**: `apiClient.get('/analytics/admin-dashboard/')`
- **Mock Fallback**: Yes — full mock object
- **Sections**: Intelligence Cards (4: growth, churn risk, module adoption, highest yield) → GlobalCurriculumHealth → Gamification KPIs → GlobalInstitutionComparison → AlumniOutcomesTracker → Marketplace Ops → Platform Infrastructure Health → AI Operations Telemetry → Academic Quality Monitor → Institution Diagnostic Leaderboard (15 institutions) → PlatformAnalyticsTabs
- **Working Buttons**: "Upload Library Material" → ResourceUploadModal
- **Dead Buttons**: "View Error Logs", "Sync Data"
- **States**: Loading skeleton, normal
- **Implementation**: 60% — Mostly mock dashboard cards.

---

### 10. ParentDashboard.tsx
- **Route**: `/dashboard/parent`
- **Auth**: ProtectedRoute — `parent`
- **API Calls**: `apiClient.get('/analytics/parent-dashboard/')` (from `../lib/api`)
- **Mock Fallback**: Yes — extensive mock
- **Tabs**: "Academic Performance", "Household Finances"
- **Academic tab**: Intelligence Cards (5), Action Center, AI Weekly Summary, CelebrationEngine, Smart Study Planner, Resource Engagement, Competition Engine, Child Performance Grid, Upcoming Schedule
- **Finance tab**: Household Balance, Total Invoiced, Waivers, Individual Child Ledgers table
- **Dead Buttons**: "Download Report", "Notification Preferences", "Download Consolidated Statement", "Make Online Payment", "Message Tutor", "Book Meeting", "View Curriculum", "View Full Report"
- **States**: Loading, normal
- **Implementation**: 50% — Comprehensive layout but all actions are dead.

---

### 11. ForumPage.tsx
- **Route**: `/forum/*`
- **Auth**: None
- **API Calls**: `apiClient.get('/discussions/thread/')`, `apiClient.post('/discussions/thread/')`, `apiClient.post('/discussions/post/')`, `/data/forum.json` (mock)
- **Features**: Category hierarchy, search, create discussion, post detail with replies
- **Form Fields**: title, content (new post), reply textarea
- **Working Buttons**: "New Topic" (creates via API)
- **Dead Buttons**: "Like", "Reply" (no submit handler), "Post Reply" (no handler), Latest/Popular/Solved filters
- **States**: Loading, list view, detail view
- **Implementation**: 60% — Thread creation works. Replies, likes, filters nonfunctional.

---

### 12. TopicDetailPage.tsx
- **Route**: `/classes/:classId/:termId/:subjectId/topic/:topicId`
- **Auth**: None
- **API Calls**: Direct `fetch('http://localhost:8000/api/v1/curriculum/full-tree/')`
- **Layout**: Two-column — left sidebar (topic navigation), right content (Learn vs Practice)
- **Features**: ResourceViewer modal for lessons. Practice augmented with `MOCK_ASSIGNMENTS` when sparse.
- **States**: Loading, not found, normal
- **Implementation**: 85% — Real API, ResourceViewer integration works.

---

### 13. SubjectTopicsPage.tsx
- **Route**: `/classes/:classId/subject/:subjectId`
- **Auth**: None
- **API Calls**: Direct `fetch('http://localhost:8000/api/v1/curriculum/full-tree/')`
- **Layout**: Aggregated topic listing across all terms for a subject, grouped by term
- **Links**: Each topic card → topic detail page
- **States**: Loading, not found, normal
- **Implementation**: 90% — Clean, functional.

---

### 14. LiveSessionsPage.tsx
- **Route**: `/live-sessions`
- **Auth**: None
- **API Calls**: `apiClient.get('/live-sessions/live-session/')`
- **Mock Fallback**: `MOCK_SESSIONS` (8 sessions)
- **Features**: Hero section, search, category filters (All, Upcoming, Live, Recorded, Peer Discussion, Revision Session), session cards, CTA banner
- **Working Buttons**: RSVP (local state + toast)
- **Dead Buttons**: Replay, "Host a Seminar", "Host Masterclass" (toast only)
- **States**: Loading, normal, empty
- **Implementation**: 70% — API with fallback. RSVP local-only.

---

### 15. PaymentPage.tsx
- **Route**: `/payment`
- **Auth**: None
- **API Calls**: `fetch('/data/pricing.json')`
- **Payment Methods**: MTN MoMo, Airtel Money, Bank Transfer, Credit/Debit Card
- **Form Fields**: Vary by method (phone number, bank details, card details)
- **Process**: Payment simulation (3s timeout, no real payment API)
- **Query Params**: `plan`, `planId`, `classId`
- **States**: Loading, plan not found, payment form, processing, payment complete
- **Implementation**: 40% — Entirely simulated. No real payment integration.

---

### 16. LearningPathPage.tsx
- **Route**: `/learning-path`
- **Auth**: ProtectedRoute — `universal_student`
- **API Calls**: **NONE** — All mock data with `setTimeout` simulation
- **Tabs**: Overview (4 subject cards), Skill Tree (visual nodes), Weekly Plan (5-day schedule), AI Insights
- **Dead Buttons**: "Continue Learning", "Start" (weekly plan), "Start 15-Minute Practice Check", "Ask Copilot to Explain"
- **Implementation**: 20% — Entirely placeholder. No API integration.

---

### 17. ProjectsPage.tsx
- **Route**: `/projects`
- **Auth**: None (but "Create Project" only shown for `independent_teacher`)
- **API Calls**: **NONE** — All mock data with `setTimeout`
- **Tabs**: Project Marketplace (3 templates), Active Projects (2), Completed (2), Insights (4 stat cards)
- **Dead Buttons**: "Join Project", "Continue Working", "Team Chat", "Documents", "View Certificate", "Create Project"
- **Implementation**: 15% — Entirely placeholder.

---

### 18. AITeachingAssistant.tsx
- **Route**: `/ai-assistant`
- **Auth**: ProtectedRoute — `independent_teacher`, `institution_admin`
- **API Calls**: `apiClient.post('/ai/copilot/ask/')` (real AI calls with different context)
- **Import**: Uses `../lib/api` NOT `../lib/apiClient`
- **Tabs**: Live Analytics (mock chart + real AI report), Smart Replies (real AI generation), Quiz Generator (real AI quiz)
- **Working Buttons**: "Generate Smart Reply", "Generate JSON Quiz", "Refresh Insights" — all trigger real AI endpoints
- **Implementation**: 85% — Real AI integration. Chart data is mock.

---

### 19. PeerTutoringHub.tsx
- **Route**: `/peer-tutoring`
- **Auth**: None
- **API Calls**: **NONE** — All mock data
- **Tabs**: Find a Tutor (2 cards), Accept Bounties (interventions + community bounties)
- **Buttons**: "Request Session" (toast only), "Accept Bounty" (toast only), "Initialize Session" (toast only), "Post Help Bounty" (dead)
- **Implementation**: 15% — Entirely placeholder with toast-only actions.

---

### 20. MarketplacePage.tsx
- **Route**: `/marketplace`
- **Auth**: None
- **API Calls**: `apiClient.get('/curriculum/subjects/')`
- **Features**: Subject card grid, search, country filter, API connection status indicator
- **Links**: Each card → `/marketplace/${country}/${subjectId}`
- **States**: Loading, empty, connected/disconnected
- **Implementation**: 90% — Real API data, functional navigation.

---

### 21. MarketplaceSubjectPage.tsx
- **Route**: `/marketplace/:country/:subjectId`
- **Auth**: None
- **API Calls**: `apiClient.get('/curriculum/subjects/${subjectId}/')`, `apiClient.get('/curriculum/topics/?subject=${subjectId}')`
- **Layout**: Breadcrumbs → Subject header → Tabs by class level → Topic cards → Sidebar (Top Tutors, Live Support)
- **Links**: Each topic → `/marketplace/${country}/${subjectId}/${activeTab}/${topicId}`
- **Mock Data**: Random video/notes/test counts per topic. Dummy tutor list.
- **Dead Buttons**: "See All Subject Tutors", "Open Student Copilot"
- **States**: Loading, not found, normal
- **Implementation**: 80% — Real API for curriculum data. Sidebar is mock.

---

### 22. MarketplaceTopicPage.tsx
- **Route**: `/marketplace/:country/:subjectId/:classId/:topicId`
- **Auth**: None (but "Unlock Lesson" only enabled for `universal_student`)
- **API Calls**: `apiClient.get('/curriculum/subjects/${subjectId}/')`, `apiClient.get('/curriculum/topics/${topicId}/')`, `apiClient.get('/marketplace/listing/?topic_bindings__topic=${topicId}')`
- **Layout**: Breadcrumbs → Topic header → Tabs (Videos/Notes/Tests from live listings) → Resource cards
- **Features**: Displays real marketplace listings per content type. Price display, ratings, student count.
- **States**: Loading, not found, normal
- **Implementation**: 85% — Real API data for listings.

---

### 23. InstitutionManagementPage.tsx
- **Route**: `/institution-management` (Layout) and `/dashboard/institution` (Dashboard)
- **Auth**: ProtectedRoute — `institution_admin`
- **API Calls**: `apiClient.get('/analytics/institution-dashboard/')`, plus `useInstitutionHealth()` hook
- **Mock Fallback**: Yes — comprehensive mock dashboard data
- **Tabs (9)**: Overview, Academics, Staff, Students, Timetable, Pastoral, Resources, Parents, War Room
- **Sub-components**: SchoolHealthScore, IntelligenceCard, ActiveChallengeCard, HouseStandingsCard, InstitutionIntelligenceHub, PastoralTimeline, TeacherAssignmentManager, StudentOnboardingForm, ExamWarRoomMode, AIAdminReportAssistant, BulkInviteModal, ResourceUploadModal
- **Working Buttons**: "Bulk Invite Matrix" → BulkInviteModal, "Launch Onboarding Form" → StudentOnboardingForm, "Upload Reference Material" → ResourceUploadModal, "Launch Studio" → `/dashboard/institution/timetable`
- **Dead Buttons**: "Investigate" (alert actions), "Ping Teacher"
- **States**: Loading skeleton, error, normal
- **Implementation**: 70% — Extensive dashboard with many real sub-components but lots of mock data.

---

### 24. InstitutionTimetableStudio.tsx
- **Route**: `/dashboard/institution/timetable`
- **Auth**: ProtectedRoute — `institution_admin`
- **API Calls**: **NONE** — All mock data
- **Tabs (4)**: Class Allocation Grid, Sub/Cover Assignments, Academic Calendar & Holidays, Room Tracker
- **Features**: Weekly period allocation grid (MOCK_GRID), absent teacher cover assignment (mock), Uganda holidays list (UGANDA_HOLIDAYS), conflict engine status, room tracker placeholder
- **Working Buttons**: "Dispatch Cover Update" (toast notification)
- **Dead Buttons**: "Export PDF", "Save Master Schedule"
- **States**: Static (no loading state)
- **Implementation**: 30% — Fully mock timetable. Holidays list is real data. Room tracker is empty placeholder.

---

### 25. InstitutionWizard.tsx
- **Route**: `/institution-onboarding`
- **Auth**: None
- **API Calls**: **NONE** — Simulated `setTimeout` for submission
- **Steps (10)**: Institution Account → Branding → Academic Structure → Roles & Permissions → Teachers → Students → Parents → Billing & Activation → School Setup → Go Live
- **Implemented Steps**: 1 (Institution Account), 2 (Branding), 3 (Academic Structure). Steps 4-10 show placeholder "Phase Pending" UI.
- **Form Fields (Step 1)**: name, type, country, email, phone, location, adminName, password
- **Form Fields (Step 2)**: motto, primaryColor, logo upload placeholder, shortDesc
- **Form Fields (Step 3)**: levels (O/A/Both), NCDC preload checkbox, timetable checkbox
- **Dead Buttons**: "Save & Exit to Dashboard" navigates to `/` but doesn't save
- **Implementation**: 30% — Only first 3 steps have UI. No real API submission.

---

### 26. IndependentTeacherWizard.tsx
- **Route**: `/independent-teacher-onboarding`
- **Auth**: None
- **API Calls**: **NONE** — Simulated `setTimeout` for submission (comments reference `/api/marketplace/onboard-teacher/`)
- **Steps (4 + 4 future)**: Account Setup → Credibility → Monetization Disclosure → Payout Setup. Future: Content Offers, First Lesson, Public Profile, Launch Dashboard
- **Form Fields**: full_name, phone, email, password, country, bio, experience_years, specialization, payout_network (MTN/Airtel), account_name, payout_phone
- **Features**: Terms acceptance gate on monetization step. Payout network selector.
- **Progress Bug**: Circular indicator shows `/8` denominator but only 4 steps are defined
- **Implementation**: 40% — All 4 steps have UI. No real API submission.

---

### 27. AcademicLibraryPage.tsx
- **Route**: `/library`
- **Auth**: ProtectedRoute — All authenticated roles
- **API Calls**: `apiClient.get(API_ENDPOINTS.RESOURCES)` with search, filter, sort params
- **Mock Fallback**: `DEFAULT_MOCK_RESOURCES` (18 hardcoded resources)
- **Layout**: Editorial design — Featured carousel → Left sidebar (Educator of Week, Top Materials) → Main grid (6-col book cards)
- **Features**: Subject filter, category filter, sort, search, ResourceViewer modal, VideoPlayer modal, ResourceUploadModal ("Upload Resource" button)
- **States**: Loading skeleton, error with retry, empty state, normal
- **Implementation**: 85% — Real API with rich fallback. Upload modal integrated.

---

### 28. ResourceDiscoveryPage.tsx
- **Route**: `/resources`
- **Auth**: ProtectedRoute — All authenticated roles
- **API Calls**: `apiClient.get(API_ENDPOINTS.RESOURCES)` with pagination, search, filters
- **Mock Fallback**: `getMockResources()` (2 items)
- **Layout**: Header → ResourceFilter component → Resource card grid (3-col) → VideoPlayer modal → ResourceUploadModal
- **Features**: Search, category filter, sort, pagination, video playback, file download, resource upload
- **States**: Loading spinner, empty, normal
- **Implementation**: 90% — Real paginated API. Download creates link to `localhost:8000` file paths.

---

### 29. ExamRegistrationPage.tsx
- **Route**: `/exam-registration`
- **Auth**: ProtectedRoute — `universal_student`
- **API Calls**: `apiClient.get('/exams/exam-center/')`, `apiClient.post('/exams/candidate-registration/')`
- **Features**: Multi-step wizard — Center selection → Exam type (UCE/UACE) → Subject selection with UNEB validation → Document upload → Fee calculation → Submission
- **Form Fields**: exam_center_id, exam_type, academic_year, subjects[], documents (id_copy, academic_records, passport_photo)
- **Validation**: Uses `SubjectValidation` from `@/lib/subjectConfig` — validates O-Level and A-Level subject combinations per UNEB rules
- **States**: Loading, normal, submitting
- **Implementation**: 80% — Real API calls. Subject validation implemented. Document upload is mock (sends filenames not files).

---

### 30. TeacherLessonStudio.tsx
- **Route**: `/dashboard/teacher/class/:classId`
- **Auth**: ProtectedRoute — All teacher roles
- **API Calls**: `apiClient.post('/live-sessions/provision-webinar/')` (real, with error handling)
- **Mock Data**: `targetClass` (hardcoded class context), `lessonTimeline` (3 hardcoded lessons)
- **Tabs (4)**: Lesson Delivery Timeline, Class Resource Vault, Exam Engine, Class Forums
- **Working Buttons**: "Live Schedule" (provisions webinar via API with clipboard copy), "Publish Notes" (disabled for published lessons)
- **Dead Buttons**: "New Lesson" (console.log only), "Edit Syllabus", "Append New Lesson Module", "Select Files to Upload" (sets state but no upload), "Create New Assessment" (console.log), Class Forums ("Coming later in MVP phase")
- **States**: Normal (no loading state for initial render)
- **Implementation**: 40% — Webinar provisioning works. Everything else is placeholder.

---

### 31. AttendanceRegisterPage.tsx
- **Route**: `/dashboard/teacher/attendance`
- **Auth**: ProtectedRoute — All teacher roles
- **API Calls**: **NONE** — `console.log` with `alert()` for save
- **Mock Data**: 8 hardcoded students with attendance statuses
- **Features**: Interactive attendance matrix (Present/Late/Excused/Absent toggles), "Mark All Present" bulk action, KPI strip (Total, Present, Late, Absent), notes field per student
- **Working Buttons**: Status toggles (update local state), "Mark All Present" (local), "Submit Register" (alert only)
- **Implementation**: 30% — UI complete but no API integration. Save only shows `alert()`.

---

### 32. PublicProfile.tsx
- **Route**: `/p/:username`
- **Auth**: None
- **API Calls**: **NONE** — `getMockPublicProfile()` returns hardcoded data
- **Layout**: Cover gradient → Profile header (avatar, name, bio, location) → Badge showcase → Certificates section
- **Sub-components**: `BadgeShowcase`, `CertificateCard`
- **Working Buttons**: "Share" (copies URL to clipboard)
- **States**: Loading text, normal
- **Implementation**: 25% — Entirely hardcoded mock profile. No API.

---

### 33. TeacherStorefront.tsx
- **Route**: `/t/:username`
- **Auth**: None
- **API Calls**: **NONE** — All hardcoded mock data
- **Layout**: Hero cover → Profile section (avatar, name, bio, stats) → Tabs (Marketplace, Live Bootcamps, Student Reviews)
- **Marketplace tab**: 4 resource cards (hardcoded)
- **Live tab**: Single bootcamp card (hardcoded)
- **Reviews tab**: 2 review cards (hardcoded)
- **Buttons**: "Subscribe (15k UGX/mo)" (simulated timeout), "Message Teacher" (dead), "Get Access" (dead), "Book Live Seat" (dead)
- **Implementation**: 20% — Entirely mock. Subscribe is cosmetic.

---

### 34. TeacherMarksUpload.tsx
- **Route**: `/dashboard/teacher/marks-upload`
- **Auth**: ProtectedRoute — All teacher roles
- **API Calls**: **NONE** — Toast notifications only
- **Mock Data**: 4 hardcoded students
- **Features**: Assessment context panel (source type, subject, max score), editable marks spreadsheet (formative/summative), CSV/Excel upload (mock — populates grid with hardcoded values), "Download Empty Template" button
- **Working Buttons**: "Save Draft" (toast), "Publish to Engine" (toast + status update), CSV upload (mock populate)
- **Dead Buttons**: "Download Empty Template" (no download logic), "Download PDF Batch"
- **Implementation**: 30% — UI polished but no real API. CSV "upload" just fills mock values.

---

### 35. AssignmentTargetingStudio.tsx
- **Route**: `/dashboard/teacher/targeting`
- **Auth**: ProtectedRoute — All teacher roles
- **API Calls**: **NONE** — Toast notifications only
- **Layout**: Two-column — Assignment Blueprint (left) + Audience Targeting Matrix (right)
- **Features**: Assignment title, asset type, grading weight, instructions, file attachment zone. Targeting: Global / At-Risk / Enrichment modes. AI Copilot "Auto-Generate Remedial Task" (simulated timeout).
- **Working Buttons**: "Dispatch Assignment" (toast only), "Auto-Generate Remedial Task" (simulated timeout + toast)
- **Dead Buttons**: "Save Draft"
- **Implementation**: 25% — Complete UI but no real API integration or AI backend call.

---

### 36. MissedSessionRecoveryPage.tsx
- **Route**: `/dashboard/sessions/recover/:sessionId`
- **Auth**: ProtectedRoute — student/parent/teacher/admin roles
- **API Calls**: **NONE** — All mock data
- **Layout**: Red alert header → Session recording player → Required assignments → "Done early?" section
- **Mock Data**: Hardcoded session (Physics: Kinematics Review)
- **Dead Buttons**: "Play Session Recording" (no real video), "Submit Recovery Work" (dead)
- **Working Buttons**: "Return to Dashboard" → `/dashboard`
- **Implementation**: 20% — Skeleton page with no functionality.

---

### 37. InstitutionFinanceHub.tsx — **ORPHANED** (not in App.tsx routes)
- **Route**: Not routed
- **API Calls**: `apiClient.get('/api/v1/institutions/${INSTITUTION_ID}/finance/students/')`, `apiClient.get('/api/v1/institutions/${INSTITUTION_ID}/finance/payments/')`, `apiClient.get('/api/v1/institutions/${INSTITUTION_ID}/finance/discount-rules/')`
- **Tabs (6)**: Executive Dashboard, Fee Structures, Ledgers & Receipts, Cashbook, Bursaries Matrix, Financial Reports
- **Features**: KPI cards (Net Cash, Collections, Arrears, Finance Locks, Expenses), Recent payments, Access control automations, Fee item creation (DynamicSchemaForm), Student ledger search/filter, Offline POS receipt form, Expense recording, Bursary/waiver engine, Termly income statement
- **Sub-components**: IntelligenceCard, DynamicSchemaForm (FeeItemConfig, OfflinePOSReceiptConfig, ExpenseRecordConfig)
- **Implementation**: 90% — **Highly complete finance module with real API integration but NOT routed.**
- **Note**: Uses hardcoded `INSTITUTION_ID = 1`. Uses DynamicSchemaForm for CRUD operations.

---

### 38. PeerTutoringPage.tsx — **ORPHANED** (not in App.tsx routes)
- **Route**: Not routed (PeerTutoringHub.tsx is routed at `/peer-tutoring` instead)
- **API Calls**: **NONE** — All mock data with `setTimeout`
- **Layout**: Editorial design — Header → Tabs (Find Mentors, Study Circles, Prestige leaderboard)
- **Features**: Tutor cards with filters, study group cards, leaderboard, point system
- **Mock Data**: 3 tutors, 3 study groups, 5 leaderboard entries
- **Implementation**: 30% — More polished than PeerTutoringHub but not routed.

---

### 39. MapleIntelligenceHub.tsx
- **Route**: `/dashboard/admin/intelligence`
- **Auth**: **⚠️ NO ProtectedRoute wrapper**
- **API Calls**: **NONE** — All mock/hardcoded data
- **Layout**: Header → Intelligence story cards (3) → Tabbed views (Growth & Health Funnel, Ecosystem Comparison, Resource Impact)
- **Growth tab**: Platform Adoption Funnel KPIs (Onboarded, Activated, Churn Risk, Independent Learners), 30-Day Growth chart (mock bars), Platform Health Metrics (progress bars)
- **Ecosystem tab**: Institution vs Independent comparison table
- **Resource tab**: Not shown in read
- **Implementation**: 25% — Hardcoded mock data with mock chart elements.

---

### 40. InstitutionRiskMonitor.tsx
- **Route**: `/dashboard/admin/intelligence/risk`
- **Auth**: **⚠️ NO ProtectedRoute wrapper**
- **API Calls**: **NONE** — `mockInstitutions` (6 hardcoded)
- **Layout**: Header → Quick Stats (4 cards) → Institution table with health scores
- **Features**: Search, filter placeholder, composite health bar per institution, teacher/learner activity status, churn risk level
- **Implementation**: 20% — Fully mock. Search/filter UI present but not functional.

---

### 41. PlatformCommandCenter.tsx
- **Route**: Not in App.tsx routes (orphaned — intended for analytics layout)
- **Auth**: Would be via PermissionGuard in AnalyticsLayout
- **API Calls**: `apiClient.get('/analytics/daily-platform-metric/')` (from `../../lib/api`)
- **Mock Fallback**: 7 data points
- **Layout**: Smart Alerts → KPI Ribbon (4 cards: Active Users, Paying Institutions, Lessons Completed, Marketplace GMV) → Growth chart (Recharts BarChart) → Commercial Operations → Learning Health Deep Dive
- **Sub-components**: MetricCard, AlertBanner, Recharts BarChart
- **Implementation**: 75% — Real API with fallback. Recharts integration working.

---

### 42. InstitutionIntelligence.tsx
- **Route**: Not in App.tsx routes (orphaned — intended for analytics layout)
- **Auth**: Would be via PermissionGuard in AnalyticsLayout
- **API Calls**: `apiClient.get('/analytics/daily-institution-metric/')` (from `../../lib/api`)
- **Mock Fallback**: 6 data points
- **Layout**: Smart Alerts → KPI Ribbon (4 cards) → Attendance Trend (Recharts AreaChart) → Financial Health → Parent Engagement → Academic Performance Gaps → Staff Effectiveness
- **Sub-components**: MetricCard, AlertBanner, Recharts AreaChart
- **Bug**: References `<SchoolIcon />` which is not imported
- **Implementation**: 70% — Real API with fallback. Has a missing import bug.

---

### 43. AnalyticsLayout.tsx
- **Route**: Not in App.tsx routes (orphaned layout)
- **Auth**: Uses `<PermissionGuard>` with granular permissions
- **Layout**: Sidebar navigation (6 items: Executive Overview, Institution Intelligence, Learning & Assessment, National Exams, Marketplace & Revenue, System Health) → Main content area with `<Outlet />`
- **Features**: Uses `Permission` enum from `../../lib/permissions.matrix`, time-range filter dropdown
- **Intended Routes**: `/analytics/platform`, `/analytics/institution`, `/analytics/learning`, `/analytics/exams`, `/analytics/marketplace`, `/analytics/system`
- **Implementation**: 80% — Well-structured layout. Not connected to any routes.

---

### 44. InstitutionHealthView.tsx
- **Route**: `/dashboard/institution/health`
- **Auth**: **⚠️ NO ProtectedRoute wrapper**
- **API Calls**: **NONE** — All hardcoded mock data
- **Tabs (3)**: Overall Health Profile, Offline vs Online Performance, Interventions & Impact
- **Health tab**: 4 metric cards (Attendance 92%, Teacher Activity 84%, Resource Engagement 76%, Parent Involvement 32%), AI Insight Story
- **Offline tab**: Score translation table (Math, Biology), bulk upload button, translation warning
- **Interventions tab**: ROI comparison (Peer Tutoring +18% vs Parent SMS -2%)
- **Implementation**: 25% — All hardcoded mock data.

---

### 45. OfflineResultUpload.tsx
- **Route**: `/dashboard/institution/health/upload`
- **Auth**: **⚠️ NO ProtectedRoute wrapper**
- **API Calls**: **NONE** — Simulated file upload
- **Features**: CSV template download (no real download), drag-and-drop upload zone, 3-state flow (idle → analyzing → ready), validation warnings
- **States**: idle, analyzing (spinner), ready (success with warnings)
- **Implementation**: 20% — Simulated upload flow, no real file processing.

---

## Security Findings

### Critical: Missing Route Protection
The following routes have **NO `<ProtectedRoute>` wrapper** in App.tsx despite containing sensitive admin/institutional data:

| Route | Component | Expected Access |
|---|---|---|
| `/dashboard/admin/intelligence` | MapleIntelligenceHub | platform_admin only |
| `/dashboard/admin/intelligence/risk` | InstitutionRiskMonitor | platform_admin only |
| `/dashboard/institution/health` | InstitutionHealthView | institution_admin only |
| `/dashboard/institution/health/upload` | OfflineResultUpload | institution_admin only |

**Impact**: Any authenticated user navigating to these URLs can see platform intelligence and institutional health data.

### Medium: Hardcoded Institution ID
- `InstitutionFinanceHub.tsx` uses `const INSTITUTION_ID = 1` — any user accessing would see Institution #1's data.

### Low: Direct fetch() Usage
Several pages use direct `fetch()` instead of `apiClient`, bypassing any centralized auth header injection:
- HomePage.tsx
- ClassSyllabusPage.tsx
- TopicDetailPage.tsx
- SubjectTopicsPage.tsx

---

## Orphaned Pages

These files exist but are **NOT imported or routed** in App.tsx:

| File | Status | Notes |
|---|---|---|
| `InstitutionFinanceHub.tsx` | ORPHANED | **90% complete** finance module with real API. Should be routed. |
| `PeerTutoringPage.tsx` | ORPHANED | Alternative to PeerTutoringHub with editorial design |
| `analytics/PlatformCommandCenter.tsx` | ORPHANED | Real API + Recharts. Intended for AnalyticsLayout |
| `analytics/InstitutionIntelligence.tsx` | ORPHANED | Real API + Recharts. Has missing import bug |
| `analytics/AnalyticsLayout.tsx` | ORPHANED | Well-built sidebar layout with permission guards |

---

## Dead Buttons & Non-functional Links

### Consistently Dead Across Multiple Pages
- All "Download Report" buttons
- All "View Full Report" buttons
- "Message Tutor" / "Message Teacher" buttons
- "Book Meeting" buttons
- Calendar/Schedule view buttons

### Pages with Highest Dead Button Count
1. **StudentDashboard** — ~8 dead buttons
2. **ParentDashboard** — ~6 dead buttons
3. **TeacherDashboard** — ~5 dead buttons
4. **ForumPage** — 4 dead features (likes, replies, filters)
5. **ProjectsPage** — 6 dead buttons (entire page is placeholder)

---

## API Integration Status

### Fully API-Connected Pages
| Page | API Endpoints |
|---|---|
| AcademicLibraryPage | `/resources/` |
| ResourceDiscoveryPage | `/resources/` |
| MarketplacePage | `/curriculum/subjects/` |
| MarketplaceSubjectPage | `/curriculum/subjects/`, `/curriculum/topics/` |
| MarketplaceTopicPage | `/curriculum/subjects/`, `/curriculum/topics/`, `/marketplace/listing/` |
| ExamRegistrationPage | `/exams/exam-center/`, `/exams/candidate-registration/` |
| AITeachingAssistant | `/ai/copilot/ask/` |
| InstitutionFinanceHub* | `/institutions/*/finance/*` (*orphaned) |

### API + Mock Fallback Pages
| Page | Primary API | Fallback |
|---|---|---|
| HomePage | `/curriculum/full-tree/` | DEFAULT_CLASSES (4 cards) |
| CourseCatalog | `/curriculum/full-tree/` | Empty on failure |
| CourseDetail | `/curriculum/full-tree/` | Hardcoded reviews/resources |
| StudentDashboard | `/analytics/student-dashboard/` | Comprehensive mock object |
| TeacherDashboard | `/analytics/teacher-dashboard/` | Comprehensive mock object |
| AdminDashboard | `/analytics/admin-dashboard/` | Comprehensive mock object |
| ParentDashboard | `/analytics/parent-dashboard/` | Comprehensive mock object |
| LiveSessionsPage | `/live-sessions/live-session/` | MOCK_SESSIONS (8) |
| ForumPage | `/discussions/thread/` | `/data/forum.json` |
| PlatformCommandCenter* | `/analytics/daily-platform-metric/` | 7 mock points (*orphaned) |
| InstitutionIntelligence* | `/analytics/daily-institution-metric/` | 6 mock points (*orphaned) |

### 100% Mock / No API Pages
| Page | Notes |
|---|---|
| LearningPathPage | setTimeout simulation |
| ProjectsPage | setTimeout simulation |
| PeerTutoringHub | Static mock |
| PublicProfile | Hardcoded profile |
| TeacherStorefront | Hardcoded storefront |
| AttendanceRegisterPage | console.log + alert |
| TeacherMarksUpload | Toast notifications only |
| AssignmentTargetingStudio | Toast notifications only |
| MissedSessionRecoveryPage | Hardcoded session |
| InstitutionTimetableStudio | MOCK_GRID + UGANDA_HOLIDAYS |
| InstitutionWizard | setTimeout simulation |
| IndependentTeacherWizard | setTimeout simulation |
| MapleIntelligenceHub | Hardcoded cards |
| InstitutionRiskMonitor | 6 mock institutions |
| InstitutionHealthView | Hardcoded metrics |
| OfflineResultUpload | Simulated upload |
| PeerTutoringPage* | Mock (*orphaned) |

---

*Report generated from a full read of all 45 page files in `src/pages/`.*
