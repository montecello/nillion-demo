# 🚀 Quick Start - Local Testing

## Before Deploying to Vercel

Test everything locally first to catch issues early!

---

## ⚡ TL;DR - 3 Commands

```bash
# 1. Setup (first time only)
./scripts/setup.sh

# 2. Start services
./scripts/start-demo.sh

# 3. Test it works
./test-local.sh
```

Then open: **http://localhost:3000**

---

## 📋 Manual Testing Steps

### 1. Start Backend (Terminal 1)
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**✅ Success**: See "Application startup complete"

### 2. Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

**✅ Success**: See "Ready started server on 0.0.0.0:3000"

### 3. Open Browser
Go to: **http://localhost:3000**

---

## ✅ 5-Minute Test Checklist

| Test | What to Do | Expected Result |
|------|-----------|----------------|
| **Page Loads** | Open http://localhost:3000 | UI loads, no errors |
| **Backend API** | Visit http://localhost:8000/docs | API docs display |
| **Encryption Toggle** | Click "Enable" button | Banner turns green |
| **Send Query** | Click sample or type query → Send | Response appears in ~2s |
| **Attestation** | Click "TEE Attestation" tab | Proof loads with green checkmark |
| **Audit Log** | Click "Audit Log" tab | See your test queries logged |

**All green?** → Ready to deploy! 🎉

---

## 🐛 Quick Fixes

### Backend won't start?
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend won't start?
```bash
cd frontend
rm -rf node_modules
npm install
```

### Port already in use?
```bash
# Kill processes
lsof -ti:8000 | xargs kill -9  # Backend
lsof -ti:3000 | xargs kill -9  # Frontend
```

### Browser errors?
- Press F12 → Check Console tab
- Clear cache: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Try incognito mode

---

## 🔍 Automated Testing

```bash
# Run automated tests
./test-local.sh

# Should show:
# ✓ Python 3 installed
# ✓ Node.js installed
# ✓ Backend is running
# ✓ Frontend is running
# ✓ All endpoints respond
```

---

## 📊 What to Verify

### Backend (http://localhost:8000)
- [ ] Health check responds: `/health`
- [ ] API docs load: `/docs`
- [ ] No errors in terminal

### Frontend (http://localhost:3000)
- [ ] Page loads without errors
- [ ] Browser console clean (F12 → Console)
- [ ] All three tabs work
- [ ] Encryption toggle works
- [ ] Medical queries send & receive

### Integration
- [ ] Query with encryption OFF works
- [ ] Query with encryption ON works
- [ ] Attestation proof displays
- [ ] Audit log shows queries

---

## 🎯 Pre-Deployment Build Test

```bash
cd frontend

# Build production version
npm run build

# Test it locally
npm start

# Visit http://localhost:3000
```

**✅ Build must succeed before deploying to Vercel**

---

## 📚 Full Documentation

For detailed testing guide: **[docs/LOCAL_TESTING.md](LOCAL_TESTING.md)**

For demo script: **[docs/DEMO_SCRIPT.md](DEMO_SCRIPT.md)**

---

## 🚀 Next: Deploy to Vercel

Once local tests pass:

```bash
cd frontend
vercel login
vercel deploy --prod
```

**Note**: Backend stays local for this demo. For production, deploy backend to cloud service.

---

## 💡 Pro Tips

1. **Test in multiple browsers** (Chrome, Firefox, Safari)
2. **Use incognito mode** for clean test
3. **Check mobile view** (DevTools → Device toolbar)
4. **Monitor Network tab** (F12 → Network) to see API calls
5. **Take screenshots** for demo prep

---

## ⚡ Common Issues

| Issue | Fix |
|-------|-----|
| "Module not found" | Run `./scripts/setup.sh` |
| "Port in use" | Kill processes: `lsof -ti:8000 \| xargs kill -9` |
| CORS errors | Check backend allows `http://localhost:3000` |
| Blank page | Check browser console (F12) for errors |
| Slow responses | Normal - simulated backend (2s response) |

---

## 📞 Help

If stuck:
1. Check **[docs/LOCAL_TESTING.md](LOCAL_TESTING.md)** for detailed troubleshooting
2. Run `./test-local.sh` to diagnose issues
3. Check terminal output for error messages
4. Look at browser console (F12)

---

**Ready to test? Start here:** `./scripts/setup.sh` 🚀
