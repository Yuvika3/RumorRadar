import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import csvParser from 'csv-parser';
import { v4 as uuidv4 } from 'uuid';
import { StoreService } from '../services/storeService';
import { MLClient } from '../services/mlClient';

const DATASETS_DIR = path.resolve(__dirname, '../../../datasets');

async function autoSeedDefaultDatasets() {
  const existing = await StoreService.getAllDatasets();
  if (existing.length > 0) return;

  const defaultDatasets = [
    {
      filename: 'fakenewsnet_politifact.csv',
      name: 'FakeNewsNet PolitiFact Benchmark',
      textColumn: 'title',
      labelColumn: 'label',
      engagementColumn: 'tweet_count',
      hasEngagement: true
    },
    {
      filename: 'fakenewsnet_politifact_no_engagement.csv',
      name: 'FakeNewsNet PolitiFact (Text-Only / No Engagement)',
      textColumn: 'title',
      labelColumn: 'label',
      engagementColumn: null,
      hasEngagement: false
    }
  ];

  for (const def of defaultDatasets) {
    const fullPath = path.join(DATASETS_DIR, def.filename);
    if (fs.existsSync(fullPath)) {
      try {
        let profile = null;
        try {
          profile = await MLClient.profileDataset(fullPath);
        } catch (e) {
          console.warn(`[AutoSeed] ML service not yet available to profile ${def.filename}:`, e);
        }

        const id = `ds_${uuidv4().slice(0, 8)}`;
        const record = {
          id,
          name: def.name,
          filename: def.filename,
          filepath: fullPath,
          totalRows: profile ? profile.total_rows : 1056,
          totalColumns: profile ? profile.total_columns : (def.hasEngagement ? 7 : 6),
          textColumn: def.textColumn,
          labelColumn: def.labelColumn,
          engagementColumn: def.engagementColumn,
          hasEngagement: def.hasEngagement,
          classDistribution: profile?.class_distribution || { '0': 624, '1': 432 },
          engagementStats: profile?.engagement_stats || null,
          columns: profile?.columns || [],
          createdAt: new Date()
        };
        await StoreService.saveDataset(record);
        console.log(`[AutoSeed] Seeded dataset: ${def.name}`);
      } catch (err) {
        console.error(`[AutoSeed] Error seeding dataset ${def.filename}:`, err);
      }
    }
  }
}

export const DatasetController = {
  async listDatasets(req: Request, res: Response) {
    try {
      await autoSeedDefaultDatasets();
      const datasets = await StoreService.getAllDatasets();
      res.json({ success: true, datasets });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getDatasetById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const dataset = await StoreService.getDatasetById(id);
      if (!dataset) {
        return res.status(404).json({ success: false, message: 'Dataset not found' });
      }
      res.json({ success: true, dataset });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async uploadDataset(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const filePath = req.file.path;
      const name = req.body.name || req.file.originalname.replace('.csv', '');
      const textColumn = req.body.textColumn || 'title';
      const labelColumn = req.body.labelColumn || 'label';
      const engagementColumn = req.body.engagementColumn || null;

      // Profile dataset with ML service
      let profile;
      try {
        profile = await MLClient.profileDataset(filePath);
      } catch (err: any) {
        return res.status(400).json({
          success: false,
          message: `Failed to profile dataset with ML service: ${err.message}`
        });
      }

      const hasEngagement = Boolean(
        engagementColumn && engagementColumn.trim() !== '' && profile.columns.some((c: any) => c.name === engagementColumn)
      );

      const id = `ds_${uuidv4().slice(0, 8)}`;
      const datasetRecord = {
        id,
        name,
        filename: req.file.originalname,
        filepath: filePath,
        totalRows: profile.total_rows,
        totalColumns: profile.total_columns,
        textColumn,
        labelColumn,
        engagementColumn: hasEngagement ? engagementColumn : null,
        hasEngagement,
        classDistribution: profile.class_distribution,
        engagementStats: profile.engagement_stats,
        columns: profile.columns,
        createdAt: new Date()
      };

      await StoreService.saveDataset(datasetRecord);

      res.status(201).json({
        success: true,
        message: 'Dataset uploaded and validated successfully',
        dataset: datasetRecord
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getDatasetRows(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const dataset = await StoreService.getDatasetById(id);
      if (!dataset) {
        return res.status(404).json({ success: false, message: 'Dataset not found' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = (req.query.search as string || '').toLowerCase().trim();
      const labelFilter = req.query.label as string;

      if (!fs.existsSync(dataset.filepath)) {
        return res.status(404).json({ success: false, message: 'Dataset file missing on disk' });
      }

      const rows: any[] = [];
      fs.createReadStream(dataset.filepath)
        .pipe(csvParser())
        .on('data', (row) => {
          let matchesSearch = true;
          let matchesLabel = true;

          if (search) {
            const textVal = String(row[dataset.textColumn] || '').toLowerCase();
            matchesSearch = textVal.includes(search);
          }

          if (labelFilter !== undefined && labelFilter !== '') {
            const rowLabel = String(row[dataset.labelColumn] || '');
            matchesLabel = rowLabel === labelFilter;
          }

          if (matchesSearch && matchesLabel) {
            rows.push(row);
          }
        })
        .on('end', () => {
          const totalMatching = rows.length;
          const startIndex = (page - 1) * limit;
          const paginatedRows = rows.slice(startIndex, startIndex + limit);

          res.json({
            success: true,
            totalRows: totalMatching,
            page,
            limit,
            totalPages: Math.ceil(totalMatching / limit),
            rows: paginatedRows
          });
        })
        .on('error', (err) => {
          res.status(500).json({ success: false, message: err.message });
        });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async deleteDataset(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await StoreService.deleteDataset(id);
      res.json({ success: true, message: 'Dataset deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
