from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    role: Optional[str] = "student"
    # Initial vocational profile fields
    trade_code: Optional[str] = "welder"
    qualification: Optional[str] = "ITI Passout"
    preferred_location: Optional[str] = "Pune"
    experience_years: Optional[float] = 0.0
    expected_salary_min: Optional[int] = 18000
    skills: Optional[List[str]] = []

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime
    student_profile: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

# --- Skill and Trade Schemas ---
class SkillBase(BaseModel):
    name: str
    trade_id: int
    category: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = True

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: int
    trade_name: Optional[str] = None

    class Config:
        from_attributes = True

class TradeResponse(BaseModel):
    id: int
    code: str
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    skills: List[SkillResponse] = []

    class Config:
        from_attributes = True

# --- Student Profile Schemas ---
class StudentProfileUpdate(BaseModel):
    trade_code: Optional[str] = None
    qualification: Optional[str] = None
    experience_years: Optional[float] = None
    preferred_location: Optional[str] = None
    expected_salary_min: Optional[int] = None
    expected_salary_max: Optional[int] = None
    bio: Optional[str] = None
    institute_name: Optional[str] = None
    year_of_passing: Optional[int] = None
    skills: Optional[List[str]] = None

class StudentProfileResponse(BaseModel):
    id: int
    user_id: int
    trade_id: Optional[int] = None
    trade_name: Optional[str] = None
    trade_code: Optional[str] = None
    qualification: str
    experience_years: float
    preferred_location: str
    expected_salary_min: int
    expected_salary_max: int
    bio: Optional[str] = None
    institute_name: Optional[str] = None
    year_of_passing: Optional[int] = None
    skills: List[str] = []

    class Config:
        from_attributes = True

# --- Company Schemas ---
class CompanyBase(BaseModel):
    name: str
    industry: str
    location: str
    city: str
    state: str
    description: Optional[str] = None
    website: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    logo_url: Optional[str] = None
    is_verified: Optional[bool] = True
    status: Optional[str] = "active"

class CompanyCreate(CompanyBase):
    pass

class CompanyResponse(CompanyBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Job Schemas ---
class JobBase(BaseModel):
    title: str
    company_id: int
    trade_id: int
    description: str
    responsibilities: Optional[str] = None
    qualification: Optional[str] = "ITI / Polytechnic"
    experience_min: Optional[float] = 0.0
    experience_max: Optional[float] = 3.0
    salary_min: int
    salary_max: int
    salary_type: Optional[str] = "per_month"
    location: str
    city: str
    state: str
    job_type: Optional[str] = "Full Time"
    application_url: Optional[str] = None
    status: Optional[str] = "active"

class JobCreate(JobBase):
    skill_names: Optional[List[str]] = []

class JobUpdate(BaseModel):
    title: Optional[str] = None
    company_id: Optional[int] = None
    trade_id: Optional[int] = None
    description: Optional[str] = None
    responsibilities: Optional[str] = None
    qualification: Optional[str] = None
    experience_min: Optional[float] = None
    experience_max: Optional[float] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    location: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    job_type: Optional[str] = None
    application_url: Optional[str] = None
    status: Optional[str] = None
    skill_names: Optional[List[str]] = None

class JobResponse(JobBase):
    id: int
    company_name: str
    company_logo: Optional[str] = None
    trade_code: str
    trade_name: str
    skills: List[str] = []
    created_at: datetime
    # Match fields (populated when matched against candidate)
    match_score: Optional[float] = None
    match_breakdown: Optional[Dict[str, float]] = None
    matched_skills: Optional[List[str]] = None
    missing_skills: Optional[List[str]] = None
    why_reasons: Optional[List[str]] = None

    class Config:
        from_attributes = True

# --- Government Scheme Schemas ---
class SchemeBase(BaseModel):
    name: str
    code: Optional[str] = None
    category: str  # 'Skill Development', 'Apprenticeship', 'Employment', 'Training', 'Financial Assistance', 'Entrepreneurship'
    description: str
    eligibility_criteria: str
    benefits: str
    required_documents: Optional[str] = None
    application_process: Optional[str] = None
    official_website: str
    official_source_name: Optional[str] = "Ministry of Skill Development & Entrepreneurship"
    application_deadline: Optional[str] = "Open Throughout Year / Ongoing"
    state: Optional[str] = "All India"
    status: Optional[str] = "active"

class SchemeCreate(SchemeBase):
    trade_ids: Optional[List[int]] = []

class SchemeUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    eligibility_criteria: Optional[str] = None
    benefits: Optional[str] = None
    required_documents: Optional[str] = None
    application_process: Optional[str] = None
    official_website: Optional[str] = None
    official_source_name: Optional[str] = None
    application_deadline: Optional[str] = None
    state: Optional[str] = None
    status: Optional[str] = None
    trade_ids: Optional[List[int]] = None

class SchemeResponse(SchemeBase):
    id: int
    applicable_trades: List[str] = []
    created_at: datetime
    relevance_score: Optional[float] = None

    class Config:
        from_attributes = True

# --- Institute Schemas ---
class InstituteBase(BaseModel):
    name: str
    code: Optional[str] = None
    type: Optional[str] = "Government"
    address: Optional[str] = None
    city: str
    state: str
    trades_offered: str
    certifications: Optional[str] = "NCVT / SCVT Affiliated"
    placement_rating: Optional[float] = 4.5
    placement_officer_name: Optional[str] = None
    placement_officer_phone: Optional[str] = None
    placement_officer_email: Optional[str] = None
    website: Optional[str] = None
    status: Optional[str] = "active"

class InstituteCreate(InstituteBase):
    pass

class InstituteResponse(InstituteBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Apprenticeship Schemas ---
class ApprenticeshipResponse(BaseModel):
    id: int
    company_id: int
    company_name: str
    trade_id: int
    trade_name: str
    trade_code: str
    title: str
    description: str
    stipend_min: int
    stipend_max: int
    duration_months: int
    location: str
    city: str
    state: str
    eligibility: str
    positions: int
    application_url: str
    status: str

    class Config:
        from_attributes = True

# --- Application and Saved Job Schemas ---
class ApplicationCreate(BaseModel):
    job_id: int
    cover_note: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    job_title: str
    company_name: str
    location: str
    salary_range: str
    trade_name: str
    status: str
    applied_at: datetime

class SavedJobResponse(BaseModel):
    id: int
    job_id: int
    job: JobResponse
    saved_at: datetime
