from __future__ import annotations
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from loguru import logger
from ..config import settings

class Embedder:
    def __init__(self, backend: str | None = None, model_name: str | None = None):
        self.backend = backend or settings.EMBEDDINGS_BACKEND
        self.model_name = model_name or settings.EMBEDDINGS_MODEL
        self._tfidf = None
        self._sbert = None

    def fit(self, texts: list[str]):
        if self.backend == "tfidf":
            self._tfidf = TfidfVectorizer(max_features=5000, ngram_range=(1,2))
            self._tfidf.fit(texts)
            logger.info("TF-IDF vectorizer fitted with %d terms", len(self._tfidf.get_feature_names_out()))
        else:
            # Lazy load sentence-transformers on demand during transform
            pass
        return self

    def transform(self, texts: list[str]) -> np.ndarray:
        if self.backend == "tfidf":
            if self._tfidf is None:
                self._tfidf = TfidfVectorizer(max_features=5000, ngram_range=(1,2)).fit(texts)
            return self._tfidf.transform(texts).toarray()
        else:
            try:
                from sentence_transformers import SentenceTransformer
            except Exception as e:
                logger.warning("sentence-transformers not available, falling back to TF-IDF: {}", e)
                self.backend = "tfidf"
                return self.transform(texts)
            if self._sbert is None:
                self._sbert = SentenceTransformer(self.model_name)
            return np.array(self._sbert.encode(texts, normalize_embeddings=True))
