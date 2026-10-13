"""
NRC Emotion Lexicon Feature Extraction
Extracts 8 fundamental Plutchik emotion dimensions:
- anger, anticipation, disgust, fear, joy, sadness, surprise, trust
Based on Saif M. Mohammad and Peter D. Turney (2013),
"Crowdsourcing a Word-Emotion Association Lexicon", Computational Intelligence.
"""

import re
from typing import Dict, List

EMOTIONS = ["anger", "anticipation", "disgust", "fear", "joy", "sadness", "surprise", "trust"]

# Curated NRC Emotion Lexicon association map
NRC_LEXICON: Dict[str, List[str]] = {
    # Anger
    "furious": ["anger", "disgust"], "rage": ["anger"], "hate": ["anger", "disgust", "fear"],
    "corrupt": ["anger", "disgust"], "fraud": ["anger", "disgust"], "lie": ["anger", "disgust"],
    "scandal": ["anger", "disgust", "surprise"], "impeach": ["anger", "fear"], "attack": ["anger", "fear"],
    "destroy": ["anger", "fear", "sadness"], "enemy": ["anger", "fear"], "punish": ["anger", "fear"],
    "outrage": ["anger", "disgust", "surprise"], "evil": ["anger", "disgust", "fear"], "crime": ["anger", "disgust", "fear"],
    "betray": ["anger", "disgust", "sadness"], "protest": ["anger", "anticipation"], "riot": ["anger", "fear"],

    # Fear
    "terror": ["fear", "anger"], "threat": ["fear", "anger"], "danger": ["fear"], "panic": ["fear", "surprise"],
    "crisis": ["fear", "sadness"], "war": ["fear", "anger", "sadness"], "dead": ["fear", "sadness"],
    "death": ["fear", "sadness"], "kill": ["fear", "anger"], "murder": ["fear", "anger", "sadness"],
    "disaster": ["fear", "sadness", "surprise"], "warning": ["fear", "anticipation"], "virus": ["fear", "disgust"],
    "collapse": ["fear", "sadness"], "horrific": ["fear", "disgust"], "urgent": ["fear", "anticipation"],

    # Disgust
    "toxic": ["disgust"], "shame": ["disgust", "sadness"], "repulsive": ["disgust"], "nasty": ["disgust", "anger"],
    "scam": ["disgust", "anger"], "bribe": ["disgust", "anger"], "hoax": ["disgust", "anger", "surprise"],
    "gross": ["disgust"], "filthy": ["disgust"], "vile": ["disgust", "anger"], "smear": ["disgust", "anger"],

    # Sadness
    "grief": ["sadness"], "tragedy": ["sadness", "fear"], "loss": ["sadness"], "fail": ["sadness"],
    "failure": ["sadness"], "mourn": ["sadness"], "sorrow": ["sadness"], "depressed": ["sadness"],
    "regret": ["sadness"], "victim": ["sadness", "fear"], "tears": ["sadness"], "broke": ["sadness"],
    "bankrupt": ["sadness", "fear"], "hurt": ["sadness", "fear"], "damage": ["sadness"],

    # Joy
    "win": ["joy", "anticipation", "trust"], "victory": ["joy", "trust"], "success": ["joy", "anticipation"],
    "celebrate": ["joy", "anticipation"], "praise": ["joy", "trust"], "happy": ["joy"], "love": ["joy", "trust"],
    "triumph": ["joy", "trust"], "award": ["joy", "anticipation"], "cure": ["joy", "trust"], "hero": ["joy", "trust"],
    "blessed": ["joy", "trust"], "miracle": ["joy", "surprise", "trust"], "delight": ["joy"], "proud": ["joy", "trust"],

    # Trust
    "truth": ["trust", "joy"], "true": ["trust"], "fact": ["trust"], "factual": ["trust"], "honest": ["trust"],
    "verified": ["trust"], "confirmed": ["trust"], "evidence": ["trust"], "proof": ["trust"], "reliable": ["trust"],
    "authentic": ["trust"], "valid": ["trust"], "science": ["trust"], "doctor": ["trust"], "expert": ["trust"],
    "leader": ["trust"], "justice": ["trust"], "law": ["trust"], "agreement": ["trust"], "secure": ["trust"],

    # Anticipation
    "plan": ["anticipation"], "forecast": ["anticipation"], "predict": ["anticipation"], "election": ["anticipation"],
    "prepare": ["anticipation"], "hope": ["anticipation", "joy"], "future": ["anticipation"], "vote": ["anticipation", "trust"],
    "expect": ["anticipation"], "announcement": ["anticipation", "surprise"], "await": ["anticipation"],
    "campaign": ["anticipation"], "countdown": ["anticipation"], "goal": ["anticipation"],

    # Surprise
    "shocking": ["surprise", "fear"], "breaking": ["surprise", "anticipation"], "unexpected": ["surprise"],
    "stunned": ["surprise"], "revelation": ["surprise", "trust"], "exposed": ["surprise", "disgust"],
    "astonishing": ["surprise", "joy"], "unbelievable": ["surprise"], "sudden": ["surprise"], "bizarre": ["surprise"]
}

def analyze_emotions(text: str) -> Dict[str, float]:
    """
    Computes normalized emotion intensity for 8 basic emotions.
    Returns a dictionary mapping emotion -> normalized score [0.0, 1.0].
    """
    if not text or not isinstance(text, str):
        return {emo: 0.0 for emo in EMOTIONS}

    words = re.findall(r"\b[\w'-]+\b", text.lower())
    if not words:
        return {emo: 0.0 for emo in EMOTIONS}

    counts = {emo: 0 for emo in EMOTIONS}
    matched_words = 0

    for word in words:
        if word in NRC_LEXICON:
            matched_words += 1
            for emo in NRC_LEXICON[word]:
                counts[emo] += 1

    # Normalization: relative frequency per token with smoothing
    total_tokens = max(len(words), 1)
    result = {}
    for emo in EMOTIONS:
        # Scale score so typical short headlines produce distinguishable 0..1 values
        score = (counts[emo] / total_tokens) * 3.0
        result[emo] = round(min(1.0, score), 4)

    return result

def get_emotion_vector(text: str) -> List[float]:
    """Returns the 8-dimensional emotion vector in canonical order."""
    scores = analyze_emotions(text)
    return [scores[emo] for emo in EMOTIONS]
