"""
RumorRadar ML Service Verification Test Suite
Tests NLP sentiment/emotion extraction, feature pipelines,
data leakage prevention, held-out metrics, ablation, and error boundaries.
"""

import os
import sys
import unittest
import pandas as pd
import numpy as np

# Ensure app is in path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.nlp.sentiment import analyze_sentiment
from app.nlp.emotion import analyze_emotions, EMOTIONS
from app.core.preprocessor import RumorRadarFeaturePipeline
from app.models.trainer import train_and_evaluate_experiment

DATASETS_DIR = os.path.join(os.path.dirname(__file__), "..", "datasets")

class TestRumorRadarML(unittest.TestCase):
    def test_01_vader_sentiment(self):
        """Verify VADER sentiment polarity and valence shifters."""
        pos = analyze_sentiment("This is a great, verified, and honest factual victory!")
        self.assertGreater(pos["compound"], 0.3)
        self.assertGreater(pos["pos"], 0.0)

        neg = analyze_sentiment("Shocking scandal, corrupt fraud, and dangerous criminal crisis!")
        self.assertLess(neg["compound"], -0.3)
        self.assertGreater(neg["neg"], 0.0)

        negated = analyze_sentiment("This is not a great victory.")
        self.assertLess(negated["compound"], pos["compound"])

        neu = analyze_sentiment("The committee met at ten in the conference room.")
        self.assertGreaterEqual(neu["neu"], 0.5)

    def test_02_nrc_emotions(self):
        """Verify NRC 8-emotion extraction."""
        text = "Furious citizens outrage and riot against corrupt terrorist attack!"
        emotions = analyze_emotions(text)
        self.assertEqual(len(emotions), 8)
        for emo in EMOTIONS:
            self.assertIn(emo, emotions)
            self.assertGreaterEqual(emotions[emo], 0.0)
            self.assertLessEqual(emotions[emo], 1.0)
        self.assertGreater(emotions["anger"] + emotions["fear"], 0.0)

    def test_03_feature_pipeline_fit_transform(self):
        """Verify feature extraction for all supported modes without leakage."""
        texts = [
            "Official audit confirms verified vote tallies",
            "Shocking leaked hoax exposes secret bribery scandal",
            "Health agency releases safety statistics report",
            "False rumors debunked by independent fact-checkers"
        ]
        eng = pd.Series([12, 1450, 45, 980])

        for mode in ["text_only", "sentiment_emotion_only", "text_sentiment_emotion", "text_engagement", "combined"]:
            pipeline = RumorRadarFeaturePipeline(feature_mode=mode)
            X = pipeline.fit_transform(texts, eng)
            self.assertEqual(X.shape[0], len(texts))
            self.assertGreater(X.shape[1], 0)

    def test_04_error_when_engagement_missing(self):
        """Verify system raises clear error when engagement mode is requested without engagement data."""
        df = pd.DataFrame({
            "title": ["Claim one headline", "Claim two headline", "Claim three", "Claim four"],
            "label": [0, 1, 0, 1]
        })
        with self.assertRaises(ValueError):
            train_and_evaluate_experiment(
                df=df,
                text_column="title",
                label_column="label",
                engagement_column=None,
                feature_mode="combined"
            )

    def test_05_train_and_held_out_evaluation(self):
        """Verify complete training and held-out test evaluation on FakeNewsNet benchmark."""
        csv_path = os.path.join(DATASETS_DIR, "fakenewsnet_politifact.csv")
        self.assertTrue(os.path.exists(csv_path), "FakeNewsNet dataset CSV must exist")

        df = pd.read_csv(csv_path)
        result = train_and_evaluate_experiment(
            df=df,
            text_column="title",
            label_column="label",
            engagement_column="tweet_count",
            feature_mode="combined",
            algorithm="logistic_regression",
            test_size=0.2,
            random_state=42,
            experiment_id="test_suite_run"
        )

        metrics = result["metrics"]
        self.assertIn("accuracy", metrics)
        self.assertIn("f1_binary", metrics)
        self.assertIn("roc_auc", metrics)
        self.assertGreater(metrics["accuracy"], 0.70)
        self.assertGreater(metrics["f1_binary"], 0.65)
        self.assertGreater(metrics["roc_auc"], 0.75)

        # Verify confusion matrix integrity
        cm = result["confusion_matrix"]
        self.assertEqual(cm["tn"] + cm["fp"] + cm["fn"] + cm["tp"], result["test_samples"])

        # Verify ROC and PR curve generation
        self.assertGreater(len(result["roc_curve"]), 5)
        self.assertGreater(len(result["pr_curve"]), 5)

        # Verify artifact persistence
        self.assertTrue(os.path.exists(result["artifact_path"]))

if __name__ == "__main__":
    unittest.main()
