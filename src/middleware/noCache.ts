import { Request, Response, NextFunction } from 'express';

// Apply to all routes returning financial data
// Prevents browsers and proxies from caching sensitive balance/transaction data
export const noCache = (_req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
};
