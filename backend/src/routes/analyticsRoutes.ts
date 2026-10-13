import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';

const router = Router();

router.get('/distributions', AnalyticsController.getDistributions);
router.get('/summary', AnalyticsController.getDashboardSummary);

export default router;
