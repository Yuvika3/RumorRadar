"""
RumorRadar Feature Engineering and Preprocessing Pipeline
Ensures strict train/test separation to prevent data leakage:
- TF-IDF fitted on X_train only
- Engagement Scalers fitted on X_train only
- Sentiment and Emotion features computed deterministically per sample
"""

import numpy as np
import pandas as pd
from typing import List, Tuple, Dict, Any, Optional
from scipy.sparse import hstack, csr_matrix
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MinMaxScaler, StandardScaler

from app.nlp.sentiment import analyze_sentiment
from app.nlp.emotion import analyze_emotions, EMOTIONS

class RumorRadarFeaturePipeline:
    def __init__(
        self,
        feature_mode: str = "combined",  # text_only, sentiment_emotion_only, text_sentiment_emotion, text_engagement, combined
        max_tfidf_features: int = 2500,
        ngram_range: Tuple[int, int] = (1, 2),
        use_log_engagement: bool = True
    ):
        self.feature_mode = feature_mode
        self.max_tfidf_features = max_tfidf_features
        self.ngram_range = ngram_range
        self.use_log_engagement = use_log_engagement
        
        # Train-fitted transformers
        self.tfidf_vectorizer: Optional[TfidfVectorizer] = None
        self.engagement_scaler: Optional[MinMaxScaler] = None
        self.fitted: bool = False

    def _extract_sentiment_emotion_matrix(self, texts: List[str]) -> np.ndarray:
        """Computes 12-dimensional sentiment (4) + emotion (8) feature matrix."""
        matrix = []
        for text in texts:
            sent = analyze_sentiment(text)
            emo = analyze_emotions(text)
            row = [
                sent["compound"],
                sent["pos"],
                sent["neg"],
                sent["neu"],
                emo["anger"],
                emo["anticipation"],
                emo["disgust"],
                emo["fear"],
                emo["joy"],
                emo["sadness"],
                emo["surprise"],
                emo["trust"]
            ]
            matrix.append(row)
        return np.array(matrix, dtype=np.float32)

    def _extract_engagement_matrix(self, engagement_series: Optional[pd.Series], length: int) -> np.ndarray:
        """Extracts and formats raw engagement array."""
        if engagement_series is None or len(engagement_series) == 0:
            return np.zeros((length, 1), dtype=np.float32)
        
        vals = pd.to_numeric(engagement_series, errors="coerce").fillna(0.0).values
        vals = vals.reshape(-1, 1).astype(np.float32)
        if self.use_log_engagement:
            vals = np.log1p(np.maximum(0.0, vals))
        return vals

    def fit(self, texts: List[str], engagement: Optional[pd.Series] = None):
        """Fit feature extractors strictly on training set."""
        if "text" in self.feature_mode or self.feature_mode in ["combined", "text_only"]:
            effective_min_df = 1 if len(texts) < 20 else 2
            self.tfidf_vectorizer = TfidfVectorizer(
                max_features=self.max_tfidf_features,
                ngram_range=self.ngram_range,
                min_df=effective_min_df,
                sublinear_tf=True
            )
            self.tfidf_vectorizer.fit(texts)

        if "engagement" in self.feature_mode or self.feature_mode == "combined":
            if engagement is not None:
                raw_eng = self._extract_engagement_matrix(engagement, len(texts))
                self.engagement_scaler = MinMaxScaler(feature_range=(0, 1))
                self.engagement_scaler.fit(raw_eng)

        self.fitted = True
        return self

    def transform(self, texts: List[str], engagement: Optional[pd.Series] = None):
        """Transform text and engagement data into model input feature matrix."""
        if not self.fitted:
            raise ValueError("FeaturePipeline must be fitted on training data before calling transform().")

        matrices_to_stack = []

        # 1. Text Features
        if self.tfidf_vectorizer is not None and (
            self.feature_mode in ["text_only", "text_sentiment_emotion", "text_engagement", "combined"]
        ):
            X_text = self.tfidf_vectorizer.transform(texts)
            matrices_to_stack.append(X_text)

        # 2. Sentiment + Emotion Features
        if self.feature_mode in ["sentiment_emotion_only", "text_sentiment_emotion", "combined"]:
            X_sent_emo = self._extract_sentiment_emotion_matrix(texts)
            matrices_to_stack.append(csr_matrix(X_sent_emo))

        # 3. Engagement Features
        if self.feature_mode in ["text_engagement", "combined"]:
            if self.engagement_scaler is not None:
                raw_eng = self._extract_engagement_matrix(engagement, len(texts))
                scaled_eng = self.engagement_scaler.transform(raw_eng)
                matrices_to_stack.append(csr_matrix(scaled_eng))
            else:
                # If engagement was requested but data is absent, append neutral 0 column
                matrices_to_stack.append(csr_matrix(np.zeros((len(texts), 1), dtype=np.float32)))

        if not matrices_to_stack:
            raise ValueError(f"No valid features extracted for mode: {self.feature_mode}")

        if len(matrices_to_stack) == 1:
            return matrices_to_stack[0]
        return hstack(matrices_to_stack).tocsr()

    def fit_transform(self, texts: List[str], engagement: Optional[pd.Series] = None):
        return self.fit(texts, engagement).transform(texts, engagement)
