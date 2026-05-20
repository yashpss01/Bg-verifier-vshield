import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'vshield_super_secure_secret_token_key_123!';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token as string;
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Access denied. No token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      name: string;
    };
    
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token.',
    });
  }
};
