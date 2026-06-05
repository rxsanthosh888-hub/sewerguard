# Quick Start Guide - SewerGuard

## ✅ Currently Running

Your backend and frontend are already running:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

## 📱 ESP32 Configuration

Your ESP32 is configured to use **local development mode**:

```cpp
const char* SERVER_URL = "http://172.20.46.24:5000/api/sensors/ingest";
```

**Your PC's IP**: `172.20.46.24`

### Important:
1. **ESP32 and your PC must be on the same WiFi network**
2. WiFi credentials in ESP32 code:
   - SSID: `santhosh`
   - Password: `santhosh kvg`

## 🚀 Next Steps

### Step 1: Verify Servers
- **Backend**: Open http://localhost:5000/health in browser
  Should show: `{"status":"OK","message":"SewerGuard API Running",...}`

- **Frontend**: Open http://localhost:3000 in browser
  Should show: SewerGuard login page

### Step 2: Update ESP32 Code
1. In Arduino IDE, open `ESP32_SewerGuard.ino`
2. The SERVER_URL is already set to your PC's local IP
3. Compile and upload to your ESP32

### Step 3: Monitor ESP32
1. Open Serial Monitor (115200 baud)
2. You should see:
   - `[WiFi] Connecting to santhosh`
   - `[WiFi] ✅ Connected!`
   - `[HTTP] ✅ Data sent successfully!`

### Step 4: Check Dashboard
1. Open http://localhost:3000/login
2. Login: `admin@sewerguard.com` / `admin123`
3. You should see sensor data coming from ESP32

## 📡 WiFi Network Check

Make sure your ESP32 is connected to the same WiFi network as your PC:
- Network: `santhosh`
- Password: `santhosh kvg`

To verify, check your PC's connected WiFi network (same one as ESP32).

## 🔧 Troubleshooting

### ESP32 can't reach backend
- Check WiFi credentials in ESP32 code
- Verify both PC and ESP32 are on same network
- Make sure backend is running: `npm start` in backend folder
- Check Windows Firewall - allow port 5000

### Frontend can't connect to backend
- Frontend should automatically connect to `http://localhost:5000`
- Check browser console for errors

### Data not appearing in dashboard
- Monitor Serial output on ESP32 for errors
- Check backend logs: `npm start` output

## 🌐 For Production (Vercel)

When ready to deploy:
1. Deploy to Vercel (see VERCEL_SETUP.md)
2. Update SERVER_URL to: `https://sewerguard-backend.vercel.app/api/sensors/ingest`
3. Recompile and upload to ESP32

---

**Happy coding! 🎉**
