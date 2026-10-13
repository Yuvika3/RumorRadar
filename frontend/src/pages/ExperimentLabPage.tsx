import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Dataset, Experiment, AblationResponse } from '../types';
import { FeatureBadge } from '../components/FeatureBadge';
import { ConfusionMatrixView } from '../components/ConfusionMatrixView';
import { RocPrCurvesView } from '../components/RocPrCurvesView';
import {
  FlaskConical,
  Play,
  RotateCw,
  Layers,
  CheckCircle,
  AlertTriangle,
  Activity,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';

interface ExperimentLabPageProps {
  onNavigate: (tab: string) => void;
}

export const ExperimentLabPage: React.FC<ExperimentLabPageProps> = ({ onNavigate }) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');

  // Feature selection checkboxes
  const [useText, setUseText] = useState(true);
  const [useSentEmo, setUseSentEmo] = useState(true);
  const [useEngagement, setUseEngagement] = useState(true);

  // Hyperparameters
  const [algorithm, setAlgorithm] = useState('logistic_regression');
  const [testSize, setTestSize] = useState(0.2);
  const [randomState, setRandomState] = useState(42);

  // Job & Results state
  const [running, setRunning] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const [jobMessage, setJobMessage] = useState<string>('');
  const [completedExperiment, setCompletedExperiment] = useState<Experiment | null>(null);
  const [ablationResults, setAblationResults] = useState<AblationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDatasets = async () => {
      try {
        const list = await api.getDatasets();
        setDatasets(list);
        if (list.length > 0) {
          setSelectedDatasetId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load datasets:', err);
      }
    };
    loadDatasets();
  }, []);

  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId);

  // Derive feature mode
  const getDerivedFeatureMode = (): 'text_only' | 'sentiment_emotion_only' | 'text_sentiment_emotion' | 'text_engagement' | 'combined' => {
    if (useText && useSentEmo && useEngagement) return 'combined';
    if (useText && useEngagement) return 'text_engagement';
    if (useText && useSentEmo) return 'text_sentiment_emotion';
    if (!useText && useSentEmo) return 'sentiment_emotion_only';
    return 'text_only';
  };

  const featureMode = getDerivedFeatureMode();

  // Polling loop for active training job
  useEffect(() => {
    let interval: any = null;
    if (running && activeJobId) {
      interval = setInterval(async () => {
        try {
          const exp = await api.pollExperimentStatus(activeJobId);
          setCurrentProgress(exp.progress || 20);
          setJobMessage(exp.message || 'Processing...');

          if (exp.status === 'completed') {
            setCompletedExperiment(exp);
            setRunning(false);
            setActiveJobId(null);
            clearInterval(interval);
          } else if (exp.status === 'failed') {
            setError(exp.errorMessage || 'Experiment failed.');
            setRunning(false);
            setActiveJobId(null);
            clearInterval(interval);
          }
        } catch (err: any) {
          console.warn('Poll error:', err);
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [running, activeJobId]);

  const handleTrainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDataset) return;

    if (['text_engagement', 'combined'].includes(featureMode) && !selectedDataset.hasEngagement) {
      setError(
        `Selected dataset '${selectedDataset.name}' has no engagement metrics. Disabling engagement-dependent modes to maintain research validity.`
      );
      return;
    }

    setError(null);
    setCompletedExperiment(null);
    setAblationResults(null);
    setRunning(true);
    setCurrentProgress(10);
    setJobMessage('Initializing training run on held-out test split...');

    try {
      const res = await api.startExperiment({
        datasetId: selectedDataset.id,
        featureMode,
        algorithm,
        testSize,
        randomState
      });
      setActiveJobId(res.experiment.id);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to start experiment');
      setRunning(false);
    }
  };

  const handleRunFullAblation = async () => {
    if (!selectedDataset) return;
    setError(null);
    setCompletedExperiment(null);
    setAblationResults(null);
    setRunning(true);
    setCurrentProgress(25);
    setJobMessage('Running comprehensive 5-configuration ablation study...');

    try {
      const abl = await api.runAblation({
        datasetId: selectedDataset.id,
        algorithm,
        testSize,
        randomState
      });
      setAblationResults(abl);
      setCurrentProgress(100);
      setJobMessage('Ablation study completed!');
      setRunning(false);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Ablation study failed');
      setRunning(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white">Experiment Lab</h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure feature modalities, train machine learning classifiers, and validate research hypotheses on held-out splits
        </p>
      </div>

      {/* Main Grid: Config Form & Job Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Config Form (Col 1 & 2) */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-6 border border-slate-800 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">Experiment Configuration</h3>
          </div>

          <form onSubmit={handleTrainSubmit} className="space-y-6">
            {/* Dataset Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                1. Benchmark Dataset
              </label>
              <select
                value={selectedDatasetId}
                onChange={(e) => setSelectedDatasetId(e.target.value)}
                className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                {datasets.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.totalRows} rows, {d.hasEngagement ? 'Engagement Included' : 'No Engagement'})
                  </option>
                ))}
              </select>

              {selectedDataset && !selectedDataset.hasEngagement && (
                <div className="mt-2 p-2.5 rounded-lg bg-amber-950/40 border border-amber-800 text-amber-300 text-xs flex items-center gap-2">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <span>Notice: This dataset lacks social engagement fields. Engagement experiments will be disabled to preserve research validity.</span>
                </div>
              )}
            </div>

            {/* Feature Modalities */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                2. Feature Modalities to Include
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Text Content */}
                <label className="flex items-start gap-3 p-3 rounded-lg bg-navy-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={useText}
                    onChange={(e) => setUseText(e.target.checked)}
                    className="mt-1 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Text Content</span>
                    <span className="text-[10px] text-slate-400">TF-IDF unigrams & bigrams (X_train fitted)</span>
                  </div>
                </label>

                {/* Sentiment & Emotion */}
                <label className="flex items-start gap-3 p-3 rounded-lg bg-navy-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={useSentEmo}
                    onChange={(e) => setUseSentEmo(e.target.checked)}
                    className="mt-1 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Affective Signals</span>
                    <span className="text-[10px] text-slate-400">VADER Polarity + 8 NRC Plutchik Emotions</span>
                  </div>
                </label>

                {/* Social Engagement */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${
                    selectedDataset?.hasEngagement
                      ? 'bg-navy-950 border-slate-800 hover:border-slate-700'
                      : 'bg-navy-950/40 border-slate-900 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={useEngagement && Boolean(selectedDataset?.hasEngagement)}
                    disabled={!selectedDataset?.hasEngagement}
                    onChange={(e) => setUseEngagement(e.target.checked)}
                    className="mt-1 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Social Engagement</span>
                    <span className="text-[10px] text-slate-400">Tweet shares & reshares (log1p scaled)</span>
                  </div>
                </label>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-400">Active Pipeline Feature Mode:</span>
                <FeatureBadge mode={featureMode} />
              </div>
            </div>

            {/* Algorithm Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                3. Classifier Algorithm
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'logistic_regression', label: 'Logistic Regression', desc: 'L2 Regularized' },
                  { id: 'multinomial_nb', label: 'Multinomial NB', desc: 'Laplace Smoothing' },
                  { id: 'complement_nb', label: 'Complement NB', desc: 'Imbalance Robust' },
                  { id: 'random_forest', label: 'Random Forest', desc: '100 Estimators' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAlgorithm(item.id)}
                    className={`p-2.5 rounded-lg text-left text-xs transition-colors border ${
                      algorithm === item.id
                        ? 'bg-cyan-950 border-cyan-800 text-cyan-300 font-bold'
                        : 'bg-navy-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="block truncate">{item.label}</span>
                    <span className="text-[10px] text-slate-500 block">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Split & Random Seed Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="text-slate-400">Held-Out Test Size:</span>
                  <span className="text-cyan-400 font-bold">{(testSize * 100).toFixed(0)}% Test / {(100 - testSize * 100).toFixed(0)}% Train</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.35"
                  step="0.05"
                  value={testSize}
                  onChange={(e) => setTestSize(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="text-slate-400">Random State Seed:</span>
                  <span className="text-cyan-400 font-bold">{randomState}</span>
                </div>
                <input
                  type="number"
                  value={randomState}
                  onChange={(e) => setRandomState(parseInt(e.target.value) || 42)}
                  className="w-full bg-navy-950 border border-slate-700 rounded-lg p-1.5 text-xs font-mono text-slate-100"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={running}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Train Experiment
              </button>

              <button
                type="button"
                disabled={running}
                onClick={handleRunFullAblation}
                className="px-5 py-2.5 rounded-lg bg-navy-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-semibold text-xs flex items-center gap-2 disabled:opacity-50"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Run Full 5-Configuration Ablation Suite
              </button>
            </div>
          </form>
        </div>

        {/* Live Job & Execution Tracker (Col 3) */}
        <div className="glass-panel rounded-xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-4">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100">Live Execution Status</h3>
            </div>

            {running ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-cyan-400">Training In Progress...</span>
                  <span className="font-mono text-slate-300">{currentProgress}%</span>
                </div>

                <div className="w-full bg-navy-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-300"
                    style={{ width: `${currentProgress}%` }}
                  />
                </div>

                <div className="p-3 rounded-lg bg-navy-950 border border-slate-800 font-mono text-[11px] text-slate-300">
                  <span className="text-cyan-400 block mb-1">&gt; System Status:</span>
                  <p className="animate-pulse">{jobMessage || 'Executing feature extraction pipeline...'}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 text-center">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <span className="text-xs font-bold text-slate-200 block">ML Engine Idle & Ready</span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Select configurations and start training. All transformations strictly prevent test set leakage.
                  </p>
                </div>

                {completedExperiment && (
                  <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/60 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-cyan-300 block font-bold">
                      Latest Run Results
                    </span>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300">Accuracy:</span>
                      <strong className="text-cyan-300">{(completedExperiment.metrics?.accuracy! * 100).toFixed(2)}%</strong>
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300">F1-Score:</span>
                      <strong className="text-emerald-400">{(completedExperiment.metrics?.f1_binary! * 100).toFixed(2)}%</strong>
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300">ROC-AUC:</span>
                      <strong className="text-purple-300">{completedExperiment.metrics?.roc_auc?.toFixed(4)}</strong>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
            Model artifacts saved to: ml-service/saved_models/*.joblib
          </div>
        </div>
      </div>

      {/* Immediate Experiment Held-Out Evaluation Section */}
      {completedExperiment && completedExperiment.metrics && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Held-Out Test Set Performance Report</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluated on {completedExperiment.testSamples} samples strictly unseen during training
              </p>
            </div>
            <div className="flex items-center gap-3">
              <FeatureBadge mode={completedExperiment.featureMode} />
              <button
                onClick={() => onNavigate('comparison')}
                className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-slate-700 text-xs text-cyan-300 border border-slate-700"
              >
                Compare With Other Runs
              </button>
            </div>
          </div>

          {/* Metric Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Accuracy</span>
              <span className="text-lg font-bold font-mono text-cyan-400">
                {(completedExperiment.metrics.accuracy * 100).toFixed(2)}%
              </span>
            </div>
            <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Binary F1</span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                {(completedExperiment.metrics.f1_binary * 100).toFixed(2)}%
              </span>
            </div>
            <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Precision</span>
              <span className="text-lg font-bold font-mono text-slate-200">
                {(completedExperiment.metrics.precision_binary * 100).toFixed(2)}%
              </span>
            </div>
            <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Recall</span>
              <span className="text-lg font-bold font-mono text-slate-200">
                {(completedExperiment.metrics.recall_binary * 100).toFixed(2)}%
              </span>
            </div>
            <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">ROC-AUC</span>
              <span className="text-lg font-bold font-mono text-purple-400">
                {completedExperiment.metrics.roc_auc.toFixed(4)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">PR-AUC</span>
              <span className="text-lg font-bold font-mono text-purple-400">
                {completedExperiment.metrics.pr_auc.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Confusion Matrix & Curves */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {completedExperiment.confusionMatrix && (
              <div className="lg:col-span-1">
                <ConfusionMatrixView cm={completedExperiment.confusionMatrix} />
              </div>
            )}
            <div className="lg:col-span-2">
              <RocPrCurvesView
                rocCurve={completedExperiment.rocCurve}
                prCurve={completedExperiment.prCurve}
                rocAuc={completedExperiment.metrics.roc_auc}
                prAuc={completedExperiment.metrics.pr_auc}
              />
            </div>
          </div>

          {/* Sample Test Predictions */}
          {completedExperiment.sampleEvaluations && completedExperiment.sampleEvaluations.length > 0 && (
            <div className="border-t border-slate-800 pt-5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Held-Out Sample Inferences (Actual vs Predicted)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-navy-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Test Headline Text</th>
                      <th className="py-2.5 px-3 w-28 text-center">Actual Ground Truth</th>
                      <th className="py-2.5 px-3 w-28 text-center">Predicted Class</th>
                      <th className="py-2.5 px-3 w-24 text-right">Confidence</th>
                      <th className="py-2.5 px-3 w-20 text-center">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {completedExperiment.sampleEvaluations.map((evalItem, idx) => (
                      <tr key={idx} className="hover:bg-navy-800/30">
                        <td className="py-2.5 px-3 text-slate-200">{evalItem.text}</td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] ${
                              evalItem.actual === 1
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {evalItem.actual === 1 ? 'Fake (1)' : 'Real (0)'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] ${
                              evalItem.predicted === 1
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {evalItem.predicted === 1 ? 'Fake (1)' : 'Real (0)'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-cyan-300">
                          {(evalItem.confidence * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {evalItem.correct ? (
                            <span className="text-emerald-400 font-bold">✓ Match</span>
                          ) : (
                            <span className="text-rose-400 font-bold">✗ Error</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ablation Suite Results View */}
      {ablationResults && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Full Ablation Study Benchmark Results</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Systematic comparison answering the core research question across feature groups
              </p>
            </div>
            <button
              onClick={() => onNavigate('comparison')}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs"
            >
              Analyze in Model Comparison
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-navy-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Feature Modality</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">F1 Score</th>
                  <th className="py-3 px-4">Precision</th>
                  <th className="py-3 px-4">Recall</th>
                  <th className="py-3 px-4">ROC-AUC</th>
                  <th className="py-3 px-4 text-right">F1 Delta vs Baseline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {ablationResults.results.map((res, idx) => (
                  <tr key={idx} className="hover:bg-navy-800/40">
                    <td className="py-3 px-4 font-sans">
                      <FeatureBadge mode={res.feature_mode} />
                    </td>
                    <td className="py-3 px-4 text-cyan-300">
                      {(res.accuracy * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">
                      {(res.f1_score * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {(res.precision * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {(res.recall * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-purple-300">
                      {res.roc_auc.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {res.f1_delta_from_baseline > 0 ? (
                        <span className="text-emerald-400 font-bold">
                          +{(res.f1_delta_from_baseline * 100).toFixed(2)}%
                        </span>
                      ) : res.f1_delta_from_baseline < 0 ? (
                        <span className="text-rose-400">
                          {(res.f1_delta_from_baseline * 100).toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-slate-500">Baseline</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 text-xs space-y-1">
            <span className="font-bold text-cyan-400 uppercase tracking-wider block text-[10px]">
              Empirical Synthesis:
            </span>
            <p className="text-slate-200">{ablationResults.research_synthesis.improvement_summary}</p>
          </div>
        </div>
      )}
    </div>
  );
};
