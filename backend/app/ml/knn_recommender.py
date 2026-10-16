import numpy as np
from sklearn.neighbors import NearestNeighbors
from typing import List, Dict, Any

class KNNRecommender:
    def __init__(self, n_neighbors: int = 5):
        self.n_neighbors = n_neighbors
        self.model = NearestNeighbors(n_neighbors=n_neighbors, metric="cosine")
        self.fitted = False
        self.job_ids = []

    def fit_jobs(self, jobs_data: List[Dict[str, Any]], all_skill_names: List[str]):
        """
        Builds feature matrix for jobs based on:
        [trade_one_hot (3), exp_norm (1), salary_norm (1), skills_multi_hot (N)]
        """
        if not jobs_data:
            return

        self.all_skills = [s.lower().strip() for s in all_skill_names]
        self.job_ids = []
        vectors = []

        trade_map = {"welder": [1, 0, 0], "electrician": [0, 1, 0], "fitter": [0, 0, 1]}

        for job in jobs_data:
            t_code = (job.get("trade_code") or "").lower()
            t_vec = trade_map.get(t_code, [0.33, 0.33, 0.33])

            exp_val = [min(1.0, float(job.get("experience_min", 0.0)) / 5.0)]
            sal_val = [min(1.0, float(job.get("salary_max", 20000)) / 40000.0)]

            job_skills = [s.lower().strip() for s in (job.get("skills") or [])]
            skill_vec = [1.0 if s in job_skills else 0.0 for s in self.all_skills]

            full_vec = t_vec + exp_val + sal_val + skill_vec
            vectors.append(full_vec)
            self.job_ids.append(job["id"])

        if vectors:
            self.model.fit(np.array(vectors))
            self.fitted = True

    def find_similar_jobs(self, student_profile: Dict[str, Any], top_k: int = 5) -> List[int]:
        if not self.fitted or not self.job_ids:
            return []

        trade_map = {"welder": [1, 0, 0], "electrician": [0, 1, 0], "fitter": [0, 0, 1]}
        t_code = (student_profile.get("trade_code") or "").lower()
        t_vec = trade_map.get(t_code, [0.33, 0.33, 0.33])

        exp_val = [min(1.0, float(student_profile.get("experience_years", 0.0)) / 5.0)]
        sal_val = [min(1.0, float(student_profile.get("expected_salary_min", 18000)) / 40000.0)]

        s_skills = [s.lower().strip() for s in (student_profile.get("skills") or [])]
        skill_vec = [1.0 if s in s_skills else 0.0 for s in getattr(self, "all_skills", [])]

        query_vec = np.array([t_vec + exp_val + sal_val + skill_vec])
        k = min(top_k, len(self.job_ids))
        distances, indices = self.model.kneighbors(query_vec, n_neighbors=k)

        recommended_job_ids = [self.job_ids[i] for i in indices[0]]
        return recommended_job_ids

knn_recommender = KNNRecommender()
