import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request to carry user payload
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; email: string };
    }
  }
}

interface JwtPayload {
  userId: string;
  email: string;
}

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  // Read from HttpOnly cookie — never Authorization header for this app
  const token = req.cookies?.accessToken;

  if (!token) {
    res.status(401).json({ error: 'Unauthorised — please log in' });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string
    ) as JwtPayload;

    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Session expired — please log in again' });
  }
};
