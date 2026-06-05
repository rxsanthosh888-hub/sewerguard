/*=========================================================
  SMART SEWER WORKER SAFETY HELMET
  ESP32 Arduino Code
  
  Connects to SewerGuard Web App via WiFi
  Sends sensor data every 3 seconds
=========================================================*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <MPU6050.h>
#include <ArduinoJson.h>

// ─────────────────────────────────────────────
// WIFI CREDENTIALS — Change to your WiFi
// ─────────────────────────────────────────────
const char* WIFI_SSID     = "santhosh";
const char* WIFI_PASSWORD = "santhosh kvg";

// ─────────────────────────────────────────────
// SEWERGUARD SERVER URL
// For local testing, use your PC's IP: http://172.20.46.24:5000/api/sensors/ingest
// For production, use: https://sewerguard-backend.vercel.app/api/sensors/ingest
// ─────────────────────────────────────────────
const char* SERVER_URL = "http://172.20.46.24:5000/api/sensors/ingest";

// ─────────────────────────────────────────────
// DEVICE ID — Must match device in SewerGuard app
// ─────────────────────────────────────────────
const char* DEVICE_ID = "AA:BB:CC:DD:EE:01";

// ─────────────────────────────────────────────
// PIN DEFINITIONS
// ─────────────────────────────────────────────
#define MQ4_PIN    34    // Methane Gas Sensor AO
#define MQ135_PIN  35    // Toxic Gas Sensor AO
#define SOS_PIN    27    // SOS Push Button
#define BUZZER_PIN 26    // Active Buzzer

// ─────────────────────────────────────────────
// GAS THRESHOLDS (match app settings)
// ─────────────────────────────────────────────
#define METHANE_WARNING   300
#define METHANE_CRITICAL  500
#define TOXIC_WARNING     250
#define TOXIC_CRITICAL    350

// ─────────────────────────────────────────────
// MPU6050
// ─────────────────────────────────────────────
MPU6050 mpu;
#define FALL_THRESHOLD 2.5   // g-force threshold for fall detection

// ─────────────────────────────────────────────
// GLOBAL VARIABLES
// ─────────────────────────────────────────────
bool sosActivated   = false;
bool fallDetected   = false;
unsigned long lastSend = 0;
const int SEND_INTERVAL = 3000; // Send every 3 seconds

// ─────────────────────────────────────────────
// SETUP
// ─────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(2000);  // Wait 2 seconds for Serial to stabilize
  
  Serial.println("\n\n");
  Serial.println("=========================================");
  Serial.println("  SewerGuard Smart Safety Helmet");
  Serial.println("=========================================");
  Serial.println("[SETUP] Starting initialization...");
  delay(500);

  // Pin Modes
  pinMode(SOS_PIN,    INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  Serial.println("[SETUP] Pins configured");

  // ADC setup for gas sensors
  analogReadResolution(12);   // 12-bit ADC (0-4095)
  analogSetAttenuation(ADC_11db); // 0-3.3V range
  Serial.println("[SETUP] ADC configured");

  // MPU6050 Init
  Wire.begin(21, 22);  // SDA=21, SCL=22
  mpu.initialize();
  if (mpu.testConnection()) {
    Serial.println("[MPU6050] Connected OK");
  } else {
    Serial.println("[MPU6050] Connection FAILED");
  }

  // Connect WiFi
  connectWiFi();

  Serial.println("\n[System] Helmet Ready!");
  beep(2, 100); // 2 short beeps = ready
}

// ─────────────────────────────────────────────
// MAIN LOOP
// ─────────────────────────────────────────────
void loop() {
  // Read SOS Button (LOW = pressed because INPUT_PULLUP)
  if (digitalRead(SOS_PIN) == LOW) {
    sosActivated = true;
    Serial.println("\n🚨 SOS BUTTON PRESSED!");
    beep(5, 200); // 5 beeps = SOS
    delay(300);   // debounce
  }

  // Read sensors every SEND_INTERVAL
  if (millis() - lastSend >= SEND_INTERVAL) {
    lastSend = millis();

    // Read Gas Sensors
    int methaneRaw = analogRead(MQ4_PIN);
    int toxicRaw   = analogRead(MQ135_PIN);

    // Convert to ppm (calibrated approximation)
    float methanePPM = map(methaneRaw, 0, 4095, 0, 1000);
    float toxicPPM   = map(toxicRaw,   0, 4095, 0, 500);

    // Read MPU6050 — Fall Detection
    int16_t ax, ay, az, gx, gy, gz;
    mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

    // Calculate acceleration magnitude in g
    float accelX = ax / 16384.0;
    float accelY = ay / 16384.0;
    float accelZ = az / 16384.0;
    float accelMag = sqrt(accelX*accelX + accelY*accelY + accelZ*accelZ);

    // Fall = sudden high acceleration
    if (accelMag > FALL_THRESHOLD) {
      fallDetected = true;
      Serial.println("⚠️ FALL DETECTED!");
    } else {
      fallDetected = false;
    }

    // Print to Serial Monitor
    Serial.println("\n─────────────────────────────");
    Serial.printf("[Methane]  %6.1f ppm  %s\n", methanePPM,
      methanePPM >= METHANE_CRITICAL ? "🔴 CRITICAL" :
      methanePPM >= METHANE_WARNING  ? "🟡 WARNING"  : "🟢 SAFE");
    Serial.printf("[Toxic]    %6.1f ppm  %s\n", toxicPPM,
      toxicPPM >= TOXIC_CRITICAL ? "🔴 CRITICAL" :
      toxicPPM >= TOXIC_WARNING  ? "🟡 WARNING"  : "🟢 SAFE");
    Serial.printf("[Fall]     %s (accel: %.2fg)\n",
      fallDetected ? "⚠️ DETECTED" : "✅ Normal", accelMag);
    Serial.printf("[SOS]      %s\n", sosActivated ? "🚨 ACTIVE" : "— Clear");
    Serial.println("─────────────────────────────");

    // Buzzer alert for dangerous conditions
    if (sosActivated || fallDetected ||
        methanePPM >= METHANE_CRITICAL || toxicPPM >= TOXIC_CRITICAL) {
      // Continuous rapid beep for emergency
      for(int i = 0; i < 3; i++) {
        digitalWrite(BUZZER_PIN, HIGH);
        delay(200);
        digitalWrite(BUZZER_PIN, LOW);
        delay(100);
      }
    } else if (methanePPM >= METHANE_WARNING || toxicPPM >= TOXIC_WARNING) {
      // Single beep for warning
      beep(1, 300);
    } else {
      digitalWrite(BUZZER_PIN, LOW);
    }

    // Send to SewerGuard Server
    if (WiFi.status() == WL_CONNECTED) {
      sendToServer(methanePPM, toxicPPM, fallDetected, sosActivated);
    } else {
      Serial.println("[WiFi] Disconnected! Reconnecting...");
      connectWiFi();
    }

    // Reset SOS after sending
    if (sosActivated) {
      sosActivated = false;
    }
  }
}

// ─────────────────────────────────────────────
// SEND DATA TO SEWERGUARD SERVER
// ─────────────────────────────────────────────
void sendToServer(float methane, float toxic, bool fall, bool sos) {
  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(5000);

  // Build JSON
  StaticJsonDocument<256> doc;
  doc["deviceId"]     = DEVICE_ID;
  doc["methane"]      = (int)methane;
  doc["toxic"]        = (int)toxic;
  doc["fallDetected"] = fall;
  doc["sosActivated"] = sos;
  doc["battery"]      = getBatteryPercent();

  String jsonBody;
  serializeJson(doc, jsonBody);

  Serial.printf("[HTTP] Sending to server...\n");
  int httpCode = http.POST(jsonBody);

  if (httpCode == 200) {
    Serial.println("[HTTP] ✅ Data sent successfully!");
    if (sos || fall) {
      Serial.println("[HTTP] 🚨 ALERT sent to Admin & Supervisor!");
    }
  } else {
    Serial.printf("[HTTP] ❌ Failed! Code: %d\n", httpCode);
  }

  http.end();
}

// ─────────────────────────────────────────────
// WIFI CONNECTION
// ─────────────────────────────────────────────
void connectWiFi() {
  Serial.printf("\n[WiFi] Connecting to %s", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] ✅ Connected!");
    Serial.printf("[WiFi] IP: %s\n", WiFi.localIP().toString().c_str());
    beep(1, 500); // 1 long beep = WiFi connected
  } else {
    Serial.println("\n[WiFi] ❌ Connection Failed!");
    beep(3, 500); // 3 long beeps = WiFi failed
  }
}

// ─────────────────────────────────────────────
// BUZZER HELPER
// ─────────────────────────────────────────────
void beep(int times, int duration) {
  for (int i = 0; i < times; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(duration);
    digitalWrite(BUZZER_PIN, LOW);
    if (i < times - 1) delay(100);
  }
}

// ─────────────────────────────────────────────
// BATTERY LEVEL (approximate from 9V)
// Without charging module, just return fixed value
// ─────────────────────────────────────────────
int getBatteryPercent() {
  // Since 9V battery with 7805 — no analog measurement
  // Return 100 (or add voltage divider to ADC pin for real reading)
  return 100;
}
