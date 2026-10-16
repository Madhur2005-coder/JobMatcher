from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database.session import get_db
from app.database.models import User, StudentProfile, StudentSkill, Trade, Skill
from app.schemas.all_schemas import UserRegister, UserLogin, Token, UserResponse
from app.api.auth_deps import verify_password, get_password_hash, create_access_token, get_current_user
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if user email already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )

    # Create User
    new_user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        phone=user_in.phone,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role or "student",
        is_active=True
    )
    db.add(new_user)
    db.flush()

    # If student, create student profile
    trade_code = (user_in.trade_code or "welder").lower()
    trade = db.query(Trade).filter(Trade.code == trade_code).first()
    if not trade:
        trade = db.query(Trade).first()

    profile = StudentProfile(
        user_id=new_user.id,
        trade_id=trade.id if trade else None,
        qualification=user_in.qualification or "ITI Passout",
        preferred_location=user_in.preferred_location or "Pune",
        experience_years=user_in.experience_years or 0.0,
        expected_salary_min=user_in.expected_salary_min or 18000,
        expected_salary_max=(user_in.expected_salary_min or 18000) + 6000
    )
    db.add(profile)
    db.flush()

    # Add initial skills
    if user_in.skills:
        for sname in user_in.skills:
            skill = db.query(Skill).filter(Skill.name.ilike(sname.strip())).first()
            if skill:
                ss = StudentSkill(student_profile_id=profile.id, skill_id=skill.id, proficiency_level="Intermediate")
                db.add(ss)

    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": new_user.email, "role": new_user.role})

    # Prepare response user dictionary
    user_data = {
        "id": new_user.id,
        "full_name": new_user.full_name,
        "email": new_user.email,
        "phone": new_user.phone,
        "role": new_user.role,
        "trade_code": trade.code if trade else "welder",
        "trade_name": trade.name if trade else "ITI Welder"
    }

    return {"access_token": access_token, "token_type": "bearer", "user": user_data}

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is deactivated")

    access_token = create_access_token(data={"sub": user.email, "role": user.role})

    user_data = {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role
    }

    if user.student_profile and user.student_profile.trade:
        user_data["trade_code"] = user.student_profile.trade.code
        user_data["trade_name"] = user.student_profile.trade.name
        user_data["experience_years"] = user.student_profile.experience_years
        user_data["preferred_location"] = user.student_profile.preferred_location

    return {"access_token": access_token, "token_type": "bearer", "user": user_data}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    res = {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "role": current_user.role,
        "created_at": current_user.created_at
    }

    if current_user.student_profile:
        sp = current_user.student_profile
        skills_list = [ss.skill.name for ss in sp.skills if ss.skill]
        res["student_profile"] = {
            "id": sp.id,
            "trade_id": sp.trade_id,
            "trade_name": sp.trade.name if sp.trade else None,
            "trade_code": sp.trade.code if sp.trade else None,
            "qualification": sp.qualification,
            "experience_years": sp.experience_years,
            "preferred_location": sp.preferred_location,
            "expected_salary_min": sp.expected_salary_min,
            "expected_salary_max": sp.expected_salary_max,
            "bio": sp.bio,
            "institute_name": sp.institute_name,
            "year_of_passing": sp.year_of_passing,
            "skills": skills_list
        }

    return res
