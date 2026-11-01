# 🎯 START HERE - Backend Integration Testing

## Your Situation
✅ Backend: Django + PostgreSQL built with 22 apps
✅ Frontend: React + TypeScript with mock data
❓ Next: Connect them together incrementally

---

## IMMEDIATE ACTION (Do This Now)

### Step 1: Open Two Terminal Tabs

**Terminal Tab 1 - Backend:**
```bash
./start-backend.sh
```

**Expected output:**
```
🚀 Starting Maple Backend...
📦 Running database migrations...
✅ Backend starting on http://localhost:8000
```

**Terminal Tab 2 - Frontend:**
```bash
./start-frontend.sh
```

**Expected output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

## Step 2: Test Registration Endpoint

### Via Browser (Easiest)

1. Go to: `http://localhost:8000/api/v1/auth/register/`
2. Click the form at the bottom
3. Fill in:
   - Email: `testuser@example.com`
   - Full Name: `Test User`
   - Password: `TestPassword123`
   - Country Code: `uganda`
   - Role: `student`
4. Click **POST**

**Success:** You'll see HTTP 201 with user data returned

---

## Step 3: Quick Verification

Open another terminal:
```bash
curl http://localhost:8000/api/v1/auth/register/ -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "email": "curl-test@example.com",
    "full_name": "Curl Test",
    "password": "Secure123!",
    "country_code": "uganda",
    "role": "student"
  }'
```

---

## Checklist: Mark Complete When Done

- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] Can POST to /auth/register/ and get 201 response
- [ ] Check database: `sqlite3 db.sqlite3 "SELECT email, role FROM accounts_user;"`
- [ ] User record exists with correct role

---

## Next (After Verification)

Once registration works:

1. **Find the RegisterPage component** (`src/pages/RegisterPage.tsx`)
2. **Update it to use real API** instead of mock auth context
3. **Test end-to-end registration flow**

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 8000 in use | `lsof -i :8000` then `kill -9 <PID>` |
| `venv not found` | Run from project root: `cd "maple online school"` |
| Database locked | Delete `db.sqlite3` and run migrations fresh |
| CORS error | Check that `CORS_ALLOWED_ORIGINS` in settings includes `http://localhost:5173` |

---

## Progress Map

```
✅ Backend built with Django + PostgreSQL
⏳ Step 1: Verify services running (YOU ARE HERE)
⏳ Step 2: Test one endpoint (registration)
⏳ Step 3: Connect frontend to real API
⏳ Step 4: Test full user flow
⏳ Step 5: Gradually replace other mock endpoints
```

**Time estimate: 30 minutes to get here, then incremental replacement**
