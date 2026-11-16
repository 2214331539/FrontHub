@echo off
setlocal
title FrontHub
pushd "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo [FrontHub] Node.js was not found. Please install Node.js 22 or newer.
  echo Download: https://nodejs.org/
  pause
  popd
  exit /b 1
)

node "tools\start.mjs" %*
set "FRONTHUB_EXIT_CODE=%ERRORLEVEL%"
if not "%FRONTHUB_EXIT_CODE%"=="0" pause
popd
exit /b %FRONTHUB_EXIT_CODE%
