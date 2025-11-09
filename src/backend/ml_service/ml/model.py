from __future__ import annotations
import os, json, joblib
import numpy as np
from dataclasses import dataclass
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from .embeddings import Embedder
from .features import build_behavioral_features, build_temporal_features, assemble_feature_matrix
from .preprocess import clean_text
from ..config import settings

MODELS_DIR = settings.MODELS_DIR
os.makedirs(MODELS_DIR, exist_ok=True)

@dataclass
class ModelBundle:
    embedder: Embedder
    clf: object

    @staticmethod
    def load() -> "ModelBundle":
        # Try load saved, else create a tiny default
        embedder_path = os.path.join(MODELS_DIR, "embedder.joblib")
        clf_path = os.path.join(MODELS_DIR, "clf.joblib")
        if os.path.exists(embedder_path) and os.path.exists(clf_path):
            embedder = joblib.load(embedder_path)
            clf = joblib.load(clf_path)
            return ModelBundle(embedder=embedder, clf=clf)
        # Fallback simple model (cold start)
        embedder = Embedder(backend=settings.EMBEDDINGS_BACKEND, model_name=settings.EMBEDDINGS_MODEL)
        clf = LogisticRegression(max_iter=200)
        # Minimal bootstrap fit on tiny synthetic data
        X_texts = ["great product", "awful scam", "works as expected", "fake review buy now", "legit purchase"]
        y = np.array([0,1,0,1,0])  # 1=fake
        E = embedder.transform([clean_text(t) for t in X_texts])
        B = build_behavioral_features(
            __import__("pandas").DataFrame({"text": X_texts, "verified":[1,0,1,0,1], "account_age_days":[365,2,180,1,730]})
        )
        T = build_temporal_features(B.assign(text=X_texts))
        X = assemble_feature_matrix(E, B, T)
        clf.fit(X, y)
        joblib.dump(embedder, embedder_path)
        joblib.dump(clf, clf_path)
        return ModelBundle(embedder=embedder, clf=clf)

    def predict(self, text: str, meta: dict | None = None):
        import pandas as pd
        meta = meta or {}
        text_clean = clean_text(text)
        E = self.embedder.transform([text_clean])
        df = pd.DataFrame([{
            "text": text_clean,
            "verified": meta.get("verified", False),
            "account_age_days": meta.get("account_age_days", 0),
        }])
        B = build_behavioral_features(df)
        T = build_temporal_features(df)
        X = assemble_feature_matrix(E, B, T)
        proba = getattr(self.clf, "predict_proba", None)
        if proba:
            p = float(proba(X)[0][1])
        else:
            p = float(self.clf.decision_function(X)[0])  # not calibrated
        label = "fake" if p >= 0.5 else "genuine"
        trust = float(1.0 - p) if label == "fake" else float(p)
        details = {"p_fake": p}
        return label, trust, details
