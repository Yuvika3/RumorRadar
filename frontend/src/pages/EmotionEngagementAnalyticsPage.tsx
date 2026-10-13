import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DistributionsData, Dataset } from '../types';
import {
  Activity,
  Heart,
  Share2,
  AlertCircle,
  RefreshCw,
  ShieldAlert,
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export const EmotionEngagementAnalyticsPage: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [distData, setDistData] = useState<DistributionsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async (datasetId?: string) => {
    setLoading(true);
    try {
      const res = await api.getDistributions(datasetId);
      setDistData(res.distributions);
    } catch (err) {
      console.error('Failed to load distribution analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const dsList = await api.getDatasets();
        setDatasets(dsList);
        if (dsList.length > 0) {
          setSelectedDatasetId(dsList[0].id);
          await loadData(dsList[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  const handleDatasetChange = (id: string) => {
    setSelectedDatasetId(id);
    loadData(id);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Emotion & Social Diffusion Analytics</h2>
          <p className="text-xs text-slate-400 mt-1">
            Empirical analysis of affective signals, sentiment polarity, and social reshares across veracity classes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedDatasetId}
            onChange={(e) => handleDatasetChange(e.target.value)}
            className="bg-navy-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none"
          >
            {datasets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.totalRows} records)
              </option>
            ))}
          </select>
          <button
            onClick={() => loadData(selectedDatasetId)}
            className="p-2 rounded-lg bg-navy-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Critical Scientific Callout */}
      <div className="glass-panel-glow rounded-xl p-5 border border-cyan-500/40 bg-cyan-950/20">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-cyan-300">
              Research Imperative: Emotion and Engagement Do Not Prove Misinformation
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              In political and investigative journalism, verified articles frequently document natural disasters, warfare, corruption indictments, and public health threats—naturally registering elevated fear, anger, and negative sentiment. Misinformation classification requires empirical fact-checked ground truth labels, not simplistic heuristics equating negative emotions or high virality with falsehood.
            </p>
          </div>
        </div>
      </div>

      {loading || !distData ? (
        <div className="glass-panel rounded-xl p-12 text-center border border-slate-800">
          <div className="inline-block w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs text-slate-400">Computing NRC emotion vectors and VADER sentiment distributions...</p>
        </div>
      ) : (
        <>
          {/* NRC Plutchik Emotion Profile Radar & Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <div className="glass-panel rounded-xl p-6 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">8-Dimensional NRC Emotion Radar</h3>
                  <p className="text-xs text-slate-400">Real Verified (Emerald) vs Fake Rumor (Rose)</p>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  N={distData.sample_size}
                </span>
              </div>

              <div className="h-72 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={distData.emotion_comparison}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="emotion" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis domain={[0, 0.4]} stroke="#475569" tick={{ fontSize: 9 }} />
                    <Radar
                      name="Verified Factual"
                      dataKey="real_avg"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.25}
                    />
                    <Radar
                      name="Fake / Misinformation"
                      dataKey="fake_avg"
                      stroke="#f43f5e"
                      fill="#f43f5e"
                      fillOpacity={0.25}
                    />
                    <Tooltip contentStyle={{ backgroundColor: '#0b1329', borderColor: '#1e293b', borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Emotion Grouped Bar Chart */}
            <div className="glass-panel rounded-xl p-6 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Average Emotion Intensity Comparison</h3>
                  <p className="text-xs text-slate-400">Relative word-emotion associations per claim</p>
                </div>
                <span className="text-xs text-slate-400 font-mono">NRC Word Lexicon</span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distData.emotion_comparison} margin={{ top: 10, right: 15, left: -15, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="emotion" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-25} textAnchor="end" />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0b1329', borderColor: '#1e293b', borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Bar name="Verified Real" dataKey="real_avg" fill="#10b981" radius={[3, 3, 0, 0]} />
                    <Bar name="Fake / Rumor" dataKey="fake_avg" fill="#f43f5e" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* VADER Sentiment Polarity Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-panel rounded-xl p-6 border border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 mb-1">VADER Valence Polarity Breakdown</h3>
              <p className="text-xs text-slate-400 mb-4">
                Mean Compound score, Positive, Negative, and Neutral proportions
              </p>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distData.sentiment_comparison} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0b1329', borderColor: '#1e293b', borderRadius: '8px' }} />
                    <Legend />
                    <Bar name="Verified Factual" dataKey="real_avg" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    <Bar name="Fake / Rumor" dataKey="fake_avg" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Social Engagement Dynamics */}
            <div className="glass-panel rounded-xl p-6 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-100">Social Engagement Diffusion</h3>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Comparing verified Twitter/X reshare volume between authentic and debunked news claims.
                </p>

                {distData.engagement_comparison.has_engagement ? (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block font-sans">Mean Shares (Tweets)</span>
                      <div className="flex justify-between mt-1">
                        <span className="text-emerald-400">Real: {distData.engagement_comparison.real_mean.toLocaleString()}</span>
                        <span className="text-rose-400">Fake: {distData.engagement_comparison.fake_mean.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block font-sans">Median Shares (Skew-Resistant)</span>
                      <div className="flex justify-between mt-1">
                        <span className="text-emerald-400">Real: {distData.engagement_comparison.real_median.toLocaleString()}</span>
                        <span className="text-rose-400">Fake: {distData.engagement_comparison.fake_median.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-navy-950 border border-slate-800 text-xs text-amber-300">
                    This dataset does not include engagement fields. Social diffusion analysis is disabled.
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                Data source: FakeNewsNet Twitter Hydration Context
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
