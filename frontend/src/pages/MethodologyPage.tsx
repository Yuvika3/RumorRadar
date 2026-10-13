import React from 'react';
import {
  BookOpen,
  Code,
  ShieldCheck,
  Binary,
  Layers,
  Database,
  ExternalLink,
  Cpu
} from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[11px] font-mono mb-2">
          Technical Specifications & Theoretical Foundation
        </div>
        <h2 className="text-2xl font-extrabold text-white">Methodology & Verified References</h2>
        <p className="text-xs text-slate-400 mt-1">
          Detailed mathematical formulation, NLP extraction pipelines, train/test integrity, and academic literature
        </p>
      </div>

      {/* 1. System Architecture */}
      <section className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-cyan-400">
          <Cpu className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">1. Full-Stack System Architecture</h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          RumorRadar is engineered as an asynchronous, decoupled micro-monorepo separating data persistence, API orchestration, ML model training, and analytical visualization:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-navy-950 border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">Frontend Layer</span>
            <span className="text-slate-300 block">React 18, Vite, TypeScript</span>
            <span className="text-slate-500 text-[11px] block mt-1">Tailwind CSS, Recharts, Lucide</span>
          </div>

          <div className="p-4 rounded-xl bg-navy-950 border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">Backend Orchestrator</span>
            <span className="text-slate-300 block">Node.js, Express, TypeScript</span>
            <span className="text-slate-500 text-[11px] block mt-1">MongoDB Mongoose + Resilient File Store</span>
          </div>

          <div className="p-4 rounded-xl bg-navy-950 border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">Machine Learning Engine</span>
            <span className="text-slate-300 block">Python 3.12, FastAPI, Uvicorn</span>
            <span className="text-slate-500 text-[11px] block mt-1">scikit-learn, pandas, NumPy, joblib</span>
          </div>
        </div>
      </section>

      {/* 2. Feature Extraction Formulations */}
      <section className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex items-center gap-2 text-cyan-400">
          <Binary className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">2. Feature Engineering & Mathematical Formulations</h3>
        </div>

        {/* TF-IDF */}
        <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-cyan-400 uppercase font-mono">
            A. Text Content: TF-IDF Vectorization
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Term Frequency-Inverse Document Frequency calculates the lexical specificity of n-grams (unigrams and bigrams, max 2,500 dimensions) with sublinear term-frequency scaling:
          </p>
          <div className="p-3 rounded-lg bg-navy-900 border border-slate-800/80 font-mono text-xs text-cyan-300 overflow-x-auto">
            tfidf(t, d, D) = (1 + log(tf(t, d))) × log( (1 + |D|) / (1 + df(t, D)) ) + 1
          </div>
        </div>

        {/* VADER Sentiment */}
        <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-purple-300 uppercase font-mono">
            B. Documented Sentiment: VADER Valence Scoring
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Valence Aware Dictionary for sEntiment Reasoning incorporates negation words (window size 3) and lexical booster modifiers to produce a standardized continuous compound valence score normalized between -1.0 and +1.0:
          </p>
          <div className="p-3 rounded-lg bg-navy-900 border border-slate-800/80 font-mono text-xs text-purple-300 overflow-x-auto">
            Compound Valence = Σ valence_scores / √( (Σ valence_scores)² + α )  [where α = 15.0]
          </div>
        </div>

        {/* NRC Emotion */}
        <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-emerald-300 uppercase font-mono">
            C. Affective Dynamics: NRC Plutchik 8-Emotion Lexicon
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Extracts normalized intensities for 8 canonical psychological emotion categories: <em>Anger, Anticipation, Disgust, Fear, Joy, Sadness, Surprise, Trust</em>. Normalization by headline token length ensures headline scale invariance.
          </p>
        </div>

        {/* Social Engagement */}
        <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-cyan-300 uppercase font-mono">
            D. Social Diffusion: Log-Scaled Resharing Metrics
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Social media engagement exhibits severe positive skew (power-law distribution). We apply log1p transformation followed by MinMax scaling to prevent high-virality outliers from overwhelming gradients:
          </p>
          <div className="p-3 rounded-lg bg-navy-900 border border-slate-800/80 font-mono text-xs text-cyan-300 overflow-x-auto">
            x_scaled = (log(1 + tweet_count) - min_train) / (max_train - min_train)
          </div>
        </div>
      </section>

      {/* 3. Leakage Prevention */}
      <section className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">3. Experimental Integrity & Leakage Prevention</h3>
        </div>

        <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold">•</span>
            <span>
              <strong>Train/Test Stratification:</strong> Splitting maintains exact veracity class ratios (624 real, 432 fake) across training (80%) and held-out test (20%) sets.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold">•</span>
            <span>
              <strong>Zero Preprocessing Leakage:</strong> The TF-IDF vectorizer vocabulary, IDF weights, and MinMax engagement bounds are computed strictly on <code>X_train</code>. The held-out test split <code>X_test</code> is exclusively transformed.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold">•</span>
            <span>
              <strong>Multimodal Sparse Horizontal Union:</strong> <code>scipy.sparse.hstack</code> merges the sparse TF-IDF text matrix with dense affective and diffusion arrays into a unified design matrix for linear and probabilistic classifiers.
            </span>
          </li>
        </ul>
      </section>

      {/* 4. Verified Literature References */}
      <section className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-cyan-400">
          <BookOpen className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">4. Verified Academic References</h3>
        </div>

        <div className="space-y-4 text-xs font-sans">
          <div className="p-4 rounded-xl bg-navy-950 border border-slate-800/80">
            <a
              href="https://github.com/KaiDMML/FakeNewsNet"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 font-bold hover:underline flex items-center gap-1.5"
            >
              1. FakeNewsNet Repository (Shu et al., 2020)
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
              Kai Shu, Deepak Mahudeswaran, Suhang Wang, and Huan Liu. <em>"FakeNewsNet: A Data Repository with News Content, Social Context and Spatiotemporal Information for Studying Fake News on Social Media"</em>, Big Data 2020 / ACM SIGKDD.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-950 border border-slate-800/80">
            <a
              href="https://ojs.aaai.org/index.php/ICWSM/article/view/19384"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 font-bold hover:underline flex items-center gap-1.5"
            >
              2. FactDrill Research (Zhang et al., ICWSM 2022)
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
              Shahan Ali Memon et al. <em>"FactDrill: An Interactive Information Drill for Fact-Checking and Social Media Analysis"</em>, Proceedings of the International AAAI Conference on Web and Social Media (ICWSM 2022), Vol. 16.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-950 border border-slate-800/80">
            <span className="text-slate-200 font-bold">3. VADER Sentiment Extraction (Hutto & Gilbert, 2014)</span>
            <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
              C.J. Hutto and Eric Gilbert. <em>"VADER: A Parsimonious Rule-based Model for Sentiment Analysis of Social Media Text"</em>, Eighth International AAAI Conference on Weblogs and Social Media (ICWSM 2014).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-950 border border-slate-800/80">
            <span className="text-slate-200 font-bold">4. NRC Emotion Lexicon (Mohammad & Turney, 2013)</span>
            <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
              Saif M. Mohammad and Peter D. Turney. <em>"Crowdsourcing a Word-Emotion Association Lexicon"</em>, Computational Intelligence, 29(3): 436-465.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
