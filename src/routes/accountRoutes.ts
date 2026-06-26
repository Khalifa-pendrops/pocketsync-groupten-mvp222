import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/requireAuth';
import { requireAccountOwnership } from '../middleware/requireOwnership';
import { noCache } from '../middleware/noCache';
import {
  getInstitutions,
  linkAccount,
  getAccounts,
  disconnectAccount,
} from '../controllers/accountController'; 

const router = Router();

// Rate limit for account linking: 5 per user per 10 minutes
const linkingLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.user?.userId || req.ip || 'unknown',
  message: { error: 'Too many linking attempts — please wait' },
});

// Institutions list — public, no auth needed
router.get('/institutions', getInstitutions);

// Protected account routes
router.post('/accounts/link', requireAuth, linkingLimiter, linkAccount);
router.get('/accounts', requireAuth, noCache, getAccounts);
router.delete(
  '/accounts/:accountId',
  requireAuth,
  requireAccountOwnership, // Verifies ownership before deletion
  disconnectAccount
);

export default router;
