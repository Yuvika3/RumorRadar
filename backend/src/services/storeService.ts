import fs from 'fs';
import path from 'path';
import { isMongoConnected } from '../config/database';
import { DatasetModel, IDataset } from '../models/Dataset';
import { ExperimentModel, IExperiment } from '../models/Experiment';
import { PredictionModel, IPrediction } from '../models/Prediction';

const DATA_DIR = path.resolve(__dirname, '../../.data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

interface FileStoreData {
  datasets: any[];
  experiments: any[];
  predictions: any[];
}

function ensureStoreFile(): FileStoreData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_FILE)) {
    const initial: FileStoreData = { datasets: [], experiments: [], predictions: [] };
    fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    const initial: FileStoreData = { datasets: [], experiments: [], predictions: [] };
    fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

function saveStoreFile(data: FileStoreData) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export const StoreService = {
  // Datasets
  async getAllDatasets(): Promise<any[]> {
    if (isMongoConnected) {
      try {
        return await DatasetModel.find().sort({ createdAt: -1 }).lean();
      } catch {
        // Fall back to file
      }
    }
    const store = ensureStoreFile();
    return store.datasets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getDatasetById(id: string): Promise<any | null> {
    if (isMongoConnected) {
      try {
        return await DatasetModel.findOne({ id }).lean();
      } catch {
        // Fall back
      }
    }
    const store = ensureStoreFile();
    return store.datasets.find((d) => d.id === id) || null;
  },

  async saveDataset(datasetData: any): Promise<any> {
    if (isMongoConnected) {
      try {
        await DatasetModel.findOneAndUpdate({ id: datasetData.id }, datasetData, { upsert: true, new: true });
      } catch (err) {
        console.warn('[StoreService] MongoDB saveDataset error, saving to local store:', err);
      }
    }
    const store = ensureStoreFile();
    const existingIndex = store.datasets.findIndex((d) => d.id === datasetData.id);
    if (existingIndex >= 0) {
      store.datasets[existingIndex] = { ...store.datasets[existingIndex], ...datasetData };
    } else {
      store.datasets.push(datasetData);
    }
    saveStoreFile(store);
    return datasetData;
  },

  async deleteDataset(id: string): Promise<boolean> {
    if (isMongoConnected) {
      try {
        await DatasetModel.deleteOne({ id });
      } catch {}
    }
    const store = ensureStoreFile();
    store.datasets = store.datasets.filter((d) => d.id !== id);
    saveStoreFile(store);
    return true;
  },

  // Experiments
  async getAllExperiments(): Promise<any[]> {
    if (isMongoConnected) {
      try {
        return await ExperimentModel.find().sort({ createdAt: -1 }).lean();
      } catch {}
    }
    const store = ensureStoreFile();
    return store.experiments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getExperimentById(id: string): Promise<any | null> {
    if (isMongoConnected) {
      try {
        return await ExperimentModel.findOne({ id }).lean();
      } catch {}
    }
    const store = ensureStoreFile();
    return store.experiments.find((e) => e.id === id) || null;
  },

  async saveExperiment(expData: any): Promise<any> {
    if (isMongoConnected) {
      try {
        await ExperimentModel.findOneAndUpdate({ id: expData.id }, expData, { upsert: true, new: true });
      } catch (err) {
        console.warn('[StoreService] MongoDB saveExperiment error, saving to local store:', err);
      }
    }
    const store = ensureStoreFile();
    const existingIndex = store.experiments.findIndex((e) => e.id === expData.id);
    if (existingIndex >= 0) {
      store.experiments[existingIndex] = { ...store.experiments[existingIndex], ...expData };
    } else {
      store.experiments.push(expData);
    }
    saveStoreFile(store);
    return expData;
  },

  async updateExperiment(id: string, updates: any): Promise<any> {
    if (isMongoConnected) {
      try {
        await ExperimentModel.findOneAndUpdate({ id }, { $set: updates }, { new: true });
      } catch {}
    }
    const store = ensureStoreFile();
    const existingIndex = store.experiments.findIndex((e) => e.id === id);
    if (existingIndex >= 0) {
      store.experiments[existingIndex] = { ...store.experiments[existingIndex], ...updates };
      saveStoreFile(store);
      return store.experiments[existingIndex];
    }
    return null;
  },

  // Predictions
  async getAllPredictions(): Promise<any[]> {
    if (isMongoConnected) {
      try {
        return await PredictionModel.find().sort({ createdAt: -1 }).limit(100).lean();
      } catch {}
    }
    const store = ensureStoreFile();
    return store.predictions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async savePrediction(predData: any): Promise<any> {
    if (isMongoConnected) {
      try {
        await PredictionModel.create(predData);
      } catch {}
    }
    const store = ensureStoreFile();
    store.predictions.unshift(predData);
    if (store.predictions.length > 200) {
      store.predictions = store.predictions.slice(0, 200);
    }
    saveStoreFile(store);
    return predData;
  }
};
