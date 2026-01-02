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
- ✅ **Server-side encryption** (blindfold-py encryption library)
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
│  User Browser                                   │
│  • Patient data input                           │
│  • Tailwind CSS UI                              │
│  • JavaScript API calls                         │
└──────────────────┬──────────────────────────────┘
                   │ HTTPS (encrypted)
                   ▼
┌─────────────────────────────────────────────────┐
│  FastAPI Backend (Python Monolith)              │
│  • Jinja2 template rendering                    │
│  • Request validation                           │
│  • blindfold-py server-side encryption          │
│  • Audit logging                                │
│  • nilAI proxy                                  │
└──────────────────┬──────────────────────────────┘
                   │ Encrypted request
                   ▼
┌─────────────────────────────────────────────────┐
│  nilAI (Nillion's Private LLM Service)          │
│  • TEE execution (AMD SEV-SNP)                  │
│  • google/gemma-3-27b-it model                  │
│  • Zero data retention                          │
│  • Attestation generation                       │
└─────────────────────────────────────────────────┘
```

## 📋 Tech Stack

### Frontend
- **Jinja2 HTML Templates** (server-side rendering)
- **Tailwind CSS** (CDN)
- **Vanilla JavaScript**

### Backend
- **FastAPI** (Python web framework)
- **blindfold-py** (Nillion encryption)
- **uvicorn** (ASGI server)

### Nillion Services
- **nilAI** - Private LLM inference
- **blindfold** - Server-side encryption
- **TEE** - Hardware security guarantees

## 🚀 Quick Start

### Prerequisites
- Python 3.10+ 
- Nillion API key ([get one here](https://subscription.nillion.com/))

### Setup (5 minutes)

```bash
# 1. Clone repository
git clone https://github.com/montecello/nillion-demo.git
cd nillion-demo

# 2. Configure environment
cd backend
cp .env.example .env
# Edit .env with your NILLION_API_KEY

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 5. Open browser
open http://localhost:8000
```

## 📁 Project Structure

```
nillion-demo/
├── backend/            # FastAPI Python monolith
│   ├── app/
│   │   ├── main.py             # FastAPI app entry point
│   │   ├── routers/            # API endpoints
│   │   ├── services/           # Encryption, nilAI client
│   │   ├── templates/          # Jinja2 HTML templates
│   │   └── models/             # Pydantic models
│   └── requirements.txt
├── frontend/           # (Legacy Next.js, not deployed)
├── docs/               # Documentation
└── tests/              # Compliance & E2E tests
```

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed organization.

## 🎬 Demo Flow

1. **Patient Data Entry**
   - User enters: name, medical ID, symptoms
   - Data validated client-side

2. **Encryption**
   - blindfold-py encrypts data on the server
   - Status shown in audit logs

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
- **Setup**: `uvicorn app.main:app --reload --port 8000`

### Option 2: Railway/Render (Recommended)
- **Time**: 10 minutes
- **Cost**: Free tier available
- **Use Case**: Demo presentations
- **Setup**: Connect GitHub repo, Railway auto-deploys

### Option 3: Full Production
- **Time**: 1-2 hours
- **Cost**: Variable (cloud hosting)
- **Use Case**: Production deployment
- **Setup**: See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 🧪 Testing

```bash
# Test the API endpoints
curl http://localhost:8000/health

# Submit a medical query
curl -X POST http://localhost:8000/api/medical/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What are treatments for diabetes?", "patient_id": "demo_123"}'

# View audit logs
curl http://localhost:8000/api/audit/logs
```

## 📚 Documentation

- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Detailed project organization
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - Deployment guide
- [docs/COMPLIANCE.md](docs/COMPLIANCE.md) - SOC2/HIPAA details
- [docs/API_REFERENCE.md](docs/API_REFERENCE.md) - API documentation
- [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) - Presentation guide

## 🛠️ Development Commands

```bash
# Install dependencies
pip install -r backend/requirements.txt

# Start development server
cd backend
uvicorn app.main:app --reload --port 8000

# Run with specific Python
python -m uvicorn app.main:app --reload --port 8000

# Check encryption works
python -c "import blindfold; print('✓ blindfold-py loaded')"
```

## 🌐 Live Demo

**Repository**: https://github.com/montecello/nillion-demo
**Deployment**: Coming soon (Railway/Render)

## 🤝 Support

- **Nillion Docs**: https://docs.nillion.com/
- **Discord**: https://discord.com/invite/nillionnetwork
- **GitHub**: https://github.com/NillionNetwork

## 📝 License

MIT License - See LICENSE file

---

**Built with Nillion** - Humanity's first blind computer 🔐
