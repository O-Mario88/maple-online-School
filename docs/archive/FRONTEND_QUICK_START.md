# 🚀 Quick Start Guide - Frontend Development

## Prerequisites
✅ Backend server running on http://localhost:8000  
✅ Database initialized with 22 apps  
✅ API endpoints responding  

---

## Step 1: Verify Backend is Running

```bash
# Check if backend is running
curl http://localhost:8000/api/v1/curriculum/countries/

# Expected response: 401 (Unauthorized - normal for protected endpoint)
# This means the server is running!
```

### If Backend is NOT Running
```bash
cd maple_backend
python manage.py runserver 0.0.0.0:8000
```

---

## Step 2: Start Frontend Development Server

```bash
# From the root directory (Maple Online School)
npm run dev

# Expected output:
# ➜  Local:   http://localhost:5173/
# ➜  Press h to show help
```

The frontend will automatically start on **http://localhost:5173**

---

## Step 3: Configure API Connection

### Option A: Update Environment Variables (Recommended)
Create `.env.local` in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_V1=/api/v1
```

### Option B: Update TypeScript Configuration
Edit `src/lib/api.ts` or similar:

```typescript
export const API_BASE_URL = 'http://localhost:8000';
export const API_V1 = '/api/v1';
```

---

## Step 4: Update API Client

### Login Endpoint
```typescript
// Use this endpoint to get JWT tokens
const response = await fetch(`${API_BASE_URL}${API_V1}/auth/token/`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@maple.local',
    password: 'password123'
  })
});

const { access, refresh } = await response.json();
// Store tokens in context/localStorage
```

### Register Endpoint
```typescript
// Create new user account
const response = await fetch(`${API_BASE_URL}${API_V1}/auth/register/`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'newuser@maple.local',
    full_name: 'New User',
    password: 'SecurePass123!',
    country_code: 'uganda',
    role: 'student'  // or 'teacher', 'institution', 'admin'
  })
});
```

### Protected Endpoints
```typescript
// Always include Authorization header for protected endpoints
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
};

const response = await fetch(`${API_BASE_URL}${API_V1}/curriculum/countries/`, {
  headers: headers
});
```

---

## Step 5: Test Authentication Flow

### Test Data
```javascript
const testUser = {
  email: 'test@maple.local',
  password: 'TestPass123!'
};

// Or create new user with:
{
  email: 'newuser@maple.local',
  full_name: 'Test User',
  password: 'NewPass123!',
  country_code: 'uganda',
  role: 'student'
}
```

### Complete Login Flow
```typescript
// 1. Register (if new user)
const registerRes = await fetch(`${API_BASE_URL}/api/v1/auth/register/`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    full_name: 'Test User',
    password: 'TestPass123!',
    country_code: 'uganda',
    role: 'student'
  })
});

// 2. Get JWT Token
const tokenRes = await fetch(`${API_BASE_URL}/api/v1/auth/token/`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'TestPass123!'
  })
});

const { access, refresh } = await tokenRes.json();

// 3. Store tokens (using context/localStorage)
localStorage.setItem('access_token', access);
localStorage.setItem('refresh_token', refresh);

// 4. Use token for subsequent requests
const apiRes = await fetch(`${API_BASE_URL}/api/v1/curriculum/countries/`, {
  headers: { 'Authorization': `Bearer ${access}` }
});
```

---

## Step 6: Update AuthContext

### Example React Context Setup
```typescript
// src/contexts/AuthContext.tsx

import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    const response = await fetch('http://localhost:8000/api/v1/auth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    setAccessToken(data.access);
    setRefreshToken(data.refresh);
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  return (
    <AuthContext.Provider value={{ accessToken, refreshToken, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## Step 7: Available API Endpoints

### Authentication
- `POST /api/v1/auth/register/` - Register new user
- `POST /api/v1/auth/token/` - Get JWT token
- `POST /api/v1/auth/token/refresh/` - Refresh token
- `POST /api/v1/auth/onboard-student/` - Student onboarding flow

### Curriculum
- `GET /api/v1/curriculum/countries/` - List countries
- `GET /api/v1/curriculum/subjects/` - List subjects
- `GET /api/v1/curriculum/class-levels/` - List class levels
- `GET /api/v1/curriculum/topics/` - List topics

### Institutions
- `GET /api/v1/institutions/` - List institutions
- `POST /api/v1/institutions/` - Create institution

### Marketplace
- `GET /api/v1/marketplace/listings/` - Browse listings
- `POST /api/v1/marketplace/listings/` - Create listing

### Live Sessions
- `GET /api/v1/live-sessions/live-session/` - List sessions
- `POST /api/v1/live-sessions/live-session/` - Create session

### Assessments
- `GET /api/v1/assessments/assessment/` - List assessments
- `POST /api/v1/assessments/assessment/` - Create assessment

### Dashboard
- `GET /api/v1/analytics/student-dashboard/` - Student dashboard data
- `GET /api/v1/analytics/teacher-dashboard/` - Teacher dashboard data
- `GET /api/v1/analytics/parent-dashboard/` - Parent dashboard data

---

## Step 8: Disable Mock Data

### Update Component Configuration

Look for components that are using mock data (usually near the top):

```typescript
// BEFORE (using mock data)
import { mockCoursesData } from '@/lib/mockData';

const [courses, setCourses] = useState(mockCoursesData);

// AFTER (using real API)
const [courses, setCourses] = useState([]);

useEffect(() => {
  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/curriculum/topics/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  if (accessToken) {
    fetchCourses();
  }
}, [accessToken]);
```

---

## Step 9: Common Issues & Solutions

### CORS Error
```
Error: Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution:** Backend already has CORS enabled for `http://localhost:5173`. Make sure:
1. Backend is running on port 8000
2. Frontend is running on port 5173
3. API calls use full URL: `http://localhost:8000/api/v1/...`

### 401 Unauthorized
```
Response: {"detail":"Authentication credentials were not provided."}
```

**Solution:** Protected endpoints require JWT token in header:
```typescript
headers: {
  'Authorization': 'Bearer YOUR_ACCESS_TOKEN_HERE'
}
```

### 404 Not Found
```
Response: {"detail":"Not found."}
```

**Solution:** Check endpoint path. Use `/api/v1/curriculum/...` not `/curriculum/...`

### Token Expired
```
Response: {"detail":"Token is invalid or expired"}
```

**Solution:** Refresh token using:
```typescript
const response = await fetch('http://localhost:8000/api/v1/auth/token/refresh/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    refresh: refreshToken
  })
});

const { access } = await response.json();
setAccessToken(access);
```

---

## Step 10: Next Steps

1. ✅ Start frontend dev server (`npm run dev`)
2. ✅ Update API configuration
3. ✅ Test user registration/login
4. ✅ Begin replacing mock data with API calls
5. ✅ Update components one by one
6. ✅ Test all flows thoroughly

---

## Useful Commands

### Start all services (in separate terminals)

**Terminal 1 - Backend:**
```bash
cd maple_backend
python manage.py runserver 0.0.0.0:8000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Terminal 3 - Create superuser (optional):**
```bash
cd maple_backend
python manage.py createsuperuser
# Access admin at http://localhost:8000/admin
```

---

## Documentation

- [Backend API Documentation](./PHASE_1_BUILD_REPORT.md)
- [Integration Roadmap](./INTEGRATION_ROADMAP.md)
- [Backend README](./maple_backend/README.md)

---

## Support

If you encounter issues:

1. Check backend is running: `curl http://localhost:8000/api/v1/curriculum/countries/`
2. Check CORS headers: Look for `Access-Control-Allow-Origin: http://localhost:5173`
3. Check token validity: Make sure token hasn't expired (24 hours)
4. Check network tab in browser DevTools for actual requests/responses

---

**Happy coding! 🎉**
