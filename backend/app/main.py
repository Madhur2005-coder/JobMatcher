from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database.session import engine, Base
from app.database.seed_data import seed_database
from app.api import (
    auth, jobs, matching, schemes, institutes, skills,
    companies, apprenticeships, student, analytics, users
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables and seed data automatically
    Base.metadata.create_all(bind=engine)
    try:
        seed_database()
    except Exception as e:
        print(f"Database seed note: {e}")
    yield

app = FastAPI(
    title="SkillMatch - Vocational Skill-to-Local-Job Matcher API",
    description="Full-stack AI matching platform connecting ITI Welder, Electrician, and Fitter graduates with local manufacturing jobs, apprenticeships, and verified government schemes.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(jobs.router, prefix=settings.API_V1_STR)
app.include_router(matching.router, prefix=settings.API_V1_STR)
app.include_router(schemes.router, prefix=settings.API_V1_STR)
app.include_router(institutes.router, prefix=settings.API_V1_STR)
app.include_router(skills.router, prefix=settings.API_V1_STR)
app.include_router(companies.router, prefix=settings.API_V1_STR)
app.include_router(apprenticeships.router, prefix=settings.API_V1_STR)
app.include_router(student.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SkillMatch Backend API",
        "version": "1.0.0",
        "trades_supported": ["ITI Welder", "ITI Electrician", "ITI Fitter"]
    }

import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Determine if frontend dist directory exists for full-stack serving
frontend_dist_candidates = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")),
    os.path.abspath(os.path.join(os.getcwd(), "frontend", "dist")),
    os.path.abspath(os.path.join(os.getcwd(), "dist")),
]
frontend_dist = next((p for p in frontend_dist_candidates if os.path.isdir(p)), None)

if frontend_dist and os.path.isfile(os.path.join(frontend_dist, "index.html")):
    assets_path = os.path.join(frontend_dist, "assets")
    if os.path.isdir(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="frontend_assets")

    @app.get("/", include_in_schema=False)
    async def serve_index():
        return FileResponse(os.path.join(frontend_dist, "index.html"))

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path in ("docs", "redoc", "openapi.json"):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Not Found")
        candidate = os.path.join(frontend_dist, full_path)
        if os.path.isfile(candidate):
            return FileResponse(candidate)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "message": "Welcome to SkillMatch Vocational Job Matcher API",
            "docs_url": "/docs",
            "status": "online"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
