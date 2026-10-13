import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: 120000 // 2 minutes for training
});

export const MLClient = {
  async getHealth() {
    const res = await client.get('/api/ml/health');
    return res.data;
  },

  async profileDataset(datasetPath: string) {
    const res = await client.post('/api/ml/profile', {
      dataset_path: datasetPath
    });
    return res.data;
  },

  async trainExperiment(payload: {
    dataset_path: string;
    text_column: string;
    label_column: string;
    engagement_column?: string | null;
    feature_mode: string;
    algorithm: string;
    test_size: number;
    random_state: number;
    experiment_id?: string;
    dataset_name?: string;
  }) {
    const res = await client.post('/api/ml/train', payload);
    return res.data;
  },

  async getJobStatus(jobId: string) {
    const res = await client.get(`/api/ml/jobs/${jobId}`);
    return res.data;
  },

  async runAblation(payload: {
    dataset_path: string;
    text_column: string;
    label_column: string;
    engagement_column?: string | null;
    algorithm: string;
    test_size: number;
    random_state: number;
    dataset_name?: string;
  }) {
    const res = await client.post('/api/ml/ablation', payload);
    return res.data;
  },

  async predictText(payload: {
    text: string;
    engagement_value?: number;
    experiment_id?: string;
  }) {
    const res = await client.post('/api/ml/predict', payload);
    return res.data;
  },

  async getAnalyticsDistribution(params: {
    dataset_path: string;
    text_column?: string;
    label_column?: string;
    engagement_column?: string | null;
    sample_limit?: number;
  }) {
    const res = await client.get('/api/ml/analytics/distribution', { params });
    return res.data;
  }
};
