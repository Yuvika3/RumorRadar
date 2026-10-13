import React from 'react';
import {
  Radar,
  ArrowRight,
  ShieldCheck,
  Brain,
  Share2,
  FileText,
  Activity,
  Layers,
  Sparkles,
  BarChart3,
  CheckCircle2
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onOpenInference: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenInference }) => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl glass-panel-glow p-8 sm:p-12 border border-cyan-500/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-mono font-medium mb-6">
            <Radar className="w-3.5 h-3.5 animate-spin [animation-duration:10s]" />
            Academic Web & Social Media Analytics Capstone
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Rumor<span className="text-cyan-400">Radar</span>: Multimodal Misinformation Analytics
          </h1>

          <div className="mt-6 p-5 rounded-xl bg-navy-950/90 border border-slate-800 text-slate-200">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-1">
              Primary Research Question
            </span>
            <p className="text-base sm:text-lg font-medium italic text-slate-100">
              "Does combining textual content, sentiment/emotion features, and social engagement features improve misinformation classification compared with text-only machine learning models?"
            </p>
          </div>

          <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-3xl leading-relaxed">
            RumorRadar implements rigorous, reproducible machine learning experiments on genuine fact-checked benchmarks (FakeNewsNet PolitiFact). Ground-truth fact-check labels serve as the sole veracity standard—avoiding subjective assumptions that emotional intensity or viral retweets alone prove falsehood.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigate('lab')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition-all duration-200 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              Launch Experiment Lab
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('comparison')}
              className="px-5 py-3 rounded-xl bg-navy-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-2 transition-colors"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              View Ablation Study
            </button>
            <button
              onClick={onOpenInference}
              className="px-5 py-3 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800 text-cyan-300 font-semibold text-sm flex items-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Test Live Claim
            </button>
          </div>
        </div>
      </section>

      {/* Feature Fusion Pillars */}
      <section>
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Three Modalities of Verification Signal</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Evaluating individual and fused feature groups against held-out ground truth
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="glass-panel rounded-xl p-6 border border-slate-800 relative group hover:border-cyan-500/50 transition-all">
            <div className="p-3 rounded-xl bg-navy-800/80 text-cyan-400 border border-slate-700 w-fit mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">1. Textual Content (TF-IDF)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unigram and bigram TF-IDF lexical vectorization with sublinear scaling. Serves as the established baseline model for headline semantics and linguistic phrasing.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-cyan-400">
              Pipeline: TfidfVectorizer (fit strictly on X_train)
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="glass-panel rounded-xl p-6 border border-slate-800 relative group hover:border-purple-500/50 transition-all">
            <div className="p-3 rounded-xl bg-navy-800/80 text-purple-400 border border-slate-700 w-fit mb-4">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">2. Sentiment & Emotion (Affective)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              VADER valence polarity (compound, pos, neg, neu) combined with 8-dimensional NRC Plutchik emotion vectors (anger, fear, disgust, joy, trust, etc.).
            </p>
            <div className="mt-4 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-purple-300">
              Extraction: VADER + NRC Lexicon (12 dense features)
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="glass-panel rounded-xl p-6 border border-slate-800 relative group hover:border-emerald-500/50 transition-all">
            <div className="p-3 rounded-xl bg-navy-800/80 text-emerald-400 border border-slate-700 w-fit mb-4">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">3. Social Engagement (Diffusion)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Genuine social sharing dynamics (Twitter/X tweet count and resharing volume) scaled via log1p transformation to capture non-linear information cascades.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-emerald-300">
              Scaling: log1p + MinMaxScaler (fit on X_train only)
            </div>
          </div>
        </div>
      </section>

      {/* System Architecture Flow */}
      <section className="glass-panel rounded-2xl p-8 border border-slate-800">
        <h2 className="text-lg font-bold text-white mb-1">Architecture & Data Integrity Flow</h2>
        <p className="text-xs text-slate-400 mb-6">
          How RumorRadar eliminates data leakage and enforces reproducible academic benchmarks
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-navy-950 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 font-mono text-xs flex items-center justify-center border border-cyan-800">1</span>
              <span className="text-xs font-bold text-slate-200">Dataset Ingestion</span>
            </div>
            <p className="text-[11px] text-slate-400">
              FakeNewsNet benchmark parsed into verified records with ground-truth PolitiFact labels (1,056 rows).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-950 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 font-mono text-xs flex items-center justify-center border border-cyan-800">2</span>
              <span className="text-xs font-bold text-slate-200">Stratified Splitting</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Train/test partitions split 80/20 with class stratification. Test partition is completely withheld during fitting.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-950 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 font-mono text-xs flex items-center justify-center border border-cyan-800">3</span>
              <span className="text-xs font-bold text-slate-200">Multimodal Fusion</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Sparse TF-IDF horizontally concatenated with dense sentiment, emotion, and scaled engagement matrices.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-950 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 font-mono text-xs flex items-center justify-center border border-cyan-800">4</span>
              <span className="text-xs font-bold text-slate-200">Held-Out Evaluation</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Strict test evaluation: Accuracy, Binary F1, Macro F1, ROC-AUC, PR-AUC, and full confusion matrix coordinates.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Jump Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-left p-5 rounded-xl glass-panel hover:bg-navy-900 border border-slate-800 transition-colors"
        >
          <BarChart3 className="w-5 h-5 text-cyan-400 mb-2" />
          <h4 className="text-sm font-bold text-slate-200">Dashboard</h4>
          <p className="text-xs text-slate-400 mt-1">Platform summaries, class balance, and model leaderboard</p>
        </button>

        <button
          onClick={() => onNavigate('explorer')}
          className="text-left p-5 rounded-xl glass-panel hover:bg-navy-900 border border-slate-800 transition-colors"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2" />
          <h4 className="text-sm font-bold text-slate-200">Data Explorer</h4>
          <p className="text-xs text-slate-400 mt-1">Search, inspect claims, view missing values and tweet shares</p>
        </button>

        <button
          onClick={() => onNavigate('analytics')}
          className="text-left p-5 rounded-xl glass-panel hover:bg-navy-900 border border-slate-800 transition-colors"
        >
          <Activity className="w-5 h-5 text-purple-400 mb-2" />
          <h4 className="text-sm font-bold text-slate-200">Emotion & Social</h4>
          <p className="text-xs text-slate-400 mt-1">Radar charts of Plutchik emotions and sentiment distributions</p>
        </button>

        <button
          onClick={() => onNavigate('report')}
          className="text-left p-5 rounded-xl glass-panel hover:bg-navy-900 border border-slate-800 transition-colors"
        >
          <FileText className="w-5 h-5 text-amber-400 mb-2" />
          <h4 className="text-sm font-bold text-slate-200">Research Report</h4>
          <p className="text-xs text-slate-400 mt-1">Synthesized findings, ablation matrix, and CSV exports</p>
        </button>
      </section>
    </div>
  );
};
