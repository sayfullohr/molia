@echo off
chcp 65001 >nul
title Molia Strategy — Serverlarni To'xtatish
color 0c

echo =======================================================
echo          🛑 MOLIA STRATEGY — SERVERLARNI TO'XTATISH 🛑
echo =======================================================
echo.
echo Port 3000 (Frontend) va Port 5000 (Backend) to'xtatilmoqda...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo Barcha serverlar muvaffaqiyatli to'xtatildi!
timeout /t 2 >nul
exit
