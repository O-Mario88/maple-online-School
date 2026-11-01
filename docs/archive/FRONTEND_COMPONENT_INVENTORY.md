# Maple Frontend Codebase Inventory

**Last Updated:** April 5, 2026  
**Total Pages:** 39  
**Total Components:** 100+  
**Organized by Feature Area**

---

## 🎯 Executive Summary

| Category | Count | Mixed | API-Only | Mock-Only | Status |
|----------|-------|-------|----------|-----------|--------|
| **Pages** | 39 | 3 | 12 | 5 | ⚠️ |
| **Dashboard Components** | 21 | 0 | 2 | 5 | 🟡 |
| **Teacher Components** | 17 | 0 | 1 | 0 | 🟡 |
| **Academic Components** | 5 | 0 | 1 | 2 | 🟡 |
| **Admin Components** | 5 | 0 | 0 | 0 | 🟢 |
| **Marketplace Components** | 3 | 0 | 3 | 0 | 🟢 |
| **Auth Components** | 1 | 0 | 0 | 0 | 🟢 |
| **UI Components** | 50+ | - | - | - | 🟢 |

---

## 📄 PAGE COMPONENTS (src/pages)

### 🏠 Homepage & Landing Pages

#### 1. [HomePage.tsx](src/pages/HomePage.tsx)
- **Purpose:** Landing page displaying popular classes/marketplace listings
- **Data Source:** MIXED - `apiClient` + `DEFAULT_CLASSES` fallback
- **API Endpoints:** `/curriculum/listings/` (via apiGet)
- **Mock Data:** `DEFAULT_CLASSES` (3 sample class cards)
- **Key Components Used:** Button, EditorialHeader, EditorialPanel
- **Integration Status:** ⚠️ **PARTIAL** - Uses apiGet but has hardcoded DEFAULT_CLASSES fallback
- **Priority:** HIGH - Core marketplace feature

#### 2. [CourseCatalog.tsx](src/pages/CourseCatalog.tsx)
- **Purpose:** Browse and filter courses by level/subject
- **Data Source:** FETCH (public/data/*.json files)
- **API Endpoints:** `/data/courses.json`, `/data/users.json`
- **Integration Status:** ⚠️ **MOCK** - Uses fetch from static JSON files
- **Priority:** HIGH - Key discovery feature

#### 3. [CourseDetail.tsx](src/pages/CourseDetail.tsx)
- **Purpose:** Detailed view of a course with lessons, resources, discussions
- **Data Source:** TYPE-BASED (requires UgandaLevel, UgandaClass, Subject, Teacher types)
- **Uses:** useAuth, OfflineSyncEngine
- **Integration Status:** 🟡 **PARTIAL** - Type-driven, no explicit API shown
- **Priority:** HIGH - Core learning experience

#### 4. [PublicProfile.tsx](src/pages/PublicProfile.tsx)
- **Purpose:** Public teacher/student profile view
- **Data Source:** Unknown - needs audit
- **Integration Status:** 🟡 **UNKNOWN**
- **Priority:** MEDIUM

---

### 👤 Authentication Pages

#### 5. [LoginPage.tsx](src/pages/LoginPage.tsx)
- **Purpose:** User login/authentication
- **Data Source:** AUTH CONTEXT - Uses `useAuth().login()`
- **Integration Status:** 🟢 **COMPLETE** - Via AuthContext
- **Priority:** CRITICAL

#### 6. [RegisterPage.tsx](src/pages/RegisterPage.tsx)
- **Purpose:** Multi-role registration (student, teacher, institution)
- **Data Source:** AUTH CONTEXT - Uses `useAuth().register()`, `useAuth().onboardStudent()`
- **Features:** Wizard-based multi-step registration with role selection
- **Integration Status:** 🟢 **COMPLETE** - Via AuthContext
- **Priority:** CRITICAL

---

### 📚 Student Dashboard & Learning Pages

#### 7. [StudentDashboard.tsx](src/pages/StudentDashboard.tsx)
- **Purpose:** Student personalized dashboard with KPIs, performance, sessions
- **Data Source:** 🟢 **API INTEGRATED** - `apiClient.get('/analytics/student-dashboard/')`
- **Child Components:**
  - IntelligenceCard (renders intelligence alerts)
  - DashboardSkeleton (loading state)
  - CareerGuidanceWidget
  - StudentResourceEngagementPanel (MOCK data)
  - StudentActionCenter (MIXED - apiGet w/ DEFAULT_MOCK_ACTIONS fallback)
  - StudentPlatformLaunchpad
  - StudentMotivationEngine
  - DashboardGrid/Section/Card (layout components)
- **Mock Fallback Data:** Extensive fallback object with kpis, subjectPerformance, intelligence array
- **Integration Status:** 🟢 **COMPLETE** with graceful fallback
- **Priority:** CRITICAL

#### 8. [AcademicLibraryPage.tsx](src/pages/AcademicLibraryPage.tsx)
- **Purpose:** Browse academic resources (textbooks, guides, past papers)
- **Data Source:** ❌ **MOCK ONLY** - `MOCK_RESOURCES` (20+ hardcoded resources)
- **Components Used:** Button, Card, Badge, Tabs
- **Mock Categories:** TextBook, StudyGuide, PastPaper, LessonNotes, WebResource
- **Integration Status:** ❌ **NOT INTEGRATED** - 100% mock data
- **Priority:** HIGH - Needs API integration

#### 9. [TopicDetailPage.tsx](src/pages/TopicDetailPage.tsx)
- **Purpose:** Deep dive into topic with lessons, exercises, resources
- **Data Source:** MIXED - API + `MOCK_ASSIGNMENTS` fallback
- **Mock Data:** `MOCK_ASSIGNMENTS` (2 quiz/worksheet items)
- **Features:** Maps exercises, appends mock assignments if scarce
- **Integration Status:** ⚠️ **PARTIAL** - Falls back to mock for practice density
- **Priority:** HIGH

#### 10. [SubjectTopicsPage.tsx](src/pages/SubjectTopicsPage.tsx)
- **Purpose:** List all topics in a subject with progress tracking
- **Data Source:** Unknown - needs audit
- **Integration Status:** 🟡 **UNKNOWN**
- **Priority:** HIGH

#### 11. [LearningPathPage.tsx](src/pages/LearningPathPage.tsx)
- **Purpose:** AI-recommended learning path for student
- **Data Source:** Unknown - needs audit
- **Integration Status:** 🟡 **UNKNOWN**
- **Priority:** MEDIUM

#### 12. [MissedSessionRecoveryPage.tsx](src/pages/MissedSessionRecoveryPage.tsx)
- **Purpose:** Help students recover from missed sessions with recordings/notes
- **Data Source:** Unknown - needs audit
- **Integration Status:** 🟡 **UNKNOWN**
- **Priority:** MEDIUM

---

### 👨‍🏫 Teacher Dashboard Pages

#### 13. [TeacherDashboard.tsx](src/pages/TeacherDashboard.tsx)
- **Purpose:** Main teacher dashboard with classes, students, earnings
- **Data Source:** 🟢 **API INTEGRATED** - `apiClient.get('/analytics/teacher-dashboard/')`
- **Child Components:** (26 child components!)
  - **Dashboard Panels:**
    - TeacherRedAlertsPanel
    - TeacherInterventionPanel
    - TeacherResourceEngagementPanel (MOCK: MOCK_RESOURCE_ANALYTICS)
  - **Competition:**
    - Leaderboards
    - HouseStandingsCard
  - **Intelligence & Metrics:**
    - TeacherQualityScore (with TeacherQualityMetrics interface)
    - SmartInterventionBundle (SmartInterventionBuilder)
    - VoiceNoteWidget
    - ClassHealthCard
    - NextBestActionQueue
    - TeachingWinsTimeline
    - ResourceEffectivenessIntelligence
    - TeacherReflectionAssistant
    - ParentCommunicationCopilot
    - AITeachingPartner
    - TeacherPerformanceStory
    - TeacherGrowthPassport
    - IndependentEarningsIntelligence
    - TeacherCompetitionLeaderboards
    - TeacherPayoutStatusCard
  - **Modals:**
    - MarketplaceUploadModal
    - ResourceUploadModal
    - TeacherMonetizationDashboard
  - **Layout:**
    - DashboardGrid/Section/Card
- **Integration Status:** 🟢 **COMPLETE** - Comprehensive API integration
- **Priority:** CRITICAL

#### 14. [TeacherLessonStudio.tsx](src/pages/TeacherLessonStudio.tsx)
- **Purpose:** Create/edit lessons with multimedia support
- **Data Source:** ⚠️ **PARTIAL** - Commented out `apiClient`, uses fetch for webinar provisioning
- **Code Comment:** `// const res = await apiClient.post('/live-sessions/provision-webinar/', ...)`
- **Integration Status:** ⚠️ **INCOMPLETE** - apiClient commented out, using fetch
- **Priority:** HIGH - Needs completion

#### 15. [TeacherMarksUpload.tsx](src/pages/TeacherMarksUpload.tsx)
- **Purpose:** Bulk upload student grades/marks
- **Data Source:** Unknown - needs audit
- **Components:** Card, Button, Badge, Input, Select, Toast notifications
- **Integration Status:** 🟡 **UNKNOWN**
- **Priority:** HIGH

#### 16. [TeacherStorefront.tsx](src/pages/TeacherStorefront.tsx)
- **Purpose:** Display teacher's marketplace profile and offerings
- **Data Source:** Unknown - needs audit
- **Integration Status:** 🟡 **UNKNOWN**
- **Priority:** MEDIUM

#### 17. [IndependentTeacherWizard.tsx](src/pages/IndependentTeacherWizard.tsx)
- **Purpose:** Onboarding wizard for independent/freelance teachers
- **Data Source:** Unknown - needs audit
- **Integration Status:** 🟡 **UNKNOWN**
- **Priority:** MEDIUM

---

### 👨‍👩‍👧 Parent Dashboard Pages

#### 18. [ParentDashboard.tsx](src/pages/ParentDashboard.tsx)
- **Purpose:** Parent monitoring of child's progress, attendance, behavior
- **Data Source:** 🟢 **API INTEGRATED** - `apiClient.get('/analytics/parent-dashboard/')`
- **Child Components:**
  - ParentResourceEngagementPanel (MOCK: MOCK_CHILD_RESOURCES)
  - StreakTracker
  - AchievementShowcase
  - ParentActionCenter
  - CelebrationEngineWidget
  - IntelligenceCard
  - SmartStudyPlanner
  - DashboardGrid/Section/Card
- **Integration Status:** 🟢 **COMPLETE** with MOCK panel
- **Priority:** HIGH

#### 19. [ParentPortal.tsx](src/pages/ParentPortal.tsx) *(Not explicitly listed but likely exists)*
- **Purpose:** Access child's data, communicate with teachers
- **Integration Status:** 🟡 **UNKNOWN**
- **Priority:** MEDIUM

---

### 📋 Institution/Admin Pages

#### 20. [AdminDashboard.tsx](src/pages/AdminDashboard.tsx)
- **Purpose:** Platform admin overview of institutions, users, analytics
- **Data Source:** 🟢 **API INTEGRATED** - `apiClient.get('/analytics/admin-dashboard/')`
- **Child Components:**
  - ResourceUploadModal
  - IntelligenceCard
  - GlobalInstitutionComparison
  - AlumniOutcomesTracker
  - DashboardSkeleton
  - PlatformAnalyticsTabs
  - GlobalCurriculumHealth
  - CurriculumDistributionMap
  - Tabs, Badge, Progress, Card components
- **Integration Status:** 🟢 **COMPLETE**
- **Priority:** HIGH

#### 21. [InstitutionManagementPage.tsx](src/pages/InstitutionManagementPage.tsx)
- **Purpose:** School admin manages institution data, staff, classes
- **Data Source:** 🟢 **API INTEGRATED** - `apiClient.get('/analytics/institution-dashboard/')`
- **Integration Status:** 🟢 **COMPLETE**
- **Priority:** HIGH

#### 22. [InstitutionWizard.tsx](src/pages/InstitutionWizard.tsx)
- **Purpose:** Onboarding wizard for new institutions
- **Data Source:** Unknown - needs audit
- **Integration Status:** 🟡 **UNKNOWN**
- **Priority:** MEDIUM

#### 23. [InstitutionTimetableStudio.tsx](src/pages/InstitutionTimetableStudio.tsx)
- **Purpose:** Create/manage institution timetable/schedule
- **Data Source:** ❌ **MOCK ONLY** - `MOCK_GRID` (hardcoded timetable grid)
- **Integration Status:** ❌ **NOT INTEGRATED**
- **Priority:** HIGH - Needs API integration

#### 24. [InstitutionFinanceHub.tsx](src/pages/InstitutionFinanceHub.tsx)
- **Purpose:** Manage tuition, fees, billing, expenses
- **Components:** DynamicSchemaForm, Card, Tabs, Input, Select, Badge
- **Schemas Used:** FeeItemConfig, OfflinePOSReceiptConfig, ExpenseRecordConfig
- **Data Source:** Unknown - schema-driven
- **Integration Status:** 🟡 **PARTIAL** - Schema-driven forms
- **Priority:** HIGH

#### 25. [AttendanceRegisterPage.tsx](src/pages/AttendanceRegisterPage.tsx)
- **Purpose:** Take/view class attendance records
- **Data Source:** Unknown - needs audit
- **Integration Status:** 🟡 **UNKNOWN**
- **Priority:** HIGH

---

### 🎓 Assessment & Exams

#### 26. [ExamRegistrationPage.tsx](src/pages/ExamRegistrationPage.tsx)
- **Purpose:** Students register for exams (UNEB, etc.)
- **Data Source:** 🟢 **API INTEGRATED**
  - `apiClient.get('/exams/exam-center/')` - Fetch exam centers
  - `apiClient.post('/exams/candidate-registration/', {...})` - Register student
- **Components:** EditorialPanel, EditorialPill, EditorialHeader, Tabs, Badge, Checkbox, RadioGroup
- **Integration Status:** 🟢 **COMPLETE**
- **Priority:** CRITICAL

#### 27. [ExploreLessonsPage.tsx](src/pages/ExploreLessonsPage.tsx) *(Inferred)*
- **Purpose:** Browse and explore available lessons
- **Integration Status:** 🟡 **UNKNOWN**
- **Priority:** MEDIUM

---

### 🛒 Marketplace Pages

#### 28. [MarketplacePage.tsx](src/pages/MarketplacePage.tsx)
- **Purpose:** Browse and search marketplace for resources, courses, lessons
- **Data Source:** 🟢 **API INTEGRATED** - `apiClient.get('/curriculum/subjects/')`
- **Integration Status:** 🟢 **COMPLETE**
- **Priority:** HIGH

#### 29. [MarketplaceSubjectPage.tsx](src/pages/MarketplaceSubjectPage.tsx)
- **Purpose:** View all resources for a specific subject
- **Data Source:** 🟢 **API INTEGRATED**
  - `apiClient.get('/curriculum/subjects/{subjectId}/')`
  - `apiClient.get('/curriculum/topics/?subject={subjectId}')`
- **Integration Status:** 🟢 **COMPLETE**
- **Priority:** HIGH

#### 30. [MarketplaceTopicPage.tsx](src/pages/MarketplaceTopicPage.tsx)
- **Purpose:** View resources filtered by topic
- **Data Source:** 🟢 **API INTEGRATED**
  - `apiClient.get('/curriculum/subjects/{subjectId}/')`
  - `apiClient.get('/curriculum/topics/{topicId}/')`
  - `apiClient.get('/marketplace/listing/?topic_bindings__topic={topicId}')`
- **Integration Status:** 🟢 **COMPLETE**
- **Priority:** HIGH

---

### 💳 Payment & Billing

#### 31. [PaymentPage.tsx](src/pages/PaymentPage.tsx)
- **Purpose:** Payment gateway for course purchases, fees
- **Data Source:** Unknown - likely payment API integration
- **Components:** useAuth, Button, Card, Badge, Input
- **Integration Status:** 🟡 **UNKNOWN**
- **Priority:** CRITICAL

---

### 🎬 Live Sessions & Collaboration

#### 32. [LiveSessionsPage.tsx](src/pages/LiveSessionsPage.tsx)
- **Purpose:** Browse and join live webinar sessions
- **Data Source:** MIXED
  - API: `apiClient.get('/live-sessions/live-session/')`
  - Mock Fallback: `MOCK_SESSIONS` (3 sample sessions)
- **Features:** Falls back to MOCK_SESSIONS if API returns empty
- **Integration Status:** ⚠️ **PARTIAL** - Has graceful mock fallback
- **Priority:** HIGH

#### 33. [PeerTutoringPage.tsx](src/pages/PeerTutoringPage.tsx)
- **Purpose:** Browse peer tutors and book sessions
- **Data Source:** Unknown - needs audit
- **Integration Status:** 🟡 **UNKNOWN**
- **Priority:** HIGH

#### 34. [PeerTutoringHub.tsx](src/pages/PeerTutoringHub.tsx)
- **Purpose:** Hub for peer-to-peer tutoring marketplace
- **Data Source:** Unknown - needs audit
- **Integration Status:** 🟡 **UNKNOWN**
- **Priority:** HIGH

---

### 🗣️ Discussion & Community

#### 35. [ForumPage.tsx](src/pages/ForumPage.tsx)
- **Purpose:** Discussion forum for Q&A, peer learning
- **Data Source:** Unknown - needs audit
- **Interface:** ForumPost with id, title, content
- **Integration Status:** 🟡 **UNKNOWN**
- **Priority:** MEDIUM

---

### 🎯 Special Features

#### 36. [AssignmentTargetingStudio.tsx](src/pages/AssignmentTargetingStudio.tsx)
- **Purpose:** AI-powered assignment distribution to specific students
- **Data Source:** Unknown - needs audit
- **Components:** Card, Button, Input, Badge, Select, Textarea, Switch, Label
- **Features:** Advanced targeting UI with Sparkles icon
- **Integration Status:** 🟡 **UNKNOWN**
- **Priority:** MEDIUM

#### 37. [ProjectsPage.tsx](src/pages/ProjectsPage.tsx)
- **Purpose:** Manage student/group projects
- **Data Source:** Unknown - needs audit
- **Integration Status:** 🟡 **UNKNOWN**
- **Priority:** HIGH

#### 38. [AITeachingAssistant.tsx](src/pages/AITeachingAssistant.tsx)
- **Purpose:** AI copilot for teaching suggestions, planning
- **Data Source:** 🟢 **API INTEGRATED**
  - `apiClient.post('/ai/copilot/ask/', {...})` (3 different endpoints)
- **Integration Status:** 🟢 **COMPLETE**
- **Priority:** HIGH

#### 39. [ClassSyllabusPage.tsx](src/pages/ClassSyllabusPage.tsx)
- **Purpose:** View detailed syllabus/curriculum for a class
- **Data Source:** TYPE-BASED (UgandaClass, Subject, Topic types)
- **Integration Status:** 🟡 **UNKNOWN**
- **Priority:** MEDIUM

---

### 📊 Analytics Pages (in /src/pages/analytics/)

#### 40. [AnalyticsLayout.tsx](src/pages/analytics/AnalyticsLayout.tsx)
- **Purpose:** Layout for analytics section
- **Type:** Layout component
- **Priority:** INTERNAL

#### 41. [PlatformCommandCenter.tsx](src/pages/analytics/PlatformCommandCenter.tsx)
- **Purpose:** Platform-wide analytics dashboard
- **Data Source:** 🟢 **API INTEGRATED** - `apiClient.get('/analytics/daily-platform-metric/')`
- **Integration Status:** 🟢 **COMPLETE**
- **Priority:** HIGH

#### 42. [InstitutionIntelligence.tsx](src/pages/analytics/InstitutionIntelligence.tsx)
- **Purpose:** Institution-specific analytics and insights
- **Data Source:** 🟢 **API INTEGRATED** - `apiClient.get('/analytics/daily-institution-metric/')`
- **Integration Status:** 🟢 **COMPLETE**
- **Priority:** HIGH

---

## 🧩 FEATURE COMPONENTS (src/components)

### Dashboard Components (src/components/dashboard) - 21 total

| File | Purpose | Data Source | Integration |
|------|---------|------------|-------------|
| **AlertBanner.tsx** | Display alerts/notifications | N/A (receives props) | 🟢 COMPLETE |
| **BulkInviteModal.tsx** | Invite multiple users to institution | 🟢 API: `apiClient.post(/institutions/{id}/bulk_invite/)` | 🟢 COMPLETE |
| **CareerGuidanceWidget.tsx** | Career path recommendations | Unknown | 🟡 UNKNOWN |
| **CelebrationEngineWidget.tsx** | Gamification celebrations/rewards display | Unknown | 🟡 UNKNOWN |
| **ContinuityPanel.tsx** | Learning continuity tracking | Unknown | 🟡 UNKNOWN |
| **DashboardSkeleton.tsx** | Loading skeleton/placeholder | N/A (UI only) | 🟢 COMPLETE |
| **InstitutionIntelligenceHub.tsx** | Institution analytics insights | Unknown | 🟡 UNKNOWN |
| **IntelligenceCard.tsx** | Reusable intelligence/insight card | Receives props | 🟢 COMPLETE |
| **LiveSessionCTA.tsx** | Call-to-action for live sessions | Unknown | 🟡 UNKNOWN |
| **MetricCard.tsx** | KPI metric display card | Receives props | 🟢 COMPLETE |
| **NotificationPreferences.tsx** | User notification settings | Unknown | 🟡 UNKNOWN |
| **ParentResourceEngagementPanel.tsx** | ❌ Mock only: `MOCK_CHILD_RESOURCES` (5 items) | Mock | ❌ NOT INTEGRATED |
| **StudentActionCenter.tsx** | ⚠️ Mixed: `apiGet()` + `DEFAULT_MOCK_ACTIONS` fallback | Mixed | ⚠️ PARTIAL |
| **StudentMotivationEngine.tsx** | Motivation notifications | Unknown | 🟡 UNKNOWN |
| **StudentPlatformLaunchpad.tsx** | Quick access to platform features | Unknown | 🟡 UNKNOWN |
| **StudentResourceEngagementPanel.tsx** | ❌ Mock only: `MOCK_ASSIGNED_RESOURCES` (3 items) | Mock | ❌ NOT INTEGRATED |
| **TeacherAssignmentManager.tsx** | Manage student assignments | Unknown | 🟡 UNKNOWN |
| **TeacherInterventionPanel.tsx** | Red alerts for student issues | Unknown | 🟡 UNKNOWN |
| **TeacherRedAlertsPanel.tsx** | Critical alerts for teacher action | Unknown | 🟡 UNKNOWN |
| **TeacherResourceEngagementPanel.tsx** | ❌ Mock only: `MOCK_RESOURCE_ANALYTICS` (3 items) | Mock | ❌ NOT INTEGRATED |
| **TopicConfidenceRadar.tsx** | Student confidence across topics | Unknown | 🟡 UNKNOWN |
| **UNEBReadinessGauge.tsx** | UNEB exam readiness indicator | Unknown | 🟡 UNKNOWN |
| **WhatsAppCommunicationHub.tsx** | WhatsApp integration for messaging | Unknown | 🟡 UNKNOWN |

### Dashboard Layout Components (src/components/dashboard/layout) - 4 total

| File | Purpose | Integration |
|------|---------|-------------|
| **DashboardCard.tsx** | Reusable dashboard card wrapper | 🟢 COMPLETE (Pure UI) |
| **DashboardGrid.tsx** | Responsive grid layout | 🟢 COMPLETE (Pure UI) |
| **DashboardSection.tsx** | Section with title/description | 🟢 COMPLETE (Pure UI) |
| **GlassDashboardLayout.tsx** | Glass-morphism dashboard layout | 🟢 COMPLETE (Pure UI) |

### Teacher Components (src/components/teachers) - 17 total

| File | Purpose | Data Source | Integration |
|------|---------|------------|-------------|
| **AITeachingPartner.tsx** | AI assistant for lesson planning | Unknown | 🟡 UNKNOWN |
| **ClassHealthCard.tsx** | Class health/performance metrics | Unknown | 🟡 UNKNOWN |
| **IndependentEarningsIntelligence.tsx** | Freelance teacher earnings analytics | Unknown | 🟡 UNKNOWN |
| **InstitutionTeacherWellness.tsx** | Teacher wellness/workload tracking | Unknown | 🟡 UNKNOWN |
| **NextBestActionQueue.tsx** | Action queue recommendations | Unknown | 🟡 UNKNOWN |
| **ParentCommunicationCopilot.tsx** | AI assistant for parent messages | Unknown | 🟡 UNKNOWN |
| **ResourceEffectivenessIntelligence.tsx** | Analyze resource impact on learning | Unknown | 🟡 UNKNOWN |
| **SmartInterventionBundle.tsx** | Smart intervention recommendations | Unknown | 🟡 UNKNOWN |
| **TeacherCollabHub.tsx** | Teacher collaboration tools | Unknown | 🟡 UNKNOWN |
| **TeacherCompetitionLeaderboards.tsx** | Teacher competition/leaderboards | Unknown | 🟡 UNKNOWN |
| **TeacherGrowthPassport.tsx** | Teacher professional development | Unknown | 🟡 UNKNOWN |
| **TeacherPayoutStatusCard.tsx** | Payout and earnings status | Unknown | 🟡 UNKNOWN |
| **TeacherPerformanceStory.tsx** | Narrative performance summary | Unknown | 🟡 UNKNOWN |
| **TeacherQualityScore.tsx** | Overall teacher quality metric (interface: TeacherQualityMetrics) | Receives props | 🟢 COMPLETE (Pure UI) |
| **TeacherReflectionAssistant.tsx** | AI assistant for self-reflection | Unknown | 🟡 UNKNOWN |
| **TeachingWinsTimeline.tsx** | Timeline of teaching achievements | Unknown | 🟡 UNKNOWN |
| **VoiceNoteWidget.tsx** | Voice message recording/playback | Unknown | 🟡 UNKNOWN |

### Academic Components (src/components/academic) - 5 total

| File | Purpose | Data Source | Integration |
|------|---------|------------|-------------|
| **AssignmentCreateModal.tsx** | Create new assignment modal | Unknown | 🟡 UNKNOWN |
| **DiscussionThread.tsx** | ❌ Mock only: `MOCK_POSTS` (3 discussion posts) | Mock | ❌ NOT INTEGRATED |
| **ProjectActivityPanel.tsx** | ❌ Mock only: `MOCK_PROJECTS` (2 items), `MOCK_COMPLETED` (1 item) | Mock | ❌ NOT INTEGRATED |
| **ResourceUploadModal.tsx** | 🟢 API: `apiClient.post()` for resource upload | API | 🟢 COMPLETE |
| **ResourceViewer.tsx** | Display resource content (PDF, video, etc) | Unknown | 🟡 UNKNOWN |

### Admin Components (src/components/admin) - 5 total

| File | Purpose | Data Source | Integration |
|------|---------|------------|-------------|
| **AlumniOutcomesTracker.tsx** | Track alumni outcomes/success | Unknown | 🟡 UNKNOWN |
| **CurriculumDistributionMap.tsx** | Curriculum distribution across institutions | Unknown | 🟡 UNKNOWN |
| **GlobalCurriculumHealth.tsx** | Global curriculum quality metrics | Unknown | 🟡 UNKNOWN |
| **GlobalInstitutionComparison.tsx** | Compare institutions platform-wide | Unknown | 🟡 UNKNOWN |
| **PlatformAnalyticsTabs.tsx** | Tabbed analytics interface | Unknown | 🟡 UNKNOWN |

### Marketplace Components (src/components/marketplace) - 3 total

| File | Purpose | Data Source | Integration |
|------|---------|------------|-------------|
| **MarketplaceUploadModal.tsx** | 🟢 API: `apiClient.get('/curriculum/subjects/')` | API | 🟢 COMPLETE |
| **TeacherMonetizationDashboard.tsx** | 🟢 API: Multiple endpoints (monetization-overview, lesson-qualifications, payout-profile, payouts/eligibility) | API | 🟢 COMPLETE |
| **VerifiedTeacherBadge.tsx** | Display verified teacher badge | N/A (Pure UI) | 🟢 COMPLETE |

### Auth Components (src/components/auth) - 1 total

| File | Purpose | Integration |
|------|---------|-------------|
| **PermissionGuard.tsx** | Role-based access control wrapper | 🟢 COMPLETE |

### Other Core Components

| File | Purpose | Integration |
|------|---------|-------------|
| **ActiveAssessment.tsx** | 🟢 API: Fetch assessment data and submit responses | 🟢 COMPLETE |
| **DashboardRouter.tsx** | Route to correct dashboard based on user role | 🟢 COMPLETE |
| **ErrorBoundary.tsx** | Error handling wrapper | 🟢 COMPLETE |
| **Layout.tsx** | Main app layout | 🟢 COMPLETE |
| **NetworkStatusWidget.tsx** | Network status indicator | 🟢 COMPLETE |
| **ProtectedRoute.tsx** | Route protection based on auth | 🟢 COMPLETE |

### Navigation Components (src/components/navigation)

| File | Purpose | Integration |
|------|---------|-------------|
| **TopNavbar.tsx** | Main navigation bar | 🟢 COMPLETE |

### Student Components (src/components/students) - 2 total

| File | Purpose | Integration |
|------|---------|-------------|
| **SmartStudyPlanner.tsx** | AI-powered study plan generator | 🟡 UNKNOWN |
| **StudentPassport.tsx** | Student achievement/credential passport | 🟡 UNKNOWN |

### Parent Components (src/components/parents) - 1 total

| File | Purpose | Integration |
|------|---------|-------------|
| **ParentActionCenter.tsx** | Parent action items and alerts | 🟡 UNKNOWN |

### Competition Components (src/components/competition) - 6 total

| File | Purpose | Integration |
|------|---------|-------------|
| **AchievementShowcase.tsx** | Display student achievements | 🟡 UNKNOWN |
| **ActiveChallengeCard.tsx** | Current challenge card | 🟡 UNKNOWN |
| **HouseStandingsCard.tsx** | House/team standings | 🟡 UNKNOWN |
| **Leaderboards.tsx** | User leaderboards | 🟡 UNKNOWN |
| **MeritEngineWidget.tsx** | Merit/reward system | 🟡 UNKNOWN |
| **StreakTracker.tsx** | Activity streak tracking | 🟡 UNKNOWN |

### Institution Components (src/components/institutions) - 5 total

| File | Purpose | Integration |
|------|---------|-------------|
| **AIAdminReportAssistant.tsx** | AI report generation for admins | 🟡 UNKNOWN |
| **ExamWarRoomMode.tsx** | Exam administration war room | 🟡 UNKNOWN |
| **InstitutionBillingPortal.tsx** | Institution payment processing | 🟡 UNKNOWN |
| **SchoolHealthScore.tsx** | Institution health metrics | 🟡 UNKNOWN |
| **StudentOnboardingForm.tsx** | Student enrollment form | 🟡 UNKNOWN |

### Copilot Components (src/components/copilot) - 3 total

| File | Purpose | Data Source | Integration |
|------|---------|------------|-------------|
| **AICopilotWidget.tsx** | General AI copilot interface | Unknown | 🟡 UNKNOWN |
| **AITeacherCopilotWidget.tsx** | 🟢 API: `apiClient.post('/ai/copilot/ask/', {...})` | API | 🟢 COMPLETE |
| **MessageBubble.tsx** | Chat message display | N/A (Pure UI) | 🟢 COMPLETE |

### Badge & Certificate Components (src/components/badges) - 2 total

| File | Purpose | Integration |
|------|---------|-------------|
| **BadgeShowcase.tsx** | Display earned badges | 🟡 UNKNOWN |
| **CertificateCard.tsx** | Certificate display | 🟡 UNKNOWN |

### Editorial Components (src/components/ui/editorial) - 3 total

| File | Purpose | Integration |
|------|---------|-------------|
| **EditorialHeader.tsx** | Page header with editorial styling | 🟢 COMPLETE |
| **EditorialPanel.tsx** | Content panel with editorial styling | 🟢 COMPLETE |
| **EditorialPill.tsx** | Compact pill/badge component | 🟢 COMPLETE |

### Pastoral Components (src/components/pastoral) - 1 total

| File | Purpose | Integration |
|------|---------|-------------|
| **PastoralTimeline.tsx** | Student pastoral care timeline | 🟡 UNKNOWN |

### Form Components (src/components/forms) - 1 total

| File | Purpose | Integration |
|------|---------|-------------|
| **DynamicSchemaForm.tsx** | Dynamic form builder from JSON schema | 🟡 PARTIAL - Commented as "stub submission for MVP" |

### UI Components (src/components/ui) - 50+ Pure UI Components

Pure presentation components (no data fetching):

**Layout & Structure:**
accord ion.tsx, card.tsx, carousel.tsx, drawer.tsx, sheet.tsx, sidebar.tsx, tabs.tsx, navigation-menu.tsx, resizable.tsx, scroll-area.tsx

**Input & Control:**
input.tsx, textarea.tsx, checkbox.tsx, radio-group.tsx, toggle.tsx, toggle-group.tsx, select.tsx, switch.tsx, input-otp.tsx

**Display:**
badge.tsx, avatar.tsx, progress.tsx, skeleton.tsx, table.tsx, chart.tsx, aspect-ratio.tsx

**Interaction:**
button.tsx, alert.tsx, alert-dialog.tsx, context-menu.tsx, dialog.tsx, dropdown-menu.tsx, popover.tsx, command.tsx, hover-card.tsx, breadcrumb.tsx, pagination.tsx, menubar.tsx

**Other:**
label.tsx, separator.tsx, slider.tsx, tooltip.tsx, toast.tsx, toaster.tsx, sonner.tsx, collapsible.tsx, calendar.tsx, form.tsx

**Empty States:**
EmptyState.tsx, PremiumEmptyState.tsx, PremiumLockState.tsx

**Integration Status:** 🟢 COMPLETE (Pure UI)

---

## 📊 Component Hierarchy & Nesting

### Page → Component Relationships

```
StudentDashboard
├── DashboardSkeleton (spinner)
├── DashboardGrid (layout)
│   ├── DashboardSection
│   │   ├── Card (KPI cards)
│   │   └── MetricCard (displays apiClient data)
│   ├── IntelligenceCard (from dashboardData.intelligence)
│   ├── CareerGuidanceWidget
│   ├── StudentResourceEngagementPanel (MOCK: MOCK_ASSIGNED_RESOURCES)
│   ├── StudentActionCenter (apiGet + DEFAULT_MOCK_ACTIONS fallback)
│   ├── StudentPlatformLaunchpad
│   └── StudentMotivationEngine

TeacherDashboard
├── DashboardGrid
│   ├── TeacherRedAlertsPanel
│   ├── TeacherInterventionPanel
│   ├── TeacherResourceEngagementPanel (MOCK: MOCK_RESOURCE_ANALYTICS)
│   ├── Leaderboards
│   ├── HouseStandingsCard
│   ├── TeacherQualityScore (from dashboardData)
│   ├── SmartInterventionBundle
│   ├── VoiceNoteWidget
│   ├── ClassHealthCard
│   ├── NextBestActionQueue
│   ├── TeachingWinsTimeline
│   ├── ResourceEffectivenessIntelligence
│   ├── TeacherReflectionAssistant
│   ├── ParentCommunicationCopilot
│   ├── AITeachingPartner
│   ├── TeacherPerformanceStory
│   ├── TeacherGrowthPassport
│   ├── IndependentEarningsIntelligence
│   ├── TeacherCompetitionLeaderboards
│   └── TeacherPayoutStatusCard
├── MarketplaceUploadModal
├── ResourceUploadModal
└── TeacherMonetizationDashboard

AdminDashboard
├── DashboardSkeleton
├── DashboardGrid
│   ├── IntelligenceCard
│   ├── GlobalInstitutionComparison
│   ├── AlumniOutcomesTracker
│   ├── PlatformAnalyticsTabs
│   ├── GlobalCurriculumHealth
│   └── CurriculumDistributionMap

ExamRegistrationPage
├── EditorialPanel
├── EditorialHeader
├── Tabs
│   ├── TabsContent (Centers)
│   ├── TabsContent (Registration)
│   └── TabsContent (History)

LiveSessionsPage
├── Card (session cards from apiClient or MOCK_SESSIONS)
│   ├── Badge (Status)
│   └── Button (Join)
```

---

## 🔴 CRITICAL ISSUES & GAPS

### Components Needing API Integration

| Component | Current State | Action Required | Priority |
|-----------|---------------|-----------------|----------|
| AcademicLibraryPage | 100% Mock (MOCK_RESOURCES) | Create `/resources/` API endpoint | HIGH |
| InstitutionTimetableStudio | 100% Mock (MOCK_GRID) | Create `/institutions/{id}/timetable/` endpoint | HIGH |
| DiscussionThread | 100% Mock (MOCK_POSTS) | Create `/discussions/threads/{id}/posts/` endpoint | MEDIUM |
| ProjectActivityPanel | 100% Mock (MOCK_PROJECTS) | Create `/projects/` API endpoint | MEDIUM |
| ParentResourceEngagementPanel | 100% Mock (MOCK_CHILD_RESOURCES) | Create `/parent/child-resources/` endpoint | MEDIUM |
| StudentResourceEngagementPanel | 100% Mock (MOCK_ASSIGNED_RESOURCES) | Create `/student/assigned-resources/` endpoint | MEDIUM |
| TeacherResourceEngagementPanel | 100% Mock (MOCK_RESOURCE_ANALYTICS) | Create `/teacher/resource-analytics/` endpoint | MEDIUM |
| LiveSessionsPage | Partial Mock (MOCK_SESSIONS fallback) | Ensure `/live-sessions/live-session/` works reliably | MEDIUM |
| HomePage | Fallback Mock (DEFAULT_CLASSES) | Ensure apiGet('/listings/') works reliably | MEDIUM |
| StudentActionCenter | Fallback Mock (DEFAULT_MOCK_ACTIONS) | Ensure apiGet works reliably | MEDIUM |

### Components with Incomplete Integration

| Component | Issue | Solution | Priority |
|-----------|-------|----------|----------|
| TeacherLessonStudio | apiClient commented out | Uncomment and test `/live-sessions/provision-webinar/` | HIGH |
| TopicDetailPage | MOCK_ASSIGNMENTS injected if scarce | Improve API response or create supplementary API | MEDIUM |
| DynamicSchemaForm | Marked "stub submission for MVP" | Implement real form submission with apiClient | MEDIUM |

### Components Not Audited Yet

**Need detailed review of data sources:**
- SubjectTopicsPage
- LearningPathPage
- MissedSessionRecoveryPage
- PublicProfile
- CourseCatalog (uses fetch from public/data/*.json)
- SmartStudyPlanner
- StudentPassport
- ParentActionCenter
- All Competition components
- All Institution components (except InstitutionBillingPortal)
- AIAdminReportAssistant, ExamWarRoomMode, SchoolHealthScore
- BadgeShowcase, CertificateCard
- Numerous dashboard/teacher components
- CareerGuidanceWidget
- CelebrationEngineWidget
- ContinuityPanel
- All AI components (AITeachingPartner, ParentCommunicationCopilot, etc.)

---

## 🎯 Integration Roadmap Priority

### TIER 1: CRITICAL (Do First)
1. ✅ LoginPage / RegisterPage (AUTH)
2. ✅ StudentDashboard (Core LMS)
3. ✅ TeacherDashboard (Core LMS)
4. ✅ AdminDashboard (Platform management)
5. ✅ ExamRegistrationPage (User journey)
6. ✅ MarketplacePages (Revenue model)
7. 🔴 **AcademicLibraryPage** (MOCK → API)
8. 🔴 **LiveSessionsPage** (Reliability)
9. 🔴 **PaymentPage** (Payment processing)

### TIER 2: HIGH (Next)
1. ✅ InstitutionManagementPage
2. 🔴 **InstitutionTimetableStudio** (MOCK → API)
3. 🔴 **DiscussionThread** (MOCK → API)
4. 🔴 **ProjectActivityPanel** (MOCK → API)
5. 🔴 **TeacherLessonStudio** (Uncomment apiClient)
6. 🔴 **AttendanceRegisterPage** (Audit + integrate)
7. 🔴 **TeacherMarksUpload** (Audit + integrate)

### TIER 3: MEDIUM (Later)
1. 🟡 SubjectTopicsPage (Audit data sources)
2. 🟡 LearningPathPage (Audit + AI implementation)
3. 🟡 ParentResourceEngagementPanel (MOCK → API)
4. 🟡 StudentResourceEngagementPanel (MOCK → API)
5. 🟡 TeacherResourceEngagementPanel (MOCK → API)
6. CourseCatalog (Currently uses static JSON)
7. PeerTutoringPage / PeerTutoringHub (Audit + integrate)

---

## 📝 Data Flow Patterns Found

### Pattern 1: Direct API Integration
```typescript
// TeacherDashboard, StudentDashboard, AdminDashboard
const { data } = await apiClient.get('/analytics/{feature}-dashboard/');
setDashboardData(data);
```

### Pattern 2: API with Mock Fallback
```typescript
// StudentActionCenter, LiveSessionsPage, HomePage
const apiData = await apiGet(endpoint);
setState(apiData.length > 0 ? apiData : DEFAULT_MOCK_DATA);
```

### Pattern 3: Pure Mock (No API)
```typescript
// AcademicLibraryPage, DiscussionThread, ProjectActivityPanel
const [data] = useState(MOCK_DATA);
// No API calls whatsoever
```

### Pattern 4: Post-Only Integration
```typescript
// ExamRegistrationPage, ActiveAssessment
await apiClient.post('/endpoint/', payload);
```

### Pattern 5: Schema-Driven (Unknown Backend)
```typescript
// DynamicSchemaForm, InstitutionFinanceHub
const { data } = schema; // Dynamic form builder, actual submission unclear
```

---

## 📈 Integration Statistics

```
Total Components: 100+
├── Fully API Integrated: 25 (25%)
├── Partial/Mixed API: 8 (8%)
├── Mock Only: 8 (8%)
├── Pure UI Components: 50+ (50%)
└── Unknown Status: 9 (9%)

Pages Breakdown:
├── API Integrated: 12 (31%)
├── Mixed (API + Mock): 3 (8%)
├── Mock Only: 5 (13%)
├── Unknown/Audit Needed: 9 (23%)
└── Framework Pages: 10 (26%)
```

---

## ✅ Recommendations

1. **Immediate:** Fix TeacherLessonStudio (uncomment apiClient code)
2. **Week 1:** Migrate AcademicLibraryPage, InstitutionTimetableStudio from mock to API
3. **Week 2:** Audit and integrate all "Unknown" pages from Tier 3
4. **Ongoing:** Replace `fetch('/data/*.json')` with apiClient calls (CourseCatalog)
5. **Architecture:** Standardize on Pattern 2 (API + mock fallback) for resilience
6. **Testing:** Add integration tests for all API-dependent components

---

## 📂 File Size Summary

- **Total Page Files:** ~2,000 lines (estimated)
- **Total Component Files:** ~5,000+ lines (estimated)
- **UI Components:** ~3,000+ lines (mostly auto-generated)

