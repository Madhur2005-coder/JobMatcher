from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database.session import get_db
from app.database.models import Institute, User
from app.schemas.all_schemas import InstituteCreate, InstituteResponse
from app.api.auth_deps import get_current_admin_user

router = APIRouter(prefix="/institutes", tags=["Institutes"])

@router.get("", response_model=List[InstituteResponse])
def list_institutes(
    trade: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    type: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Institute).filter(Institute.status == "active")

    if q:
        query = query.filter(
            (Institute.name.ilike(f"%{q}%")) |
            (Institute.city.ilike(f"%{q}%")) |
            (Institute.trades_offered.ilike(f"%{q}%"))
        )

    if trade:
        query = query.filter(Institute.trades_offered.ilike(f"%{trade}%"))

    if city:
        query = query.filter(Institute.city.ilike(f"%{city}%"))

    if state:
        query = query.filter(Institute.state.ilike(f"%{state}%"))

    if type:
        query = query.filter(Institute.type.ilike(f"%{type}%"))

    return query.all()

@router.get("/{institute_id}", response_model=InstituteResponse)
def get_institute(institute_id: int, db: Session = Depends(get_db)):
    inst = db.query(Institute).filter(Institute.id == institute_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Institute not found")
    return inst

@router.post("", response_model=InstituteResponse, status_code=status.HTTP_201_CREATED)
def create_institute(
    inst_in: InstituteCreate,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    inst = Institute(**inst_in.dict())
    db.add(inst)
    db.commit()
    db.refresh(inst)
    return inst

@router.put("/{institute_id}", response_model=InstituteResponse)
def update_institute(
    institute_id: int,
    inst_in: InstituteCreate,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    inst = db.query(Institute).filter(Institute.id == institute_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Institute not found")

    for field, val in inst_in.dict().items():
        setattr(inst, field, val)

    db.commit()
    db.refresh(inst)
    return inst

@router.delete("/{institute_id}")
def delete_institute(
    institute_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    inst = db.query(Institute).filter(Institute.id == institute_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Institute not found")

    db.delete(inst)
    db.commit()
    return {"message": "Institute deleted successfully", "id": institute_id}
