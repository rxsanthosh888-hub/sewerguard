# SewerGuard - Vercel Deployment Guide

## Overview
This guide sets up permanent hosting for SewerGuard on Vercel (free tier).

---

## Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub, GitLab, or email
3. Create a new team/workspace

---

## Step 2: Push to GitHub
Since Vercel deploys from Git, you need to push this project to GitHub first.

### 2a. Create a GitHub repo
1. Go to https://github.com/new
2. Create a new repository: `sewerguard`
3. Do NOT add README, .gitignore, or license (we already have them)

### 2b. Push your code
```bash
cd d:\sewer_guard\sewerguard

# Configure Git
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Add all files
git add .

# Commit
git commit -m "Initial SewerGuard commit"

# Add GitHub remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/sewerguard.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy Backend to Vercel

### 3a. Create Backend Project
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import from GitHub → Select `sewerguard` repo
4. **Root Directory:** `backend`
5. **Framework:** Node.js
6. Click "Deploy"

**After deployment, you'll get a URL like:**
```
https://sewerguard-backend.vercel.app
```

### 3b. Add Environment Variables
1. Go to your Vercel project settings
2. Click "Environment Variables"
3. Add:
   - `JWT_SECRET` = `sewerguard_super_secret_jwt_key_2024_enterprise`
   - `NODE_ENV` = `production`
4. Click "Save" and redeploy

---

## Step 4: Deploy Frontend to Vercel

### 4a. Create Frontend Project
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import from GitHub → Select `sewerguard` repo
4. **Root Directory:** `frontend`
5. **Framework:** Vite
6. **Build Command:** `npm run build`
7. Click "Deploy"

**After deployment, you'll get a URL like:**
```
https://sewerguard-frontend.vercel.app
```

### 4b. Update Frontend Environment
1. Go to your frontend project settings
2. Click "Environment Variables"
3. Add:
   - `VITE_API_URL` = `https://sewerguard-backend.vercel.app`
4. Click "Save" and redeploy

---

## Step 5: Update ESP32 Code
The ESP32 code has been updated to use the Vercel backend URL:
```cpp
const char* SERVER_URL = "https://sewerguard-backend.vercel.app/api/sensors/ingest";
```

No further changes needed. Compile and upload to your ESP32.

---

## URLs After Deployment

| Component | URL |
|-----------|-----|
| **Frontend** | `https://sewerguard-frontend.vercel.app` |
| **Backend** | `https://sewerguard-backend.vercel.app` |
| **API** | `https://sewerguard-backend.vercel.app/api/*` |
| **ESP32 Ingest** | `https://sewerguard-backend.vercel.app/api/sensors/ingest` |

---

## Testing the Deployment

### 1. Test Frontend
- Open: `https://sewerguard-frontend.vercel.app/login`
- Login with: `admin@sewerguard.com` / `admin123`
- Should see the dashboard

### 2. Test Backend API
```bash
curl https://sewerguard-backend.vercel.app/health
# Should return: {"status":"OK","message":"SewerGuard API Running","timestamp":"..."}
```

### 3. Test ESP32 Connection
- Upload the updated ESP32 code
- Monitor Serial output (115200 baud)
- Should see `[WiFi] ✅ Connected!` and `[HTTP] ✅ Data sent successfully!`

---

## Important Notes

⚠️ **Free Tier Limits:**
- 100 deployments/month
- 6 GB bandwidth/month
- Serverless function cold starts may take 10-15 seconds first time
- Auto-pause after 15 minutes of inactivity (wake on next request)

💡 **Database:**
- Currently using in-memory storage (data resets on deployment)
- For persistent data, connect to Firebase/MongoDB (see backend code comments)

🔐 **Security:**
- Never commit `.env` files with real secrets
- Use Vercel's environment variables for sensitive data
- Update `JWT_SECRET` to a stronger value in production

---

## Troubleshooting

**"Frontend can't connect to backend"**
- Check CORS is enabled (it is in server.js)
- Verify `VITE_API_URL` is set correctly
- Check Vercel logs: Dashboard → Project → Deployments → Logs

**"ESP32 can't reach server"**
- Verify WiFi is connected
- Check WiFi credentials in ESP32 code
- Monitor Serial output for SSL errors
- Make sure `SERVER_URL` is correct (no trailing slash)

**"Vercel build fails"**
- Check build logs in Vercel dashboard
- Ensure `package.json` has correct scripts
- Try: `npm run build` locally first

---

## Next Steps

1. ✅ Push to GitHub
2. ✅ Deploy backend
3. ✅ Deploy frontend
4. ✅ Update ESP32 code
5. ✅ Test all components
6. 🎉 You're live!

---

For support, check:
- Vercel docs: https://vercel.com/docs
- Express docs: https://expressjs.com
- React docs: https://react.dev
