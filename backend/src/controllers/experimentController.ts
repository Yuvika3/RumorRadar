import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { StoreService } from '../services/storeService';
import { MLClient } from '../services/mlClient';

export const ExperimentController = {
  async listExperiments(req: Request, res: Response) {
    try {
      const experiments = await StoreService.getAllExperiments();
      res.json({ success: true, experiments });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getExperimentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const experiment = await StoreService.getExperimentById(id);
      if (!experiment) {
        return res.status(404).json({ success: false, message: 'Experiment not found' });
      }
      res.json({ success: true, experiment });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async createExperiment(req: Request, res: Response) {
    try {
      const {
        datasetId,
        featureMode = 'combined',
        algorithm = 'logistic_regression',
        testSize = 0.2,
        randomState = 42
      } = req.body;

      const dataset = await StoreService.getDatasetById(datasetId);
      if (!dataset) {
        return res.status(404).json({ success: false, message: 'Specified dataset not found' });
      }

      // Research validation: Disable engagement features if dataset lacks them
      if (['text_engagement', 'combined'].includes(featureMode) && !dataset.hasEngagement) {
        return res.status(400).json({
          success: false,
          message: `The dataset '${dataset.name}' does not contain genuine engagement fields. Modes 'text_engagement' and 'combined' are disabled for this dataset to maintain research validity. Please select 'text_only', 'sentiment_emotion_only', or 'text_sentiment_emotion'.`
        });
      }

      const experimentId = `exp_${uuidv4().slice(0, 8)}`;
      const newExperiment = {
        id: experimentId,
        datasetId: dataset.id,
        datasetName: dataset.name,
        featureMode,
        algorithm,
        testSize,
        randomState,
        trainSamples: 0,
        testSamples: 0,
        totalSamples: dataset.totalRows,
        status: 'queued',
        progress: 5,
        message: 'Initializing experiment...',
        createdAt: new Date()
      };

      await StoreService.saveExperiment(newExperiment);

      // Trigger background training in ML service
      try {
        await MLClient.trainExperiment({
          dataset_path: dataset.filepath,
          text_column: dataset.textColumn,
          label_column: dataset.labelColumn,
          engagement_column: dataset.hasEngagement ? dataset.engagementColumn : null,
          feature_mode: featureMode,
          algorithm,
          test_size: testSize,
          random_state: randomState,
          experiment_id: experimentId,
          dataset_name: dataset.name
        });
      } catch (mlErr: any) {
        await StoreService.updateExperiment(experimentId, {
          status: 'failed',
          errorMessage: mlErr.message
        });
        return res.status(502).json({
          success: false,
          message: `Failed to initiate training on ML service: ${mlErr.message}`
        });
      }

      res.status(202).json({
        success: true,
        message: 'Experiment training initiated',
        experiment: newExperiment
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async pollExperimentStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const experiment = await StoreService.getExperimentById(id);
      if (!experiment) {
        return res.status(404).json({ success: false, message: 'Experiment not found' });
      }

      // If already completed or failed, return stored data
      if (experiment.status === 'completed' || experiment.status === 'failed') {
        return res.json({ success: true, experiment });
      }

      // Poll ML service
      try {
        const mlJob = await MLClient.getJobStatus(id);
        const updates: any = {
          status: mlJob.status,
          progress: mlJob.progress,
          message: mlJob.message
        };

        if (mlJob.status === 'completed' && mlJob.result) {
          const resObj = mlJob.result;
          updates.metrics = resObj.metrics;
          updates.confusionMatrix = resObj.confusion_matrix;
          updates.rocCurve = resObj.roc_curve;
          updates.prCurve = resObj.pr_curve;
          updates.sampleEvaluations = resObj.sample_evaluations;
          updates.trainSamples = resObj.train_samples;
          updates.testSamples = resObj.test_samples;
          updates.durationSeconds = resObj.duration_seconds;
          updates.artifactPath = resObj.artifact_path;
        } else if (mlJob.status === 'failed') {
          updates.errorMessage = mlJob.error || 'Training failed';
        }

        const updatedExp = await StoreService.updateExperiment(id, updates);
        res.json({ success: true, experiment: updatedExp });
      } catch (mlErr: any) {
        // If ML service temporary failure, return current state
        res.json({ success: true, experiment });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async runAblationStudy(req: Request, res: Response) {
    try {
      const {
        datasetId,
        algorithm = 'logistic_regression',
        testSize = 0.2,
        randomState = 42
      } = req.body;

      const dataset = await StoreService.getDatasetById(datasetId);
      if (!dataset) {
        return res.status(404).json({ success: false, message: 'Specified dataset not found' });
      }

      const ablationResult = await MLClient.runAblation({
        dataset_path: dataset.filepath,
        text_column: dataset.textColumn,
        label_column: dataset.labelColumn,
        engagement_column: dataset.hasEngagement ? dataset.engagementColumn : null,
        algorithm,
        test_size: testSize,
        random_state: randomState,
        dataset_name: dataset.name
      });

      // Save individual experiment runs from ablation results into our history
      if (ablationResult.results && Array.isArray(ablationResult.results)) {
        for (const r of ablationResult.results) {
          if (!r.error) {
            const expId = `exp_abl_${uuidv4().slice(0, 8)}`;
            await StoreService.saveExperiment({
              id: expId,
              datasetId: dataset.id,
              datasetName: dataset.name,
              featureMode: r.feature_mode,
              algorithm: r.algorithm,
              testSize,
              randomState,
              trainSamples: Math.round(dataset.totalRows * (1 - testSize)),
              testSamples: Math.round(dataset.totalRows * testSize),
              totalSamples: dataset.totalRows,
              status: 'completed',
              progress: 100,
              metrics: {
                accuracy: r.accuracy,
                precision_binary: r.precision,
                recall_binary: r.recall,
                f1_binary: r.f1_score,
                precision_macro: r.precision,
                recall_macro: r.recall,
                f1_macro: r.f1_score,
                roc_auc: r.roc_auc,
                pr_auc: r.pr_auc
              },
              confusionMatrix: r.confusion_matrix,
              rocCurve: r.roc_curve || [],
              durationSeconds: r.duration_seconds,
              createdAt: new Date()
            });
          }
        }
      }

      res.json({
        success: true,
        ablation: ablationResult
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
