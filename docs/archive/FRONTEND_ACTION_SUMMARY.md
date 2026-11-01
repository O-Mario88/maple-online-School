# Frontend Mock Data → Real Database Action Summary

**Target**: Replace all 10 mock data components with real API integration  
**Effort**: 3 weeks with 1 developer  
**Start Date**: April 5, 2026

---

## 🚨 Critical Issues Right Now

### 10 Components Using Fake Data

```
1. ❌ AcademicLibraryPage          - 20 hardcoded textbooks/guides
2. ❌ InstitutionTimetableStudio   - Hardcoded weekly schedule
3. ❌ DiscussionThread              - 3 fake forum posts
4. ❌ ProjectActivityPanel          - 2 fake student projects
5. ❌ ParentResourceEngagementPanel - 5 fake resources
6. ❌ StudentResourceEngagementPanel - 3 fake resources
7. ❌ TeacherResourceEngagementPanel - 3 fake analytics
8. ❌ ExamRegistrationPage          - mockDocuments hardcoded
9. ❌ TeacherLessonStudio           - apiClient code COMMENTED OUT
10. ⚠️ LiveSessionsPage             - Falls back to MOCK_SESSIONS if empty
```

---

## 📋 What Needs to Happen

### Backend (Django)

**Create 3 new API endpoints:**
```
1. GET /api/v1/resources/                          # Academic resources
2. GET /api/v1/discussions/threads/{id}/posts/     # Discussion posts
3. GET /api/v1/projects/                           # Student projects
4. GET /api/v1/institutions/{id}/timetable/        # Institution schedule
5. GET /api/v1/student/assigned-resources/         # Student's resources
6. GET /api/v1/teacher/resource-analytics/         # Teacher analytics
7. GET /api/v1/parent/child-resources/             # Parent's child resources
```

**Create Django models** (if not existing):
- Resource (TextBook, StudyGuide, PastPaper, etc)
- DiscussionThread & DiscussionPost
- Project & ProjectSubmission
- InstitutionTimetable & ScheduleSlot
- StudentAssignedResource
- ResourceAnalytics

**Seed database with realistic data:**
```python
# Run: python maple_backend/expand_seed_data.py

Data to create:
- 20+ unique textbooks/guides/past papers
- 5+ discussion threads with 3-5 posts each
- 5+ student projects with submissions
- 3 institution timetables (7 days × 6 hours each)
- 10+ assigned resources per student
- 5+ exam documents
```

---

### Frontend (React)

**Fix 10 components:**

1. **AcademicLibraryPage.tsx** (HIGH)
   - Current: Uses `const MOCK_RESOURCES = [...]`
   - Fix: Call `apiClient.get('/resources/')`
   - Add: Loading spinner, error message, empty state
   - Add: Search & filter functionality

2. **InstitutionTimetableStudio.tsx** (HIGH)
   - Current: Uses `const MOCK_GRID = [...]`
   - Fix: Call `apiClient.get('/institutions/{id}/timetable/')`
   - Add: Drag-and-drop to edit, save functionality

3. **TeacherLessonStudio.tsx** (HIGH)
   - Current: Has apiClient code commented out
   - Fix: Uncomment and test `/live-sessions/provision-webinar/`

4. **DiscussionThread.tsx** (MEDIUM)
   - Current: Uses `const MOCK_POSTS = [...]`
   - Fix: Call `apiClient.get('/discussions/threads/{id}/posts/')`
   - Add: Post creation form, real-time updates

5. **ProjectActivityPanel.tsx** (MEDIUM)
   - Current: Uses `const MOCK_PROJECTS = [...]`
   - Fix: Call `apiClient.get('/projects/')`
   - Add: Filter by status, sort by date

6. **ParentResourceEngagementPanel.tsx** (MEDIUM)
   - Current: Uses `const MOCK_CHILD_RESOURCES = [...]`
   - Fix: Call `apiClient.get('/parent/child-resources/')`

7. **StudentResourceEngagementPanel.tsx** (MEDIUM)
   - Current: Uses `const MOCK_ASSIGNED_RESOURCES = [...]`
   - Fix: Call `apiClient.get('/student/assigned-resources/')`

8. **TeacherResourceEngagementPanel.tsx** (MEDIUM)
   - Current: Uses `const MOCK_RESOURCE_ANALYTICS = [...]`
   - Fix: Call `apiClient.get('/teacher/resource-analytics/')`

9. **ExamRegistrationPage.tsx** (MEDIUM)
   - Current: Uses `const mockDocuments = {...}`
   - Fix: Call API to fetch required documents

10. **LiveSessionsPage.tsx** (MEDIUM)
    - Current: Falls back to `const MOCK_SESSIONS = [...]`
    - Fix: Make fallback truly optional when API works

---

## 🎯 Priority Order

### WEEK 1 (Database & APIs Ready)
1. ✅ Expand seed_data.py with all resource types
2. ✅ Create Django models for resources, discussions, projects, timetables
3. ✅ Create 7 new REST API endpoints
4. ✅ Test all endpoints return real data

### WEEK 2 (High-Priority Components)
1. AcademicLibraryPage (get resources, display, filter)
2. InstitutionTimetableStudio (get schedule, edit, save)
3. TeacherLessonStudio (uncomment apiClient, test)
4. Add UX polish to all 3 (loading, errors, empty states)

### WEEK 3 (Medium-Priority Components)
1. DiscussionThread (get posts, display, allow posting)
2. ProjectActivityPanel (get projects, filter, sort)
3. Resource panels (3 panels → call APIs)
4. ExamRegistrationPage (fetch documents)
5. LiveSessionsPage (remove mock fallback)
6. Comprehensive testing & UX polish

---

## 📱 UX Requirements for Each Component

After integrating with real data, each component must have:

```
✅ Loading state (spinner while fetching)
✅ Error state (user-friendly error message + retry button)
✅ Empty state (message when no data exists + CTA)
✅ Mobile responsive (works on 375px width)
✅ Keyboard accessible (Tab/Enter/Escape work)
✅ Fast load (API + render < 2 seconds)
✅ Smooth animations (transitions, hover effects)
✅ Clear visual hierarchy (size, color, spacing)
```

---

## 💾 Database Seeding Script

**File**: `maple_backend/expand_seed_data.py`

```python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maple_core.settings')
django.setup()

from apps.resources.models import Resource, ResourceCategory
from apps.discussions.models import DiscussionThread, DiscussionPost
from apps.projects.models import Project, ProjectSubmission
from apps.scheduling.models import InstitutionTimetable, ScheduleSlot
from django.contrib.auth.models import User

def create_resources():
    """Create 50+ academic resources"""
    categories = ['TextBook', 'StudyGuide', 'PastPaper', 'LessonNotes', 'WebResource']
    subjects = ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology']
    
    data = [
        # TextBooks (15)
        {'title': 'Advanced Mathematics', 'category': 'TextBook', 'subject': 'Mathematics', 'price': 25000},
        {'title': 'Physics Vol 1', 'category': 'TextBook', 'subject': 'Physics', 'price': 22000},
        # ... 13 more books
        
        # Study Guides (20)
        {'title': 'UNEB Math Guide', 'category': 'StudyGuide', 'subject': 'Mathematics', 'price': 15000},
        # ... 19 more guides
        
        # Past Papers (25+)
        {'title': '2023 Mathematics Paper 1', 'category': 'PastPaper', 'subject': 'Mathematics', 'price': 8000},
        # ... many more papers
    ]
    
    for item in data:
        Resource.objects.get_or_create(
            title=item['title'],
            defaults={
                'category': item['category'],
                'subject': item['subject'],
                'price': item['price'],
                'file_url': f"https://example.com/{item['title'].lower()}.pdf"
            }
        )
    
    print(f"✅ Created {len(data)} resources")

def create_discussions():
    """Create 20+ discussion threads with 100+ posts"""
    # Similar pattern...
    
def create_projects():
    """Create 15+ student projects with submissions"""
    # Similar pattern...

def create_timetables():
    """Create 3 institution timetables"""
    # Similar pattern...

if __name__ == "__main__":
    print("🔄 Expanding database seed data...")
    create_resources()
    create_discussions()
    create_projects()
    create_timetables()
    print("✅ Database expansion complete!")
```

---

## 🔗 API Endpoints to Add (apiClient.ts)

```typescript
// Add these to API_ENDPOINTS object

RESOURCES: '/resources/',
RESOURCE_DETAIL: '/resources/{id}/',
DISCUSSIONS_THREADS: '/discussions/threads/',
DISCUSSION_POSTS: '/discussions/threads/{threadId}/posts/',
PROJECTS: '/projects/',
PROJECT_DETAIL: '/projects/{id}/',
INSTITUTION_TIMETABLE: '/institutions/{id}/timetable/',
STUDENT_RESOURCES: '/student/assigned-resources/',
TEACHER_RESOURCE_ANALYTICS: '/teacher/resource-analytics/',
PARENT_CHILD_RESOURCES: '/parent/child-resources/',
EXAM_DOCUMENTS: '/exams/exam-center/documents/',
```

---

## ✅ Completion Checklist

### Components
- [ ] AcademicLibraryPage - API integrated
- [ ] InstitutionTimetableStudio - API integrated
- [ ] TeacherLessonStudio - Uncommented
- [ ] DiscussionThread - API integrated
- [ ] ProjectActivityPanel - API integrated
- [ ] ParentResourceEngagementPanel - API integrated
- [ ] StudentResourceEngagementPanel - API integrated
- [ ] TeacherResourceEngagementPanel - API integrated
- [ ] ExamRegistrationPage - API integrated
- [ ] LiveSessionsPage - No mock fallback needed

### QA
- [ ] All components load within 2 seconds
- [ ] All components have proper loading/error/empty states
- [ ] All components responsive on mobile/tablet/desktop
- [ ] All components accessible (WCAG 2.1)
- [ ] All API endpoints return real seeded data
- [ ] Zero console errors
- [ ] All links/buttons functional

### Performance
- [ ] Lighthouse score >= 85
- [ ] Time to interactive < 3 seconds
- [ ] Cumulative layout shift < 0.1
- [ ] First contentful paint < 1.5 seconds

---

## 🚀 Expected Outcome

**Before**: Frontend with 10 components showing hardcoded fake data  
**After**: Fully integrated frontend with real database, smooth UX, production-ready

---

## 📊 Metrics to Track

```
Components completed: 0/10
API endpoints created: 0/7
Database records seeded: 0/500+
Tests passing: 0/50+
Accessibility score: ?/100
Performance score: ?/100
```

---

**Ready to start? Confirm priorities and we'll begin implementation.**
