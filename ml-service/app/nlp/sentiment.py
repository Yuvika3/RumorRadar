"""
VADER (Valence Aware Dictionary and sEntiment Reasoner) Lexicon & Scoring
Implements documented sentiment extraction:
- Compound valence score [-1.0, 1.0]
- Positive, Negative, and Neutral proportions [0.0, 1.0]
Based on Hutto & Gilbert (2014) ICWSM.
"""

import math
import re

# Curated core valence lexicon with polarity scores for social text & news
LEXICON = {
    # Strong positive
    "great": 3.1, "excellent": 3.2, "good": 1.9, "best": 3.2, "amazing": 3.0,
    "true": 2.0, "truth": 2.2, "verified": 2.3, "fact": 1.8, "factual": 2.0,
    "honest": 2.3, "reliable": 2.2, "confirmed": 1.9, "success": 2.4, "win": 2.0,
    "peace": 2.5, "safe": 2.1, "hope": 2.1, "love": 3.2, "praise": 2.1,
    "hero": 2.4, "victory": 2.5, "trust": 2.1, "worthy": 2.0, "real": 1.5,
    "authentic": 2.2, "valid": 1.8, "support": 1.7, "protect": 1.9, "cure": 2.4,
    "solution": 2.0, "fair": 1.8, "justice": 2.3, "accurate": 2.1, "right": 1.4,
    
    # Moderate positive
    "benefit": 1.6, "progress": 1.8, "boost": 1.7, "gain": 1.5, "clear": 1.3,
    "help": 1.7, "smart": 1.8, "clean": 1.6, "strong": 1.6, "agree": 1.5,
    "positive": 1.9, "validity": 1.9, "evidence": 1.4, "proven": 1.9, "inspire": 2.2,
    
    # Strong negative
    "fake": -3.2, "hoax": -3.4, "lie": -3.2, "liar": -3.3, "false": -2.3,
    "rumor": -2.4, "fraud": -3.2, "scam": -3.3, "corrupt": -3.0, "corruption": -3.1,
    "crime": -2.5, "kill": -3.5, "murder": -3.7, "death": -2.9, "dead": -2.5,
    "disaster": -3.1, "crisis": -2.8, "terror": -3.4, "terrorist": -3.6, "war": -3.2,
    "hate": -3.2, "evil": -3.4, "danger": -2.4, "dangerous": -2.5, "threat": -2.4,
    "toxic": -2.7, "shame": -2.2, "guilty": -2.4, "steal": -2.8, "stolen": -2.7,
    "bribe": -2.9, "illegal": -2.6, "impeach": -2.4, "scandal": -2.9, "arrest": -2.1,
    "conspiracy": -2.5, "destroy": -2.7, "ruin": -2.5, "panic": -2.6, "fear": -2.2,
    "shocking": -1.8, "outrage": -2.8, "furious": -2.7, "angry": -2.3, "enemy": -2.5,
    
    # Moderate negative
    "bad": -2.5, "worst": -3.1, "fail": -2.3, "failure": -2.4, "wrong": -2.1,
    "loss": -1.8, "lose": -1.7, "drop": -1.3, "harm": -2.5, "hurt": -2.3,
    "damage": -2.2, "broken": -1.9, "weak": -1.8, "doubt": -1.5, "deny": -1.4,
    "denied": -1.4, "reject": -1.6, "refuse": -1.3, "oppose": -1.6, "attack": -2.1,
    "blame": -1.9, "chaos": -2.4, "warning": -1.6, "warn": -1.4, "sue": -1.9,
    "victim": -2.0, "tragedy": -2.9, "collapse": -2.4, "exposed": -1.5, "busted": -2.0
}

NEGATION_WORDS = {
    "not", "never", "no", "neither", "nor", "hardly", "barely",
    "scarcely", "cannot", "cant", "can't", "wont", "won't", "dont",
    "don't", "isnt", "isn't", "wasnt", "wasn't", "aint", "ain't"
}

BOOSTER_DICT = {
    "absolutely": 0.293, "incredibly": 0.293, "extremely": 0.293,
    "very": 0.227, "really": 0.227, "massively": 0.227, "totally": 0.227,
    "completely": 0.227, "highly": 0.227, "super": 0.25, "hugely": 0.25,
    "barely": -0.25, "hardly": -0.25, "slightly": -0.2, "somewhat": -0.15
}

def clean_text_for_sentiment(text: str):
    return re.findall(r"\b[\w'-]+\b", text.lower())

def analyze_sentiment(text: str) -> dict:
    """
    Computes sentiment compound, positive, negative, and neutral scores.
    Compound is normalized via standard VADER formula: sum / sqrt(sum^2 + alpha).
    """
    if not text or not isinstance(text, str):
        return {"compound": 0.0, "pos": 0.0, "neg": 0.0, "neu": 1.0}
    
    words = clean_text_for_sentiment(text)
    if not words:
        return {"compound": 0.0, "pos": 0.0, "neg": 0.0, "neu": 1.0}

    sentiments = []
    for i, word in enumerate(words):
        val = LEXICON.get(word, 0.0)
        if val != 0.0:
            # Check for negation in 3 preceding words
            for prev_idx in range(max(0, i - 3), i):
                if words[prev_idx] in NEGATION_WORDS:
                    val = val * -0.74
                    break
            # Check for booster word immediately preceding
            if i > 0 and words[i - 1] in BOOSTER_DICT:
                booster = BOOSTER_DICT[words[i - 1]]
                val = val + (booster if val > 0 else -booster)
            sentiments.append(val)

    if not sentiments:
        return {"compound": 0.0, "pos": 0.0, "neg": 0.0, "neu": 1.0}

    sum_s = sum(sentiments)
    alpha = 15.0
    compound = sum_s / math.sqrt((sum_s * sum_s) + alpha)
    compound = max(-1.0, min(1.0, compound))

    pos_sum = sum(s for s in sentiments if s > 0)
    neg_sum = sum(abs(s) for s in sentiments if s < 0)
    neu_count = len(words) - len(sentiments)

    total_magnitude = pos_sum + neg_sum + (neu_count * 0.5)
    if total_magnitude == 0:
        return {"compound": round(compound, 4), "pos": 0.0, "neg": 0.0, "neu": 1.0}

    pos = round(pos_sum / total_magnitude, 4)
    neg = round(neg_sum / total_magnitude, 4)
    neu = round(max(0.0, 1.0 - (pos + neg)), 4)

    return {
        "compound": round(compound, 4),
        "pos": pos,
        "neg": neg,
        "neu": neu
    }
