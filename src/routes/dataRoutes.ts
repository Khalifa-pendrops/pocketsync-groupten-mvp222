import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/requireAuth';
import { noCache } from '../middleware/noCache';
import {
  getTransactions,
  getTransactionById,
  updateCategory,
  transferMoney,
  interbankTransfer,
  payBill,
} from '../controllers/transactionController';
import {
  getDashboardSummary,
  getBalanceTrend,
} from '../controllers/dashboardController';

const router = Router();

// Rate limit for money movement: 10 per user per 10 minutes
const moneyMovementLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?.userId || req.ip || 'unknown',
  message: { error: 'Too many payment attempts — please wait' },
});

// Write routes — must be registered before /transactions/:transactionId
router.post('/transactions/transfer', requireAuth, moneyMovementLimiter, transferMoney);
router.post(
  '/transactions/interbank-transfer',
  requireAuth,
  moneyMovementLimiter,
  interbankTransfer,
);
router.post('/transactions/pay-bill', requireAuth, moneyMovementLimiter, payBill);

// Transaction routes — all protected + no-cache
router.get('/transactions', requireAuth, noCache, getTransactions);
router.get('/transactions/:transactionId', requireAuth, noCache, getTransactionById);
router.patch('/transactions/:transactionId/category', requireAuth, updateCategory);

// Dashboard routes — all protected + no-cache
router.get('/dashboard/summary', requireAuth, noCache, getDashboardSummary);
router.get('/dashboard/balance-trend', requireAuth, noCache, getBalanceTrend);

export default router;
