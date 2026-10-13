# RumorRadar: Multimodal Social Media Misinformation Analytics & Feature Fusion
**Academic Research Report Draft**  
**Course / Project**: Web and Social Media Analytics  
**Platform**: RumorRadar Full-Stack Research Platform  

---

## Abstract
The rapid spread of misinformation on social platforms has emerged as one of the most pressing socio-technical crises of our digital era. Prior computational approaches have largely depended on isolated textual semantic classifiers or speculative assumptions that rumors are inherently accompanied by extreme negative sentiment, outrage, or hyper-viral diffusion. This study investigates the empirical research question: *"Does combining textual content, sentiment/emotion features, and social engagement features improve misinformation classification compared with text-only machine learning models?"* Using ground-truth verified claims from the FakeNewsNet PolitiFact benchmark (1,056 records: 624 verified factual, 432 verified rumors), we formulate a leakage-free multimodal fusion pipeline combining Term Frequency-Inverse Document Frequency (TF-IDF) unigrams and bigrams, Valence Aware Dictionary for sEntiment Reasoning (VADER) sentiment polarity, NRC 8-dimensional Plutchik emotion vectors, and log-scaled Twitter engagement counts. Through stratified 80/20 train/test evaluation across discriminative and generative machine learning models (Logistic Regression, Multinomial Naive Bayes, Complement Naive Bayes, and Random Forest), we demonstrate that textual lexical representations constitute the predominant classification signal (Baseline TF-IDF F1: 81.71%, Accuracy: 85.85%, ROC-AUC: 0.9407). Models trained solely on affective features fail to achieve reliable discrimination (F1: 47.15%, Accuracy: 69.34%), proving that emotional arousal is pervasive in authentic news reporting regarding crises and investigations. Multimodal fusion yields calibrated decision boundaries with peak precision (90.14% precision, 85.85% accuracy, 81.01% F1) and an ROC-AUC of 0.9369. These empirical findings substantiate that social engagement and affective features provide valuable calibration rather than categorical proof of misinformation.

---

## Introduction
Misinformation across microblogging and social networking ecosystems distorts public perception of scientific consensus, electoral integrity, and public healthcare initiatives. Early detection of unverified rumors represents a significant academic and practical challenge due to linguistic subtlety, intentional mimicry of journalistic style, and the velocity of social media information diffusion.

A prevalent assumption in social media analytics is that misinformation can be identified through affective extremism—namely, that false rumors inevitably exhibit higher anger, fear, or negative sentiment, or that massive resharing spikes definitively flag manipulative falsehoods. However, verified journalism covering conflicts, judicial investigations, environmental disasters, and political controversies also inherently evokes high negative valence and substantial virality.

To address this challenge rigorously, the RumorRadar platform was designed and implemented as an academic research platform for Web and Social Media Analytics. It formulates a multimodal experimental methodology comparing textual content (TF-IDF), sentiment/emotion extraction (VADER + NRC Lexicon), and social engagement diffusion metrics against strictly held-out test splits. Fact-checked labels established by professional journalism institutions serve as ground truth, ensuring that subjective heuristics never substitute for empirical evidence.

---

## Literature Survey
Recent literature in social media misinformation detection spans three primary computational lineages:

1. **Content and Lexical Representation**:  
   Pioneering research by Shu et al. (2017, 2020) demonstrated that linguistic cues, lexical diversity, and syntactic structures provide essential discriminatory features. In their benchmark repository, *FakeNewsNet*, Shu et al. cataloged news content alongside temporal and social context across PolitiFact and GossipCop domains, establishing that headline formulation and semantic framing differ between verified reporting and deceptive fabrications.

2. **Affective and Psychological Framing**:  
   The role of sentiment and emotional tone in misinformation diffusion was highlighted by Vosoughi, Roy, and Aral (2018), who observed that false rumors diffused faster and deeper than factual news on Twitter, often correlating with feelings of surprise and disgust. Complementary computational sentiment methods, notably the Valence Aware Dictionary and sEntiment Reasoner (VADER) by Hutto and Gilbert (2014), and the NRC Emotion Lexicon by Mohammad and Turney (2013), provided interpretable lexicons to quantify affective dimensions (anger, fear, sadness, joy, trust, surprise). However, Memon et al. (2022) in their *FactDrill* framework warned against simplistic heuristics, noting that factual fact-checks frequently debunk emotionally charged stories that nevertheless contain genuine reporting elements.

3. **Social Network Context and Diffusion Metrics**:  
   Research by Castillo, Mendoza, and Poblete (2011), as well as Kwon et al. (2017), underscored that rumor diffusion exhibits structural propagation dynamics. Retweet velocity, resharing frequency, and user engagement metrics reflect collective social reactions. Nonetheless, social context features are frequently unavailable during early propagation or across privacy-restricted platforms, necessitating empirical investigations into multimodal trade-offs when engagement data is partially hydrated or missing.

---

## Problem Statement and Research Gap

### Problem Statement
Given a social media post or news claim $x$ comprising textual content $t$, optional affective attributes $s$, and optional social engagement attributes $e$, determine whether claim $x$ corresponds to verified factual journalism ($y=0$) or debunked misinformation/rumor ($y=1$), benchmarked strictly against ground-truth fact-check verdicts.

### Research Gap
While numerous studies examine deep neural language models or independent social graph analyses in isolation, there is a distinct shortage of transparent, reproducible academic platforms that systematically evaluate the exact incremental contribution of combining textual semantics with sentiment/emotion and social engagement features under strict leakage-free conditions. Many existing published works suffer from one or more methodological weaknesses:
1. **Unrealistic Heuristic Assumptions**: Assuming that high negative sentiment or high virality constitutes proof of misinformation, leading to high false-positive rates on critical breaking news.
2. **Data Leakage**: Fitting feature scalers and TF-IDF vocabularies across the entire dataset prior to splitting, artificially inflating reported test metrics.
3. **Black-Box Opacity**: Relying on uninterpretable deep embeddings without isolating the individual contributions of text, affective signals, and social diffusion through rigorous ablation.
4. **Lack of Graceful Degradation**: Failing to model the reality of social platforms where engagement metrics are frequently missing or inaccessible.

RumorRadar closes this gap by implementing an end-to-end reproducible research environment with explicit feature ablation, automated leakage prevention, and transparent held-out evaluations.

---

## Proposed System, Objectives and Architecture

### Primary Research Objectives
1. Formulate a reproducible experimental pipeline comparing five feature configurations:
   - Configuration A: Text-only lexical baseline (TF-IDF).
   - Configuration B: Sentiment & emotion features only (VADER + NRC).
   - Configuration C: Text + Sentiment/Emotion multimodal fusion.
   - Configuration D: Text + Social Engagement fusion.
   - Configuration E: Combined Multimodal Fusion (Text + Emotion + Engagement).
2. Measure and report genuine held-out test metrics: Accuracy, Precision, Recall, F1-Score, Confusion Matrices, ROC-AUC, and Precision-Recall AUC.
3. Prevent information leakage by ensuring all tokenizers, TF-IDF transformations, and engagement scaling parameters are fit solely on the training partition.
4. Support dynamic dataset ingestion, automated column mapping, missing value analysis, and graceful degradation when engagement attributes are missing.

### Architecture Overview
The RumorRadar system follows a modular full-stack architecture:
- **Presentation Layer**: Built with React 18, Vite, TypeScript, Tailwind CSS, and Recharts, providing eight dedicated research pages including an Experiment Lab, Model Comparison Matrix, Emotion & Social Visualizer, and Data Explorer.
- **Backend Orchestrator**: Developed with Node.js, Express, and TypeScript, providing RESTful endpoints for dataset ingestion, experiment tracking, held-out evaluation logging, and dynamic report export. Supported by MongoDB with an automated local persistent storage fallback layer.
- **Machine Learning & NLP Engine**: Developed with Python 3.12, FastAPI, scikit-learn, pandas, NumPy, and joblib, executing vectorized NLP extraction, train/test splitting, classifier training, and metric serialization.

---

## Methodology
*(In compliance with reporting requirements, this section presents operational methodology without citations.)*

### 1. Benchmark Dataset and Ground Truth
The primary experimental dataset comprises 1,056 claims from the PolitiFact benchmark subset:
- 624 verified factual records ($y=0$, representing True and Mostly True journalistic findings).
- 432 verified misinformation records ($y=1$, representing False, Fabrication, and Pants-on-Fire claims).
- Each claim record contains: a unique identifier, claim headline text, source URL, Twitter/X tweet share counts representing verified diffusion volume, and normalized binary veracity label.
- A secondary text-only dataset stripped of engagement counts is maintained to test system behavior and enforce automatic degradation when engagement fields are missing.

### 2. Feature Extraction Pipelines
Three distinct feature modalities are computed:
- **Textual Lexical Features ($X_{text}$)**: Extracted via Term Frequency-Inverse Document Frequency (TF-IDF) using unigram and bigram ranges $(1, 2)$, sublinear term-frequency scaling, and a maximum vocabulary cap of 2,500 features. Minimum document frequency is set adaptively based on corpus size.
- **Sentiment & Emotion Features ($X_{sent\_emo}$)**: A 12-dimensional continuous feature vector consisting of:
  - VADER sentiment metrics: continuous compound valence normalized via the hyperbolic square-root formula, positive proportion, negative proportion, and neutral proportion.
  - NRC 8-dimensional Plutchik emotion vectors: normalized frequency intensities for anger, anticipation, disgust, fear, joy, sadness, surprise, and trust, scaled relative to token density.
- **Social Engagement Diffusion Features ($X_{eng}$)**: Raw Twitter share counts exhibit severe positive skew. To stabilize gradient computation and prevent outlier distortion, engagement counts undergo log-transform smoothing:
  $$x_{log} = \log(1 + \text{tweet\_count})$$
  followed by MinMax scaling to constrain values between $0.0$ and $1.0$.

### 3. Leakage Prevention and Multimodal Stacking
To eliminate data leakage:
1. The dataset is split into an 80% training partition (844 samples) and a 20% held-out test partition (212 samples) using stratified sampling to guarantee identical veracity proportions.
2. The TF-IDF vectorizer and the MinMax engagement scaler are fitted strictly on the training partition ($X_{train}$).
3. The held-out test partition ($X_{test}$) is strictly transformed using the parameters learned from $X_{train}$.
4. The individual feature matrices are horizontally stacked using sparse matrix concatenation (`scipy.sparse.hstack`):
   $$X_{fused} = [X_{text} \parallel X_{sent\_emo} \parallel X_{eng}]$$

### 4. Classification Algorithms and Held-Out Evaluation
The multimodal feature space is evaluated across four distinct classifiers:
- **L2-Regularized Logistic Regression**: Primary linear discriminative model optimizing cross-entropy loss with liblinear/lbfgs solvers.
- **Multinomial Naive Bayes**: Generative probabilistic classifier with Laplace smoothing ($\alpha = 1.0$), utilizing non-negative MinMax-scaled representations.
- **Complement Naive Bayes**: Adjusted for potential class imbalance.
- **Random Forest**: Non-linear ensemble model with 100 decision trees.

Performance is quantified on the untouched test partition through: Accuracy, Binary Precision, Binary Recall, Binary F1-Score, Macro Precision/Recall/F1, ROC-AUC, Precision-Recall AUC, and full 2x2 confusion matrices.

---

## Results and Discussion
*(In compliance with reporting requirements, this section presents measured experimental findings and empirical analysis without citations.)*

### 1. Empirical Ablation Results
Table 1 presents the actual measured performance metrics on the held-out test split (212 samples: 125 factual, 87 misinformation) for the primary Logistic Regression classifier:

| Feature Configuration | Accuracy | Precision | Recall | F1-Score | ROC-AUC | PR-AUC | $\Delta$ F1 vs Baseline |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **A. Text-Only Baseline (TF-IDF)** | **85.85%** | **87.01%** | **77.01%** | **81.71%** | **0.9407** | **0.8953** | **Baseline (0.00%)** |
| **B. Sentiment & Emotion Only** | 69.34% | 80.56% | 33.33% | 47.15% | 0.6579 | 0.5779 | -34.56% |
| **C. Text + Sentiment/Emotion** | **85.85%** | 86.08% | **78.16%** | **81.93%** | **0.9409** | **0.9089** | **+0.22%** |
| **D. Text + Social Engagement** | 84.91% | 88.73% | 72.41% | 79.75% | 0.9344 | 0.8894 | -1.96% |
| **E. Combined Multimodal Fusion** | **85.85%** | **90.14%** | 73.56% | 81.01% | 0.9369 | 0.8946 | -0.70% |

### 2. Confusion Matrix Diagnostics
Analysis of the held-out confusion matrices reveals distinct operational behaviors across feature sets:

- **Text-Only Baseline**:
  - True Negatives (TN): 115 / 125 (92.0% Specificity)
  - False Positives (FP): 10 / 125 (8.0% False Alarm Rate)
  - False Negatives (FN): 20 / 87 (23.0% Miss Rate)
  - True Positives (TP): 67 / 87 (77.0% Sensitivity)

- **Combined Multimodal Fusion**:
  - True Negatives (TN): 118 / 125 (94.4% Specificity)
  - False Positives (FP): 7 / 125 (5.6% False Alarm Rate)
  - False Negatives (FN): 23 / 87 (26.4% Miss Rate)
  - True Positives (TP): 64 / 87 (73.6% Sensitivity)
  - Notable outcome: Multimodal fusion reduced False Positives from 10 to 7, elevating Precision from 87.01% to 90.14%.

- **Sentiment & Emotion Only**:
  - True Negatives (TN): 118 / 125
  - False Positives (FP): 7 / 125
  - False Negatives (FN): 58 / 87 (66.7% Miss Rate)
  - True Positives (TP): 29 / 87 (33.3% Sensitivity)
  - Low sensitivity indicates that emotional features alone fail to detect two-thirds of genuine rumors.

### 3. Empirical Analysis Answering the Research Question
The experimental findings directly address the core research question:

1. **Textual Content Remains the Dominant Signal**:  
   TF-IDF n-grams alone yield an 81.71% F1-score and an ROC-AUC of 0.9407. Linguistic phrasing, entity references, and characteristic syntax in headlines carry the highest mutual information with veracity labels.

2. **Affective Features Modulate Calibration Rather than Replace Semantics**:  
   Adding 12-dimensional sentiment and emotion vectors to text (Configuration C) yielded a modest improvement in F1-score (+0.22%, from 81.71% to 81.93%) and the highest PR-AUC (0.9089). Emotion features serve as subtle semantic modulators rather than autonomous predictors.

3. **Social Engagement Enhances Precision at the Expense of Recall**:  
   Incorporating log-scaled tweet counts (Configuration E) increased precision to 90.14% (lowest false positive rate: 7 errors out of 125 verified articles). However, because many rumors experience constrained diffusion before fact-checking while some verified articles achieve viral amplification, relying heavily on engagement slightly dampens recall (73.56% vs 77.01%).

4. **Refuting the Naive Emotion Heuristic**:  
   Classifying solely on sentiment and emotion produced an F1-score of only 47.15%. Statistical profiling across the dataset demonstrated that verified factual reports regarding criminal trials, war zones, and economic emergencies register substantial negative sentiment and fear. Consequently, heuristics assuming negative valence proves misinformation are fundamentally flawed.

---

## Conclusion
This academic investigation evaluated the efficacy of multimodal feature fusion for social media misinformation classification using the RumorRadar platform. By anchoring ground truth to professional fact-checked verdicts and enforcing rigorous, leakage-free train/test splitting, we demonstrated that:
1. Textual representations are the indispensable foundation of misinformation classification.
2. Models relying exclusively on sentiment and emotion suffer severe recall collapse, verifying that negative or intense emotion is common across both factual news and falsehoods.
3. Combining textual, affective, and diffusion features yields a well-calibrated classifier achieving peak precision (90.14%), an overall accuracy of 85.85%, and an ROC-AUC of 0.9369.
4. When engagement metrics are unavailable or unhydrated, the platform's text-only baseline maintains robust operational efficacy (81.71% F1), validating the system's graceful degradation architecture.

---

## Future Work
Key trajectories for subsequent academic research include:
1. **Dynamic Temporal Diffusion**: Modeling engagement not as static snapshot counts, but as time-series arrival curves (e.g., Hawkes point processes) to capture early velocity.
2. **Transformer-Based Semantic Embeddings**: Benchmarking fine-tuned contextual language models (e.g., DeBERTa-v3, RoBERTa) against TF-IDF baselines while retaining multimodal affective feature heads.
3. **Cross-Domain Transfer**: Evaluating model portability between political discourse (PolitiFact) and entertainment celebrity news (GossipCop).
4. **Multilingual and Multimodal Media**: Expanding the extraction engine to process image-text consistency across multimodal social memes.

---

## References
1. Kai Shu, Deepak Mahudeswaran, Suhang Wang, and Huan Liu. *"FakeNewsNet: A Data Repository with News Content, Social Context and Spatiotemporal Information for Studying Fake News on Social Media"*, Big Data 2020 / ACM SIGKDD.
2. Shahan Ali Memon, et al. *"FactDrill: An Interactive Information Drill for Fact-Checking and Social Media Analysis"*, Proceedings of the International AAAI Conference on Web and Social Media (ICWSM 2022), Vol. 16.
3. Soroush Vosoughi, Deb Roy, and Sinan Aral. *"The spread of true and false news online"*, Science, 359(6380): 1146-1151, 2018.
4. C.J. Hutto and Eric Gilbert. *"VADER: A Parsimonious Rule-based Model for Sentiment Analysis of Social Media Text"*, Eighth International AAAI Conference on Weblogs and Social Media (ICWSM 2014).
5. Saif M. Mohammad and Peter D. Turney. *"Crowdsourcing a Word-Emotion Association Lexicon"*, Computational Intelligence, 29(3): 436-465, 2013.
6. Carlos Castillo, Marcelo Mendoza, and Barbara Poblete. *"Information credibility on Twitter"*, Proceedings of the 20th International Conference on World Wide Web (WWW 2011), pp. 675-684.
7. Sejeong Kwon, Meeyoung Cha, and Kyomin Jung. *"Rumor Detection over Varying Time Windows"*, PLOS ONE, 12(1): e0168344, 2017.
8. F. Pedregosa, et al. *"Scikit-learn: Machine Learning in Python"*, Journal of Machine Learning Research (JMLR), 12: 2825-2830, 2011.
