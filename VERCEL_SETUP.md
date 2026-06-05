# Manual Vercel Deployment Setup

Since automated deployment requires GitHub Actions secrets, here's the easiest manual way:

---

## **Phase 1: Deploy Backend**

### Step 1: Go to Vercel Dashboard
- URL: https://vercel.com/dashboard
- Click "Add New" → "Project"

### Step 2: Import Git Repository
- Click "Import Git Repository"
- Search for: `sewerguard`
- Click on the repository

### Step 3: Configure Backend
Fill in these values:
- **Project Name:** `sewerguard-backend`
- **Root Directory:** `backend` (click the dropdown and select it)
- **Framework:** `Node.js`
- **Build Command:** (leave empty - Vercel auto-detects)
- **Output Directory:** (leave empty)

### Step 4: Environment Variables
Expand "Environment Variables" section and add:
- **Name:** `JWT_SECRET`
  **Value:** `sewerguard_super_secret_jwt_key_2024_enterprise`

- **Name:** `NODE_ENV`
  **Value:** `production`

### Step 5: Deploy
- Click "Deploy"
- Wait 2-3 minutes for build to complete
- **Copy the URL** from the success screen (e.g., `https://sewerguard-backend.vercel.app`)

---

## **Phase 2: Deploy Frontend**

### Step 1: Go back to Vercel Dashboard
- Click "Add New" → "Project"

### Step 2: Import Git Repository
- Click "Import Git Repository"
- Select `sewerguard` again

### Step 3: Configure Frontend
Fill in these values:
- **Project Name:** `sewerguard-frontend`
- **Root Directory:** `frontend` (click the dropdown and select it)
- **Framework:** `Vite`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Step 4: Environment Variables
Expand "Environment Variables" section and add:
- **Name:** `VITE_API_URL`
  **Value:** Paste your backend URL from Phase 1
  (Example: `https://sewerguard-backend.vercel.app`)

### Step 5: Deploy
- Click "Deploy"
- Wait 2-3 minutes for build to complete
- **Copy the Frontend URL** (e.g., `https://sewerguard-frontend.vercel.app`)

---

## **Phase 3: Test Deployment**

### Test Frontend:
1. Open: `https://sewerguard-frontend.vercel.app/login`
2. Login with: `admin@sewerguard.com` / `admin123`
3. You should see the admin dashboard

### Test Backend:
```bash
curl https://sewerguard-backend.vercel.app/health
```
Should return:
```json
{"status":"OK","message":"SewerGuard API Running","timestamp":"..."}
```

### Test ESP32 Connection:
1. Upload the updated ESP32 code (it now has the new Vercel backend URL)
2. Monitor Serial output (115200 baud)
3. Should see: `[HTTP] ✅ Data sent successfully!`

---

## **Troubleshooting**

If you get **"404: DEPLOYMENT_NOT_FOUND"** on frontend:
- The Vercel project hasn't finished building yet
- Wait 5 minutes and try again
- Check Vercel dashboard for build status

If frontend **can't connect to backend**:
- Make sure `VITE_API_URL` environment variable is exactly the backend URL
- Trigger a redeploy in Vercel (Settings → Deployments → Redeploy)

If ESP32 **can't reach server**:
- Make sure the Vercel backend project has deployed successfully
- Check that WiFi credentials in ESP32 code are correct
- Test backend URL in browser first

---

## **Done!** 🎉

You now have:
- ✅ Frontend hosted on Vercel
- ✅ Backend API hosted on Vercel
- ✅ ESP32 configured to use Vercel URLs
- ✅ Permanent hosting (no more URL changes)

Anytime you push code to `main` branch, you can redeploy manually from Vercel dashboard.
