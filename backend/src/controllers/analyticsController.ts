import { Request, Response } from 'express';
import { StoreService } from '../services/storeService';
import { MLClient } from '../services/mlClient';

export const AnalyticsController = {
  async getDistributions(req: Request, res: Response) {
    try {
      const { datasetId } = req.query;
      let dataset = null;
      if (datasetId) {
        dataset = await StoreService.getDatasetById(datasetId as string);
      }
      if (!dataset) {
        const datasets = await StoreService.getAllDatasets();
        if (datasets.length > 0) {
          dataset = datasets[0];
        }
      }

      if (!dataset) {
        return res.status(404).json({ success: false, message: 'No dataset found for analytics' });
      }

      const distributions = await MLClient.getAnalyticsDistribution({
        dataset_path: dataset.filepath,
        text_column: dataset.textColumn,
        label_column: dataset.labelColumn,
        engagement_column: dataset.hasEngagement ? dataset.engagementColumn : null,
        sample_limit: 500
      });

      res.json({
        success: true,
        dataset: {
          id: dataset.id,
          name: dataset.name,
          hasEngagement: dataset.hasEngagement
        },
        distributions
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getDashboardSummary(req: Request, res: Response) {
    try {
      const datasets = await StoreService.getAllDatasets();
      const experiments = await StoreService.getAllExperiments();
      const predictions = await StoreService.getAllPredictions();

      const completedExperiments = experiments.filter((e) => e.status === 'completed');

      // Find top performing model
      let bestExperiment = null;
      let highestF1 = -1;
      for (const exp of completedExperiments) {
        if (exp.metrics?.f1_binary !== undefined && exp.metrics.f1_binary > highestF1) {
          highestF1 = exp.metrics.f1_binary;
          bestExperiment = exp;
        }
      }

      const totalRecords = datasets.reduce((acc, d) => acc + (d.totalRows || 0), 0);

      res.json({
        success: true,
        summary: {
          totalDatasets: datasets.length,
          totalRecords,
          totalExperiments: experiments.length,
          completedExperiments: completedExperiments.length,
          totalPredictions: predictions.length,
          bestModel: bestExperiment
            ? {
                id: bestExperiment.id,
                featureMode: bestExperiment.featureMode,
                algorithm: bestExperiment.algorithm,
                datasetName: bestExperiment.datasetName,
                accuracy: bestExperiment.metrics?.accuracy,
                f1Score: bestExperiment.metrics?.f1_binary,
                rocAuc: bestExperiment.metrics?.roc_auc
              }
            : null
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
