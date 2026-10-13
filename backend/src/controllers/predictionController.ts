import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { StoreService } from '../services/storeService';
import { MLClient } from '../services/mlClient';

export const PredictionController = {
  async predict(req: Request, res: Response) {
    try {
      const { text, engagementValue = 0, experimentId } = req.body;
      if (!text || typeof text !== 'string' || text.trim() === '') {
        return res.status(400).json({ success: false, message: 'Text content is required' });
      }

      const mlResult = await MLClient.predictText({
        text: text.trim(),
        engagement_value: Number(engagementValue) || 0,
        experiment_id: experimentId
      });

      const predictionId = `pred_${uuidv4().slice(0, 8)}`;
      const predictionRecord = {
        id: predictionId,
        text: text.trim(),
        engagementValue: Number(engagementValue) || 0,
        predictedLabel: mlResult.prediction.label,
        labelName: mlResult.prediction.label_name || (mlResult.prediction.label === 1 ? 'Misinformation' : 'Verified'),
        confidence: mlResult.prediction.confidence || 0.85,
        probabilities: mlResult.prediction.probabilities || { real: 0.5, fake: 0.5 },
        riskLevel: mlResult.prediction.risk_level || 'Undetermined',
        sentiment: mlResult.sentiment,
        emotions: mlResult.emotions,
        modelUsed: mlResult.prediction.model_used,
        createdAt: new Date()
      };

      await StoreService.savePrediction(predictionRecord);

      res.json({
        success: true,
        prediction: predictionRecord
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async listPredictions(req: Request, res: Response) {
    try {
      const predictions = await StoreService.getAllPredictions();
      res.json({ success: true, predictions });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
