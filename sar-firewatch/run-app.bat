@echo off
title SAR FireWatch - Forest Fire Monitoring & SAR Operations Dashboard
echo ===================================================================
echo     SAR FIREWATCH - PUSAT OPERASI SAR KARHUTLA TERPADU
echo ===================================================================
echo Memulai server lokal SAR FireWatch...

if exist "C:\Users\mco-user\AppData\Roaming\Antigravity\bin\agy-node.cmd" (
    start "" "C:\Users\mco-user\AppData\Roaming\Antigravity\bin\agy-node.cmd" "%~dp0server.js"
    timeout /t 2 >nul
    start http://localhost:3000
) else (
    echo Membuka langsung berkas index.html di peramban web...
    start "" "%~dp0index.html"
)

echo Aplikasi berhasil dibuka di peramban web Anda!
pause
