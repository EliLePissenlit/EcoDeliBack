import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: User;
}

export type AsyncRequestHandler = (
  req: Request | AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
} 