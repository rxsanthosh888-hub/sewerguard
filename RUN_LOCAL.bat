@echo off
REM SewerGuard Local Development - Run Backend and Frontend

echo.
echo ============================================
echo   SewerGuard - Local Development Setup
echo ============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js detected: 
node --version
echo.

REM Install dependencies if needed
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo.
echo ============================================
echo Starting Backend and Frontend...
echo ============================================
echo.

REM Open two terminals - one for backend, one for frontend
start cmd /k "cd backend && npm run dev"
start cmd /k "cd frontend && npm run dev"

echo.
echo ============================================
echo Windows opened:
echo   1. Backend Terminal  - http://localhost:5000
echo   2. Frontend Terminal - http://localhost:3000
echo ============================================
echo.
echo Opening browser...
timeout /t 3 /nobreak
start http://localhost:3000/login

echo.
echo ============================================
echo Setup Complete!
echo ============================================
echo.
echo Login with:
echo   Email: admin@sewerguard.com
echo   Password: admin123
echo.
pause
