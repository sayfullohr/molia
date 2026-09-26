@echo off
chcp 65001 >nul
title Molia Strategy — Platformani Ishga Tushirish
color 0b

echo =======================================================
echo          🚀 MOLIA STRATEGY PLATFORMASI 🚀
echo =======================================================
echo.
echo [1/3] Backend server ishga tushirilmoqda (Port: 5000)...
start "Molia Backend (Port 5000)" cmd /k "cd /d ""%~dp0backend"" && npm run dev"

echo [2/3] Frontend ilovasi ishga tushirilmoqda (Port: 3000)...
start "Molia Frontend (Port 3000)" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo [3/3] Serverlar ishga tushishi kutilmoqda...
timeout /t 5 /nobreak >nul

echo.
echo =======================================================
echo   Platforma muvaffaqiyatli ishga tushirildi!
echo.
echo   💻 Kompyuteringizda:  http://localhost:3000
echo   📱 Do'stingiz telefonda: http://192.168.43.153:3000
echo =======================================================
echo.

start http://localhost:3000
exit
