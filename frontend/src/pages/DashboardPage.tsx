import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Dataset, Experiment, DashboardSummary } from '../types';
import { MetricCard } from '../components/MetricCard';
import { FeatureBadge } from '../components/FeatureBadge';
import {
  Database,
  FlaskConical,
  Trophy,
  Activity,
  Layers,
  ArrowRight,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, dsRes, expRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getDatasets(),
        api.getExperiments()
      ]);
      setSummary(sumRes);
      setDatasets(dsRes);
      setExperiments(expRes);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const completed = experiments.filter((e) => e.status === 'completed');

  // Format data for class balance chart from first dataset
  const activeDataset = datasets[0];
  const classDistData = activeDataset?.classDistribution
    ? [
        {
          name: 'Verified Factual (0)',
          value: activeDataset.classDistribution['0'] || activeDataset.classDistribution['real'] || 624,
          color: '#10b981'
        },
        {
          name: 'Misinformation (1)',
          value: activeDataset.classDistribution['1'] || activeDataset.classDistribution['fake'] || 432,
          color: '#f43f5e'
        }
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Platform Dashboard</h2>
          <p className="text-xs text-slate-400 mt-1">
            Misinformation research statistics, class balance, and active model performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-lg bg-navy-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => onNavigate('lab')}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-semibold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
          >
            <FlaskConical className="w-4 h-4" />
            New Experiment
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Registered Datasets"
          value={summary?.totalDatasets ?? datasets.length}
          subtitle={`${summary?.totalRecords ?? 0} total verified records`}
          icon={Database}
          badge="FakeNewsNet"
          badgeColor="cyan"
        />
        <MetricCard
          title="Total Experiments"
          value={summary?.totalExperiments ?? experiments.length}
          subtitle={`${summary?.completedExperiments ?? completed.length} held-out evaluations completed`}
          icon={FlaskConical}
          badge={`${summary?.completedExperiments ?? 0} Complete`}
          badgeColor="emerald"
        />
        <MetricCard
          title="Top Held-Out F1 Score"
          value={
            summary?.bestModel?.f1Score !== undefined
              ? (summary.bestModel.f1Score * 100).toFixed(1) + '%'
              : 'N/A'
          }
          subtitle={summary?.bestModel?.algorithm ? `${summary.bestModel.algorithm} (${summary.bestModel.featureMode})` : 'Awaiting training'}
          icon={Trophy}
          badge="Held-Out Test"
          badgeColor="cyan"
          glow={Boolean(summary?.bestModel)}
        />
        <MetricCard
          title="Top Accuracy"
          value={
            summary?.bestModel?.accuracy !== undefined
              ? (summary.bestModel.accuracy * 100).toFixed(1) + '%'
              : 'N/A'
          }
          subtitle={summary?.bestModel?.rocAuc ? `ROC-AUC: ${summary.bestModel.rocAuc.toFixed(3)}` : 'Test evaluation'}
          icon={Activity}
          badge="Stratified"
          badgeColor="emerald"
        />
      </div>

      {/* Dataset & Class Balance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Distribution Chart */}
        <div className="glass-panel rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Benchmark Class Balance</h3>
              <p className="text-xs text-slate-400">Ground truth veracity distribution</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              {activeDataset?.name || 'PolitiFact'}
            </span>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            {classDistData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={classDistData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {classDistData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b1329', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500">No class distribution data available</div>
            )}
          </div>

          <div className="flex items-center justify-around mt-2 pt-3 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-300">Verified: {classDistData[0]?.value || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-slate-300">Misinformation: {classDistData[1]?.value || 0}</span>
            </div>
          </div>
        </div>

        {/* Feature Availability & Research Validity Notice */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
                <CheckCircle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-100">Research & Data Integrity Standards</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              RumorRadar adheres to empirical data science best practices. Every experiment is evaluated on an untouched, held-out test split (20% default) with stratified label balance. Preprocessing components (TF-IDF vectorizers and social engagement scalers) are fitted strictly on the training partition to prevent information leakage.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
              <div className="p-3 rounded-lg bg-navy-950 border border-slate-800/80">
                <span className="font-semibold text-slate-200 block mb-1">Authentic Social Context</span>
                <p className="text-[11px] text-slate-400">
                  {activeDataset?.hasEngagement
                    ? 'Active benchmark includes genuine Twitter/X tweet share counts for diffusion modeling.'
                    : 'Engagement metrics are disabled for datasets without verified social sharing fields.'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-navy-950 border border-slate-800/80">
                <span className="font-semibold text-slate-200 block mb-1">Affective Grounding</span>
                <p className="text-[11px] text-slate-400">
                  Sentiment (VADER compound, positive, negative, neutral) and 8 Plutchik emotions (NRC lexicon) extracted without subjective assumptions.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              Hypothesis Test: Does Multimodal Fusion &gt; Text Baseline?
            </span>
            <button
              onClick={() => onNavigate('comparison')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              Compare All Models
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Completed Experiments Table */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Experiment Leaderboard</h3>
            <p className="text-xs text-slate-400">Held-out performance across trained feature configurations</p>
          </div>
          <button
            onClick={() => onNavigate('comparison')}
            className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            Full Comparison View
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {completed.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl">
            <FlaskConical className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-300">No completed experiments yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Run your first machine learning experiment or complete the full 5-configuration ablation study in the Experiment Lab.
            </p>
            <button
              onClick={() => onNavigate('lab')}
              className="mt-4 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs"
            >
              Go to Experiment Lab
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-950/80 text-slate-400 uppercase tracking-wider font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Feature Mode</th>
                  <th className="py-3 px-4">Algorithm</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">F1 Score</th>
                  <th className="py-3 px-4">Precision</th>
                  <th className="py-3 px-4">Recall</th>
                  <th className="py-3 px-4">ROC-AUC</th>
                  <th className="py-3 px-4">Test Samples</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {completed.map((exp) => (
                  <tr key={exp.id} className="hover:bg-navy-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <FeatureBadge mode={exp.featureMode} />
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-sans font-medium capitalize">
                      {exp.algorithm.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-cyan-300 font-bold">
                      {exp.metrics ? (exp.metrics.accuracy * 100).toFixed(2) + '%' : '-'}
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">
                      {exp.metrics ? (exp.metrics.f1_binary * 100).toFixed(2) + '%' : '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {exp.metrics ? (exp.metrics.precision_binary * 100).toFixed(2) + '%' : '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {exp.metrics ? (exp.metrics.recall_binary * 100).toFixed(2) + '%' : '-'}
                    </td>
                    <td className="py-3 px-4 text-purple-300">
                      {exp.metrics ? exp.metrics.roc_auc.toFixed(4) : '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {exp.testSamples || Math.round(exp.totalSamples * exp.testSize)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
