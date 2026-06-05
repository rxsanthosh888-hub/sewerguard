@echo off
setlocal enabledelayedexpansion

echo.
echo ============================================
echo   SewerGuard - Getting Public ngrok URL
echo ============================================
echo.

echo Starting ngrok tunnel...
start /B ngrok http 3000 > nul

timeout /t 5 /nobreak

echo.
echo Fetching ngrok URL from API...
echo.

setlocal enabledelayedexpansion
for /l %%i in (1,1,10) do (
    for /f "delims=" %%a in ('powershell -Command "try { $url = (Invoke-RestMethod -Uri 'http://localhost:4040/api/tunnels' -TimeoutSec 2 -ErrorAction Stop).tunnels[0].public_url; Write-Host $url } catch { }" 2^>nul') do (
        if not "%%a"=="" (
            echo.
            echo ============================================
            echo Your ngrok Public URL:
            echo ============================================
            echo.
            echo %%a
            echo.
            echo ============================================
            echo.
            echo Update your ESP32 code with:
            echo const char* SERVER_URL = "%%a/api/sensors/ingest";
            echo.
            timeout /t 300 /nobreak
            exit /b 0
        )
    )
    echo Attempt %%i/10...
    timeout /t 2 /nobreak
)

echo.
echo ❌ Could not get ngrok URL. 
echo Try opening: http://localhost:4040 in your browser
echo.
timeout /t 5

