# 🏥 SecureMed AI - HIPAA/SOC2 Compliant Medical AI Assistant

A demonstration of **Nillion's privacy-preserving AI technology** for handling sensitive medical data with SOC2/HIPAA compliance guarantees.

## 🎯 Purpose

This demo showcases how Nillion's **nilAI** (Trusted Execution Environment-based LLM) can:
- Process sensitive medical data privately
- Provide cryptographic proof of secure execution
- Meet SOC2/HIPAA compliance requirements
- Deploy to production (Vercel + cloud TEE)

## ✨ Key Features

### Privacy & Security
- ✅ **Client-side encryption** (blindfold encryption library)
- ✅ **TEE execution** (AMD SEV-SNP hardware security)
- ✅ **Zero data logging** (queries never stored)
- ✅ **Cryptographic attestation** (proof of secure execution)

### Compliance
- ✅ **Audit logging** (all queries tracked with timestamps)
- ✅ **Access controls** (authentication ready)
- ✅ **Data encryption** (at rest and in transit)
- ✅ **Attestation proofs** (verifiable security)

### User Experience
- 🎨 Professional medical UI
- ⚡ Real-time AI responses
- 📊 Compliance dashboard
- 🔐 Transparent security indicators

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│  User Browser (Next.js Frontend)                │
│  • Patient data input                           │
│  • Client-side encryption (blindfold)           │
│  • Compliance UI                                │
└──────────────────┬──────────────────────────────┘
                   │ HTTPS (encrypted)
                   ▼
┌─────────────────────────────────────────────────┐
│  Backend API (Next.js API Routes or FastAPI)    │
│  • Request validation                           │
│  • Audit logging                                │
│  • nilAI proxy                                  │
└──────────────────┬──────────────────────────────┘
                   │ Encrypted request
                   ▼
┌─────────────────────────────────────────────────┐
│  nilAI (Nillion's Private LLM Service)          │
│  • TEE execution (AMD SEV-SNP)                  │
│  • Llama 3.3 70B model                          │
│  • Zero data retention                          │
│  • Attestation generation                       │
└─────────────────────────────────────────────────┘
```

## 📋 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **blindfold-ts** (encryption)
- **OpenAI SDK** (nilAI client)

### Backend
- **Next.js API Routes** (primary)
- **FastAPI** (alternative Python backend)

### Nillion Services
- **nilAI** - Private LLM inference
- **blindfold** - Client-side encryption
- **TEE** - Hardware security guarantees

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.11+ (for backend, optional)
- Nillion API key ([get one here](https://subscription.nillion.com/))

### Setup (5 minutes)

```bash
# 1. Clone and setup
cd "/Users/powerfan/Desktop/DEMO PROJECT"

# 2. Setup dependencies (symlinks)
./scripts/setup.sh

# 3. Configure environment
cp .env.example .env
# Edit .env with your NILLION_API_KEY

# 4. Install and run frontend
cd frontend
npm install
npm run dev

# 5. Open browser
open http://localhost:3000
```

## 📁 Project Structure

```
DEMO PROJECT/
├── frontend/           # Next.js app (main UI)
├── backend/            # FastAPI (optional Python backend)
├── nillion-deps/       # Symlinks to Nillion repos
├── docs/               # Documentation
├── scripts/            # Automation scripts
└── tests/              # Compliance & E2E tests
```

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed organization.

## 🎬 Demo Flow

1. **Patient Data Entry**
   - User enters: name, medical ID, symptoms
   - Data validated client-side

2. **Encryption**
   - blindfold encrypts data before transmission
   - Status shown in UI

3. **Private AI Processing**
   - Request sent to nilAI via TEE
   - Llama 3.3 70B processes query
   - No data logging

4. **Attestation & Results**
   - Cryptographic proof of TEE execution
   - AI diagnosis/recommendations displayed
   - Audit log updated

5. **Compliance Dashboard**
   - View all queries with timestamps
   - Check attestation proofs
   - Export compliance reports

## 🔐 SOC2/HIPAA Compliance

### Access Controls
- Authentication via Clerk/Auth0 (ready to integrate)
- Multi-factor authentication support
- Role-based access control

### Encryption
- **In Transit**: TLS 1.3 (HTTPS)
- **At Rest**: blindfold encryption
- **In Processing**: TEE (AMD SEV-SNP)

### Audit & Monitoring
- All queries logged with:
  - Timestamp
  - User ID
  - Query hash
  - Attestation proof
  - Response time

### Data Isolation
- User sessions isolated
- No cross-tenant data access
- Memory encryption in TEE

## 📊 Demo Deployment Options

### Option 1: Local Development
- **Time**: 5 minutes
- **Cost**: Free
- **Use Case**: Development & testing
- **Setup**: `npm run dev`

### Option 2: Vercel (Frontend Only)
- **Time**: 10 minutes
- **Cost**: Free tier available
- **Use Case**: Demo presentations
- **Setup**: `vercel deploy`

### Option 3: Full Production
- **Time**: 1-2 hours
- **Cost**: Variable (Azure VM + Vercel)
- **Use Case**: Production deployment
- **Setup**: See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 🧪 Testing

```bash
# Run compliance tests
npm run test:compliance

# E2E tests
npm run test:e2e

# Integration tests
npm run test:integration
```

## 📚 Documentation

- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Detailed project organization
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - Deployment guide
- [docs/COMPLIANCE.md](docs/COMPLIANCE.md) - SOC2/HIPAA details
- [docs/API_REFERENCE.md](docs/API_REFERENCE.md) - API documentation
- [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) - Presentation guide

## 🛠️ Development Scripts

```bash
# Setup everything
./scripts/setup.sh

# Start all services
./scripts/start-dev.sh

# Deploy to Vercel
./scripts/deploy-vercel.sh

# Run compliance checks
./scripts/test-compliance.sh
```

## 🌐 Live Demo

**Coming Soon:** https://securemed-demo.vercel.app

## 🤝 Support

- **Nillion Docs**: https://docs.nillion.com/
- **Discord**: https://discord.com/invite/nillionnetwork
- **GitHub**: https://github.com/NillionNetwork

## 📝 License

MIT License - See LICENSE file

---

**Built with Nillion** - Humanity's first blind computer 🔐
