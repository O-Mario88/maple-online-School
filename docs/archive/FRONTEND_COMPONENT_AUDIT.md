# Maple Online School — Comprehensive Frontend Component Audit

> **Generated**: Read-only audit of every component, hook, context, lib utility, schema, and type in the React/TypeScript codebase.  
> **Stack**: React 18 + TypeScript + Vite + Tailwind CSS + Shadcn/UI + Recharts + React Router v6  
> **Backend**: Django REST at `http://localhost:8000/api/v1/`

---

## Table of Contents

1. [Root Components](#1-root-components)
2. [Dashboard Components](#2-dashboard-components)
3. [Dashboard Layout Components](#3-dashboard-layout-components)
4. [Navigation](#4-navigation)
5. [Auth](#5-auth)
6. [Academic / Resource Components](#6-academic--resource-components)
7. [AI Copilot Components](#7-ai-copilot-components)
8. [Forms](#8-forms)
9. [Badges & Certificates](#9-badges--certificates)
10. [Competition & Gamification](#10-competition--gamification)
11. [Parents](#11-parents)
12. [Pastoral](#12-pastoral)
13. [Students](#13-students)
14. [Teachers](#14-teachers)
15. [Institutions](#15-institutions)
16. [Marketplace](#16-marketplace)
17. [Admin / Platform](#17-admin--platform)
18. [Custom UI Primitives](#18-custom-ui-primitives)
19. [Hooks](#19-hooks)
20. [Contexts](#20-contexts)
21. [Lib / Utilities](#21-lib--utilities)
22. [Schemas](#22-schemas)
23. [Types](#23-types)
24. [Summary Matrix](#24-summary-matrix)

---

## Data Source Legend

| Tag | Meaning |
|-----|---------|
| **REAL API** | Makes live `fetch`/`axios` calls to the Django backend |
| **HYBRID** | Attempts API call, falls back to hardcoded mock on failure |
| **HARDCODED** | All data is inline mock/static — no API calls |
| **PROPS-DRIVEN** | Receives all data via props — parent is responsible for data |
| **LOCAL STATE** | Uses localStorage, sessionStorage, or browser APIs |
| **SIMULATED** | Uses `setTimeout` to fake async behavior with canned output |

---

## 1. Root Components

`src/components/`

| Component | File | Props | Data Source | Description |
|-----------|------|-------|-------------|-------------|
| **Layout** | `Layout.tsx` | — | None | Main shell: `<TopNavbar>`, `<Outlet>`, footer with "Maple Online School" branding. Renders `<AICopilotWidget>` for student role. |
| **DashboardRouter** | `DashboardRouter.tsx` | — | `useAuth()` | Index route (`/dashboard`) — redirects to role-specific dashboard path (`/dashboard/student`, `/teacher`, `/admin`, `/institution`, `/parent`). Loading spinner while auth resolves. |
| **ErrorBoundary** | `ErrorBoundary.tsx` | `children` | None | Class component. Catches render errors, displays message + stack trace. |
| **ProtectedRoute** | `ProtectedRoute.tsx` | `allowedRoles`, `requiredPermission`, `requireAnyPermission`, `requireAllPermissions` | `useAuth()`, `usePermissions()` | Route guard. Has `ROLE_FAMILIES` mapping (e.g. `student → universal_student`). Redirects to role-appropriate dashboard on denial. |
| **ActiveAssessment** | `ActiveAssessment.tsx` | `assessmentId`, `onComplete` | **REAL API** | Fetches `/assessments/assessment/{id}/`, posts to `/assessments/submission/`. Displays questions with radio groups. Shows graded/pending results. |
| **NetworkStatusWidget** | `NetworkStatusWidget.tsx` | — | **LOCAL STATE** | Listens to `online`/`offline` events + `OfflineSyncEngine`. Shows "Offline Mode" or "Syncing Progress" badges. Hidden when online & idle. |

---

## 2. Dashboard Components

`src/components/dashboard/`

| Component | File | Props | Data Source | Description |
|-----------|------|-------|-------------|-------------|
| **AlertBanner** | `AlertBanner.tsx` | `type` (info/success/warning/error), `title`, `message?`, `action?` | **PROPS-DRIVEN** | Pure presentational alert strip with color coding. |
| **BulkInviteModal** | `BulkInviteModal.tsx` | `isOpen`, `onClose`, `institutionId`, `onSuccess` | **REAL API** | Posts to `/institutions/{id}/bulk_invite/`. Multi-email textarea + role select (student/class_teacher/subject_teacher/dos/registrar/parent). |
| **CareerGuidanceWidget** | `CareerGuidanceWidget.tsx` | — | **HARDCODED** | Recharts RadarChart of student strengths. Future readiness matrix (automation resilience, human-value demand). Suggested career pathways with % match. |
| **CelebrationEngineWidget** | `CelebrationEngineWidget.tsx` | — | **HARDCODED** | "Joan Doe" Student of the Week, "Crane House" leaders. Pure motivational display. |
| **ContinuityPanel** | `ContinuityPanel.tsx` | — | **LOCAL STATE** | Uses `useStudentContinuity()`. Shows "Continue Reading"/"Continue Watching" cards with progress bars from localStorage. Links to `/dashboard/library?resource={id}`. |
| **DashboardSkeleton** | `DashboardSkeleton.tsx` | `type?` (student/teacher/institution/admin) | None | Loading skeleton with shimmer animation. No data. |
| **InstitutionIntelligenceHub** | `InstitutionIntelligenceHub.tsx` | — | **HARDCODED** | KPI cards (14 Critical Interventions, 12% Attendance Gap, 76% Success Rate). Dual Attendance Matrix bar chart. Pedagogical Performance line chart. |
| **IntelligenceCard** | `IntelligenceCard.tsx` | `title`, `value`, `icon`, `trendValue/Direction/IsGood`, `riskLevel`, `alertText`, `drillDownText/Link`, `actionLabel/Callback/Link/Variant` | **PROPS-DRIVEN** | Rich metric card with dark glass theme. Supports drill-down links and action callbacks. |
| **LiveSessionCTA** | `LiveSessionCTA.tsx` | `sessionId`, `scheduledStart`, `durationMinutes`, `attended`, `meetingUrl?`, `recordingUrl?` | **PROPS-DRIVEN** | Derives state from props (scheduled/live/missed/completed) via date-fns. "Join Meeting" opens `meetingUrl`. Navigate to recovery/recap routes. |
| **MetricCard** | `MetricCard.tsx` | `title`, `value`, `trend?`, `trendLabel?`, `icon?`, `subtitle?` | **PROPS-DRIVEN** | Simple metric display with mini bar chart decoration. |
| **NotificationPreferences** | `NotificationPreferences.tsx` | — | **REAL API** (partial) | Calls `IntegrationsService.sendWhatsAppTemplate()` for test. Channels: WhatsApp toggle + test, SMS (disabled), Email (enabled). Hardcoded phone number. |
| **ParentResourceEngagementPanel** | `ParentResourceEngagementPanel.tsx` | — | **HARDCODED** | `MOCK_CHILD_RESOURCES` (3 items). Shows child's resource status (not_started/in_progress/completed) with teacher messages. |
| **StudentActionCenter** | `StudentActionCenter.tsx` | — | **HYBRID** | Attempts `apiGet(API_ENDPOINTS.ASSESSMENTS)`, falls back to `DEFAULT_MOCK_ACTIONS` (6 items: project due, exercise, missed session, etc.). DashboardGrid layout. |
| **StudentMotivationEngine** | `StudentMotivationEngine.tsx` | — | **HARDCODED** | Level 4 Academician, Top 8%, 120/200 XP. Career trajectory: Software Engineering 72%→85%. +15% Physics improvement velocity. |
| **StudentPlatformLaunchpad** | `StudentPlatformLaunchpad.tsx` | — | **HARDCODED** | 4 navigation cards: Exams & Registration, Project Workspaces, Academic Marketplace, Maple AI Tutor. Static links. |
| **StudentResourceEngagementPanel** | `StudentResourceEngagementPanel.tsx` | — | **HARDCODED** | `MOCK_ASSIGNED_RESOURCES` (6 items). "Continue Learning" grid with progress bars. Navigates to `/library`. |
| **TeacherAssignmentManager** | `TeacherAssignmentManager.tsx` | — | **HARDCODED** | Mock 4 teachers, 6 subjects. Local state for assignment mapping. Toast on assign/remove. No API. |
| **TeacherInterventionPanel** | `TeacherInterventionPanel.tsx` | — | **HARDCODED** | `INTERVENTION_SUGGESTIONS` (2 items). Struggling students count, suggested resources, peer leaders. "Review & Assign Intervention" button (no handler). |
| **TeacherRedAlertsPanel** | `TeacherRedAlertsPanel.tsx` | — | **HARDCODED** | `mockAlerts` (2 students). Critical/high risk alerts with "Message Parent" and "Draft Remedial Task" buttons. Links to `/dashboard/teacher/targeting`. |
| **TeacherResourceEngagementPanel** | `TeacherResourceEngagementPanel.tsx` | — | **HARDCODED** | `MOCK_RESOURCE_ANALYTICS` (2 resources). Shows opened/active time/completion metrics. Alert for missing students. |
| **TopicConfidenceRadar** | `TopicConfidenceRadar.tsx` | `topicsConfidence: Array<{subject, confidence}>` | **PROPS-DRIVEN** | Recharts RadarChart visualization of topic confidence scores. |
| **UNEBReadinessGauge** | `UNEBReadinessGauge.tsx` | `score`, `examTarget` (UCE/UACE), `predictedDivision?` | **PROPS-DRIVEN** | Recharts PieChart gauge for exam readiness score. |
| **WhatsAppCommunicationHub** | `WhatsAppCommunicationHub.tsx` | `isOpen`, `onClose`, `defaultRecipient?` | **HARDCODED** | Full WhatsApp-clone chat UI with hardcoded mock messages (3). Sentiment analysis toolbar, chat bubbles, input. Local state only. |

---

## 3. Dashboard Layout Components

`src/components/dashboard/layout/`

| Component | File | Props | Data Source | Description |
|-----------|------|-------|-------------|-------------|
| **DashboardCard** | `DashboardCard.tsx` | `colSpan` (1-12), `variant` (default/transparent/glass), `orientation?` | None | Grid card wrapper with responsive column spans. |
| **DashboardGrid** | `DashboardGrid.tsx` | `columns` (1/2/3/4/12) | None | CSS Grid container with responsive breakpoints. |
| **DashboardSection** | `DashboardSection.tsx` | `title`, `description?`, `action?` | None | Section wrapper with heading, description, and action slot. |
| **GlassDashboardLayout** | `GlassDashboardLayout.tsx` | — | None | Dark-mode dashboard shell. Forces `dark` class on `<html>` at mount. Renders `<TopNavbar isGlass>`, `<Outlet>`, footer, `<AICopilotWidget>`. |

---

## 4. Navigation

`src/components/navigation/`

| Component | File | Props | Data Source | Description |
|-----------|------|-------|-------------|-------------|
| **TopNavbar** | `TopNavbar.tsx` | `isGlass?` | `useAuth()` | Responsive top nav. Role-conditional links (Home, Classes, Resource Center, Live Sessions, Marketplace, Learning Path). Desktop dropdowns (Engage, Tools) + mobile Sheet sidebar. User avatar + logout. Active state via `useLocation()`. |

---

## 5. Auth

`src/components/auth/`

| Component | File | Props | Data Source | Description |
|-----------|------|-------|-------------|-------------|
| **PermissionGuard** | `PermissionGuard.tsx` | `require?`, `requireAny?`, `requireAll?`, `fallback?` | `usePermissions()` | Renders children if permission check passes; otherwise renders fallback (defaults to `null`). |

---

## 6. Academic / Resource Components

`src/components/academic/`

| Component | File | Props | Data Source | Description |
|-----------|------|-------|-------------|-------------|
| **ResourceUploadModal** | `ResourceUploadModal.tsx` | `isOpen`, `onClose`, defaults for subject/class/topic/lesson | **REAL API** | Posts FormData to `/resources/resource/`. Form: title, resource type (8 types), subject, class, topic, lesson, visibility, file upload or external URL. |
| **ResourceCard** | `ResourceCard.tsx` | `id`, `title`, `description`, `author`, `category`, `price`, `rating`, `fileType`, `onClick`, `onDownload` | **PROPS-DRIVEN** | Presentational card with file-type icon, rating, price badge. |
| **ResourceFilter** | `ResourceFilter.tsx` | `onFilterChange`, `categories` | **PROPS-DRIVEN** | Search input + category dropdown + sort-by select. Callbacks to parent. |
| **ResourceViewer** | `ResourceViewer.tsx` | `resource: Resource`, `studentId`, `onClose` | **LOCAL STATE** | Full-screen viewer. Uses `useResourceEngagement()` + `useStudentContinuity()`. Tracks scroll progress (PDFs), simulated video progress. AI Tutor sidecar toggle. |
| **VideoPlayer** | `VideoPlayer.tsx` | `isOpen`, `onClose`, `vimeoVideoId`, `title` | None | Simple Vimeo iframe embed in a dialog modal. |
| **AssignmentCreateModal** | `AssignmentCreateModal.tsx` | `isOpen`, `onClose`, `contextType`, `contextName`, `subjectName`, `className` | **REAL API** | Posts to `/assessments/assessment/`. Form: title, type (worksheet/quiz/project/intervention), max score, due date, instructions, audience targeting (all/at-risk/enrichment). |
| **DiscussionThread** | `DiscussionThread.tsx` | `contextType`, `contextId`, `contextName` | **HYBRID** | Fetches `/discussions/thread/`; posts to `/discussions/thread/` and `/discussions/post/`. Falls back to `DEFAULT_MOCK_POSTS`. Threaded discussions with replies. |
| **ProjectActivityPanel** | `ProjectActivityPanel.tsx` | `contextType`, `contextId`, `contextName` | **HARDCODED** | `MOCK_PROJECTS`, `MOCK_COMPLETED`. Active/completed project cards with progress. |

---

## 7. AI Copilot Components

`src/components/copilot/`

| Component | File | Props | Data Source | Description |
|-----------|------|-------|-------------|-------------|
| **AICopilotWidget** | `AICopilotWidget.tsx` | — | **REAL API** (via context) | Floating action button + slide-out Sheet chat. Quick chips ("Physics Quiz", "Summarize Lesson"). Posts to `/ai/copilot/ask/` via `useCopilot()` context. |
| **AITeacherCopilotWidget** | `AITeacherCopilotWidget.tsx` | — | **REAL API** | Self-contained chat widget for teachers. Posts to `/ai/copilot/ask/` with `context: 'teacher_studio'`. Floating button + card-based panel. |
| **MessageBubble** | `MessageBubble.tsx` | `message: AICopilotMessage` | **PROPS-DRIVEN** | Uses ReactMarkdown for AI responses. User messages in plain text. |

---

## 8. Forms

`src/components/forms/`

| Component | File | Props | Data Source | Description |
|-----------|------|-------|-------------|-------------|
| **DynamicSchemaForm** | `DynamicSchemaForm.tsx` | `config: FormSchemaConfig`, `onSubmitSuccess?` | **REAL API** | Generic form renderer using react-hook-form + Zod validation. Supports text, number, date, select, checkbox, textarea. Posts to `config.endpoint`. Used by Finance schemas. |

---

## 9. Badges & Certificates

`src/components/badges/`

| Component | File | Props | Data Source | Description |
|-----------|------|-------|-------------|-------------|
| **BadgeShowcase** | `BadgeShowcase.tsx` | `badges: AchievementBadge[]` | **PROPS-DRIVEN** | Grid of badge icons with rarity (common/rare/epic) color coding. |
| **CertificateCard** | `CertificateCard.tsx` | `certificate: Certificate`, `isPublicView?` | **PROPS-DRIVEN** | Certificate display with verification hash, download PDF / share actions. |

---

## 10. Competition & Gamification

`src/components/competition/`

| Component | File | Props | Data Source | Description |
|-----------|------|-------|-------------|-------------|
| **AchievementShowcase** | `AchievementShowcase.tsx` | `badges: AchievementBadge[]` (with `category`) | **PROPS-DRIVEN** | Category-based icons (academic, social, attendance, leadership). |
| **ActiveChallengeCard** | `ActiveChallengeCard.tsx` | `challenge: ActiveChallenge`, `isStudentView?` | **PROPS-DRIVEN** | Progress bar, participants, reward, days remaining. Start/view details actions. |
| **HouseStandingsCard** | `HouseStandingsCard.tsx` | `houses: HouseData[]`, `userHouseId?`, `institutionName` | **PROPS-DRIVEN** | Sorted house competition bars. Dark glass theme. Highlights user's house. |
| **Leaderboards** | `Leaderboards.tsx` | `boards: LeaderboardData[]`, `currentStudentId` | **PROPS-DRIVEN** | Tabbed leaderboard with **anti-shame algorithm** (shows top 3 + neighbors of current user, never bottom). |
| **MeritEngineWidget** | `MeritEngineWidget.tsx` | `totalPoints`, `housePointsContributed`, `recentEvents: MeritEvent[]` | **PROPS-DRIVEN** | Points summary + merit activity feed. |
| **StreakTracker** | `StreakTracker.tsx` | `streaks: StreakData[]` | **PROPS-DRIVEN** | Active/at-risk/broken streak cards with maintenance actions. |

---

## 11. Parents

`src/components/parents/`

| Component | File | Props | Data Source | Description |
|-----------|------|-------|-------------|-------------|
| **ParentActionCenter** | `ParentActionCenter.tsx` | — | **HYBRID** | Fetches `API_ENDPOINTS.INTELLIGENCE_PARENT_ACTIONS`, posts `{id}/acknowledge/`. Falls back to `FALLBACK_ACTIONS` (3 items). Action items with "Help at Home" guidance, acknowledge button, request teacher meeting. |

---

## 12. Pastoral

`src/components/pastoral/`

| Component | File | Props | Data Source | Description |
|-----------|------|-------|-------------|-------------|
| **PastoralTimeline** | `PastoralTimeline.tsx` | — | **HARDCODED** | Mock timeline (3 entries: commendation, counseling, incident). Logging form: type select, house points/demerits, narrative, visibility control (counselor-restricted). Toast on save (no API persist). |

---

## 13. Students

`src/components/students/`

| Component | File | Props | Data Source | Description |
|-----------|------|-------|-------------|-------------|
| **SmartStudyPlanner** | `SmartStudyPlanner.tsx` | `dailyPlan`, `mode` (interactive/readonly/assign), `title?`, `description?` | **PROPS-DRIVEN** | Task types: weak_topic, deadline, missed_work, exam_prep, custom. Interactive mode: mark complete + add custom tasks. |
| **StudentPassport** | `StudentPassport.tsx` | `data: StudentPassportData` | **PROPS-DRIVEN** | Comprehensive student profile: academic GPA, attendance, career signals, leadership roles, competency matrix (skills with progress bars), portfolio/projects. |

---

## 14. Teachers

`src/components/teachers/`

| Component | File | Props | Data Source | Description |
|-----------|------|-------|-------------|-------------|
| **AITeachingPartner** | `AITeachingPartner.tsx` | — | **SIMULATED** | Generate/Analyze tabs. Quick actions: 5-Q Topic Quiz, Grading Rubric, Simpler Explanation, Lesson Plan. Uses `setTimeout` to produce canned AI output. Custom prompt input. No real API. |
| **ClassHealthCard** | `ClassHealthCard.tsx` | `id`, `className`, `subject`, `attendancePct`, `avgPerformance`, `redAlertStudents`, `weakestTopic`, `improvementTrend`, `onIntervene?` | **PROPS-DRIVEN** | Class health summary with attendance %, avg score, at-risk count, weak topic. "Launch Intervention" CTA when at-risk. |
| **IndependentEarningsIntelligence** | `IndependentEarningsIntelligence.tsx` | — | **HARDCODED** | Content stats: 42 Videos, 18 Notes, 3 Books. "1,240 active students across 45 institutions." Static motivational copy. "Upload New Resource" button. |
| **InstitutionTeacherWellness** | `InstitutionTeacherWellness.tsx` | — | **HARDCODED** | Weekly load (28 Hours), Burnout Risk (Moderate). "Smart Cover" handover package generation (simulated via local state toggle). "Submit Cover Request to DOS" button. |
| **NextBestActionQueue** | `NextBestActionQueue.tsx` | `actions: ActionQueueItem[]` | **PROPS-DRIVEN** | Sorted action queue (high→medium→low priority). Types: urgent_academic, attendance_risk, grading_blocker, payout_blocker, peer_support, followup. "Message Parents" opens WhatsAppCommunicationHub. |
| **ParentCommunicationCopilot** | `ParentCommunicationCopilot.tsx` | — | **SIMULATED** | Student name input + context select (attendance/praise/intervention). `setTimeout`-based draft generation. Editable textarea output. "Send via Platform" button (no API). |
| **ResourceEffectivenessIntelligence** | `ResourceEffectivenessIntelligence.tsx` | `resources: ResourceEffectivenessItem[]`, `subjectContext` | **PROPS-DRIVEN** | Resource impact analysis: views, completion rate, impact score (% score jump/drop). Status badges: highly_effective/ignored/needs_revision/standard. |
| **SmartInterventionBundle** | `SmartInterventionBundle.tsx` | `data: InterventionBuilderData` | **PROPS-DRIVEN** | 1-click intervention builder. Toggle resources in/out of bundle (video/note/quiz/discussion/peer_support/parent_note). "Dispatch to N Students" button (UI mock, no API). |
| **TeacherCollabHub** | `TeacherCollabHub.tsx` | — | **HARDCODED** | Shared intervention preview ("Mr. Okello shared an Intervention"), department resource request. "Clone Bundle" and "Share Resource" buttons. Institution-scoped feature. |
| **TeacherCompetitionLeaderboards** | `TeacherCompetitionLeaderboards.tsx` | — | **HARDCODED** | 4 leaderboard cards: Content Review Stars, Most Accessed Content, Top Platform Earners, Best Class Attendance. 5 entries each with rank icons (Crown/Medal/Award). |
| **TeacherGrowthPassport** | `TeacherGrowthPassport.tsx` | — | **HARDCODED** | Level 4 "Master Teacher" with XP progress (1550/2000). 12-day streak. Earned badges (Turnaround, Creator, Intervention). Recent commendations. Weekly challenge CTA. Motivational stats (+12% student scores, Top 15%). |
| **TeacherPayoutStatusCard** | `TeacherPayoutStatusCard.tsx` | — | **HARDCODED** | Payout dashboard: UGX 450,000 available. 42 total lessons, 38 qualified. Earnings: 680K/month, 1.25M/quarter, 4.5M/year. "Request Payout" button (no API). |
| **TeacherPerformanceStory** | `TeacherPerformanceStory.tsx` | — | **HARDCODED** | AI-generated narrative: "14% positive jump in Mathematics". Stats: Top 10% Impact, 2.1k Resource Views, 92% Retention. Primary-colored card. |
| **TeacherQualityScore** | `TeacherQualityScore.tsx` | `metrics: TeacherQualityMetrics` | **PROPS-DRIVEN** | Educator Impact Score with progress bars: Consistency, Engagement, Growth, Turnaround (days). Focus Goal text. Private AI coaching metrics. |
| **TeacherReflectionAssistant** | `TeacherReflectionAssistant.tsx` | — | **SIMULATED** | 3-phase flow: prompt → input textarea → completed. Weekly reflection journal. "Log Journal" saves to local state. "Securely saved to Growth Passport" (no API). |
| **TeachingWinsTimeline** | `TeachingWinsTimeline.tsx` | `wins: TeachingWin[]` | **PROPS-DRIVEN** | Vertical timeline of achievements. Types: score_jump, payout_qualified, resource_popular, badge_earned, attendance_improved, intervention_success. |
| **VoiceNoteWidget** | `VoiceNoteWidget.tsx` | — | **SIMULATED** | Record/playback UI mock. Tap to record → fake 14s recording → playback bar. "Attach to Topic" button. No real MediaRecorder integration. |

---

## 15. Institutions

`src/components/institutions/`

| Component | File | Props | Data Source | Description |
|-----------|------|-------|-------------|-------------|
| **AIAdminReportAssistant** | `AIAdminReportAssistant.tsx` | — | **SIMULATED** | Report types: Weekly School Summary, Academic Review, Teacher Performance, Board Report, Parent Communication. `setTimeout`-based draft generation with canned content. Copy/share/regenerate actions. |
| **ExamWarRoomMode** | `ExamWarRoomMode.tsx` | — | **HARDCODED** | UNEB O-Level exam countdown (T-24 days). KPIs: 42 unpaid candidates, 14 chronic absentees, 89 missing assignments, 5 priority revision groups. Subject readiness progress bars. Weak topics table with failure rates. "Assign Emergency Quizzes" button. |
| **InstitutionBillingPortal** | `InstitutionBillingPortal.tsx` | `activeStudents?` (120), `unpaidSeats?` (120) | **SIMULATED** | Plan selection: Monthly (15K UGX), Termly (45K UGX), Annual (120K UGX). Total due calculation. "Proceed to Secure Payment" redirects to mock PesaPal URL. No real payment API. |
| **SchoolHealthScore** | `SchoolHealthScore.tsx` | `metrics: HealthScoreMetrics` | **PROPS-DRIVEN** | Composite health index from 6 metrics: attendance, academicPerformance, teacherPunctuality, behavior, parentEngagement, interventionCompletion. Score color-coded (green ≥90, blue ≥75, amber ≥60, red <60). Progress bars for each metric. |
| **StudentOnboardingForm** | `StudentOnboardingForm.tsx` | — | **REAL API** | 3-step wizard: (1) Profile — name + class level + LIN. (2) Parent & Pay — posts to `/institutions/learner-registrations/start_registration/`, then auto-verifies payment via `/verify_payment/`. (3) Account — 4-digit PIN creation, calls `/finalize_account/`. Generates student ID + username. Sibling detection via parent phone. |

---

## 16. Marketplace

`src/components/marketplace/`

| Component | File | Props | Data Source | Description |
|-----------|------|-------|-------------|-------------|
| **MarketplaceUploadModal** | `MarketplaceUploadModal.tsx` | `isOpen`, `onClose`, `defaultCountry?` | **REAL API** | Step 1: Country/Subject/Class/Topic selection — fetches `/curriculum/subjects/` for cascading dropdowns. Step 2: Resource details (type, title, description, price). Posts to `/marketplace/listing/`. Strict curriculum tagging enforced. |
| **TeacherMonetizationDashboard** | `TeacherMonetizationDashboard.tsx` | — | **REAL API** | Fetches 4 endpoints in parallel: `/marketplace/monetization-overview/`, `/lesson-qualifications/`, `/payout-profile/`, `/payouts/eligibility/`. Displays: access fee recovery progress, remaining balance, net payable payout. Payout profile (MTN/Airtel mobile money). "Request Payout Now" posts to `/marketplace/payouts/`. Full CRUD on payout profile. |
| **VerifiedTeacherBadge** | `VerifiedTeacherBadge.tsx` | `isVerified`, `reputation?` (responseRate, avgResponseTimeMins, badges, reviewCount), `compact?` | **PROPS-DRIVEN** | "Verified Expert" badge with tooltip. Reputation stats: response rate, response time, earned badges. Hidden when `!isVerified`. |

---

## 17. Admin / Platform

`src/components/admin/`

| Component | File | Props | Data Source | Description |
|-----------|------|-------|-------------|-------------|
| **AlumniOutcomesTracker** | `AlumniOutcomesTracker.tsx` | — | **HARDCODED** | Platform stats: 12.4K tracked alumni, 76% university rate, 4,200 direct hires. Recent outcomes list (3 alumni with university/job placements). |
| **CurriculumDistributionMap** | `CurriculumDistributionMap.tsx` | `topicName?`, `isOpen`, `onClose` | **HARDCODED** | Full-screen modal with 2 tabs: (1) National Grade Curve — CSS bar chart with 6 grade bands, 15,200 total students, 62% national average. (2) Institutional Heatmap — 6 regions with org counts + local averages. Color-coded by health status. |
| **GlobalCurriculumHealth** | `GlobalCurriculumHealth.tsx` | `onOpenMap?` | **HARDCODED** | 3-column layout: Mastered (green, Biology: Genetics 82%), Warning (amber, Physics: Kinematics 54%), Critical (red, Chem: Mole Concept 38%). "Alert Department Heads" / "Broadcast Institution Alerts" buttons (simulated send with local state). |
| **GlobalInstitutionComparison** | `GlobalInstitutionComparison.tsx` | — | **HARDCODED** | Table of 5 institutions with health index, trend, tier (Premium/Standard/Trial). Inline progress bars. Alert icons for health < 60. Local `Button` component defined in file. |
| **PlatformAnalyticsTabs** | `PlatformAnalyticsTabs.tsx` | — | **HYBRID** | Fetches `/analytics/admin-dashboard/`. Maps server KPIs into comprehensive `PlatformData` structure with revenue breakdown, user statistics, geographic coverage, performance metrics, financial projections. Falls back to derived/placeholder values when API data is partial. Uses Recharts (LineChart, BarChart, PieChart). |

---

## 18. Custom UI Primitives

`src/components/ui/`

| Component | File | Props | Data Source | Description |
|-----------|------|-------|-------------|-------------|
| **EmptyState** | `EmptyState.tsx` | `icon?`, `title`, `description`, `actionLabel?`, `onAction?` | **PROPS-DRIVEN** | Dashed-border card with centered icon, title, description, and optional CTA button. |
| **PremiumEmptyState** | `PremiumEmptyState.tsx` | `icon`, `title`, `description`, `actionLabel?`, `onAction?` | **PROPS-DRIVEN** | Enhanced empty state with glow effect behind icon. Full-width rounded container. |
| **PremiumLockState** | `PremiumLockState.tsx` | `title`, `description`, `actionLabel?`, `onAction?`, `mockContent?` | **PROPS-DRIVEN** | Frosted glass overlay atop obscured mock content. Crown/Lock icon animation. "Unlock Feature" CTA. For paywalled features. |

### Editorial Design System

`src/components/ui/editorial/`

| Component | File | Props | Data Source | Description |
|-----------|------|-------|-------------|-------------|
| **EditorialHeader** | `EditorialHeader.tsx` | `level` (h1-h4), `weight` (light/normal/medium/bold), `align` | None | Editorial-style heading with large typography (up to 5rem). Light weight support for magazine aesthetic. |
| **EditorialPanel** | `EditorialPanel.tsx` | `variant` (default/elevated/glass/flat/frosted-rose), `elevation`, `radius`, `padding` | None | Container with glassmorphism variants, large rounded corners, soft shadows. |
| **EditorialPill** | `EditorialPill.tsx` | `variant` (primary/secondary/outline/ghost/dark/glass), `size`, `iconLeft?`, `iconRight?`, `asChild?` | None | Pill-shaped button with magazine-style design. Supports `Slot` via `asChild`. |

### Shadcn/UI Primitives (48 files)

Standard shadcn/radix components: `accordion`, `alert-dialog`, `alert`, `aspect-ratio`, `avatar`, `badge`, `breadcrumb`, `button`, `calendar`, `card`, `carousel`, `chart`, `checkbox`, `collapsible`, `command`, `context-menu`, `dialog`, `drawer`, `dropdown-menu`, `form`, `hover-card`, `input-otp`, `input`, `label`, `menubar`, `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `sonner`, `switch`, `table`, `tabs`, `textarea`, `toast`, `toaster`, `toggle-group`, `toggle`, `tooltip`.

---

## 19. Hooks

`src/hooks/`

| Hook | File | Data Source | Description |
|------|------|-------------|-------------|
| **useIntelligence** | `useIntelligence.ts` | **HYBRID** | Multiple hooks: `useNextBestActions()` fetches/generates NBA actions from `/intelligence/actions/` and `/intelligence/actions/generate/`; `useStudyPlanner()` fetches/generates study plans from `/intelligence/study-plans/`. Both have mock fallback data. Also exports `useStudentHealth()`, `useStudentPassport()`. |
| **usePermissions** | `usePermissions.ts` | **LOCAL** | Returns `hasPermission()`, `hasAnyPermission()`, `hasAllPermissions()`. Checks platform role matrix first, then institutional role matrix. Platform admin gets full override. Uses `useAuth()`. |
| **useResourceEngagement** | `useResourceEngagement.ts` | **LOCAL STATE** | Tracks active reading/watching time (1-second interval). Pauses on blur/visibility change. Returns `reportProgress()`, `getEngagementSnapshot()`. No API persistence. |
| **useStudentContinuity** | `useStudentContinuity.ts` | **LOCAL STATE** | Manages `lastReadingResource`, `lastVideoResource`, `lastLearningNode` in localStorage. Cross-tab sync via custom events. |
| **useIsMobile** | `use-mobile.tsx` | **Browser API** | Simple boolean hook — breakpoint at 768px via `matchMedia`. |
| **useToast** | `use-toast.ts` | **LOCAL STATE** | Shadcn toast management with reducer pattern. `toast()`, `dismiss()`, `toasts` array. |

---

## 20. Contexts

`src/contexts/`

| Context | File | Data Source | Provides | Description |
|---------|------|-------------|----------|-------------|
| **AuthContext** | `AuthContext.tsx` | **REAL API** | `user`, `userProfile`, `login`, `register`, `logout`, `isLoading`, `switchStudentContext`, `currentContext`, `countryCode`, `onboardStudent` | Full JWT auth flow: `loginUser()` → `/auth/login/`, `registerUserAPI()` → `/auth/register/`. Access + refresh tokens in localStorage. Auto-refresh on 401. Role inference from email patterns (`@admin`, `@institution`). `switchStudentContext()` toggles independent ↔ institutional context. |
| **AICopilotContext** | `AICopilotContext.tsx` | **REAL API** | `isOpen`, `messages`, `sendMessage`, `isLoading`, `clearHistory` | Chat state management. Posts to `/ai/copilot/ask/`. Greeting message on init. Offline error handling. Message history in local state. |

---

## 21. Lib / Utilities

`src/lib/`

| File | Type | Description |
|------|------|-------------|
| **apiClient.ts** | API Client | Comprehensive `fetch`-based client with JWT access/refresh token management. Defines **50+ `API_ENDPOINTS`** covering: auth, curriculum, institutions, marketplace, live-sessions, assessments, classes, lessons, resources, discussions, notifications, dashboards (student/teacher/admin/institution), intelligence engine (actions, interventions, study plans, parent actions), gamification (points, badges, challenges, houses), learning progress, national exams, story cards, health, passport. Auto-refresh on 401 via `/auth/token/refresh/`. |
| **api.ts** | API Client | Simpler Axios instance at `http://localhost:8000/api/v1`. Request interceptor adds `Bearer` token from `maple-access-token`. Response interceptor logs 401s. Some components use this instead of `apiClient`. |
| **permissions.matrix.ts** | RBAC Config | `Permission` enum (17 permissions: VIEW_DASHBOARD, MANAGE_STUDENTS, MANAGE_CLASSES, CREATE_CONTENT, GRADE_WORK, etc.). `PlatformRole` (5): platform_admin, universal_student, independent_teacher, parent, institution_admin. `InstitutionalRole` (11): head_teacher, dos, registrar, class_teacher, subject_teacher, bursar, librarian, counselor, ict_admin, patron, matron. Full role→permission matrices. |
| **utils.ts** | Utility | Single `cn()` function — `twMerge(clsx(...))` for Tailwind class merging. |
| **offlineSync.ts** | Mock Service | `OfflineSyncEngine` with `queueJob()`, `processQueue()`, `cacheMediaForOffline()`. **All console.log stubs** — designed for future Service Worker + IndexedDB integration. Used by `NetworkStatusWidget`. |
| **integrations.ts** | API Service | `IntegrationsService.sendWhatsAppTemplate()` → posts to `/notifications/notification/send-whatsapp/`. `IntegrationsService.provisionWebinar()` → posts to `/live-sessions/live-session/provision-webinar/`. **REAL API** calls. |
| **subjectConfig.ts** | Static Data | Full Uganda UNEB curriculum catalogue: O-Level core (7 subjects), O-Level lower compulsory (4 more), O-Level electives (4), A-Level compulsory (GP), A-Level subsidiaries (2), A-Level principals (9). Common A-Level combinations (PCM, PCB, BCM, MEG, HEL). Subject validation functions for O-Level (min 8, max 9) and A-Level (GP + 3 principals + 1 subsidiary = 5). |

### Curriculum Directory

`src/lib/curriculum/`

| File | Description |
|------|-------------|
| **index.ts** | Barrel export for curriculum modules. |
| **types.ts** | Curriculum type definitions shared across country configs. |
| **uganda.ts** | Uganda-specific curriculum structure. |
| **kenya.ts** | Kenya-specific curriculum structure. |
| **rwanda.ts** | Rwanda-specific curriculum structure. |

---

## 22. Schemas

`src/schemas/`

| File | Data Source | Description |
|------|-------------|-------------|
| **financeSchemas.ts** | Config for `DynamicSchemaForm` | 3 form configurations with Zod schemas and field definitions: (1) **FeeItemConfig** — create fee categories (tuition/boarding/transport/exam/uniform/books/activity/ict/medical/other) at `/institutions/{id}/finance/fee-categories/`. (2) **OfflinePOSReceiptConfig** — log payments (cash/mobile_money/bank_transfer/cheque) at `/institutions/{id}/finance/payments/`. (3) **ExpenseRecordConfig** — journal entries at `/institutions/{id}/finance/journal-entries/`. All use `buildFinanceEndpoint()` helper for institution-scoped URLs. |

---

## 23. Types

`src/types/index.ts`

Core TypeScript type definitions:

- **User** — id, username, email, roles, auth fields
- **UniversalStudent** — extends User with `student_statuses`, `preferences`, `uneb_readiness`, covers both independent and institutional enrollment
- **IndependentStudentStatus** / **InstitutionalStudentStatus** — enrollment and class status types
- **Institution** — with `subscription`, `public_profile`, `exam_center` configurations
- **IndependentTeacher** — with `professional_info`, `membership`, `marketplace_profile`, `bank_details`
- **Student** / **Teacher** — legacy types (simpler)
- **Administrator** — id, email, title, permissions
- **Lesson** — video/exercise/notes with completion status
- **Subtopic** / **Topic** / **Subject** / **Term** / **UgandaClass** / **UgandaLevel** — curriculum hierarchy
- **SubjectType** / **SubjectCombination** / **ExamInfo** — UNEB exam types
- **ForumReply** / **ForumPost** / **ForumCategory** — discussion forum types
- **WebinarSession** — Google Meet/Calendar live session with scheduling, attendance, recording
- **UgandaSubject** / **UNEBSubjectCombination** / **UNEBRegistration** — UNEB exam registration types

---

## 24. Summary Matrix

### Data Source Distribution

| Category | REAL API | HYBRID | HARDCODED/SIMULATED | PROPS-DRIVEN | LOCAL STATE |
|----------|----------|--------|---------------------|--------------|-------------|
| Root Components | 1 | 0 | 0 | 0 | 1 |
| Dashboard | 1 | 1 | 14 | 5 | 1 |
| Dashboard Layout | 0 | 0 | 0 | 0 | 0 |
| Navigation | 0 | 0 | 0 | 0 | 0 |
| Auth | 0 | 0 | 0 | 0 | 0 |
| Academic | 2 | 1 | 1 | 3 | 1 |
| Copilot | 2 | 0 | 0 | 1 | 0 |
| Forms | 1 | 0 | 0 | 0 | 0 |
| Badges | 0 | 0 | 0 | 2 | 0 |
| Competition | 0 | 0 | 0 | 6 | 0 |
| Parents | 0 | 1 | 0 | 0 | 0 |
| Pastoral | 0 | 0 | 1 | 0 | 0 |
| Students | 0 | 0 | 0 | 2 | 0 |
| Teachers | 0 | 0 | 10 | 4 | 0 |
| Institutions | 1 | 0 | 2 | 1 | 0 |
| Marketplace | 2 | 0 | 0 | 1 | 0 |
| Admin | 0 | 1 | 3 | 0 | 0 |
| UI Custom | 0 | 0 | 0 | 6 | 0 |
| **TOTALS** | **10** | **4** | **31** | **31** | **3** |

### Key Findings

1. **~31 components use hardcoded/simulated data** — the largest category. These are fully UI-functional but not connected to real backend data.

2. **~10 components make real API calls**: `ActiveAssessment`, `BulkInviteModal`, `ResourceUploadModal`, `AssignmentCreateModal`, `AICopilotWidget`, `AITeacherCopilotWidget`, `DynamicSchemaForm`, `StudentOnboardingForm`, `MarketplaceUploadModal`, `TeacherMonetizationDashboard`.

3. **~4 components are hybrid** (attempt API, fall back to mock): `StudentActionCenter`, `DiscussionThread`, `ParentActionCenter`, `PlatformAnalyticsTabs`.

4. **~31 components are purely props-driven** — they receive data from parent components and need no direct API integration.

5. **Dual API client pattern**: `apiClient.ts` (fetch-based with JWT refresh) and `api.ts` (Axios-based). Some components use one, some the other. Should be unified.

6. **Full RBAC system** is implemented: 17 permissions × 16 roles with `usePermissions` hook + `PermissionGuard` component + `ProtectedRoute` wrapper.

7. **Offline support** is stubbed (`OfflineSyncEngine`) but not implemented. Only `NetworkStatusWidget` references it.

8. **Uganda UNEB curriculum** is deeply embedded: subject catalogs, A-Level combinations, validation rules, and the MarketplaceUploadModal requires strict curriculum tagging.

9. **Finance ERP** is partially wired: 3 Zod-based form schemas for fee items, POS receipts, and expense journal entries are configured but depend on `DynamicSchemaForm` + institution context.

10. **Teacher dashboard** is the richest feature area (17 components) but almost entirely hardcoded/simulated — no components in this area make real API calls.
