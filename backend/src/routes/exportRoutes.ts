import { Router } from 'express';
import { ExportController } from '../controllers/exportController';

const router = Router();

router.get('/experiments.csv', ExportController.exportExperimentsCsv);
router.get('/report', ExportController.exportResearchReport);

export default router;
