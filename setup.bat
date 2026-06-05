@echo off
echo ========================================
echo  SewerGuard - Setup Script
echo ========================================
echo.

echo [1/4] Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo [2/4] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend install failed
    pause
    exit /b 1
)
cd ..

echo.
echo [3/4] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend install failed
    pause
    exit /b 1
)
cd ..

echo.
echo [4/4] Setup complete!
echo.
echo ========================================
echo  To start the application:
echo.
echo  Terminal 1 (Backend):
echo    cd backend
echo    npm run dev
echo.
echo  Terminal 2 (Frontend):
echo    cd frontend
echo    npm run dev
echo.
echo  Then open: http://localhost:3000
echo ========================================
pause
