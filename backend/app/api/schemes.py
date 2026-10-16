from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any

from app.database.session import get_db
from app.database.models import GovernmentScheme, Trade, User
from app.schemas.all_schemas import SchemeCreate, SchemeUpdate, SchemeResponse
from app.api.auth_deps import get_current_admin_user, get_optional_current_user

router = APIRouter(prefix="/schemes", tags=["Government Schemes"])

def serialize_scheme(scheme: GovernmentScheme) -> Dict[str, Any]:
    return {
        "id": scheme.id,
        "name": scheme.name,
        "code": scheme.code,
        "category": scheme.category,
        "description": scheme.description,
        "eligibility_criteria": scheme.eligibility_criteria,
        "benefits": scheme.benefits,
        "required_documents": scheme.required_documents,
        "application_process": scheme.application_process,
        "official_website": scheme.official_website,
        "official_source_name": scheme.official_source_name,
        "application_deadline": scheme.application_deadline,
        "state": scheme.state,
        "status": scheme.status,
        "applicable_trades": [t.name for t in scheme.trades],
        "trade_codes": [t.code for t in scheme.trades],
        "created_at": scheme.created_at
    }

@router.get("")
def list_schemes(
    category: Optional[str] = None,
    trade: Optional[str] = None,
    q: Optional[str] = None,
    state: Optional[str] = None,
    status_filter: Optional[str] = "active",
    db: Session = Depends(get_db)
):
    query = db.query(GovernmentScheme)

    if status_filter and status_filter != "all":
        query = query.filter(GovernmentScheme.status == status_filter)

    if category and category.lower() != "all":
        query = query.filter(GovernmentScheme.category.ilike(f"%{category}%"))

    if state and state.lower() != "all":
        query = query.filter((GovernmentScheme.state.ilike(f"%{state}%")) | (GovernmentScheme.state == "All India"))

    if q:
        query = query.filter(
            (GovernmentScheme.name.ilike(f"%{q}%")) |
            (GovernmentScheme.description.ilike(f"%{q}%")) |
            (GovernmentScheme.benefits.ilike(f"%{q}%"))
        )

    all_schemes = query.all()

    # If trade filter provided
    if trade and trade.lower() != "all":
        t_clean = trade.lower()
        filtered = []
        for sc in all_schemes:
            if any(t_clean == t.code.lower() or t_clean in t.name.lower() for t in sc.trades) or not sc.trades:
                filtered.append(sc)
        all_schemes = filtered

    return [serialize_scheme(sc) for sc in all_schemes]

@router.get("/{scheme_id}")
def get_scheme(scheme_id: int, db: Session = Depends(get_db)):
    scheme = db.query(GovernmentScheme).filter(GovernmentScheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Government scheme not found")
    return serialize_scheme(scheme)

@router.post("", status_code=status.HTTP_201_CREATED)
def create_scheme(
    scheme_in: SchemeCreate,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    new_scheme = GovernmentScheme(
        name=scheme_in.name,
        code=scheme_in.code,
        category=scheme_in.category,
        description=scheme_in.description,
        eligibility_criteria=scheme_in.eligibility_criteria,
        benefits=scheme_in.benefits,
        required_documents=scheme_in.required_documents,
        application_process=scheme_in.application_process,
        official_website=scheme_in.official_website,
        official_source_name=scheme_in.official_source_name,
        application_deadline=scheme_in.application_deadline,
        state=scheme_in.state or "All India",
        status=scheme_in.status or "active"
    )

    if scheme_in.trade_ids:
        trades = db.query(Trade).filter(Trade.id.in_(scheme_in.trade_ids)).all()
        new_scheme.trades.extend(trades)

    db.add(new_scheme)
    db.commit()
    db.refresh(new_scheme)
    return serialize_scheme(new_scheme)

@router.put("/{scheme_id}")
def update_scheme(
    scheme_id: int,
    scheme_in: SchemeUpdate,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    scheme = db.query(GovernmentScheme).filter(GovernmentScheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    update_dict = scheme_in.dict(exclude_unset=True)
    trade_ids = update_dict.pop("trade_ids", None)

    for field, val in update_dict.items():
        setattr(scheme, field, val)

    if trade_ids is not None:
        scheme.trades = db.query(Trade).filter(Trade.id.in_(trade_ids)).all()

    db.commit()
    db.refresh(scheme)
    return serialize_scheme(scheme)

@router.delete("/{scheme_id}")
def delete_scheme(
    scheme_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    scheme = db.query(GovernmentScheme).filter(GovernmentScheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    db.delete(scheme)
    db.commit()
    return {"message": "Scheme deleted successfully", "scheme_id": scheme_id}

@router.patch("/{scheme_id}/toggle-status")
def toggle_scheme_status(
    scheme_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    scheme = db.query(GovernmentScheme).filter(GovernmentScheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    scheme.status = "inactive" if scheme.status == "active" else "active"
    db.commit()
    return {"message": f"Scheme status updated to {scheme.status}", "status": scheme.status}
