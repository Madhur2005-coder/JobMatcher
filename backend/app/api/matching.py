from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

from app.database.session import get_db
from app.database.models import Job, Skill, Trade, StudentProfile, GovernmentScheme, User
from app.api.auth_deps import get_optional_current_user
from app.ml.matching_engine import matching_engine
from app.ml.salary_predictor import salary_predictor
from app.ml.knn_recommender import knn_recommender
from app.api.jobs import serialize_job

router = APIRouter(prefix="/matching", tags=["AI Matching & ML"])

class RecommendationRequest(BaseModel):
    trade_code: Optional[str] = None
    skills: Optional[List[str]] = []
    preferred_location: Optional[str] = None
    experience_years: Optional[float] = 0.0
    expected_salary_min: Optional[int] = 18000
    limit: Optional[int] = 10

class SalaryPredictionRequest(BaseModel):
    trade_code: str
    experience_years: float = 0.0
    location: str = "Pune"
    skills_count: int = 4
    qualification: Optional[str] = "ITI Passout"

class SkillGapRequest(BaseModel):
    job_id: Optional[int] = None
    trade_code: Optional[str] = None
    student_skills: List[str] = []

@router.post("/recommend")
def get_recommendations(
    req: RecommendationRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    # Construct profile parameters
    if current_user and current_user.student_profile:
        sp = current_user.student_profile
        trade_code = req.trade_code or (sp.trade.code if sp.trade else "welder")
        skills = req.skills if req.skills else [ss.skill.name for ss in sp.skills if ss.skill]
        preferred_location = req.preferred_location or sp.preferred_location
        experience_years = req.experience_years if req.experience_years is not None else sp.experience_years
        expected_salary_min = req.expected_salary_min or sp.expected_salary_min
    else:
        trade_code = req.trade_code or "welder"
        skills = req.skills or []
        preferred_location = req.preferred_location or "Pune"
        experience_years = req.experience_years or 0.0
        expected_salary_min = req.expected_salary_min or 18000

    student_profile = {
        "trade_code": trade_code,
        "skills": skills,
        "preferred_location": preferred_location,
        "experience_years": experience_years,
        "expected_salary_min": expected_salary_min
    }

    # Fetch active jobs
    jobs = db.query(Job).filter(Job.status == "active").all()
    serialized = [serialize_job(j, student_profile) for j in jobs]

    # Rank by AI match score
    serialized.sort(key=lambda x: x["match_score"] or 0.0, reverse=True)
    top_matches = serialized[:req.limit]

    return {
        "student_profile": student_profile,
        "total_ranked": len(serialized),
        "recommendations": top_matches
    }

@router.post("/predict-salary")
def predict_salary(req: SalaryPredictionRequest):
    result = salary_predictor.predict(
        trade_code=req.trade_code,
        experience_years=req.experience_years,
        location=req.location,
        skills_count=req.skills_count,
        qualification=req.qualification
    )
    return result

@router.post("/skill-gap")
def analyze_skill_gap(req: SkillGapRequest, db: Session = Depends(get_db)):
    student_skills_clean = [s.strip().lower() for s in req.student_skills if s]

    if req.job_id:
        job = db.query(Job).filter(Job.id == req.job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        required_skills = [js.skill.name for js in job.skills if js.skill]
        target_title = job.title
        target_trade = job.trade.name if job.trade else "Vocational Trade"
        target_trade_code = job.trade.code if job.trade else "welder"
    else:
        # Trade-wide common skills
        t_code = (req.trade_code or "welder").lower()
        trade = db.query(Trade).filter(Trade.code == t_code).first()
        target_title = f"{trade.name if trade else 'Trade'} General Benchmarks"
        target_trade = trade.name if trade else "Vocational Trade"
        target_trade_code = t_code
        trade_skills = db.query(Skill).filter(Skill.trade_id == trade.id).all() if trade else []
        required_skills = [s.name for s in trade_skills]

    matched = []
    missing = []
    for req_skill in required_skills:
        clean = req_skill.lower()
        if any(clean in ss or ss in clean for ss in student_skills_clean):
            matched.append(req_skill)
        else:
            missing.append(req_skill)

    total_req = max(1, len(required_skills))
    readiness_score = round((len(matched) / total_req) * 100.0, 1)

    # Link missing skills with relevant government schemes and training programs
    recommended_schemes = db.query(GovernmentScheme).filter(
        GovernmentScheme.status == "active",
        GovernmentScheme.category.in_(["Skill Development", "Apprenticeship", "Training"])
    ).limit(3).all()

    schemes_preview = [
        {
            "id": sc.id,
            "name": sc.name,
            "category": sc.category,
            "benefits": sc.benefits,
            "official_website": sc.official_website
        }
        for sc in recommended_schemes
    ]

    return {
        "target": target_title,
        "trade": target_trade,
        "readiness_score": readiness_score,
        "total_required": len(required_skills),
        "total_matched": len(matched),
        "matched_skills": matched,
        "missing_skills": missing,
        "recommendation": f"You possess {len(matched)} of {len(required_skills)} required technical proficiencies.",
        "recommended_programs": schemes_preview
    }

@router.post("/knn-recommend")
def knn_recommend(req: RecommendationRequest, db: Session = Depends(get_db)):
    # Fit KNN with all active jobs and skills
    all_skills = [s.name for s in db.query(Skill).filter(Skill.is_active == True).all()]
    jobs = db.query(Job).filter(Job.status == "active").all()
    jobs_serialized = [serialize_job(j) for j in jobs]

    knn_recommender.fit_jobs(jobs_serialized, all_skills)

    student_profile = {
        "trade_code": req.trade_code or "welder",
        "skills": req.skills or [],
        "experience_years": req.experience_years or 0.0,
        "expected_salary_min": req.expected_salary_min or 18000
    }

    job_ids = knn_recommender.find_similar_jobs(student_profile, top_k=req.limit or 5)
    matched_jobs = [j for j in jobs_serialized if j["id"] in job_ids]

    return {
        "algorithm": "K-Nearest Neighbors (Feature Vector Cosine Distance)",
        "student_profile": student_profile,
        "recommended_jobs": matched_jobs
    }
