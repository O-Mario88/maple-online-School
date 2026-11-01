# Backend Registration Endpoint Test

## Quick Start (Right Now)

### Terminal 1: Start Django Backend
```bash
cd maple_backend
python manage.py runserver
```

Expected output:
```
Starting development server at http://127.0.0.1:8000/
```

### Terminal 2: Test the Endpoint

Using `curl`:
```bash
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "full_name": "Test User",
    "password": "TestPassword123",
    "country_code": "uganda",
    "role": "student"
  }'
```

### What You Should See

**Success (201):**
```json
{
  "id": 1,
  "email": "testuser@example.com",
  "full_name": "Test User",
  "country_code": "uganda",
  "role": "student"
}
```

**Error (400):**
```json
{
  "email": ["This field may already exist."],
  "password": ["This field is required."]
}
```

---

## If Something Fails

### Common Issues:

**1. Port 8000 already in use**
```bash
# Find process on port 8000
lsof -i :8000
# Kill it
kill -9 <PID>
```

**2. Database migrations not run**
```bash
python manage.py migrate
```

**3. CORS error in browser console**
- Check `maple_backend/maple_core/settings.py`
- Ensure `CORS_ALLOWED_ORIGINS` includes `http://localhost:5173`

---

## Next: Connect Frontend

Once registration works, update `src/lib/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:8000/api/v1'; // Remove the fallback mock logic temporarily
```

Then test the RegisterPage component with real backend.

---

## Progress Tracking

- [ ] Backend server running on port 8000
- [ ] Test endpoint returns 201 with user data
- [ ] Database has new user record
- [ ] Frontend can POST to `/auth/register/`
- [ ] Student profile auto-created on registration
