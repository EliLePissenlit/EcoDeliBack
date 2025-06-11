import { Request, Response, NextFunction } from 'express';
import { ReCaptchaService } from '../../external-services/recaptcha';
import { logger } from '../../utils/logger';

export const verifyRecaptcha = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // En développement, on ignore la vérification
    if (process.env.NODE_ENV === 'development') {
      return next();
    }

    const recaptchaToken = req.headers['recaptcha-token'] as string;

    if (!recaptchaToken) {
      return res.status(400).json({ message: 'Token reCAPTCHA manquant' });
    }

    const isValid = await ReCaptchaService.verifyToken(recaptchaToken);

    if (!isValid) {
      return res.status(400).json({ message: 'Vérification reCAPTCHA échouée' });
    }

    return next();
  } catch (error) {
    logger.error('Erreur lors de la vérification reCAPTCHA:', { error });
    return res.status(500).json({ message: 'Erreur lors de la vérification reCAPTCHA' });
  }
};
