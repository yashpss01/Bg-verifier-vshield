import { Router } from 'express';
import { getReport } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/:id', authenticate as any, getReport as any);

export default router;
