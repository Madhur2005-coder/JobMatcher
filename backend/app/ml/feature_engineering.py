import numpy as np
from typing import Dict, Any, List

def encode_student_profile(profile: Dict[str, Any], skill_vocabulary: List[str]) -> np.ndarray:
    """
    Transforms a student profile into a normalized feature vector.
    """
    trade_map = {"welder": 0, "electrician": 1, "fitter": 2}
    trade_val = trade_map.get((profile.get("trade_code") or "").lower(), 0)
    
    exp_val = min(10.0, float(profile.get("experience_years") or 0.0)) / 10.0
    sal_val = min(50000.0, float(profile.get("expected_salary_min") or 15000.0)) / 50000.0
    
    student_skills = set(s.lower().strip() for s in profile.get("skills", []))
    skill_vector = [1.0 if sk.lower().strip() in student_skills else 0.0 for sk in skill_vocabulary]
    
    return np.array([trade_val, exp_val, sal_val] + skill_vector)

def extract_skill_gap(student_skills: List[str], required_skills: List[str]) -> Dict[str, Any]:
    """
    Calculates detailed skill gap between student and job.
    """
    s_set = set(s.lower().strip() for s in student_skills)
    matched = []
    missing = []
    
    for req in required_skills:
        clean_req = req.lower().strip()
        if any(clean_req in s or s in clean_req for s in s_set):
            matched.append(req)
        else:
            missing.append(req)
            
    match_ratio = len(matched) / max(1, len(required_skills))
    return {
        "matched": matched,
        "missing": missing,
        "match_percentage": round(match_ratio * 100, 1),
        "gap_count": len(missing)
    }
