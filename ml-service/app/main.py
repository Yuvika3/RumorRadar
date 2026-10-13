"""
RumorRadar ML FastAPI Service
Provides REST endpoints for:
- Dataset profiling & validation
- Asynchronous and synchronous model training
- Full multi-feature ablation studies
- Held-out evaluations and confusion matrices
- Real-time text inference with sentiment & emotion extraction
- Research analytics distributions
"""

import os
import uuid
import time
import threading
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

from fastapi import FastAPI, BackgroundTasks, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.nlp.sentiment import analyze_sentiment
from app.nlp.emotion import analyze_emotions, EMOTIONS
from app.models.trainer import (
    train_and_evaluate_experiment,
    MODELS_DIR,
    FEATURE_MODES
)
import joblib

app = FastAPI(
    title="RumorRadar ML Service",
    description="Machine learning and NLP analytics engine for misinformation research",
    version="1.0.0"
)

# Enable CORS for local Express backend and React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global in-memory job registry for asynchronous experiment tracking
JOBS: Dict[str, Dict[str, Any]] = {}

# Pydantic Schemas
class TrainRequest(BaseModel):
    dataset_path: str = Field(..., description="Absolute or relative path to CSV file")
    text_column: str = "title"
    label_column: str = "label"
    engagement_column: Optional[str] = "tweet_count"
    feature_mode: str = "combined"  # text_only, sentiment_emotion_only, text_sentiment_emotion, text_engagement, combined
    algorithm: str = "logistic_regression"  # logistic_regression, multinomial_nb, complement_nb, random_forest
    test_size: float = 0.2
    random_state: int = 42
    experiment_id: Optional[str] = None
    dataset_name: Optional[str] = "fakenewsnet_politifact"

class AblationRequest(BaseModel):
    dataset_path: str
    text_column: str = "title"
    label_column: str = "label"
    engagement_column: Optional[str] = "tweet_count"
    algorithm: str = "logistic_regression"
    test_size: float = 0.2
    random_state: int = 42
    dataset_name: Optional[str] = "fakenewsnet_politifact"

class PredictRequest(BaseModel):
    text: str
    engagement_value: Optional[float] = 0.0
    experiment_id: Optional[str] = None

class ProfileRequest(BaseModel):
    dataset_path: str

@app.get("/api/ml/health")
def health():
    return {
        "status": "healthy",
        "service": "RumorRadar ML Engine",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "supported_features": FEATURE_MODES,
        "supported_algorithms": ["logistic_regression", "multinomial_nb", "complement_nb", "random_forest"]
    }

@app.post("/api/ml/profile")
def profile_dataset(req: ProfileRequest):
    """
    Validates CSV file, computes missing values, class distributions,
    duplicate counts, and identifies candidate text/label/engagement columns.
    """
    path = req.dataset_path
    if not os.path.exists(path):
        # Check relative to datasets folder
        alt_path = os.path.join(os.path.dirname(__file__), "..", "..", "datasets", os.path.basename(path))
        if os.path.exists(alt_path):
            path = alt_path
        else:
            raise HTTPException(status_code=404, detail=f"Dataset file not found at: {path}")

    try:
        df = pd.read_csv(path, encoding="utf-8", on_bad_lines="skip")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read CSV: {str(e)}")

    total_rows = len(df)
    columns_info = []
    
    text_candidates = []
    label_candidates = []
    engagement_candidates = []

    for col in df.columns:
        missing_count = int(df[col].isna().sum())
        missing_pct = round((missing_count / total_rows) * 100, 2) if total_rows > 0 else 0
        dtype_str = str(df[col].dtype)
        unique_count = int(df[col].nunique())

        columns_info.append({
            "name": col,
            "dtype": dtype_str,
            "missing_count": missing_count,
            "missing_pct": missing_pct,
            "unique_count": unique_count
        })

        col_lower = col.lower()
        if any(term in col_lower for term in ["text", "title", "content", "headline", "claim", "statement"]):
            text_candidates.append(col)
        if any(term in col_lower for term in ["label", "target", "class", "veracity", "fake", "status"]):
            label_candidates.append(col)
        if any(term in col_lower for term in ["tweet", "retweet", "share", "favorite", "like", "engagement", "count"]):
            engagement_candidates.append(col)

    duplicate_rows = int(df.duplicated().sum())

    # Auto-detect class distribution if a label candidate exists
    class_distribution = {}
    chosen_label_col = label_candidates[0] if label_candidates else ("label" if "label" in df.columns else None)
    if chosen_label_col:
        counts = df[chosen_label_col].value_counts(dropna=False).to_dict()
        class_distribution = {str(k): int(v) for k, v in counts.items()}

    # Auto-detect engagement stats if available
    engagement_stats = None
    chosen_eng_col = engagement_candidates[0] if engagement_candidates else ("tweet_count" if "tweet_count" in df.columns else None)
    if chosen_eng_col:
        eng_num = pd.to_numeric(df[chosen_eng_col], errors="coerce").dropna()
        if len(eng_num) > 0:
            engagement_stats = {
                "column": chosen_eng_col,
                "mean": round(float(eng_num.mean()), 2),
                "median": round(float(eng_num.median()), 2),
                "std": round(float(eng_num.std()), 2),
                "min": float(eng_num.min()),
                "max": float(eng_num.max()),
                "zero_count": int((eng_num == 0).sum())
            }

    preview_rows = df.head(10).replace({np.nan: None}).to_dict(orient="records")

    return {
        "dataset_path": path,
        "filename": os.path.basename(path),
        "total_rows": total_rows,
        "total_columns": len(df.columns),
        "duplicate_rows": duplicate_rows,
        "columns": columns_info,
        "text_candidates": text_candidates,
        "label_candidates": label_candidates,
        "engagement_candidates": engagement_candidates,
        "has_engagement": len(engagement_candidates) > 0 or ("tweet_count" in df.columns),
        "class_distribution": class_distribution,
        "engagement_stats": engagement_stats,
        "preview_rows": preview_rows
    }

def run_training_worker(job_id: str, req: TrainRequest):
    """Worker function executing training job in background."""
    JOBS[job_id]["status"] = "running"
    JOBS[job_id]["progress"] = 20
    JOBS[job_id]["message"] = "Loading dataset and extracting features..."

    path = req.dataset_path
    if not os.path.exists(path):
        alt_path = os.path.join(os.path.dirname(__file__), "..", "..", "datasets", os.path.basename(path))
        if os.path.exists(alt_path):
            path = alt_path

    try:
        df = pd.read_csv(path, encoding="utf-8", on_bad_lines="skip")
        JOBS[job_id]["progress"] = 50
        JOBS[job_id]["message"] = f"Training {req.algorithm} model with {req.feature_mode} feature pipeline..."

        result = train_and_evaluate_experiment(
            df=df,
            text_column=req.text_column,
            label_column=req.label_column,
            engagement_column=req.engagement_column,
            feature_mode=req.feature_mode,
            algorithm=req.algorithm,
            test_size=req.test_size,
            random_state=req.random_state,
            experiment_id=req.experiment_id or job_id,
            dataset_name=req.dataset_name or os.path.basename(path)
        )

        JOBS[job_id]["status"] = "completed"
        JOBS[job_id]["progress"] = 100
        JOBS[job_id]["message"] = "Experiment completed successfully."
        JOBS[job_id]["result"] = result

    except Exception as e:
        JOBS[job_id]["status"] = "failed"
        JOBS[job_id]["progress"] = 100
        JOBS[job_id]["message"] = f"Training failed: {str(e)}"
        JOBS[job_id]["error"] = str(e)

@app.post("/api/ml/train")
def train_experiment(req: TrainRequest, background_tasks: BackgroundTasks):
    """Starts model training asynchronously, returning job ID for polling."""
    job_id = req.experiment_id or f"exp_{uuid.uuid4().hex[:8]}"
    JOBS[job_id] = {
        "job_id": job_id,
        "status": "queued",
        "progress": 0,
        "message": "Job queued for training...",
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "config": req.dict()
    }

    background_tasks.add_task(run_training_worker, job_id, req)
    return {"job_id": job_id, "status": "queued", "message": "Training job initiated."}

@app.get("/api/ml/jobs/{job_id}")
def get_job_status(job_id: str):
    """Poll status and results of a training job."""
    if job_id not in JOBS:
        raise HTTPException(status_code=404, detail="Job ID not found.")
    return JOBS[job_id]

@app.post("/api/ml/ablation")
def run_ablation_study(req: AblationRequest):
    """
    Executes a complete 5-configuration ablation study to directly evaluate the research question:
    1. Text-only baseline
    2. Sentiment/emotion-only
    3. Text + sentiment/emotion
    4. Text + engagement (if available)
    5. Combined (text + sentiment/emotion + engagement, if available)
    """
    path = req.dataset_path
    if not os.path.exists(path):
        alt_path = os.path.join(os.path.dirname(__file__), "..", "..", "datasets", os.path.basename(path))
        if os.path.exists(alt_path):
            path = alt_path
        else:
            raise HTTPException(status_code=404, detail=f"Dataset not found: {path}")

    df = pd.read_csv(path, encoding="utf-8", on_bad_lines="skip")
    has_engagement = req.engagement_column is not None and req.engagement_column in df.columns

    # Define modes to test
    modes_to_test = ["text_only", "sentiment_emotion_only", "text_sentiment_emotion"]
    if has_engagement:
        modes_to_test.extend(["text_engagement", "combined"])

    results = []
    baseline_f1 = None
    baseline_acc = None

    for mode in modes_to_test:
        sub_id = f"ablation_{mode}_{uuid.uuid4().hex[:6]}"
        try:
            res = train_and_evaluate_experiment(
                df=df,
                text_column=req.text_column,
                label_column=req.label_column,
                engagement_column=req.engagement_column if has_engagement else None,
                feature_mode=mode,
                algorithm=req.algorithm,
                test_size=req.test_size,
                random_state=req.random_state,
                experiment_id=sub_id,
                dataset_name=req.dataset_name
            )

            metrics = res["metrics"]
            if mode == "text_only":
                baseline_f1 = metrics["f1_binary"]
                baseline_acc = metrics["accuracy"]
                f1_delta = 0.0
                acc_delta = 0.0
            else:
                f1_delta = round(metrics["f1_binary"] - (baseline_f1 or 0.0), 4)
                acc_delta = round(metrics["accuracy"] - (baseline_acc or 0.0), 4)

            results.append({
                "feature_mode": mode,
                "algorithm": req.algorithm,
                "accuracy": metrics["accuracy"],
                "precision": metrics["precision_binary"],
                "recall": metrics["recall_binary"],
                "f1_score": metrics["f1_binary"],
                "roc_auc": metrics["roc_auc"],
                "pr_auc": metrics["pr_auc"],
                "f1_delta_from_baseline": f1_delta,
                "accuracy_delta_from_baseline": acc_delta,
                "confusion_matrix": res["confusion_matrix"],
                "roc_curve": res["roc_curve"],
                "duration_seconds": res["duration_seconds"]
            })
        except Exception as e:
            results.append({
                "feature_mode": mode,
                "error": str(e)
            })

    # Research synthesis: calculate if fusion beat text baseline
    combined_entry = next((r for r in results if r.get("feature_mode") == "combined"), None)
    text_entry = next((r for r in results if r.get("feature_mode") == "text_only"), None)
    
    hypothesis_supported = False
    improvement_summary = "Inconclusive"
    if combined_entry and text_entry and "f1_score" in combined_entry and "f1_score" in text_entry:
        delta = combined_entry["f1_score"] - text_entry["f1_score"]
        hypothesis_supported = delta > 0.005
        improvement_summary = (
            f"Combining text, sentiment/emotion, and engagement improved F1-score by {delta:+.4f} "
            f"({text_entry['f1_score']:.4f} -> {combined_entry['f1_score']:.4f})."
        ) if hypothesis_supported else (
            f"Combined model F1-score was {combined_entry['f1_score']:.4f} vs baseline {text_entry['f1_score']:.4f} "
            f"(delta: {delta:+.4f})."
        )

    return {
        "dataset_name": req.dataset_name,
        "algorithm": req.algorithm,
        "has_engagement": has_engagement,
        "baseline_mode": "text_only",
        "results": results,
        "research_synthesis": {
            "hypothesis_supported": hypothesis_supported,
            "improvement_summary": improvement_summary,
            "baseline_accuracy": text_entry["accuracy"] if text_entry else None,
            "baseline_f1": text_entry["f1_score"] if text_entry else None,
            "combined_accuracy": combined_entry["accuracy"] if combined_entry else None,
            "combined_f1": combined_entry["f1_score"] if combined_entry else None,
        }
    }

@app.post("/api/ml/predict")
def predict_text(req: PredictRequest):
    """
    Analyzes an input claim or social post:
    1. Extracts VADER sentiment
    2. Extracts NRC emotions
    3. Runs inference through trained pipeline if model artifact exists
    """
    text = req.text
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Text input cannot be empty.")

    sentiment = analyze_sentiment(text)
    emotions = analyze_emotions(text)

    # Find model artifact
    model_bundle = None
    target_path = None
    if req.experiment_id:
        target_path = os.path.join(MODELS_DIR, f"{req.experiment_id}.joblib")
    
    if not target_path or not os.path.exists(target_path):
        # Look for the most recently modified joblib model in saved_models
        all_models = [os.path.join(MODELS_DIR, f) for f in os.listdir(MODELS_DIR) if f.endswith(".joblib")]
        if all_models:
            all_models.sort(key=os.path.getmtime, reverse=True)
            target_path = all_models[0]

    predicted_label = None
    label_name = None
    confidence = None
    probabilities = None

    if target_path and os.path.exists(target_path):
        try:
            model_bundle = joblib.load(target_path)
            pipeline = model_bundle["pipeline"]
            clf = model_bundle["classifier"]

            eng_series = pd.Series([req.engagement_value or 0.0])
            X_input = pipeline.transform([text], eng_series)

            pred_class = int(clf.predict(X_input)[0])
            predicted_label = pred_class
            label_name = "Misinformation / Rumor" if pred_class == 1 else "Factual / Verified"

            if hasattr(clf, "predict_proba"):
                probs = clf.predict_proba(X_input)[0]
                probabilities = {
                    "real": round(float(probs[0]), 4),
                    "fake": round(float(probs[1]), 4)
                }
                confidence = probabilities["fake"] if pred_class == 1 else probabilities["real"]
            else:
                confidence = 0.85
                probabilities = {"real": 0.15 if pred_class == 1 else 0.85, "fake": 0.85 if pred_class == 1 else 0.15}
        except Exception as e:
            print(f"Prediction inference error: {e}")

    # Risk level determination based on model confidence and linguistic indicators
    risk_level = "Undetermined"
    if probabilities:
        fake_prob = probabilities["fake"]
        if fake_prob >= 0.70:
            risk_level = "High Misinformation Probability"
        elif fake_prob >= 0.40:
            risk_level = "Moderate Suspicion"
        else:
            risk_level = "Low Risk / Likely Factual"

    return {
        "text": text,
        "engagement_value": req.engagement_value,
        "sentiment": sentiment,
        "emotions": emotions,
        "prediction": {
            "label": predicted_label,
            "label_name": label_name,
            "confidence": confidence,
            "probabilities": probabilities,
            "risk_level": risk_level,
            "model_used": os.path.basename(target_path) if target_path else "None (Lexicon Only)"
        }
    }

@app.get("/api/ml/analytics/distribution")
def get_analytics_distribution(
    dataset_path: str = Query(..., description="Path to CSV dataset"),
    text_column: str = Query("title"),
    label_column: str = Query("label"),
    engagement_column: Optional[str] = Query("tweet_count"),
    sample_limit: int = Query(500)
):
    """
    Computes statistical emotion, sentiment, and engagement distributions
    grouped by ground truth label across the dataset.
    """
    path = dataset_path
    if not os.path.exists(path):
        alt_path = os.path.join(os.path.dirname(__file__), "..", "..", "datasets", os.path.basename(path))
        if os.path.exists(alt_path):
            path = alt_path
        else:
            raise HTTPException(status_code=404, detail=f"Dataset not found: {path}")

    df = pd.read_csv(path, encoding="utf-8", on_bad_lines="skip")
    df = df.dropna(subset=[text_column, label_column])
    if len(df) > sample_limit:
        df = df.sample(n=sample_limit, random_state=42)

    has_engagement = engagement_column and engagement_column in df.columns

    def norm_label(v):
        s = str(v).strip().lower()
        return "Fake / Rumor" if s in ["1", "fake", "rumor", "pants-on-fire", "false"] else "Real / Factual"

    labels = df[label_column].apply(norm_label).values
    texts = df[text_column].astype(str).tolist()

    emotion_by_label: Dict[str, Dict[str, List[float]]] = {
        "Real / Factual": {emo: [] for emo in EMOTIONS},
        "Fake / Rumor": {emo: [] for emo in EMOTIONS}
    }

    sentiment_by_label: Dict[str, Dict[str, List[float]]] = {
        "Real / Factual": {"compound": [], "pos": [], "neg": [], "neu": []},
        "Fake / Rumor": {"compound": [], "pos": [], "neg": [], "neu": []}
    }

    engagement_by_label: Dict[str, List[float]] = {
        "Real / Factual": [],
        "Fake / Rumor": []
    }

    for idx, text in enumerate(texts):
        lbl = labels[idx]
        sent = analyze_sentiment(text)
        emo = analyze_emotions(text)

        sentiment_by_label[lbl]["compound"].append(sent["compound"])
        sentiment_by_label[lbl]["pos"].append(sent["pos"])
        sentiment_by_label[lbl]["neg"].append(sent["neg"])
        sentiment_by_label[lbl]["neu"].append(sent["neu"])

        for e in EMOTIONS:
            emotion_by_label[lbl][e].append(emo[e])

        if has_engagement:
            eng_val = pd.to_numeric(df.iloc[idx][engagement_column], errors="coerce")
            if not pd.isna(eng_val):
                engagement_by_label[lbl].append(float(eng_val))

    # Aggregating emotion averages for radar/bar charts
    emotion_summary = []
    for emo in EMOTIONS:
        real_vals = emotion_by_label["Real / Factual"][emo]
        fake_vals = emotion_by_label["Fake / Rumor"][emo]
        emotion_summary.append({
            "emotion": emo.capitalize(),
            "real_avg": round(float(np.mean(real_vals)), 4) if real_vals else 0.0,
            "fake_avg": round(float(np.mean(fake_vals)), 4) if fake_vals else 0.0
        })

    # Sentiment average summary
    sentiment_summary = []
    for metric in ["compound", "pos", "neg", "neu"]:
        real_vals = sentiment_by_label["Real / Factual"][metric]
        fake_vals = sentiment_by_label["Fake / Rumor"][metric]
        sentiment_summary.append({
            "metric": metric.capitalize(),
            "real_avg": round(float(np.mean(real_vals)), 4) if real_vals else 0.0,
            "fake_avg": round(float(np.mean(fake_vals)), 4) if fake_vals else 0.0
        })

    # Engagement summary
    eng_summary = {
        "has_engagement": has_engagement,
        "real_mean": round(float(np.mean(engagement_by_label["Real / Factual"])), 2) if engagement_by_label["Real / Factual"] else 0.0,
        "fake_mean": round(float(np.mean(engagement_by_label["Fake / Rumor"])), 2) if engagement_by_label["Fake / Rumor"] else 0.0,
        "real_median": round(float(np.median(engagement_by_label["Real / Factual"])), 2) if engagement_by_label["Real / Factual"] else 0.0,
        "fake_median": round(float(np.median(engagement_by_label["Fake / Rumor"])), 2) if engagement_by_label["Fake / Rumor"] else 0.0,
    }

    return {
        "sample_size": len(df),
        "emotion_comparison": emotion_summary,
        "sentiment_comparison": sentiment_summary,
        "engagement_comparison": eng_summary
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
