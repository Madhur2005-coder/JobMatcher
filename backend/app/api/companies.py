from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database.session import get_db
from app.database.models import Company, Job, User
from app.schemas.all_schemas import CompanyCreate, CompanyResponse
from app.api.auth_deps import get_current_admin_user

router = APIRouter(prefix="/companies", tags=["Companies"])

@router.get("", response_model=List[CompanyResponse])
def list_companies(
    city: Optional[str] = None,
    industry: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Company).filter(Company.status == "active")

    if q:
        query = query.filter((Company.name.ilike(f"%{q}%")) | (Company.industry.ilike(f"%{q}%")))

    if city:
        query = query.filter(Company.city.ilike(f"%{city}%"))

    if industry:
        query = query.filter(Company.industry.ilike(f"%{industry}%"))

    return query.all()

@router.get("/{company_id}")
def get_company(company_id: int, db: Session = Depends(get_db)):
    comp = db.query(Company).filter(Company.id == company_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Company not found")

    jobs = db.query(Job).filter(Job.company_id == comp.id, Job.status == "active").all()

    return {
        "id": comp.id,
        "name": comp.name,
        "industry": comp.industry,
        "location": comp.location,
        "city": comp.city,
        "state": comp.state,
        "description": comp.description,
        "website": comp.website,
        "contact_email": comp.contact_email,
        "contact_phone": comp.contact_phone,
        "logo_url": comp.logo_url,
        "is_verified": comp.is_verified,
        "status": comp.status,
        "open_jobs": [
            {
                "id": j.id,
                "title": j.title,
                "trade_name": j.trade.name if j.trade else "",
                "salary_min": j.salary_min,
                "salary_max": j.salary_max,
                "location": j.location,
                "job_type": j.job_type
            }
            for j in jobs
        ]
    }

@router.post("", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
def create_company(
    comp_in: CompanyCreate,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    comp = Company(**comp_in.dict())
    db.add(comp)
    db.commit()
    db.refresh(comp)
    return comp

@router.put("/{company_id}", response_model=CompanyResponse)
def update_company(
    company_id: int,
    comp_in: CompanyCreate,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    comp = db.query(Company).filter(Company.id == company_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Company not found")

    for field, val in comp_in.dict().items():
        setattr(comp, field, val)

    db.commit()
    db.refresh(comp)
    return comp

@router.delete("/{company_id}")
def delete_company(
    company_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    comp = db.query(Company).filter(Company.id == company_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Company not found")

    db.delete(comp)
    db.commit()
    return {"message": "Company deleted successfully", "id": company_id}
