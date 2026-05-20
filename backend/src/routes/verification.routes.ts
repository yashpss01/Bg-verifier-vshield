import { Router } from 'express';
import {
  mockVerifyAadhaar,
  mockVerifyPAN,
  startVerification,
} from '../controllers/verification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Mock identity registry API endpoints (public)
router.post('/mock-api/aadhaar/verify', mockVerifyAadhaar);
router.post('/mock-api/pan/verify', mockVerifyPAN);

// Verification orchestration pipeline endpoint (protected)
router.post('/api/verifications/:id/start', authenticate as any, startVerification as any);

export default router;
