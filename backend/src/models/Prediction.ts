import mongoose, { Schema, Document } from 'mongoose';

export interface IPrediction extends Document {
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
  sentiment: {
    compound: number;
    pos: number;
    neg: number;
    neu: number;
  };
  emotions: Record<string, number>;
  modelUsed: string;
  createdAt: Date;
}

const PredictionSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  text: { type: String, required: true },
  engagementValue: { type: Number, default: 0 },
  predictedLabel: { type: Number, required: true },
  labelName: { type: String, required: true },
  confidence: { type: Number, required: true },
  probabilities: { type: Schema.Types.Mixed, required: true },
  riskLevel: { type: String, required: true },
  sentiment: { type: Schema.Types.Mixed, required: true },
  emotions: { type: Schema.Types.Mixed, required: true },
  modelUsed: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export const PredictionModel = mongoose.model<IPrediction>('Prediction', PredictionSchema);
