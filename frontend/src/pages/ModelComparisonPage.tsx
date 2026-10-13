import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Experiment } from '../types';
import { FeatureBadge } from '../components/FeatureBadge';
import { ConfusionMatrixView } from '../components/ConfusionMatrixView';
import {
  Layers,
  BarChart3,
  GitCompare,
  TrendingUp,
  FlaskConical,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

interface ModelComparisonPageProps {
  onNavigate: (tab: string) => void;
}

export const ModelComparisonPage: React.FC<ModelComparisonPageProps> = ({ onNavigate }) => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedExpA, setSelectedExpA] = useState<string>('');
  const [selectedExpB, setSelectedExpB] = useState<string>('');

  const loadExperiments = async () => {
    setLoading(true);
    try {
      const list = await api.getExperiments();
      const completed = list.filter((e) => e.status === 'completed' && e.metrics);
      setExperiments(completed);
      if (completed.length > 0) {
        setSelectedExpA(completed[0].id);
        if (completed.length > 1) {
          setSelectedExpB(completed[1].id);
        } else {
          setSelectedExpB(completed[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load experiments for comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperiments();
  }, []);

  // Format data for Recharts Bar Chart
  const barChartData = experiments.map((exp) => {
    const shortMode = exp.featureMode
      .replace('text_sentiment_emotion', 'Text+Emo')
      .replace('sentiment_emotion_only', 'Emo Only')
      .replace('text_engagement', 'Text+Eng')
      .replace('text_only', 'Text Base')
      .replace('combined', 'Combined');

    return {
      name: `${shortMode} (${exp.algorithm.slice(0, 3)})`,
      fullName: exp.featureMode,
      Accuracy: exp.metrics ? Number((exp.metrics.accuracy * 100).toFixed(1)) : 0,
      F1_Score: exp.metrics ? Number((exp.metrics.f1_binary * 100).toFixed(1)) : 0,
      ROC_AUC: exp.metrics ? Number((exp.metrics.roc_auc * 100).toFixed(1)) : 0,
      Precision: exp.metrics ? Number((exp.metrics.precision_binary * 100).toFixed(1)) : 0,
      Recall: exp.metrics ? Number((exp.metrics.recall_binary * 100).toFixed(1)) : 0
    };
  });

  const expA = experiments.find((e) => e.id === selectedExpA);
  const expB = experiments.find((e) => e.id === selectedExpB);

  // Radar comparison data for selected pair
  const radarData = expA?.metrics && expB?.metrics
    ? [
        { metric: 'Accuracy', ModelA: expA.metrics.accuracy * 100, ModelB: expB.metrics.accuracy * 100 },
        { metric: 'F1 Score', ModelA: expA.metrics.f1_binary * 100, ModelB: expB.metrics.f1_binary * 100 },
        { metric: 'Precision', ModelA: expA.metrics.precision_binary * 100, ModelB: expB.metrics.precision_binary * 100 },
        { metric: 'Recall', ModelA: expA.metrics.recall_binary * 100, ModelB: expB.metrics.recall_binary * 100 },
        { metric: 'ROC-AUC', ModelA: expA.metrics.roc_auc * 100, ModelB: expB.metrics.roc_auc * 100 }
      ]
    : [];

  // Baseline reference for delta calculations
  const baselineExp = experiments.find((e) => e.featureMode === 'text_only');
  const baselineF1 = baselineExp?.metrics?.f1_binary;
  const baselineAcc = baselineExp?.metrics?.accuracy;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Model Comparison & Ablation</h2>
          <p className="text-xs text-slate-400 mt-1">
            Systematic evaluation of classification metrics, held-out confusion matrices, and feature contributions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadExperiments}
            className="p-2 rounded-lg bg-navy-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => onNavigate('lab')}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2"
          >
            <FlaskConical className="w-4 h-4" />
            Launch Lab
          </button>
        </div>
      </div>

      {experiments.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800">
          <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">No completed models to compare yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Train models in the Experiment Lab or execute the full ablation suite to generate comparative benchmarks.
          </p>
          <button
            onClick={() => onNavigate('lab')}
            className="mt-5 px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs"
          >
            Go to Experiment Lab
          </button>
        </div>
      ) : (
        <>
          {/* Main Comparison Bar Chart */}
          <div className="glass-panel rounded-xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Held-Out Metric Comparison Across Feature Modes</h3>
                <p className="text-xs text-slate-400">Comparing Accuracy, F1 Score, and ROC-AUC</p>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                {experiments.length} Models Tested
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b1329', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                    formatter={(val: any) => [`${val}%`, '']}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar dataKey="Accuracy" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="F1_Score" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ROC_AUC" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side-by-Side Model Diff Inspector */}
          <div className="glass-panel rounded-xl p-6 border border-slate-800 space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <GitCompare className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100">Side-by-Side Model Inspector</h3>
            </div>

            {/* Dropdowns to select models */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-cyan-400 mb-1">Model A (Baseline / Reference):</label>
                <select
                  value={selectedExpA}
                  onChange={(e) => setSelectedExpA(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-200"
                >
                  {experiments.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.featureMode} — {e.algorithm} (F1: {(e.metrics?.f1_binary! * 100).toFixed(1)}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-400 mb-1">Model B (Candidate / Fusion):</label>
                <select
                  value={selectedExpB}
                  onChange={(e) => setSelectedExpB(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-200"
                >
                  {experiments.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.featureMode} — {e.algorithm} (F1: {(e.metrics?.f1_binary! * 100).toFixed(1)}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Radar comparison chart */}
            {radarData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                <div className="lg:col-span-1 h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="#1e293b" />
                      <PolarAngleAxis dataKey="metric" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis domain={[0, 100]} stroke="#475569" tick={{ fontSize: 9 }} />
                      <Radar name="Model A" dataKey="ModelA" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                      <Radar name="Model B" dataKey="ModelB" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
                      <Tooltip contentStyle={{ backgroundColor: '#0b1329', borderColor: '#1e293b', borderRadius: '8px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Confusion Matrices Side-by-Side */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {expA?.confusionMatrix && (
                    <ConfusionMatrixView cm={expA.confusionMatrix} title={`Model A: ${expA.featureMode}`} />
                  )}
                  {expB?.confusionMatrix && (
                    <ConfusionMatrixView cm={expB.confusionMatrix} title={`Model B: ${expB.featureMode}`} />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Full Tabular Comparison Matrix with Baseline Deltas */}
          <div className="glass-panel rounded-xl p-6 border border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 mb-1">Empirical Ablation Table</h3>
            <p className="text-xs text-slate-400 mb-4">
              Contributions of textual, affective, and diffusion feature subsets evaluated against the text-only baseline
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-navy-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Feature Mode</th>
                    <th className="py-3 px-4">Algorithm</th>
                    <th className="py-3 px-4">Accuracy</th>
                    <th className="py-3 px-4">F1 Score</th>
                    <th className="py-3 px-4">Precision</th>
                    <th className="py-3 px-4">Recall</th>
                    <th className="py-3 px-4">ROC-AUC</th>
                    <th className="py-3 px-4 text-right">Δ F1 vs Baseline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {experiments.map((exp) => {
                    const f1 = exp.metrics?.f1_binary;
                    const delta = baselineF1 !== undefined && f1 !== undefined ? f1 - baselineF1 : 0;

                    return (
                      <tr key={exp.id} className="hover:bg-navy-800/40">
                        <td className="py-3 px-4">
                          <FeatureBadge mode={exp.featureMode} />
                        </td>
                        <td className="py-3 px-4 capitalize text-slate-300 font-medium">
                          {exp.algorithm.replace('_', ' ')}
                        </td>
                        <td className="py-3 px-4 font-mono text-cyan-300">
                          {exp.metrics ? (exp.metrics.accuracy * 100).toFixed(2) + '%' : '-'}
                        </td>
                        <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                          {exp.metrics ? (exp.metrics.f1_binary * 100).toFixed(2) + '%' : '-'}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {exp.metrics ? (exp.metrics.precision_binary * 100).toFixed(2) + '%' : '-'}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {exp.metrics ? (exp.metrics.recall_binary * 100).toFixed(2) + '%' : '-'}
                        </td>
                        <td className="py-3 px-4 font-mono text-purple-300">
                          {exp.metrics ? exp.metrics.roc_auc.toFixed(4) : '-'}
                        </td>
                        <td className="py-3 px-4 font-mono text-right">
                          {exp.featureMode === 'text_only' ? (
                            <span className="text-slate-500 font-medium">Baseline (0.00%)</span>
                          ) : delta > 0 ? (
                            <span className="text-emerald-400 font-bold">+{(delta * 100).toFixed(2)}%</span>
                          ) : delta < 0 ? (
                            <span className="text-rose-400">{(delta * 100).toFixed(2)}%</span>
                          ) : (
                            <span className="text-slate-400">0.00%</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
