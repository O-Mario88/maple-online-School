# 📚 Setup Files Reference

All files needed to start backend integration are now in the project root:

## Quick Reference

### 🟢 **To Get Started**
```bash
./START_HERE.md              # Read this first (5 min)
./INTEGRATION_ROADMAP.md     # Full integration plan (reference)
```

### 🔧 **Setup & Testing**
```bash
./start-backend.sh           # Starts Django server + migrations
./start-frontend.sh          # Starts React dev server
python3 test_registration.py # Tests registration endpoint
```

### 📖 **Detailed Guides**
```bash
./TEST_REGISTRATION.md       # Step-by-step endpoint testing
```

---

## File Purposes

| File | Purpose | Read Time |
|------|---------|-----------|
| **START_HERE.md** | Quick 30-minute setup guide | 5 min |
| **INTEGRATION_ROADMAP.md** | Full strategy + timeline | 10 min |
| **TEST_REGISTRATION.md** | Detailed testing walkthrough | 5 min |
| **start-backend.sh** | Auto-launch backend | run it |
| **start-frontend.sh** | Auto-launch frontend | run it |
| **test_registration.py** | Automated endpoint test | run it |

---

## Your Next Actions (In Order)

### ✅ Action 1: Read the Quick Start
```bash
cat START_HERE.md
```
Takes 5 minutes. Tells you exactly what to do.

### ✅ Action 2: Launch Services
Open **3 terminal windows**:

**Terminal A:**
```bash
./start-backend.sh
# Wait for: ✅ Backend starting on http://localhost:8000
```

**Terminal B:**
```bash
./start-frontend.sh
# Wait for: ➜ Local: http://localhost:5173/
```

**Terminal C:**
```bash
python3 test_registration.py
# Should see: ✨ SUCCESS! User registered
```

### ✅ Action 3: If All Green → Proceed to Integration

Edit `src/pages/RegisterPage.tsx` to use real API instead of mock.

---

## Expected Outputs

### Backend startup (Terminal A)
```
🚀 Starting Maple Backend...
📦 Running database migrations...
✅ Backend starting on http://localhost:8000

Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

### Frontend startup (Terminal B)
```
🎨 Starting Maple Frontend...
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  press h + enter to show help
```

### Test script success (Terminal C)
```
============================================================
🎯 Maple Backend Registration Test
============================================================

📝 Testing Registration Endpoint
✅ Status Code: 201
✨ SUCCESS! User registered:
   ID: 1
   Email: test-xxxxx@maple.local
   Role: student

✅ Backend is working! Proceed to frontend integration.
```

---

## If Something Goes Wrong

**Backend won't start?**
→ Check `TEST_REGISTRATION.md` section "Troubleshooting"

**Frontend CORS error?**
→ Check Django settings:
```bash
grep -n "CORS_ALLOW_ALL_ORIGINS" maple_backend/maple_core/settings.py
# Should show: CORS_ALLOW_ALL_ORIGINS = True
```

**Database locked?**
→ Run migrations fresh:
```bash
cd maple_backend
source venv/bin/activate
python manage.py migrate --run-syncdb
```

---

## Progress Markers

You've completed:
- ✅ Backend architecture (22 Django apps)
- ✅ Frontend UI with mock data
- ✅ Setup scripts created
- ✅ Test harness ready

You're about to:
- ⏳ Verify both servers communicate
- ⏳ Test endpoint integration
- ⏳ Connect frontend to real APIs
- ⏳ Flush mock data (in 2-3 weeks)

---

## Questions?

Each setup file has a **Troubleshooting** section. Start there.

Files are kept simple and well-commented for easy debugging.
