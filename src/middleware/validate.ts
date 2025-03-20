import { Request, Response, NextFunction } from 'express';
import * as yup from 'yup';

export const validate = (schema: yup.Schema) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await schema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return res.status(400).json({ errors: error.errors });
    }
    next(error);
  }
}; 