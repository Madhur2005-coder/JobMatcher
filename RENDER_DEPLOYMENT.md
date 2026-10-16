# 🚀 SkillMatch — Render Deployment Guide

This guide explains how to fix the build error and deploy **SkillMatch** on [Render](https://render.com).

---

## ⚡ What Caused the Error?
When creating a Python Web Service on Render with default settings:
1. Render ran `pip install -r requirements.txt` at the root of the repository, but `requirements.txt` was located inside `backend/requirements.txt`.
2. Render defaulted to **Python 3.14.8** (preview version), which is incompatible with many scientific Python libraries (`numpy`, `bcrypt`, `scikit-learn`).

### ✅ What We Fixed in the Repository:
- Added [`requirements.txt`](requirements.txt) to the project root.
- Added [`.python-version`](.python-version) set to `3.11.9` (Render detects this automatically).
- Added [`main.py`](main.py) entrypoint in the root directory.
- Added a multi-stage [`Dockerfile`](Dockerfile) for 1-click full-stack deployment.

---

## 🎯 Choose Your Deployment Method

### Option 1 (Easiest & Recommended): Deploy as a Docker Web Service
This runs **both the React frontend and FastAPI backend** in a single container on 1 free Render web service.

1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect your repository: `https://github.com/Madhur2005-coder/JobMatcher`.
3. Set:
   - **Language / Runtime**: `Docker`
   - **Region**: Choose closest (e.g. `Oregon`, `Frankfurt`, `Singapore`)
   - **Plan**: `Free`
4. Under **Environment Variables**, add:
   - `SECRET_KEY`: *(Click "Generate" or enter random string)*
   - `DATABASE_URL`: `sqlite:///./job_matcher.db`
5. Click **Create Web Service**.

> Render will automatically detect the `Dockerfile`, install Node 20, build the React frontend, install Python 3.11 with all ML libraries, and launch the unified app!

---

### Option 2: Deploy as Native Python Web Service (Backend Only) + Free Static Site (Frontend)

If you prefer using Render's native Python runtime:

#### Step A: Deploy the Backend (Python Web Service)
1. Click **New +** → **Web Service** and connect your repository.
2. Set:
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
3. Under **Environment Variables**:
   - `PYTHON_VERSION`: `3.11.9`
   - `SECRET_KEY`: *(Click "Generate")*
   - `DATABASE_URL`: `sqlite:///./job_matcher.db`
4. Click **Create Web Service**. Once deployed, copy your backend URL (e.g., `https://skillmatch-api.onrender.com`).

#### Step B: Deploy the Frontend (Render Static Site — 100% Free)
1. Click **New +** → **Static Site** and connect your repository.
2. Set:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
3. Under **Environment Variables**:
   - `VITE_API_URL`: `https://skillmatch-api.onrender.com` *(paste your backend URL from Step A)*
4. Click **Create Static Site**.

---

## 🔑 Default Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@skillmatch.in` | `admin123` |
| **Student** | `ram@example.com` | `student123` |

Health check: `/api/health`  
Interactive Swagger docs: `/docs`
