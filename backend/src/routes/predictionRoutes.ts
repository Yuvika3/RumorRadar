import { Router } from 'express';
import { PredictionController } from '../controllers/predictionController';

const router = Router();

router.post('/', PredictionController.predict);
router.get('/', PredictionController.listPredictions);

export default router;
