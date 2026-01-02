# Nillion API Key Setup Guide

## Overview
Your medical AI demo currently runs **without encryption** (placeholder mode). Once you get your Nillion API key, it will connect to the real **nilAI TEE** (Trusted Execution Environment) for private LLM inference.

---

## Step 1: Get Your Nillion API Key

### **Subscribe to nilAI Service**
1. Visit: **https://nilpay.vercel.app/**
2. Connect your wallet
3. Subscribe to **nilAI** service (requires NIL tokens)
4. Receive your API key from: **https://subscription.nillion.com/**

### **API Key Format**
Your key will look like:
```
nillion_api_key_abc123xyz789...
```

---

## Step 2: Configure Local Development

### **Create `.env.local` file**
```bash
cd frontend
cp .env.local.example .env.local
```

### **Edit `.env.local`**
```bash
# Nillion API Key (SERVER-SIDE ONLY - never exposed to browser)
NILLION_API_KEY=nillion_api_key_abc123xyz789...

# API URL - Using Next.js API routes (same domain, server-side)
NEXT_PUBLIC_API_URL=/api

# Feature flags
NEXT_PUBLIC_ENABLE_ENCRYPTION=true
NEXT_PUBLIC_ENABLE_ATTESTATION=true
NEXT_PUBLIC_ENABLE_AUDIT_LOG=true
```

### **Test Locally**
```bash
npm run dev
```

Visit `http://localhost:3000` and try a medical query. You should see:
- ✅ Real nilAI responses (instead of mock data)
- ✅ TEE attestation proof
- ✅ Audit logs with encryption metadata

---

## Step 3: Configure Vercel Deployment

### **Add Environment Variable in Vercel Dashboard**

1. Go to: **https://vercel.com/[your-project]/settings/environment-variables**
2. Add variable:
   - **Name**: `NILLION_API_KEY`
   - **Value**: `your_actual_api_key_here`
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development

3. Click **"Save"**

### **Redeploy**
Two options:
- **Option A**: Push any commit to trigger deployment
- **Option B**: In Vercel Dashboard → Deployments → Click "Redeploy"

---

## Security Notes

### **✅ What's Secure**
- `NILLION_API_KEY` has **NO** `NEXT_PUBLIC_` prefix
- It's **server-side only** (API routes in `/api/*`)
- Never sent to browser or visible in client-side code
- Stored securely in Vercel's encrypted environment variables

### **⚠️ What's Public**
- `NEXT_PUBLIC_API_URL=/api` is safe (just tells frontend where API routes are)
- Feature flags are non-sensitive

### **🔒 Best Practices**
- Never commit `.env.local` to git (already in `.gitignore`)
- Rotate API keys periodically
- Use different keys for development/production if possible
- Monitor usage at https://subscription.nillion.com/

---

## Troubleshooting

### **Error: "NILLION_API_KEY not configured"**
- **Local**: Check `.env.local` exists and has correct key
- **Vercel**: Check environment variable is added in dashboard and app is redeployed

### **Error: "Unauthorized" or "Invalid API Key"**
- Verify key is active at https://subscription.nillion.com/
- Check nilAI subscription is active
- Ensure you have sufficient NIL tokens

### **Error: "Network error" or "TEE unavailable"**
- Nillion testnet may be down: https://status.nillion.com/
- Check nilAI endpoint is reachable: `https://nilai-a779.nillion.network/v1`

---

## Current Status

### **Without API Key (Now)**
- ✅ App builds and deploys successfully
- ✅ UI fully functional
- ❌ Real nilAI inference disabled (returns error: "NILLION_API_KEY not configured")
- ❌ TEE attestation shows mock data
- ✅ Audit logging works

### **With API Key (After Setup)**
- ✅ Real LLM inference in AMD SEV-SNP TEE
- ✅ Cryptographic attestation proof
- ✅ Full HIPAA-compliant audit trail
- ✅ Server-side encryption with Nillion SecretVaults

---

## API Endpoints Being Used

| Endpoint | Purpose | Requires API Key |
|----------|---------|------------------|
| `POST /api/medical/query` | Send queries to nilAI TEE | ✅ Yes |
| `GET /api/attestation/proof` | Get TEE attestation | ❌ No (mock) |
| `GET/POST /api/audit/logs` | Audit logging | ❌ No |

**Note**: Once you have the API key, the attestation endpoint can be updated to fetch real TEE proofs from Nillion's attestation service.

---

## Next Steps After Getting API Key

1. **Update local `.env.local`**
2. **Update Vercel environment variables**
3. **Test locally**: `npm run dev`
4. **Test on Vercel**: Visit your deployed URL
5. **Submit demo link** to Nillion team with your API key application
6. **Monitor usage** at https://subscription.nillion.com/

---

## Support

- **Nillion Docs**: https://docs.nillion.com/
- **API Documentation**: https://docs.nillion.com/api/nilai/overview
- **Community**: https://discord.gg/nillionnetwork
- **Status Page**: https://status.nillion.com/
