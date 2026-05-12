import { NextFunction, Request, RequestHandler, Response } from 'express';

export const asyncHandler =
  <TReq extends Request = Request>(
    handler: (req: TReq, res: Response, next: NextFunction) => Promise<unknown> | unknown
  ): RequestHandler =>
  (req, res, next) => {
    void Promise.resolve(handler(req as TReq, res, next)).catch(next);
  };
