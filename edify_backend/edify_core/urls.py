"""
URL configuration for edify_core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from edify_core.health import HealthView
from accounts.views import VerifiedEmailTokenObtainPairView as TokenObtainPairView

from curriculum.views import CountryViewSet, SubjectViewSet, ClassLevelViewSet, TopicViewSet
from marketplace.views import ListingViewSet
from ai_services.views import CopilotInferenceView
from institutions.views import InstitutionViewSet, InstitutionMembershipViewSet, LearnerRegistrationViewSet, AdminPinResetView
from classes.views import ClassViewSet, ClassEnrollmentViewSet
from scheduling.views import TimetableSlotViewSet
from attendance.views import DailyRegisterViewSet, LessonAttendanceViewSet
from grading.views import SubjectGradeViewSet, ReportCardViewSet
from analytics.views import AnalyticsEventViewSet, DailyPlatformMetricViewSet, DailyInstitutionMetricViewSet, SubjectPerformanceSnapshotViewSet, SystemHealthSnapshotViewSet, StudentDashboardView, TeacherDashboardView, ParentDashboardView, AdminDashboardView, InstitutionDashboardView, CustomerSuccessChurnView
from assessments.views import AssessmentWindowViewSet, QuestionViewSet
from discussions.views import ThreadViewSet, PostViewSet
from exams.views import ExamCenterViewSet, CandidateRegistrationViewSet, SubjectSelectionViewSet, BoardSubmissionBatchViewSet
from lessons.views import LessonViewSet, LessonNoteViewSet, LessonRecordingViewSet, LessonAttendanceViewSet
from live_sessions.views import LiveSessionViewSet, SessionReminderViewSet
from notifications.views import NotificationViewSet
from parent_portal.views import ParentStudentLinkViewSet, WeeklySummaryViewSet, RiskAlertViewSet
from resources.upload_view import ResourceUploadViewSet
from resources.views import ResourceViewSet, SharedResourceLinkViewSet
from resources.content_views import (
    ContentItemViewSet, TeacherContentViewSet, InstitutionContentViewSet,
    AdminContentViewSet, ContentDeliveryView, ClassContentView,
    ContentEngagementViewSet, ContentTagViewSet,
    ContentAssignmentViewSet, ContentRecommendationViewSet,
    StudentContentDashboardView, TeacherContentDashboardView,
    ParentContentDashboardView,
)
from tutoring.views import MatchRequestViewSet, PeerPointsLedgerViewSet
from intelligence.views import (
    NextBestActionViewSet, InterventionPackViewSet, InterventionPackAssignmentViewSet,
    StudyPlanViewSet, StudyTaskViewSet, ParentActionViewSet,
    PointsLedgerViewSet, BadgeViewSet, UserBadgeViewSet,
    ChallengeViewSet, HouseTeamViewSet,
    LearningProgressViewSet, NationalExamResultViewSet,
    StoryCardViewSet, InstitutionHealthHistoryViewSet, ImpactComparisonViewSet,
    StudentPassportView, TeacherPassportView, InstitutionHealthView,
)

router = DefaultRouter()
router.register(r'curriculum/countries', CountryViewSet)
router.register(r'curriculum/subjects', SubjectViewSet)
router.register(r'curriculum/class-levels', ClassLevelViewSet)
router.register(r'curriculum/topics', TopicViewSet)

from curriculum.views import CurriculumTreeView

# New Phase 1: NCDC Foundations
from curriculum.views import TopicCompetencyViewSet, ResourceQualityReviewViewSet
router.register(r'curriculum/topic-competencies', TopicCompetencyViewSet, basename='topic-competency')
router.register(r'curriculum/resource-reviews', ResourceQualityReviewViewSet, basename='resource-review')

from marketplace.views import ListingViewSet, PayoutRequestViewSet, PayoutBatchViewSet, LessonQualificationViewSet, TeacherPayoutProfileViewSet
from marketplace.views import PesapalCheckoutInitView, PesapalIPNWebhookView

router.register(r'marketplace/listings', ListingViewSet, basename='marketplace-listing')
router.register(r'marketplace/payouts', PayoutRequestViewSet, basename='marketplace-payout')
router.register(r'marketplace/payout-profile', TeacherPayoutProfileViewSet, basename='marketplace-payout-profile')
router.register(r'marketplace/teacher-batches', PayoutBatchViewSet, basename='marketplace-teacher-batch')
router.register(r'marketplace/lesson-qualifications', LessonQualificationViewSet, basename='marketplace-lesson-qual')

# School OS Endpoints
router.register(r'institutions', InstitutionViewSet, basename='institution')
router.register(r'institution-memberships', InstitutionMembershipViewSet, basename='institution-membership')
router.register(r'institutions/learner-registrations', LearnerRegistrationViewSet, basename='learner-registration')
router.register(r'classes', ClassViewSet, basename='class')
router.register(r'class-enrollments', ClassEnrollmentViewSet, basename='class-enrollment')
router.register(r'scheduling/timetable', TimetableSlotViewSet, basename='timetable-slot')
router.register(r'attendance/daily', DailyRegisterViewSet, basename='daily-register')
router.register(r'attendance/lesson', LessonAttendanceViewSet, basename='lesson-attendance')
router.register(r'grading/subjects', SubjectGradeViewSet, basename='subject-grade')
router.register(r'grading/reports', ReportCardViewSet, basename='report-card')
# grading/records is served by the Go API (api/internal/learning).

# Analytics
router.register(r'analytics/analytics-event', AnalyticsEventViewSet, basename='analytics-analytics-event')
router.register(r'analytics/daily-platform-metric', DailyPlatformMetricViewSet, basename='analytics-daily-platform-metric')
router.register(r'analytics/daily-institution-metric', DailyInstitutionMetricViewSet, basename='analytics-daily-institution-metric')
router.register(r'analytics/subject-performance-snapshot', SubjectPerformanceSnapshotViewSet, basename='analytics-subject-performance-snapshot')
router.register(r'analytics/system-health-snapshot', SystemHealthSnapshotViewSet, basename='analytics-system-health-snapshot')

# Assessments & Exams
router.register(r'assessments/assessment-window', AssessmentWindowViewSet, basename='assessments-assessment-window')
# assessments/assessment and assessments/submission are served by the Go API.
router.register(r'assessments/question', QuestionViewSet, basename='assessments-question')
router.register(r'exams/exam-center', ExamCenterViewSet, basename='exams-exam-center')
router.register(r'exams/candidate-registration', CandidateRegistrationViewSet, basename='exams-candidate-registration')
router.register(r'exams/subject-selection', SubjectSelectionViewSet, basename='exams-subject-selection')
router.register(r'exams/board-submission-batch', BoardSubmissionBatchViewSet, basename='exams-board-submission-batch')

# Classroom & Resources
router.register(r'lessons/lesson', LessonViewSet, basename='lessons-lesson')
router.register(r'lessons/lesson-note', LessonNoteViewSet, basename='lessons-lesson-note')
router.register(r'lessons/lesson-recording', LessonRecordingViewSet, basename='lessons-lesson-recording')
router.register(r'lessons/lesson-attendance', LessonAttendanceViewSet, basename='lessons-lesson-attendance')
router.register(r'live-sessions/live-session', LiveSessionViewSet, basename='live_sessions-live-session')
router.register(r'live-sessions/session-reminder', SessionReminderViewSet, basename='live_sessions-session-reminder')
router.register(r'resources', ResourceViewSet, basename='resources-resource')
router.register(r'resources-upload', ResourceUploadViewSet, basename='resources-upload')
router.register(r'resources/shared-resource-link', SharedResourceLinkViewSet, basename='resources-shared-resource-link')

# Content Management System
router.register(r'content/items', ContentItemViewSet, basename='content-item')
router.register(r'content/teacher', TeacherContentViewSet, basename='content-teacher')
router.register(r'content/institution', InstitutionContentViewSet, basename='content-institution')
router.register(r'content/admin', AdminContentViewSet, basename='content-admin')
router.register(r'content/engagement', ContentEngagementViewSet, basename='content-engagement')
router.register(r'content/tags', ContentTagViewSet, basename='content-tag')
router.register(r'content/assignments', ContentAssignmentViewSet, basename='content-assignment')
router.register(r'content/recommendations', ContentRecommendationViewSet, basename='content-recommendation')

# Community & Extensions
router.register(r'discussions/thread', ThreadViewSet, basename='discussions-thread')
router.register(r'discussions/post', PostViewSet, basename='discussions-post')
router.register(r'notifications/notification', NotificationViewSet, basename='notifications-notification')
router.register(r'parent-portal/parent-student-link', ParentStudentLinkViewSet, basename='parent_portal-parent-student-link')
router.register(r'parent-portal/weekly-summary', WeeklySummaryViewSet, basename='parent_portal-weekly-summary')
router.register(r'parent-portal/risk-alert', RiskAlertViewSet, basename='parent_portal-risk-alert')
router.register(r'tutoring/match-request', MatchRequestViewSet, basename='tutoring-match-request')
router.register(r'tutoring/peer-points-ledger', PeerPointsLedgerViewSet, basename='tutoring-peer-points-ledger')
from tutoring.views import TutorProfileViewSet, TutoringBountyViewSet
router.register(r'tutoring/tutor-profiles', TutorProfileViewSet, basename='tutoring-profiles')
router.register(r'tutoring/bounties', TutoringBountyViewSet, basename='tutoring-bounties')

from live_sessions.views import MissedSessionRecoveryViewSet
router.register(r'live-sessions/missed-recovery', MissedSessionRecoveryViewSet, basename='live_sessions-missed-recovery')

# Intelligence Engine
router.register(r'intelligence/actions', NextBestActionViewSet, basename='intelligence-actions')
router.register(r'intelligence/intervention-packs', InterventionPackViewSet, basename='intelligence-intervention-packs')
router.register(r'intelligence/intervention-assignments', InterventionPackAssignmentViewSet, basename='intelligence-intervention-assignments')
router.register(r'intelligence/study-plans', StudyPlanViewSet, basename='intelligence-study-plans')
router.register(r'intelligence/study-tasks', StudyTaskViewSet, basename='intelligence-study-tasks')
router.register(r'intelligence/parent-actions', ParentActionViewSet, basename='intelligence-parent-actions')
router.register(r'intelligence/points', PointsLedgerViewSet, basename='intelligence-points')
router.register(r'intelligence/badges', BadgeViewSet, basename='intelligence-badges')
router.register(r'intelligence/my-badges', UserBadgeViewSet, basename='intelligence-my-badges')
router.register(r'intelligence/challenges', ChallengeViewSet, basename='intelligence-challenges')
router.register(r'intelligence/houses', HouseTeamViewSet, basename='intelligence-houses')
router.register(r'intelligence/learning-progress', LearningProgressViewSet, basename='intelligence-learning-progress')
router.register(r'intelligence/national-exams', NationalExamResultViewSet, basename='intelligence-national-exams')
router.register(r'intelligence/story-cards', StoryCardViewSet, basename='intelligence-story-cards')
router.register(r'intelligence/health-history', InstitutionHealthHistoryViewSet, basename='intelligence-health-history')
router.register(r'intelligence/impact', ImpactComparisonViewSet, basename='intelligence-impact')

from interventions.views import StudentRiskAlertViewSet, InterventionPlanViewSet, InterventionActionViewSet
router.register(r'interventions/alerts', StudentRiskAlertViewSet, basename='interventions-alerts')
router.register(r'interventions/plans', InterventionPlanViewSet, basename='interventions-plans')
router.register(r'interventions/actions', InterventionActionViewSet, basename='interventions-actions')


from institutions.views import InstitutionOnboardingAPIView
from marketplace.views import IndependentTeacherOnboardingView

from accounts.views import PublicProfileView, PilotFeedbackCreateView
from tutoring.views import PeerTutoringDashboardView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', HealthView.as_view(), name='health'),
    path('api/v1/', include(router.urls)),
    path('api/v1/ai/copilot/ask/', CopilotInferenceView.as_view(), name='copilot_ask'),
    path('api/v1/auth/', include('accounts.urls')),
    path('api/v1/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('api/v1/tutoring/dashboard/', PeerTutoringDashboardView.as_view(), name='tutoring-dashboard'),
    path('api/v1/users/profile/<str:username>/', PublicProfileView.as_view(), name='public-profile'),

    # Pilot feedback capture — see docs/PILOT.md.
    path('api/v1/feedback/', PilotFeedbackCreateView.as_view(), name='pilot-feedback'),
    
    # Custom dashboard routes
    path('api/v1/analytics/student-dashboard/', StudentDashboardView.as_view(), name='student_dashboard_api'),
    path('api/v1/analytics/teacher-dashboard/', TeacherDashboardView.as_view(), name='teacher_dashboard_api'),
    path('api/v1/analytics/parent-dashboard/', ParentDashboardView.as_view(), name='parent_dashboard_api'),
    path('api/v1/analytics/admin-dashboard/', AdminDashboardView.as_view(), name='admin_dashboard_api'),
    path('api/v1/analytics/institution-dashboard/', InstitutionDashboardView.as_view(), name='institution_dashboard_api'),
    path('api/v1/analytics/churn-signals/', CustomerSuccessChurnView.as_view(), name='admin_churn_signals_api'),
    path('api/v1/institutions/admin-pin-reset/', AdminPinResetView.as_view(), name='admin_pin_reset'),
    
    # Institution Onboarding Phase 1-3
    path('api/v1/institutions/onboard-basic/', InstitutionOnboardingAPIView.as_view(), name='institution_onboard_basic'),

    # Full Curriculum Tree Endpoint
    path('api/v1/curriculum/full-tree/', CurriculumTreeView.as_view(), name='curriculum_full_tree'),

    # Intelligence: APIView endpoints
    path('api/v1/intelligence/passport/student/', StudentPassportView.as_view(), name='intelligence-student-passport'),
    path('api/v1/intelligence/passport/teacher/', TeacherPassportView.as_view(), name='intelligence-teacher-passport'),
    path('api/v1/intelligence/health/', InstitutionHealthView.as_view(), name='intelligence-health'),

    path('api/v1/marketplace/onboard-teacher/', IndependentTeacherOnboardingView.as_view(), name='independent_teacher_onboard'),
    path('api/v1/marketplace/pesapal-checkout/', PesapalCheckoutInitView.as_view(), name='pesapal-checkout'),
    path('api/v1/marketplace/pesapal-ipn/', PesapalIPNWebhookView.as_view(), name='pesapal-ipn'),

    # Content Delivery endpoints
    path('api/v1/content/library/', ContentDeliveryView.as_view(), name='content-library'),
    path('api/v1/content/classroom/', ClassContentView.as_view(), name='content-classroom'),

    # Content Dashboard endpoints
    path('api/v1/content/dashboard/student/', StudentContentDashboardView.as_view(), name='content-dashboard-student'),
    path('api/v1/content/dashboard/teacher/', TeacherContentDashboardView.as_view(), name='content-dashboard-teacher'),
    path('api/v1/content/dashboard/parent/', ParentContentDashboardView.as_view(), name='content-dashboard-parent'),
]

# Serve media files in development
from django.conf import settings
from django.conf.urls.static import static
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
