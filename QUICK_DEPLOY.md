# Quick Deploy to Vercel - Step by Step

## **Your GitHub Repo:**
https://github.com/rxsanthosh888-hub/sewerguard

---

## **Step 1: Go to Vercel**
Open: https://vercel.com/dashboard

---

## **Step 2: Deploy Backend**

1. Click **"Add New"** → **"Project"**
2. Click **"Import Git Repository"**
3. Paste your repo URL: `https://github.com/rxsanthosh888-hub/sewerguard.git`
4. Configure:
   - **Project Name:** `sewerguard-backend`
   - **Root Directory:** `backend`
   - **Framework:** `Node.js`
5. Click **"Environment Variables"** and add:
   - `JWT_SECRET` = `sewerguard_super_secret_jwt_key_2024_enterprise`
   - `NODE_ENV` = `production`
6. Click **"Deploy"**
7. Wait 3-5 minutes
8. **Copy the URL** (e.g., `https://sewerguard-backend.vercel.app`)

---

## **Step 3: Deploy Frontend**

1. Click **"Add New"** → **"Project"** again
2. Click **"Import Git Repository"**
3. Select the same repo
4. Configure:
   - **Project Name:** `sewerguard-frontend`
   - **Root Directory:** `frontend`
   - **Framework:** `Vite`
   - **Build Command:** `npm run build`
5. Click **"Environment Variables"** and add:
   - `VITE_API_URL` = `https://sewerguard-backend.vercel.app` (from Step 2)
6. Click **"Deploy"**
7. Wait 3-5 minutes
8. **Copy the Frontend URL** (e.g., `https://sewerguard-frontend.vercel.app`)

---

## **Step 4: Your Public URLs**

After deployment:
- **Frontend:** `https://sewerguard-frontend.vercel.app/login`
- **Backend:** `https://sewerguard-backend.vercel.app`

---

## **Step 5: Update ESP32**

The ESP32 code is already updated to:
```
https://sewerguard-backend.vercel.app/api/sensors/ingest
```

Just upload the code to your ESP32.

---

## **Test It**

1. Open: `https://sewerguard-frontend.vercel.app/login`
2. Login: `admin@sewerguard.com` / `admin123`
3. You should see the dashboard!

---

**Done! Your app is now public on the internet!** 🚀
