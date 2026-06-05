# SewerGuard - Local Development Setup

This guide helps you run the entire SewerGuard app on your computer locally.

---

## **Prerequisites**

Make sure you have installed:
1. **Node.js v18+** — Download from https://nodejs.org/
2. **npm v9+** (comes with Node.js)

Verify installation:
```bash
node --version
npm --version
```

---

## **Project Structure**

```
sewerguard/
├── backend/              ← Node.js + Express API
│   ├── config/db.js      ← In-memory database
│   ├── middleware/auth.js ← JWT authentication
│   ├── routes/           ← API endpoints
│   ├── server.js         ← Main server file
│   ├── package.json
│   └── .env              ← Environment variables
│
├── frontend/             ← React + Vite app
│   ├── src/
│   │   ├── pages/        ← Dashboard pages (Admin/Supervisor/Worker)
│   │   ├── components/   ← Reusable UI components
│   │   ├── context/      ← Auth context
│   │   └── api/          ← API client
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env              ← Environment variables
│
└── ESP32_SewerGuard/     ← Arduino code for helmet
    └── ESP32_SewerGuard.ino
```

---

## **How It Works**

### **Architecture Flow:**

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ESP32 Smart Helmet                                 │
│  (Methane, Toxic Gas, Fall Detection, SOS)          │
│                                                     │
│  ↓ Sends sensor data every 3 seconds via WiFi       │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Backend API (localhost:5000)                       │
│  - Receives sensor data                             │
│  - Processes alerts                                 │
│  - Stores data in memory                            │
│  - Provides REST endpoints                          │
│                                                     │
│  ↑ (API calls)            ↓ (JSON responses)        │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Frontend App (localhost:3000)                      │
│  - Admin Dashboard                                  │
│  - Supervisor Dashboard                            │
│  - Worker Dashboard                                │
│  - Real-time monitoring                            │
│  - Reports & Alerts                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## **Quick Start - 3 Steps**

### **Step 1: Start Backend (Terminal 1)**

```bash
cd sewerguard/backend
npm install
npm run dev
```

You should see:
```
[nodemon] app crashed - waiting for file changes before restart
(ignore this first time)
[nodemon] watching path(s): *.*
...
SewerGuard running on port 5000
Frontend: http://localhost:5000
API: http://localhost:5000/api
```

✅ Backend is ready on **http://localhost:5000**

---

### **Step 2: Start Frontend (Terminal 2)**

Open a NEW terminal window (keep backend running):

```bash
cd sewerguard/frontend
npm install
npm run dev
```

You should see:
```
  VITE v4.5.0  ready in 234 ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

✅ Frontend is ready on **http://localhost:3000**

---

### **Step 3: Login & Test**

1. Open browser: **http://localhost:3000/login**
2. Login with demo credentials:
   - **Email:** `admin@sewerguard.com`
   - **Password:** `admin123`
3. You should see the Admin Dashboard

---

## **Demo Credentials**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@sewerguard.com | admin123 |
| Supervisor | john@sewerguard.com | super123 |
| Supervisor | sarah@sewerguard.com | super123 |
| Worker | mike@sewerguard.com | worker123 |
| Worker | carlos@sewerguard.com | worker123 |

---

## **File Explanations**

### **Backend Files**

**`backend/server.js`** — Main server
- Starts Express app on port 5000
- Sets up CORS, JWT authentication
- Mounts all API routes
- Serves frontend static files (production only)

**`backend/config/db.js`** — In-memory database
- Stores users, workers, supervisors, devices, alerts
- Resets when server restarts
- Ready to connect to Firebase/MongoDB

**`backend/middleware/auth.js`** — JWT authentication
- Verifies user tokens
- Protects API endpoints
- Checks user roles (admin/supervisor/worker)

**`backend/routes/`** — API endpoints
- `auth.js` — Login endpoint
- `workers.js` — Worker CRUD
- `supervisors.js` — Supervisor CRUD
- `devices.js` — IoT device management
- `sensors.js` — Sensor data ingestion (ESP32)
- `alerts.js` — Alert management
- `dashboard.js` — Dashboard data
- `reports.js` — PDF/Excel reports

---

### **Frontend Files**

**`frontend/src/App.jsx`** — Main app router
- Routes for different user roles
- Protected routes (require login)
- Role-based page access

**`frontend/src/context/AuthContext.jsx`** — Authentication state
- Stores user info and JWT token
- Provides login/logout functions
- Available to all components

**`frontend/src/pages/`** — Dashboard pages
- `admin/` — Admin dashboards (Workers, Supervisors, Devices, Alerts, Reports, Settings)
- `supervisor/` — Supervisor dashboards (Workers, Alerts)
- `worker/` — Worker dashboard (Personal stats)

**`frontend/src/components/`** — Reusable UI
- `Layout.jsx` — Sidebar navigation
- `SensorCard.jsx` — Gas level display
- `AlertBadge.jsx` — Alert notifications
- `StatCard.jsx` — Statistics cards

**`frontend/src/api/index.js`** — API client
- Axios configuration
- All API calls to backend
- Automatic token attachment to requests

---

## **API Endpoints**

### **Authentication**
- `POST /api/auth/login` — Login

### **Dashboards**
- `GET /api/dashboard/admin` — Admin dashboard data
- `GET /api/dashboard/supervisor` — Supervisor dashboard data
- `GET /api/dashboard/worker` — Worker dashboard data

### **Management**
- `GET /api/workers` — List all workers
- `POST /api/workers` — Create worker
- `PUT /api/workers/:id` — Update worker
- `DELETE /api/workers/:id` — Delete worker
- `GET /api/supervisors` — List supervisors
- `POST /api/supervisors` — Create supervisor
- `GET /api/devices` — List devices
- `PUT /api/devices/:id/toggle` — Toggle device status

### **Real-time Data**
- `POST /api/sensors/ingest` — ESP32 sends data here
- `GET /api/sensors/realtime` — Get live sensor readings
- `GET /api/alerts` — Get all alerts
- `PUT /api/alerts/:id/resolve` — Resolve alert

### **Reports**
- `GET /api/reports/summary` — Get report summary
- `/api/reports/download/pdf` — Download PDF
- `/api/reports/download/excel` — Download Excel

---

## **Key Features Explained**

### **Real-time Monitoring**
- Frontend auto-refreshes dashboard every 5 seconds
- Shows live gas levels, fall detection, SOS status
- Color-coded: 🟢 Safe, 🟡 Warning, 🔴 Critical

### **Alert System**
- Auto-triggered when sensor readings exceed thresholds
- Stored in database
- Can be resolved by admin/supervisor
- Shows in real-time on dashboards

### **User Roles**
- **Admin**: Full control, manage all users, view all alerts, generate reports
- **Supervisor**: Manage their assigned workers, resolve team alerts
- **Worker**: View personal stats, see alerts, view supervisor contact

### **Reports**
- Download as PDF or Excel
- Includes summary stats, worker alert counts, alert history
- Uses jsPDF and XLSX libraries

---

## **Troubleshooting**

### **Backend won't start**
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# If in use, kill the process or change PORT in .env
set PORT=5001
npm run dev
```

### **Frontend can't connect to backend**
- Make sure backend is running on port 5000
- Check browser console for errors (F12)
- Verify `VITE_API_URL` is correct (should be empty for localhost)

### **npm install fails**
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

### **Port already in use**
```bash
# For port 3000 (frontend), use different port:
npm run dev -- --port 3001

# For port 5000 (backend), change .env or use:
PORT=5001 npm run dev
```

---

## **Development Tips**

### **Auto-reload on changes**
- Backend: `npm run dev` uses nodemon (auto-restarts)
- Frontend: `npm run dev` uses Vite (auto-refreshes)

### **View API responses**
- Open browser DevTools (F12)
- Go to "Network" tab
- Make requests and see responses

### **Debug authentication**
- Check "Application" tab in DevTools
- Look for `token` in localStorage
- Token expires after 24 hours

### **Reset database**
- Just restart backend server
- All in-memory data resets
- Demo users are recreated

---

## **Next Steps**

1. ✅ Run backend locally
2. ✅ Run frontend locally
3. ✅ Test login and dashboards
4. ✅ Upload ESP32 code to helmet
5. ✅ Configure ESP32 WiFi credentials
6. ✅ Watch sensor data flow in real-time
7. ✅ Deploy to Vercel (permanent hosting)

---

## **Environment Variables**

### **Backend (.env)**
```
PORT=5000
JWT_SECRET=sewerguard_super_secret_jwt_key_2024_enterprise
NODE_ENV=development
```

### **Frontend (.env)**
```
VITE_API_URL=
```
(Leave empty for localhost development)

---

## **Production vs Local**

| Aspect | Local | Production (Vercel) |
|--------|-------|-------------------|
| URL | localhost:3000 | sewerguard-frontend.vercel.app |
| Backend | localhost:5000 | sewerguard-backend.vercel.app |
| Database | In-memory | In-memory (can add Firebase) |
| Data Persistence | Resets on restart | Persists until restart |
| Restart | Manual | Auto (Vercel restarts weekly) |

---

**Ready to start? Run the backend and frontend in two terminals!** 🚀
