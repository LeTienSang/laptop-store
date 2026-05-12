import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { IAuthedRequest, IAuthUser, IJwtPayload, UserRole } from '../types';
import { sendError } from '../utils/response';

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
};

export const authenticateToken = (req: IAuthedRequest, res: Response, next: NextFunction): Response | void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    return sendError(res, 'Unauthorized', 401);
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as IJwtPayload;
    req.user = {
      id: decoded.userId,
      name: '',
      email: '',
      role: decoded.role,
    } as IAuthUser;
    return next();
  } catch {
    return sendError(res, 'Invalid or expired token', 401);
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: IAuthedRequest, res: Response, next: NextFunction): Response | void => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Forbidden', 403);
    }

    return next();
  };
};

export const requireAdmin = requireRole('ADMIN');
export const requireCustomer = requireRole('CUSTOMER', 'ADMIN');
