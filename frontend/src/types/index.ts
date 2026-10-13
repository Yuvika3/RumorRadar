export interface Dataset {
  id: string;
  name: string;
  filename: string;
  filepath: string;
  totalRows: number;
  totalColumns: number;
  textColumn: string;
  labelColumn: string;
  engagementColumn?: string | null;
  hasEngagement: boolean;
  classDistribution: Record<string, number>;
  engagementStats?: {
    column: string;
    mean: number;
    median: number;
    std: number;
    min: number;
    max: number;
    zero_count: number;
  } | null;
  columns: Array<{
    name: string;
    dtype: string;
    missing_count: number;
    missing_pct: number;
    unique_count: number;
  }>;
  createdAt: string;
}

export interface ExperimentMetrics {
  accuracy: number;
  precision_binary: number;
  recall_binary: number;
  f1_binary: number;
  precision_macro: number;
  recall_macro: number;
  f1_macro: number;
  roc_auc: number;
  pr_auc: number;
}

export interface ConfusionMatrix {
  tn: number;
  fp: number;
  fn: number;
  tp: number;
  matrix: number[][];
}

export interface CurvePoint {
  x: number;
  y: number;
}

export interface SampleEvaluation {
  text: string;
  actual: number;
  predicted: number;
  confidence: number;
  correct: boolean;
}

export interface Experiment {
  id: string;
  datasetId: string;
  datasetName: string;
  featureMode: 'text_only' | 'sentiment_emotion_only' | 'text_sentiment_emotion' | 'text_engagement' | 'combined';
  algorithm: string;
  testSize: number;
  randomState: number;
  trainSamples: number;
  testSamples: number;
  totalSamples: number;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  message?: string;
  metrics?: ExperimentMetrics;
  confusionMatrix?: ConfusionMatrix;
  rocCurve?: CurvePoint[];
  prCurve?: CurvePoint[];
  sampleEvaluations?: SampleEvaluation[];
  durationSeconds?: number;
  artifactPath?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface AblationStudyResult {
  feature_mode: string;
  algorithm: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  pr_auc: number;
  f1_delta_from_baseline: number;
  accuracy_delta_from_baseline: number;
  confusion_matrix?: ConfusionMatrix;
  roc_curve?: CurvePoint[];
  duration_seconds?: number;
  error?: string;
}

export interface AblationResponse {
  dataset_name: string;
  algorithm: string;
  has_engagement: boolean;
  baseline_mode: string;
  results: AblationStudyResult[];
  research_synthesis: {
    hypothesis_supported: boolean;
    improvement_summary: string;
    baseline_accuracy: number | null;
    baseline_f1: number | null;
    combined_accuracy: number | null;
    combined_f1: number | null;
  };
}

export interface SentimentScores {
  compound: number;
  pos: number;
  neg: number;
  neu: number;
}

export type EmotionScores = Record<string, number>;

export interface PredictionRecord {
  id: string;
  text: string;
  engagementValue: number;
  predictedLabel: number;
  labelName: string;
  confidence: number;
  probabilities: {
    real: number;
    fake: number;
  };
  riskLevel: string;
  sentiment: SentimentScores;
  emotions: EmotionScores;
  modelUsed: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalDatasets: number;
  totalRecords: number;
  totalExperiments: number;
  completedExperiments: number;
  totalPredictions: number;
  bestModel: {
    id: string;
    featureMode: string;
    algorithm: string;
    datasetName: string;
    accuracy: number;
    f1Score: number;
    rocAuc: number;
  } | null;
}

export interface EmotionComparisonItem {
  emotion: string;
  real_avg: number;
  fake_avg: number;
}

export interface SentimentComparisonItem {
  metric: string;
  real_avg: number;
  fake_avg: number;
}

export interface DistributionsData {
  sample_size: number;
  emotion_comparison: EmotionComparisonItem[];
  sentiment_comparison: SentimentComparisonItem[];
  engagement_comparison: {
    has_engagement: boolean;
    real_mean: number;
    fake_mean: number;
    real_median: number;
    fake_median: number;
  };
}
