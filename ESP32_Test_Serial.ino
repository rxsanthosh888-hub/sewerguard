/*
  Simple test to verify Serial Monitor is working
*/

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n");
  Serial.println("========================================");
  Serial.println("  ESP32 Serial Monitor Test");
  Serial.println("========================================");
  Serial.println("If you see this message, Serial is working!");
  Serial.println("");
}

void loop() {
  Serial.printf("Loop running... millis: %lu\n", millis());
  delay(2000);
}
