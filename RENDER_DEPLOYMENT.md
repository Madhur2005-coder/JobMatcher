# 🚀 SkillMatch — Render Deployment Guide

This guide provides complete, step-by-step instructions to host the **SkillMatch** platform on [Render](https://render.com).

---

## 📑 Table of Contents
1. [Prerequisites & Git Push](#1-prerequisites--push-to-github)
2. [Method 1: Unified Full-Stack Service (Recommended)](#2-method-1-unified-full-stack-service-recommended)
3. [Method 2: Dual Services (Backend Web Service + Free Static Site)](#3-method-2-dual-services-web-service--static-site)
4. [Method 3: One-Click Deploy via Render Blueprint](#4-method-3-one-click-deploy-via-render-blueprint)
5. [Default Credentials & Verification](#5-default-credentials--verification)
6. [Render Free Tier Tips & Troubleshooting](#6-render-free-tier-tips--troubleshooting)

---

## 1. Prerequisites & Push to GitHub

Render deploys directly from a GitHub or GitLab repository.

### Step 1.1: Commit your changes locally
Open PowerShell in the project directory (`jobMatcher`) and run:
```powershell
git add .
git commit -m "Prepare SkillMatch for Render deployment"
```

### Step 1.2: Create a repository on GitHub
1. Go to [GitHub.com/new](https://github.com/new).
2. Name your repository (e.g. `jobMatcher` or `skillmatch`).
3. Keep it **Public** (or Private).
4. Click **Create repository** (do not initialize with README, as we already have one).

### Step 1.3: Link and push
```powershell
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/jobMatcher.git
git branch -M main
git push -u origin main
```

---

## 2. Method 1: Unified Full-Stack Service (Recommended)

> **Why this is best:**
> - Runs both the React frontend and FastAPI backend on **a single Render service**.
> - Uses only **1 free web service slot** (fits perfectly inside Render's 750 free hours/month limit).
> - **Zero CORS issues** because both frontend and API share the exact same domain.
> - Client-side routing (React Router) works seamlessly.

### Step-by-Step Setup:
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your `jobMatcher` repository.
4. Fill in the following settings:

| Field | Value |
|---|---|
| **Name** | `skillmatch` (or your preferred name) |
| **Language / Runtime** | `Python` |
| **Region** | Choose nearest (e.g., `Oregon`, `Frankfurt`, `Singapore`) |
| **Branch** | `main` |
| **Root Directory** | *(Leave blank)* |
| **Build Command** | `bash build.sh` |
| **Start Command** | `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | `Free` |

5. Under **Environment Variables**, add:

| Key | Value | Notes |
|---|---|---|
| `PYTHON_VERSION` | `3.11.9` | Ensures compatible Python runtime |
| `SECRET_KEY` | *(Click "Generate" or enter a secure random string)* | Used for JWT signing |
| `DATABASE_URL` | `sqlite:///./job_matcher.db` | Auto-creates and seeds SQLite database |

6. *(Optional)* Click **Advanced** and set:
   - **Health Check Path**: `/api/health`
7. Click **Create Web Service**.

Render will run `bash build.sh`, install backend dependencies, build the React frontend into `frontend/dist`, and start the FastAPI server. Once deployed, open your Render URL (e.g., `https://skillmatch.onrender.com`).

---

## 3. Method 2: Dual Services (Web Service + Static Site)

If you prefer separating the frontend from the backend:
- **Backend API**: Render Web Service (Python)
- **Frontend App**: Render Static Site (100% Free, zero cold start for static assets)

### Step 2.1: Deploy Backend Web Service
1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect your repo and set:
   - **Name**: `skillmatch-api`
   - **Language**: `Python`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
   - **Health Check Path**: `/api/health`
3. Add Environment Variables:
   - `PYTHON_VERSION` = `3.11.9`
   - `SECRET_KEY` = *(Generate random key)*
   - `DATABASE_URL` = `sqlite:///./job_matcher.db`
4. Click **Create Web Service** and copy your backend URL (e.g. `https://skillmatch-api.onrender.com`).

### Step 2.2: Deploy Frontend Static Site
1. Click **New +** → **Static Site**.
2. Connect the same repository and set:
   - **Name**: `skillmatch-web`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
3. Under **Environment Variables**, add:
   - `VITE_API_URL` = `https://skillmatch-api.onrender.com` *(replace with your actual backend URL from Step 2.1)*
4. Under **Redirects / Rewrites**, add:
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`
   *(Note: `frontend/public/_redirects` is already included to handle this automatically)*
5. Click **Create Static Site**.

---

## 4. Method 3: One-Click Deploy via Render Blueprint

A ready-to-use [`render.yaml`](render.yaml) is already included in the project root!

1. Push your repository to GitHub.
2. In Render Dashboard, click **New +** → **Blueprint**.
3. Select your repository.
4. Render will parse `render.yaml` and configure the service automatically.
5. Click **Apply** to deploy!

---

## 5. Default Credentials & Verification

Once your deployment is live:

### 🔑 Pre-seeded Login Accounts

| Role | Email | Password | Access |
|---|---|---|---|
| **Admin** | `admin@skillmatch.in` | `admin123` | Full Admin CRUD, analytics, manage jobs & schemes |
| **Student** | `ram@example.com` | `student123` | ITI Welder profile, AI matching, job applications |

### 🔍 Verification Endpoints
- **Home / App**: `https://<your-render-url>/`
- **API Health Check**: `https://<your-render-url>/api/health`
- **Interactive Swagger Docs**: `https://<your-render-url>/docs`
- **ReDoc Documentation**: `https://<your-render-url>/redoc`

---

## 6. Render Free Tier Tips & Troubleshooting

### Free Tier "Spin Down" (Cold Start)
- Render Free Web Services spin down after 15 minutes of inactivity.
- When you or an employer visit the site after it has slept, the first request will take **30–50 seconds** while the container starts back up. Subsequent requests will be fast.
- *Tip:* You can use a free monitoring service like [UptimeRobot](https://uptimerobot.com) to ping `https://<your-url>/api/health` every 14 minutes to keep it warm.

### Persistent Database
- The default setup uses SQLite (`job_matcher.db`) which automatically creates and seeds 54 jobs, 20 companies, 15 institutes, and 8 government schemes on startup.
- If you want persistent data that survives container restarts, you can create a free **PostgreSQL Database** on Render:
  1. Click **New +** → **PostgreSQL**.
  2. Copy the **Internal Database URL**.
  3. In your Web Service settings, update `DATABASE_URL` with that URL.
  4. The backend automatically translates `postgres://` to `postgresql://` and seeds the tables on initial connection!
