@echo off
echo ============================================
echo   SewerGuard - Get Public URL with ngrok
echo ============================================
echo.

:: Check if ngrok is installed
where ngrok >nul 2>&1
if %errorlevel% neq 0 (
    echo ngrok not found. Installing via winget...
    winget install Ngrok.Ngrok --accept-package-agreements --accept-source-agreements
    echo.
    echo Please restart this script after installation.
    pause
    exit
)

echo ngrok found!
echo.
echo Make sure SewerGuard is running:
echo   - Backend:  npm run dev  (in backend folder, port 5000)
echo   - Frontend: npm run dev  (in frontend folder, port 3000)
echo.
echo Starting ngrok tunnel on port 3000...
echo Your public URL will appear below:
echo.
ngrok http 3000
