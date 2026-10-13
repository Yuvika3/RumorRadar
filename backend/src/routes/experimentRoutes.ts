import { Router } from 'express';
import { ExperimentController } from '../controllers/experimentController';

const router = Router();

router.get('/', ExperimentController.listExperiments);
router.post('/', ExperimentController.createExperiment);
router.post('/ablation', ExperimentController.runAblationStudy);
router.get('/:id', ExperimentController.getExperimentById);
router.get('/:id/status', ExperimentController.pollExperimentStatus);

export default router;
