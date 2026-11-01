# 🚀 Integration Roadmap: Mock → Real Backend

## What Was Set Up For You

You now have:

1. **`START_HERE.md`** - Quick start guide
2. **`start-backend.sh`** - Automatic backend startup with migrations
3. **`start-frontend.sh`** - Frontend startup shortcut
4. **`test_registration.py`** - Automated endpoint testing
5. **`TEST_REGISTRATION.md`** - Detailed testing guide

---

## The Plan: Phased Integration

### Phase 1️⃣: Verify (Today - 30 min)

```bash
# Terminal 1
./start-backend.sh

# Terminal 2  
./start-frontend.sh

# Terminal 3 (when both running)
python3 test_registration.py
```

✅ Expected: User created in database, 201 response

---

### Phase 2️⃣: Connect Registration (Tomorrow - 1 hour)

Update `src/pages/RegisterPage.tsx`:

```typescript
// Replace the mock auth.register() call with:
const handleLearnerSubmit = async () => {
  setIsLoading(true);
  try {
    const response = await apiClient.post('/auth/register/', {
      email: studentData.email,
      full_name: studentData.full_name,
      password: studentData.password,
      country_code: studentData.country_code,
      role: 'student'
    });
    
    // Save token
    localStorage.setItem('maple-access-token', response.data.token);
    navigate('/student-dashboard');
    
  } catch (error: any) {
    setError(error.response?.data?.detail || 'Registration failed');
  } finally {
    setIsLoading(false);
  }
};
```

---

### Phase 3️⃣: Replace One Feature at a Time

**Priority order (by dependency):**

1. **Authentication** (registration, login) → 2-3 hours
2. **Student Dashboard** → 2-3 hours  
3. **Teacher Dashboard** → 2-3 hours
4. **Resource Upload** (with Vimeo) → 4-5 hours
5. **Live Sessions** → 4-5 hours

**Important:** Each endpoint you integrate:
- Test in browser/curl before connecting frontend
- Update frontend to use real API
- Remove mock data ONLY after verifying real data works
- Keep mock as fallback (if needed)

---

## Monitoring Checklist

Before moving to next endpoint, verify:

- [ ] Backend endpoint returns expected data
- [ ] Frontend can POST/GET to it without CORS errors
- [ ] Authentication token flows correctly
- [ ] Database reflects changes  
- [ ] Navigation works after data received

---

## Quick Reference: Key Endpoints by Role

### Student Flow
```
POST   /auth/register/                    → Create student user
POST   /auth/token/                       → Get JWT token
GET    /analytics/student-dashboard/      → Get dashboard data
POST   /live-sessions/live-session/       → Enroll in session
POST   /resources/resource/               → View resources
```

### Teacher Flow
```
POST   /auth/register/                    → Create teacher user
POST   /auth/token/                       → Get JWT token
GET    /analytics/teacher-dashboard/      → Get dashboard
POST   /lessons/lesson/                   → Create lesson
POST   /resources/resource/               → Upload resource
```

### Inspector: Database State

Quick check to see what's in the database:
```bash
# From maple_backend directory
python manage.py shell
>>> from accounts.models import User
>>> User.objects.all().values('email', 'role', 'date_joined')
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `Authorization header not sent` | Check LocalStorage has token set correctly |
| `CORS error in browser` | Add `http://localhost:5173` to CORS settings |
| `400 Bad Request on POST` | Check field names match serializer exactly |
| `500 Internal Server Error` | Check backend terminal for traceback |
| `Token invalid/expired` | JWT token lifetime is 24 hours (see settings.py) |

---

## Time Estimate to Full Integration

| Phase | Prep | Testing | Implementation | Total |
|-------|------|---------|-----------------|-------|
| **Verification** | — | 15 min | — | **15 min** |
| **Registration** | 30 min | 15 min | 1 hour | **1h 45min** |
| **Dashboards** | 30 min | 20 min | 2 hours | **3 hours** |
| **Resources** | 30 min | 30 min | 3 hours | **4 hours** |
| **All Features** | — | — | — | **~10 hours** |

---

## You Are Here 📍

```
✅ Backend architecture complete
✅ Test scripts ready
⏳ Phase 1: Verification (START HERE)
⏳ Phase 2: Connect features
⏳ Phase 3: Full integration
⏳ Phase 4: Testing & hardening
```

**Next step:** Run `./start-backend.sh` and `./start-frontend.sh`, then execute `python3 test_registration.py`
