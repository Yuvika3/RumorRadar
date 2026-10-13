import React, { useState } from 'react';
import { api } from '../services/api';
import { PredictionRecord } from '../types';
import { X, Sparkles, AlertTriangle, CheckCircle, ShieldAlert, Activity } from 'lucide-react';

interface LiveInferenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeExperimentId?: string;
}

export const LiveInferenceDrawer: React.FC<LiveInferenceDrawerProps> = ({
  isOpen,
  onClose,
  activeExperimentId
}) => {
  const [text, setText] = useState('');
  const [engagement, setEngagement] = useState<number>(150);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const pred = await api.runPrediction({
        text,
        engagementValue: engagement,
        experimentId: activeExperimentId
      });
      setResult(pred);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Inference failed');
    } finally {
      setLoading(false);
    }
  };

  const sampleClaims = [
    {
      title: "Court Orders Former Official To Pay $400 Million in Restitution",
      eng: 104,
      desc: "Fake PolitiFact sample claim"
    },
    {
      title: "Health Ministry confirms emergency vaccine safety trials concluded",
      eng: 48,
      desc: "Verified claim sample"
    },
    {
      title: "Shocking leaked document exposes secret global conspiracy agenda!",
      eng: 1250,
      desc: "High emotion / high share sample"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-xl bg-navy-900 border-l border-slate-800 h-full overflow-y-auto p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Live Prediction Lab</h3>
              <p className="text-xs text-slate-400">Classify custom text with multimodal sentiment & emotion extraction</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Samples */}
        <div className="mt-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Quick Preset Test Cases
          </span>
          <div className="grid grid-cols-1 gap-2">
            {sampleClaims.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setText(sample.title);
                  setEngagement(sample.eng);
                }}
                className="text-left text-xs p-2.5 rounded-lg bg-navy-950/80 hover:bg-slate-800/80 border border-slate-800/80 text-slate-300 transition-colors"
              >
                <div className="font-medium text-slate-200 truncate">{sample.title}</div>
                <div className="text-[10px] text-cyan-400/80 mt-0.5">{sample.desc} (Shares: {sample.eng})</div>
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handlePredict} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Social Media Post or News Headline:
            </label>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Breaking: Election officials announce verified audit results..."
              className="w-full bg-navy-950 border border-slate-700/80 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Social Engagement Volume (e.g. Tweet Reshares):
            </label>
            <input
              type="number"
              min={0}
              value={engagement}
              onChange={(e) => setEngagement(Number(e.target.value) || 0)}
              className="w-full bg-navy-950 border border-slate-700/80 rounded-lg p-2.5 text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-semibold text-sm transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            {loading ? (
              <>
                <Activity className="w-4 h-4 animate-spin" />
                Analyzing Features & Running Inference...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze & Classify Post
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Prediction Results */}
        {result && (
          <div className="mt-6 space-y-4 border-t border-slate-800 pt-5">
            {/* Primary Classification */}
            <div
              className={`p-4 rounded-xl border ${
                result.predictedLabel === 1
                  ? 'bg-rose-950/30 border-rose-800/80 text-rose-200'
                  : 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {result.predictedLabel === 1 ? (
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  )}
                  <span className="font-bold text-sm tracking-wide">
                    {result.predictedLabel === 1 ? 'Misinformation / Rumor' : 'Verified Factual Content'}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-black/40 border border-current">
                  {(result.confidence * 100).toFixed(1)}% Confidence
                </span>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span>Probability Real: {(result.probabilities.real * 100).toFixed(1)}%</span>
                  <span>Probability Fake: {(result.probabilities.fake * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${result.probabilities.real * 100}%` }}
                  />
                  <div
                    className="bg-rose-500 h-full"
                    style={{ width: `${result.probabilities.fake * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Extracted VADER Sentiment */}
            <div className="p-4 rounded-xl bg-navy-950 border border-slate-800">
              <span className="text-xs font-semibold text-slate-300 block mb-2">
                Documented VADER Sentiment Extraction
              </span>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-navy-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Compound</span>
                  <span className={`font-mono font-bold ${result.sentiment.compound >= 0.05 ? 'text-emerald-400' : result.sentiment.compound <= -0.05 ? 'text-rose-400' : 'text-slate-300'}`}>
                    {result.sentiment.compound.toFixed(2)}
                  </span>
                </div>
                <div className="p-2 rounded bg-navy-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Positive</span>
                  <span className="font-mono text-emerald-400 font-bold">{(result.sentiment.pos * 100).toFixed(0)}%</span>
                </div>
                <div className="p-2 rounded bg-navy-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Negative</span>
                  <span className="font-mono text-rose-400 font-bold">{(result.sentiment.neg * 100).toFixed(0)}%</span>
                </div>
                <div className="p-2 rounded bg-navy-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Neutral</span>
                  <span className="font-mono text-slate-400 font-bold">{(result.sentiment.neu * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* Extracted NRC Emotions */}
            <div className="p-4 rounded-xl bg-navy-950 border border-slate-800">
              <span className="text-xs font-semibold text-slate-300 block mb-2">
                NRC Plutchik Emotion Profile
              </span>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {Object.entries(result.emotions).map(([emo, score]) => (
                  <div key={emo} className="p-2 rounded bg-navy-900 border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[10px] capitalize">{emo}</span>
                    <span className="font-mono text-cyan-400 font-bold">{(score * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
