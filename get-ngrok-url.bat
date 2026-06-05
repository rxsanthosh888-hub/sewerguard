@echo off
REM Get ngrok public URL easily

echo.
echo ============================================
echo   SewerGuard - Get ngrok Public URL
echo ============================================
echo.

echo Ngrok is tunneling your app...
echo.
echo 🌐 Open this link in your browser:
echo    https://localhost:4040
echo.
echo This will show you the public URL for your app.
echo.
echo Alternatively, the ngrok URL format is usually:
echo    https://XXXX-XX-XXX-XXX.ngrok.io
echo.
echo Copy that URL and use it in your ESP32 code:
echo    const char* SERVER_URL = "https://XXXX-XX-XXX-XXX.ngrok.io/api/sensors/ingest";
echo.
pause
