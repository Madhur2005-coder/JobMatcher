from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database.session import get_db
from app.database.models import Skill, Trade, User
from app.schemas.all_schemas import SkillCreate, SkillResponse, TradeResponse
from app.api.auth_deps import get_current_admin_user

router = APIRouter(prefix="/skills", tags=["Skills"])

@router.get("/trades")
def get_trades_with_skills(db: Session = Depends(get_db)):
    trades = db.query(Trade).filter(Trade.is_active == True).all()
    res = []
    for t in trades:
        res.append({
            "id": t.id,
            "code": t.code,
            "name": t.name,
            "description": t.description,
            "icon": t.icon,
            "skills": [
                {"id": s.id, "name": s.name, "category": s.category, "trade_id": s.trade_id, "is_active": s.is_active}
                for s in t.skills if s.is_active
            ]
        })
    return res

@router.get("")
def list_skills(trade: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Skill).join(Trade).filter(Skill.is_active == True)
    if trade:
        query = query.filter((Trade.code.ilike(trade)) | (Trade.name.ilike(f"%{trade}%")))
    
    skills = query.all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "category": s.category,
            "trade_id": s.trade_id,
            "trade_name": s.trade.name if s.trade else "",
            "trade_code": s.trade.code if s.trade else "",
            "description": s.description,
            "is_active": s.is_active
        }
        for s in skills
    ]

@router.post("", status_code=status.HTTP_201_CREATED)
def create_skill(
    skill_in: SkillCreate,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    skill = Skill(**skill_in.dict())
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill

@router.put("/{skill_id}")
def update_skill(
    skill_id: int,
    skill_in: SkillCreate,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    for field, val in skill_in.dict().items():
        setattr(skill, field, val)

    db.commit()
    db.refresh(skill)
    return skill

@router.delete("/{skill_id}")
def delete_skill(
    skill_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    db.delete(skill)
    db.commit()
    return {"message": "Skill deleted successfully", "id": skill_id}
