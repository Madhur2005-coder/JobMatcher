from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any

from app.database.session import get_db
from app.database.models import (
    User, StudentProfile, StudentSkill, Skill, Trade, Job, SavedJob, Application, GovernmentScheme
)
from app.schemas.all_schemas import StudentProfileUpdate, ApplicationCreate
from app.api.auth_deps import get_current_user
from app.api.jobs import serialize_job
from app.ml.matching_engine import matching_engine
from app.ml.salary_predictor import salary_predictor

router = APIRouter(prefix="/student", tags=["Student Profile & Activity"])

@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sp = current_user.student_profile
    if not sp:
        # Create default profile if missing
        trade = db.query(Trade).first()
        sp = StudentProfile(
            user_id=current_user.id,
            trade_id=trade.id if trade else None,
            preferred_location="Pune",
            experience_years=0.0,
            expected_salary_min=18000,
            expected_salary_max=24000
        )
        db.add(sp)
        db.commit()
        db.refresh(sp)

    skills = [ss.skill.name for ss in sp.skills if ss.skill]
    return {
        "id": sp.id,
        "user_id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "trade_id": sp.trade_id,
        "trade_code": sp.trade.code if sp.trade else "welder",
        "trade_name": sp.trade.name if sp.trade else "ITI Welder",
        "qualification": sp.qualification,
        "experience_years": sp.experience_years,
        "preferred_location": sp.preferred_location,
        "expected_salary_min": sp.expected_salary_min,
        "expected_salary_max": sp.expected_salary_max,
        "bio": sp.bio,
        "institute_name": sp.institute_name,
        "year_of_passing": sp.year_of_passing,
        "skills": skills
    }

@router.put("/profile")
def update_profile(
    profile_in: StudentProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sp = current_user.student_profile
    if not sp:
        raise HTTPException(status_code=404, detail="Student profile not found")

    if profile_in.trade_code:
        trade = db.query(Trade).filter(Trade.code == profile_in.trade_code.lower()).first()
        if trade:
            sp.trade_id = trade.id

    if profile_in.qualification is not None:
        sp.qualification = profile_in.qualification
    if profile_in.experience_years is not None:
        sp.experience_years = profile_in.experience_years
    if profile_in.preferred_location is not None:
        sp.preferred_location = profile_in.preferred_location
    if profile_in.expected_salary_min is not None:
        sp.expected_salary_min = profile_in.expected_salary_min
        sp.expected_salary_max = profile_in.expected_salary_min + 6000
    if profile_in.expected_salary_max is not None:
        sp.expected_salary_max = profile_in.expected_salary_max
    if profile_in.bio is not None:
        sp.bio = profile_in.bio
    if profile_in.institute_name is not None:
        sp.institute_name = profile_in.institute_name
    if profile_in.year_of_passing is not None:
        sp.year_of_passing = profile_in.year_of_passing

    if profile_in.skills is not None:
        # Clear existing skills and associate new
        db.query(StudentSkill).filter(StudentSkill.student_profile_id == sp.id).delete()
        for sname in profile_in.skills:
            skill = db.query(Skill).filter(Skill.name.ilike(sname.strip())).first()
            if not skill and sp.trade_id:
                skill = Skill(name=sname.strip(), trade_id=sp.trade_id, is_active=True)
                db.add(skill)
                db.flush()
            if skill:
                db.add(StudentSkill(student_profile_id=sp.id, skill_id=skill.id, proficiency_level="Intermediate"))

    db.commit()
    db.refresh(sp)
    return get_profile(current_user, db)

@router.get("/saved-jobs")
def get_saved_jobs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    saved = db.query(SavedJob).filter(SavedJob.user_id == current_user.id).all()
    sp = current_user.student_profile
    student_profile_dict = None
    if sp:
        student_profile_dict = {
            "trade_code": sp.trade.code if sp.trade else "",
            "skills": [ss.skill.name for ss in sp.skills if ss.skill],
            "experience_years": sp.experience_years,
            "preferred_location": sp.preferred_location,
            "expected_salary_min": sp.expected_salary_min
        }

    return [
        {
            "id": s.id,
            "job_id": s.job_id,
            "saved_at": s.saved_at,
            "job": serialize_job(s.job, student_profile_dict)
        }
        for s in saved if s.job
    ]

@router.post("/saved-jobs/{job_id}")
def toggle_save_job(job_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    existing = db.query(SavedJob).filter(SavedJob.user_id == current_user.id, SavedJob.job_id == job_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"saved": False, "message": "Job removed from saved list"}
    else:
        new_save = SavedJob(user_id=current_user.id, job_id=job_id)
        db.add(new_save)
        db.commit()
        return {"saved": True, "message": "Job saved successfully"}

@router.get("/applications")
def get_applications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    apps = db.query(Application).filter(Application.user_id == current_user.id).order_by(Application.applied_at.desc()).all()
    return [
        {
            "id": a.id,
            "job_id": a.job_id,
            "job_title": a.job.title if a.job else "Job Position",
            "company_name": a.job.company.name if a.job and a.job.company else "Company",
            "location": a.job.location if a.job else "",
            "city": a.job.city if a.job else "",
            "salary_range": f"₹{a.job.salary_min:,} – ₹{a.job.salary_max:,} / mo" if a.job else "",
            "trade_name": a.job.trade.name if a.job and a.job.trade else "",
            "status": a.status,
            "cover_note": a.cover_note,
            "applied_at": a.applied_at
        }
        for a in apps
    ]

@router.post("/applications", status_code=status.HTTP_201_CREATED)
def apply_job(app_in: ApplicationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == app_in.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    existing = db.query(Application).filter(Application.user_id == current_user.id, Application.job_id == app_in.job_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied for this position")

    app = Application(
        user_id=current_user.id,
        job_id=app_in.job_id,
        cover_note=app_in.cover_note or "Applied via SkillMatch Vocational Job Portal",
        status="Applied"
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return {"message": "Application submitted successfully", "application_id": app.id}

@router.get("/dashboard")
def get_dashboard_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sp = current_user.student_profile
    if not sp:
        return get_profile(current_user, db)

    skills_list = [ss.skill.name for ss in sp.skills if ss.skill]
    student_profile_dict = {
        "trade_code": sp.trade.code if sp.trade else "welder",
        "trade_name": sp.trade.name if sp.trade else "ITI Welder",
        "skills": skills_list,
        "experience_years": sp.experience_years,
        "preferred_location": sp.preferred_location,
        "expected_salary_min": sp.expected_salary_min,
        "qualification": sp.qualification
    }

    # 1. Profile Completion Percentage
    completion_checks = [
        bool(current_user.full_name),
        bool(current_user.phone),
        bool(sp.trade_id),
        bool(sp.preferred_location),
        bool(sp.qualification),
        len(skills_list) >= 3,
        bool(sp.institute_name),
        bool(sp.bio)
    ]
    completion_pct = int(round((sum(1 for c in completion_checks if c) / len(completion_checks)) * 100))

    # 2. Top AI Job Matches (Ranked by Scikit-learn multi-factor TF-IDF score)
    active_jobs = db.query(Job).filter(Job.status == "active").all()
    ranked_jobs = [serialize_job(j, student_profile_dict) for j in active_jobs]
    ranked_jobs.sort(key=lambda x: x["match_score"] or 0.0, reverse=True)
    top_matches = ranked_jobs[:5]

    # 3. Overall Market Skill Gap for Student's Trade
    trade_id = sp.trade_id
    all_trade_skills = db.query(Skill).filter(Skill.trade_id == trade_id).all() if trade_id else []
    trade_skill_names = [s.name for s in all_trade_skills]
    missing_in_market = [s for s in trade_skill_names if s.lower() not in [sk.lower() for sk in skills_list]]

    # 4. Salary Prediction
    salary_res = salary_predictor.predict(
        trade_code=sp.trade.code if sp.trade else "welder",
        experience_years=sp.experience_years,
        location=sp.preferred_location,
        skills_count=len(skills_list),
        qualification=sp.qualification
    )

    # 5. Personalized Government Schemes (Ranked by student's trade & location)
    schemes = db.query(GovernmentScheme).filter(GovernmentScheme.status == "active").all()
    personalized_schemes = []
    for sc in schemes:
        rel_score = 75.0
        applicable_codes = [t.code for t in sc.trades]
        if student_profile_dict["trade_code"] in applicable_codes or not applicable_codes:
            rel_score += 15.0
        if sc.state == "All India" or sp.preferred_location.lower() in sc.state.lower():
            rel_score += 10.0
        personalized_schemes.append({
            "id": sc.id,
            "name": sc.name,
            "category": sc.category,
            "description": sc.description,
            "benefits": sc.benefits,
            "eligibility_criteria": sc.eligibility_criteria,
            "official_website": sc.official_website,
            "relevance_score": min(98.0, rel_score)
        })
    personalized_schemes.sort(key=lambda x: x["relevance_score"], reverse=True)

    # Counts
    saved_count = db.query(SavedJob).filter(SavedJob.user_id == current_user.id).count()
    applied_count = db.query(Application).filter(Application.user_id == current_user.id).count()

    return {
        "user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "trade_name": student_profile_dict["trade_name"],
            "trade_code": student_profile_dict["trade_code"],
            "location": sp.preferred_location,
            "experience_years": sp.experience_years
        },
        "profile_completion": completion_pct,
        "top_job_matches": top_matches,
        "skill_gap": {
            "possessed_skills": skills_list,
            "skills_to_improve": missing_in_market[:4],
            "total_trade_skills": len(trade_skill_names),
            "acquired_count": len(skills_list)
        },
        "salary_prediction": salary_res,
        "recommended_schemes": personalized_schemes[:4],
        "stats": {
            "total_available_jobs": len(active_jobs),
            "saved_jobs_count": saved_count,
            "applied_jobs_count": applied_count
        }
    }
