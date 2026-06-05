@echo off
echo.
echo ============================================
echo   SewerGuard - ngrok Public Tunnel
echo ============================================
echo.
echo Starting ngrok...
echo.
echo When you see the output below, look for:
echo "Forwarding https://XXXX-XXX-XXXX.ngrok.io"
echo.
echo Copy that URL and use it in your ESP32 code
echo.
echo ============================================
echo.

ngrok http 3000

