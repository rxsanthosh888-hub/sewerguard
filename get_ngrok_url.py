#!/usr/bin/env python3
import urllib.request
import json
import time

print("Waiting for ngrok tunnel to establish...")
for attempt in range(10):
    try:
        response = urllib.request.urlopen('http://localhost:4040/api/tunnels', timeout=3)
        data = json.loads(response.read().decode('utf-8'))
        
        if data.get('tunnels') and len(data['tunnels']) > 0:
            url = data['tunnels'][0]['public_url']
            print("\n" + "="*50)
            print("✅ Your ngrok Public URL:")
            print("="*50)
            print(f"\n🌐 {url}\n")
            print("="*50)
            print("\nUpdate your ESP32 code with this URL:")
            print(f"const char* SERVER_URL = \"{url}/api/sensors/ingest\";")
            print("="*50 + "\n")
            exit(0)
    except Exception as e:
        pass
    
    print(f"Attempt {attempt+1}/10...", end='\r')
    time.sleep(1)

print("\n❌ Could not connect to ngrok. Make sure ngrok is running.")
print("Run: ngrok http 3000")
