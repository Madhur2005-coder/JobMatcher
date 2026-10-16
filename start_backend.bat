@echo off
echo =========================================
echo  SkillMatch - Starting Backend Server
echo =========================================
cd /d %~dp0backend
echo Installing/checking Python dependencies...
pip install -q fastapi uvicorn sqlalchemy pydantic "python-jose[cryptography]" "passlib[bcrypt]" bcrypt scikit-learn numpy pandas python-multipart requests 2>nul
echo.
echo Starting FastAPI backend on http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
