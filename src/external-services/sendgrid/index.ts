import sgMail from '@sendgrid/mail';
import { logger } from '../../utils/logger';

export class SendGridService {
  private static readonly sendgrid: typeof sgMail = sgMail;

  constructor() {
    SendGridService.sendgrid.setApiKey(process.env.SENDGRID_API_KEY || '');
  }

  /**
   * Envoie un email via SendGrid
   * @param to - Email du destinataire
   * @param subject - Sujet de l'email
   * @param text - Contenu textuel de l'email
   * @param html - Contenu HTML de l'email (optionnel)
   */
  public static async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string
  ): Promise<void> {
    try {
      const msg = {
        to,
        from: process.env.SENDGRID_FROM_EMAIL || '',
        subject,
        text,
        html: html || text,
      };

      await SendGridService.sendgrid.send(msg);
    } catch (error) {
      logger.error('Error sending email via SendGrid:', { error });
      throw error;
    }
  }

  /**
   * Envoie un email de confirmation d'inscription
   * @param to - Email du destinataire
   * @param name - Nom du destinataire
   * @param confirmationLink - Lien de confirmation
   */
  public static async sendRegistrationConfirmation(
    to: string,
    name: string,
    confirmationLink: string
  ): Promise<void> {
    const subject = 'Confirmation de votre inscription';
    const text = `Bonjour ${name},\n\nMerci de confirmer votre inscription en cliquant sur le lien suivant : ${confirmationLink}`;
    const html = `
      <h1>Bonjour ${name},</h1>
      <p>Merci de confirmer votre inscription en cliquant sur le lien suivant :</p>
      <a href="${confirmationLink}">Confirmer mon inscription</a>
    `;

    await SendGridService.sendEmail(to, subject, text, html);
  }
}
