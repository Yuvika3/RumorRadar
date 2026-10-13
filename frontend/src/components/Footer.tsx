import React from 'react';
import { ShieldCheck, Database, BookOpen, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-navy-950 py-8 mt-16 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Col 1 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-slate-200">RumorRadar Research Platform</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">v1.0</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              An empirical analytics platform investigating multimodal feature fusion (Textual TF-IDF, VADER Sentiment, NRC Emotion, and Social Engagement) for social media misinformation classification.
            </p>
          </div>

          {/* Col 2: Research Standards */}
          <div>
            <span className="font-semibold text-slate-200 block mb-2">Empirical Standards</span>
            <ul className="space-y-1.5 text-[11px]">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Zero data leakage: Transformers fit strictly on train split</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>Fact-checked ground-truth labels (PolitiFact via FakeNewsNet)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>No subjective heuristic assumptions (anger/sentiment ≠ fake)</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Benchmark References */}
          <div>
            <span className="font-semibold text-slate-200 block mb-2">Verified Benchmarks</span>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <a
                  href="https://github.com/KaiDMML/FakeNewsNet"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-400 flex items-center gap-1 text-slate-300"
                >
                  FakeNewsNet (Shu et al., ACM KDD)
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://ojs.aaai.org/index.php/ICWSM/article/view/19384"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-400 flex items-center gap-1 text-slate-300"
                >
                  FactDrill Research (Zhang et al., AAAI ICWSM)
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            RumorRadar Academic Capstone Project • Web & Social Media Analytics
          </div>
          <div className="font-mono text-cyan-400/80">
            Node.js • Express • MongoDB • FastAPI • scikit-learn • React • Vite
          </div>
        </div>
      </div>
    </footer>
  );
};
