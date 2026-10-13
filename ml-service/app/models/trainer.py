"""
RumorRadar ML Training & Research Evaluation Engine
Strict research standards:
- Stratified train/test splitting
- Zero data leakage (transformers fit on train only)
- Real metric calculations: Accuracy, Precision, Recall, F1, ROC-AUC, PR-AUC, Confusion Matrix, ROC/PR curves
- Serialization of model artifacts via joblib
"""

import os
import time
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional, Tuple

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB, ComplementNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
    roc_curve,
    precision_recall_curve
)

from app.core.preprocessor import RumorRadarFeaturePipeline

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "saved_models")
os.makedirs(MODELS_DIR, exist_ok=True)

SUPPORTED_ALGORITHMS = {
    "logistic_regression": LogisticRegression,
    "multinomial_nb": MultinomialNB,
    "complement_nb": ComplementNB,
    "random_forest": RandomForestClassifier
}

FEATURE_MODES = [
    "text_only",
    "sentiment_emotion_only",
    "text_sentiment_emotion",
    "text_engagement",
    "combined"
]

def subsample_curve(x: np.ndarray, y: np.ndarray, max_points: int = 40) -> List[Dict[str, float]]:
    """Subsamples ROC or PR curve coordinates for clean frontend visualization."""
    if len(x) <= max_points:
        indices = np.arange(len(x))
    else:
        indices = np.linspace(0, len(x) - 1, max_points, dtype=int)
    
    points = []
    for idx in indices:
        points.append({
            "x": round(float(x[idx]), 4),
            "y": round(float(y[idx]), 4)
        })
    return points

def train_and_evaluate_experiment(
    df: pd.DataFrame,
    text_column: str,
    label_column: str,
    engagement_column: Optional[str] = None,
    feature_mode: str = "combined",
    algorithm: str = "logistic_regression",
    test_size: float = 0.2,
    random_state: int = 42,
    experiment_id: str = "exp_default",
    dataset_name: str = "fakenewsnet_politifact"
) -> Dict[str, Any]:
    """
    Executes a complete ML training and held-out evaluation workflow.
    """
    start_time = time.time()
    
    # 1. Validate inputs and clean dataset
    if text_column not in df.columns:
        raise ValueError(f"Text column '{text_column}' not found in dataset.")
    if label_column not in df.columns:
        raise ValueError(f"Label column '{label_column}' not found in dataset.")

    # Drop NA in text and label
    clean_df = df.dropna(subset=[text_column, label_column]).copy()
    
    # Convert labels to 0 and 1
    # Handle strings like 'fake' / 'real', or numbers
    def normalize_label(val):
        if pd.isna(val):
            return 0
        s = str(val).strip().lower()
        if s in ["1", "fake", "rumor", "true_misinfo", "misinformation", "pants-on-fire", "false"]:
            return 1
        return 0

    y_all = clean_df[label_column].apply(normalize_label).values
    texts_all = clean_df[text_column].astype(str).tolist()
    
    # Check engagement column presence
    has_engagement = engagement_column is not None and engagement_column in clean_df.columns
    engagement_series = clean_df[engagement_column] if has_engagement else None

    # Disable engagement modes if engagement column is missing
    if not has_engagement and feature_mode in ["text_engagement", "combined"]:
        raise ValueError(
            f"Feature mode '{feature_mode}' requires a genuine engagement column, but none was provided or found."
        )

    # 2. Stratified train/test split to prevent leakage
    train_indices, test_indices = train_test_split(
        np.arange(len(clean_df)),
        test_size=test_size,
        random_state=random_state,
        stratify=y_all
    )

    X_train_texts = [texts_all[i] for i in train_indices]
    X_test_texts = [texts_all[i] for i in test_indices]
    y_train = y_all[train_indices]
    y_test = y_all[test_indices]

    train_eng = engagement_series.iloc[train_indices] if has_engagement else None
    test_eng = engagement_series.iloc[test_indices] if has_engagement else None

    # 3. Fit preprocessing pipeline strictly on training data
    pipeline = RumorRadarFeaturePipeline(feature_mode=feature_mode)
    pipeline.fit(X_train_texts, train_eng)

    X_train_transformed = pipeline.transform(X_train_texts, train_eng)
    X_test_transformed = pipeline.transform(X_test_texts, test_eng)

    # 4. Instantiate and fit ML Classifier
    if algorithm == "logistic_regression":
        clf = LogisticRegression(max_iter=1000, C=1.0, random_state=random_state)
    elif algorithm == "multinomial_nb":
        # MultinomialNB requires non-negative features. MinMax ensures 0..1
        clf = MultinomialNB(alpha=1.0)
    elif algorithm == "complement_nb":
        clf = ComplementNB(alpha=1.0)
    elif algorithm == "random_forest":
        clf = RandomForestClassifier(n_estimators=100, random_state=random_state, n_jobs=-1)
    else:
        clf = LogisticRegression(max_iter=1000, random_state=random_state)

    clf.fit(X_train_transformed, y_train)

    # 5. Held-out test set predictions
    y_pred = clf.predict(X_test_transformed)
    
    # Class probabilities for ROC and PR curves
    if hasattr(clf, "predict_proba"):
        y_proba = clf.predict_proba(X_test_transformed)[:, 1]
    else:
        # Fallback to decision function
        y_proba = clf.decision_function(X_test_transformed)
        y_proba = (y_proba - y_proba.min()) / (y_proba.max() - y_proba.min() + 1e-9)

    # 6. Compute Comprehensive Metrics
    acc = float(accuracy_score(y_test, y_pred))
    prec_binary = float(precision_score(y_test, y_pred, zero_division=0))
    rec_binary = float(recall_score(y_test, y_pred, zero_division=0))
    f1_binary = float(f1_score(y_test, y_pred, zero_division=0))
    
    prec_macro = float(precision_score(y_test, y_pred, average="macro", zero_division=0))
    rec_macro = float(recall_score(y_test, y_pred, average="macro", zero_division=0))
    f1_macro = float(f1_score(y_test, y_pred, average="macro", zero_division=0))

    try:
        roc_auc = float(roc_auc_score(y_test, y_proba))
    except Exception:
        roc_auc = 0.5

    try:
        pr_auc = float(average_precision_score(y_test, y_proba))
    except Exception:
        pr_auc = 0.0

    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = [int(v) for v in cm.ravel()]

    # Compute ROC Curve coordinates
    fpr_arr, tpr_arr, _ = roc_curve(y_test, y_proba)
    roc_curve_data = subsample_curve(fpr_arr, tpr_arr)

    # Compute PR Curve coordinates
    pr_prec, pr_rec, _ = precision_recall_curve(y_test, y_proba)
    # Reversing PR recall for monotonic x-axis plotting
    pr_curve_data = subsample_curve(pr_rec[::-1], pr_prec[::-1])

    duration_sec = round(time.time() - start_time, 2)

    # 7. Model artifact saving
    artifact_path = os.path.join(MODELS_DIR, f"{experiment_id}.joblib")
    saved_bundle = {
        "pipeline": pipeline,
        "classifier": clf,
        "feature_mode": feature_mode,
        "algorithm": algorithm,
        "test_size": test_size,
        "random_state": random_state,
        "dataset_name": dataset_name,
        "text_column": text_column,
        "label_column": label_column,
        "engagement_column": engagement_column
    }
    joblib.dump(saved_bundle, artifact_path)

    # Generate sample test predictions for inspection
    sample_evaluations = []
    for idx in range(min(15, len(y_test))):
        sample_evaluations.append({
            "text": X_test_texts[idx][:120] + ("..." if len(X_test_texts[idx]) > 120 else ""),
            "actual": int(y_test[idx]),
            "predicted": int(y_pred[idx]),
            "confidence": round(float(y_proba[idx]), 3),
            "correct": bool(y_test[idx] == y_pred[idx])
        })

    result_summary = {
        "experiment_id": experiment_id,
        "dataset_name": dataset_name,
        "feature_mode": feature_mode,
        "algorithm": algorithm,
        "test_size": test_size,
        "random_state": random_state,
        "train_samples": len(train_indices),
        "test_samples": len(test_indices),
        "total_samples": len(clean_df),
        "metrics": {
            "accuracy": round(acc, 4),
            "precision_binary": round(prec_binary, 4),
            "recall_binary": round(rec_binary, 4),
            "f1_binary": round(f1_binary, 4),
            "precision_macro": round(prec_macro, 4),
            "recall_macro": round(rec_macro, 4),
            "f1_macro": round(f1_macro, 4),
            "roc_auc": round(roc_auc, 4),
            "pr_auc": round(pr_auc, 4)
        },
        "confusion_matrix": {
            "tn": tn,
            "fp": fp,
            "fn": fn,
            "tp": tp,
            "matrix": [[tn, fp], [fn, tp]]
        },
        "roc_curve": roc_curve_data,
        "pr_curve": pr_curve_data,
        "sample_evaluations": sample_evaluations,
        "duration_seconds": duration_sec,
        "artifact_path": artifact_path,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

    return result_summary
