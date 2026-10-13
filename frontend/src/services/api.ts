import axios from 'axios';
import {
  Dataset,
  Experiment,
  AblationResponse,
  PredictionRecord,
  DashboardSummary,
  DistributionsData
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 120000
});

export const api = {
  // Health
  async getHealth() {
    const res = await client.get('/health');
    return res.data;
  },

  // Dashboard
  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await client.get('/analytics/summary');
    return res.data.summary;
  },

  // Datasets
  async getDatasets(): Promise<Dataset[]> {
    const res = await client.get('/datasets');
    return res.data.datasets;
  },

  async getDatasetById(id: string): Promise<Dataset> {
    const res = await client.get(`/datasets/${id}`);
    return res.data.dataset;
  },

  async getDatasetRows(id: string, params: { page?: number; limit?: number; search?: string; label?: string }) {
    const res = await client.get(`/datasets/${id}/rows`, { params });
    return res.data;
  },

  async uploadDataset(formData: FormData): Promise<{ dataset: Dataset; message: string }> {
    const res = await client.post('/datasets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  async deleteDataset(id: string) {
    const res = await client.delete(`/datasets/${id}`);
    return res.data;
  },

  // Experiments
  async getExperiments(): Promise<Experiment[]> {
    const res = await client.get('/experiments');
    return res.data.experiments;
  },

  async getExperimentById(id: string): Promise<Experiment> {
    const res = await client.get(`/experiments/${id}`);
    return res.data.experiment;
  },

  async startExperiment(payload: {
    datasetId: string;
    featureMode: string;
    algorithm: string;
    testSize: number;
    randomState: number;
  }): Promise<{ experiment: Experiment }> {
    const res = await client.post('/experiments', payload);
    return res.data;
  },

  async pollExperimentStatus(id: string): Promise<Experiment> {
    const res = await client.get(`/experiments/${id}/status`);
    return res.data.experiment;
  },

  async runAblation(payload: {
    datasetId: string;
    algorithm?: string;
    testSize?: number;
    randomState?: number;
  }): Promise<AblationResponse> {
    const res = await client.post('/experiments/ablation', payload);
    return res.data.ablation;
  },

  // Analytics
  async getDistributions(datasetId?: string): Promise<{ dataset: any; distributions: DistributionsData }> {
    const res = await client.get('/analytics/distributions', {
      params: { datasetId }
    });
    return res.data;
  },

  // Predictions
  async runPrediction(payload: {
    text: string;
    engagementValue?: number;
    experimentId?: string;
  }): Promise<PredictionRecord> {
    const res = await client.post('/predict', payload);
    return res.data.prediction;
  },

  async getPredictions(): Promise<PredictionRecord[]> {
    const res = await client.get('/predict');
    return res.data.predictions;
  },

  // Export URLs
  getExportCsvUrl(): string {
    return `${API_BASE}/export/experiments.csv`;
  },

  getExportReportUrl(): string {
    return `${API_BASE}/export/report`;
  }
};
