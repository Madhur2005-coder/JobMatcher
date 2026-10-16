@echo off
echo =========================================
echo  SkillMatch - Starting Frontend Server
echo =========================================
cd /d %~dp0frontend
echo Installing npm dependencies if needed...
if not exist node_modules (
  echo Running npm install...
  npm install
)
echo.
echo Starting React frontend on http://localhost:5173
echo.
npm run dev
