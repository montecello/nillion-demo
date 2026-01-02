# 🧪 Local Testing Guide - Medical AI Demo

**Before deploying to Vercel, test everything locally to ensure it works perfectly.**

---

## 🚀 Quick Local Test (5 minutes)

### Step 1: Setup Environment

```bash
cd "/Users/powerfan/Desktop/DEMO PROJECT"

# Run automated setup
./scripts/setup.sh
```

This will:
- ✅ Check Python 3.11+ and Node.js 18+
- ✅ Create Python virtual environment
- ✅ Install all dependencies
- ✅ Copy environment files

### Step 2: Start Services

**Option A: Automated (Recommended)**
```bash
./scripts/start-demo.sh
```

**Option B: Manual (Better for debugging)**

Terminal 1 - Backend:
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### Step 3: Test in Browser

Open: http://localhost:3000

---

## ✅ Testing Checklist

### 1. Backend Health Check (30 seconds)

```bash
# Test backend is running
curl http://localhost:8000/health

# Expected response:
{
  "status": "healthy",
  "services": {...}
}

# Test API docs are accessible
open http://localhost:8000/docs
```

**✅ Success**: You see API documentation with all endpoints listed

### 2. Frontend Loading (30 seconds)

Open http://localhost:3000 in your browser

**Check:**
- [ ] Page loads without errors
- [ ] "Medical AI Assistant" header appears
- [ ] Three tabs visible: Medical Chat, TEE Attestation, Audit Log
- [ ] Encryption status banner shows
- [ ] No console errors (F12 → Console tab)

**✅ Success**: Clean UI loads with no errors

### 3. Encryption Feature (1 minute)

**Test encryption toggle:**

1. Click "Enable" button on encryption banner
2. Banner turns green with "Encryption Enabled"
3. Shows three green checkmarks for security features

**Test without encryption (baseline):**

1. Click "Enable" to disable encryption (banner turns yellow)
2. Type or click sample query: *"I have chest pain and shortness of breath"*
3. Click "Send"
4. Wait for response (~2 seconds)
5. Verify message appears

**Test with encryption (main feature):**

1. Click "Enable" again (banner turns green)
2. Type or click sample query
3. Click "Send"
4. Check for 🔒 Encrypted badges on both messages
5. Verify response appears

**✅ Success**: Both encrypted and unencrypted queries work

### 4. TEE Attestation Tab (1 minute)

1. Click "TEE Attestation" tab
2. Wait for attestation proof to load
3. Check displayed fields:
   - Proof ID
   - Status (should be "Verified" with green checkmark)
   - Enclave Hash
   - Timestamp

**Test verification:**

1. Click "Verify Attestation" button
2. Wait for verification results
3. Check all four validations pass:
   - ✓ Signature valid
   - ✓ Certificate valid
   - ✓ Measurements valid
   - ✓ Timestamp valid

**Test download:**

1. Click "Download" button
2. Verify JSON file downloads

**✅ Success**: Attestation loads, verifies, and downloads

### 5. Audit Log Tab (1 minute)

1. Click "Audit Log" tab
2. Check summary statistics at top (should show your test queries)
3. Verify log entries appear in table
4. Check event types are color-coded
5. Test filters:
   - Change "All Events" to "Medical Queries"
   - Change time range (1 hour, 24 hours, 7 days)

**Test export:**

1. Click "Export" button
2. Verify JSON file downloads

**✅ Success**: Logs display without PHI, export works

---

## 🔍 Backend Testing (Deep Dive)

### Test Individual Endpoints

**1. Root endpoint:**
```bash
curl http://localhost:8000/
```

**2. Medical query (simulated):**
```bash
curl -X POST http://localhost:8000/api/medical/query \
  -H "Content-Type: application/json" \
  -d '{
    "encrypted_query": "test_encrypted_data",
    "encryption_metadata": {"type": "test"},
    "session_id": "test_session",
    "request_attestation": true
  }'
```

**3. Medical service status:**
```bash
curl http://localhost:8000/api/medical/status
```

**4. Attestation proof:**
```bash
curl http://localhost:8000/api/attestation/proof
```

**5. Audit logs:**
```bash
curl http://localhost:8000/api/audit/logs?hours=1
```

**6. Audit summary:**
```bash
curl http://localhost:8000/api/audit/summary?hours=1
```

### Check Logs

```bash
# Backend logs (if using automated start)
tail -f logs/backend.log

# Or check terminal output if running manually
```

**Look for:**
- ✅ No error messages
- ✅ Successful API requests logged
- ✅ Audit entries being written

### Verify Audit Files

```bash
# Check audit log files are created
ls -lh backend/logs/

# View today's audit log
cat backend/logs/audit_$(date +%Y%m%d).jsonl | jq
```

**✅ Success**: Audit logs exist and are valid JSON

---

## 🎨 Frontend Testing (Deep Dive)

### Check Console for Errors

1. Open browser DevTools (F12 or Cmd+Option+I on Mac)
2. Go to Console tab
3. Look for errors (red text)

**Common issues:**
- API connection errors → Backend not running
- CORS errors → Check backend CORS settings
- Module errors → Run `npm install` again

### Test All UI Components

**Encryption Status Component:**
- [ ] Toggle works (green ↔ yellow)
- [ ] Shows correct status text
- [ ] Security features list appears when enabled

**Chat Interface Component:**
- [ ] Sample queries are clickable
- [ ] Input field accepts text
- [ ] Send button enables/disables correctly
- [ ] Messages display with correct styling
- [ ] Timestamps appear
- [ ] Processing times show
- [ ] Loading spinner appears during processing
- [ ] Error messages display if backend fails

**Attestation Component:**
- [ ] Proof loads automatically
- [ ] All fields populated
- [ ] Verify button works
- [ ] Download button works
- [ ] Verification results display correctly

**Audit Log Component:**
- [ ] Summary stats display
- [ ] Table loads with entries
- [ ] Filters work (event type, time range)
- [ ] Refresh button works
- [ ] Export button works
- [ ] No PHI visible in logs

### Test Responsive Design

1. Open DevTools (F12)
2. Click device toolbar icon (Cmd+Shift+M)
3. Test different screen sizes:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1920px)

**✅ Success**: UI adapts to all screen sizes

---

## 🐛 Common Issues & Fixes

### Issue: Backend won't start

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Fix**:
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### Issue: Frontend won't start

**Error**: `Module not found` or dependency errors

**Fix**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: Port already in use

**Error**: `Address already in use` (port 8000 or 3000)

**Fix**:
```bash
# Kill process on port 8000 (backend)
lsof -ti:8000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### Issue: CORS errors in browser

**Error**: `Access to fetch blocked by CORS policy`

**Fix**: Check `backend/app/main.py` CORS settings:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Make sure this matches
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: Encryption/decryption fails

**Check browser console for errors**

**Fix**: Clear browser cache and localStorage:
```javascript
// In browser console (F12)
localStorage.clear();
location.reload();
```

### Issue: nilAI connection fails

**Expected**: Demo works without nilAI (uses simulated responses)

**To connect real nilAI**:
```bash
# In separate terminal
cd ../NIL/nilAI
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Update backend/.env
NILAI_API_URL=http://localhost:8001
```

---

## 📊 Performance Testing

### Test Response Times

**Monitor in browser:**
1. Open Network tab in DevTools (F12)
2. Send a medical query
3. Check request timing:
   - Should be <3 seconds total
   - Encryption overhead <100ms

### Test Multiple Queries

Send 5-10 queries in succession:
- [ ] All complete successfully
- [ ] No memory leaks (check browser Task Manager)
- [ ] Audit log updates correctly

### Test Concurrent Users (Optional)

```bash
# Install artillery (load testing tool)
npm install -g artillery

# Create test script
cat > load-test.yml << EOF
config:
  target: "http://localhost:8000"
  phases:
    - duration: 60
      arrivalRate: 5
scenarios:
  - name: "Medical Query"
    flow:
      - post:
          url: "/api/medical/query"
          json:
            encrypted_query: "test"
            encryption_metadata: {}
            session_id: "load_test"
            request_attestation: false
EOF

# Run test
artillery run load-test.yml
```

---

## ✅ Pre-Deployment Checklist

Before deploying to Vercel, ensure:

### Backend
- [ ] All endpoints return 200 OK
- [ ] No errors in logs
- [ ] Audit logging works
- [ ] Environment variables configured
- [ ] Requirements.txt up to date

### Frontend
- [ ] No console errors
- [ ] All features work (chat, attestation, audit)
- [ ] Encryption toggle works
- [ ] Responsive on mobile
- [ ] Build succeeds: `npm run build`

### Testing
- [ ] Tested without encryption
- [ ] Tested with encryption
- [ ] Verified attestation
- [ ] Checked audit logs
- [ ] Tested all three tabs
- [ ] No PHI in logs confirmed

### Documentation
- [ ] README is accurate
- [ ] Demo script ready
- [ ] Environment variables documented

---

## 🚀 Build Test (Before Vercel Deploy)

### Test Production Build Locally

```bash
cd frontend

# Build production version
npm run build

# Start production server
npm start

# Test at http://localhost:3000
```

**Check for:**
- [ ] Build completes without errors
- [ ] No console warnings
- [ ] All features still work
- [ ] Performance is good

**Fix build errors:**
```bash
# Common fixes
npm run lint
npm run type-check

# Clear cache and rebuild
rm -rf .next
npm run build
```

---

## 🎯 Final Smoke Test (2 minutes)

**Do this right before deploying:**

1. **Start fresh**:
   ```bash
   # Stop all services
   pkill -f uvicorn
   pkill -f next-dev
   
   # Start again
   ./scripts/start-demo.sh
   ```

2. **Test complete flow**:
   - Open http://localhost:3000
   - Enable encryption
   - Send a medical query
   - Switch to TEE Attestation tab
   - Click "Verify Attestation"
   - Switch to Audit Log tab
   - Verify logs show your query
   - Export logs

3. **Check for errors**:
   - Browser console: No errors
   - Backend logs: No errors
   - Network tab: All requests succeed

**✅ All green? You're ready to deploy!**

---

## 📝 Test Results Template

Use this to document your testing:

```markdown
## Test Results - [Date]

### Environment
- OS: macOS
- Python: 3.11.x
- Node: 18.x.x
- Browser: Chrome/Firefox/Safari

### Backend Tests
- [ ] Health check: PASS
- [ ] Medical query: PASS
- [ ] Attestation: PASS
- [ ] Audit logs: PASS

### Frontend Tests
- [ ] Page loads: PASS
- [ ] Encryption toggle: PASS
- [ ] Medical query (unencrypted): PASS
- [ ] Medical query (encrypted): PASS
- [ ] TEE attestation: PASS
- [ ] Audit log viewer: PASS

### Integration Tests
- [ ] End-to-end encrypted flow: PASS
- [ ] Attestation verification: PASS
- [ ] Audit log persistence: PASS

### Performance
- Average query time: ___ seconds
- Encryption overhead: ___ ms
- No memory leaks: PASS

### Issues Found
- None / [List any issues]

### Ready for Deployment?
- [x] Yes
- [ ] No - [Reason]
```

---

## 🎬 Next Steps

Once all tests pass:

1. **Document any configuration changes** in `.env` files
2. **Commit your changes** to git (if using version control)
3. **Deploy to Vercel** following deployment guide
4. **Test deployed version** with same checklist
5. **Run demo** with confidence!

---

## 💡 Pro Tips

- **Use two browser windows**: One for testing, one for DevTools
- **Keep terminals visible**: Watch for errors in real-time
- **Test in incognito**: Ensures clean state without cache
- **Test different browsers**: Chrome, Firefox, Safari
- **Document weird behaviors**: Note anything unusual
- **Take screenshots**: Useful for demo prep

**You're now ready to test everything locally before deploying! 🚀**
