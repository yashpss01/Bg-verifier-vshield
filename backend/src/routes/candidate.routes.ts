import { Router } from 'express';
import {
  createCandidate,
  getCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
} from '../controllers/candidate.controller';
import { createCandidateSchema, updateCandidateSchema } from '../validations/candidate.validation';
import { authenticate } from '../middleware/auth';
import validate from '../middleware/validate';

const router = Router();

// Apply authenticate middleware to all candidate endpoints
router.use(authenticate as any);

router.post('/', validate(createCandidateSchema), createCandidate as any);
router.get('/', getCandidates as any);
router.get('/:id', getCandidateById as any);
router.put('/:id', validate(updateCandidateSchema), updateCandidate as any);
router.delete('/:id', deleteCandidate as any);

export default router;
