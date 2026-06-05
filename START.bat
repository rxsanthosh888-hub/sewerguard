@echo off
title SewerGuard Launcher
color 0A

echo.
echo  ============================================
echo   SewerGuard - Starting All Services
echo  ============================================
echo.

:: Kill old processes
echo [1] Killing old processes...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM ngrok.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul

:: Start Backend
echo [2] Starting Backend on port 5000...
start "SewerGuard-Backend" cmd /k "set PATH=C:\Program Files\nodejs;%PATH% && cd /d C:\Users\user\Pictures\SANTHOSH\sewerguard\backend && npm run dev"
timeout /t 4 /nobreak >nul

:: Start Frontend
echo [3] Starting Frontend on port 3000...
start "SewerGuard-Frontend" cmd /k "set PATH=C:\Program Files\nodejs;%PATH% && cd /d C:\Users\user\Pictures\SANTHOSH\sewerguard\frontend && node_modules\.bin\vite.cmd --host --force"
timeout /t 5 /nobreak >nul

:: Start ngrok
echo [4] Starting ngrok tunnel...
start "SewerGuard-ngrok" cmd /k "C:\Users\user\AppData\Local\ngrok\ngrok.exe http 3000"
timeout /t 4 /nobreak >nul

echo.
echo  ============================================
echo   All services started!
echo   Check the ngrok window for your public URL
echo   It looks like: https://xxxx.ngrok-free.dev
echo  ============================================
echo.
pause
