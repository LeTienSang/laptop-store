import { NextFunction, Request, Response } from 'express';
import { sendError } from '../utils/response';

export const notFound = (req: Request, res: Response): Response => {
  return sendError(res, `Route not found: ${req.originalUrl}`, 404);
};

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof Error) {
    const statusCode = typeof (err as { statusCode?: number }).statusCode === 'number'
      ? (err as { statusCode?: number }).statusCode!
      : 500;
    return sendError(res, err.message, statusCode);
  }

  return sendError(res, 'Internal Server Error', 500);
};
