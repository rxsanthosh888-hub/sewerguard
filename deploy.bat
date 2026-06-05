@echo off
REM SewerGuard Vercel Deployment Script

echo.
echo ============================================
echo   SewerGuard - Vercel Deployment
echo ============================================
echo.

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    echo Installing Vercel CLI...
    npm install -g vercel
)

echo.
echo Step 1: Deploying Backend...
echo ============================================
cd backend
echo Logging into Vercel...
vercel link --cwd ..
vercel deploy --prod --name sewerguard-backend
set BACKEND_URL=%VERCEL_URL%
cd ..

echo.
echo Step 2: Deploying Frontend...
echo ============================================
cd frontend
echo Setting VITE_API_URL environment variable...
setx VITE_API_URL %BACKEND_URL%
echo Deploying frontend...
vercel deploy --prod --name sewerguard-frontend
cd ..

echo.
echo ============================================
echo   Deployment Complete!
echo ============================================
echo.
echo Backend URL: https://sewerguard-backend.vercel.app
echo Frontend URL: https://sewerguard-frontend.vercel.app
echo.
pause
