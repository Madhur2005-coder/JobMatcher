from sqlalchemy import Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

# Association table for scheme <-> trade many-to-many
scheme_trades = Table(
    "scheme_trades",
    Base.metadata,
    Column("id", Integer, primary_key=True, index=True),
    Column("scheme_id", Integer, ForeignKey("government_schemes.id", ondelete="CASCADE")),
    Column("trade_id", Integer, ForeignKey("trades.id", ondelete="CASCADE"))
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="student", nullable=False)  # 'student', 'admin'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="user", cascade="all, delete-orphan")
    saved_jobs = relationship("SavedJob", back_populates="user", cascade="all, delete-orphan")

class Trade(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)  # 'welder', 'electrician', 'fitter'
    name = Column(String(100), nullable=False)  # 'ITI Welder', 'ITI Electrician', 'ITI Fitter'
    description = Column(Text, nullable=True)
    icon = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)

    # Relationships
    skills = relationship("Skill", back_populates="trade", cascade="all, delete-orphan")
    jobs = relationship("Job", back_populates="trade")
    student_profiles = relationship("StudentProfile", back_populates="trade")
    apprenticeships = relationship("Apprenticeship", back_populates="trade")
    schemes = relationship("GovernmentScheme", secondary=scheme_trades, back_populates="trades")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False, index=True)
    category = Column(String(100), nullable=True)
    trade_id = Column(Integer, ForeignKey("trades.id", ondelete="CASCADE"), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    # Relationships
    trade = relationship("Trade", back_populates="skills")
    student_skills = relationship("StudentSkill", back_populates="skill", cascade="all, delete-orphan")
    job_skills = relationship("JobSkill", back_populates="skill", cascade="all, delete-orphan")

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    trade_id = Column(Integer, ForeignKey("trades.id", ondelete="SET NULL"), nullable=True)
    qualification = Column(String(120), default="ITI Passout")
    experience_years = Column(Float, default=0.0)  # 0 for fresher, 0.5, 1, 2, etc.
    preferred_location = Column(String(120), default="Pune")
    expected_salary_min = Column(Integer, default=15000)
    expected_salary_max = Column(Integer, default=22000)
    bio = Column(Text, nullable=True)
    institute_name = Column(String(200), nullable=True)
    year_of_passing = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="student_profile")
    trade = relationship("Trade", back_populates="student_profiles")
    skills = relationship("StudentSkill", back_populates="student_profile", cascade="all, delete-orphan")

class StudentSkill(Base):
    __tablename__ = "student_skills"

    id = Column(Integer, primary_key=True, index=True)
    student_profile_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    proficiency_level = Column(String(50), default="Intermediate")  # Beginner, Intermediate, Expert

    # Relationships
    student_profile = relationship("StudentProfile", back_populates="skills")
    skill = relationship("Skill", back_populates="student_skills")

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    industry = Column(String(120), nullable=False)
    location = Column(String(150), nullable=False)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    website = Column(String(255), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    logo_url = Column(String(255), nullable=True)
    is_verified = Column(Boolean, default=True)
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    jobs = relationship("Job", back_populates="company", cascade="all, delete-orphan")
    apprenticeships = relationship("Apprenticeship", back_populates="company", cascade="all, delete-orphan")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    trade_id = Column(Integer, ForeignKey("trades.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=False)
    responsibilities = Column(Text, nullable=True)
    qualification = Column(String(120), default="ITI / Polytechnic")
    experience_min = Column(Float, default=0.0)
    experience_max = Column(Float, default=3.0)
    salary_min = Column(Integer, nullable=False)
    salary_max = Column(Integer, nullable=False)
    salary_type = Column(String(30), default="per_month")
    location = Column(String(200), nullable=False)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False)
    job_type = Column(String(50), default="Full Time")  # 'Full Time', 'Apprenticeship', 'Contract'
    application_url = Column(String(255), nullable=True)
    status = Column(String(20), default="active", index=True)  # 'active', 'inactive'
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    company = relationship("Company", back_populates="jobs")
    trade = relationship("Trade", back_populates="jobs")
    skills = relationship("JobSkill", back_populates="job", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")
    saved_by = relationship("SavedJob", back_populates="job", cascade="all, delete-orphan")

class JobSkill(Base):
    __tablename__ = "job_skills"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    is_required = Column(Boolean, default=True)

    # Relationships
    job = relationship("Job", back_populates="skills")
    skill = relationship("Skill", back_populates="job_skills")

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    cover_note = Column(Text, nullable=True)
    status = Column(String(50), default="Applied")  # 'Applied', 'Under Review', 'Shortlisted', 'Interviewing', 'Selected'
    applied_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="applications")

class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    saved_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="saved_jobs")
    job = relationship("Job", back_populates="saved_by")

class Institute(Base):
    __tablename__ = "institutes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    code = Column(String(100), nullable=True)
    type = Column(String(50), default="Government")  # 'Government', 'Private', 'PPP'
    address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    trades_offered = Column(String(255), nullable=False)  # "Welder, Electrician, Fitter"
    certifications = Column(String(200), default="NCVT / SCVT Affiliated")
    placement_rating = Column(Float, default=4.5)
    placement_officer_name = Column(String(150), nullable=True)
    placement_officer_phone = Column(String(50), nullable=True)
    placement_officer_email = Column(String(150), nullable=True)
    website = Column(String(255), nullable=True)
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

class GovernmentScheme(Base):
    __tablename__ = "government_schemes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    code = Column(String(100), nullable=True)
    category = Column(String(100), nullable=False, index=True)  # 'Skill Development', 'Apprenticeship', 'Employment', 'Training', 'Financial Assistance', 'Entrepreneurship'
    description = Column(Text, nullable=False)
    eligibility_criteria = Column(Text, nullable=False)
    benefits = Column(Text, nullable=False)
    required_documents = Column(Text, nullable=True)
    application_process = Column(Text, nullable=True)
    official_website = Column(String(255), nullable=False)
    official_source_name = Column(String(150), default="Ministry of Skill Development & Entrepreneurship")
    application_deadline = Column(String(100), default="Open Throughout Year / Ongoing")
    state = Column(String(100), default="All India")
    status = Column(String(20), default="active", index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    trades = relationship("Trade", secondary=scheme_trades, back_populates="schemes")

class Apprenticeship(Base):
    __tablename__ = "apprenticeships"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    trade_id = Column(Integer, ForeignKey("trades.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    stipend_min = Column(Integer, default=10000)
    stipend_max = Column(Integer, default=15000)
    duration_months = Column(Integer, default=12)
    location = Column(String(150), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    eligibility = Column(String(255), default="ITI Passout in relevant trade")
    positions = Column(Integer, default=10)
    application_url = Column(String(255), default="https://www.apprenticeshipindia.gov.in")
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    company = relationship("Company", back_populates="apprenticeships")
    trade = relationship("Trade", back_populates="apprenticeships")
