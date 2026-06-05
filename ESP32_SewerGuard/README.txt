=========================================================
  ESP32 SewerGuard — Setup Instructions
=========================================================

STEP 1: Install Arduino IDE
  Download: https://www.arduino.cc/en/software

STEP 2: Install ESP32 Board
  Arduino IDE → File → Preferences → Additional URLs:
  https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
  
  Tools → Board Manager → Search "esp32" → Install

STEP 3: Install Libraries (Tools → Manage Libraries)
  1. MPU6050 by Electronic Cats
  2. ArduinoJson by Benoit Blanchon

STEP 4: Edit the code
  Open ESP32_SewerGuard.ino
  
  Change these lines:
  const char* WIFI_SSID     = "YOUR_WIFI_NAME";
  const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
  const char* SERVER_URL    = "https://YOUR_NGROK_URL/api/sensors/ingest";
  const char* DEVICE_ID     = "AA:BB:CC:DD:EE:01";  ← match device in app

STEP 5: Select Board
  Tools → Board → ESP32 Arduino → ESP32 Dev Module
  Tools → Port → Select your COM port

STEP 6: Upload
  Click Upload button (→)

STEP 7: Open Serial Monitor
  Tools → Serial Monitor → 115200 baud
  You will see sensor readings every 3 seconds

=========================================================
  HOW IT CONNECTS TO THE APP
=========================================================

1. ESP32 reads MQ-4, MQ-135, MPU6050, SOS button
2. Every 3 seconds sends POST request to:
   https://YOUR_NGROK_URL/api/sensors/ingest
   
   with data:
   {
     "deviceId": "AA:BB:CC:DD:EE:01",
     "methane": 150,
     "toxic": 80,
     "fallDetected": false,
     "sosActivated": false,
     "battery": 100
   }

3. Server creates alerts if thresholds exceeded
4. Admin/Supervisor dashboard shows alert within 5 seconds
5. SOS button press → immediate alert to admin

=========================================================
  DEVICE ID SETUP
=========================================================

Admin Login → Devices page
Your device "AA:BB:CC:DD:EE:01" must exist
If not found → Admin → Devices → the MAC address must match DEVICE_ID in code

=========================================================
