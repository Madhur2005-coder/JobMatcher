from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any

from app.database.session import get_db
from app.database.models import Job, JobSkill, Skill, Trade, Company, User
from app.schemas.all_schemas import JobCreate, JobUpdate, JobResponse
from app.api.auth_deps import get_current_admin_user, get_optional_current_user
from app.ml.matching_engine import matching_engine

router = APIRouter(prefix="/jobs", tags=["Jobs"])

def serialize_job(job: Job, student_profile_dict: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    skills = [js.skill.name for js in job.skills if js.skill]
    job_dict = {
        "id": job.id,
        "title": job.title,
        "company_id": job.company_id,
        "company_name": job.company.name if job.company else "Unknown Company",
        "company_logo": job.company.logo_url if job.company else None,
        "company_industry": job.company.industry if job.company else "Manufacturing",
        "company_website": job.company.website if job.company else None,
        "trade_id": job.trade_id,
        "trade_code": job.trade.code if job.trade else "",
        "trade_name": job.trade.name if job.trade else "",
        "description": job.description,
        "responsibilities": job.responsibilities,
        "qualification": job.qualification,
        "experience_min": job.experience_min,
        "experience_max": job.experience_max,
        "salary_min": job.salary_min,
        "salary_max": job.salary_max,
        "salary_type": job.salary_type,
        "location": job.location,
        "city": job.city,
        "state": job.state,
        "job_type": job.job_type,
        "application_url": job.application_url,
        "status": job.status,
        "created_at": job.created_at,
        "skills": skills
    }

    if student_profile_dict:
        match_info = matching_engine.calculate_match(student_profile_dict, job_dict)
        job_dict["match_score"] = match_info["score"]
        job_dict["match_breakdown"] = match_info["breakdown"]
        job_dict["matched_skills"] = match_info["matched_skills"]
        job_dict["missing_skills"] = match_info["missing_skills"]
        job_dict["why_reasons"] = match_info["why_reasons"]
    else:
        job_dict["match_score"] = None
        job_dict["match_breakdown"] = None
        job_dict["matched_skills"] = []
        job_dict["missing_skills"] = []
        job_dict["why_reasons"] = []

    return job_dict

@router.get("")
def list_jobs(
    q: Optional[str] = None,
    trade: Optional[str] = None,
    location: Optional[str] = None,
    experience: Optional[str] = None, # 'fresher', '0-1', '1-3', '3+'
    min_salary: Optional[int] = None,
    max_salary: Optional[int] = None,
    job_type: Optional[str] = None,
    skill: Optional[str] = None,
    status_filter: Optional[str] = "active",
    sort_by: Optional[str] = "best_match", # 'best_match', 'newest', 'salary_high', 'salary_low'
    limit: int = 50,
    offset: int = 0,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Job)

    if status_filter and status_filter != "all":
        query = query.filter(Job.status == status_filter)

    if trade:
        # trade can be code or name
        query = query.join(Trade).filter((Trade.code.ilike(trade)) | (Trade.name.ilike(f"%{trade}%")))

    if location:
        query = query.filter((Job.city.ilike(f"%{location}%")) | (Job.state.ilike(f"%{location}%")) | (Job.location.ilike(f"%{location}%")))

    if q:
        query = query.filter((Job.title.ilike(f"%{q}%")) | (Job.description.ilike(f"%{q}%")))

    if min_salary:
        query = query.filter(Job.salary_max >= min_salary)

    if max_salary:
        query = query.filter(Job.salary_min <= max_salary)

    if job_type:
        query = query.filter(Job.job_type.ilike(f"%{job_type}%"))

    if experience:
        if experience == "fresher":
            query = query.filter(Job.experience_min == 0.0)
        elif experience in ["0-1", "0-1 years"]:
            query = query.filter(Job.experience_min <= 1.0)
        elif experience in ["1-3", "1-3 years"]:
            query = query.filter((Job.experience_max >= 1.0) & (Job.experience_min <= 3.0))
        elif experience in ["3+", "3+ years"]:
            query = query.filter(Job.experience_max >= 3.0)

    # If skill filter applied
    if skill:
        query = query.join(JobSkill).join(Skill).filter(Skill.name.ilike(f"%{skill}%"))

    all_matching_jobs = query.distinct().all()
    total_count = len(all_matching_jobs)

    # Build student profile for AI matching if user is logged in
    student_profile_dict = None
    if current_user and current_user.student_profile:
        sp = current_user.student_profile
        student_profile_dict = {
            "trade_code": sp.trade.code if sp.trade else "",
            "skills": [ss.skill.name for ss in sp.skills if ss.skill],
            "experience_years": sp.experience_years,
            "preferred_location": sp.preferred_location,
            "expected_salary_min": sp.expected_salary_min
        }

    serialized = [serialize_job(j, student_profile_dict) for j in all_matching_jobs]

    # Sorting
    if sort_by == "best_match" and student_profile_dict:
        serialized.sort(key=lambda x: x.get("match_score") or 0.0, reverse=True)
    elif sort_by == "salary_high":
        serialized.sort(key=lambda x: x["salary_max"], reverse=True)
    elif sort_by == "salary_low":
        serialized.sort(key=lambda x: x["salary_min"])
    else: # newest
        serialized.sort(key=lambda x: x["created_at"] or "", reverse=True)

    paginated = serialized[offset : offset + limit]

    return {
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "jobs": paginated
    }

@router.get("/{job_id}")
def get_job(
    job_id: int,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job position not found")

    student_profile_dict = None
    if current_user and current_user.student_profile:
        sp = current_user.student_profile
        student_profile_dict = {
            "trade_code": sp.trade.code if sp.trade else "",
            "skills": [ss.skill.name for ss in sp.skills if ss.skill],
            "experience_years": sp.experience_years,
            "preferred_location": sp.preferred_location,
            "expected_salary_min": sp.expected_salary_min
        }

    job_data = serialize_job(job, student_profile_dict)

    # Also fetch similar jobs in the same trade
    similar_query = db.query(Job).filter(Job.trade_id == job.trade_id, Job.id != job.id, Job.status == "active").limit(4).all()
    job_data["similar_jobs"] = [serialize_job(sj, student_profile_dict) for sj in similar_query]

    return job_data

@router.post("", status_code=status.HTTP_201_CREATED)
def create_job(
    job_in: JobCreate,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    new_job = Job(
        title=job_in.title,
        company_id=job_in.company_id,
        trade_id=job_in.trade_id,
        description=job_in.description,
        responsibilities=job_in.responsibilities,
        qualification=job_in.qualification,
        experience_min=job_in.experience_min,
        experience_max=job_in.experience_max,
        salary_min=job_in.salary_min,
        salary_max=job_in.salary_max,
        salary_type=job_in.salary_type,
        location=job_in.location,
        city=job_in.city,
        state=job_in.state,
        job_type=job_in.job_type,
        application_url=job_in.application_url,
        status=job_in.status or "active"
    )
    db.add(new_job)
    db.flush()

    if job_in.skill_names:
        for sname in job_in.skill_names:
            skill = db.query(Skill).filter(Skill.name.ilike(sname.strip())).first()
            if not skill:
                skill = Skill(name=sname.strip(), trade_id=job_in.trade_id, is_active=True)
                db.add(skill)
                db.flush()
            js = JobSkill(job_id=new_job.id, skill_id=skill.id, is_required=True)
            db.add(js)

    db.commit()
    db.refresh(new_job)
    return serialize_job(new_job)

@router.put("/{job_id}")
def update_job(
    job_id: int,
    job_in: JobUpdate,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    update_data = job_in.dict(exclude_unset=True)
    skill_names = update_data.pop("skill_names", None)

    for field, val in update_data.items():
        setattr(job, field, val)

    if skill_names is not None:
        db.query(JobSkill).filter(JobSkill.job_id == job.id).delete()
        for sname in skill_names:
            skill = db.query(Skill).filter(Skill.name.ilike(sname.strip())).first()
            if not skill:
                skill = Skill(name=sname.strip(), trade_id=job.trade_id, is_active=True)
                db.add(skill)
                db.flush()
            db.add(JobSkill(job_id=job.id, skill_id=skill.id, is_required=True))

    db.commit()
    db.refresh(job)
    return serialize_job(job)

@router.delete("/{job_id}")
def delete_job(
    job_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully", "job_id": job_id}

@router.patch("/{job_id}/toggle-status")
def toggle_job_status(
    job_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    job.status = "inactive" if job.status == "active" else "active"
    db.commit()
    return {"message": f"Job status set to {job.status}", "status": job.status}
