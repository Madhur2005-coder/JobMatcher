from app.ml.matching_engine import matching_engine
from app.ml.salary_predictor import salary_predictor
from app.ml.knn_recommender import knn_recommender
from app.ml.job_clusterer import job_clusterer
from app.ml.feature_engineering import encode_student_profile, extract_skill_gap

class MLPipeline:
    """
    Unified Scikit-Learn based machine learning pipeline for vocational matching, salary prediction,
    clustering, and KNN nearest-neighbor recommendation.
    """
    def __init__(self):
        self.matching = matching_engine
        self.salary = salary_predictor
        self.knn = knn_recommender
        self.clusterer = job_clusterer

    def rank_jobs_for_student(self, student_profile: dict, jobs: list) -> list:
        ranked = []
        for job in jobs:
            match_res = self.matching.calculate_match(student_profile, job)
            job_copy = dict(job)
            job_copy["match_score"] = match_res["score"]
            job_copy["match_breakdown"] = match_res["breakdown"]
            job_copy["matched_skills"] = match_res["matched_skills"]
            job_copy["missing_skills"] = match_res["missing_skills"]
            job_copy["why_reasons"] = match_res["why_reasons"]
            ranked.append(job_copy)

        ranked.sort(key=lambda x: x["match_score"], reverse=True)
        return ranked

ml_pipeline = MLPipeline()
