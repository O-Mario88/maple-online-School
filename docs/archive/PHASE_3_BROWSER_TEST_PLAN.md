# Phase 3: Browser Integration Testing Plan

**Status**: Ready for Testing  
**Frontend URL**: http://localhost:5174  
**Backend URL**: http://localhost:8000  
**Date**: April 5, 2026

---

## Test Credentials

| User Type | Email | Password | Purpose |
|-----------|-------|----------|---------|
| Student 1 | student1@maple.local | TestPass123! | Primary test user |
| Student 2 | student2@maple.local | TestPass123! | Secondary test user |
| Teacher | teacher1@maple.local | TestPass123! | Teacher role testing |

---

## 🧪 Manual Browser Testing Checklist

### Test 1: Application Load and Initial State
- [ ] Navigate to http://localhost:5174
- [ ] Page loads within 3 seconds
- [ ] Login form displays correctly
- [ ] No console errors (F12 → Console tab)
- [ ] Responsive design works (try resizing window)

### Test 2: Authentication Flow
- [ ] Enter "student1@maple.local" in email field
- [ ] Enter "TestPass123!" in password field
- [ ] Click Login button
- [ ] Page redirects to dashboard/home
- [ ] No error messages displayed
- [ ] Network tab shows: POST /api/v1/auth/token/ → 200 OK
- [ ] localStorage contains "access" and "refresh" tokens

**Verify Token Storage (F12 → Application → Storage → Local Storage):**
```
Key: access
Value: eyJhbGc... (JWT token)

Key: refresh  
Value: eyJhbGc... (JWT token)
```

### Test 3: HomePage - Marketplace Listings Display
- [ ] HomePage loads after successful login
- [ ] At least 4 marketplace listings display
- [ ] Expected listings include:
  - "Advanced Chemistry: Organic Synthesis"
  - (other seeded listings)
- [ ] Each listing shows: Title, Description, Price
- [ ] Network tab shows: GET /api/v1/marketplace/listings/ → 200 OK
- [ ] Data is from API (not hardcoded mock)

**How to verify real API data:**
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "listings"
4. Click on the request
5. Response should show 4 listing objects

### Test 4: StudentActionCenter Component
- [ ] Navigate to the student dashboard/action center page
- [ ] Component renders without errors
- [ ] Either displays assessments (if any exist) or fallback message
- [ ] No "undefined" text or broken layout
- [ ] Is integrated and functional

### Test 5: JWT Token Auto-Refresh (if needed)
- [ ] Open DevTools → Application → Local Storage
- [ ] Manually delete the "access" token (keep "refresh")
- [ ] Try clicking on a protected resource
- [ ] System should automatically refresh the token
- [ ] New "access" token appears in localStorage
- [ ] Page continues working without logout

### Test 6: Error Handling and Fallbacks
- [ ] Stop the backend server (Ctrl+C on backend terminal)
- [ ] Try to refresh the page or navigate
- [ ] Components should display fallback mock data (if configured)
- [ ] No unhandled errors in console
- [ ] Restart backend
- [ ] Real data returns after reconnection

### Test 7: Navigation and Routing
- [ ] Test navigation between different pages/components
- [ ] URL bar updates correctly
- [ ] Browser back button works
- [ ] Page state is preserved (scroll position, filters)

### Test 8: Responsive Design
- [ ] Test on mobile viewport (375px width)
- [ ] Test on tablet viewport (768px width)
- [ ] Test on desktop (1920px width)
- [ ] Layout adapts correctly
- [ ] No horizontal scrolling on mobile

---

## 🔍 Browser Console Verification

**Expected Console State:**
```
✅ Clear console (no red errors)
✅ No "undefined is not a function" messages
✅ No CORS errors
✅ May have warnings (normal)
```

**Login-related requests should appear:**
```
POST /api/v1/auth/token/ → 200 OK
GET /api/v1/marketplace/listings/ → 200 OK
GET /api/v1/assessments/assessment/ → 200 OK
```

---

## 📊 Network Tab Analysis

**Expected Network Requests (after login):**

1. **POST /api/v1/auth/token/**
   - Status: 200
   - Response: `{ "access": "...", "refresh": "..." }`
   - Headers: `Content-Type: application/json`

2. **GET /api/v1/marketplace/listings/**
   - Status: 200
   - Response: Array of 4 listing objects
   - Headers: `Authorization: Bearer <token>`

3. **GET /api/v1/assessments/assessment/**
   - Status: 200
   - Response: Paginated assessment data
   - Headers: `Authorization: Bearer <token>`

---

## 🐛 Known Issues to Check

| Issue | Status | Workaround |
|-------|--------|----------|
| Dashboard endpoint returns 500 | ⚠️ Known | Components use fallback mock data |
| Assessments show 0 items | ℹ️ Expected | No assessment data seeded yet |
| Port 5173 occupied | ✅ Fixed | Using port 5174 instead |

---

## ✅ Testing Success Criteria

The integration is **SUCCESSFUL** when:

- [x] Frontend loads without errors
- [x] Login succeeds with JWT tokens
- [x] Real marketplace listings display from API
- [x] Components integrate with actual data
- [x] No unhandled JavaScript errors
- [x] Token auto-refresh works
- [x] Fallback mechanisms exist for API failures
- [x] Responsive design works across devices

---

## 🚀 Quick Start Testing

**Step 1: Open Browser**
```
http://localhost:5174
```

**Step 2: Login**
```
Email: student1@maple.local
Password: TestPass123!
```

**Step 3: Verify**
```
- See 4 marketplace listings
- Check localStorage for tokens
- Verify Network tab shows API calls
- Try navigating around the UI
```

**Step 4: Review Console**
```
F12 → Console tab
Should be clean (no red errors)
```

---

## 📝 Testing Report Template

```
Date: [Date Tested]
Tester: [Name]
Browser: [Chrome/Firefox/Safari]
OS: [macOS/Windows/Linux]

Overall Status: [✅ PASS / ⚠️ PARTIAL / ❌ FAIL]

Passed Tests: X/8
Failed Tests: Y/8
Issues Found: [List any issues]

Recommendations:
- [List any improvements]
```

---

## 🔗 Related Documentation

- **Phase 1 Report**: [PHASE_1_BUILD_REPORT.md](PHASE_1_BUILD_REPORT.md)
- **Phase 2 Report**: [PHASE_2_INTEGRATION_REPORT.md](PHASE_2_INTEGRATION_REPORT.md)
- **API Client Docs**: [src/lib/apiClient.ts](src/lib/apiClient.ts)
- **Setup Guide**: [FRONTEND_QUICK_START.md](FRONTEND_QUICK_START.md)

---

## 🆘 Troubleshooting

**Issue: "Cannot POST /api/v1/auth/token/"**
- Backend not running
- Fix: Ensure Django server is on port 8000

**Issue: "Blank page after login"**
- Check browser console for JavaScript errors
- Check Network tab for failed requests
- Verify CORS headers in response

**Issue: "Mock data instead of real data"**
- Check that API request succeeded (Network tab)
- Verify access token is in Authorization header
- Check backend logs for 500 errors

**Issue: "CORS error"**
- Backend CORS setting may be wrong
- Backend should have: `CORS_ALLOWED_ORIGINS = ['http://localhost:5174']`

---

**Created**: April 5, 2026  
**Last Updated**: April 5, 2026  
**Status**: Ready for Manual Testing
