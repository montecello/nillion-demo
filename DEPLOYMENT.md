# Deployment Guide

## Architecture
- **Frontend (Next.js + blindfold-ts)**: Vercel
- **Backend (Python + blindfold-py)**: Railway

## Step 1: Deploy Backend to Railway

1. Go to https://railway.app/
2. Click "Start a New Project" → "Deploy from GitHub repo"
3. Select `montecello/nillion-demo`
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables:
   - `NILLION_API_KEY`: (your key from https://subscription.nillion.com/)
   - `NILAI_API_URL`: `https://nilai-a779.nillion.network/v1`
6. Deploy and copy your Railway app URL (e.g., `https://nillion-demo.railway.app`)

## Step 2: Deploy Frontend to Vercel

1. Go to https://vercel.com/new
2. Import `montecello/nillion-demo`
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: `https://YOUR-RAILWAY-URL.railway.app`
5. Deploy!

## Step 3: Test

1. Visit your Vercel URL: `https://nillion-demo.vercel.app`
2. Submit a medical query
3. Check that:
   - Frontend encrypts with blindfold-ts (client-side)
   - Backend receives encrypted data
   - Backend encrypts again with blindfold-py (server-side)
   - nilAI processes in TEE
   - Response returns encrypted and decrypts client-side

## Done! 🎉

You now have:
- ✅ Client-side encryption (blindfold-ts)
- ✅ Server-side encryption (blindfold-py)
- ✅ TEE-based LLM inference (nilAI)
- ✅ Full Nillion privacy stack
- ✅ Deployed on Vercel + Railway
