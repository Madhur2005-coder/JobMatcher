import numpy as np
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
from typing import List, Dict, Any

class JobClusterer:
    def __init__(self, n_clusters: int = 4):
        self.n_clusters = n_clusters
        self.vectorizer = TfidfVectorizer(stop_words='english', max_features=100)
        self.kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        self.fitted = False

    def cluster_jobs(self, jobs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Clusters jobs into vocational specializations using TF-IDF on job title + skills + trade.
        Returns cluster summaries, top keywords, and job counts per cluster for admin analytics.
        """
        if not jobs or len(jobs) < self.n_clusters:
            # Fallback if too few jobs
            return {
                "clusters": [
                    {"id": 0, "name": "Heavy Fabrication & Welding", "count": len(jobs), "keywords": ["welding", "fabrication", "mig", "tig"]},
                ]
            }

        texts = []
        for j in jobs:
            skills_str = " ".join(j.get("skills", []))
            text = f"{j.get('title', '')} {j.get('trade_code', '')} {skills_str} {j.get('city', '')}"
            texts.append(text)

        X = self.vectorizer.fit_transform(texts)
        actual_clusters = min(self.n_clusters, len(jobs))
        self.kmeans = KMeans(n_clusters=actual_clusters, random_state=42, n_init=10)
        labels = self.kmeans.fit_predict(X)

        feature_names = np.array(self.vectorizer.get_feature_names_out())
        order_centroids = self.kmeans.cluster_centers_.argsort()[:, ::-1]

        # Named cluster mapping based on vocational trades
        cluster_names = [
            "Industrial Welding & Structural Fabrication",
            "Plant Electrical Systems & Automation Maintenance",
            "Mechanical Fitting & Precision Tool Assembly",
            "Heavy Machinery & Hydraulic Operations"
        ]

        clusters_result = []
        for i in range(actual_clusters):
            top_terms = [feature_names[ind] for ind in order_centroids[i, :5]]
            job_count = int(np.sum(labels == i))
            c_name = cluster_names[i] if i < len(cluster_names) else f"Specialized Trade Cluster {i+1}"
            
            clusters_result.append({
                "cluster_id": i,
                "name": c_name,
                "count": job_count,
                "keywords": top_terms,
                "percentage": round((job_count / len(jobs)) * 100.0, 1)
            })

        return {
            "total_jobs": len(jobs),
            "clusters_count": actual_clusters,
            "clusters": clusters_result
        }

job_clusterer = JobClusterer()
