# 🏥 Medical AI Assistant Demo - Architecture Plan

**Project**: HIPAA/SOC2-Compliant Private Medical AI Assistant  
**Status**: Ready to Build  
**Date**: December 26, 2025

---

## 🎯 Project Overview

Building a production-ready medical AI assistant that demonstrates Nillion's privacy-preserving infrastructure with:
- ✅ Real client-side encryption using blindfold
- ✅ Private LLM inference via nilAI
- ✅ TEE attestation proof
- ✅ HIPAA-compliant audit logging
- ✅ Professional medical UI
- ✅ Deployable locally + Vercel frontend

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js + TypeScript)                            │
│  - React medical UI components                              │
│  - blindfold-ts client-side encryption                      │
│  - TEE attestation verification                             │
│  - Audit log viewer                                         │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTPS (encrypted payload)
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND API (FastAPI + Python)                             │
│  - Medical query router                                     │
│  - nilAI proxy (LLM inference)                              │
│  - Audit logger (HIPAA compliant)                           │
│  - TEE attestation service                                  │
└────────────────┬────────────────────────────────────────────┘
                 │ Encrypted data
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  NILLION INFRASTRUCTURE                                     │
│  - nilAI: Private LLM (Llama 3.2-1B)                        │
│  - nilai-attestation: TEE proof                             │
│  - PostgreSQL: Encrypted storage                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Encryption**: blindfold-ts (from NIL/blindfold-ts)
- **UI**: Tailwind CSS + shadcn/ui components
- **State**: React hooks + localStorage for keys
- **Deployment**: Vercel

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Encryption**: blindfold-py (from NIL/blindfold-py)
- **LLM Service**: nilAI API (from NIL/nilAI)
- **Database**: PostgreSQL (encrypted storage)
- **Audit**: Structured JSON logging
- **Deployment**: Docker Compose

### Infrastructure
- **Privacy**: Nillion nilAI + TEE
- **Attestation**: nilai-attestation service
- **Database**: PostgreSQL with encrypted columns
- **Monitoring**: JSON audit logs (HIPAA-compliant)

---

## 📁 Project Structure

```
medical-ai-demo/
├── frontend/                    # Next.js application
│   ├── src/
│   │   ├── app/                # App router pages
│   │   │   ├── page.tsx       # Medical chat interface
│   │   │   ├── audit/         # Audit log viewer
│   │   │   └── attestation/   # TEE verification
│   │   ├── components/         # React components
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── EncryptionStatus.tsx
│   │   │   ├── AttestationProof.tsx
│   │   │   └── AuditLog.tsx
│   │   ├── lib/               # Utilities
│   │   │   ├── encryption.ts  # blindfold-ts wrapper
│   │   │   ├── api.ts         # Backend API client
│   │   │   └── attestation.ts # TEE verification
│   │   └── types/             # TypeScript types
│   ├── public/                # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.ts
│
├── backend/                     # FastAPI application
│   ├── app/
│   │   ├── main.py            # FastAPI app
│   │   ├── routers/           # API endpoints
│   │   │   ├── medical.py     # Medical query endpoint
│   │   │   ├── attestation.py # TEE attestation
│   │   │   └── audit.py       # Audit log retrieval
│   │   ├── services/          # Business logic
│   │   │   ├── encryption.py  # blindfold-py wrapper
│   │   │   ├── nilai_client.py # nilAI API client
│   │   │   ├── audit_logger.py # HIPAA logging
│   │   │   └── attestation_service.py
│   │   ├── models/            # Pydantic models
│   │   │   ├── medical.py
│   │   │   ├── audit.py
│   │   │   └── attestation.py
│   │   └── db/                # Database
│   │       ├── models.py      # SQLAlchemy models
│   │       └── session.py     # DB connection
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── docs/                        # Documentation
│   ├── SETUP.md               # Installation instructions
│   ├── DEMO_SCRIPT.md         # Presentation guide
│   ├── ARCHITECTURE.md        # Technical details
│   ├── COMPLIANCE.md          # HIPAA/SOC2 notes
│   └── API.md                 # API documentation
│
├── scripts/                     # Automation scripts
│   ├── setup.sh               # One-command setup
│   ├── start-demo.sh          # Launch all services
│   ├── stop-demo.sh           # Stop all services
│   └── generate-test-data.py  # Sample medical queries
│
├── docker-compose.yml          # Multi-service orchestration
├── .env.example               # Environment template
└── README.md                  # Main documentation
```

---

## 🔐 Security & Privacy Features

### 1. Client-Side Encryption
- Patient data encrypted in browser using blindfold-ts
- Encryption keys never leave client device
- Server only processes ciphertext

### 2. TEE Attestation
- Proof that code runs in Trusted Execution Environment
- Verifiable attestation reports
- Real-time attestation verification in UI

### 3. Audit Logging (HIPAA-Compliant)
- Every API call logged with:
  - Timestamp (ISO 8601)
  - User ID (hashed)
  - Action performed
  - Data accessed (encrypted IDs only)
  - TEE attestation hash
- Tamper-proof structured logs
- Queryable audit trail

### 4. Data Minimization
- Only necessary fields transmitted
- No PHI in logs (only encrypted references)
- Automatic data retention policies

---

## 🏥 Medical Use Cases

### Primary Scenario: Symptom Checker
```
Patient Input: "I have chest pain and shortness of breath"
  ↓ Encrypted client-side
Backend: Forwards encrypted query to nilAI
  ↓ Encrypted processing
nilAI: Private inference on Llama 3.2-1B
  ↓ Encrypted response
Patient: Receives decrypted medical advice
  ↓ Audit logged
System: Records interaction (encrypted refs only)
```

### Additional Scenarios
1. **Medication Interaction Check**: Query drug interactions privately
2. **Lab Result Interpretation**: Upload encrypted lab results
3. **Medical History Analysis**: Private analysis of patient records
4. **Care Recommendations**: Personalized treatment suggestions

---

## 📋 Implementation Phases

### Phase 1: Backend API (Day 1)
- ✅ FastAPI server setup
- ✅ nilAI integration (proxy to NIL/nilAI)
- ✅ blindfold-py encryption wrapper
- ✅ PostgreSQL database
- ✅ Audit logging service
- ✅ TEE attestation endpoint

### Phase 2: Frontend UI (Day 2)
- ✅ Next.js + Tailwind setup
- ✅ Medical chat interface
- ✅ blindfold-ts client encryption
- ✅ Encryption status indicator
- ✅ Attestation verification UI
- ✅ Audit log viewer

### Phase 3: Integration (Day 3)
- ✅ End-to-end encryption flow
- ✅ Real nilAI inference
- ✅ TEE attestation verification
- ✅ Audit log persistence
- ✅ Error handling

### Phase 4: Documentation & Demo (Day 4)
- ✅ Comprehensive README
- ✅ Setup instructions
- ✅ Demo script for presentations
- ✅ Architecture diagrams
- ✅ Compliance documentation

---

## 🚀 Deployment

### Local Development
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev

# nilAI (from NIL folder)
cd ../NIL/nilAI
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Production
```bash
# One-command deployment
./scripts/setup.sh
./scripts/start-demo.sh
```

### Vercel Frontend
```bash
cd frontend
vercel deploy --prod
```

---

## 📊 Success Metrics

### Functional Requirements
- ✅ Encrypts patient data client-side
- ✅ Sends encrypted data to backend
- ✅ Processes via nilAI (private inference)
- ✅ Returns encrypted response
- ✅ Decrypts on client only
- ✅ Shows TEE attestation proof
- ✅ Logs all operations (HIPAA-compliant)

### Non-Functional Requirements
- ⚡ Response time: <3s per query
- 🔒 Encryption overhead: <100ms
- 📝 100% audit coverage
- 🎯 Zero PHI leakage in logs
- 💪 Handles 10 concurrent users

---

## 🎬 Demo Script Highlights

### 1. Opening (30 seconds)
"This is a HIPAA-compliant medical AI assistant where patient data is encrypted before it even leaves your browser."

### 2. Encryption Demo (1 minute)
- Type medical query
- Show encryption happening in real-time
- Highlight: "Server never sees plaintext"

### 3. TEE Attestation (1 minute)
- Click attestation tab
- Show cryptographic proof
- Explain: "Code runs in secure enclave"

### 4. Audit Logging (1 minute)
- Open audit log viewer
- Show timestamped operations
- Highlight: "HIPAA-compliant tamper-proof logs"

### 5. Response (30 seconds)
- Receive encrypted response
- Decrypt locally
- Show medical advice

**Total Demo**: 4 minutes

---

## 🔗 Using Existing NIL Components

### From NIL/blindfold-py
- Encryption/decryption functions
- Key generation utilities
- Already tested and working

### From NIL/blindfold-ts
- TypeScript encryption library
- 32/32 tests passing
- Ready for frontend integration

### From NIL/nilAI
- LLM inference API
- TEE attestation service
- Docker Compose setup
- HuggingFace token configured

### From NIL Testing Scripts
- Privacy validation patterns
- Encryption test cases
- Audit logging examples

---

## 🎯 Next Steps

1. **Create Backend Structure**: FastAPI app with nilAI proxy
2. **Build Frontend**: Next.js medical UI
3. **Integrate Encryption**: blindfold-ts/py wrappers
4. **Add Attestation**: TEE verification
5. **Implement Audit**: HIPAA-compliant logging
6. **Document**: README + demo script

---

## ✅ Ready to Build

All dependencies tested and working:
- ✅ Python 3.11 environment with torch/transformers
- ✅ Python 3.14 environment with blindfold/cryptography
- ✅ blindfold-py: Homomorphic encryption verified
- ✅ blindfold-ts: 32/32 tests passing
- ✅ nilAI: Docker Compose configured
- ✅ HuggingFace token: Set in nilAI/.env

**Let's build! 🚀**
