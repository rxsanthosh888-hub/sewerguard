@echo off
echo ============================================
echo      SewerGuard - Starting All Services
echo ============================================
echo.

echo [1/2] Starting Backend (Port 5000)...
start "SewerGuard Backend" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend (Port 3000)...
start "SewerGuard Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 4 /nobreak >nul

echo.
echo ============================================
echo  SewerGuard is starting up!
echo  Open: http://localhost:3000
echo ============================================
echo.
echo Login Credentials:
echo   Admin:      admin@sewerguard.com / admin123
echo   Supervisor: john@sewerguard.com  / super123
echo   Worker:     mike@sewerguard.com  / worker123
echo.
echo For PUBLIC URL: Run get-public-url.bat
echo ============================================
echo.
start http://localhost:3000
pause
