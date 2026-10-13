import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { DatasetController } from '../controllers/datasetController';

const router = Router();

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

router.get('/', DatasetController.listDatasets);
router.post('/upload', upload.single('file'), DatasetController.uploadDataset);
router.get('/:id', DatasetController.getDatasetById);
router.get('/:id/rows', DatasetController.getDatasetRows);
router.delete('/:id', DatasetController.deleteDataset);

export default router;
