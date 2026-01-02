# NILLION MEDICAL AI DEMO - PROJECT STRUCTURE
*Created: December 26, 2025*

## 📁 Recommended Organization

```
DEMO PROJECT/
├── README.md                           # Main project documentation
├── PROJECT_STRUCTURE.md                # This file
├── .env.example                        # Environment template
├── .gitignore                          # Git ignore rules
│
├── frontend/                           # Next.js Application
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx               # Main medical form
│   │   │   ├── layout.tsx
│   │   │   └── api/
│   │   │       └── proxy/             # Backend proxy routes
│   │   │           └── route.ts
│   │   ├── components/
│   │   │   ├── PatientForm.tsx
│   │   │   ├── AttestationViewer.tsx
│   │   │   ├── AuditLog.tsx
│   │   │   └── ComplianceBadge.tsx
│   │   ├── lib/
│   │   │   ├── encryption.ts          # blindfold integration
│   │   │   ├── nilai-client.ts        # nilAI wrapper
│   │   │   └── audit.ts               # Logging utilities
│   │   └── types/
│   │       └── index.ts
│   └── public/
│       └── compliance-docs/
│
├── backend/                            # Python FastAPI (optional)
│   ├── main.py                        # FastAPI app
│   ├── requirements.txt
│   ├── routes/
│   │   └── nilai_proxy.py
│   └── utils/
│       ├── encryption.py              # Python blindfold
│       └── audit.py
│
├── nillion-deps/                       # Nillion Dependencies (symlinks)
│   ├── blindfold-ts/                  # → from NIL/blindfold-ts
│   ├── blindfold-py/                  # → from NIL/blindfold-py
│   └── nilai-examples/                # → from NIL/blind-module-examples/nilai
│
├── docs/                               # Documentation
│   ├── DEPLOYMENT.md
│   ├── COMPLIANCE.md
│   ├── API_REFERENCE.md
│   └── DEMO_SCRIPT.md
│
├── scripts/                            # Automation
│   ├── setup.sh                       # One-command setup
│   ├── start-dev.sh                   # Start all services
│   ├── deploy-vercel.sh               # Deploy to Vercel
│   └── test-compliance.sh             # Run compliance tests
│
└── tests/                              # Testing
    ├── e2e/
    ├── integration/
    └── compliance/

```

## 🔗 What Needs to Be Migrated

### From `/Users/powerfan/Desktop/beast/NIL/`:

1. **blindfold-ts** (Already tested ✅)
   - Location: `NIL/blindfold-ts/`
   - Action: Symlink or copy
   - Used for: Client-side encryption

2. **blindfold-py** (Already tested ✅)
   - Location: `NIL/blindfold-py/`
   - Action: Symlink or copy
   - Used for: Backend encryption (if using Python backend)

3. **nilAI Examples**
   - Location: `NIL/blind-module-examples/nilai/`
   - Action: Reference for nilAI integration
   - Used for: nilAI client setup patterns

4. **Documentation**
   - Location: `NIL/nillion-docs/`
   - Action: Keep reference (symlink)
   - Used for: API reference

### NOT Needed:
- ❌ nilchain (blockchain - not needed for demo)
- ❌ nildb (not using storage for this demo)
- ❌ nilauth (using simpler auth)
- ❌ nilcc (nilAI already uses TEE)
- ❌ Test reports/matrices

## 🚀 Setup Strategy

### Option 1: Symlinks (Recommended for Development)
**Pros:** 
- Changes in NIL/ reflect immediately
- No duplication
- Easy to update

**Cons:**
- Requires NIL/ to stay in place

### Option 2: Copy Dependencies
**Pros:**
- Self-contained project
- Can be moved anywhere
- Clean separation

**Cons:**
- No automatic updates
- Larger project size

### Option 3: npm/pip Packages
**Pros:**
- Production-ready
- Version controlled
- Standard approach

**Cons:**
- Need to publish packages first
- Less flexible for development

## 📋 Recommended Approach

**For Demo Development:**
1. Use symlinks to `blindfold-ts` and `blindfold-py`
2. Copy nilAI example code patterns (not whole repo)
3. Build frontend/backend from scratch in new structure
4. Keep NIL/ as reference documentation

**For Production Deployment:**
1. Install blindfold from npm/pip
2. Bundle necessary code
3. Deploy frontend to Vercel
4. Deploy backend to cloud TEE (Azure Confidential VM)

## 🎯 Quick Start Commands

```bash
# Navigate to demo project
cd "/Users/powerfan/Desktop/DEMO PROJECT"

# Create symlinks to dependencies
ln -s /Users/powerfan/Desktop/beast/NIL/blindfold-ts nillion-deps/blindfold-ts
ln -s /Users/powerfan/Desktop/beast/NIL/blindfold-py nillion-deps/blindfold-py
ln -s /Users/powerfan/Desktop/beast/NIL/blind-module-examples/nilai nillion-deps/nilai-examples

# Initialize frontend
cd frontend
npm init -y
npm install next@latest react@latest react-dom@latest typescript @types/react
npm install openai @nillion/secretvaults

# Initialize backend (optional)
cd ../backend
python3 -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn python-multipart cryptography

# Start development
cd ..
./scripts/start-dev.sh
```

## 🏗️ Build Phases

### Phase 1: Core Demo (2-3 hours)
- [ ] Create Next.js frontend
- [ ] Build patient form UI
- [ ] Integrate blindfold encryption
- [ ] Connect to nilAI
- [ ] Display results

### Phase 2: Compliance Features (2-3 hours)
- [ ] Add attestation viewer
- [ ] Implement audit logging
- [ ] Add compliance badges
- [ ] Create documentation

### Phase 3: Polish & Deploy (2-3 hours)
- [ ] Error handling
- [ ] Loading states
- [ ] Responsive design
- [ ] Deploy to Vercel
- [ ] Create demo script

## 📝 Environment Variables Needed

```bash
# .env.example
NILLION_API_KEY=your_api_key_here
NILAI_BASE_URL=https://nilai.nillion.network/v1
NILAI_MODEL=meta-llama/Llama-3.3-70B-Instruct

# For local development
NILAI_LOCAL_URL=http://localhost:8000
USE_LOCAL_NILAI=true

# Authentication (optional)
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

## 🎬 Demo Deployment Options

### Local Demo (Easiest)
- Frontend: http://localhost:3000
- Backend: Python proxy or Next.js API routes
- nilAI: Testnet (https://nilai.nillion.network)

### Cloud Demo (Production)
- Frontend: Vercel (free tier)
- Backend: Vercel serverless functions OR separate FastAPI
- nilAI: Testnet or production

### Full Production
- Frontend: Vercel Pro
- Backend: Azure Confidential VM with nilAI
- Database: Supabase (for audit logs)
- Auth: Clerk or Auth0

