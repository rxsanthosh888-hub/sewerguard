# 🚀 SewerGuard - IoT Smart Sewer Safety System

Welcome! This is a complete, production-ready IoT safety monitoring system for sewer workers.

---

## **📱 What is SewerGuard?**

A real-time safety monitoring platform that:
- 📡 Receives sensor data from ESP32 smart helmets
- 🔍 Monitors methane & toxic gas levels
- 🚨 Detects falls and SOS alerts
- 👥 Has 3 role-based dashboards (Admin/Supervisor/Worker)
- 📊 Generates reports (PDF/Excel)
- 📈 Shows real-time trends and alerts

---

## **🎯 Quick Links**

| Task | Link |
|------|------|
| **Run Locally** | Read: `LOCAL_SETUP.md` |
| **Deploy to Internet** | Read: `QUICK_DEPLOY.md` |
| **How It Works** | Read: `HOW_IT_WORKS.md` |
| **GitHub Repo** | https://github.com/rxsanthosh888-hub/sewerguard |

---

## **⚡ Get Started in 2 Minutes**

### **Option 1: Run Locally (Fastest)**

**Terminal 1:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2:**
```bash
cd frontend
npm install
npm run dev
```

Then open: **http://localhost:3000/login**

### **Option 2: Deploy Online (Public URL)**

Follow: `QUICK_DEPLOY.md` for Vercel deployment

---

## **🔐 Demo Login Credentials**

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@sewerguard.com | admin123 |
| **Supervisor** | john@sewerguard.com | super123 |
| **Worker** | mike@sewerguard.com | worker123 |

---

## **📂 Project Structure**

```
sewerguard/
├── backend/              ← Node.js + Express API
│   ├── config/db.js      ← In-memory database
│   ├── routes/           ← API endpoints
│   ├── middleware/       ← Authentication
│   └── server.js         ← Main server
│
├── frontend/             ← React + Vite app
│   ├── src/pages/        ← Dashboards
│   ├── src/components/   ← UI components
│   └── src/context/      ← Auth state
│
└── ESP32_SewerGuard/     ← Arduino smart helmet code
    └── ESP32_SewerGuard.ino
```

---

## **🏗️ Tech Stack**

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- Recharts (charts)
- Axios (API calls)

**Backend:**
- Node.js + Express
- JWT authentication
- In-memory database
- PDF/Excel reports

**Hardware:**
- ESP32 microcontroller
- Methane sensor (MQ4)
- Toxic gas sensor (MQ135)
- Accelerometer (MPU6050)
- SOS button + Buzzer

**Hosting:**
- Vercel (free tier)
- GitHub (code repository)

---

## **✨ Features**

### **Admin Dashboard**
- 👁️ Live monitoring of all workers
- 📊 Real-time sensor data grid
- 🔔 Alert management
- 👥 Worker & supervisor management
- 📱 Device management
- 📄 PDF & Excel reports
- ⚙️ Settings & thresholds

### **Supervisor Dashboard**
- 👁️ Monitor assigned workers
- 🔔 Team alerts
- 📊 Team trends

### **Worker Dashboard**
- 📈 Personal safety gauges
- 🚨 Emergency banner
- 📊 History charts
- 👤 Supervisor info

---

## **🔌 Hardware Integration**

ESP32 sends sensor data every 3 seconds:

```json
{
  "deviceId": "AA:BB:CC:DD:EE:01",
  "methane": 250,        // ppm
  "toxic": 120,          // ppm
  "fallDetected": false,
  "sosActivated": false,
  "battery": 85          // %
}
```

**Endpoint:** `/api/sensors/ingest` (no auth required)

---

## **📊 Alert Thresholds**

| Gas | Safe | Warning | Critical |
|-----|------|---------|----------|
| **Methane** | < 300 | 300-499 | ≥ 500 |
| **Toxic** | < 250 | 250-349 | ≥ 350 |
| **Fall** | - | - | Detected |
| **SOS** | - | - | Activated |

---

## **📡 API Endpoints**

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/login` | ❌ | User login |
| POST | `/api/sensors/ingest` | ❌ | ESP32 data |
| GET | `/api/dashboard/admin` | ✅ | Admin stats |
| GET | `/api/dashboard/supervisor` | ✅ | Supervisor stats |
| GET | `/api/dashboard/worker` | ✅ | Worker stats |
| GET | `/api/workers` | ✅ | List workers |
| GET | `/api/alerts` | ✅ | List alerts |
| GET | `/api/reports/summary` | ✅ | Report data |
| GET | `/api/reports/download/pdf` | ✅ | Download PDF |
| GET | `/api/reports/download/excel` | ✅ | Download Excel |

---

## **🚀 Deployment Steps**

### **Local Development:**
1. Install Node.js v18+
2. Run `npm install` in both backend & frontend
3. Start both with `npm run dev`
4. Open http://localhost:3000

### **Public Deployment (Vercel):**
1. Follow steps in `QUICK_DEPLOY.md`
2. Get public URLs
3. Update ESP32 code with new backend URL
4. Upload to ESP32

---

## **🔒 Security**

- ✅ JWT token authentication (24h expiration)
- ✅ Password hashing with bcryptjs
- ✅ CORS enabled
- ✅ Helmet security headers
- ✅ Role-based access control

---

## **📚 Documentation**

- `LOCAL_SETUP.md` - Run locally with detailed explanations
- `QUICK_DEPLOY.md` - Deploy to Vercel in 3 steps
- `HOW_IT_WORKS.md` - Complete system architecture
- `VERCEL_SETUP.md` - Detailed Vercel deployment guide

---

## **🐛 Troubleshooting**

**Backend won't start?**
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Use different port
set PORT=5001
npm run dev
```

**Frontend can't connect to backend?**
- Make sure backend is running
- Check browser console (F12) for errors
- Verify `VITE_API_URL` in `.env`

**ESP32 can't reach server?**
- Check WiFi credentials in ESP32 code
- Verify backend URL is correct
- Monitor Serial output (115200 baud)

---

## **📞 Support**

- 🔗 GitHub: https://github.com/rxsanthosh888-hub/sewerguard
- 📖 Documentation: See files in root directory
- 💡 Tips: Check `LOCAL_SETUP.md` for detailed help

---

## **✅ Checklist**

- [ ] Read this file
- [ ] Choose: Local development OR Vercel deployment
- [ ] Follow appropriate guide (LOCAL_SETUP.md or QUICK_DEPLOY.md)
- [ ] Login with demo credentials
- [ ] Explore the dashboard
- [ ] Customize as needed

---

## **🎉 You're Ready!**

Your complete IoT safety monitoring system is ready to use!

**Next Step:** Pick a guide above and get started! 🚀

---

**Happy monitoring!** 👷‍♂️👷‍♀️
