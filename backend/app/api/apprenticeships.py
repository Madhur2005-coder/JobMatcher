from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database.session import get_db
from app.database.models import Apprenticeship, Trade, Company
from app.schemas.all_schemas import ApprenticeshipResponse

router = APIRouter(prefix="/apprenticeships", tags=["Apprenticeships"])

@router.get("")
def list_apprenticeships(
    trade: Optional[str] = None,
    location: Optional[str] = None,
    min_stipend: Optional[int] = None,
    duration: Optional[int] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Apprenticeship).filter(Apprenticeship.status == "active")

    if trade:
        query = query.join(Trade).filter((Trade.code.ilike(trade)) | (Trade.name.ilike(f"%{trade}%")))

    if location:
        query = query.filter((Apprenticeship.city.ilike(f"%{location}%")) | (Apprenticeship.state.ilike(f"%{location}%")))

    if min_stipend:
        query = query.filter(Apprenticeship.stipend_max >= min_stipend)

    if duration:
        query = query.filter(Apprenticeship.duration_months == duration)

    if q:
        query = query.filter((Apprenticeship.title.ilike(f"%{q}%")) | (Apprenticeship.description.ilike(f"%{q}%")))

    results = query.all()
    return [
        {
            "id": a.id,
            "company_id": a.company_id,
            "company_name": a.company.name if a.company else "Industry Partner",
            "company_industry": a.company.industry if a.company else "Manufacturing",
            "trade_id": a.trade_id,
            "trade_name": a.trade.name if a.trade else "",
            "trade_code": a.trade.code if a.trade else "",
            "title": a.title,
            "description": a.description,
            "stipend_min": a.stipend_min,
            "stipend_max": a.stipend_max,
            "stipend_range": f"₹{a.stipend_min:,} – ₹{a.stipend_max:,} / month",
            "duration_months": a.duration_months,
            "location": a.location,
            "city": a.city,
            "state": a.state,
            "eligibility": a.eligibility,
            "positions": a.positions,
            "application_url": a.application_url,
            "status": a.status
        }
        for a in results
    ]

@router.get("/{apprenticeship_id}")
def get_apprenticeship(apprenticeship_id: int, db: Session = Depends(get_db)):
    a = db.query(Apprenticeship).filter(Apprenticeship.id == apprenticeship_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Apprenticeship opportunity not found")

    return {
        "id": a.id,
        "company_id": a.company_id,
        "company_name": a.company.name if a.company else "Industry Partner",
        "company_industry": a.company.industry if a.company else "Manufacturing",
        "company_website": a.company.website if a.company else None,
        "trade_id": a.trade_id,
        "trade_name": a.trade.name if a.trade else "",
        "trade_code": a.trade.code if a.trade else "",
        "title": a.title,
        "description": a.description,
        "stipend_min": a.stipend_min,
        "stipend_max": a.stipend_max,
        "stipend_range": f"₹{a.stipend_min:,} – ₹{a.stipend_max:,} / month",
        "duration_months": a.duration_months,
        "location": a.location,
        "city": a.city,
        "state": a.state,
        "eligibility": a.eligibility,
        "positions": a.positions,
        "application_url": a.application_url,
        "status": a.status
    }
