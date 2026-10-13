import mongoose, { Schema, Document } from 'mongoose';

export interface IExperiment extends Document {
  id: string;
  datasetId: string;
  datasetName: string;
  featureMode: string;
  algorithm: string;
  testSize: number;
  randomState: number;
  trainSamples: number;
  testSamples: number;
  totalSamples: number;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  message?: string;
  metrics?: {
    accuracy: number;
    precision_binary: number;
    recall_binary: number;
    f1_binary: number;
    precision_macro: number;
    recall_macro: number;
    f1_macro: number;
    roc_auc: number;
    pr_auc: number;
  };
  confusionMatrix?: {
    tn: number;
    fp: number;
    fn: number;
    tp: number;
    matrix: number[][];
  };
  rocCurve?: Array<{ x: number; y: number }>;
  prCurve?: Array<{ x: number; y: number }>;
  sampleEvaluations?: Array<{
    text: string;
    actual: number;
    predicted: number;
    confidence: number;
    correct: boolean;
  }>;
  durationSeconds?: number;
  artifactPath?: string;
  errorMessage?: string;
  createdAt: Date;
}

const ExperimentSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  datasetId: { type: String, required: true },
  datasetName: { type: String, required: true },
  featureMode: { type: String, required: true },
  algorithm: { type: String, required: true },
  testSize: { type: Number, required: true, default: 0.2 },
  randomState: { type: Number, required: true, default: 42 },
  trainSamples: { type: Number, default: 0 },
  testSamples: { type: Number, default: 0 },
  totalSamples: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['queued', 'running', 'completed', 'failed'],
    default: 'queued'
  },
  progress: { type: Number, default: 0 },
  message: { type: String, default: '' },
  metrics: { type: Schema.Types.Mixed, default: null },
  confusionMatrix: { type: Schema.Types.Mixed, default: null },
  rocCurve: { type: Array, default: [] },
  prCurve: { type: Array, default: [] },
  sampleEvaluations: { type: Array, default: [] },
  durationSeconds: { type: Number, default: 0 },
  artifactPath: { type: String, default: '' },
  errorMessage: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export const ExperimentModel = mongoose.model<IExperiment>('Experiment', ExperimentSchema);
