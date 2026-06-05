# SewerGuard - IoT Smart Sewer Safety Monitoring System

A full-stack web application for real-time sewer worker safety monitoring using IoT sensors.

---

## Prerequisites

- **Node.js** v18+ — Download from https://nodejs.org/
- **npm** v9+ (comes with Node.js)

---

## Project Structure

```
sewerguard/
├── backend/          Node.js + Express REST API
│   ├── config/db.js  In-memory demo database
│   ├── middleware/   JWT auth middleware
│   ├── routes/       API route handlers
│   └── server.js     Main server
└── frontend/         React + Vite + Tailwind CSS
    └── src/
        ├── api/      Axios API client
        ├── components/ Reusable UI components
        ├── context/  Auth context
        └── pages/    Admin / Supervisor / Worker dashboards
```

---

## Quick Start

### 1. Install & Start Backend

```bash
cd sewerguard/backend
npm install
npm run dev
# Server runs on http://localhost:5000
```

### 2. Install & Start Frontend

Open a second terminal:

```bash
cd sewerguard/frontend
npm install
npm run dev
# App runs on http://localhost:3000
```

### 3. Open in Browser

Go to: **http://localhost:3000**

---

## Demo Login Credentials

| Role       | Email                     | Password    |
|------------|---------------------------|-------------|
| Admin      | admin@sewerguard.com      | admin123    |
| Supervisor | john@sewerguard.com       | super123    |
| Supervisor | sarah@sewerguard.com      | super123    |
| Worker     | mike@sewerguard.com       | worker123   |
| Worker     | carlos@sewerguard.com     | worker123   |

---

## Features

### Admin Dashboard
- Real-time overview: total workers, supervisors, active alerts, online devices
- Live sensor monitoring grid for all workers (auto-refreshes every 5s)
- Trend chart for average gas levels
- Recent alerts table

### Admin — Workers Management
- Full CRUD (Create, Read, Update, Delete) for workers
- Search by name, email, employee ID, zone
- Assign supervisor to each worker
- Live sensor status in table rows

### Admin — Supervisors Management
- Full CRUD for supervisors
- Card view with assigned worker count
- Zone assignment

### Admin — Devices
- All IoT devices with battery levels, firmware, status
- Toggle device online/offline
- Last-seen timestamps

### Admin — Alerts
- Full alert log with filters (status, type)
- Resolve alerts with one click
- Color-coded by severity (critical = red border, warning = yellow)

### Admin — Reports
- Summary statistics
- **PDF download** (using jsPDF + AutoTable)
- **Excel download** (using XLSX)
- Workers table with alert counts
- Alert history table

### Admin — Settings
- Gas threshold configuration (methane, toxic)
- Visual gradient scale
- Demo credentials reference

### Supervisor Dashboard
- Live worker monitoring cards
- Team average gas trend chart
- One-click alert resolution

### Worker Dashboard
- Personal safety gauges with status indicators
- Emergency banner if readings exceed critical thresholds
- Gas level history chart
- Supervisor contact info
- Alert history

---

## API Endpoints

| Method | Endpoint                    | Description            |
|--------|-----------------------------|------------------------|
| POST   | /api/auth/login             | Login (all roles)      |
| GET    | /api/dashboard/admin        | Admin dashboard data   |
| GET    | /api/dashboard/supervisor   | Supervisor dashboard   |
| GET    | /api/dashboard/worker       | Worker dashboard       |
| GET    | /api/workers                | List workers           |
| POST   | /api/workers                | Create worker          |
| PUT    | /api/workers/:id            | Update worker          |
| DELETE | /api/workers/:id            | Delete worker          |
| GET    | /api/supervisors            | List supervisors       |
| POST   | /api/supervisors            | Create supervisor      |
| GET    | /api/devices                | List devices           |
| PUT    | /api/devices/:id/toggle     | Toggle device status   |
| GET    | /api/sensors/realtime       | Live sensor data       |
| POST   | /api/sensors/ingest         | ESP32 data ingest      |
| GET    | /api/alerts                 | List alerts            |
| PUT    | /api/alerts/:id/resolve     | Resolve alert          |
| GET    | /api/reports/summary        | Report summary         |

---

## IoT Device Integration (ESP32)

Send POST to `/api/sensors/ingest` (no auth required):

```json
{
  "deviceId": "AA:BB:CC:DD:EE:01",
  "methane": 250,
  "toxic": 120,
  "fallDetected": false,
  "sosActivated": false,
  "battery": 85
}
```

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS        |
| Charts    | Recharts                            |
| Icons     | Lucide React                        |
| Toast     | React Hot Toast                     |
| HTTP      | Axios                               |
| PDF       | jsPDF + jsPDF-AutoTable             |
| Excel     | XLSX (SheetJS)                      |
| Backend   | Node.js, Express                    |
| Auth      | JWT (jsonwebtoken), bcryptjs        |
| Database  | In-memory (Firebase-ready)          |
| Security  | Helmet, CORS                        |
