# RumorRadar 📡
**A Social Media Misinformation Analytics & Feature-Fusion Research Platform**  
*Academic Web and Social Media Analytics Capstone Project*

---

## 1. Project Overview & Research Question

RumorRadar is an academic misinformation analytics platform built to investigate the interplay between textual content, affective framing, and social media sharing dynamics.

### Central Research Question:
> **"Does combining textual content, sentiment/emotion features, and social engagement features improve misinformation classification compared with text-only machine learning models?"**

### Core Empirical Principles:
- **Fact-Checked Ground Truth**: All veracity labels originate strictly from professional journalistic fact-checking institutions (PolitiFact benchmark via FakeNewsNet).
- **No Subjective Assumptions**: The system never assumes that negative sentiment, anger, fear, or high retweet volume proves misinformation.
- **Zero Data Leakage**: Train/test splitting (80% train / 20% test) is strictly stratified. All TF-IDF tokenizers and engagement scalers are fitted exclusively on the training partition.
- **Graceful Degradation**: If a dataset lacks engagement metrics, engagement-dependent modes are automatically disabled with transparent documentation.

---

## 2. Technology Stack & System Architecture

RumorRadar is organized as a clean, decoupled monorepo:

```
RumorRadar/
├── frontend/             # React 18, Vite, TypeScript, Tailwind CSS, Recharts, Lucide
│   ├── src/
│   │   ├── components/   # Navbar, Footer, ConfusionMatrixView, RocPrCurvesView, LiveInferenceDrawer
│   │   ├── pages/        # Home, Dashboard, Explorer, Lab, Comparison, Analytics, Report, Methodology
│   │   ├── services/     # Axios API client connecting to backend
│   │   └── types/        # TypeScript data contracts and schemas
│   ├── index.html
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/              # Node.js, Express, TypeScript, Mongoose
│   ├── src/
│   │   ├── config/       # MongoDB connection & local persistent fallback store
│   │   ├── controllers/  # Dataset, Experiment, Analytics, Prediction, Export
│   │   ├── models/       # Mongoose Schemas (Dataset, Experiment, Prediction)
│   │   ├── routes/       # Express REST API endpoints
│   │   ├── services/     # StoreService (Dual-mode) & MLClient (Axios to FastAPI)
│   │   └── server.ts     # Express server entrypoint (Port 5000)
│   └── tsconfig.json
│
├── ml-service/           # Python 3.12, FastAPI, scikit-learn, pandas, NumPy, joblib
│   ├── app/
│   │   ├── api/          # FastAPI routers
│   │   ├── core/         # Leakage-free RumorRadarFeaturePipeline
│   │   ├── models/       # Training, held-out evaluation, and artifact serialization
│   │   ├── nlp/          # VADER valence analyzer & NRC 8-emotion lexicon
│   │   └── main.py       # FastAPI application entrypoint (Port 8000)
│   ├── saved_models/     # Serialized .joblib model bundles
│   └── requirements.txt
│
├── datasets/             # Verified benchmark datasets
│   ├── fakenewsnet_politifact.csv               # 1,056 rows with tweet_count engagement
│   ├── fakenewsnet_politifact_no_engagement.csv # 1,056 rows text-only benchmark
│   └── README.md
│
├── docs/                 # Academic documentation
│   └── ACADEMIC_REPORT.md # Full academic report draft with literature & results
│
├── scripts/              # Helper utilities
│   ├── prepare_datasets.py # FakeNewsNet dataset downloader & parser
│   └── run-ml.ps1        # PowerShell ML service startup script
│
├── package.json          # Root npm orchestration
└── README.md             # This comprehensive guide
```

---

## 3. Exact Windows 11 Setup Instructions

### Prerequisites Checklist:
1. **Node.js**: Node 18+ or 20+ (Node v24 is tested and verified).
2. **Python**: Python 3.12 (standard installation or Anaconda).
3. **MongoDB** *(Optional)*: If MongoDB is installed locally on `mongodb://127.0.0.1:27017`, RumorRadar connects to it automatically via Mongoose. If MongoDB is not running, the application **automatically uses its built-in local persistent store** (`.data/store.json`) with zero manual setup required!

---

### Step-by-Step Installation:

#### Step 1: Open PowerShell as Administrator or Normal User
Navigate into the project workspace:
```powershell
cd c:\Users\vamsi\Desktop\projects\RumorRadar
```

#### Step 2: Set Up Python ML Service Virtual Environment
Create a clean Python 3.12 virtual environment and install the required machine learning packages:
```powershell
cd ml-service
& "C:\Users\vamsi\AppData\Local\Programs\Python\Python312\python.exe" -m venv venv
.\venv\Scripts\python.exe -m pip install --upgrade pip
.\venv\Scripts\python.exe -m pip install -r requirements.txt
cd ..
```

#### Step 3: Install Node.js Backend & Frontend Dependencies
```powershell
# Install Backend packages
cd backend
npm install
cd ..

# Install Frontend packages
cd frontend
npm install
cd ..
```

---

## 4. Environment Configuration

The repository includes `.env.example` templates ready to run out-of-the-box:

- **Backend Configuration** (`backend/.env`):
  ```env
  PORT=5000
  NODE_ENV=development
  MONGODB_URI=mongodb://127.0.0.1:27017/rumorradar
  ML_SERVICE_URL=http://127.0.0.1:8000
  DATASETS_DIR=../datasets
  UPLOADS_DIR=./uploads
  STORAGE_FALLBACK=true
  ```

- **ML Service Configuration** (`ml-service/.env`):
  ```env
  PORT=8000
  HOST=127.0.0.1
  DATASETS_DIR=../datasets
  MODELS_DIR=./saved_models
  ```

- **Frontend Configuration** (`frontend/.env`):
  ```env
  VITE_API_URL=http://localhost:5000/api
  ```

---

## 5. Starting the Services

Open **three separate PowerShell terminal tabs** (or start them in the background):

### Terminal 1: Start ML Python Service (FastAPI)
```powershell
cd c:\Users\vamsi\Desktop\projects\RumorRadar\ml-service
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Health check*: `http://127.0.0.1:8000/api/ml/health`

### Terminal 2: Start Express Backend API
```powershell
cd c:\Users\vamsi\Desktop\projects\RumorRadar\backend
npm run dev
```
*Health check*: `http://localhost:5000/api/health`

### Terminal 3: Start React Vite Frontend
```powershell
cd c:\Users\vamsi\Desktop\projects\RumorRadar\frontend
npm run dev -- --port 3000
```
*Web App URL*: Open `http://localhost:3000` in any web browser!

---

## 6. How to Run Tests and Verify System Integrity

RumorRadar includes automated unit and integration tests across both the Python ML pipeline and the Node.js API layer.

### Run Python ML Unit Tests:
```powershell
cd c:\Users\vamsi\Desktop\projects\RumorRadar
.\ml-service\venv\Scripts\python.exe ml-service\test_ml.py
```
*Verifies*: VADER valence shifters, NRC 8-emotion vectors, leakage prevention, TF-IDF transformations, and held-out metrics calculation.

### Run Backend API Integration Tests:
```powershell
cd c:\Users\vamsi\Desktop\projects\RumorRadar\backend
npm run test
```
*Verifies*: Dual-mode persistence, dataset profiling, experiment status polling, prediction logging, and CSV record streaming.

---

## 7. Website Pages & Usage Guide

Once `http://localhost:3000` is open, access the 8 functional research pages via the top navbar:

1. **Home**:
   - Executive introduction to the research question and empirical methodology.
   - Interactive system architecture data flow diagram.
   - Quick preset claim testers.
2. **Dashboard**:
   - Aggregate statistics: registered datasets, verified claim counts, completed experiments.
   - Ground-truth class balance pie chart (Verified Real vs Misinformation).
   - Leaderboard of completed experiment runs with accuracy, F1, and ROC-AUC.
3. **Data Explorer**:
   - Browse and search 1,056 authentic claims from the FakeNewsNet PolitiFact benchmark.
   - Filter claims by veracity label (Verified Real vs Rumor).
   - Click **Inspect** on any claim to view original publication URL, ground truth, and tweet shares.
   - Click **Upload CSV** to upload custom datasets with dynamic column mapping.
4. **Experiment Lab**:
   - Configure feature modalities: Text TF-IDF, VADER & NRC Affective Signals, and Social Engagement.
   - Select algorithm: Logistic Regression, Multinomial Naive Bayes, Complement Naive Bayes, or Random Forest.
   - Adjust held-out test size (10% to 35%) and random state seed.
   - Click **Train Experiment** to observe real-time animated training progress and receive immediate held-out evaluation reports.
   - Click **Run Full 5-Configuration Ablation Suite** to benchmark all feature combinations in a single click!
5. **Model Comparison**:
   - Side-by-side metric comparison bar chart and radar chart across feature modes.
   - Side-by-side Confusion Matrix inspector comparing True Positives, False Positives, Specificity, and Sensitivity.
   - Tabular ablation matrix computing delta F1 vs the text-only baseline.
6. **Emotion & Social Diffusion Analytics**:
   - Interactive 8-dimensional NRC Plutchik Emotion Radar comparing Verified Real vs Rumor claims.
   - VADER Sentiment polarity distribution (Compound, Positive, Negative, Neutral).
   - Engagement diffusion comparison showing mean and median Twitter resharing volume.
   - Academic reflection on why emotional charge alone does not prove misinformation.
7. **Research Report**:
   - Synthesized academic report draft answering the central research question using actual recorded empirical results.
   - Click **Export Experiments CSV** to download a clean spreadsheet of all runs.
   - Click **Export Report (Markdown)** to download a publication-ready research draft.
8. **Methodology & References**:
   - Mathematical formulation of TF-IDF, VADER compound formula, NRC lexicon mapping, and log1p engagement scaling.
   - Leakage prevention and train/test stratification documentation.
   - Formal literature citations (FakeNewsNet, FactDrill, VADER, NRC).
9. **Live Prediction Lab** (Drawer):
   - Click the **Test Claim** button in the top navbar anytime to input any custom headline or social post.
   - Computes VADER sentiment, NRC emotion intensities, and machine learning classification probabilities in real time!

---

## 8. Measured Research Findings Summary

Experiments executed on the held-out test split (212 samples, 80/20 stratified split) produced the following empirical results:

| Feature Configuration | Algorithm | Accuracy | Precision | Recall | F1-Score | ROC-AUC | PR-AUC |
|---|---|---|---|---|---|---|---|
| **Text-Only Baseline (TF-IDF)** | Logistic Regression | **85.85%** | **87.01%** | **77.01%** | **81.71%** | **0.9407** | **0.8953** |
| **Sentiment & Emotion Only** | Logistic Regression | 69.34% | 80.56% | 33.33% | 47.15% | 0.6579 | 0.5779 |
| **Text + Sentiment/Emotion** | Logistic Regression | **85.85%** | 86.08% | **78.16%** | **81.93%** | **0.9409** | **0.9089** |
| **Text + Social Engagement** | Logistic Regression | 84.91% | 88.73% | 72.41% | 79.75% | 0.9344 | 0.8894 |
| **Combined Multimodal Fusion** | Logistic Regression | **85.85%** | **90.14%** | 73.56% | **81.01%** | **0.9369** | **0.8946** |

### Key Takeaways Answering the Research Question:
1. **Textual content is the primary driver of classification**: TF-IDF lexical features alone achieve an 81.71% F1 score and 0.9407 ROC-AUC.
2. **Affective signals provide semantic modulation rather than independent proof**: Emotion-only models drop to a 47.15% F1 score because authentic news regarding investigations, disasters, and conflicts naturally contains high fear and anger. Adding emotion to text provides a modest improvement (+0.22% F1, reaching 81.93% and peak PR-AUC of 0.9089).
3. **Multimodal fusion achieves peak precision**: The combined model reduced false positive errors from 10 to 7, lifting precision to 90.14% and achieving a robust ROC-AUC of 0.9369.

---

## 9. Troubleshooting Guidance

1. **Python virtual environment command not recognized**:
   - Ensure you run Python via the virtualenv script path: `.\ml-service\venv\Scripts\python.exe` or activate it using `.\ml-service\venv\Scripts\Activate.ps1`.
2. **Port 5000, 8000, or 3000 already in use**:
   - Terminate lingering processes:
     ```powershell
     Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force
     Stop-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess -Force
     Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
     ```
3. **MongoDB is not installed or running**:
   - You do **not** need to install MongoDB to use RumorRadar. The backend automatically switches to its local persistent file storage (`.data/store.json`), providing 100% full functionality.
4. **CSV Upload errors**:
   - Ensure the uploaded file has UTF-8 encoding and includes a text headline column and a label column (labeled 0/1 or real/fake).

---

## 10. Authors and Citation

**RumorRadar Research Group**  
*Academic Project in Web and Social Media Analytics*  
Datasets sourced from the official [FakeNewsNet Repository](https://github.com/KaiDMML/FakeNewsNet) (Kai Shu et al., ACM KDD & Big Data 2020) and compared with [FactDrill Research](https://ojs.aaai.org/index.php/ICWSM/article/view/19384) (Memon et al., AAAI ICWSM 2022).
