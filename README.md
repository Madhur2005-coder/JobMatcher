# SkillMatch — Vocational Skill-to-Local-Job Matcher

AI-powered full-stack platform connecting ITI/Polytechnic graduates with verified local manufacturing jobs, apprenticeships, and government schemes.

---

## 🚀 Quick Start

### 1. Start the Backend (FastAPI)
```bat
start_backend.bat
```
Or manually:
```powershell
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Backend runs at: http://localhost:8000  
API Docs (Swagger): http://localhost:8000/docs

### 2. Start the Frontend (React + Vite)
```bat
start_frontend.bat
```
Or manually:
```powershell
cd frontend
npm run dev
```
Frontend runs at: http://localhost:5173

---

## 🔑 Default Credentials

| Role    | Email              | Password   |
|---------|--------------------|------------|
| Admin   | admin@skillmatch.in | admin123  |
| Student | ram@example.com     | student123 |

---

## 🏗️ Project Structure

```
jobMatcher/
├── backend/                    # FastAPI Python backend
│   ├── app/
│   │   ├── main.py             # Application entry point
│   │   ├── config.py           # Settings & config
│   │   ├── api/                # REST API endpoints
│   │   │   ├── auth.py         # Register / Login (JWT)
│   │   │   ├── jobs.py         # Job listings & search
│   │   │   ├── matching.py     # AI matching endpoints
│   │   │   ├── schemes.py      # Government schemes
│   │   │   ├── institutes.py   # Institutes listing
│   │   │   ├── student.py      # Student profile & activity
│   │   │   ├── analytics.py    # Dashboard analytics
│   │   │   └── users.py        # Admin user management
│   │   ├── database/
│   │   │   ├── models.py       # SQLAlchemy ORM models
│   │   │   ├── session.py      # DB session setup
│   │   │   └── seed_data.py    # Auto-seeded sample data
│   │   └── ml/
│   │       ├── matching_engine.py  # TF-IDF + Cosine similarity
│   │       ├── salary_predictor.py # Ridge regression salary model
│   │       ├── knn_recommender.py  # KNN job recommendations
│   │       ├── job_clusterer.py    # K-Means clustering
│   │       └── pipeline.py        # Unified ML pipeline
│   └── requirements.txt
│
└── frontend/                   # React + Vite + Tailwind CSS
    └── src/
        ├── pages/
        │   ├── HomePage.jsx          # Landing page
        │   ├── JobsPage.jsx          # Job search & filtering
        │   ├── JobDetailPage.jsx     # Job details + apply
        │   ├── LoginPage.jsx         # Student/admin login
        │   ├── RegisterPage.jsx      # 2-step student registration
        │   ├── StudentDashboard.jsx  # AI recommendations, saved, apps
        │   ├── StudentProfile.jsx    # Profile editor + skills
        │   ├── AdminDashboard.jsx    # Full admin CRUD panel
        │   ├── GovernmentSchemesPage.jsx
        │   ├── InstitutesPage.jsx
        │   └── ApprenticeshipsPage.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── JobCard.jsx
        │   └── SchemeCard.jsx
        ├── context/AuthContext.jsx   # JWT auth state
        └── services/api.js           # Axios API client
```

---

## 🤖 AI/ML Features

| Algorithm | Usage |
|-----------|-------|
| TF-IDF + Cosine Similarity | Match student skills to job descriptions |
| Weighted Multi-factor Scoring | Trade fit + location + experience |
| KNN (K-Nearest Neighbors) | "Jobs like this" recommendations |
| K-Means Clustering | Job role clustering in analytics |
| Ridge Regression | Predicted salary estimation |

---

## 📊 Data Summary (Auto-seeded)

- **54 Jobs** across Welder, Electrician, Fitter trades
- **20 Companies** (Tata Motors, Mahindra, Siemens, Bosch, etc.)
- **15 Institutes** (ITIs and Polytechnics)
- **8 Government Schemes** (PMKVY, NAPS, etc.)
- **35+ Skills** mapped to trades

---

## 🛠️ Tech Stack

**Backend:** Python 3.x, FastAPI, SQLAlchemy, SQLite, scikit-learn, JWT  
**Frontend:** React 18, Vite, Tailwind CSS 3, React Router 6, Axios, Recharts  
**AI/ML:** scikit-learn (TF-IDF, KNN, KMeans, Ridge Regression), NumPy, Pandas
