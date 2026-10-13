import mongoose, { Schema, Document } from 'mongoose';

export interface IDataset extends Document {
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
  engagementStats?: Record<string, any> | null;
  columns: Array<{
    name: string;
    dtype: string;
    missing_count: number;
    missing_pct: number;
    unique_count: number;
  }>;
  createdAt: Date;
}

const DatasetSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  filename: { type: String, required: true },
  filepath: { type: String, required: true },
  totalRows: { type: Number, required: true },
  totalColumns: { type: Number, required: true },
  textColumn: { type: String, required: true, default: 'title' },
  labelColumn: { type: String, required: true, default: 'label' },
  engagementColumn: { type: String, default: null },
  hasEngagement: { type: Boolean, required: true, default: false },
  classDistribution: { type: Schema.Types.Mixed, default: {} },
  engagementStats: { type: Schema.Types.Mixed, default: null },
  columns: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now }
});

export const DatasetModel = mongoose.model<IDataset>('Dataset', DatasetSchema);
