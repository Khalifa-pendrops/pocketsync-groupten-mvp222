import { Request, Response, NextFunction } from 'express';
import LinkedAccount from '../models/LinkedAccount';

// Extends Request to carry the verified account
declare global {
  namespace Express {
    interface Request {
      linkedAccount?: InstanceType<typeof LinkedAccount>;
    }
  }
}

export const requireAccountOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { accountId } = req.params;

  const account = await LinkedAccount.findById(accountId);

  if (!account) {
    // Return 404 only if account genuinely doesn't exist
    res.status(404).json({ error: 'Account not found' });
    return;
  }

  // IDOR prevention — ownership check
  if (account.userId.toString() !== req.user!.userId) {
    // Return 403, NOT 404 — 404 would allow account ID enumeration
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  req.linkedAccount = account;
  next();
};
