# Frontend Completion & Real Data Migration Plan

**Status**: PHASE 3A - Moving from Mock to Real Data  
**Date**: April 5, 2026  
**Goal**: Complete entire frontend with real database integration and production-ready UX

---

## 🎯 Current State Assessment

### Components Status Summary
- ✅ **25 components**: Fully API integrated (25%)
- ✅ **50+ components**: Pure UI (complete) (50%)
- ⚠️ **8 components**: Using API + mock fallback (8%)
- ❌ **10 components**: Using pure mock data (10%)
- 🟡 **9 components**: Status unknown (9%)

### Real Data Challenges Identified

| Area | Challenge | Components | Priority |
|------|-----------|------------|----------|
| **Academic Resources** | MOCK_RESOURCES (20 items) | AcademicLibraryPage | HIGH |
| **Institution Timetable** | MOCK_GRID (hardcoded schedule) | InstitutionTimetableStudio | HIGH |
| **Discussion Posts** | MOCK_POSTS (3 fake posts) | DiscussionThread | MEDIUM |
| **Student Projects** | MOCK_PROJECTS (2 items) | ProjectActivityPanel | MEDIUM |
| **Resource Engagement** | 3 separate MOCK panels | ResourceEngagementPanels (3) | MEDIUM |
| **Live Sessions** | MOCK_SESSIONS fallback | LiveSessionsPage | MEDIUM |
| **Marketplace** | DEFAULT_CLASSES fallback | HomePage | MEDIUM |
| **Actions** | DEFAULT_MOCK_ACTIONS | StudentActionCenter | MEDIUM |
| **Lesson Creation** | apiClient commented out | TeacherLessonStudio | HIGH |
| **Documents** | mockDocuments hardcoded | ExamRegistrationPage | MEDIUM |

---

## 📋 Phase 3A: Execution Plan

### WEEK 1: Core Resource APIs & Database Seeding

#### Step 1.1: Expand Database Seeding (Backend)
Create comprehensive seed data for all resource types:

**File**: `maple_backend/expand_seed_data.py`

```python
# Add to existing seed_test_data.py or create new file
def seed_academic_resources():
    """Create 50+ academic resources (textbooks, study guides, past papers)"""
    resources = [
        # TextBooks
        {"title": "Advanced Chemistry", "type": "TextBook", "price": 25000, ...},
        {"title": "Physics Vol 1", "type": "TextBook", "price": 22000, ...},
        # Study Guides
        {"title": "UNEB Chemistry Guide", "type": "StudyGuide", "price": 15000, ...},
        # Past Papers
        {"title": "2023 Mathematics Paper 1", "type": "PastPaper", "price": 8000, ...},
        # Add 40+ more...
    ]

def seed_discussion_posts():
    """Create 50+ discussion threads with replies"""
    
def seed_projects():
    """Create 20+ student projects with submissions"""
    
def seed_institution_timetables():
    """Create 3 institution timetables with full schedules"""
```

#### Step 1.2: Create/Verify API Endpoints (Backend)

Create Django REST Framework endpoints for:

1. **`/resources/`** - Academic resources (textbooks, guides, past papers)
2. **`/discussions/`** - Discussion threads and posts
3. **`/projects/`** - Student projects and submissions
4. **`/student/assigned-resources/`** - Student's assigned resources
5. **`/teacher/resource-analytics/`** - Resource usage analytics
6. **`/parent/child-resources/`** - Parent view of child's resources
7. **`/institutions/{id}/timetable/`** - Institution schedules

**Required viewsets in Django**:
```python
# apps/resources/views.py
class ResourceViewSet(ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [IsAuthenticated]

# apps/discussions/views.py  
class DiscussionThreadViewSet(ModelViewSet):
class DiscussionPostViewSet(ModelViewSet):

# apps/projects/views.py
class ProjectViewSet(ModelViewSet):

# apps/scheduling/views.py
class InstitutionTimetableViewSet(ModelViewSet):
```

---

### WEEK 2: Frontend Component Conversion

#### Step 2.1: Fix High-Priority Components (3 days)

**Component 1: AcademicLibraryPage** - Replace MOCK_RESOURCES
```typescript
// Current: const MOCK_RESOURCES = [...]
// New: Fetch from /api/v1/resources/

import { apiClient } from '@/lib/apiClient';

export function AcademicLibraryPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    apiClient.get('/resources/')
      .then(data => setResources(data))
      .catch(err => {
        console.error('Failed to load resources', err);
        setResources(DEFAULT_MOCK_RESOURCES); // Fallback
      })
      .finally(() => setLoading(false));
  }, []);
  
  // Component render uses resources instead of MOCK_RESOURCES
}
```

**Component 2: InstitutionTimetableStudio** - Replace MOCK_GRID
```typescript
// Current: const MOCK_GRID = [...]
// New: Fetch from /api/v1/institutions/{id}/timetable/

import { apiClient } from '@/lib/apiClient';

export function InstitutionTimetableStudio({ institutionId }) {
  const [timetable, setTimetable] = useState(null);
  
  useEffect(() => {
    apiClient.get(`/institutions/${institutionId}/timetable/`)
      .then(data => setTimetable(data))
      .catch(err => {
        console.error('Failed to load timetable', err);
        setTimetable(DEFAULT_MOCK_GRID);
      });
  }, [institutionId]);
  
  // Component uses timetable instead of MOCK_GRID
}
```

**Component 3: TeacherLessonStudio** - Uncomment apiClient
```typescript
// Current: Commented out apiClient
// New: Uncomment and use proper error handling

const res = await apiClient.post('/live-sessions/provision-webinar/', {
  title: lesson.title,
  description: lesson.description,
  // ... other fields
});
```

#### Step 2.2: Fix Medium-Priority Components (4 days)

**Component 4: DiscussionThread** - Replace MOCK_POSTS
```typescript
// Fetch from /api/v1/discussions/threads/{threadId}/posts/
```

**Component 5: ProjectActivityPanel** - Replace MOCK_PROJECTS
```typescript
// Fetch from /api/v1/projects/
```

**Component 6-8: Resource Engagement Panels** - 3 components
```typescript
// ParentResourceEngagementPanel → /parent/child-resources/
// StudentResourceEngagementPanel → /student/assigned-resources/  
// TeacherResourceEngagementPanel → /teacher/resource-analytics/
```

**Component 9: LiveSessionsPage** - Ensure reliability
```typescript
// Make MOCK_SESSIONS fallback truly optional
// Verify /live-sessions/live-session/ is robust
```

#### Step 2.3: UX Polish & Component Improvements (3 days)

For each component above:
- [ ] Add proper loading states (skeleton loaders)
- [ ] Add error boundaries with user-friendly messages
- [ ] Add empty states for no data
- [ ] Add pagination/infinite scroll for large lists
- [ ] Add search/filter functionality
- [ ] Add sorting options
- [ ] Improve responsive design (mobile view)
- [ ] Add animations/transitions
- [ ] Add accessibility features (ARIA labels, keyboard nav)
- [ ] Add tooltips for complex features

Example UX improvements:
```typescript
export function AcademicLibraryPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Loading state
  if (loading) return <DashboardSkeleton />;
  
  // Error state
  if (error) return (
    <EmptyState
      icon={AlertCircle}
      title="Failed to load resources"
      description={error}
      action={<Button onClick={handleRetry}>Try Again</Button>}
    />
  );
  
  // Empty state
  if (!resources.length) return <EmptyState title="No resources yet" />;
  
  // Filter and search
  const filtered = resources
    .filter(r => filterType === 'all' || r.type === filterType)
    .filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()));
  
  return (
    <div>
      <SearchBar onChange={setSearchTerm} />
      <FilterDropdown onChange={setFilterType} />
      <ResourceGrid items={filtered} />
    </div>
  );
}
```

---

### WEEK 3: Complete Remaining Components

#### Step 3.1: Audit "Unknown" Components (2 days)

Review and integrate these components:
- SubjectTopicsPage
- LearningPathPage
- SmartStudyPlanner
- StudentPassport
- ParentActionCenter
- All Competition components (UNEB, Leaderboards, etc)
- All Institution components
- AI components (AITeachingPartner, etc)
- BadgeShowcase, CertificateCard

#### Step 3.2: Fix Static JSON Components (1 day)

Replace `fetch('/data/*.json')` with apiClient:

```typescript
// CourseCatalog.tsx
// Current: fetch('/data/courses.json')
// New: apiClient.get('/curriculum/courses/')
```

#### Step 3.3: Comprehensive Testing (2 days)

- Test each page with real API data
- Test error scenarios (network down, API error, etc)
- Test with different user roles (student, teacher, admin, parent)
- Test responsive design on mobile/tablet
- Performance testing (load times, memory)

---

## 🗄️ Required Database Seeding

Expand `maple_backend/expand_seed_data.py`:

```python
SEED_DATA = {
    # Academic Resources (for library)
    'resources': {
        'textbooks': 15,
        'study_guides': 20,
        'past_papers': 25,
        'lesson_notes': 30,
        'web_resources': 10
    },
    
    # Discussions
    'discussion_threads': 20,
    'discussion_posts': 100,
    
    # Projects
    'projects': 15,
    'project_submissions': 30,
    
    # Timetables
    'institution_timetables': 3,
    'schedules': 50,
    
    # Live Sessions
    'live_sessions': 10,
    
    # Assessments
    'assignments': 25,
    'quizzes': 15,
    'exams': 5,
}
```

---

## 📱 UX Polish Checklist

For each component, ensure:

### Loading States
- [ ] Skeleton loaders appear while data loads
- [ ] Loading state is not longer than 2 seconds
- [ ] User sees progress indication

### Error States
- [ ] User-friendly error messages
- [ ] Retry button available
- [ ] Error logged for debugging
- [ ] Fallback content shown if available

### Empty States
- [ ] Clear message when no data exists
- [ ] Call-to-action to create/add content
- [ ] Icon to make empty state visual
- [ ] Link to related content

### Responsiveness
- [ ] Mobile (375px width)
- [ ] Tablet (768px width)
- [ ] Desktop (1920px width)
- [ ] Touch targets >= 44px

### Performance
- [ ] Images optimized (lazy load, thumbnails)
- [ ] Lists paginated or virtual scrolled
- [ ] Debounce search input
- [ ] Cache API responses where appropriate

### Accessibility
- [ ] ARIA labels for interactive elements
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Color contrast >= 4.5:1
- [ ] Focus indicators visible
- [ ] Alternative text for images

### Visual Polish
- [ ] Consistent spacing (8px grid)
- [ ] Smooth transitions (200-300ms)
- [ ] Hover effects on interactive elements
- [ ] Loading spinners implemented
- [ ] Toast notifications for actions
- [ ] Animation on page transitions

---

## 🔄 Data Flow Pattern (Standardized)

All components should follow this pattern:

```typescript
import { apiClient, API_ENDPOINTS } from '@/lib/apiClient';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { AlertCircle } from 'lucide-react';

export function ComponentName() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(API_ENDPOINTS.YOUR_ENDPOINT);
        setData(response);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setData(FALLBACK_MOCK_DATA); // Optional fallback
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) return <DashboardSkeleton />;
  if (error && !data.length) return (
    <EmptyState
      icon={AlertCircle}
      title="Failed to load data"
      description={error}
      action={<Button onClick={() => window.location.reload()}>Retry</Button>}
    />
  );
  if (!data.length) return <EmptyState title="No data available" />;
  
  return <div>{/*Render data*/}</div>;
}
```

---

## 📊 Implementation Timeline

```
Week 1 (Apr 5-12):
├─ Day 1-2: Database seeding expansion
├─ Day 3-5: API endpoints creation/verification

Week 2 (Apr 12-19):
├─ Day 1-3: Fix high-priority components (3 components)
├─ Day 4-7: Fix medium-priority components (6 components)
└─ UX Polish: Add loading states, error handling, empty states

Week 3 (Apr 19-26):
├─ Day 1-2: Audit unknown components
├─ Day 3: Replace static JSON fetches
├─ Day 4-5: Comprehensive testing
└─ Deployment prep
```

---

## 🚀 Success Criteria

✅ All 10 mock components converted to API  
✅ All components have proper loading/error/empty states  
✅ All components responsive on mobile/tablet/desktop  
✅ All API endpoints returning real seeded data  
✅ Zero "undefined" or broken layouts  
✅ All pages load within 2 seconds  
✅ 100% test pass rate on integration tests  
✅ Accessibility score >= 90  
✅ Mobile-friendly (Lighthouse score >= 85)  

---

## 📝 Files to Create/Modify

### Backend (Django)
- [ ] `maple_backend/expand_seed_data.py` - Comprehensive seeding
- [ ] `apps/resources/` - New app for resource management
- [ ] `apps/discussions/` - New app for discussion threads
- [ ] `apps/projects/` - New app for student projects
- [ ] `apps/scheduling/` - Timetable endpoints
- [ ] `maple_core/urls.py` - Register new endpoints

### Frontend (React)
- [ ] `src/lib/apiClient.ts` - Add 10+ new endpoints
- [ ] `src/pages/AcademicLibraryPage.tsx` - Fix 1/10
- [ ] `src/pages/InstitutionTimetableStudio.tsx` - Fix 2/10
- [ ] `src/pages/TeacherLessonStudio.tsx` - Fix 3/10
- [ ] `src/components/academic/DiscussionThread.tsx` - Fix 4/10
- [ ] `src/components/academic/ProjectActivityPanel.tsx` - Fix 5/10
- [ ] `src/components/dashboard/ParentResourceEngagementPanel.tsx` - Fix 6/10
- [ ] `src/components/dashboard/StudentResourceEngagementPanel.tsx` - Fix 7/10
- [ ] `src/components/dashboard/TeacherResourceEngagementPanel.tsx` - Fix 8/10
- [ ] `src/pages/LiveSessionsPage.tsx` - Fix 9/10
- [ ] `src/pages/HomePage.tsx` - Reliability 10/10

### Configuration
- [ ] Update seed script execution
- [ ] Add new API endpoints to apiClient.ts
- [ ] Update .env for new features
- [ ] Document new API endpoints

---

## 🎯 Next Steps

1. **TODAY (Apr 5)**: Review this plan and agree on priorities
2. **Confirm**: Which components to tackle first?
3. **Database**: Create expanded seeding script
4. **APIs**: Create necessary Django REST endpoints
5. **Frontend**: Systematically convert mock to API components
6. **Testing**: Verify each component with real data before moving to next
7. **Deploy**: Push to production when all tests pass

---

**Goal**: Complete, polished frontend with real data integration ready for users by April 26, 2026.
