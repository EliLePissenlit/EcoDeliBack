import axios from 'axios';
import { logger } from '../../utils/logger';

export class ReCaptchaService {
  private static readonly RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

  /**
   * Vérifie le token reCAPTCHA
   * @param token - Token reCAPTCHA à vérifier
   * @returns true si la vérification est réussie, false sinon
   */
  public static async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await axios.post(ReCaptchaService.RECAPTCHA_VERIFY_URL, null, {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token,
        },
      });

      return response.data.success;
    } catch (error) {
      logger.error('Error verifying reCAPTCHA token:', { error });
      throw error;
    }
  }
}
