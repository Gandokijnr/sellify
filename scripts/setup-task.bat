@echo off
powershell -Command "Start-Process powershell -ArgumentList '-ExecutionPolicy Bypass -File \"%~dp0setup-sitemap-task.ps1\"' -Verb RunAs"
pause
