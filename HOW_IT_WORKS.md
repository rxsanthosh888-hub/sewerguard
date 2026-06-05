# SewerGuard - How It All Works Together

## **Complete System Architecture**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ESP32 SMART HELMET                              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ • Methane Sensor (MQ4) on GPIO 34                                │  │
│  │ • Toxic Gas Sensor (MQ135) on GPIO 35                            │  │
│  │ • MPU6050 Accelerometer on I2C (GPIO 21/22) - Fall Detection     │  │
│  │ • SOS Button on GPIO 27                                           │  │
│  │ • Active Buzzer on GPIO 26                                        │  │
│  │ • WiFi Connectivity                                               │  │
│  │ • 9V Battery Power                                                │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─ Every 3 seconds ──────────────────────────────────────────────┐  │
│  │ Reads all sensors                                             │  │
│  │ Calculates gas levels (ppm)                                   │  │
│  │ Detects falls (acceleration > 2.5g)                           │  │
│  │ Reads SOS button                                              │  │
│  │ Formats as JSON                                               │  │
│  │ Sends via HTTPS POST to backend                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓                                       │
│                        SENDS DATA:                                   │
│  {                                                                   │
│    "deviceId": "AA:BB:CC:DD:EE:01",                                 │
│    "methane": 250,        // ppm                                     │
│    "toxic": 120,          // ppm                                     │
│    "fallDetected": false,                                            │
│    "sosActivated": false,                                            │
│    "battery": 85          // %                                       │
│  }                                                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────────┐
│              BACKEND API (Node.js + Express)                           │
│                  Running on Port 5000                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ /api/sensors/ingest (POST)                                       │  │
│  │ • Receives ESP32 data (no auth required)                         │  │
│  │ • Stores in memory database                                      │  │
│  │ • Checks thresholds:                                             │  │
│  │   - Methane: Warning ≥ 300 ppm, Critical ≥ 500 ppm             │  │
│  │   - Toxic: Warning ≥ 250 ppm, Critical ≥ 350 ppm              │  │
│  │ • Triggers alert if thresholds exceeded                          │  │
│  │ • Sends buzzer signal back to ESP32 if critical                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ IN-MEMORY DATABASE                                               │  │
│  │ ┌─────────────────────────────────────────────────────────────┐ │  │
│  │ │ Users:        Admin, Supervisors, Workers                  │ │  │
│  │ │ Workers:      Name, Email, ID, Supervisor, Zone            │ │  │
│  │ │ Supervisors:  Name, Email, Assigned Workers                │ │  │
│  │ │ Devices:      Device ID, Status, Battery, Last Seen        │ │  │
│  │ │ Sensors:      Latest reading from each device               │ │  │
│  │ │ Alerts:       Triggered alerts with type, severity, status  │ │  │
│  │ └─────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ API ENDPOINTS                                                    │  │
│  │ • POST /api/auth/login                   → User login           │  │
│  │ • GET  /api/dashboard/admin              → Admin stats          │  │
│  │ • GET  /api/dashboard/supervisor         → Supervisor stats     │  │
│  │ • GET  /api/dashboard/worker             → Worker stats         │  │
│  │ • GET  /api/workers                      → List all workers     │  │
│  │ • POST /api/workers                      → Create worker        │  │
│  │ • PUT  /api/workers/:id                  → Update worker        │  │
│  │ • DELETE /api/workers/:id                → Delete worker        │  │
│  │ • GET  /api/sensors/realtime             → Live sensor data     │  │
│  │ • GET  /api/alerts                       → All alerts           │  │
│  │ • PUT  /api/alerts/:id/resolve           → Resolve alert        │  │
│  │ • GET  /api/reports/summary              → Report data          │  │
│  │ • GET  /api/reports/download/pdf         → Download PDF         │  │
│  │ • GET  /api/reports/download/excel       → Download Excel       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────────┐
│           FRONTEND (React + Vite + Tailwind CSS)                       │
│                 Running on Port 3000                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ LOGIN PAGE                                                       │  │
│  │ • Email + Password input                                         │  │
│  │ • Calls /api/auth/login                                          │  │
│  │ • Gets JWT token back                                            │  │
│  │ • Stores in localStorage                                         │  │
│  │ • Redirects to role-based dashboard                              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                              ↓                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ ADMIN DASHBOARD                                                  │  │
│  │ ┌─ Dashboard ─────────────────────────────────────────────────┐ │  │
│  │ │ • Total workers, supervisors, active alerts, online devices│ │  │
│  │ │ • Live sensor grid (auto-refresh every 5s)                 │ │  │
│  │ │ • Average gas level trend chart                             │ │  │
│  │ │ • Recent alerts table                                       │ │  │
│  │ └─────────────────────────────────────────────────────────────┘ │  │
│  │                                                                  │  │
│  │ ┌─ Workers Management ────────────────────────────────────────┐ │  │
│  │ │ • List all workers with search/filter                       │ │  │
│  │ │ • Create/Edit/Delete workers                                │ │  │
│  │ │ • Assign supervisor to each worker                          │ │  │
│  │ │ • View live sensor status                                   │ │  │
│  │ └─────────────────────────────────────────────────────────────┘ │  │
│  │                                                                  │  │
│  │ ┌─ Supervisors Management ────────────────────────────────────┐ │  │
│  │ │ • List all supervisors                                       │ │  │
│  │ │ • Create/Edit/Delete supervisors                             │ │  │
│  │ │ • View assigned worker count                                 │ │  │
│  │ └─────────────────────────────────────────────────────────────┘ │  │
│  │                                                                  │  │
│  │ ┌─ Devices Management ────────────────────────────────────────┐ │  │
│  │ │ • All IoT devices with battery, firmware, status            │ │  │
│  │ │ • Toggle device online/offline                               │ │  │
│  │ │ • Last-seen timestamps                                       │ │  │
│  │ └─────────────────────────────────────────────────────────────┘ │  │
│  │                                                                  │  │
│  │ ┌─ Alerts ───────────────────────────────────────────────────┐ │  │
│  │ │ • Full alert log with filters (status, type, severity)     │ │  │
│  │ │ • Color-coded by severity                                   │ │  │
│  │ │ • Resolve alerts with one click                             │ │  │
│  │ └─────────────────────────────────────────────────────────────┘ │  │
│  │                                                                  │  │
│  │ ┌─ Reports ──────────────────────────────────────────────────┐ │  │
│  │ │ • Summary statistics                                         │ │  │
│  │ │ • Download as PDF or Excel                                  │ │  │
│  │ │ • Workers table with alert counts                            │ │  │
│  │ │ • Alert history table                                        │ │  │
│  │ └─────────────────────────────────────────────────────────────┘ │  │
│  │                                                                  │  │
│  │ ┌─ Settings ─────────────────────────────────────────────────┐ │  │
│  │ │ • Configure gas thresholds                                  │ │  │
│  │ │ • Visual gradient scale                                     │ │  │
│  │ │ • Demo credentials reference                                │ │  │
│  │ └─────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ SUPERVISOR DASHBOARD                                             │  │
│  │ • Live worker monitoring cards                                   │  │
│  │ • Team average gas trend chart                                   │  │
│  │ • One-click alert resolution                                     │  │
│  │ • Assigned workers list                                          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ WORKER DASHBOARD                                                 │  │
│  │ • Personal safety gauges with status indicators                  │  │
│  │ • Emergency banner if readings exceed critical                   │  │
│  │ • Gas level history chart                                        │  │
│  │ • Supervisor contact info                                        │  │
│  │ • Alert history                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## **Data Flow Example - Real Incident**

### **Scenario: Methane level exceeds critical threshold**

```
1. ESP32 reads methane sensor = 520 ppm (Critical ≥ 500)
   └─ Buzzer beeps continuously on helmet
   └─ Serial log shows "🔴 CRITICAL"

2. ESP32 sends POST to backend every 3 seconds:
   {
     "deviceId": "AA:BB:CC:DD:EE:01",
     "methane": 520,
     "toxic": 100,
     "fallDetected": false,
     "sosActivated": false,
     "battery": 75
   }

3. Backend receives at /api/sensors/ingest
   └─ Stores in sensor database
   └─ Checks: 520 ≥ 500? YES → CRITICAL
   └─ Creates alert:
      {
        "id": "alert_123",
        "workerId": "worker_1",
        "type": "methane_critical",
        "value": 520,
        "severity": "critical",
        "timestamp": "2024-01-15T10:30:00Z",
        "status": "unresolved"
      }

4. Frontend auto-refreshes dashboard (every 5 seconds)
   └─ Calls /api/dashboard/admin
   └─ Receives updated sensor data
   └─ Shows red 🔴 CRITICAL badge
   └─ Displays alert in real-time table

5. Admin sees alert in dashboard
   └─ Clicks "Resolve" button
   └─ Calls PUT /api/alerts/alert_123/resolve
   └─ Alert status changes to "resolved"
   └─ Update reflected immediately on screen

6. Supervisor also notified
   └─ If worker is assigned to supervisor
   └─ Alert appears on supervisor dashboard
   └─ Can also resolve from their dashboard
```

---

## **Authentication & Security**

```
┌──────────────────────────────────────────┐
│ User logs in                             │
│ POST /api/auth/login                     │
│ {                                        │
│   "email": "admin@sewerguard.com",       │
│   "password": "admin123"                 │
│ }                                        │
└──────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────┐
│ Backend verifies:                        │
│ • Email exists in database               │
│ • Password matches (bcrypt verified)     │
│ • User role (admin/supervisor/worker)    │
└──────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────┐
│ Backend generates JWT token              │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9  │
│ (expires in 24 hours)                    │
└──────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────┐
│ Frontend receives token                  │
│ • Stores in localStorage                 │
│ • Attaches to all subsequent requests    │
│ • Uses for authentication                │
└──────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────┐
│ Protected routes check token             │
│ Authorization: Bearer <token>            │
│ • Valid token → Access granted           │
│ • Invalid token → Redirect to login      │
│ • Role check → Admin-only pages blocked  │
└──────────────────────────────────────────┘
```

---

## **Local Development Flow**

```
Terminal 1: Backend
┌──────────────────────┐
│ npm run dev          │
│ Nodemon watching     │
│ Port 5000 open       │
│ Ready for API calls  │
└──────────────────────┘

Terminal 2: Frontend
┌──────────────────────┐
│ npm run dev          │
│ Vite hot reload      │
│ Port 3000 open       │
│ Ready to use         │
└──────────────────────┘

Browser: http://localhost:3000/login
┌──────────────────────┐
│ React app running    │
│ Makes API calls to   │
│ http://localhost:5000│
└──────────────────────┘
```

---

## **Production (Vercel) Flow**

```
ESP32 Helmet
└─ Sends to: https://sewerguard-backend.vercel.app/api/sensors/ingest

User opens: https://sewerguard-frontend.vercel.app/login
└─ Frontend makes API calls to: https://sewerguard-backend.vercel.app/api/*

Both running on Vercel serverless infrastructure
Data persists in in-memory database (resets on deployment)
```

---

## **Key Thresholds**

```
Methane (MQ4):
  🟢 SAFE:      < 300 ppm
  🟡 WARNING:   300-499 ppm
  🔴 CRITICAL:  ≥ 500 ppm

Toxic Gas (MQ135):
  🟢 SAFE:      < 250 ppm
  🟡 WARNING:   250-349 ppm
  🔴 CRITICAL:  ≥ 350 ppm

Fall Detection (MPU6050):
  ✅ Normal:     < 2.5g
  ⚠️ DETECTED:   ≥ 2.5g
```

---

## **Battery Status**

```
Battery indicator shows percentage:
  🟢 100% - 75%   Green (Good)
  🟡 75%  - 25%   Yellow (Low)
  🔴 < 25%        Red (Critical)
```

---

**That's how everything works together!** 🚀
