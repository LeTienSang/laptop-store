import { Response } from 'express';
import { IApiResponse, IErrorResponse } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): Response<IApiResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    error: null,
  });
};

export const sendError = (
  res: Response,
  message = 'Error',
  statusCode = 400,
  error: string | null = null
): Response<IErrorResponse> => {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};
