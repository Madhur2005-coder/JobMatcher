from typing import List, Dict, Any
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class MatchingEngine:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english', token_pattern=r'(?u)\b\w+\b')

    def calculate_match(self, student_profile: Dict[str, Any], job: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates multi-factor weighted match score between a student profile and a job.
        Formula:
        Final Score = 0.50 * Skill Match + 0.20 * Trade Match + 0.15 * Location Match + 0.10 * Experience Match + 0.05 * Salary Match
        """
        student_trade_code = (student_profile.get("trade_code") or "").lower()
        job_trade_code = (job.get("trade_code") or "").lower()
        
        student_skills = [s.strip().lower() for s in (student_profile.get("skills") or []) if s]
        job_skills = [s.strip().lower() for s in (job.get("skills") or []) if s]
        
        # 1. Trade Match (20%)
        if student_trade_code and job_trade_code:
            trade_match = 100.0 if student_trade_code == job_trade_code else 20.0
        else:
            trade_match = 50.0

        # 2. Skill Match (50%) - Scikit-learn TF-IDF + Cosine Similarity & Direct Set Overlap
        matched_skills = []
        missing_skills = []
        for js in job_skills:
            # Check direct or partial match
            found = any(js in ss or ss in js for ss in student_skills)
            if found:
                matched_skills.append(js)
            else:
                missing_skills.append(js)

        if job_skills:
            set_overlap_pct = (len(matched_skills) / len(job_skills)) * 100.0
        else:
            set_overlap_pct = 80.0

        # Also calculate TF-IDF cosine similarity on textual skills + description
        student_text = " ".join(student_skills) + f" {student_trade_code}"
        job_text = " ".join(job_skills) + f" {job_trade_code} " + (job.get("title", "") + " " + job.get("description", ""))
        
        try:
            tfidf_matrix = self.vectorizer.fit_transform([student_text, job_text])
            cosine_score = float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]) * 100.0
        except Exception:
            cosine_score = set_overlap_pct

        # Blend set overlap and TF-IDF cosine similarity
        skill_match = round(0.6 * set_overlap_pct + 0.4 * cosine_score, 1)
        skill_match = min(100.0, max(0.0, skill_match))

        # 3. Location Match (15%)
        student_loc = (student_profile.get("preferred_location") or "").strip().lower()
        job_city = (job.get("city") or "").strip().lower()
        job_loc = (job.get("location") or "").strip().lower()
        job_state = (job.get("state") or "").strip().lower()

        if not student_loc:
            location_match = 70.0
        elif student_loc in job_city or job_city in student_loc or student_loc in job_loc:
            location_match = 100.0
        elif student_loc in job_state or job_state in student_loc:
            location_match = 70.0
        else:
            location_match = 40.0

        # 4. Experience Match (10%)
        student_exp = float(student_profile.get("experience_years") or 0.0)
        job_exp_min = float(job.get("experience_min") or 0.0)
        job_exp_max = float(job.get("experience_max") or 5.0)

        if student_exp >= job_exp_min:
            if student_exp <= job_exp_max + 1.0:
                exp_match = 100.0
            else:
                exp_match = 85.0  # Slightly overqualified
        else:
            gap = job_exp_min - student_exp
            exp_match = max(30.0, 100.0 - (gap * 25.0))

        # 5. Salary Match (5%)
        student_salary_min = float(student_profile.get("expected_salary_min") or 15000)
        job_salary_max = float(job.get("salary_max") or 25000)
        job_salary_min = float(job.get("salary_min") or 15000)

        if student_salary_min <= job_salary_max and student_salary_min >= job_salary_min * 0.8:
            salary_match = 100.0
        elif student_salary_min < job_salary_min:
            salary_match = 90.0  # Candidate asks less than job min
        else:
            salary_diff_ratio = (student_salary_min - job_salary_max) / max(1.0, job_salary_max)
            salary_match = max(30.0, 100.0 - (salary_diff_ratio * 100.0))

        # Final Weighted Score
        final_score = (
            0.50 * skill_match +
            0.20 * trade_match +
            0.15 * location_match +
            0.10 * exp_match +
            0.05 * salary_match
        )
        final_score = round(min(100.0, max(0.0, final_score)), 1)

        # Generate Explainable Reasons
        why_reasons = []
        if trade_match >= 90:
            why_reasons.append(f"Direct trade match ({job.get('trade_name', 'Trade')})")
        if matched_skills:
            why_reasons.append(f"Matched {len(matched_skills)} skills: {', '.join([s.title() for s in matched_skills[:4]])}")
        if location_match >= 90:
            why_reasons.append(f"Preferred location ({job.get('city', 'City')})")
        if exp_match >= 90:
            why_reasons.append("Experience requirements satisfied")
        if salary_match >= 90:
            why_reasons.append("Salary fits your expectations")

        missing_display = [s.title() for s in missing_skills]

        return {
            "score": final_score,
            "breakdown": {
                "skill_match": round(skill_match, 1),
                "trade_match": round(trade_match, 1),
                "location_match": round(location_match, 1),
                "experience_match": round(exp_match, 1),
                "salary_match": round(salary_match, 1)
            },
            "matched_skills": [s.title() for s in matched_skills],
            "missing_skills": missing_display,
            "why_reasons": why_reasons,
            "total_required": len(job_skills),
            "total_matched": len(matched_skills)
        }

matching_engine = MatchingEngine()
