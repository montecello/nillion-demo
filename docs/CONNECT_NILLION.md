# Connecting to Real Nillion nilAI Services

Your demo is currently running in **mock mode**. To use real Nillion Private LLMs:

## Quick Start: Use Nillion's Hosted API (Recommended)

**No Docker needed!** Nillion hosts the nilAI infrastructure for you.

### Step 1: Get NIL Tokens

1. Create Nillion Wallet: https://docs.nillion.com/community/guides/nillion-wallet
2. Get testnet NIL tokens: https://faucet.testnet.nillion.com/

### Step 2: Subscribe to nilAI Service

1. Go to nilPay: https://nilpay.vercel.app/
2. Pay NIL tokens to subscribe to **nilAI (Private LLMs)** service
3. You'll receive a **Nillion API Key**

### Step 3: Configure Your Demo

Update `backend/.env`:

```bash
# Replace this with your actual API key
NILAI_API_URL=https://nilai.nillion.com
NILAI_API_TOKEN=your_actual_nillion_api_key_from_nilpay
ATTESTATION_URL=https://nilai.nillion.com
```

### Step 4: Restart Backend

```bash
# Stop current backend (Ctrl+C in terminal)
# Then restart:
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Now your queries will use **real Nillion Private LLMs** running in TEEs!

---

## Alternative: Run nilAI Locally (Requires Docker)

If you want to run your own nilAI instance:

### Prerequisites
- Docker Desktop installed and running
- GPU recommended for faster inference

### Start nilAI Services

```bash
cd NIL/nilAI

# Start services
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Check status
docker compose ps

# Should see: nilai-api, postgres, redis running
```

### Configure Demo for Local nilAI

Update `backend/.env`:

```bash
NILAI_API_URL=http://localhost:8001
NILAI_API_TOKEN=Nillion2025  # From NIL/nilAI/.env
ATTESTATION_URL=http://localhost:8080
```

### Restart Backend

Same as above - stop and restart the backend service.

---

## Available Models (Testnet)

When using Nillion's hosted API, you can use these models without special access:

- `llama-3.2-1b` ✅ (Default, fastest)
- `llama-3.2-3b` ✅  
- Other models require applying for access: https://docs.nillion.com/build/private-llms/overview#available-models

---

## How It Works

**Without API Key (Current):**
- ❌ Mock responses from backend
- ❌ No real TEE attestation
- ✅ UI works, encryption demo works

**With Nillion API Key:**
- ✅ Real LLM inference in TEEs
- ✅ Cryptographic attestation proofs
- ✅ Your data never leaves encrypted state
- ✅ OpenAI-compatible API

---

## Verify It's Working

Once configured with your API key:

1. Check backend logs: Should say "Initialized nilAI client: https://nilai.nillion.com"
2. Send a medical query
3. Response will come from actual Llama model
4. Check Attestation tab for real TEE proof

---

## Cost

- **Testnet**: Free after getting faucet tokens
- **Mainnet**: Pay NIL tokens per inference call
- API key subscription is time-based (monthly/yearly)

---

## Next Steps

After connecting nilAI, you can also integrate:

1. **blindfold-ts** for better client-side encryption
2. **nilDB** for storing encrypted patient records
3. **nilCC** for custom confidential workloads

See [docs/COMPLIANCE.md](docs/COMPLIANCE.md) for full production deployment checklist.
