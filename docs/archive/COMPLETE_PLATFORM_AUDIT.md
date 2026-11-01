# MAPLE ONLINE SCHOOL — COMPLETE PLATFORM AUDIT & FEATURE INVENTORY

**Date**: 8 April 2026  
**Scope**: Full-stack product audit — backend, frontend, features, roles, workflows, maturity  
**Methodology**: Code-level deep inspection of all 21 Django apps, 45 page files, ~80 components, all hooks/contexts/libs

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Complete Feature Inventory by Domain](#2-complete-feature-inventory-by-domain)
3. [Detailed Feature Documentation](#3-detailed-feature-documentation)
4. [Role-Based Experience Map](#4-role-based-experience-map)
5. [Feature Relationship Map](#5-feature-relationship-map)
6. [Implementation Maturity Report](#6-implementation-maturity-report)
7. [Weak / Missing Feature Report](#7-weak--missing-feature-report)
8. [Recommended Next Priorities](#8-recommended-next-priorities)

---

# 1. EXECUTIVE SUMMARY

## What This Platform Is

Maple Online School is a **full-stack EdTech operating system** designed for the East African education market (Uganda, Kenya, Rwanda). It serves multiple user roles across institutional and independent learning contexts, with deep curriculum alignment to UNEB (Uganda National Examinations Board) standards.

The platform attempts to be an all-in-one solution covering: learning management, live sessions, assessments, marketplace, finance/ERP, analytics, AI tutoring, gamification, parent engagement, institutional management, and teacher monetization.

## Platform Scale

| Dimension | Count |
|-----------|-------|
| Backend Django Apps | 21 |
| Database Models | 100+ |
| API Endpoints | 75+ |
| Frontend Pages | 45 |
| Frontend Components | ~80 feature components + 48 UI primitives |
| Routes | ~35 unique routes |
| User Roles | 16 (5 platform-level + 11 institutional) |
| Permissions | 17 defined |

## Strongest Areas

1. **Curriculum & Academic Structure** — Deep UNEB-aligned curriculum hierarchy (Country → Track → Level → Class → Subject → Topic → Subtopic → Lesson) with real API and full-tree endpoint
2. **Authentication & Onboarding** — Complete JWT auth with dual-backend (email + system_username), student onboarding with parent auto-creation, institutional learner registration with payment verification
3. **Intelligence Engine** — Sophisticated NBA engine, study planner, health scorer, story card generator with 22 models — the most advanced backend app
4. **Marketplace & Teacher Monetization** — Full payout lifecycle with wallet, eligibility checks, lesson qualification engine, mobile money integration (MTN MoMo), 80/20 revenue split
5. **AI Integration** — Live OpenAI GPT-4o-mini integration for copilot with context routing, graceful mock fallback
6. **Resource Management** — Vimeo video pipeline with async Celery processing, visibility-scoped queries, engagement tracking
7. **Grading System** — NCDC 20/80 formative/summative engine with grade mapping, PDF report card generation via WeasyPrint
8. **RBAC System** — Full 17-permission × 16-role matrix enforced at both route and component levels

## Weakest Areas

1. **Dashboard Action Links** — 30+ broken route references across all 4 dashboards pointing to non-existent routes
2. **Teacher Experience** — 17 teacher components, ALL hardcoded/simulated — zero real API connections
3. **Parent Experience** — Comprehensive dashboard layout but every action button is dead
4. **Placeholder Pages** — 17 pages are 100% mock data with no API integration
5. **Orphaned Pages** — 5 complete pages (including a 90%-done Finance Hub) exist but are not routed
6. **Dual API Client** — Two incompatible API clients (`apiClient.ts` fetch-based, `api.ts` axios-based) used inconsistently
7. **Missing Route Protection** — 4 admin/institutional routes have no `ProtectedRoute` wrapper

## Overall Completion Level

| Category | Estimate |
|----------|----------|
| Backend (models, APIs, business logic) | **75-80%** |
| Frontend UI (component & page shells) | **80-85%** |
| End-to-End Wiring (frontend ↔ backend) | **35-40%** |
| Feature Completeness (usable by real users) | **30-35%** |

The platform has excellent architectural ambition and a strong backend, but the frontend-to-backend wiring gap is the primary blocker preventing real usability.

---

# 2. COMPLETE FEATURE INVENTORY BY DOMAIN

## A. Authentication & Onboarding

| # | Feature | Status |
|---|---------|--------|
| A1 | Email/Password Login | ✅ Fully functional |
| A2 | Demo Account Quick-Login | ✅ Fully functional |
| A3 | Dual Authentication (email + system_username) | ✅ Fully functional |
| A4 | JWT Token Management (access + refresh) | ✅ Fully functional |
| A5 | Student Registration (independent) | ✅ Fully functional |
| A6 | Student Onboarding with Parent Auto-Creation | ✅ Fully functional |
| A7 | Parent-Student Linking | ✅ Backend complete, frontend partial |
| A8 | Institution Onboarding Wizard | ⚠️ 30% — 3 of 10 steps have UI, no API |
| A9 | Independent Teacher Onboarding Wizard | ⚠️ 40% — 4 of 8 steps, no API submission |
| A10 | Role Selection on Registration | ✅ Working (3 paths: Learner, Teacher, Institution) |
| A11 | Teacher Invite Code Verification | ❌ UI present, verification not connected |
| A12 | Forgot Password | ❌ Not implemented (label exists, no flow) |
| A13 | Context Switching (independent ↔ institutional) | ✅ AuthContext supports switchStudentContext() |
| A14 | Institutional Learner Registration (3-step) | ✅ Fully functional (draft → payment → account) |
| A15 | Admin PIN Reset | ✅ Backend complete with audit logging |
| A16 | Sibling Detection (by parent phone) | ✅ Implemented in StudentOnboardingForm |

## B. Class & Academic Navigation

| # | Feature | Status |
|---|---------|--------|
| B1 | Course Catalog (All Classes Grid) | ✅ Real API with filter tabs |
| B2 | Class Syllabus View (Term → Subject → Topic) | ✅ Real API, functional navigation |
| B3 | Subject Topics Page | ✅ Real API, clean listing |
| B4 | Topic Detail Page (Learn + Practice) | ✅ Real API with ResourceViewer |
| B5 | Course Detail Page (Syllabus, Teacher, Reviews) | ⚠️ 70% — Real curriculum API, reviews hardcoded |
| B6 | Class Enrollment | ⚠️ Backend CRUD exists, frontend enrollment simulated (2s timeout) |
| B7 | Learning Path | ⚠️ 20% — Entire page is placeholder with setTimeout |
| B8 | Curriculum Tree API (public) | ✅ Full nested JSON hierarchy |
| B9 | Multi-Country Curriculum (UG/KE/RW) | ✅ Backend models + frontend config for all three |

## C. Resource & Reading Experience

| # | Feature | Status |
|---|---------|--------|
| C1 | Academic Library (Resource Browsing) | ✅ 85% — Real API, search, filters, upload |
| C2 | Resource Discovery Page | ✅ 90% — Real paginated API, download, upload |
| C3 | Resource Upload Modal | ✅ Real API with FormData — supports 8 resource types |
| C4 | Resource Viewer (PDF/Document) | ✅ Full-screen viewer with scroll tracking |
| C5 | Video Player (Vimeo embed) | ✅ Working iframe embed in dialog |
| C6 | Vimeo Upload Pipeline | ✅ Async Celery task with local file cleanup |
| C7 | Continue Reading (localStorage) | ✅ Cross-tab sync via useStudentContinuity |
| C8 | Continue Watching (localStorage) | ✅ Cross-tab sync via useStudentContinuity |
| C9 | Resource Engagement Tracking | ⚠️ Client-side tracking implemented (time, progress), no API persistence |
| C10 | Resource-Lesson Linking | ✅ Backend model exists (ResourceLessonLink) |
| C11 | Shared Resource Links (class-level) | ✅ Backend CRUD exists |
| C12 | Resource Quality Review (NCDC compliance) | ✅ Backend moderation queue with approve action |

## D. Live Learning

| # | Feature | Status |
|---|---------|--------|
| D1 | Live Sessions Page (Discovery) | ⚠️ 70% — Real API with mock fallback, RSVP is local-only |
| D2 | Session Cards (state-aware) | ✅ LiveSessionCTA derives state from dates (scheduled/live/missed/completed) |
| D3 | Join Meeting (Google Meet) | ✅ Opens meeting URL in new tab |
| D4 | Webinar Provisioning (Google Meet) | ✅ Real API + fallback simulator |
| D5 | Missed Session Recovery Page | ⚠️ 20% — Skeleton with hardcoded data, no video playback |
| D6 | Session Replay | ❌ Button exists, no functionality |
| D7 | Session Recording Sync (Drive → Vimeo) | ✅ Celery task + Google Workspace + Vimeo API |
| D8 | Session Reminders | ✅ Backend model + API exists |
| D9 | Meeting Link Clipboard Copy | ✅ Working in TeacherLessonStudio |

## E. Teaching & Assessment

| # | Feature | Status |
|---|---------|--------|
| E1 | Assessment Creation | ✅ AssignmentCreateModal posts to real API |
| E2 | Assessment Windows (time-bounded) | ✅ Backend CRUD |
| E3 | Question Bank (MCQ/Essay/Short Answer) | ✅ Backend CRUD with JSON options |
| E4 | Student Submission System | ✅ Auto-grades MCQ on create |
| E5 | Active Assessment Component | ✅ Real API fetch + submit with grading display |
| E6 | Teacher Lesson Studio | ⚠️ 40% — Webinar provisioning works, everything else mock |
| E7 | Assignment Targeting Studio | ⚠️ 25% — Complete UI, no API integration |
| E8 | Teacher Marks Upload | ⚠️ 30% — UI polished, CSV "upload" fills mock values |
| E9 | Attendance Register (Teacher) | ⚠️ 30% — Interactive UI, save is alert() only |
| E10 | Marking Rubrics | ✅ Backend model exists (JSON criteria) |
| E11 | NCDC Grading Engine (20/80) | ✅ Real grade calculation with letter/descriptor mapping |
| E12 | PDF Report Card Generation | ✅ Celery task + WeasyPrint |
| E13 | Offline Academic Results | ✅ Backend model for score comparison (online vs offline) |
| E14 | National Exam Results (UCE/UACE/PLE) | ✅ Backend model with division counts + subject JSON |
| E15 | Offline Result Upload Page | ⚠️ 20% — Simulated file upload, no real processing |
| E16 | AI Quiz Generator | ✅ Real OpenAI integration in AITeachingAssistant |
| E17 | AI Smart Reply Generator | ✅ Real OpenAI integration |
| E18 | AI Teaching Analytics | ✅ Real OpenAI integration |

## F. Role Dashboards

| # | Feature | Status |
|---|---------|--------|
| F1 | Student Dashboard | ⚠️ 60% — API with mock fallback, all action buttons dead |
| F2 | Teacher Dashboard | ⚠️ 65% — API + hooks wired, most sub-components hardcoded |
| F3 | Admin Dashboard (Maple) | ⚠️ 60% — API with mock fallback, mostly mock cards |
| F4 | Parent Dashboard | ⚠️ 50% — Comprehensive layout, all actions dead |
| F5 | Institution Dashboard | ⚠️ 70% — Extensive with many real sub-components |
| F6 | Dashboard Router (role-based redirect) | ✅ Working redirect from /dashboard to role path |
| F7 | Dashboard Skeleton Loading | ✅ Type-specific loading states |
| F8 | Glass Dashboard Layout | ✅ Dark-mode shell with blur effects |
| F9 | Intelligence Cards (metric display) | ✅ Rich props-driven cards with trends/alerts |
| F10 | Finance/Bursar Dashboard | ⚠️ 90% complete but ORPHANED (not routed) |

## G. Timetable & Operations

| # | Feature | Status |
|---|---------|--------|
| G1 | Timetable Studio Page | ⚠️ 30% — Mock allocation grid, holidays list real |
| G2 | Timetable Slot CRUD (Backend) | ✅ Full CRUD with tenant scoping |
| G3 | Collision Detection Engine | ✅ Teacher/Room/Class overlap detection |
| G4 | Heuristic Auto-Allocator | ✅ Draft timetable generation |
| G5 | Academic Terms Management | ✅ Backend CRUD with is_active flag |
| G6 | Room Management | ✅ Backend CRUD with capacity |
| G7 | Lesson Instance Tracking | ✅ Backend model with cancel/date tracking |
| G8 | Lesson Acknowledgement Flow | ✅ Backend action exists (LessonInstanceViewSet) |
| G9 | Lesson Verification Record (7-step) | ✅ Backend model for verification workflow |
| G10 | Lesson Qualification Record (8-step) | ✅ Backend model for payout qualification |
| G11 | Cover/Sub Teacher Assignment | ⚠️ 30% — Mock UI, "Dispatch Cover Update" is toast only |
| G12 | Academic Calendar & Holidays | ⚠️ Real Uganda holiday list, display only |

## H. Parent & Family Features

| # | Feature | Status |
|---|---------|--------|
| H1 | Parent Dashboard | ⚠️ 50% — Layout complete, all actions dead |
| H2 | Parent Action Center | ✅ Hybrid API + mock fallback, acknowledge flow |
| H3 | Child Performance Grid | ⚠️ Renders in dashboard, data from mock |
| H4 | Parent Resource Engagement Panel | ⚠️ Hardcoded mock child resources |
| H5 | AI Weekly Summary for Parents | ⚠️ Backend model exists, no AI generation logic |
| H6 | Parent Risk Alerts | ✅ Backend CRUD |
| H7 | Parent-Student Link Management | ✅ Backend CRUD |
| H8 | Household Finance Tab | ⚠️ UI layout exists, all data hardcoded |
| H9 | Smart Study Planner (Parent view) | ✅ Wired to useStudyPlanner hook with API |
| H10 | Monthly School Report (Parent) | ❌ Buttons exist, no functionality |
| H11 | WhatsApp Communication Hub | ⚠️ Chat UI clone with hardcoded messages, no real messaging |

## I. Finance & Monetization

| # | Feature | Status |
|---|---------|--------|
| I1 | Institution Finance Hub | ⚠️ 90% complete, ORPHANED (not routed) |
| I2 | Fee Category Management | ✅ DynamicSchemaForm + Zod schema + real API |
| I3 | Offline POS Receipt Logging | ✅ DynamicSchemaForm + Zod schema + real API |
| I4 | Expense Journal Entry | ✅ DynamicSchemaForm + Zod schema + real API |
| I5 | Student Ledger & Arrears | ⚠️ UI in Finance Hub, real API queries |
| I6 | Bursary/Waiver Engine | ⚠️ UI layout in Finance Hub with discount-rules API |
| I7 | Financial Reports (Termly P&L) | ⚠️ Auto-calculated from API data in Finance Hub |
| I8 | Institution Billing Portal | ⚠️ Plan selection UI, payment redirect to mock PesaPal URL |
| I9 | Payment Page (Student) | ⚠️ 40% — Simulated payment (no real gateway) |
| I10 | Teacher Wallet | ✅ Backend model with balance tracking |
| I11 | Teacher Payout Profile | ✅ Backend CRUD + frontend CRUD (MTN/Airtel) |
| I12 | Payout Eligibility Check | ✅ 5-rule evaluation engine |
| I13 | Payout Request Flow | ✅ Backend 8-state lifecycle with audit logging |
| I14 | Payout Execution (MoMo) | ⚠️ Mock MTN MoMo provider (disbursement simulated) |
| I15 | Teacher Monetization Dashboard | ✅ Real API (4 parallel fetches), payout submission |
| I16 | Revenue Split (80/20) | ✅ Backend listing purchase flow |
| I17 | Lesson Qualification for Payout | ✅ 5-rule evaluation engine |
| I18 | Teacher Payout Batch Reports | ✅ Backend ReadOnly API |
| I19 | Payout Audit Log | ✅ Backend model with action tracking |

## J. Analytics & Intelligence

| # | Feature | Status |
|---|---------|--------|
| J1 | Student Dashboard Analytics API | ✅ Real DB queries with ReadinessEngine |
| J2 | Teacher Dashboard Analytics API | ✅ Real DB queries |
| J3 | Parent Dashboard Analytics API | ✅ Real DB queries |
| J4 | Admin Dashboard Analytics API | ✅ Real DB queries |
| J5 | Institution Dashboard Analytics API | ✅ Real DB queries |
| J6 | Next Best Action Engine | ✅ Role-aware NBA generation from real data |
| J7 | Study Planner Engine | ✅ Weekly plan generation from assignments/weakness |
| J8 | Institution Health Scorer | ✅ 9-component weighted composite |
| J9 | Story Card Generator | ✅ Role-specific narrative cards |
| J10 | Student Passport | ✅ Backend model, frontend component (props-driven) |
| J11 | Teacher Passport | ✅ Backend model, frontend component (hardcoded demo) |
| J12 | Points Ledger | ✅ Backend CRUD |
| J13 | Badges System | ✅ Backend CRUD + criteria matching |
| J14 | Challenges & Competitions | ✅ Backend CRUD + join/leaderboard actions |
| J15 | House Team System | ✅ Backend CRUD + standings |
| J16 | Leaderboards (with anti-shame) | ✅ Frontend component with smart ranking |
| J17 | Learning Progress Tracking | ✅ Backend CRUD, local frontend tracking |
| J18 | National Exam Results | ✅ Backend model + API |
| J19 | Impact Comparison (online vs offline) | ✅ Backend model + API |
| J20 | Platform Command Center | ⚠️ 75% — Real API + Recharts, ORPHANED |
| J21 | Institution Intelligence Page | ⚠️ 70% — Real API + Recharts, ORPHANED |
| J22 | Analytics Layout (sidebar) | ⚠️ 80% — Built but not routed |
| J23 | Maple Intelligence Hub | ⚠️ 25% — All hardcoded mock data |
| J24 | Institution Risk Monitor | ⚠️ 20% — All hardcoded mock data |
| J25 | Institution Health View | ⚠️ 25% — All hardcoded, despite real backend |
| J26 | UNEB Readiness Gauge | ✅ Recharts PieChart component |
| J27 | Topic Confidence Radar | ✅ Recharts RadarChart component |
| J28 | Career Guidance Widget | ⚠️ Hardcoded radar + career pathways |
| J29 | Celebration Engine | ⚠️ Hardcoded motivational display |
| J30 | Student Motivation Engine | ⚠️ Hardcoded XP/level/career trajectory |
| J31 | Alumni Outcomes Tracker | ⚠️ Hardcoded stats (12.4K alumni, 76% university) |
| J32 | Global Curriculum Health | ⚠️ Hardcoded mastered/warning/critical topics |
| J33 | Global Institution Comparison | ⚠️ Hardcoded table of 5 institutions |
| J34 | Intervention Risk Detection | ⚠️ Engine exists but uses simulated counts, no API |
| J35 | Platform Analytics Tabs | ⚠️ Hybrid — attempts admin-dashboard API, maps to charts |

## K. Marketplace & Content Commerce

| # | Feature | Status |
|---|---------|--------|
| K1 | Marketplace Landing (Subject Grid) | ✅ 90% — Real API, search, country filter |
| K2 | Marketplace Subject Page | ⚠️ 80% — Real API, sidebar mock tutors |
| K3 | Marketplace Topic Page (Listings) | ✅ 85% — Real marketplace listing API |
| K4 | Marketplace Upload Modal | ✅ Real API with strict curriculum tagging |
| K5 | Listing Purchase Flow | ✅ Backend action with revenue split |
| K6 | Teacher Storefront | ⚠️ 20% — All hardcoded mock |
| K7 | Verified Teacher Badge | ✅ Props-driven reputation display |
| K8 | License Deal Tracking | ✅ Backend model |

## L. Communication & Notifications

| # | Feature | Status |
|---|---------|--------|
| L1 | WhatsApp Integration (Twilio) | ✅ Real API with fallback simulator |
| L2 | Notification Preferences Panel | ⚠️ Partial — WhatsApp test works, SMS/email toggles cosmetic |
| L3 | Teacher Lesson Notification | ✅ Backend model for timetable-based dispatch |
| L4 | In-App Notification System | ✅ Backend CRUD (in_app/email/whatsapp/sms channels) |
| L5 | WhatsApp Communication Hub | ⚠️ Chat UI clone, hardcoded messages |
| L6 | Parent Communication Copilot | ⚠️ Simulated — canned draft generation |

## M. Discussion & Social

| # | Feature | Status |
|---|---------|--------|
| M1 | Forum Page (Threaded Discussions) | ⚠️ 60% — Thread creation via API, replies/likes broken |
| M2 | Discussion Thread Component | ✅ Hybrid — API with mock fallback, reply posting works |
| M3 | Topic-Level Discussions | ✅ Component exists, embeddable in topic pages |
| M4 | Peer Tutoring Hub | ⚠️ 15% — Full mock, toast-only actions |
| M5 | Peer Tutoring Page (Alternative) | ⚠️ 30% — More polished but ORPHANED |

## N. Exam Registration

| # | Feature | Status |
|---|---------|--------|
| N1 | Exam Center Discovery | ✅ Real API search |
| N2 | Candidate Registration | ✅ Real API submission |
| N3 | UNEB Subject Selection Validation | ✅ Full O-Level/A-Level rules implemented |
| N4 | Document Upload | ⚠️ Sends filenames not actual files |
| N5 | Fee Calculation | ✅ Calculated from subject count |
| N6 | Board Submission Batches | ✅ Backend model exists |

## O. AI & Copilot

| # | Feature | Status |
|---|---------|--------|
| O1 | Student AI Copilot (Floating Chat) | ✅ Real OpenAI via AICopilotContext |
| O2 | Teacher AI Copilot (Studio Widget) | ✅ Real OpenAI with teacher_studio context |
| O3 | AI Teaching Assistant (Full Page) | ✅ 85% — 3 real AI tools (analytics, replies, quiz) |
| O4 | AI Admin Report Assistant | ⚠️ Simulated — canned reports via setTimeout |
| O5 | AI Teaching Partner | ⚠️ Simulated — canned AI output via setTimeout |
| O6 | AI Reflection Assistant | ⚠️ Simulated — journal flow, no API persist |
| O7 | Voice Note Widget | ⚠️ Simulated — fake recording, no MediaRecorder |

## P. UX/System Layer

| # | Feature | Status |
|---|---------|--------|
| P1 | TopNavbar (Role-Aware) | ✅ Full role-conditional navigation |
| P2 | Glass Dashboard Layout | ✅ Dark-mode shell with glassmorphism |
| P3 | Editorial Design System | ✅ EditorialHeader, EditorialPanel, EditorialPill |
| P4 | Shadcn/UI Component Library | ✅ 48 primitives imported and configured |
| P5 | Dashboard Grid/Card System | ✅ Responsive 12-column grid with card variants |
| P6 | Empty State Components | ✅ EmptyState + PremiumEmptyState + PremiumLockState |
| P7 | Error Boundary | ✅ Class component with stack trace display |
| P8 | Network Status Widget | ✅ Online/offline detection |
| P9 | Offline Sync Engine | ❌ Fully stubbed (console.log only) |
| P10 | Toast Notification System | ✅ Shadcn Sonner integration |
| P11 | Permission Guard Component | ✅ Renders/hides based on permission checks |
| P12 | Protected Route Component | ✅ Role + permission checking with redirect |
| P13 | DashboardSkeleton Loading | ✅ Type-specific shimmer animation |
| P14 | Breadcrumbs | ⚠️ Inline implementations work, shadcn Breadcrumb component unused |

---

# 3. DETAILED FEATURE DOCUMENTATION

## A. AUTHENTICATION & ONBOARDING

### A1. Email/Password Login

**Module**: Authentication  
**Roles**: All users  
**Location**: `/login` — LoginPage  
**Purpose**: Authenticate users and establish JWT session  
**Description**: Full-screen login form with email and password fields. Delegates to `useAuth().login()` which posts to `/api/v1/auth/login/`. On success, stores access + refresh tokens in localStorage, fetches user profile, and redirects to appropriate dashboard based on role. Includes demo account quick-login buttons (4 preset accounts with `demo123` password) for development testing. Role is inferred from email patterns (`@admin` → platform_admin, `@institution` → institution_admin).  
**Core Actions**: Submit login form, click demo account button  
**States**: Idle, loading (spinner on button), error (inline error message)  
**Data Dependencies**: `/api/v1/auth/token/` endpoint  
**Outputs**: JWT tokens stored in localStorage, user state set in AuthContext, redirect to role dashboard  
**Connected Features**: AuthContext, DashboardRouter, All protected routes  
**Implementation Status**: ✅ Fully implemented  
**Gaps**: No "Forgot Password" flow — label exists but has no handler. No rate limiting on frontend. No account lockout display.  
**Recommendation**: Implement password reset flow. Add rate-limit feedback. Add 2FA option.

---

### A2. Student Registration (Independent)

**Module**: Authentication & Onboarding  
**Roles**: New users (unauthenticated)  
**Location**: `/register` — RegisterPage  
**Purpose**: Create new independent student accounts with automatic parent record creation  
**Description**: Multi-mode registration page with 3 paths: Learner, Teacher, Institution. The Learner path is a 3-step wizard: (1) Account details (full_name, email, country_code, password), (2) Parent details (creates parent record linked to student), (3) Payment method selection (MTN MoMo / Airtel Money — cosmetic only, no real payment). Uses `useAuth().onboardStudent()` which posts to `/api/v1/auth/onboard-student/`. Backend atomically creates parent (lookup-or-create by phone), student profile, and parent-student link in one transaction.  
**Core Actions**: Fill wizard steps, submit registration  
**States**: Step 1 (account), Step 2 (parent), Step 3 (payment), loading, error  
**Data Dependencies**: `/api/v1/auth/onboard-student/` endpoint  
**Outputs**: User account + StudentProfile + ParentProfile + ParentStudentLink created. JWT tokens returned.  
**Connected Features**: AuthContext, Parent Dashboard  
**Implementation Status**: ✅ Mostly functional  
**Gaps**: Payment step is cosmetic (no real payment integration). Post-registration redirects to non-existent `/student-dashboard` (should be `/dashboard/student`). Teacher invite code verification not connected.  
**Recommendation**: Fix redirect path. Wire payment to real gateway. Connect teacher invite code verification to backend.

---

### A3. Institutional Learner Registration (3-Step)

**Module**: Institution Management  
**Roles**: Institution admin (performing onboarding)  
**Location**: Institution Management Page → Students tab → StudentOnboardingForm  
**Purpose**: Register new students within an institution with payment verification and automatic credential generation  
**Description**: 3-step onboarding wizard: (1) **Profile** — student name, class level, Learner Identification Number (LIN). (2) **Parent & Pay** — parent name/phone collection, registration submitted to `/institutions/learner-registrations/start_registration/`, then auto-verifies payment via `/verify_payment/`. Detects siblings by parent phone number. (3) **Account** — 4-digit PIN creation, calls `/finalize_account/` which generates student ID + system username (e.g., "maple-ug-1234"). Displayed credentials can be copied.  
**Core Actions**: Fill each step, submit registration, copy credentials  
**States**: Step 1, Step 2, Step 3, loading per step, error display  
**Data Dependencies**: Institution context, `/api/v1/institutions/learner-registrations/` endpoints  
**Outputs**: LearnerRegistration record (6-step status flow), User account, StudentProfile, ParentProfile  
**Connected Features**: InstitutionManagementPage, ParentStudentLink, Student Dashboard  
**Implementation Status**: ✅ Fully functional — real API, real credential generation  
**Gaps**: Payment verification is auto-approved (simulated). LIN validation not enforced.  
**Recommendation**: Wire real payment verification. Add LIN format validation.

---

### A8. Institution Onboarding Wizard

**Module**: Onboarding  
**Roles**: New institution administrators (unauthenticated)  
**Location**: `/institution-onboarding` — InstitutionWizard  
**Purpose**: Guide new institutions through complete platform setup  
**Description**: 10-step wizard designed to onboard an entire school: (1) Institution Account, (2) Branding, (3) Academic Structure, (4) Roles & Permissions, (5) Teachers, (6) Students, (7) Parents, (8) Billing & Activation, (9) School Setup, (10) Go Live. Only steps 1-3 have actual form UI. Steps 4-10 show "Phase Pending" placeholder.  
**Core Actions**: Fill form fields, navigate between steps  
**States**: Active step, completed steps visually marked  
**Data Dependencies**: None — simulated setTimeout submission  
**Outputs**: None (no API call made)  
**Connected Features**: Intended to create Institution + memberships + billing  
**Implementation Status**: ⚠️ 30% — 3 of 10 steps have UI, no real API submission  
**Gaps**: Steps 4-10 are empty placeholders. Form submission uses setTimeout, never calls backend. Backend has `/api/v1/institutions/onboard-basic/` endpoint ready.  
**Recommendation**: Wire steps 1-3 to `/institutions/onboard-basic/`. Build UI for steps 4-10 progressively.

---

### A9. Independent Teacher Onboarding Wizard

**Module**: Onboarding  
**Roles**: New independent teachers (unauthenticated)  
**Location**: `/independent-teacher-onboarding` — IndependentTeacherWizard  
**Purpose**: Register and set up independent teachers with monetization profile  
**Description**: Designed as 8-step wizard but only 4 steps implemented: (1) Account Setup (name, phone, email, password, country), (2) Credibility (bio, experience, specialization), (3) Monetization Disclosure (terms acceptance gate), (4) Payout Setup (MTN/Airtel network, account name, phone). Future steps: Content Offers, First Lesson, Public Profile, Launch Dashboard. Progress indicator shows `/8` denominator.  
**Core Actions**: Fill each step, accept monetization terms, configure payout  
**States**: Step 1-4, completion state  
**Data Dependencies**: None — simulated setTimeout, comments reference `/api/marketplace/onboard-teacher/`  
**Outputs**: None (no API call made)  
**Connected Features**: Backend has `/api/v1/marketplace/onboard-teacher/` ready  
**Implementation Status**: ⚠️ 40% — 4 of 8 steps have UI, no API  
**Gaps**: Steps 5-8 not built. Submission simulated. Progress bar bug (shows /8 but only 4 exist).  
**Recommendation**: Wire to `/marketplace/onboard-teacher/` endpoint. Build remaining 4 steps. Fix progress indicator.

---

## B. CLASS & ACADEMIC NAVIGATION

### B1. Course Catalog

**Module**: Academic Navigation  
**Roles**: All users (public)  
**Location**: `/classes` — CourseCatalog  
**Purpose**: Browse and discover available classes/grade levels  
**Description**: Grid of class cards fetched from `/curriculum/full-tree/`. Filter tabs: ALL, O'LEVEL, A'LEVEL, SCIENCES, ARTS. Each card shows class name, student count (random — mock), rating (hardcoded 4.9), and teacher name (from supplementary `/data/users.json` fetch). Click navigates to class syllabus.  
**Core Actions**: Filter by category, click class card  
**States**: Loading spinner, normal grid  
**Data Dependencies**: `/api/v1/curriculum/full-tree/`, `/data/users.json` (static)  
**Outputs**: Navigation to `/classes/:classId`  
**Connected Features**: ClassSyllabusPage, CourseDetail  
**Implementation Status**: ✅ 85% — Real API, cosmetic mock augmentation (counts, ratings)  
**Gaps**: Student counts are random. Ratings hardcoded. No enrollment status indicator.  
**Recommendation**: Wire student counts from enrollment API. Calculate real ratings.

---

### B2. Class Syllabus View

**Module**: Academic Navigation  
**Roles**: All users (public)  
**Location**: `/classes/:classId` — ClassSyllabusPage  
**Purpose**: Display complete academic structure of a class organized by term and subject  
**Description**: Fetches full curriculum tree and filters to selected class. Shows term navigator tabs (Term 1/2/3). Under each term, displays subject cards, each expandable to show topic list. Topics link to detailed topic pages. "See all subjects" links to SubjectTopicsPage.  
**Core Actions**: Switch term tabs, click subject to expand, navigate to topics  
**States**: Loading, not found, empty term, normal  
**Data Dependencies**: `/api/v1/curriculum/full-tree/`  
**Outputs**: Navigation to topic detail or subject topics page  
**Connected Features**: CourseDetail, SubjectTopicsPage, TopicDetailPage  
**Implementation Status**: ✅ 90% — Real API, functional navigation  
**Gaps**: No enrollment CTA. No progress indicators per topic.  
**Recommendation**: Add enrollment button. Show completion progress for authenticated students.

---

### B4. Topic Detail Page

**Module**: Academic Navigation  
**Roles**: All users (public, but features vary by auth)  
**Location**: `/classes/:classId/:termId/:subjectId/topic/:topicId` — TopicDetailPage  
**Purpose**: Deep-dive into a specific topic with learning resources and practice materials  
**Description**: Two-column layout. Left sidebar shows topic navigation within the subject. Right content area has two tabs: **Learn** (lessons/resources rendered by ResourceViewer modal — supports PDF reading with scroll progress tracking, video playback via Vimeo embed) and **Practice** (assessments from backend, augmented with `MOCK_ASSIGNMENTS` when sparse).  
**Core Actions**: Navigate between topics, open lesson in ResourceViewer, start practice assessment  
**States**: Loading, not found, normal  
**Data Dependencies**: `/api/v1/curriculum/full-tree/`  
**Outputs**: Opens ResourceViewer modal, starts ActiveAssessment  
**Connected Features**: ResourceViewer, VideoPlayer, ActiveAssessment, DiscussionThread  
**Implementation Status**: ✅ 85% — Real API, ResourceViewer integration works  
**Gaps**: Practice tab augmented with mock when data sparse. No progress tracking API integration. No discussion section actually rendered.  
**Recommendation**: Wire progress tracking to backend. Remove mock augmentation when real assessment data exists. Integrate DiscussionThread component.

---

## C. RESOURCE & READING EXPERIENCE

### C1. Academic Library

**Module**: Resources  
**Roles**: All authenticated users  
**Location**: `/library` — AcademicLibraryPage  
**Purpose**: Central resource browsing hub with editorial-style presentation  
**Description**: Editorial magazine-style layout with: featured resource carousel at top, left sidebar (Educator of the Week + Top Materials — both hardcoded), main content grid with 6-column book-style cards. Fetches real resources from `/api/v1/resources/` with search, subject filter, category filter, and sort parameters. Falls back to `DEFAULT_MOCK_RESOURCES` (18 items) on API failure. Includes ResourceViewer modal for document/PDF reading, VideoPlayer modal for Vimeo videos, and ResourceUploadModal for uploading new resources.  
**Core Actions**: Search, filter by subject/category, sort, open resource in viewer, upload new resource  
**States**: Loading skeleton, error with retry button, empty state, normal grid  
**Data Dependencies**: `/api/v1/resources/` with query params  
**Outputs**: Opens ResourceViewer/VideoPlayer, creates new Resource via upload  
**Connected Features**: ResourceViewer, VideoPlayer, ResourceUploadModal, Resource engagement tracking  
**Implementation Status**: ✅ 85% — Real API with rich fallback  
**Gaps**: Sidebar (Educator of Week, Top Materials) hardcoded. No pagination visible. Featured carousel is from mock.  
**Recommendation**: Wire sidebar to teacher performance API. Add pagination. Source featured resources from API.

---

### C3. Resource Upload

**Module**: Resources  
**Roles**: Teachers, Institution admins  
**Location**: Modal component — accessed from Library, Resource Discovery, Institution Management  
**Purpose**: Upload educational resources (documents, videos, links) to the platform  
**Description**: Modal form with fields: title, resource type (8 options: video, document, pdf, textbook, worksheet, presentation, image, link), subject, class level, topic, lesson context, visibility (public/private/institution-only), and file upload or external URL input. Posts FormData to `/api/v1/resources/resource/`. For videos, triggers async Celery task `process_vimeo_upload` which uploads to Vimeo, updates resource URL, and deletes local file.  
**Core Actions**: Fill form, upload file or enter URL, submit  
**States**: Idle, uploading/submitting, success, error  
**Data Dependencies**: File or URL, curriculum metadata  
**Outputs**: Resource record created in DB, video uploaded to Vimeo (async)  
**Connected Features**: AcademicLibraryPage, ResourceDiscoveryPage, InstitutionManagementPage, Vimeo API  
**Implementation Status**: ✅ Fully functional — Real API with async video processing  
**Gaps**: No upload progress indicator. No file size validation on frontend. No drag-and-drop.  
**Recommendation**: Add upload progress bar. Add client-side file validation. Add drag-and-drop.

---

### C4. Resource Viewer

**Module**: Resources  
**Roles**: All authenticated users  
**Location**: Modal component — opened from Library, Topic Detail, other pages  
**Purpose**: Full-screen document/resource reading experience with engagement tracking  
**Description**: Full-screen overlay that renders resources based on type. Uses `useResourceEngagement()` hook to track active reading/watching time (1-second interval, pauses on blur/visibility change). Uses `useStudentContinuity()` hook to save reading position to localStorage for "Continue Reading" feature. Includes AI Tutor sidecar toggle. Simulated video progress tracking for video resources.  
**Core Actions**: Read/scroll through document, toggle AI tutor, close viewer  
**States**: Open, reading/watching, paused (tab blur), closed  
**Data Dependencies**: Resource object (passed as prop)  
**Outputs**: Engagement snapshot (time, scroll progress), localStorage position update  
**Connected Features**: ContinuityPanel, useResourceEngagement, useStudentContinuity  
**Implementation Status**: ✅ Working — scroll tracking, time tracking, localStorage persistence  
**Gaps**: Engagement data not persisted to backend API. Video progress is simulated. AI tutor toggle may not connect to CopilotWidget properly.  
**Recommendation**: Wire engagement data to `/api/v1/intelligence/learning-progress/` endpoint. Replace simulated video progress with Vimeo player events.

---

## D. LIVE LEARNING

### D1. Live Sessions Discovery

**Module**: Live Learning  
**Roles**: All users (public page)  
**Location**: `/live-sessions` — LiveSessionsPage  
**Purpose**: Discover and join live learning sessions  
**Description**: Hero section with search bar and motivational text. Category filter tabs: All, Upcoming, Live Now, Recorded, Peer Discussion, Revision Session. Session cards showing teacher, topic, date, time, status. Fetches from `/api/v1/live-sessions/live-session/` with `MOCK_SESSIONS` (8 sessions) as fallback. RSVP button updates local state + shows toast (not persisted to backend). CTA banner for hosting sessions.  
**Core Actions**: Search, filter by category, RSVP to session  
**States**: Loading, normal, empty  
**Data Dependencies**: `/api/v1/live-sessions/live-session/`  
**Outputs**: RSVP (local only — not persisted)  
**Connected Features**: LiveSessionCTA, TeacherLessonStudio (for provisioning)  
**Implementation Status**: ⚠️ 70% — Real API with fallback, RSVP not persisted  
**Gaps**: RSVP is local-only (lost on refresh). Replay buttons dead. "Host" buttons show toast only. No join flow from this page. No calendar integration.  
**Recommendation**: Persist RSVP to backend. Add join button for live sessions. Implement replay viewer.

---

### D4. Webinar Provisioning

**Module**: Live Learning  
**Roles**: Teachers  
**Location**: TeacherLessonStudio → "Live Schedule" button  
**Purpose**: Create Google Meet video sessions for live lessons  
**Description**: Posts to `/api/v1/live-sessions/live-session/provision-webinar/` which integrates with Google Calendar/Meet API to create a meeting room. On success, copies meeting link to clipboard. Has fallback simulator mode (URL-based simulator). Backend also has Google Drive recording retrieval and Vimeo upload pipeline via Celery task.  
**Core Actions**: Click "Live Schedule" to provision, copy meeting link  
**States**: Provisioning, success (link copied), error  
**Data Dependencies**: Google Workspace API credentials  
**Outputs**: LiveSession record created, meeting link generated  
**Connected Features**: LiveSessionsPage (discovery), MissedSessionRecoveryPage (replay)  
**Implementation Status**: ✅ Fully functional — Real Google Meet API + fallback  
**Gaps**: No recurring session support. No calendar view for teachers.  
**Recommendation**: Add recurring session scheduling. Add teacher calendar view.

---

## E. TEACHING & ASSESSMENT

### E1. Assessment Creation

**Module**: Assessments  
**Roles**: Teachers  
**Location**: Modal component — accessed from Topic Detail, Lesson Studio  
**Purpose**: Create assignments, quizzes, exams, and intervention assessments  
**Description**: Modal form: title, assessment type (worksheet/quiz/project/intervention), max score, due date (datetime picker), instructions (textarea), audience targeting (all students/at-risk/enrichment). Posts to `/api/v1/assessments/assessment/`. Creates Assessment record linked to an AssessmentWindow. Backend auto-creates submission records and handles MCQ auto-grading.  
**Core Actions**: Fill form, select audience, submit  
**States**: Idle, submitting, success, error  
**Data Dependencies**: Context (topic/class), assessment window  
**Outputs**: Assessment record created  
**Connected Features**: ActiveAssessment (student-facing), SubmissionViewSet, auto-grading  
**Implementation Status**: ✅ Fully functional  
**Gaps**: No question builder in modal (only title and metadata). Questions must be added separately. No rubric attachment.  
**Recommendation**: Add inline question builder. Integrate marking rubric creation.

---

### E5. Active Assessment (Student Taking)

**Module**: Assessments  
**Roles**: Students  
**Location**: Component embedded in Topic Detail and dashboard  
**Purpose**: Present assessment questions and capture student submissions  
**Description**: Fetches assessment and questions from `/api/v1/assessments/assessment/:id/`. Renders questions with radio groups for MCQ. Posts answers to `/api/v1/assessments/submission/`. Backend auto-grades MCQ submissions (exact match). Displays graded results with score immediately for MCQ, "pending" for essay/short answer.  
**Core Actions**: Select answers, submit assessment  
**States**: Loading, answering, submitted, graded/pending  
**Data Dependencies**: Assessment ID, Questions API  
**Outputs**: Submission record, auto-graded score for MCQ  
**Connected Features**: Assessment creation, Grading system, Analytics  
**Implementation Status**: ✅ Fully functional  
**Gaps**: Only MCQ auto-grading. No timer. No anti-cheating measures. No partial credit.  
**Recommendation**: Add essay grading workflow (teacher review). Add assessment timer. Add question randomization.

---

### E11. NCDC Grading Engine

**Module**: Grading  
**Roles**: System (automatic), Teachers, Headteachers  
**Location**: Backend service — `grading/ncdc_engine.py`  
**Purpose**: Calculate Uganda NCDC-compliant grades from formative and summative scores  
**Description**: Implements Uganda's NCDC 20/80 grading formula: formative (20% weight) + summative (80% weight). Maps total scores to grade letters (A* ≥90, A ≥80, B+ ≥70... through G <20) with descriptive text. Creates SubjectGrade records per student/class/term. ReportCard model with template support. PDF generation via WeasyPrint + Celery task. Only Headteachers and Academic Leaders can publish report cards.  
**Core Actions**: Calculate grades (system), publish report cards (headteacher)  
**States**: Draft, calculated, published (is_published flag)  
**Data Dependencies**: Submission scores, assessment types (formative/summative)  
**Outputs**: SubjectGrade records, ReportCard (with PDF)  
**Connected Features**: Assessment system, Report Card PDF generation, Parent Dashboard  
**Implementation Status**: ✅ Fully functional — NCDC engine, PDF generation, publish workflow  
**Gaps**: PDF template customization per institution. Bulk report generation not surfaced in UI. No frontend to view/download report cards.  
**Recommendation**: Add report card view/download in student and parent dashboards. Build admin UI for bulk PDF generation.

---

## F. ROLE DASHBOARDS

### F1. Student Dashboard

**Module**: Dashboard  
**Roles**: universal_student, institution_student, student  
**Location**: `/dashboard/student` — StudentDashboard  
**Purpose**: Central command center for student's learning experience  
**Description**: Fetches from `/api/v1/analytics/student-dashboard/` with comprehensive mock fallback. Sections: (1) Intelligence Cards strip (4 metric cards showing attendance, grades, exam readiness, engagement), (2) Resource Engagement Panel (6 mock resources with continue-learning cards), (3) Action Center (fetches assessments with mock fallback), (4) Current Priorities (live session CTA, at-risk alert, activity trend chart), (5) Resource Recommendations (3 cards), (6) Motivation Engine (XP, level, career trajectory), (7) Career Guidance (radar chart + career matching), (8) Subject Performance Grid (10 subjects with progress bars), (9) Assessment Snapshot, (10) Platform Launchpad (4 tool cards).  
**Core Actions**: NONE functional — "View Schedule", "Resume Learning", "Join Meeting", "Review Overdue Tasks" are all dead buttons  
**States**: Loading skeleton, normal  
**Data Dependencies**: `/api/v1/analytics/student-dashboard/`, localStorage (continuity)  
**Outputs**: None — all actions are dead  
**Connected Features**: Intelligence hooks (partially wired), ResourceViewer (not connected in dashboard)  
**Implementation Status**: ⚠️ 60% — Visually impressive, data partly wired, NO functional actions  
**Gaps**: All action buttons are dead. Intelligence cards link to non-existent routes. Platform Launchpad links to wrong paths (`/tools/exams` instead of `/exam-registration`).  
**Recommendation**: Wire all action buttons to real navigation/functionality. Fix Launchpad links. Connect Intelligence Cards to real intelligence endpoints.

---

### F2. Teacher Dashboard

**Module**: Dashboard  
**Roles**: All teacher roles (independent_teacher, institution_teacher, universal_teacher)  
**Location**: `/dashboard/teacher` — TeacherDashboard  
**Purpose**: Teaching command center with content, operations, and monetization  
**Description**: Fetches from `/api/v1/analytics/teacher-dashboard/`, `/api/v1/classes/`, `/api/v1/curriculum/subjects/`. Most complex dashboard with 15+ sections: Header → Earnings (TeacherPayoutStatusCard, IndependentEarningsIntelligence) → Intelligence strip (6 NBA cards via useNextBestActions hook) → Planning & Resource Impact → Support Operations → Professional Growth Hub → Leaderboard → Student Spotlight → Red Alerts → Resource Engagement → Competition Engine → AI Tools links → Content Tabs. Content tabs: Overview (class health cards), My Classes (class list), Content (resource management), Live Sessions (session controls), Earnings (monetization).  
**Core Actions**: "Upload Target Grades" → marks-upload page (WORKING). "My Calendar" (DEAD). All intelligence card actions link to non-existent routes.  
**States**: Loading, normal  
**Data Dependencies**: Analytics API, classes API, subjects API, intelligence hooks  
**Outputs**: Navigation to class studio, marks upload, AI assistant  
**Connected Features**: TeacherLessonStudio, TeacherMarksUpload, AI Teaching Assistant, Intelligence Engine  
**Implementation Status**: ⚠️ 65% — API + hooks partially wired, 17 sub-components ALL hardcoded  
**Gaps**: 11 broken intelligence card links. Every teacher component uses hardcoded data. Payout status is mock. Leaderboards are mock.  
**Recommendation**: Wire teacher sub-components to real APIs. Fix intelligence card links. Connect payout status to marketplace API. Connect leaderboards to intelligence engine.

---

### F4. Parent Dashboard

**Module**: Dashboard  
**Roles**: parent  
**Location**: `/dashboard/parent` — ParentDashboard  
**Purpose**: Monitor children's academic progress and household finances  
**Description**: Fetches from `/api/v1/analytics/parent-dashboard/` (via `../lib/api` — uses the axios client, not the primary fetch client). Two tabs: **Academic Performance** (intelligence cards, action center, AI weekly summary, celebration engine, study planner from hook, resource engagement, competition engine, child performance grid, schedule) and **Household Finances** (household balance, total invoiced, waivers, child ledger table). Study planner wired to useStudyPlanner hook with real API connection. ParentActionCenter wired to intelligence API with acknowledge flow.  
**Core Actions**: MOSTLY DEAD — "Download Report", "Notification Preferences", "Download Statement", "Make Online Payment", "Message Tutor", "Book Meeting" all dead  
**States**: Loading, normal  
**Data Dependencies**: `/api/v1/analytics/parent-dashboard/`, intelligence hooks  
**Outputs**: Navigation (mostly broken links)  
**Connected Features**: ParentActionCenter (hybrid API), SmartStudyPlanner (API-wired)  
**Implementation Status**: ⚠️ 50% — Comprehensive layout, 2 components API-wired, everything else mock/dead  
**Gaps**: 7 broken navigation links. 6+ dead buttons. Finance tab entirely mock. Weekly AI summary has no generation logic.  
**Recommendation**: Wire action buttons. Connect finance tab to InstitutionFinanceHub APIs. Implement AI weekly summary generation.

---

### F5. Institution Dashboard

**Module**: Dashboard  
**Roles**: institution_admin  
**Location**: `/dashboard/institution` AND `/institution-management` (duplicate routes)  
**Purpose**: School-wide management command center  
**Description**: The most feature-rich dashboard with 9 tabs: Overview (health score + intelligence cards + challenges + house standings), Academics (intelligence hub + performance analytics), Staff (teacher assignment + teacher wellness), Students (onboarding form + bulk invite), Timetable (studio link), Pastoral (timeline + behavior logging), Resources (library + upload), Parents (engagement hub + communication), War Room (exam countdown + readiness). Fetches from `/api/v1/analytics/institution-dashboard/` with useInstitutionHealth hook.  
**Core Actions (Working)**: Bulk Invite Matrix → opens BulkInviteModal (real API), Launch Onboarding Form → StudentOnboardingForm (real API), Upload Resource → ResourceUploadModal (real API), Launch Timetable Studio → navigation to timetable page  
**Core Actions (Dead)**: "Investigate" alert actions, "Ping Teacher"  
**States**: Loading skeleton, error, normal  
**Data Dependencies**: Analytics API, institution health hook, institution memberships  
**Outputs**: Creates invitations, registers students, uploads resources  
**Connected Features**: BulkInviteModal, StudentOnboardingForm, ResourceUploadModal, SchoolHealthScore, InstitutionTimetableStudio  
**Implementation Status**: ⚠️ 70% — Most real sub-components among dashboards, but still significant mock data  
**Gaps**: Duplicate routing (accessible at both URL paths). Intelligence hub hardcoded. Pastoral timeline mock. Some broken navigation links. Many intelligence card actions link to non-existent routes.  
**Recommendation**: Remove duplicate route. Wire intelligence hub to real APIs. Connect pastoral features to backend. Fix broken links.

---

### F10. Institution Finance Hub (ORPHANED)

**Module**: Finance  
**Roles**: institution_admin, bursar  
**Location**: NOT ROUTED — `src/pages/InstitutionFinanceHub.tsx` exists but has no route in App.tsx  
**Purpose**: Complete financial management ERP for schools  
**Description**: 6-tab finance management system: (1) Executive Dashboard — KPI cards (Net Cash, Collections, Arrears, Finance Locks, Expenses) calculated from real API data. (2) Fee Structures — DynamicSchemaForm for creating fee categories (10 types: tuition/boarding/transport/exam/uniform/books/activity/ict/medical/other) with Zod validation. (3) Ledgers & Receipts — Student ledger search/filter + POS receipt logging form. (4) Cashbook — Expense recording form. (5) Bursaries Matrix — Discount rule management via API. (6) Financial Reports — Termly income statement auto-calculated from payment/expense data. All forms use DynamicSchemaForm component with real API posting.  
**Core Actions**: Create fee categories, log payments, record expenses, manage bursaries, view reports  
**States**: Loading per tab, data-driven KPIs  
**Data Dependencies**: `/api/v1/institutions/{id}/finance/students/`, `/finance/payments/`, `/finance/discount-rules/`  
**Outputs**: Fee categories, payment records, expense records, bursary rules  
**Connected Features**: DynamicSchemaForm, Zod schemas in financeSchemas.ts  
**Implementation Status**: ⚠️ 90% complete but **NOT ACCESSIBLE** — completely built but missing route  
**Gaps**: Hardcoded `INSTITUTION_ID = 1`. Not routed in App.tsx. "Export Cashbook" and "View Ledger" show toast only (no export/detail). No multi-institution support.  
**Recommendation**: **IMMEDIATELY route this page** — it's the most complete unshipped feature. Add route at `/dashboard/institution/finance` with ProtectedRoute for institution_admin. Get INSTITUTION_ID from auth context.

---

## G. TIMETABLE & OPERATIONS

### G1. Timetable Studio

**Module**: Operations  
**Roles**: institution_admin  
**Location**: `/dashboard/institution/timetable` — InstitutionTimetableStudio  
**Purpose**: Manage school timetable, period allocation, room assignments, and teacher coverage  
**Description**: 4-tab interface: (1) Class Allocation Grid — weekly period table with subject/teacher assignment per slot (all from MOCK_GRID), (2) Sub/Cover Assignments — absent teacher coverage with "Dispatch Cover Update" (toast only), (3) Academic Calendar & Holidays — Uganda holidays list (real data), (4) Room Tracker — placeholder. Conflict engine status display shows collision detection capability summary (not connected to real engine). Backend has full implementation: TimetableSlotViewSet with CRUD, collision detection service, and heuristic auto-allocator.  
**Core Actions**: View allocation grid (mock), dispatch cover (toast), view holidays  
**States**: Static (no loading states)  
**Data Dependencies**: None (all hardcoded) — backend has full TimetableSlot + Conflict API  
**Outputs**: Toast notifications (no real updates)  
**Connected Features**: Backend scheduling app (collision detection, auto-allocation), Lesson instances  
**Implementation Status**: ⚠️ 30% — UI shell exists, backend is fully functional but frontend not connected  
**Gaps**: Frontend entirely disconnected from backend timetable API. No CRUD operations. Auto-allocator not surfaced. Room tracker empty.  
**Recommendation**: Wire to `/api/v1/scheduling/timetable/` endpoints. Build interactive drag-and-drop allocation. Surface auto-allocator and conflict detection.

---

### G3-G4. Collision Detection & Auto-Allocation

**Module**: Operations (Backend)  
**Roles**: institution_admin  
**Location**: Backend — `scheduling/services.py`  
**Purpose**: Prevent scheduling conflicts and auto-generate draft timetables  
**Description**: `TimetableStudioService` provides: (1) Collision detection — checks for teacher/room/class overlap when creating/updating timetable slots, creates TimetableConflict records. (2) Heuristic auto-allocator — generates draft timetable by distributing subjects across available slots while respecting teacher assignments, room availability, and existing constraints. Operates per institution/term scope.  
**Core Actions**: Detect collisions on slot CRUD, auto-generate draft  
**States**: N/A (service layer)  
**Data Dependencies**: TimetableSlot, Room, Class, Teacher assignments  
**Outputs**: Draft timetable slots, conflict records  
**Connected Features**: Timetable Studio (frontend — not connected)  
**Implementation Status**: ✅ Backend fully functional — but has NO frontend  
**Gaps**: No frontend integration at all. The auto-allocator and conflict detection are invisible to users.  
**Recommendation**: High priority — surface these capabilities in the Timetable Studio UI.

---

## H. PARENT & FAMILY FEATURES

### H2. Parent Action Center

**Module**: Intelligence / Parent  
**Roles**: parent  
**Location**: Parent Dashboard → Action Center section  
**Purpose**: Provide parents with specific, actionable tasks to support their children  
**Description**: Fetches parent-specific actions from `/api/v1/intelligence/parent-actions/` with `FALLBACK_ACTIONS` (3 hardcoded items). Each action has a type (attendance_warning, help_at_home, praise_sent, meeting_request), title, description, created date, and "Help at Home" guidance text. Parents can acknowledge actions by pressing a button that posts to `/api/v1/intelligence/parent-actions/{id}/acknowledge/`. Type-specific icons (alarm, home, star, users) displayed per action.  
**Core Actions**: View actions, acknowledge action (real API), request teacher meeting (UI only)  
**States**: Loading, data (from API or fallback), individual action acknowledged  
**Data Dependencies**: `/api/v1/intelligence/parent-actions/`  
**Outputs**: ParentAction status update to 'acknowledged'  
**Connected Features**: Intelligence engine (generates actions), Teacher Dashboard (teacher-initiated actions)  
**Implementation Status**: ✅ Hybrid — Real API with mock fallback, acknowledge flow functional  
**Gaps**: "Request Teacher Meeting" action doesn't create any backend record. No filtering by child. No action history.  
**Recommendation**: Wire meeting requests to notification/calendar system. Add per-child filtering. Add action history tab.

---

## I. FINANCE & MONETIZATION

### I11-I18. Teacher Monetization System

**Module**: Marketplace  
**Roles**: independent_teacher  
**Location**: TeacherDashboard → Earnings tab, TeacherMonetizationDashboard component  
**Purpose**: Enable teachers to earn income from teaching and content  
**Description**: Comprehensive teacher monetization system with:

(1) **Payout Profile Management** — Teachers set up mobile money payout details (MTN MoMo or Airtel Money network, account name, phone number). Full CRUD via `/api/v1/marketplace/payout-profile/`.

(2) **Lesson Qualification Engine** — 5-rule evaluation system that determines if a lesson qualifies for payout: must be from a public class, teacher must have payout profile, lesson must meet minimum threshold (UGX 50,000), content quality check, and student engagement minimum. Each lesson gets a LessonQualificationRecord with 8-step status flow.

(3) **Payout Request Flow** — Teachers request payout when eligible balance exceeds 50,000 UGX. 8-state lifecycle: pending → approved → processing → completed (or rejected/failed). Each state change creates a PayoutAuditLog entry. Posts to `/api/v1/marketplace/payouts/`.

(4) **Revenue Split** — 80% teacher / 20% platform split on listing purchases. Listing purchase action creates LicenseDeal and credits teacher Wallet.

(5) **MoMo Disbursement** — Mock MTN MoMo provider (simulates API calls for mobile money transfer).

(6) **Dashboard View** — TeacherMonetizationDashboard fetches 4 endpoints in parallel: monetization-overview, lesson-qualifications, payout-profile, eligibility. Displays: access fee recovery progress, remaining balance, net payable, payout profile details. "Request Payout Now" button triggers real API call.

**Core Actions**: Setup payout profile, view earnings, request payout, view qualification status  
**States**: No payout profile, eligible, pending payout, approved, processing, completed, rejected  
**Data Dependencies**: Marketplace APIs (4 endpoints), Wallet balance  
**Outputs**: PayoutRequest, PayoutTransaction, PayoutAuditLog  
**Connected Features**: Lesson system (qualification), Marketplace listings (revenue), Wallet  
**Implementation Status**: ✅ 85% — Real API integration on frontend + backend, MoMo provider is mock  
**Gaps**: MoMo API is simulated (not connected to real payment provider). Payout batch reporting not surfaced in frontend. Lesson qualification details not shown individually.  
**Recommendation**: Integrate real MoMo API. Surface payout batch reports. Show per-lesson qualification breakdown.

---

## J. ANALYTICS & INTELLIGENCE

### J6. Next Best Action Engine

**Module**: Intelligence  
**Roles**: All roles (generates role-specific actions)  
**Location**: Backend — `intelligence/services.py`. Frontend — useNextBestActions hook + dashboard cards  
**Purpose**: Proactively suggest the most impactful next step for each user role  
**Description**: `NextBestActionEngine` generates contextual, data-driven action recommendations. For **Students**: checks overdue assignments, attendance gaps, upcoming exams, resource completion. For **Teachers**: finds ungraded submissions, at-risk students, content gaps, payout eligibility. For **Parents**: generates help-at-home prompts, attendance alerts, celebration triggers. For **Institutions**: identifies staffing gaps, health score drops, compliance issues. Each NBA has: category, priority (high/medium/low), confidence score, action_type + action_url + action_payload. Frontend hook `useNextBestActions()` fetches from `/api/v1/intelligence/actions/` and can trigger generation via `/api/v1/intelligence/actions/generate/`.  
**Core Actions**: Generate actions (backend), view/dismiss/complete actions (frontend)  
**States**: Generated, viewed, dismissed, completed  
**Data Dependencies**: Attendance records, assessments, resource engagement, grades, timetable  
**Outputs**: NextBestAction records in DB, action cards in dashboard  
**Connected Features**: All dashboard pages, attendance system, assessment system, resource system  
**Implementation Status**: ✅ Backend fully functional, Frontend partially wired  
**Gaps**: Dashboard intelligence card actionLinks point to non-existent routes (~30+ broken links). Dismiss/complete actions not wired from most dashboards. Generation triggered via hook but results mapped imperfectly to dashboard card format.  
**Recommendation**: Fix all actionLink routes to point to real pages. Wire dismiss/complete buttons. Improve NBA → dashboard card mapping.

---

### J8. Institution Health Scorer

**Module**: Intelligence  
**Roles**: institution_admin, platform_admin  
**Location**: Backend — `intelligence/health.py`. Frontend — useInstitutionHealth hook + SchoolHealthScore + InstitutionHealthView  
**Purpose**: Provide a composite health index for schools based on 9 weighted metrics  
**Description**: `InstitutionHealthScorer` calculates a composite health score (0-100) from 9 weighted components: Teacher Activity (15%), Student Attendance (15%), Assignment Completion (12%), Resource Engagement (10%), Parent Engagement (10%), Intervention Completion (10%), Offline Result Trend (10%), Online Result Trend (10%), Adoption Depth (8%). Each component has its own scorer method querying real DB data. Risk level categorization: Critical (<40), At Risk (<60), Needs Attention (<75), Healthy (≥75). Creates InstitutionHealthSnapshot records for trend tracking.  
**Core Actions**: Calculate health score (backend), view score (frontend)  
**States**: Critical, At Risk, Needs Attention, Healthy  
**Data Dependencies**: All academic and operational data across the institution  
**Outputs**: InstitutionHealthSnapshot record, risk factors list  
**Connected Features**: SchoolHealthScore component, InstitutionHealthView page, InstitutionManagementPage  
**Implementation Status**: ⚠️ Backend fully functional, Frontend partially wired  
**Gaps**: InstitutionHealthView page is 100% hardcoded (doesn't use the real scorer). SchoolHealthScore component wired via hook. useInstitutionHealth hook has mock fallback. Risk Monitor page is mock.  
**Recommendation**: Wire InstitutionHealthView to real health scorer API. Connect Risk Monitor to real data. Remove mock fallback data.

---

### J16. Leaderboards (Anti-Shame Algorithm)

**Module**: Gamification  
**Roles**: Students  
**Location**: Component — Leaderboards.tsx  
**Purpose**: Motivational competition rankings that protect low-performing students  
**Description**: Tabbed leaderboard component with a unique anti-shame algorithm: displays top 3 students, then shows a window of students near the current user's rank (neighbors). Never shows the bottom of the leaderboard. This prevents demotivation while still enabling healthy competition. Supports multiple leaderboard categories. Uses medal/crown icons for top 3.  
**Core Actions**: View leaderboard, switch between categories  
**States**: Tabs by leaderboard category  
**Data Dependencies**: Leaderboard data (props-driven)  
**Outputs**: Display only  
**Connected Features**: Challenges, Points system, House teams  
**Implementation Status**: ✅ Component fully functional (props-driven)  
**Gaps**: Data is hardcoded when rendered in dashboards. No connection to intelligence engine's challenge/points APIs.  
**Recommendation**: Wire to `/api/v1/intelligence/challenges/{id}/leaderboard/` endpoint.

---

## K. MARKETPLACE & CONTENT COMMERCE

### K1. Marketplace Discovery

**Module**: Marketplace  
**Roles**: All users (public)  
**Location**: `/marketplace` — MarketplacePage → MarketplaceSubjectPage → MarketplaceTopicPage  
**Purpose**: Browse and purchase educational content organized by curriculum structure  
**Description**: 3-level marketplace hierarchy:

**Level 1 — Subject Grid** (`/marketplace`): Fetches subjects from `/api/v1/curriculum/subjects/`. Card grid with search and country filter. Connection status indicator (green dot for API connection, warning for fallback). Each card links to subject page.

**Level 2 — Subject Page** (`/marketplace/:country/:subjectId`): Breadcrumbs, subject header, tabs by class level. Displays topic cards with resource counts (video/notes/test — currently random mock). Right sidebar with "Top Tutors in Subject" (hardcoded) and "Live Support Available" (hardcoded). Each topic links to topic page.

**Level 3 — Topic Page** (`/marketplace/:country/:subjectId/:classId/:topicId`): Breadcrumbs, topic header, tabbed by content type (Videos/Notes/Tests). Fetches real marketplace listings from `/api/v1/marketplace/listing/?topic_bindings__topic={id}`. Displays listing cards with price, rating, student count. "Unlock Lesson" button enabled only for `universal_student` role.

**Core Actions**: Search, filter by country, browse subjects → topics → listings, unlock/purchase content  
**States**: Loading, empty, normal, connected/disconnected  
**Data Dependencies**: Curriculum API, Marketplace Listings API  
**Outputs**: Navigation through marketplace hierarchy, content purchase (backend)  
**Connected Features**: MarketplaceUploadModal (teacher content upload), Teacher Wallet (revenue), Revenue split  
**Implementation Status**: ✅ 85% — Real API throughout, functional navigation  
**Gaps**: Resource counts at subject level are random. Tutor sidebar is hardcoded. "Unlock Lesson" doesn't show purchase confirmation/payment flow. No review system surfaced.  
**Recommendation**: Wire resource counts from listing aggregation. Build tutor profile integration. Add purchase confirmation flow. Surface reviews.

---

## L. COMMUNICATION & NOTIFICATIONS

### L1. WhatsApp Integration

**Module**: Notifications  
**Roles**: Teachers, Institution admins  
**Location**: Backend notifications app, IntegrationsService in frontend  
**Purpose**: Send WhatsApp messages to parents and students via Twilio  
**Description**: Backend `NotificationViewSet` has `send-whatsapp` custom action that integrates with Twilio WhatsApp API. Frontend `IntegrationsService.sendWhatsAppTemplate()` posts to `/api/v1/notifications/notification/send-whatsapp/`. Includes a simulator fallback when Twilio credentials aren't present. `WhatsAppCommunicationHub` component provides a WhatsApp-clone chat UI but uses hardcoded messages only.  
**Core Actions**: Send WhatsApp template message, test connection  
**States**: Sent, failed, simulated  
**Data Dependencies**: Twilio API credentials, recipient phone numbers  
**Outputs**: Notification record, WhatsApp message delivered  
**Connected Features**: NotificationPreferences panel, TeacherDashboard (NBA "Message Parents" action)  
**Implementation Status**: ✅ Backend real (Twilio + fallback), Frontend partially wired  
**Gaps**: WhatsApp chat UI is hardcoded (not connected to real messages). No conversation history. Phone numbers hardcoded in preferences.  
**Recommendation**: Connect chat UI to real message thread. Wire recipient from student/parent records. Build conversation history.

---

## N. EXAM REGISTRATION

### N1-N5. National Exam Registration

**Module**: Exams  
**Roles**: universal_student  
**Location**: `/exam-registration` — ExamRegistrationPage  
**Purpose**: Register students for UNEB national examinations (UCE/UACE/PLE) with compliant subject selection  
**Description**: Multi-step wizard: (1) Search and select exam center from `/api/v1/exams/exam-center/`. (2) Choose exam type (UCE O-Level or UACE A-Level) and academic year. (3) Subject selection with full UNEB validation rules: O-Level requires 8-9 subjects (7 core compulsories + electives), A-Level requires GP + 3 principals + 1 subsidiary = 5 subjects. Validation uses `SubjectValidation` from `@/lib/subjectConfig` with detailed error messages. (4) Document upload (ID copy, academic records, passport photo — sends filenames not actual files). (5) Fee calculation based on subject count. (6) Submit registration to `/api/v1/exams/candidate-registration/`.  
**Core Actions**: Search centers, select exam type, choose subjects, upload documents, calculate fees, submit  
**States**: Step progression, validation errors, loading, submitted  
**Data Dependencies**: Exam centers API, UNEB subject catalog, registration rules  
**Outputs**: CandidateRegistration + SubjectSelection records  
**Connected Features**: UNEB curriculum config, Assessment system  
**Implementation Status**: ✅ 80% — Real API, comprehensive validation  
**Gaps**: Document upload sends filenames not files (no actual upload). Board submission batch not triggered. Fee payment not integrated. Alert() used for some confirmations instead of proper UI.  
**Recommendation**: Implement real document upload. Wire fee calculation to payment system. Replace alert() with proper dialogs. Build board batch submission for admin.

---

## O. AI & COPILOT

### O1-O2. AI Copilot System

**Module**: AI Services  
**Roles**: Students (floating widget), Teachers (studio widget + full page)  
**Location**: AICopilotWidget (Layout shell), AITeacherCopilotWidget (Lesson Studio), AITeachingAssistant (dedicated page)  
**Purpose**: AI-powered learning and teaching assistant using GPT-4o-mini  
**Description**: Live OpenAI GPT-4o-mini integration with 4 context routing modes: `quiz_generator` (generates JSON quiz structure), `smart_reply` (drafts parent/admin communications), `teaching_analytics` (analyzes class performance data), `general` (open-ended tutor). Student widget is floating action button in Layout shell with quick chips ("Physics Quiz", "Summarize Lesson"). Teacher widget is card-based in Lesson Studio. Full-page AITeachingAssistant has 3 tabs: Live Analytics (with mock chart + real AI analysis), Smart Replies (real AI generation), Quiz Generator (real AI JSON quiz). Chat state managed by AICopilotContext. Falls back to mock responses if OpenAI API key is missing. Each request creates an AIJob record for audit.  
**Core Actions**: Send messages, generate quiz, draft reply, analyze data  
**States**: Idle, loading (thinking animation), response received, error, offline  
**Data Dependencies**: OpenAI API key, user message, context type  
**Outputs**: AI-generated text/JSON, AIJob + AIOutput records for audit  
**Connected Features**: TeacherLessonStudio, Layout (student widget)  
**Implementation Status**: ✅ 85% — Real AI integration with graceful fallback  
**Gaps**: Chart data in analytics tab is mock. Quiz JSON output not automatically converted to Assessment records. Smart replies not sent through notification system. No conversation persistence across sessions.  
**Recommendation**: Wire quiz output to Assessment creation API. Connect smart replies to notification/WhatsApp system. Add conversation history persistence.

---

# 4. ROLE-BASED EXPERIENCE MAP

## Student Experience

### Pages Accessible
- `/` — Home (public)
- `/classes`, `/classes/*` — All course catalog and topic pages (public)
- `/library` — Academic Library (protected)
- `/resources` — Resource Discovery (protected)
- `/marketplace`, `/marketplace/*` — All marketplace pages (public)
- `/live-sessions` — Live Sessions (public)
- `/forum/*` — Forum (public)
- `/exam-registration` — Exam Registration (universal_student only)
- `/learning-path` — Learning Path (universal_student only)
- `/projects` — Projects (public)
- `/peer-tutoring` — Peer Tutoring (public)
- `/payment` — Payment (public, no protection)
- `/dashboard/student` — Student Dashboard (protected)
- `/dashboard/sessions/recover/:sessionId` — Missed Session Recovery (protected)

### Core Features
1. **Browse curriculum** — Full academic hierarchy from class to topic/lesson level
2. **Read/watch resources** — ResourceViewer with engagement tracking + continue reading/watching
3. **Take assessments** — MCQ auto-grading, essay/short answer submission
4. **AI Copilot** — Floating chat widget with GPT-4o-mini
5. **Forum participation** — Create and view discussion threads
6. **Exam registration** — UNEB registration with subject validation
7. **View dashboard** — Metrics, priorities, recommendations (mostly mock)

### Personalized Data
- Dashboard analytics (attendance, grades, readiness score)
- Subject performance grid (10 subjects)
- Resource engagement history (localStorage)
- Continue reading/watching state (localStorage)
- AI conversation history (session state)

### Key Limitations
- All dashboard action buttons are dead
- Intelligence card links point to non-existent routes
- Platform Launchpad links are wrong (`/tools/*` instead of root-level routes)
- No real progress tracking persisted to backend
- Learning path is entirely placeholder

---

## Parent Experience

### Pages Accessible
- Public pages (home, classes, marketplace, forum)
- `/dashboard/parent` — Parent Dashboard (protected)
- `/dashboard/sessions/recover/:sessionId` — Missed Session Recovery (protected)
- `/ai-assistant` — AI Assistant (NOT listed in role access — may be blocked)

### Core Features
1. **View children's academic performance** — Performance grid, intelligence cards (mock data)
2. **Action Center** — API-wired parent actions with acknowledge flow
3. **Smart Study Planner** — View child's weekly plan (API-wired)
4. **Household Finance** — Bill/payment overview (entirely mock)
5. **Celebration Engine** — See child's achievements (hardcoded)

### Personalized Data
- Children linked via ParentStudentLink
- Parent-specific NBA actions from intelligence engine
- Per-child performance data (when connected)

### Key Limitations
- 6+ dead buttons (reports, payments, messaging)
- 7 broken navigation links
- Household finance tab entirely mock
- No real message-to-teacher flow
- No real payment capability
- Weekly AI summary has no generation logic

---

## Institution-Attached Teacher Experience

### Pages Accessible
- Public pages
- `/ai-assistant` — AI Teaching Assistant (protected)
- `/dashboard/teacher` — Teacher Dashboard (protected)
- `/dashboard/teacher/class/:classId` — Lesson Studio (protected)
- `/dashboard/teacher/attendance` — Attendance Register (protected)
- `/dashboard/teacher/marks-upload` — Marks Upload (protected)
- `/dashboard/teacher/targeting` — Assignment Targeting (protected)

### Core Features
1. **Dashboard overview** — Analytics, class health cards, intelligence strip
2. **Lesson Studio** — Webinar provisioning (real Google Meet), lesson timeline
3. **Attendance Register** — Interactive mark register (local state only)
4. **Marks Upload** — Spreadsheet-style marks entry + CSV upload (mock)
5. **Assignment Targeting** — Blueprint + audience targeting (mock)
6. **AI Teaching Assistant** — Quiz generator, smart replies, analytics (real AI)

### Personalized Data
- Class assignments and performance via API
- Teacher-specific NBA actions
- Curriculum subjects taught

### Key Limitations
- 17 teacher sub-components ALL use hardcoded/simulated data
- "My Calendar" is a dead button
- 11 broken intelligence card links in dashboard
- Attendance register doesn't save to backend
- Marks upload doesn't submit to backend
- Target assignment dispatches to toast only

---

## Independent Teacher Experience

### Additional Features Beyond Institution Teacher
1. **Monetization Dashboard** — Real API: earnings overview, lesson qualifications, payout eligibility
2. **Payout Profile Management** — MTN/Airtel mobile money setup (real CRUD)
3. **Payout Request** — Real API submission when balance ≥ 50,000 UGX
4. **Marketplace Upload** — Publish content with strict curriculum tagging
5. **Teacher Storefront** — Public profile page (mock only)
6. **Independent Earnings Intelligence** — Content stats display (hardcoded)

### Key Limitations
- Storefront page is entirely mock
- Earnings intelligence component hardcoded
- Public profile is mock
- MoMo payout execution simulated
- Onboarding wizard doesn't submit to backend

---

## Institution Admin Experience

### Pages Accessible
- Public pages
- `/institution-management` — Institution Management (protected)
- `/dashboard/institution` — Institution Dashboard (protected, same component)
- `/dashboard/institution/timetable` — Timetable Studio (protected)
- `/dashboard/institution/health` — Health View (⚠️ NOT protected)
- `/dashboard/institution/health/upload` — Result Upload (⚠️ NOT protected)
- `/ai-assistant` — AI Teaching Assistant (protected)

### Core Features
1. **9-tab Management Dashboard** — Overview, Academics, Staff, Students, Timetable, Pastoral, Resources, Parents, War Room
2. **Student Onboarding (real)** — 3-step form with real API + credential generation
3. **Bulk Invite (real)** — Multi-email invite with role selection
4. **Resource Upload (real)** — Full upload modal
5. **Timetable Studio (mock)** — Period grid display, holidays list
6. **Health Score** — Composite score from intelligence hook
7. **Pastoral Timeline (mock)** — Behavior logging
8. **Exam War Room (mock)** — UNEB countdown and readiness

### Personalized Data
- Institution-scoped analytics, health scores, student data
- Staff performance metrics (mock)

### Key Limitations
- Duplicate routes (`/institution-management` and `/dashboard/institution`)
- Health view and upload pages have NO route protection
- Timetable entirely mock despite fully-functional backend
- Most intelligence/analytics components hardcoded
- Finance Hub is 90% complete but NOT ROUTED
- Pastoral and War Room features hardcoded

---

## Maple Platform Admin Experience

### Pages Accessible
- Public pages
- `/dashboard/admin` — Admin Dashboard (protected)
- `/dashboard/admin/intelligence` — Intelligence Hub (⚠️ NOT protected)
- `/dashboard/admin/intelligence/risk` — Risk Monitor (⚠️ NOT protected)

### Core Features
1. **Platform Dashboard** — Admin analytics API with mock fallback
2. **Global Curriculum Health** — Mastery/warning/critical distribution (mock)
3. **Institution Comparison** — Table of schools with health index (mock)
4. **Alumni Outcomes Tracker** — Employment/university stats (mock)
5. **Maple Intelligence Hub** — Growth funnel, ecosystem comparison (mock)
6. **Risk Monitor** — Institution health monitoring (mock)
7. **Platform Analytics Tabs** — Revenue, users, geography, performance (hybrid API)

### Key Limitations
- Intelligence Hub and Risk Monitor have NO route protection
- Nearly everything is hardcoded mock data
- Analytics layout with 6 sidebar links exists but is orphaned (no routes)
- Platform Command Center and Institution Intelligence pages exist but aren't routed

---

## Finance/Bursar Experience

### Available Features
- InstitutionFinanceHub page exists with 90% completion but is NOT ROUTED
- Fee management, payment logging, expense recording via DynamicSchemaForm
- Bursary/waiver engine with discount rules API
- Financial reporting (auto-calculated P&L)

### Key Limitations
- **Entire finance experience is inaccessible** — page not routed
- No dedicated bursar role protection on frontend
- Institution ID hardcoded to 1

---

## Counselor/Pastoral Experience

### Available Features
- PastoralTimeline component in Institution Management → Pastoral tab
- Behavior log types: commendation, counseling, incident
- House points/demerits system
- Narrative recording with visibility control (counselor-restricted)

### Key Limitations
- Entirely hardcoded mock data
- No dedicated counselor role login/routing
- No API persistence (save shows toast only)
- No student case management
- No pastoral dashboard

---

# 5. FEATURE RELATIONSHIP MAP

## Core Academic Flow
```
Curriculum Tree API
  └→ HomePage (class discovery)
    └→ CourseCatalog (/classes)
      └→ ClassSyllabusPage (terms → subjects)
        └→ SubjectTopicsPage (topic listing)
          └→ TopicDetailPage (learn + practice)
            ├→ ResourceViewer (read/watch content)
            │   ├→ useResourceEngagement (time/scroll tracking)
            │   └→ useStudentContinuity (save position → localStorage)
            │       └→ ContinuityPanel (continue reading/watching)
            ├→ ActiveAssessment (take quiz/exam)
            │   └→ Submission → auto-grade MCQ
            │       └→ SubjectGrade → ReportCard (PDF)
            └→ DiscussionThread (topic discussions)
```

## Student Lifecycle
```
RegisterPage (student path)
  └→ POST /auth/onboard-student/
    ├→ User + StudentProfile created
    ├→ ParentProfile created (lookup by phone)
    └→ ParentStudentLink created
      └→ JWT tokens → AuthContext
        └→ DashboardRouter → /dashboard/student
          ├→ Analytics API → dashboard metrics
          ├→ Intelligence Engine → NBA actions
          ├→ StudyPlanner → weekly plan
          ├→ Assessment system → grades → readiness
          └→ AI Copilot → learning support
```

## Institutional Student Lifecycle
```
InstitutionManagementPage → Students tab
  └→ StudentOnboardingForm
    ├→ POST /institutions/learner-registrations/start_registration/
    ├→ POST .../verify_payment/ (auto-approved)
    └→ POST .../finalize_account/
      ├→ Student ID generated (maple-ug-XXXX)
      ├→ System username generated
      └→ 4-digit PIN set
        └→ Student can login with system_username + PIN
```

## Teacher Monetization Flow
```
IndependentTeacherWizard (onboarding - simulated)
  └→ TeacherDashboard → Earnings tab
    └→ TeacherMonetizationDashboard
      ├→ MarketplaceUploadModal → POST /marketplace/listing/
      │   └→ ListingTopicBinding (curriculum tagging)
      ├→ PayoutProfile CRUD → /marketplace/payout-profile/
      ├→ LessonQualificationEngine (5-rule evaluation)
      │   └→ Lesson scores: public class + profile + threshold + quality + engagement
      │       └→ LessonQualificationRecord (8-step status)
      └→ PayoutRequest → /marketplace/payouts/
        └→ PayoutEligibilityCheck
          └→ PayoutTransaction → MoMo (simulated)
            └→ PayoutAuditLog (status changes)
```

## Listing Purchase Flow
```
MarketplaceTopicPage → "Unlock Lesson"
  └→ POST /marketplace/listing/{id}/purchase/
    ├→ LicenseDeal created
    ├→ Teacher Wallet credited (80%)
    └→ Platform keeps 20%
```

## Institution Health Pipeline
```
InstitutionHealthScorer (backend service)
  ├→ _teacher_activity (15%)
  ├→ _student_attendance (15%)
  ├→ _assignment_completion (12%)
  ├→ _resource_engagement (10%)
  ├→ _parent_engagement (10%)
  ├→ _intervention_completion (10%)
  ├→ _offline_result_trend (10%)
  ├→ _online_result_trend (10%)
  └→ _adoption_depth (8%)
    └→ InstitutionHealthSnapshot (DB record)
      └→ useInstitutionHealth hook
        └→ SchoolHealthScore component
          └→ InstitutionManagementPage (Overview tab)
```

## Live Session Pipeline
```
TeacherLessonStudio → "Live Schedule"
  └→ POST /live-sessions/provision-webinar/
    ├→ Google Calendar event created
    ├→ Google Meet room provisioned
    └→ Meeting link → clipboard
      └→ LiveSession record (DB)
        └→ LiveSessionsPage (discovery)
          └→ LiveSessionCTA component
            ├→ [Scheduled] → countdown + RSVP
            ├→ [Live] → "Join Meeting" → opens Meet URL
            ├→ [Missed] → recovery page link
            └→ [Completed] → replay (not functional)

ASYNC (post-session):
  Celery: sync_meet_recordings_job
    └→ Google Drive → download recording
      └→ Vimeo API → upload video
        └→ LiveSession.replay_url updated
```

## Intervention Pipeline
```
InterventionRiskDetection (engine - simulated counts)
  └→ StudentRiskAlert (severity: red/amber/yellow)
    └→ InterventionPlan (assigned teacher, deadline)
      └→ InterventionAction (6 types)
        └→ InterventionEffectivenessTracker (ROI)

Intelligence NBA Engine also creates:
  └→ InterventionPack (subject-specific bundle)
    └→ InterventionPackAssignment (student-level)
      └→ SmartInterventionBundle (teacher UI - mock)
```

## Report Card Pipeline
```
Submissions (assessment answers)
  └→ Auto-grade MCQ (on create)
  └→ Teacher grades essay/short answer
    └→ SubjectGrade (NCDC 20/80 engine)
      ├→ formative_score (20% weight)
      └→ summative_score (80% weight)
        └→ total_score → grade_letter (A* to G)
          └→ ReportCard
            └→ Celery: generate_ncdc_report_card
              └→ HTML template → WeasyPrint → PDF
                └→ Headteacher publishes (is_published)
```

## Resource Upload & Discovery Pipeline
```
ResourceUploadModal → POST /resources/resource/ (FormData)
  ├→ [Document/PDF] → stored on server
  └→ [Video] → Celery: process_vimeo_upload
    └→ Vimeo API upload → update resource URL → delete local file
      └→ Resource record (visibility-scoped)
        ├→ AcademicLibraryPage (search/filter/sort)
        ├→ ResourceDiscoveryPage (paginated grid)
        ├→ TopicDetailPage → ResourceViewer
        └→ ResourceEngagementRecord (tracking)
```

---

# 6. IMPLEMENTATION MATURITY REPORT

## Fully Functional (End-to-End Working)

| Feature | Backend | Frontend | Wiring |
|---------|---------|----------|--------|
| JWT Authentication (login/register) | ✅ | ✅ | ✅ |
| Curriculum Tree (browse classes/subjects/topics) | ✅ | ✅ | ✅ |
| Resource Upload (with Vimeo pipeline) | ✅ | ✅ | ✅ |
| Resource Browsing (library + discovery) | ✅ | ✅ | ✅ |
| AI Copilot (GPT-4o-mini) | ✅ | ✅ | ✅ |
| Assessment System (create + auto-grade MCQ) | ✅ | ✅ | ✅ |
| Webinar Provisioning (Google Meet) | ✅ | ✅ | ✅ |
| Student Onboarding (institutional, 3-step) | ✅ | ✅ | ✅ |
| Bulk Invite (institution) | ✅ | ✅ | ✅ |
| Marketplace Discovery (3-level hierarchy) | ✅ | ✅ | ✅ |
| Marketplace Upload (curriculum-tagged) | ✅ | ✅ | ✅ |
| Teacher Payout System | ✅ | ✅ | ✅ |
| Exam Registration (UNEB validation) | ✅ | ✅ | ✅ |
| WhatsApp Notifications (Twilio) | ✅ | ✅ | ✅ |
| RBAC Permission System | ✅ | ✅ | ✅ |
| Discussion Threads (create + reply) | ✅ | ✅ | ⚠️ Hybrid |
| Parent Action Center | ✅ | ✅ | ⚠️ Hybrid |

## Mostly Working (Minor Gaps)

| Feature | Issue |
|---------|-------|
| Marketplace Listings (topic page) | "Unlock" flow incomplete |
| Live Sessions Page | RSVP local-only, replay dead |
| Forum Page | Thread creation works, replies/likes broken |
| Student Registration | Redirect goes to wrong URL |
| Course Detail | Reviews and resources hardcoded |
| NCDC Grading Engine | No frontend to view/download reports |

## Backend Functional, Frontend Not Connected

| Feature | Backend Status | Frontend Gap |
|---------|---------------|--------------|
| Timetable (CRUD + collision + auto-allocate) | ✅ Full | 🔴 100% mock UI |
| Attendance (daily + lesson) | ✅ Full | 🔴 alert() only |
| Intervention System | ✅ Models + engine | 🔴 No API endpoints, no UI |
| Institution Finance | ✅ Full | 🟡 90% UI exists but NOT ROUTED |
| Analytics Layout + Pages | ✅ Dashboard APIs | 🔴 Layout orphaned, no routes |
| Health Scorer | ✅ Full | 🟡 Hook wired, detail page mock |
| NBA Engine | ✅ Full | 🟡 Hook wired, action links broken |
| Study Planner | ✅ Full | 🟡 Hook wired, some dashboards connected |
| Grading/Report Cards | ✅ Full (PDF gen) | 🔴 No view/download UI |
| Meeting Recording Sync | ✅ Celery pipeline | 🔴 Replay button dead |
| Resource Engagement API | ✅ LearningProgress model | 🔴 Client tracks only locally |

## UI-Only (No Backend Connection)

| Feature | Frontend Status |
|---------|-----------------|
| Learning Path Page | 20% — full mock, no API |
| Projects Page | 15% — full mock, no API |
| Peer Tutoring Hub | 15% — full mock, toast actions |
| Teacher Marks Upload | 30% — polished UI, no API |
| Assignment Targeting Studio | 25% — full UI, no API |
| Public Profile | 25% — mock profile |
| Teacher Storefront | 20% — mock storefront |
| Missed Session Recovery | 20% — skeleton, mock data |
| Maple Intelligence Hub | 25% — hardcoded data |
| Institution Risk Monitor | 20% — mock institutions |
| All Teacher Dashboard Components (17) | Hardcoded/simulated |
| All Parent Dashboard Components (except 2) | Hardcoded/mock |

## Not Working / Broken

| Feature | Issue |
|---------|-------|
| 30+ Dashboard Action Links | Point to non-existent routes |
| Student Launchpad Links | Wrong paths (/tools/* instead of /*) |
| Post-Registration Redirect | Goes to non-existent /student-dashboard |
| 4 Admin/Institution Routes | No ProtectedRoute wrapper (security) |
| Forum Reply/Like | Submit handlers missing |
| Forgot Password | Label exists, no flow |
| Offline Sync Engine | All methods are console.log stubs |
| Session Replay | Button exists, no functionality |

---

# 7. WEAK / MISSING FEATURE REPORT

## Critical Missing Features

### 1. Dashboard Action Routing
**What exists**: 30+ actionLink URLs in intelligence cards across all dashboards  
**What's missing**: The target routes don't exist in App.tsx (e.g., `/dashboard/library`, `/dashboard/analytics`, `/dashboard/interventions`, `/dashboard/earnings`)  
**Impact**: Every dashboard feels non-functional — users click links that go nowhere  
**Fix**: Either create the missing pages or update links to point to existing pages

### 2. Finance Hub Routing
**What exists**: 90% complete finance management hub with real API integration  
**What's missing**: No route in App.tsx  
**Impact**: The most complete unshipped feature is invisible to users  
**Fix**: Add route `/dashboard/institution/finance` with ProtectedRoute

### 3. Analytics Layout Routing
**What exists**: 3 analytics pages with real API + Recharts, plus sidebar layout with permission guards  
**What's missing**: No `/analytics/*` routes in App.tsx  
**Impact**: Complete analytics suite is invisible  
**Fix**: Add 6 analytics routes under Layout wrapper

### 4. Route Protection Gaps
**What exists**: 4 dashboard routes with NO ProtectedRoute wrapper  
**What's missing**: Auth guards on admin intelligence hub, risk monitor, institution health, offline upload  
**Impact**: Any authenticated user can access admin/institution data  
**Fix**: Wrap all 4 routes in ProtectedRoute with appropriate role restrictions

## High Priority Gaps

### 5. Teacher Component API Wiring
**What exists**: 17 polished teacher components (payout status, quality score, intervention bundle, etc.)  
**What's missing**: ALL 17 components use hardcoded/simulated data — zero API connections  
**Impact**: Teacher dashboard looks impressive but is a complete shell  
**Fix**: Wire each component to corresponding intelligence/analytics/marketplace API endpoints

### 6. Timetable Frontend-Backend Gap
**What exists**: Backend has full timetable CRUD + collision detection + auto-allocator. Frontend has mock grid.  
**What's missing**: Frontend API integration, interactive CRUD, auto-allocator button  
**Impact**: Most valuable operations feature is unusable  
**Fix**: Wire timetable studio to `/api/v1/scheduling/timetable/` endpoints, build drag-and-drop interface

### 7. Attendance Frontend-Backend Gap
**What exists**: Backend has daily + lesson attendance CRUD with RBAC. Frontend has interactive matrix.  
**What's missing**: Frontend uses `alert()` for save, no API calls  
**Impact**: Teachers can mark attendance but it's lost on refresh  
**Fix**: Wire submit to `/api/v1/attendance/daily/` endpoint

### 8. Dashboard Action Buttons
**What exists**: ~50 buttons across all dashboards (View Schedule, Resume Learning, Join Meeting, etc.)  
**What's missing**: onClick handlers on nearly all buttons  
**Impact**: Dashboards look functional but nothing is clickable  
**Fix**: Prioritize high-traffic buttons (Resume Learning, View Schedule, Join Meeting)

## Medium Priority Gaps

### 9. Dual API Client Inconsistency
**What exists**: `apiClient.ts` (fetch-based with JWT refresh) and `api.ts` (axios-based with interceptors)  
**What's missing**: Unified approach — some pages use one, some the other  
**Impact**: Potential auth header inconsistencies, maintenance burden  
**Fix**: Standardize on `apiClient.ts` (more complete), migrate all `api.ts` usage

### 10. Resource Engagement Persistence
**What exists**: Client-side tracking (time, scroll, progress) via hooks + localStorage  
**What's missing**: API persistence to `/intelligence/learning-progress/` endpoint  
**Impact**: All reading/watching progress lost when clearing browser data  
**Fix**: Periodically POST engagement snapshots to backend LearningProgress model

### 11. Intervention System
**What exists**: Models, risk engine (simulated), intervention plans, effectiveness tracker  
**What's missing**: API endpoints (`views.py` is empty), frontend integration  
**Impact**: Entire intervention workflow is invisible  
**Fix**: Build ViewSet for intervention models, surface in teacher dashboard

### 12. Report Card Access
**What exists**: Full NCDC grading engine, PDF generation via Celery + WeasyPrint  
**What's missing**: No frontend page to view or download report cards  
**Impact**: Even when grades are calculated and reports generated, nobody can see them  
**Fix**: Add report card viewer to student and parent dashboards, admin bulk generation UI

### 13. Parent Finance Experience
**What exists**: Household Finance tab in parent dashboard  
**What's missing**: All data is hardcoded — no connection to institution finance APIs  
**Impact**: Parents can't see real billing/payment information  
**Fix**: Wire to institution finance endpoints scoped by parent-student links

### 14. Onboarding Wizard Completion
**What exists**: Institution wizard (3/10 steps), Teacher wizard (4/8 steps)  
**What's missing**: Remaining steps + API submission  
**Impact**: Neither wizard creates actual backend records  
**Fix**: Wire existing steps to backend APIs, build remaining step UIs progressively

## Low Priority Gaps

- Forgot password flow
- Forum reply/like functionality
- Session replay implementation
- Real payment gateway integration (Payment page)
- Offline sync engine (Service Worker + IndexedDB)
- Teacher storefront and public profile (real data)
- Peer tutoring matching engine
- Voice note recording (real MediaRecorder)
- Meeting recording retrieval (replay in UI)
- Board submission batch processing (exam registration admin)

---

# 8. RECOMMENDED NEXT PRIORITIES

## Tier 1: Fix Immediately (Security + Critical UX)

| # | Action | Impact | Effort |
|---|--------|--------|--------|
| 1 | Add ProtectedRoute to 4 unguarded routes | Security fix | Low |
| 2 | Route InstitutionFinanceHub at `/dashboard/institution/finance` | Unblocks complete feature | Low |
| 3 | Fix post-registration redirect (`/student-dashboard` → `/dashboard/student`) | Broken user flow | Low |
| 4 | Fix StudentPlatformLaunchpad links (`/tools/*` → correct paths) | Broken navigation | Low |
| 5 | Route analytics pages (AnalyticsLayout + 2 command center pages) | Unblocks 3 complete pages | Low |
| 6 | Standardize API client usage (all pages use `apiClient.ts`) | Consistency + auth correctness | Medium |

## Tier 2: Fix Before Demo (Core Functionality)

| # | Action | Impact | Effort |
|---|--------|--------|--------|
| 7 | Wire attendance register to backend API | Teacher core feature | Low |
| 8 | Wire timetable studio to backend API + collision detection | Institution core feature | Medium |
| 9 | Fix 30+ broken dashboard intelligence card links | Dashboard usability | Medium |
| 10 | Wire 5 highest-traffic dead buttons (Resume Learning, View Schedule, Join Meeting, etc.) | UX completeness | Medium |
| 11 | Wire teacher marks upload to backend assessment API (POST grades) | Teacher core feature | Medium |
| 12 | Wire institution health view page to real health scorer API | Intelligence showcase | Low |

## Tier 3: Fix Before Production (Feature Completeness)

| # | Action | Impact | Effort |
|---|--------|--------|--------|
| 13 | Wire teacher dashboard components to real APIs (start with 5 most impactful) | Teacher experience | High |
| 14 | Wire parent dashboard finance tab to institution finance API | Parent experience | Medium |
| 15 | Build report card viewer + download for students and parents | Grading completeness | Medium |
| 16 | Wire resource engagement persistence to LearningProgress API | Data durability | Medium |
| 17 | Wire institution/teacher onboarding wizards to backend APIs | Onboarding flow | Medium |
| 18 | Build intervention ViewSet + surface in teacher dashboard | Risk management | Medium |
| 19 | Implement forum reply/like functionality | Community engagement | Low |
| 20 | Add conversation persistence for AI copilot | User experience | Medium |

## Tier 4: Improvement Backlog (Polish + Expansion)

| # | Action | Impact | Effort |
|---|--------|--------|--------|
| 21 | Complete Learning Path page (connect to curriculum) | Student journey | High |
| 22 | Complete Projects page (real project management) | Academic work | High |
| 23 | Build peer tutoring matching engine | Social learning | High |
| 24 | Implement real payment gateway (MoMo, PesaPal) | Revenue | High |
| 25 | Build offline sync (Service Worker + IndexedDB) | Connectivity | High |
| 26 | Build session replay viewer (connect to Vimeo recordings) | Live learning | Medium |
| 27 | Implement forgot password flow | Auth completeness | Low |
| 28 | Build teacher storefront with real data | Marketplace | Medium |
| 29 | Connect quiz generation AI output to Assessment creation | AI value | Medium |
| 30 | Build pastoral case management system | Student welfare | High |

---

*End of Complete Platform Audit & Feature Inventory*  
*Total features documented: 180+*  
*Total pages audited: 45*  
*Total components audited: ~80*  
*Total backend apps audited: 21*
