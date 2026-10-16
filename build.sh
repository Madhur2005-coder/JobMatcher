#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "=================================================="
echo " Starting SkillMatch Production Build for Render"
echo "=================================================="

# 1. Install Python dependencies
echo "--> Installing Python backend dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

# 2. Build Frontend
echo "--> Installing frontend dependencies and building assets..."
cd frontend
npm install
npm run build
cd ..

echo "=================================================="
echo " Build Completed Successfully! Ready to launch."
echo "=================================================="
