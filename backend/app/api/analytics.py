from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List
from collections import Counter

from app.database.session import get_db
from app.database.models import (
    User, Job, Company, Institute, GovernmentScheme, Application, Trade, Skill, JobSkill
)
from app.api.auth_deps import get_current_admin_user
from app.ml.job_clusterer import job_clusterer
from app.api.jobs import serialize_job

router = APIRouter(prefix="/analytics", tags=["Admin Analytics"])

@router.get("")
def get_admin_analytics(db: Session = Depends(get_db)):
    # 1. KPI Counts
    total_students = db.query(User).filter(User.role == "student").count()
    total_jobs = db.query(Job).count()
    active_jobs = db.query(Job).filter(Job.status == "active").count()
    total_companies = db.query(Company).count()
    total_institutes = db.query(Institute).count()
    total_schemes = db.query(GovernmentScheme).count()
    total_applications = db.query(Application).count()

    # 2. Jobs by Trade
    trades = db.query(Trade).all()
    jobs_by_trade = []
    salary_by_trade = []
    for t in trades:
        t_jobs = db.query(Job).filter(Job.trade_id == t.id).all()
        count = len(t_jobs)
        if count > 0:
            avg_salary = int(sum((j.salary_min + j.salary_max) / 2 for j in t_jobs) / count)
        else:
            avg_salary = 18000
        jobs_by_trade.append({
            "trade": t.name,
            "code": t.code,
            "count": count
        })
        salary_by_trade.append({
            "trade": t.name,
            "average_salary": avg_salary,
            "min_salary": min([j.salary_min for j in t_jobs]) if t_jobs else 15000,
            "max_salary": max([j.salary_max for j in t_jobs]) if t_jobs else 30000
        })

    # 3. Jobs by City / Location
    city_counts = db.query(Job.city, func.count(Job.id)).group_by(Job.city).order_by(func.count(Job.id).desc()).limit(7).all()
    jobs_by_location = [{"city": c[0], "count": c[1]} for c in city_counts]

    # 4. Most In-Demand Skills
    all_job_skills = db.query(Skill.name, func.count(JobSkill.id))\
        .join(JobSkill, Skill.id == JobSkill.skill_id)\
        .group_by(Skill.name)\
        .order_by(func.count(JobSkill.id).desc())\
        .limit(10).all()
    most_in_demand_skills = [{"skill": s[0], "job_count": s[1]} for s in all_job_skills]

    # 5. Schemes by Category
    category_counts = db.query(GovernmentScheme.category, func.count(GovernmentScheme.id)).group_by(GovernmentScheme.category).all()
    schemes_by_category = [{"category": c[0], "count": c[1]} for c in category_counts]

    # 6. K-Means Job Clustering
    all_jobs = db.query(Job).filter(Job.status == "active").all()
    serialized_jobs = [serialize_job(j) for j in all_jobs]
    clustering_results = job_clusterer.cluster_jobs(serialized_jobs)

    # 7. Recent Applications
    recent_apps = db.query(Application).order_by(Application.applied_at.desc()).limit(6).all()
    recent_applications = [
        {
            "id": a.id,
            "candidate_name": a.user.full_name if a.user else "Candidate",
            "candidate_email": a.user.email if a.user else "",
            "job_title": a.job.title if a.job else "Job",
            "company_name": a.job.company.name if a.job and a.job.company else "Company",
            "applied_at": a.applied_at,
            "status": a.status
        }
        for a in recent_apps
    ]

    return {
        "kpis": {
            "students": total_students,
            "jobs": total_jobs,
            "active_jobs": active_jobs,
            "companies": total_companies,
            "institutes": total_institutes,
            "schemes": total_schemes,
            "applications": total_applications
        },
        "jobs_by_trade": jobs_by_trade,
        "salary_by_trade": salary_by_trade,
        "jobs_by_location": jobs_by_location,
        "most_in_demand_skills": most_in_demand_skills,
        "schemes_by_category": schemes_by_category,
        "kmeans_clustering": clustering_results,
        "recent_applications": recent_applications
    }
