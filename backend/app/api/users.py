from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.database.models import User, StudentProfile
from app.api.auth_deps import get_current_admin_user

router = APIRouter(prefix="/users", tags=["User Management"])

@router.get("")
def list_students(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    students = db.query(User).filter(User.role == "student").all()
    res = []
    for s in students:
        sp = s.student_profile
        skills_count = len(sp.skills) if sp else 0
        res.append({
            "id": s.id,
            "full_name": s.full_name,
            "email": s.email,
            "phone": s.phone,
            "trade": sp.trade.name if sp and sp.trade else "Not specified",
            "trade_code": sp.trade.code if sp and sp.trade else "",
            "preferred_location": sp.preferred_location if sp else "Not specified",
            "experience_years": sp.experience_years if sp else 0.0,
            "skills_count": skills_count,
            "applications_count": len(s.applications),
            "is_active": s.is_active,
            "created_at": s.created_at
        })
    return res

@router.patch("/{user_id}/toggle-status")
def toggle_user_status(
    user_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User status set to {user.is_active}", "is_active": user.is_active}

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully", "id": user_id}
